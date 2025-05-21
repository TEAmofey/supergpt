// eslint-disable-next-line no-unused-vars
/* global isWindows, closeMenus, rowAssistant, rowUser, copyRichText, saveConversationAsPDF, createFullSizeFileWrapper, addFullSizeFileWrapperEventListener, getMousePosition, renderAllDalleImages, getGizmoById, addFinalCompletionClassToLastMessageWrapper, highlightSearch, renderAllPythonImages, renderAllPluginVisualizations, getDownloadUrlFromFileId, getDownloadUrlFromSandBoxPath, toast, loadingSpinner, downloadFileFromUrl, stopAllAudios, getCitationAttributions, replaceCitations, animatePing, errorUpgradeConfirmation, sidebarNoteIsOpen, getConversation, getConversationIdFromUrl, lastSelectedConversationCardId:true, lastSelectedPinnedMessageCardId:true, translate, isDarkMode, buttonGenerator, cachedSettings */

// eslint-disable-next-line no-unused-vars
async function showConversationPreviewWrapper(conversationId, messageId = null, sidebarFolder = false, hideArrows = false) {
  // preview in the center of the screen 90% height, 50% width min width 600px. make it centered and scrollable
  const previewWrapperBackground = document.createElement('div');
  previewWrapperBackground.id = 'conversation-preview-wrapper-background';
  previewWrapperBackground.classList = 'bg-black/50 dark:bg-black/80 fixed inset-0';
  previewWrapperBackground.style = 'z-index: 100000;';
  previewWrapperBackground.addEventListener('click', () => {
    previewWrapperBackground.remove();
  });
  document.body.appendChild(previewWrapperBackground);

  const previewWrapper = document.createElement('div');
  previewWrapper.id = 'conversation-preview-wrapper';
  previewWrapper.classList = 'flex flex-col items-center justify-center bg-token-main-surface-primary bg-opacity-90 rounded-xl border border-token-border-medium z-50 shadow-lg';
  // make it centered and scrollable
  previewWrapper.style = 'min-width: 800px; min-height: 90vh; width: 50%; height: 90%; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);';
  previewWrapperBackground.appendChild(previewWrapper);
  // add a next/prevoius button on both sides of the preview wrapper
  if (!hideArrows) {
    const nextButton = document.createElement('button');
    nextButton.id = 'preview-conversation-next-button';
    nextButton.classList = 'absolute top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-token-main-surface-secondary text-token-text-primary focus-visible:outline-0 hover:bg-token-sidebar-surface-secondary focus-visible:bg-token-sidebar-surface-secondary border border-token-border-medium';
    nextButton.style = 'right: -20px;';
    nextButton.innerHTML = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md-heavy"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.29289 18.7071C8.90237 18.3166 8.90237 17.6834 9.29289 17.2929L14.5858 12L9.29289 6.70711C8.90237 6.31658 8.90237 5.68342 9.29289 5.29289C9.68342 4.90237 10.3166 4.90237 10.7071 5.29289L16.7071 11.2929C16.8946 11.4804 17 11.7348 17 12C17 12.2652 16.8946 12.5196 16.7071 12.7071L10.7071 18.7071C10.3166 19.0976 9.68342 19.0976 9.29289 18.7071Z" fill="currentColor"></path></svg>';
    previewWrapper.appendChild(nextButton);

    const previousButton = document.createElement('button');
    previousButton.id = 'preview-conversation-previous-button';
    previousButton.classList = 'absolute top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-token-main-surface-secondary text-token-text-primary focus-visible:outline-0 hover:bg-token-sidebar-surface-secondary focus-visible:bg-token-sidebar-surface-secondary border border-token-border-medium';
    previousButton.style = 'left: -20px;';
    previousButton.innerHTML = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md-heavy"><path fill-rule="evenodd" clip-rule="evenodd" d="M14.7071 5.29289C15.0976 5.68342 15.0976 6.31658 14.7071 6.70711L9.41421 12L14.7071 17.2929C15.0976 17.6834 15.0976 18.3166 14.7071 18.7071C14.3166 19.0976 13.6834 19.0976 13.2929 18.7071L7.29289 12.7071C7.10536 12.5196 7 12.2652 7 12C7 11.7348 7.10536 11.4804 7.29289 11.2929L13.2929 5.29289C13.6834 4.90237 14.3166 4.90237 14.7071 5.29289Z" fill="currentColor"></path></svg>';
    previewWrapper.appendChild(previousButton);
  }
  const previewWrapperHeader = document.createElement('div');
  previewWrapperHeader.classList = 'flex items-center justify-between w-full bg-token-main-surface-secondary p-4 rounded-t-xl border-b border-token-border-medium';
  previewWrapper.appendChild(previewWrapperHeader);

  const previewWrapperTitle = document.createElement('div');
  previewWrapperTitle.classList = 'text-lg font-bold';
  previewWrapperTitle.id = 'conversation-preview-title';

  previewWrapperHeader.appendChild(previewWrapperTitle);

  const rightHeader = document.createElement('div');
  rightHeader.classList = 'flex items-center gap-2';
  previewWrapperHeader.appendChild(rightHeader);
  // open the conversation in a new tab
  const openConversationButton = document.createElement('button');
  openConversationButton.id = 'preview-open-conversation-button';
  openConversationButton.classList = 'flex relative p-2 text-xs rounded-md bg-token-main-surface-secondary text-token-link focus-visible:outline-0 hover:bg-token-sidebar-surface-secondary focus-visible:bg-token-sidebar-surface-secondary';
  openConversationButton.style.width = 'max-content';
  openConversationButton.title = `${isWindows() ? 'Ctrl' : '⌘'} + Click to open in new tab`;
  openConversationButton.innerHTML = `${translate('open conversation')}`;

  rightHeader.appendChild(openConversationButton);

  const closePreviewButton = document.createElement('button');
  closePreviewButton.id = 'conversation-preview-close-button';
  closePreviewButton.classList = 'p-2 rounded-full bg-token-main-surface-secondary text-token-text-primary focus-visible:outline-0 hover:bg-token-sidebar-surface-secondary focus-visible:bg-token-sidebar-surface-secondary';
  closePreviewButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6"><path d="M6 18L18 6M6 6l12 12"></path></svg>';
  closePreviewButton.addEventListener('click', () => {
    previewWrapper.remove();
  });
  rightHeader.appendChild(closePreviewButton);

  const innerDiv = document.createElement('div');
  innerDiv.classList = 'h-full w-full overflow-y-auto p-4';
  // smooth scrolling
  innerDiv.style = 'scroll-behavior: smooth;';
  innerDiv.id = 'conversation-inner-div';
  // disble clicks on the inner div to close the preview
  innerDiv.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenus();
  });
  // listen to scroll event and show the scroll to bottom button if not at the bottom
  innerDiv.addEventListener('scroll', () => {
    const scrollToBottomButton = document.querySelector('#conversation-preview-wrapper #scroll-to-bottom-button');
    if (innerDiv.scrollHeight > innerDiv.clientHeight && innerDiv.scrollTop < innerDiv.scrollHeight - innerDiv.clientHeight) {
      scrollToBottomButton?.classList.remove('hidden');
    } else {
      scrollToBottomButton?.classList.add('hidden');
    }
  });

  const conversationDiv = document.createElement('div');
  conversationDiv.classList = 'flex flex-col items-center text-sm h-full bg-token-main-surface-primary';
  conversationDiv.id = 'preview-conversation-div';

  innerDiv.appendChild(conversationDiv);
  previewWrapper.appendChild(innerDiv);
  await loadConversationInPreview(conversationId, messageId, sidebarFolder);
}
async function loadConversationInPreview(conversationId, messageId = null, sidebarFolder = false) {
  const conversationDiv = document.querySelector('#preview-conversation-div');
  conversationDiv.innerHTML = loadingSpinner('preview-conversation-div').outerHTML;

  const conv = await getConversation(conversationId);
  if (!conv) return;
  chrome.runtime.sendMessage({
    type: 'addConversations',
    detail: {
      conversations: [conv],
    },
  });
  const conversation = removeSystemMessages(conv);
  if (!conversation) return;
  if (!conversation?.current_node) return;

  const conversationPreviewTitle = document.querySelector('#conversation-preview-wrapper #conversation-preview-title');
  conversationPreviewTitle.innerHTML = conversation.title || 'New chat';

  const origOpenConversationButton = document.querySelector('#conversation-preview-wrapper #preview-open-conversation-button');
  const openConversationButton = origOpenConversationButton.cloneNode(true);
  origOpenConversationButton.replaceWith(openConversationButton);
  openConversationButton.title = `${isWindows() ? 'Ctrl' : '⌘'} + Click to open in new tab`;
  // replace with cloneNode
  openConversationButton.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenus();
    window.open(`/c/${conversationId}`, (e.metaKey || e.ctrlKey) ? '_blank' : '_self');
  });

  const parentElement = sidebarFolder ? document.querySelector('#sidebar-folder-drawer') : document.querySelector('#modal-manager');
  const convCard = messageId
    ? parentElement?.querySelector(`#pinned-message-card-${messageId}[data-message-id="${messageId}"]`)
    : parentElement?.querySelector(`#conversation-card-${conversationId}[data-conversation-id="${conversationId}"]`);

  const origNextButton = document.querySelector('#conversation-preview-wrapper #preview-conversation-next-button');
  if (origNextButton) {
    const nextButton = origNextButton.cloneNode(true);
    origNextButton.replaceWith(nextButton);
    if (convCard?.nextElementSibling === null) {
      nextButton.classList.add('hidden');
    } else {
      nextButton.classList.remove('hidden');
    }
    nextButton?.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMenus();
      // find the card with the currrent conv id
      const curParentElement = sidebarFolder ? document.querySelector('#sidebar-folder-drawer') : document.querySelector('#modal-manager');

      const conversationCard = messageId
        ? curParentElement?.querySelector(`#pinned-message-card-${messageId}[data-message-id="${messageId}"]`)
        : curParentElement?.querySelector(`#conversation-card-${conversationId}[data-conversation-id="${conversationId}"]`);
      if (conversationCard) {
        conversationCard.style.outline = 'none';
        const nextCard = conversationCard.nextElementSibling;
        if (nextCard && (nextCard.id.startsWith('conversation-card-') || nextCard.id.startsWith('pinned-message-card-'))) {
          nextCard.style.outline = `2px solid ${isDarkMode() ? '#fff' : '#000'}`;
          lastSelectedConversationCardId = nextCard.getAttribute('data-conversation-id');
          lastSelectedPinnedMessageCardId = nextCard.getAttribute('data-message-id');
          // scroll the prev card into view middle
          nextCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const nextConversationId = nextCard.getAttribute('data-conversation-id');
          const nextMessageId = nextCard.getAttribute('data-message-id');
          loadConversationInPreview(nextConversationId, nextMessageId, sidebarFolder);
        } else {
          const previewWrapperBackground = document.querySelector('#conversation-preview-wrapper-background');
          previewWrapperBackground.remove();
        }
      }
    });
  }
  const origPreviousButton = document.querySelector('#conversation-preview-wrapper #preview-conversation-previous-button');
  if (origPreviousButton) {
    const previousButton = origPreviousButton.cloneNode(true);
    origPreviousButton.replaceWith(previousButton);
    if (convCard?.previousElementSibling === null) {
      previousButton.classList.add('hidden');
    } else {
      previousButton.classList.remove('hidden');
    }
    previousButton.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMenus();
      const curParentElement = sidebarFolder ? document.querySelector('#sidebar-folder-drawer') : document.querySelector('#modal-manager');
      // find the card with the currrent conv id
      const conversationCard = messageId
        ? curParentElement?.querySelector(`#pinned-message-card-${messageId}[data-message-id="${messageId}"]`)
        : curParentElement?.querySelector(`#conversation-card-${conversationId}[data-conversation-id="${conversationId}"]`);
      if (conversationCard) {
        conversationCard.style.outline = 'none';
        const previousCard = conversationCard.previousElementSibling;
        if (previousCard && (previousCard.id.startsWith('conversation-card-') || previousCard.id.startsWith('pinned-message-card-'))) {
          previousCard.style.outline = `2px solid ${isDarkMode() ? '#fff' : '#000'}`;
          lastSelectedConversationCardId = previousCard.getAttribute('data-conversation-id');
          lastSelectedPinnedMessageCardId = previousCard.getAttribute('data-message-id');
          // scroll the prev card into view middle
          previousCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const previousConversationId = previousCard.getAttribute('data-conversation-id');
          const previousMessageId = previousCard.getAttribute('data-message-id');
          loadConversationInPreview(previousConversationId, previousMessageId, sidebarFolder);
        } else {
          const previewWrapperBackground = document.querySelector('#conversation-preview-wrapper-background');
          previewWrapperBackground.remove();
        }
      }
    });
  }
  const sortedNodes = [];
  let currentNodeId = conversation.current_node;

  while (currentNodeId) {
    const currentNode = conversation.mapping[currentNodeId];
    const parentId = currentNode.parent;
    const parent = parentId ? conversation.mapping[parentId] : null;
    const siblings = parent ? parent.children : [];

    // eslint-disable-next-line no-loop-func
    const currentNodeIndex = siblings.findIndex((id) => currentNodeId === id);

    const threadIndex = currentNodeIndex === -1 ? siblings.length : currentNodeIndex + 1;
    const threadCount = siblings.length;
    sortedNodes.push({ ...currentNode, threadIndex, threadCount });
    currentNodeId = parentId;
  }
  sortedNodes.reverse();
  //--------
  // find last system message
  let messageDiv = '';
  messageDiv.id = 'conversation-wrapper';
  const { name, avatar } = await chrome.storage.sync.get(['name', 'avatar']);
  const { models } = await chrome.storage.local.get(['models']);
  const gizmoData = await getGizmoById(conversation?.gizmo_id);

  for (let i = 0; i < sortedNodes.length; i += 1) {
    const { message, threadCount, threadIndex } = sortedNodes[i];
    // eslint-disable-next-line no-continue
    if (!message) continue;
    if (message?.content?.content_type === 'user_editable_context') continue;
    const role = message.role || message.author?.role;
    if (!role || role === 'system') continue;
    if (role === 'user') {
      messageDiv += rowUser(conversation, sortedNodes[i], threadIndex, threadCount, name, avatar, true);
    } else {
      const assistantNodes = [sortedNodes[i]];
      let nextMessage = sortedNodes[i + 1]?.message;
      while (nextMessage && nextMessage.role !== 'user' && nextMessage.author?.role !== 'user') {
        assistantNodes.push(sortedNodes[i + 1]);
        i += 1;
        nextMessage = sortedNodes[i + 1]?.message;
      }
      // sortedNodes[i].message = message;
      messageDiv += rowAssistant(conversation, assistantNodes, threadIndex, threadCount, models, gizmoData, false, false);
    }
  }

  conversationDiv.innerHTML = messageDiv;
  const bottomDiv = document.createElement('div');
  bottomDiv.id = 'conversation-preview-bottom';
  bottomDiv.classList = 'w-full h-32 md:h-48 flex-shrink-0';
  conversationDiv.appendChild(bottomDiv);
  // add the scroll to bottom button
  const scrollToBottomButton = document.createElement('button');
  scrollToBottomButton.id = 'scroll-to-bottom-button';
  scrollToBottomButton.classList = 'hidden cursor-pointer absolute z-10 rounded-full bg-clip-padding border text-token-text-tertiary border-token-border-medium end-1/2 translate-x-1/2 bg-token-main-surface-primary w-8 h-8 flex items-center justify-center bottom-5';
  scrollToBottomButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md text-token-text-primary"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 21C11.7348 21 11.4804 20.8946 11.2929 20.7071L4.29289 13.7071C3.90237 13.3166 3.90237 12.6834 4.29289 12.2929C4.68342 11.9024 5.31658 11.9024 5.70711 12.2929L11 17.5858V4C11 3.44772 11.4477 3 12 3C12.5523 3 13 3.44772 13 4V17.5858L18.2929 12.2929C18.6834 11.9024 19.3166 11.9024 19.7071 12.2929C20.0976 12.6834 20.0976 13.3166 19.7071 13.7071L12.7071 20.7071C12.5196 20.8946 12.2652 21 12 21Z" fill="currentColor"></path></svg>';
  scrollToBottomButton.addEventListener('click', () => {
    innerDiv.scrollTop = innerDiv.scrollHeight;
  });
  conversationDiv.appendChild(scrollToBottomButton);

  const innerDiv = document.querySelector('#conversation-preview-wrapper #conversation-inner-div');
  // if scroll height is greater than the client height and not at the bottom, scroll to the bottom
  if (innerDiv.scrollHeight > innerDiv.clientHeight && innerDiv.scrollTop < innerDiv.scrollHeight - innerDiv.clientHeight) {
    const curScrollToBottomButton = document.querySelector('#conversation-preview-wrapper #scroll-to-bottom-button');
    curScrollToBottomButton?.classList?.remove('hidden');
  }
  const searchValue = document.querySelector('input[id$="-search-input"]')?.value;
  if (searchValue) {
    // const get conversationList node
    highlightSearch([conversationDiv], searchValue);
  }
  renderAllDalleImages(conversation);
  renderAllPythonImages(conversation);
  renderAllPluginVisualizations(conversation, true);
  addMissingGizmoNamesAndAvatars();
  addFinalCompletionClassToLastMessageWrapper();
  addConversationsEventListeners(conversation.conversation_id);
  if (messageId) {
    const messageElement = document.querySelector(`#conversation-preview-wrapper div[data-message-id="${messageId}"]`);
    if (messageElement) {
      const article = messageElement.closest('article');
      article.classList.add('border-l-pinned', 'bg-pinned', 'dark:bg-pinned', 'border-b');
      const block = article.offsetHeight > window.innerHeight ? 'start' : 'nearest';
      article?.scrollIntoView({ block });
    }
  }
}

function loadConversationFromNode(conversationId, newMessageId, oldMessageId) {
  const searchInput = document.querySelector('#conversation-search');
  const searchValue = searchInput?.value || '';

  stopAllAudios();
  chrome.storage.sync.get(['name', 'avatar'], async (result) => {
    const conversation = await getConversation(conversationId, true);
    chrome.storage.local.get(['models'], (res) => {
      const fullConversation = removeSystemMessages(conversation);
      if (!fullConversation) return;
      getGizmoById(fullConversation?.gizmo_id).then((gizmoData) => {
        let currentNode = fullConversation.mapping[newMessageId];
        const sortedNodes = [];
        while (currentNode) {
          const parentId = currentNode.parent;
          const parent = fullConversation.mapping[parentId];
          const siblings = parent.children;
          const curNodeIndex = siblings.findIndex((id) => id === newMessageId);// only for the first node
          const threadIndex = curNodeIndex === -1 ? 1 : curNodeIndex + 1;
          const threadCount = siblings.length;
          sortedNodes.push({ ...currentNode, threadIndex, threadCount });
          currentNode = fullConversation.mapping[currentNode.children[0]];
        }

        let messageDiv = '';
        for (let i = 0; i < sortedNodes.length; i += 1) {
          const { message, threadCount, threadIndex } = sortedNodes[i];
          // eslint-disable-next-line no-continue
          if (!message) continue;
          if (message?.content?.content_type === 'user_editable_context') continue;
          const role = message.role || message.author?.role;
          if (!role || role === 'system') continue;
          if (role === 'user') {
            messageDiv += rowUser(fullConversation, sortedNodes[i], threadIndex, threadCount, result.name, result.avatar);
          } else {
            const assistantNodes = [sortedNodes[i]];
            let nextMessage = sortedNodes[i + 1]?.message;
            while (nextMessage && nextMessage.role !== 'user' && nextMessage.author?.role !== 'user') {
              assistantNodes.push(sortedNodes[i + 1]);
              i += 1;
              nextMessage = sortedNodes[i + 1]?.message;
            }
            // sortedNodes[i].message = message;
            messageDiv += rowAssistant(fullConversation, assistantNodes, threadIndex, threadCount, res.models, gizmoData, false, false);
          }
        }
        const conversationBottom = document.querySelector('#conversation-preview-bottom');

        const messageWrapper = document.querySelector(`#conversation-preview-wrapper #message-wrapper-${oldMessageId}`);
        while (messageWrapper.nextElementSibling && messageWrapper.nextElementSibling.id.startsWith('message-wrapper-')) {
          messageWrapper.nextElementSibling.remove();
        }
        messageWrapper.remove();

        // inser messageDiv html above conversation bottom
        conversationBottom.insertAdjacentHTML('beforebegin', messageDiv);
        if (searchValue) {
          const conversationInnerDiv = document.querySelector('#conversation-preview-wrapper #conversation-inner-div');
          const conversationTopTitle = document.querySelector('#conversation-top-title');
          highlightSearch([conversationTopTitle, conversationInnerDiv], searchValue);
        }
        addFinalCompletionClassToLastMessageWrapper();
        renderAllDalleImages(fullConversation);
        renderAllPythonImages(fullConversation);
        renderAllPluginVisualizations(fullConversation);
        addMissingGizmoNamesAndAvatars();
        addConversationsEventListeners(fullConversation.conversation_id);
      });
    });
  });
}

function removeSystemMessages(fullConversation) {
  if (!fullConversation) return fullConversation;
  // clone fullConversation into tmpConv without reference
  const tmpConv = structuredClone(fullConversation);
  Object.keys(tmpConv.mapping).forEach((nodeId) => {
    const node = tmpConv.mapping[nodeId];
    if (node?.message?.role === 'system' || node?.message?.author?.role === 'system') {
      const systemNodeParentId = node.parent;
      const systemNodeChildren = node.children;
      const parent = tmpConv.mapping[systemNodeParentId];
      if (parent) {
        parent.children = parent.children.filter((id) => id !== nodeId);
        parent.children.push(...systemNodeChildren);
      }
      const child = tmpConv.mapping[systemNodeChildren[0]];
      if (child) {
        child.parent = systemNodeParentId;
      }
      // delete tmpConv.mapping[nodeId];
    }
  });
  return tmpConv;
}

function addCopyCodeButtonsEventListeners() {
  const copyCodeButtons = document.querySelectorAll('[id="copy-code"][data-initialized="false"]');

  copyCodeButtons.forEach((btn) => {
    // clear existing event listeners
    const button = btn.cloneNode(true);
    button.dataset.initialized = true;
    btn.parentNode.replaceChild(button, btn);
    button.addEventListener('click', () => {
      // get closest code element
      const code = button.closest('pre').querySelector('code');
      navigator.clipboard.writeText(code.innerText);
      button.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="20 6 9 17 4 12"></polyline></svg>Copied!';
      setTimeout(
        () => {
          button.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>Copy code';
        },
        1500,
      );
    });
  });
  const manageMemoriesButtons = document.querySelectorAll('[id="manage-memories"]');
  manageMemoriesButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      // add #settings/Personalization to the url
      window.location.href = `${window.location.href.split('#')[0]}/#settings/Personalization`;
    });
  });
}

function addMissingGizmoNamesAndAvatars() {
  const missingGizmoAvatars = document.querySelectorAll('[id="gizmo-avatar"]');
  missingGizmoAvatars.forEach((avatar) => {
    const gizmoId = avatar.dataset.gizmoid;
    getGizmoById(gizmoId).then((gizmoData) => {
      if (avatar.src.includes('wikimedia')) {
        const avatarSrc = gizmoData?.resource?.gizmo?.display?.profile_picture_url;
        if (avatarSrc) {
          avatar.src = avatarSrc;
        }
      }
    });
  });
}
let lastArticleElement;
// eslint-disable-next-line no-unused-vars
function addCopyButtonEventListener() {
  document.body.addEventListener('mouseover', (e) => {
    const articleElement = e.target.closest('article');

    // if mouse is over a an article element
    if (articleElement && articleElement !== lastArticleElement) {
      lastArticleElement = articleElement;
      const messageCopyButton = articleElement.querySelector('button[data-testid="copy-turn-action-button"]');
      if (!messageCopyButton) return;
      const messageCopyOriginalButton = articleElement.querySelector('button[data-testid="copy-turn-action-button-original"]');
      if (messageCopyOriginalButton) return;

      const clonedButton = messageCopyButton.cloneNode(true);
      // add cloned button after original button
      messageCopyButton.insertAdjacentElement('afterend', clonedButton);
      // hide original button
      // set data-testid="copy-turn-action-button-original" to the original button
      messageCopyButton.dataset.testid = 'copy-turn-action-button-original';
      messageCopyButton.style.display = 'none';
      // under article find a div nod that has the data-message-id
      const messageId = articleElement?.querySelector('[data-message-id]')?.dataset.messageId;
      clonedButton?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        closeMenus();
        const conversationIdFromUrl = getConversationIdFromUrl();

        showCopyMenu(event, messageId, conversationIdFromUrl);
        handleCopyText(messageId, conversationIdFromUrl);
      });
    } else if (!articleElement) {
      lastArticleElement = null;
    }
  });
}
async function showCopyMenu(event, messageId, conversationId) {
  const { x, y } = getMousePosition(event);
  const article = event.target.closest('article');
  const hasSubscription = await chrome.runtime.sendMessage({
    type: 'checkHasSubscription',
  });
  // check if next element is article
  const isLastArticle = !article.nextElementSibling || article.nextElementSibling?.tagName !== 'ARTICLE';
  const translateX = x + (isLastArticle ? 16 : 4) + window.scrollX;
  const translateY = y + (isLastArticle ? -48 : 4) + window.scrollY;
  const previewMode = document.querySelector('#conversation-preview-wrapper');
  const menu = `<div id="copy-message-menu" dir="ltr" style="position:fixed;left:0;top:0;transform:translate3d(${translateX}px,${translateY}px,0);min-width:max-content;z-index:1000000;--radix-popper-anchor-width:18px;--radix-popper-anchor-height:18px;--radix-popper-available-width:1167px;--radix-popper-available-height:604px;--radix-popper-transform-origin:0% 0px"><div data-side="bottom" data-align="start" role="menu" aria-orientation="vertical" data-state="open" data-radix-menu-content="" dir="ltr" aria-labelledby="radix-:r6g:" class="mt-2 min-w-[100px] max-w-xs rounded-lg border border-gray-100 bg-token-main-surface-primary shadow-lg dark:border-gray-700" tabindex="-1" data-orientation="vertical" style="outline:0;--radix-dropdown-menu-content-transform-origin:var(--radix-popper-transform-origin);--radix-dropdown-menu-content-available-width:var(--radix-popper-available-width);--radix-dropdown-menu-content-available-height:var(--radix-popper-available-height);--radix-dropdown-menu-trigger-width:var(--radix-popper-anchor-width);--radix-dropdown-menu-trigger-height:var(--radix-popper-anchor-height);pointer-events:auto">
  
  <div role="menuitem" id="save-as-pdf-button-${messageId}" class="flex gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item="">${translate('Save as PDF')}</div>
  
  <div role="menuitem" id="copy-html-button-${messageId}" class="flex gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item="">${translate('Copy with Format')}</div>
  
  ${previewMode ? '' : `<div role="menuitem" id="add-to-notes-button-${messageId}" class="flex items-center justify-between gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item="">${translate('Add to Notes')} ${hasSubscription ? '' : '<span class="text-white rounded-md bg-green-500 px-2 text-sm">Pro</span>'}</div>`}
  
  </div></div>`;
  document.body.insertAdjacentHTML('beforeend', menu);

  addCopyMenuEventListeners(messageId, conversationId);
}
function addCopyMenuEventListeners(messageId, conversationId) {
  const saveAsPDFButton = document.querySelector(`#save-as-pdf-button-${messageId}`);
  const copyHtmlButton = document.querySelector(`#copy-html-button-${messageId}`);
  const addToNotesButton = document.querySelector(`#add-to-notes-button-${messageId}`);

  saveAsPDFButton?.addEventListener('click', () => {
    closeMenus();
    saveResponseAsPDF(messageId, conversationId);
  });
  copyHtmlButton?.addEventListener('click', (e) => {
    closeMenus();
    handleCopyHtml(messageId, conversationId, e.shiftKey);
  });

  addToNotesButton?.addEventListener('click', () => {
    closeMenus();
    handleCopyText(messageId, conversationId, true);
  });
}
function removeTimeStampCounterFromCopy(content) {
  content.querySelectorAll('#message-char-word-counter').forEach((el) => {
    el.remove();
  });
  content.querySelectorAll('#message-timestamp').forEach((el) => {
    el.remove();
  });
  return content;
}
async function saveResponseAsPDF(messageId, conversationId) {
  const messageWrapper = document.querySelector(`div[data-message-id="${messageId}"]`).parentElement;
  const messageWrapperArticle = messageWrapper.closest('article');
  saveConversationAsPDF(conversationId, messageWrapperArticle);
}
async function handleCopyText(messageId, conversationId, addToNote = false) {
  const messageWrapper = document.querySelector(`div[data-message-id="${messageId}"]`).parentElement;
  const messageWrapperArticle = messageWrapper.closest('article');

  const originalCopyButton = messageWrapperArticle.querySelector('[data-testid="copy-turn-action-button-original"]');
  originalCopyButton.click();

  if (addToNote) {
    const text = await navigator.clipboard.readText();
    handleAddToNoteText(text);
  } else {
    toast('Copied to clipboard', 'success');
  }
}

async function handleCopyHtml(messageId, conversationId, addToNote = false) {
  const messageWrapper = document.querySelector(`div[data-message-id="${messageId}"]`).parentElement;
  const messageWrapperArticle = messageWrapper.closest('article');

  let content = messageWrapper.cloneNode(true);
  content = removeTimeStampCounterFromCopy(content);
  // don't want avatar in HTML
  const userElement = messageWrapperArticle?.previousElementSibling?.lastElementChild;

  if (cachedSettings.copyMode) {
    content.innerHTML = `<div>USER:</div><div>${userElement?.innerText || ''}</div><br><div>ASSISTANT:</div>${content.innerHTML}`;
  }
  copyRichText(content);
  if (addToNote) {
    handleAddToNoteText(content.innerHTML, 'as HTML');
  } else {
    toast('Copied to clipboard as HTML', 'success');
  }
}

function handleAddToNoteText(text, format = '') {
  chrome.runtime.sendMessage({
    type: 'checkHasSubscription',
  }, (hasSubscription) => {
    if (!hasSubscription) {
      const error = { title: 'This is a Pro feature', message: 'Using the Notes feature requires a Pro subscription. Upgrade to Pro to remove all limits.' };
      errorUpgradeConfirmation(error);
      return;
    }
    toast(`Copied to clipboard${format ? ` ${format}` : ''} and added to notes`, 'success');

    const sidebarNoteInput = document.querySelector('#sidebar-note-input');
    if (!sidebarNoteInput) return;
    sidebarNoteInput.value += `${text}`;
    sidebarNoteInput.blur();
    if (sidebarNoteIsOpen) return;
    const sidebarNoteButton = document.querySelector('#sidebar-note-button');
    if (!sidebarNoteButton) return;
    sidebarNoteButton.insertAdjacentElement('beforeend', animatePing('#19c37d'));
  });
}
function addConversationsEventListeners(conversationId, onlyUpdateLastMessage = false) {
  const lastMessageWrapper = [...document.querySelectorAll('[id^="message-wrapper-"]')].pop();
  let messageCopyButtons = document.querySelectorAll('[id^="copy-message-button-"]');
  let threadPrevButtons = document.querySelectorAll('#conversation-preview-wrapper [id^="thread-prev-button-"]');
  let threadNextButtons = document.querySelectorAll('#conversation-preview-wrapper [id^="thread-next-button-"]');
  let assetButtons = document.querySelectorAll('[id^="asset-"]');
  let messagePluginToggleButtons = document.querySelectorAll('[id^="message-plugin-toggle-"]');
  let messageStrawberryToggleButtons = document.querySelectorAll('[id^="strawberry-dropdown-wrapper-"]');
  // all a element with href starting with sandbox
  let sandboxLinks = document.querySelectorAll('a[href^="sandbox:/"]');
  // get all a tags inside role=presentation
  let citations = document.querySelectorAll('span[id="citation"]');
  if (onlyUpdateLastMessage) {
    messageCopyButtons = Array.from(messageCopyButtons).slice(-1);
    // start - last 2 buttons for thread buttons
    threadPrevButtons = Array.from(threadPrevButtons).slice(-2);
    threadNextButtons = Array.from(threadNextButtons).slice(-2);
    assetButtons = Array.from(assetButtons).slice(-2);
    // end - last 2 buttons for thread buttons
    messagePluginToggleButtons = lastMessageWrapper?.querySelectorAll('[id^="message-plugin-toggle-"]');
    messageStrawberryToggleButtons = lastMessageWrapper?.querySelectorAll('[id^="strawberry-dropdown-wrapper-"]');
    citations = lastMessageWrapper?.querySelectorAll('span[id="citation"]');
    sandboxLinks = lastMessageWrapper?.querySelectorAll('a[href^="sandbox:/"]');
  }

  addCopyCodeButtonsEventListeners();

  messageCopyButtons.forEach((btn) => {
    // clear existing event listeners
    const button = btn.cloneNode(true);
    btn.parentNode.replaceChild(button, btn);
    const messageId = button.id.split('copy-message-button-').pop();

    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeMenus();
      showCopyMenu(event, messageId, conversationId);
    });
  });

  threadPrevButtons.forEach((btn) => {
    // clear existing event listeners
    const button = btn.cloneNode(true);
    btn.parentNode.replaceChild(button, btn);
    button.addEventListener('click', async () => {
      const conv = await getConversation(conversationId);
      const conversation = removeSystemMessages(conv);
      const messageId = button.id.split('thread-prev-button-').pop();
      const messageWrapper = document.querySelector(`#message-wrapper-${messageId}`);
      const previousMessageWrapper = messageWrapper.previousElementSibling;
      // if thread is on the first message
      let parentId = conversation.mapping[messageId].parent;
      // if thread is not on the first message
      if (previousMessageWrapper && previousMessageWrapper.id.startsWith('message-wrapper-')) {
        parentId = previousMessageWrapper.id.split('message-wrapper-').pop();
      }
      const parent = conversation.mapping[parentId];
      const siblings = parent.children;
      const threadButtonsWrapper = document.querySelector(`#thread-count-wrapper-${messageId}`);
      const [currentThreadIndex] = threadButtonsWrapper.textContent.split(' / ').map((n) => parseInt(n, 10));
      if (currentThreadIndex > 1) {
        const newThreadIndex = currentThreadIndex - 1;
        const newMessageId = siblings[newThreadIndex - 1]; // thread index is 1-based, array index is 0-based
        loadConversationFromNode(conversation.conversation_id, newMessageId, messageId);
      }
    });
  });

  threadNextButtons.forEach((btn) => {
    // clear existing event listeners
    const button = btn.cloneNode(true);
    btn.parentNode.replaceChild(button, btn);
    button.addEventListener('click', async () => {
      const conv = await getConversation(conversationId);
      const conversation = removeSystemMessages(conv);
      const messageId = button.id.split('thread-next-button-').pop();
      const messageWrapper = document.querySelector(`#message-wrapper-${messageId}`);
      const previousMessageWrapper = messageWrapper.previousElementSibling;
      // if thread is on the first message
      let parentId = conversation.mapping[messageId].parent;
      // if thread is not on the first message
      if (previousMessageWrapper && previousMessageWrapper.id.startsWith('message-wrapper-')) {
        parentId = previousMessageWrapper.id.split('message-wrapper-').pop();
      }
      const parent = conversation.mapping[parentId];
      const siblings = parent.children;
      const threadButtonsWrapper = document.querySelector(`#thread-count-wrapper-${messageId}`);
      const [currentThreadIndex, threadCount] = threadButtonsWrapper.textContent.split(' / ').map((n) => parseInt(n, 10));
      if (currentThreadIndex < threadCount) {
        const newThreadIndex = currentThreadIndex + 1;
        const newMessageId = siblings[newThreadIndex - 1]; // thread index is 1-based, array index is 0-based
        loadConversationFromNode(conversation.conversation_id, newMessageId, messageId);
      }
    });
  });

  assetButtons?.forEach((btn) => {
    const button = btn.cloneNode(true);
    btn.parentNode.replaceChild(button, btn);
    button.addEventListener('click', () => {
      // if button is img, get src
      let imageUrl = '';
      if (button.tagName === 'IMG') {
        imageUrl = button.getAttribute('src');
      }
      // if button is span, get the url from background-image
      if (button.tagName === 'SPAN') {
        // eslint-disable-next-line prefer-destructuring
        imageUrl = button.style.backgroundImage.split('"')[1];
      }
      createFullSizeFileWrapper(imageUrl);
      addFullSizeFileWrapperEventListener();
    });
  });
  const citationElements = [];
  const citationUrls = [];
  citations?.forEach((citation) => {
    const citationLink = citation.querySelector('a');
    if (!citationLink.href) return;
    if (!citationLink.href.startsWith('http')) return;
    // save the citation urls  without path
    if (citation.querySelector('svg')) {
      citationElements.push(citation);
      const url = new URL(citationLink.href);
      citationUrls.push(url.origin);
    }
    const citationLinkElement = citationLink.cloneNode(true);
    citationLink.parentNode.replaceChild(citationLinkElement, citationLink);
    citationLinkElement.addEventListener('mouseenter', (e) => {
      showCitationTooltip(e, citationLinkElement);
    });
    citationLinkElement.addEventListener('mouseleave', (e) => {
      hideCitationTooltip(e);
    });
  });
  updateCitationAttributes(citationElements, citationUrls);
  sandboxLinks?.forEach((sandboxLink) => {
    const linkElement = sandboxLink.cloneNode(true);
    sandboxLink.parentNode.replaceChild(linkElement, sandboxLink);
    linkElement.addEventListener('click', (e) => {
      e.preventDefault();
      closeMenus();
      const conversation = getConversation(conversationId);
      const sandboxUrl = linkElement.getAttribute('href');
      const fileName = sandboxUrl.split('/').pop();
      const sandboxUrlPath = sandboxUrl.split('sandbox:').pop();
      const node = Object.values(conversation.mapping).find((n) => n.message?.metadata?.aggregate_result?.final_expression_output?.includes(`'${sandboxUrlPath}'`));

      const resultImages = node?.message?.metadata?.aggregate_result?.messages?.filter((m) => m?.message_type === 'image');
      const image = resultImages?.[0];
      const imageId = image?.image_url?.split('://')?.pop();
      if (imageId) {
        getDownloadUrlFromFileId(conversationId, imageId).then((response) => {
          // save the file to user downloads folder: response.download_url;
          if (response.status === 'error') {
            toast('Code interpreter session expired', 'error');
            return;
          }
          const downloadUrl = response.download_url;
          downloadFileFromUrl(downloadUrl, fileName);
        });
      } else {
        getDownloadUrlFromSandBoxPath(conversationId, node.id, sandboxUrlPath).then((response) => {
          // save the file to user downloads folder: response.download_url;
          if (response.status === 'error') {
            toast('Code interpreter session expired', 'error');
            return;
          }
          const downloadUrl = response.download_url;
          downloadFileFromUrl(downloadUrl, fileName);
        });
      }
    });
  });

  addMessagePluginToggleButtonsEventListeners(messagePluginToggleButtons);
  addMessageStrawberryToggleButtonsEventListeners(messageStrawberryToggleButtons);
}

function addMessagePluginToggleButtonsEventListeners(messagePluginToggleButtons) {
  messagePluginToggleButtons?.forEach((btn) => {
    const button = btn.cloneNode(true);
    btn.parentNode.replaceChild(button, btn);
    button.addEventListener('click', () => {
      const messageId = button.id.split('message-plugin-toggle-').pop();
      const pluginContent = document.querySelector(`#message-plugin-content-${messageId}`);
      // if pluginContent has class hidden remove it, otherwise add it
      if (pluginContent.classList.contains('hidden')) {
        button.querySelector('polyline').setAttribute('points', '18 15 12 9 6 15');
        pluginContent.classList.remove('hidden');
      } else {
        button.querySelector('polyline').setAttribute('points', '6 9 12 15 18 9');
        pluginContent.classList.add('hidden');
      }
    });
  });
}
function addMessageStrawberryToggleButtonsEventListeners(messageStrawberryToggleButtons) {
  messageStrawberryToggleButtons?.forEach((btn) => {
    const button = btn.cloneNode(true);
    btn.parentNode.replaceChild(button, btn);
    button.addEventListener('click', () => {
      const messageId = button.id.split('strawberry-dropdown-wrapper-').pop();
      const strawberryContent = document.querySelector(`#strawberry-content-${messageId}`);
      // if strawberryContent has class hidden remove it, otherwise add it
      const strawberryDropdownToggle = document.querySelector(`#strawberry-dropdown-toggle-${messageId}`);
      if (strawberryContent) {
        strawberryContent.classList.toggle('hidden');
        if (strawberryContent.classList.contains('hidden')) {
          strawberryDropdownToggle.classList.remove('rotate-180');
        } else {
          strawberryDropdownToggle.classList.add('rotate-180');
        }
      }
    });
  });
}

function showCitationTooltip(e, citationElement) {
  const citationUrl = new URL(citationElement.getAttribute('href'));
  const citationTitle = citationUrl.host ? citationElement.title : citationElement.href.includes('sandbox') ? 'Download file' : '';
  const citationDomain = citationUrl.hostname;
  const { x, y } = citationElement.getBoundingClientRect();
  if (!citationTitle) return;
  const citationTooltip = `<div id="citation-tooltip" style="position: fixed; left: 0px; top: 0px; transform: translate3d(${x}px, ${y - 30}px, 0px); min-width: max-content; z-index: auto; --radix-popper-anchor-width: 25px; --radix-popper-anchor-height: 21px; --radix-popper-available-width: 753.3125px; --radix-popper-available-height: 535px; --radix-popper-transform-origin: 50% 34px;"><div data-side="top" data-align="center" data-state="delayed-open" class="relative rounded-lg border border-token-border-medium bg-black p-1 shadow-xs transition-opacity max-w-sm" style="--radix-tooltip-content-transform-origin: var(--radix-popper-transform-origin); --radix-tooltip-content-available-width: var(--radix-popper-available-width); --radix-tooltip-content-available-height: var(--radix-popper-available-height); --radix-tooltip-trigger-width: var(--radix-popper-anchor-width); --radix-tooltip-trigger-height: var(--radix-popper-anchor-height);"><span class="flex items-center whitespace-pre-wrap px-2 py-1 text-center font-medium normal-case text-gray-100 text-sm"><a href="${citationUrl.href}" target="_blank" rel="noreferrer" class="text-xs !no-underline"><div class="flex items-center gap-2">${citationUrl.host ? `<div class="flex shrink-0 items-center justify-center"><img src="https://icons.duckduckgo.com/ip3/${citationDomain}.ico" alt="Favicon" width="16" height="16" class="my-0"></div>` : ''}<div class="max-w-xs truncate">${citationTitle}</div>${citationUrl.host ? '<div class="shrink-0"><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="icon-xs" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></div>' : ''}</div></a></span></div></div>`;
  const existingTooltip = document.querySelector('#citation-tooltip');
  if (existingTooltip) return;
  document.body.insertAdjacentHTML('beforeend', citationTooltip);
  const tooltip = document.querySelector('#citation-tooltip');
  const tooltipWidth = tooltip.offsetWidth;
  tooltip.style.transform = `translate3d(${x - tooltipWidth / 2}px, ${y - 30}px, 0px)`;
  tooltip.addEventListener('mouseout', (event) => {
    hideCitationTooltip(event);
  });
}
function hideCitationTooltip(e) {
  const tooltip = document.querySelector('#citation-tooltip');
  if (tooltip && !tooltip.contains(e.relatedTarget)) {
    tooltip.remove();
  }
}
function updateCitationAttributes(citationElements, citationUrls) {
  // unique citationUrls
  citationUrls = [...new Set(citationUrls)];
  if (!citationUrls.length) return;
  getCitationAttributions(citationUrls).then((citationsAttributions) => {
    citationElements.forEach((citationElement) => {
      const citationLink = citationElement.querySelector('a');
      const citationUrl = new URL(citationLink.href);

      const citationDomain = citationUrl.origin;
      const citationData = citationsAttributions.find((c) => c.url === citationDomain);
      if (!citationData) return;
      // replace the svg inside the citationElement with the ${citationData.attribution}
      const citationIcon = citationElement.querySelector('svg');
      citationIcon.outerHTML = citationData.attribution;
      // add  <span class="text-token-text-tertiary"> (</span> before the citationLink
      citationLink.insertAdjacentHTML('beforebegin', '<span class="text-token-text-tertiary"> (</span>');
      // add <span class="text-token-text-tertiary">)</span> after the citationLink
      citationLink.insertAdjacentHTML('afterend', '<span class="text-token-text-tertiary">)</span>');
    });
  });
}
