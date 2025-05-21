/* global startNewChat, runPromptChain, debounceUpdateQuickAccessMenuItems, quickAccessMenu, addPromptChainCounterElement, isDescendant, isWindows, translate, generateSplitterChain, getCharCount, getWordCount, errorUpgradeConfirmation, dataURItoBlob, getConversation, replaceCitations, downloadFileFromUrl, toast, cachedSettings, debounce, createSwitch, updateAccountUserSetting */

// eslint-disable-next-line no-unused-vars
function initializeInput() {
  setTimeout(() => {
    addInputCounter();
    initializeHistory();
    addPromptChainCounterElement();
  }, 100);
}

function initializeHistory() {
  const textAreaElement = document.querySelector('#prompt-textarea');
  if (!textAreaElement) return;

  const originalQuickAccessMenu = document.querySelector('form [class*="absolute space-y-2 z-20"]');
  if (originalQuickAccessMenu) {
    originalQuickAccessMenu.classList.add('invisible', 'select-none', 'hidden');
  }
  chrome.storage.local.get(['userInputValueHistory'], (result) => {
    chrome.storage.local.set({
      userInputValueHistoryIndex: result.userInputValueHistory?.length || 0,
      unsavedUserInput: '',
      textInputValue: textAreaElement?.innerText?.trim() || '',
    });
  });
}
// eslint-disable-next-line no-unused-vars
async function addSubmitButtonEventListener() {
  document.body.addEventListener('click', async (event) => {
    const submitButton = document.querySelector('[data-testid*="send-button"]');
    if (!submitButton) return;
    if (!isDescendant(submitButton, event.target)) return;
    const textAreaElement = document.querySelector('#prompt-textarea');
    if (cachedSettings.autoSplit && cachedSettings.autoSplitLimit && textAreaElement?.innerText?.length > cachedSettings.autoSplitLimit) {
      event.preventDefault();
      event.stopPropagation();
      const chunks = await generateSplitterChain(textAreaElement.innerText);
      runPromptChain({ steps: chunks, mode: 'splitter' }, 0, false, true);
    } else {
      textAreaElement.innerHTML = convertToParagraphs(textAreaElement);
    }
  }, { capture: true });
}
// eslint-disable-next-line no-unused-vars
function addStopButtonEventListener() {
  document.body.addEventListener('click', (event) => {
    const stopButton = document.querySelector('[data-testid*="stop-button"]');
    if (!stopButton) return;
    if (!isDescendant(stopButton, event.target)) return;

    const stopConversationReceivedEvent = new CustomEvent('stopConversationReceived', {});
    window.dispatchEvent(stopConversationReceivedEvent);
  });
}

function addInputCounter() {
  // add input char/word counter
  const existingInputCounterElement = document.querySelector('#gptx-input-counter');
  if (existingInputCounterElement) existingInputCounterElement.remove();
  const inputCounterElement = document.createElement('span');
  inputCounterElement.id = 'gptx-input-counter';
  inputCounterElement.classList = 'text-token-text-tertiary select-none absolute text-xs z-100';
  inputCounterElement.style = 'bottom: -20px; right: 20px;';
  inputCounterElement.innerText = `0 ${translate('chars')} / 0 ${translate('words')}`;

  const inputForm = document.querySelector('main form');
  if (!inputForm) {
    return;
  }
  inputForm.classList.add('relative');
  inputForm.appendChild(inputCounterElement);
}
// eslint-disable-next-line no-unused-vars
const debounceAddMemoryToggleButtonsToInput = debounce(async () => {
  await addMemoryToggleButtonsToInput();
}, 300);
async function addMemoryToggleButtonsToInput() {
  const existingMemoryTogglesWrapper = document.querySelector('#memory-toggles-wrapper');
  if (existingMemoryTogglesWrapper) return;

  const inputForm = document.querySelector('main form');
  if (!inputForm) return;

  const inputActionWrapper = inputForm.querySelector('div[class*="[scrollbar-width:none]"]');
  if (!inputActionWrapper) return;

  const memoryTogglesWrapper = document.createElement('div');
  memoryTogglesWrapper.id = 'memory-toggles-wrapper';
  memoryTogglesWrapper.classList = 'ms-2 z-100 flex items-center gap-2 text-xs text-token-text-tertiary rounded-md p-1';
  inputActionWrapper.appendChild(memoryTogglesWrapper);

  const { openAIUserSettings } = await chrome.storage.local.get(['openAIUserSettings']);

  // ifopenAIUserSettings.settings has sunshine key
  const memoryToggleSwitch = createSwitch('Memory', '', '', openAIUserSettings.settings.sunshine, toggleMemorySwitch, [], false, true);
  memoryTogglesWrapper.appendChild(memoryToggleSwitch);

  const chatReferenceSwitch = createSwitch('Reference Chats', '', '', openAIUserSettings.settings.moonshine, toggleChatReferenceSwitch, [], false, true);
  memoryTogglesWrapper.appendChild(chatReferenceSwitch);

  if (!openAIUserSettings.settings.sunshine) {
    const chatReferenceToggleWrapper = document.querySelector('#sp-switch-wrapper-reference-chats');
    if (chatReferenceToggleWrapper) {
      chatReferenceToggleWrapper.style.opacity = 0;
    }
  }
}
async function toggleMemorySwitch(isChecked, event) {
  const chatReferenceToggleWrapper = document.querySelector('#sp-switch-wrapper-reference-chats');
  if (chatReferenceToggleWrapper) {
    chatReferenceToggleWrapper.style.opacity = isChecked ? 1 : 0;
  }
  if (event.isTrusted) { // check is trusted to skip trigger when user changes the setting from ChatGPT settings
    await updateAccountUserSetting('sunshine', isChecked);
    if (!isChecked) {
      const chatReferenceToggle = document.querySelector('main form input[id="switch-reference-chats"]');
      if (chatReferenceToggle) {
        chatReferenceToggle.checked = false;
        chatReferenceToggle.dispatchEvent(new Event('change', { bubbles: true }));
      }

      await updateAccountUserSetting('moonshine', false);
    }
  }
}
async function toggleChatReferenceSwitch(isChecked, event) {
  if (event.isTrusted) { // check is trusted to skip trigger when user changes the setting from ChatGPT settings
    if (isChecked) {
      const memoryToggle = document.querySelector('main form input[id="switch-memory"]');
      if (memoryToggle) {
        memoryToggle.checked = true;
        memoryToggle.dispatchEvent(new Event('change', { bubbles: true }));
      }
      await updateAccountUserSetting('sunshine', true);
    }
    await updateAccountUserSetting('moonshine', isChecked);
  }
}

// eslint-disable-next-line no-unused-vars
function updateInputCounter() {
  const textAreaElement = document.querySelector('#prompt-textarea');
  if (!textAreaElement) return;
  const text = textAreaElement.innerText;
  const curInputCounterElement = document.querySelector('#gptx-input-counter');
  if (curInputCounterElement) {
    // word count split by space or newline
    const wordCount = getWordCount(text);
    const charCount = getCharCount(text);
    curInputCounterElement.innerText = `${Math.max(charCount, 0)} ${translate('chars')} / ${Math.max(wordCount, 0)} ${translate('words')}`;
  }
}

// eslint-disable-next-line no-unused-vars
async function addPromptInputKeyDownEventListeners(event) {
  // text area element event listeners
  const textAreaElement = document.querySelector('#prompt-textarea');
  if (!textAreaElement) return;
  textAreaElement.style.height = 'auto';

  if (document.activeElement.id === 'prompt-textarea') {
    if (cachedSettings.submitPromptOnEnter || typeof cachedSettings.submitPromptOnEnter === 'undefined') {
      if (event.key === 'Enter' && event.which === 13 && !event.shiftKey) {
        const quickAccessMenu = document.querySelector('#quick-access-menu-wrapper');
        if (quickAccessMenu && quickAccessMenu.style.display !== 'none') {
          // click on the first button in the quick access menu with id^=quick-access-menu-item- and display block
          const firstItem = quickAccessMenu.querySelector('button[id^=quick-access-menu-item-]:not([style*="display: none"])');
          if (firstItem) {
            firstItem.click();
          }
        } else {
          if (cachedSettings.autoSplit && cachedSettings.autoSplitLimit && textAreaElement?.innerText?.length > cachedSettings.autoSplitLimit) {
            event.preventDefault();
            event.stopPropagation();
            const chunks = await generateSplitterChain(textAreaElement.innerText);
            runPromptChain({ steps: chunks, mode: 'splitter' }, 0, false, true);
          } else {
            textAreaElement.innerHTML = convertToParagraphs(textAreaElement);
          }
        }
        return;
      }
    } else {
      if (event.key === 'Enter' && !(event.metaKey || (isWindows() && event.ctrlKey)) && event.which === 13 && !event.shiftKey) {
        event.preventDefault();
        event.stopPropagation();
        const quickAccessMenu = document.querySelector('#quick-access-menu-wrapper');
        if (quickAccessMenu && quickAccessMenu.style.display !== 'none') {
          // click on the first button in the quick access menu with id^=quick-access-menu-item- and display block
          const firstItem = quickAccessMenu.querySelector('button[id^=quick-access-menu-item-]:not([style*="display: none"])');
          if (firstItem) {
            firstItem.click();
          }
        } else {
          // emit a shift + enter key event
          const shiftEnterEvent = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            shiftKey: true,
          });
          textAreaElement.dispatchEvent(shiftEnterEvent);
        }
        return;
      }

      if (event.key === 'Enter' && (event.metaKey || (isWindows() && event.ctrlKey)) && event.which === 13 && !event.shiftKey) {
        event.preventDefault();
        event.stopPropagation();
        if (cachedSettings.autoSplit && cachedSettings.autoSplitLimit && textAreaElement?.innerText?.length > cachedSettings.autoSplitLimit) {
          const chunks = await generateSplitterChain(textAreaElement.innerText);
          runPromptChain({ steps: chunks, mode: 'splitter' }, 0, false, true);
        } else {
          textAreaElement.innerHTML = convertToParagraphs(textAreaElement);
          const submitButton = document.querySelector('[data-testid*="send-button"]');
          if (submitButton) {
            submitButton.click();
            setTimeout(() => {
              textAreaElement.innerHTML = '';
            }, 100);
          }
        }
        return;
      }
    }
    // slash key
    // if (event.key === '/' && !event.shiftKey) {
    //   event.preventDefault();
    //   event.stopPropagation();
    //   // insert / at cursor position
    //   const cursorPosition = getSelectionPosition().start;
    //   const textValue = textAreaElement.innerText;
    //   textAreaElement.innerText = `${textValue.substring(0, cursorPosition)}${event.key}${textValue.substring(cursorPosition)}`;
    //   // set cursor to cursorPosition + 1
    //   setSelectionAtPosition(textAreaElement, cursorPosition + 1);
    //   return;
    // }
    // space key
    if (event.keyCode === 32) {
      const quickAccessMenuElement = document.querySelector('#quick-access-menu-wrapper');
      if (quickAccessMenuElement) {
        quickAccessMenuElement.remove();
      }
      const textAreaValue = textAreaElement.innerText;
      if (!textAreaValue?.trim()) return;
      // get the word before the cursor
      const cursorPosition = getSelectionPosition();
      if (!cursorPosition?.parentElement) return;

      const lastWord = cursorPosition.parentElement.innerText.substring(0, cursorPosition.start).split(' ').pop();

      if (lastWord?.startsWith('/') && lastWord.length > 1) {
        chrome.runtime.sendMessage({
          type: 'getPromptByTitle',
          detail: {
            title: lastWord.substring(1).toLowerCase(),
          },
        }, (prompt) => {
          if (prompt && prompt?.steps?.length > 0) {
            const previousSlashPosition = previousCharPosition(cursorPosition.parentElement, '/', cursorPosition.start);
            if (cursorPosition.start !== -1 && previousSlashPosition !== -1 && !getStringBetween(cursorPosition.parentElement, previousSlashPosition, cursorPosition.start).includes(' ')) {
              insertTextAtPosition(cursorPosition.parentElement, prompt.steps[0], previousSlashPosition, cursorPosition.end);
            }
          }
        });
      }
      return;
    }

    if (event.key === 'Backspace') {
      // backspace doesn't trigger selectionchange event
      const cursorPosition = getSelectionPosition();
      if (!cursorPosition?.parentElement) return;

      // $
      const previousAtPosition = -1; // textAreaElement.innerText.lastIndexOf('@', cursorPosition.start);
      const previousSlashPosition = previousCharPosition(cursorPosition.parentElement, '/', cursorPosition.start);
      const previousSpacePosition = previousCharPosition(cursorPosition.parentElement, ' ', cursorPosition.start - 1);

      const previousTriggerPosition = Math.max(previousAtPosition, previousSlashPosition);
      const previousTrigger = getCharAtPosition(cursorPosition.parentElement, previousTriggerPosition);
      const charBeforeTrigger = getCharAtPosition(cursorPosition.parentElement, previousTriggerPosition - 1);
      const triggerIsValid = !charBeforeTrigger || charBeforeTrigger === ' ' || charBeforeTrigger === '\n' || charBeforeTrigger === '.' || charBeforeTrigger === '?' || charBeforeTrigger === '!' || previousTriggerPosition === -1;

      if (previousTriggerPosition > -1 && triggerIsValid && previousTriggerPosition > -1 && cursorPosition.start - 1 > previousTriggerPosition && previousSpacePosition < previousTriggerPosition) {
        const quickAccessMenuElement = document.querySelector('#quick-access-menu-wrapper');
        if (!quickAccessMenuElement) {
          // get the word between the previous trigger and the cursor
          quickAccessMenu(previousTrigger);
        }
      } else {
        const quickAccessMenuElement = document.querySelector('#quick-access-menu-wrapper');
        if (quickAccessMenuElement) {
          quickAccessMenuElement.remove();
        }
      }
    }

    if (event.key === 'ArrowUp' && !event.shiftKey) {
      const quickAccessMenu = document.querySelector('#quick-access-menu-wrapper');
      if (quickAccessMenu && quickAccessMenu.style.display !== 'none') {
        event.preventDefault();
        return;
      }
      // check if cursor is at position 0
      const cursorPosition = getSelectionOffsetRelativeToParent(textAreaElement).start;

      if (cursorPosition !== 0) return;
      // if there is text in the field save that first
      chrome.storage.local.get(['userInputValueHistoryIndex', 'userInputValueHistory'], (result) => {
        if (cachedSettings && !cachedSettings.promptHistoryUpDownKey) return;
        const userInputValueHistory = result.userInputValueHistory || [];
        if (userInputValueHistory.length === 0) return;
        let userInputValueHistoryIndex = result.userInputValueHistoryIndex || 0;
        userInputValueHistoryIndex = Math.max(userInputValueHistoryIndex - 1, 0);
        const lastInputValue = userInputValueHistory[userInputValueHistoryIndex];

        chrome.storage.local.set({ userInputValueHistoryIndex }, () => {
          if (lastInputValue) {
            // textAreaElement.style.height = `${lastInputValue.inputValue.split('\\n').length * 24}px`;
            // replace multiple newlines with one
            textAreaElement.innerText = lastInputValue.inputValue.replace(/\n{3,}/g, '\n\n');
            // set cursor to end
            setSelectionAtEnd(textAreaElement);

            updateInputCounter();
            // textAreaElement.dispatchEvent(new Event('input', { bubbles: true }));
          }
        });
      });
      return;
    }
    if (event.key === 'ArrowDown' && !event.shiftKey) {
      const quickAccessMenu = document.querySelector('#quick-access-menu-wrapper');
      if (quickAccessMenu && quickAccessMenu.style.display !== 'none') {
        event.preventDefault();
        return;
      }
      // check if cursor is at position end
      const cursorPosition = getSelectionOffsetRelativeToParent(textAreaElement).start;

      if (cursorPosition !== textAreaElement.innerText.length) return;
      // if there is text in the field save that first
      chrome.storage.local.get(['userInputValueHistoryIndex', 'userInputValueHistory', 'unsavedUserInput'], (result) => {
        if (cachedSettings && !cachedSettings.promptHistoryUpDownKey) return;
        let userInputValueHistoryIndex = result.userInputValueHistoryIndex || 0;
        const userInputValueHistory = result.userInputValueHistory || [];
        if (userInputValueHistory.length === 0) return;
        userInputValueHistoryIndex = Math.min(userInputValueHistoryIndex + 1, userInputValueHistory.length);
        chrome.storage.local.set({ userInputValueHistoryIndex }, () => {
          const nextInputValue = userInputValueHistory[userInputValueHistoryIndex];
          if (nextInputValue) {
            // replace 3 or more newlines with 2
            textAreaElement.innerText = nextInputValue.inputValue.replace(/\n{3,}/g, '\n\n');
          } else if (userInputValueHistory[userInputValueHistory.length - 1].inputValue !== '') {
            const unsavedUserInput = result.unsavedUserInput || '';
            if (textAreaElement.innerText !== unsavedUserInput) {
              textAreaElement.innerText = unsavedUserInput.replace(/\n{3,}/g, '\n\n');
            }
          }
          updateInputCounter();
          // textAreaElement.dispatchEvent(new Event('input', { bubbles: true }));
        });
      });
    }
    // timeout to capture last entered/removed character
    // if key is not shift or alt  or ctrl or meta
    if (!event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey) {
      debounceUpdateQuickAccessMenuItems();
      // if (!addedSubmitListener) {
      //   addPromptInputSubmitEventListener();
      // }
    }
  } else {
    const quickAccessMenu = document.querySelector('#quick-access-menu-wrapper');
    if (quickAccessMenu && quickAccessMenu.style.display !== 'none') {
      if (cachedSettings.submitPromptOnEnter || typeof cachedSettings.submitPromptOnEnter === 'undefined') {
        if (event.key === 'Enter' && event.which === 13 && !event.shiftKey) {
          event.preventDefault();
          event.stopPropagation();
          if (document.activeElement.id.startsWith('quick-access-menu-item-')) {
            document.activeElement.click();
          }
        }
      } else {
        if (event.key === 'Enter' && (event.metaKey || (isWindows() && event.ctrlKey)) && event.which === 13 && !event.shiftKey) {
          event.preventDefault();
          event.stopPropagation();
          if (document.activeElement.id.startsWith('quick-access-menu-item-')) {
            document.activeElement.click();
          }
        }
      }
    }
  }
}
// function addPromptInputSubmitEventListener() {
//   addedSubmitListener = true;
//   const submitButton = document.querySelector('[data-testid*="send-button"]');
//   if (!submitButton) return;
//   submitButton.addEventListener('click', (e) => {
//     const textAreaElement = document.querySelector('#prompt-textarea');
//     if (!textAreaElement) return;
//     const textValue = textAreaElement.innerText;
//     if (textValue) {
//       addUserPromptToHistory(textValue);
//     }
//   });
// }
// eslint-disable-next-line no-unused-vars
function addPromptInputKeyUpEventListeners(event) {
  const textAreaElement = document.querySelector('#prompt-textarea');
  if (!textAreaElement) return;
  textAreaElement.style.height = 'auto';

  // if textareaelement is the active element
  if (document.activeElement.id === 'prompt-textarea') {
    const textValue = textAreaElement.innerText;
    updateInputCounter();

    chrome.storage.local.set({ textInputValue: textValue }, () => {
      chrome.storage.local.get(['userInputValueHistory'], (result) => {
        const userInputValueHistory = result.userInputValueHistory || [];
        // check if userInputValueHistory include event.target.value
        const existingInputValueIndex = userInputValueHistory.findIndex(
          (historyItem) => historyItem.inputValue === textValue,
        );
        if (existingInputValueIndex === -1) {
          chrome.storage.local.set({ unsavedUserInput: textValue });
        }
      });
    });
  }
}

// eslint-disable-next-line no-unused-vars
function addPromptInputPasteEventListener() {
  document.body.addEventListener('paste', () => {
    // if active element is not prompt-textarea, return
    if (document.activeElement.id !== 'prompt-textarea') return;
    // scroll to bottom of textarea
    const textAreaElement = document.querySelector('#prompt-textarea');
    if (!textAreaElement) return;
    // check if there is anything after cursor
    const cursorPosition = getSelectionPosition();
    if (!cursorPosition?.parentElement) return;

    const charAfterCursor = getCharAtPosition(cursorPosition.parentElement, cursorPosition.start + 1);
    if (charAfterCursor && charAfterCursor !== '\n') return;

    textAreaElement.parentElement.scrollTop = textAreaElement.parentElement.scrollHeight;
  });
}
// eslint-disable-next-line no-unused-vars
function addUserPromptToHistory(inputValue) {
  // Add new value to the value history
  if (!inputValue) return;
  // remove instructions
  inputValue = inputValue.replace(/^## Instructions[\s\S]*?## End Instructions\n\n/m, '');
  chrome.storage.local.get(['userInputValueHistory', 'selectedModel'], (result) => {
    const userInputValueHistory = result.userInputValueHistory || [];
    // if inputValue already exists in history, remove it first
    const existingInputValueIndex = userInputValueHistory.findIndex(
      (historyItem) => historyItem.inputValue.trim() === inputValue.trim(),
    );
    if (existingInputValueIndex !== -1) {
      userInputValueHistory.splice(existingInputValueIndex, 1);
    }
    userInputValueHistory.push({
      // eslint-disable-next-line no-restricted-globals
      id: self.crypto.randomUUID(),
      timestamp: Date.now(),
      inputValue: inputValue.trim(),
    });
    let newHistory = userInputValueHistory;
    // if nonfavorite history length is more than 200, remove anythign older than 200
    if (userInputValueHistory.length > 200) {
      const sortedUserInputValueHistory = userInputValueHistory.sort((a, b) => a.timestamp - b.timestamp);
      const itemsToDelete = sortedUserInputValueHistory.length - 200;
      sortedUserInputValueHistory.splice(0, itemsToDelete);
      newHistory = userInputValueHistory.filter((item) => sortedUserInputValueHistory.includes(item));
    }
    chrome.storage.local.set({ userInputValueHistory: newHistory }, () => {
      chrome.storage.local.set({ userInputValueHistoryIndex: userInputValueHistory.length });
    });
  });
}
function convertToParagraphs(textAreaElement) {
  const { innerHTML, innerText } = textAreaElement;
  if (!innerText) return innerHTML;
  // Replace <br> or <br/> tags with a closing </p> and an opening <p>
  let converted = innerHTML.replace(/<br\s*\/?>/g, '</p><p>');

  // Remove the ProseMirror-trailingBreak class
  converted = converted.replace(/<br class="ProseMirror-trailingBreak">/g, '');

  // Ensure the string starts and ends with <p> tags
  if (!converted.startsWith('<p>')) {
    converted = `<p>${converted}`;
  }
  if (!converted.endsWith('</p>')) {
    converted += '</p>';
  }

  return converted;
}
// Selection helper functions

// Function to get the current selection position within a parent P tag
// eslint-disable-next-line no-unused-vars
function getSelectionPosition() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return null;

  const range = selection.getRangeAt(0);
  let parentParagraph = range.startContainer;

  // Ensure that we have an element node
  if (parentParagraph.nodeType === Node.TEXT_NODE) {
    parentParagraph = parentParagraph.parentElement;
  }

  if (parentParagraph && parentParagraph.tagName === 'P') {
    let startOffset = 0;
    let foundStart = false;

    // Traverse child nodes to calculate the startOffset, counting new lines as 1
    parentParagraph.childNodes.forEach((node) => {
      if (node === range.startContainer) {
        foundStart = true;
        if (node.nodeType === Node.TEXT_NODE) {
          startOffset += range.startOffset;
        } else if (node.nodeName === 'BR') {
          startOffset += 1;
        }
      } else if (!foundStart) {
        if (node.nodeType === Node.TEXT_NODE) {
          startOffset += node.textContent.length;
        } else if (node.nodeName === 'BR') {
          startOffset += 1; // Count <br> as 1
        }
      }
    });

    const endOffset = startOffset + range.toString().length;

    return {
      start: startOffset,
      end: endOffset,
      parentElement: parentParagraph,
    };
  }

  return null;
}

// Function to insert text at the specified position in a given P element
// eslint-disable-next-line no-unused-vars
function insertTextAtPosition(pElement, text, start, end) {
  if (!pElement || typeof start !== 'number' || typeof end !== 'number') {
    console.error('Invalid parameters');
    return;
  }

  const originalText = pElement.innerText;
  const beforeText = originalText.slice(0, start);
  const afterText = originalText.slice(end);

  // Update the P element's innerText with the new text inserted
  pElement.innerText = beforeText + text + afterText;

  // Place the cursor at the end of the last line
  const range = document.createRange();
  const selection = window.getSelection();
  const { lastChild } = pElement;

  if (lastChild && lastChild.nodeType === Node.TEXT_NODE) {
    range.setStart(lastChild, lastChild.length);
  } else if (lastChild) {
    range.setStart(lastChild, lastChild.childNodes.length);
  } else {
    range.setStart(pElement, pElement.childNodes.length);
  }

  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

function getSelectionOffsetRelativeToParent(parentNode) {
  // Get the current selection
  const selection = window.getSelection();

  if (selection.rangeCount === 0) {
    return { start: null, end: null }; // No selection made
  }

  // Get the range of the current selection
  const range = selection.getRangeAt(0);

  // Get the selected node's parent
  let commonAncestor = range.commonAncestorContainer;

  // Traverse up the DOM tree to ensure the selection is within the parentNode
  while (commonAncestor && commonAncestor !== parentNode) {
    commonAncestor = commonAncestor.parentNode;
  }

  if (!commonAncestor) {
    return { start: null, end: null }; // The selection is outside the parent node
  }

  // Calculate offset relative to parentNode or last character if not found
  const offsetStart = getOffsetWithBreaksAndTabs(range.startContainer, range.startOffset, parentNode);
  const offsetEnd = getOffsetWithBreaksAndTabs(range.endContainer, range.endOffset, parentNode);
  const offsetNode = range.startContainer;
  return { start: offsetStart, end: offsetEnd, node: offsetNode };
}

// Helper function to calculate offset of a node relative to parent node with breaks and tabs accounted for
function getOffsetWithBreaksAndTabs(node, offsetInNode, parentNode) {
  let offset = 0;

  // Traverse nodes before the selection to sum up the lengths
  while (node && node !== parentNode) {
    if (node.previousSibling) {
      node = node.previousSibling;
      offset += countNodeLengthWithBreaksAndTabs(node);
    } else {
      node = node.parentNode;
    }
  }

  // Add the current node's offset within its text
  return offset + offsetInNode;
}

// Helper function to count the length of the node, including handling for <br> and tabs/newlines
function countNodeLengthWithBreaksAndTabs(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    // Replace tabs and newlines with one character and return text length
    return node.textContent.replace(/\t/g, ' ').replace(/\n/g, ' ').length;
  } if (node.nodeName === 'BR') {
    // Count <br> as a newline character
    return 1;
  } if (['P', 'DIV', 'BLOCKQUOTE'].includes(node.nodeName)) {
    // Treat block-level elements as having a newline at the end
    let length = 0;
    node.childNodes.forEach((child) => {
      length += countNodeLengthWithBreaksAndTabs(child);
    });
    return length + 1; // +1 for the implicit newline after the block-level element
  } if (node.childNodes) {
    // Recursively count child nodes
    let length = 0;
    node.childNodes.forEach((child) => {
      length += countNodeLengthWithBreaksAndTabs(child);
    });
    return length;
  }
  return 0;
}

function setSelectionAtEnd(parentNode) {
  // Check if the parent node has child nodes
  if (!parentNode || !parentNode.hasChildNodes()) {
    return;
  }

  // Get the current selection
  const selection = window.getSelection();

  // Clear any previous selection
  selection.removeAllRanges();

  // Create a new range
  const range = document.createRange();

  // Get the last child of the parent node
  let { lastChild } = parentNode;

  // Traverse down to the deepest last child if needed
  while (lastChild && lastChild.nodeType === Node.ELEMENT_NODE && lastChild.hasChildNodes()) {
    lastChild = lastChild.lastChild;
  }

  if (lastChild.nodeType === Node.TEXT_NODE) {
    // If the last child is a text node, set the range at the end of the text
    range.setStart(lastChild, lastChild.length);
    range.setEnd(lastChild, lastChild.length);
  } else {
    // If no text node is found, set the range at the end of the parent element
    range.setStart(lastChild, 0);
    range.setEnd(lastChild, 0);
  }

  // Apply the range to the selection
  selection.addRange(range);
}

// eslint-disable-next-line no-unused-vars
function setSelectionAtPosition(parentNode, position) {
  // Ensure the parent node exists and has child nodes
  if (!parentNode || !parentNode.hasChildNodes()) {
    return;
  }

  let currentOffset = 0;
  let foundPosition = false;

  // Get the current selection and clear any existing ranges
  const selection = window.getSelection();
  selection.removeAllRanges();

  // Create a new range
  const range = document.createRange();

  // Helper function to recursively traverse nodes
  function traverseNodes(node) {
    if (foundPosition) {
      return;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const nodeText = node.textContent;
      const nodeLength = nodeText.length;

      // Check if the position falls within the current text node
      if (currentOffset + nodeLength >= position) {
        const offsetInNode = position - currentOffset;
        range.setStart(node, offsetInNode);
        range.setEnd(node, offsetInNode);
        foundPosition = true;
        return;
      }

      // Update the current offset after traversing this node
      currentOffset += nodeLength;
    } else if (node.nodeName === 'BR') {
      // Handle <br> as a newline character
      currentOffset += 1;
      if (currentOffset >= position) {
        foundPosition = true;
        range.setStartAfter(node); // Move the cursor after <br>
        range.setEndAfter(node);
      }
    } else if (['P', 'DIV', 'BLOCKQUOTE'].includes(node.nodeName)) {
      // Traverse block-level elements and treat the end as a newline
      node.childNodes.forEach(traverseNodes);

      // After processing children, treat the end of the block as a newline
      currentOffset += 1;
      if (currentOffset >= position && !foundPosition) {
        range.setStartAfter(node); // Move the cursor after the block element
        range.setEndAfter(node);
        foundPosition = true;
      }
    } else if (node.childNodes) {
      // Recursively traverse child nodes
      node.childNodes.forEach(traverseNodes);
    }
  }

  // Start traversing from the parentNode
  traverseNodes(parentNode);

  // If a valid position was found, apply the range
  if (foundPosition) {
    selection.addRange(range);
  } else {
    console.error('Position exceeds the content length.');
  }
}

function previousCharPosition(parentElement, char = '/', curPosition = 0) {
  if (!parentElement || !parentElement.hasChildNodes()) {
    return -1; // Return -1 if no valid parentElement is provided
  }

  let currentOffset = 0;
  let lastPosition = -1;

  // Recursively traverse the child nodes to accumulate text content
  function traverseNodes(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const nodeText = node.textContent;

      // Check if the position falls within the current node
      if (currentOffset + nodeText.length >= curPosition) {
        // Limit search to text before curPosition
        const searchText = nodeText.substring(0, curPosition - currentOffset);
        const pos = searchText.lastIndexOf(char);

        if (pos !== -1) {
          lastPosition = currentOffset + pos;
        }
      }

      // Update the currentOffset as we process each text node
      currentOffset += nodeText.length;
    } else if (node.nodeName === 'BR') {
      // Handle <br> as a newline character
      currentOffset += 1; // Each <br> counts as a single newline
    } else if (node.nodeName === 'P' || node.nodeName === 'DIV' || node.nodeName === 'BLOCKQUOTE') {
      // Handle block-level elements as newlines between paragraphs
      node.childNodes.forEach(traverseNodes);
      currentOffset += 1; // Treat the end of a block-level element as a newline
    } else {
      // Recursively traverse child nodes if the node is not a text node or <br>
      node.childNodes.forEach(traverseNodes);
    }
  }

  // Start traversing from the parentElement
  traverseNodes(parentElement);

  return lastPosition; // Return the position of the last occurrence of char
}
// eslint-disable-next-line no-unused-vars
function nextCharPosition(textAreaElement, char = ' ', cursorPosition = 0) {
  if (!textAreaElement || !textAreaElement.hasChildNodes()) {
    return -1; // Return -1 if the element is invalid or empty
  }

  let currentOffset = 0;
  let nextPosition = -1;

  // Helper function to recursively traverse nodes
  function traverseNodes(node) {
    if (nextPosition !== -1) {
      return; // Stop once we've found the next character
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const nodeText = node.textContent;
      const nodeLength = nodeText.length;

      // Only search in the text node if it's after the cursorPosition
      if (currentOffset + nodeLength > cursorPosition) {
        const start = Math.max(0, cursorPosition - currentOffset);
        const pos = nodeText.indexOf(char, start);
        if (pos !== -1) {
          nextPosition = currentOffset + pos;
          return;
        }
      }

      // Update the current offset after this text node
      currentOffset += nodeLength;
    } else if (node.nodeName === 'BR') {
      // Treat <br> as a newline character
      if (currentOffset >= cursorPosition) {
        if (char === '\n') {
          nextPosition = currentOffset; // Match newline at this position
          return;
        }
      }
      currentOffset += 1;
    } else if (['P', 'DIV', 'BLOCKQUOTE'].includes(node.nodeName)) {
      // Traverse block-level elements and treat the end as a newline
      node.childNodes.forEach(traverseNodes);

      // After processing children, treat the end of the block as a newline
      if (currentOffset >= cursorPosition) {
        if (char === '\n' && nextPosition === -1) {
          nextPosition = currentOffset;
        }
      }
      currentOffset += 1;
    } else if (node.childNodes) {
      // Recursively traverse child nodes
      node.childNodes.forEach(traverseNodes);
    }
  }

  // Start traversing from the textAreaElement
  traverseNodes(textAreaElement);

  return nextPosition;
}
function getCharAtPosition(parentElement, position) {
  // Ensure the parent node exists and has child nodes
  if (!parentElement || !parentElement.hasChildNodes()) {
    return null; // Return null if no valid parentElement is provided
  }

  let currentOffset = 0;
  let charAtPosition = null;

  // Helper function to recursively traverse nodes
  function traverseNodes(node) {
    if (charAtPosition !== null) {
      return; // Stop once we've found the character
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const nodeText = node.textContent;
      const nodeLength = nodeText.length;

      // Check if the position falls within the current text node
      if (currentOffset + nodeLength > position) {
        const offsetInNode = position - currentOffset;
        charAtPosition = nodeText[offsetInNode];
        return;
      }

      // Update the current offset after traversing this node
      currentOffset += nodeLength;
    } else if (node.nodeName === 'BR') {
      // Handle <br> as a newline character
      if (currentOffset === position) {
        charAtPosition = '\n';
        return;
      }
      currentOffset += 1;
    } else if (['P', 'DIV', 'BLOCKQUOTE'].includes(node.nodeName)) {
      // Traverse block-level elements and treat the end as a newline
      node.childNodes.forEach(traverseNodes);

      // After processing children, treat the end of the block as a newline
      if (currentOffset === position && charAtPosition === null) {
        charAtPosition = '\n'; // Implicit newline at the end of block elements
        return;
      }
      currentOffset += 1;
    } else if (node.childNodes) {
      // Recursively traverse child nodes
      node.childNodes.forEach(traverseNodes);
    }
  }

  // Start traversing from the parentElement
  traverseNodes(parentElement);

  return charAtPosition; // Return the character at the specified position
}
// eslint-disable-next-line no-unused-vars
function getStringBetween(parentElement, startPos, endPos) {
  if (!parentElement || !parentElement.hasChildNodes()) {
    return ''; // Return an empty string if no valid parentElement is provided
  }

  let currentOffset = 0;
  let resultString = '';
  // eslint-disable-next-line no-unused-vars
  let collecting = false;

  // Helper function to recursively traverse nodes
  function traverseNodes(node) {
    if (currentOffset >= endPos) {
      return; // Stop once we've collected up to endPos
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const nodeText = node.textContent;
      const nodeLength = nodeText.length;

      // Check if the current node contains part of the desired range
      if (currentOffset + nodeLength > startPos && currentOffset < endPos) {
        const start = Math.max(0, startPos - currentOffset);
        const end = Math.min(nodeLength, endPos - currentOffset);
        resultString += nodeText.substring(start, end);
        collecting = true;
      }

      // Update the current offset after processing this node
      currentOffset += nodeLength;
    } else if (node.nodeName === 'BR') {
      // Handle <br> as a newline character
      if (currentOffset >= startPos && currentOffset < endPos) {
        resultString += '\n';
        collecting = true;
      }
      currentOffset += 1;
    } else if (['P', 'DIV', 'BLOCKQUOTE'].includes(node.nodeName)) {
      // Traverse block-level elements and treat the end as a newline
      node.childNodes.forEach(traverseNodes);

      // After processing children, treat the end of the block as a newline
      if (currentOffset >= startPos && currentOffset < endPos) {
        resultString += '\n'; // Implicit newline at the end of block elements
        collecting = true;
      }
      currentOffset += 1;
    } else if (node.childNodes) {
      // Recursively traverse child nodes
      node.childNodes.forEach(traverseNodes);
    }
  }

  // Start traversing from the parentElement
  traverseNodes(parentElement);

  return resultString;
}
// ------------------------------------
function canAttacheFile(_fileName) {
  const textAreaElement = document.querySelector('#prompt-textarea');
  if (!textAreaElement) {
    toast('Start a new conversation or go to an existing conversation', 'error');
    return false;
  }
  const fileInput = document.querySelector('main form input[type="file"]');
  if (!fileInput) {
    toast('Attachments disabled for this model', 'error');
    return false;
  }
  const inputForm = document.querySelector('main form');
  // if (inputForm.innerText.includes(fileName.toLowerCase())) return false;
  if (inputForm.querySelectorAll('div[class*="fit"] div[class*="group relative inline-block"]').length >= 10) {
    toast('You can only attach up to 10 files', 'error');
    return false;
  }
  // <button aria-disabled="true" class="flex items-center justify-center h-9 w-9 rounded-full border border-token-border-medium text-token-text-tertiary opacity-50" disabled=""><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="" class="h-[18px] w-[18px]"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 3C12.5523 3 13 3.44772 13 4L13 11H20C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13L13 13L13 20C13 20.5523 12.5523 21 12 21C11.4477 21 11 20.5523 11 20L11 13L4 13C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11L11 11L11 4C11 3.44772 11.4477 3 12 3Z" fill="currentColor"></path></svg></button>
  // find the attach button by matching the path in it and see if it is disabled
  const attachButton = document.querySelector('main form button > svg > path[d="M12 3C12.5523 3 13 3.44772 13 4L13 11H20C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13L13 13L13 20C13 20.5523 12.5523 21 12 21C11.4477 21 11 20.5523 11 20L11 13L4 13C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11L11 11L11 4C11 3.44772 11.4477 3 12 3Z"][fill="currentColor"]');
  if (attachButton?.closest('button')?.disabled) {
    toast('Attachments disabled for this model', 'error');
    return false;
  }
  return true;
}
// eslint-disable-next-line no-unused-vars
function canSubmit() {
  const submitButton = document.querySelector('[data-testid*="send-button"]');
  const speechButton = document.querySelector('[data-testid*="speech-button"]');

  if (submitButton) return true;
  if (speechButton && !speechButton.disabled) return true;

  return false;
}

// eslint-disable-next-line no-unused-vars
async function attachImagesToInput(images) {
  const fileInput = document.querySelector('main form input[type="file"]');
  const dataTransfer = new DataTransfer();
  // eslint-disable-next-line no-restricted-syntax
  for (const image of images) {
    // eslint-disable-next-line no-await-in-loop
    const blob = await downloadFileFromUrl(image.imageUrl, image.imageId, true);
    const file = new File([blob], `${image.imageId}.png`, { type: 'image/png' });
    dataTransfer.items.add(file);
  }
  fileInput.files = dataTransfer.files;
  fileInput.dispatchEvent(new Event('change', { bubbles: true }));
}
function attachImageBlobToInput(imageBlob, fileName = 'screenshot.png') {
  if (!canAttacheFile(fileName)) return;
  const fileInput = document.querySelector('main form input[type="file"]');
  const file = new File([imageBlob], fileName.toLowerCase(), { type: 'image/png' });
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  fileInput.files = dataTransfer.files;
  fileInput.dispatchEvent(new Event('change', { bubbles: true }));
}
// eslint-disable-next-line no-unused-vars
async function attachConversationToInput(conversationId) {
  const conversation = await getConversation(conversationId);
  const conversationTitle = conversation.title.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `${conversationTitle}.txt`;
  if (!canAttacheFile(fileName)) return;

  let currentNode = conversation.current_node;

  const messages = [];
  while (currentNode) {
    const { message, parent } = conversation.mapping[currentNode];
    if (message) messages.push(message);
    currentNode = parent;
  }
  const conversationText = messages.reverse().filter((m) => {
    const role = m?.author?.role;
    const content = m?.content?.parts?.join('');
    const contentType = m?.content?.content_type;
    return content && contentType !== 'user_editable_context' && (role === 'user' || role === 'assistant');
  }).map((m) => `>> ${m.author?.role.toUpperCase()}: ${replaceCitations((m.content?.parts || [])?.filter((p) => typeof p === 'string')?.join('\n').replace(/^## Instructions[\s\S]*?## End Instructions\n\n/m, ''), m.metadata.citations, 'text')}`)?.join('\n\n');
  uploadTextToInput(conversationText, fileName);
}
function uploadTextToInput(text, fileName = 'conversation.txt') {
  if (!canAttacheFile(fileName)) return;
  const fileInput = document.querySelector('main form input[type="file"]');
  // create a .txt file
  const blob = new Blob([text], { type: 'text/plain' });
  const file = new File([blob], fileName.toLowerCase(), { type: 'text/plain' });
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  fileInput.files = dataTransfer.files;
  fileInput.dispatchEvent(new Event('change', { bubbles: true }));
}
async function checkProStatus() {
  const hasSubscription = await chrome.runtime.sendMessage({
    type: 'checkHasSubscription',
  });
  if (!hasSubscription) {
    const error = { type: 'Pro', title: 'This is a Pro feature', message: 'Sending text and screenshots to ChatGPT using the right click menu requires a Pro subscription. Upgrade to Pro to remove all limits.' };
    errorUpgradeConfirmation(error);
  }
  return hasSubscription;
}
// eslint-disable-next-line no-unused-vars
function addRighClickInsertEventListener() {
  chrome.runtime.onMessage.addListener(async (request, _sender, _sendResponse) => {
    if (request.action === 'insertPrompt') {
      const hasSubscription = await checkProStatus();
      if (!hasSubscription) return;
      const { pathname } = new URL(window.location.toString());
      if (request.newChat && pathname !== '/') {
        startNewChat();
      }
      setTimeout(() => {
        const textAreaElement = document.querySelector('#prompt-textarea');
        if (!textAreaElement) return;
        const newPrompt = request.prompt;
        newPrompt.steps[0] = `${request.selectionText}\n${newPrompt.steps[0]}`;
        runPromptChain(newPrompt);
      }, 500);
    } else if (request.action === 'insertScreenshot') {
      const hasSubscription = await checkProStatus();
      if (!hasSubscription) return;
      const imageBlob = dataURItoBlob(request.screenshot);
      attachImageBlobToInput(imageBlob);
    } else if (request.action === 'insertImage') {
      const hasSubscription = await checkProStatus();
      if (!hasSubscription) return;
      // get image from imageUrl
      const imageName = request.imageUrl.split('/').pop();
      const imageBlob = await downloadFileFromUrl(request.imageUrl, imageName, true);
      attachImageBlobToInput(imageBlob);
    }
  });
}
