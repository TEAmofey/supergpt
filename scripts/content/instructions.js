/* global dropdown, addDropdownEventListener, languageList, writingStyleList, toneList, getConversationIdFromUrl, throttle, initializeNavbar, cachedSettings */

let lastLanguageCodeInConversation = null;
let lastToneCodeInConversation = null;
let lastWritingStyleCodeInConversation = null;
window.localStorage.setItem('sp/lastInstruction', null);
window.localStorage.setItem('sp/instructionsCache', '{}');

// eslint-disable-next-line no-unused-vars
function resetInstructions() {
  lastLanguageCodeInConversation = null;
  lastToneCodeInConversation = null;
  lastWritingStyleCodeInConversation = null;
  window.localStorage.setItem('sp/lastInstruction', null);
}

// eslint-disable-next-line no-unused-vars
function addInstructionDropdowns(navWrapper) {
  const {
    autoResetTopNav, selectedLanguage, selectedTone, selectedWritingStyle,
    showLanguageSelector, showToneSelector, showWritingStyleSelector,
  } = cachedSettings;
  let newSelectedLanguage = (autoResetTopNav || !showLanguageSelector) ? languageList.find((language) => language.code === 'default') : selectedLanguage;
  let newSelectedTone = (autoResetTopNav || !showToneSelector) ? toneList.find((tone) => tone.code === 'default') : selectedTone;
  let newSelectedWritingStyle = (autoResetTopNav || !showWritingStyleSelector) ? writingStyleList.find((writingStyle) => writingStyle.code === 'default') : selectedWritingStyle;

  newSelectedLanguage = lastLanguageCodeInConversation ? languageList.find((language) => language.code === lastLanguageCodeInConversation) : newSelectedLanguage;
  newSelectedTone = lastToneCodeInConversation ? toneList.find((tone) => tone.code === lastToneCodeInConversation) : newSelectedTone;
  newSelectedWritingStyle = lastWritingStyleCodeInConversation ? writingStyleList.find((writingStyle) => writingStyle.code === lastWritingStyleCodeInConversation) : newSelectedWritingStyle;

  chrome.storage.local.set({
    settings: {
      ...cachedSettings,
      selectedLanguage: newSelectedLanguage,
      selectedTone: newSelectedTone,
      selectedWritingStyle: newSelectedWritingStyle,
    },
  }, () => {
    // Add tone selector
    const toneSelectorWrapper = document.createElement('div');
    toneSelectorWrapper.id = 'tone-selector-wrapper';
    toneSelectorWrapper.style = `position:relative;width:150px;margin-left:8px;display:${cachedSettings.showToneSelector ? 'block' : 'none'}`;
    toneSelectorWrapper.innerHTML = dropdown('Tone', toneList, newSelectedTone, 'code', 'right');
    navWrapper.appendChild(toneSelectorWrapper);

    // Add writing style selector
    const writingStyleSelectorWrapper = document.createElement('div');
    writingStyleSelectorWrapper.id = 'writing-style-selector-wrapper';
    writingStyleSelectorWrapper.style = `position:relative;width:150px;margin-left:8px;display:${cachedSettings.showWritingStyleSelector ? 'block' : 'none'}`;
    writingStyleSelectorWrapper.innerHTML = dropdown('Writing-Style', writingStyleList, newSelectedWritingStyle, 'code', 'right');
    navWrapper.appendChild(writingStyleSelectorWrapper);

    // Add language selector
    const languageSelectorWrapper = document.createElement('div');
    languageSelectorWrapper.id = 'language-selector-wrapper';
    languageSelectorWrapper.style = `position:relative;width:150px;margin-left:8px;display:${cachedSettings.showLanguageSelector ? 'block' : 'none'}`;
    languageSelectorWrapper.innerHTML = dropdown('Language', languageList, newSelectedLanguage, 'code', 'right');
    navWrapper.appendChild(languageSelectorWrapper);

    // Add event listeners
    addDropdownEventListener('Tone', toneList, 'code', () => generateInstructions());
    addDropdownEventListener('Writing-Style', writingStyleList, 'code', () => generateInstructions());
    addDropdownEventListener('Language', languageList, 'code', () => generateInstructions());

    generateInstructions();
  });
}
// eslint-disable-next-line no-unused-vars
const throttleReplaceAllInstructionsInConversation = throttle(() => {
  replaceAllInstructionsInConversation();
});
function replaceAllInstructionsInConversation() {
  const conversationIdFromUrl = getConversationIdFromUrl();

  const main = document.querySelector('main');
  if (!main) return;

  const articles = main.querySelectorAll('article');
  if (conversationIdFromUrl && articles.length === 0) return;

  const userMessages = main.querySelectorAll('article div[data-message-author-role="user"]');
  if (conversationIdFromUrl && userMessages.length === 0) return;

  // check if last user messages have innertext
  if (userMessages.length > 0 && !userMessages[userMessages.length - 1]?.querySelector('div.whitespace-pre-wrap')?.innerText) return;
  if (userMessages.length > 0) {
    const instructionsCache = JSON.parse(window.localStorage.getItem('sp/instructionsCache') || '{}');

    for (let i = 0; i < userMessages.length; i += 1) {
      const message = userMessages[i];
      const messageHasInstruction = message.innerText.match(/^## Instructions[\s\S]*?## End Instructions\n\n/m) || instructionsCache[message.getAttribute('data-message-id')];

      if (messageHasInstruction) {
        const instruction = replaceInstructionsInMessage(message, instructionsCache);
        if (instruction) {
          lastLanguageCodeInConversation = instruction.match(/\(languageCode: (.*)\)/)?.[1] || lastLanguageCodeInConversation;
          lastToneCodeInConversation = instruction.match(/\(toneCode: (.*)\)/)?.[1] || lastToneCodeInConversation;
          lastWritingStyleCodeInConversation = instruction.match(/\(writingStyleCode: (.*)\)/)?.[1] || lastWritingStyleCodeInConversation;
        }
      }
      // addUserMessageEventListener(message);
    }
  }

  initializeNavbar();
}
function replaceInstructionsInMessage(message, instructionsCache = null) {
  const existingMessageInstructions = message.parentElement.querySelector('#message-instructions');
  if (existingMessageInstructions) existingMessageInstructions.remove();
  if (!message) return '';
  let newInstructionsCache = instructionsCache;
  if (!newInstructionsCache) {
    newInstructionsCache = JSON.parse(window.localStorage.getItem('sp/instructionsCache') || '{}');
  }
  const cachedInstruction = newInstructionsCache[message.getAttribute('data-message-id')] || null;
  const messageText = cachedInstruction || message.innerText;
  const instruction = messageText.match(/^## Instructions[\s\S]*?## End Instructions\n\n/m)?.[0];

  if (!instruction) return '';

  message.querySelector('div.whitespace-pre-wrap').innerText = message.querySelector('div.whitespace-pre-wrap').innerText.replace(/^## Instructions[\s\S]*?## End Instructions\n\n/m, '');
  addInstructionIndicators(message, instruction);
  return instruction;
}
function addInstructionIndicators(message, instruction) {
  if (!instruction) return;
  if (!message) return;
  const messageId = message.getAttribute('data-message-id');
  const languageCode = instruction.match(/\(languageCode: (.*)\)/)?.[1] || null;
  const toneCode = instruction.match(/\(toneCode: (.*)\)/)?.[1] || null;
  const writingStyleCode = instruction.match(/\(writingStyleCode: (.*)\)/)?.[1] || null;
  const languageName = languageList.find((lang) => lang.code === languageCode)?.name;
  const toneName = toneList.find((tone) => tone.code === toneCode)?.name;
  const writingStyleName = writingStyleList.find((writingStyle) => writingStyle.code === writingStyleCode)?.name;

  const indicatorHtml = `<div id="message-instructions" class="absolute flex" style="bottom:-30px; left:16px;">
      ${languageName ? `<div id="language-code-hint-${messageId}" data-code="${languageCode}" title="You changed the response language here. This prompt includes a hidden language instructions" class="h-6 p-2 me-1 flex items-center justify-center rounded-md border text-xs text-token-text-tertiary border-token-border-medium bg-token-main-surface-secondary">Language: &nbsp<b>${languageName}</b></div>` : ''}
      ${toneName ? `<div id="tone-code-hint-${messageId}" data-code="${toneCode}" title="You changed the response tone here. This prompt includes a hidden tone instructions" class="h-6 p-2 me-1 flex items-center justify-center rounded-md border text-xs text-token-text-tertiary border-token-border-medium bg-token-main-surface-secondary">Tone: &nbsp<b>${toneName}</b></div>` : ''}
      ${writingStyleName ? `<div id="writing-style-code-hint-${messageId}" data-code="${writingStyleCode}" title="You changed the response writing style here. This prompt includes a hidden writing style instructions" class="h-6 p-2 me-1 flex items-center justify-center rounded-md border text-xs text-token-text-tertiary border-token-border-medium bg-token-main-surface-secondary">Writing Style: &nbsp<b>${writingStyleName}</b></div>` : ''}
    </div>`;
  if (languageCode || toneCode || writingStyleCode) {
    message.parentElement.insertAdjacentHTML('beforeend', indicatorHtml);
  }
}

async function generateInstructions(forceAddInstructions = false) {
  const {
    selectedLanguage = { code: 'default', name: 'Default' },
    selectedTone = { code: 'default', name: 'Default' },
    selectedWritingStyle = { code: 'default', name: 'Default' },
  } = cachedSettings;

  const main = document.querySelector('main');
  const articles = main.querySelectorAll('article');

  if (!forceAddInstructions
    && lastLanguageCodeInConversation === selectedLanguage.code
    && lastToneCodeInConversation === selectedTone.code
    && lastWritingStyleCodeInConversation === selectedWritingStyle.code) {
    if (articles.length === 0) {
      return window.localStorage.getItem('sp/lastInstruction') || '';
    }
    window.localStorage.setItem('sp/lastInstruction', null);
    return '';
  }
  window.localStorage.setItem('sp/lastInstruction', null);

  let includeInstructions = false;
  let instructions = '## Instructions\n';

  const languageInstructions = `**Language instruction:**\nPlease ignore all previous language instructions. From now on, I want you to respond only in ${selectedLanguage.name} language (languageCode: ${selectedLanguage.code}).\n`;

  const toneInstructions = `**Tone instruction:**\nPlease ignore all previous tone instructions. From now on, I want you to respond only in ${selectedTone.name} tone (toneCode: ${selectedTone.code}).\n`;

  const writingStyleInstructions = `**Writing-Style instruction:**\nPlease ignore all previous writing-style instructions. From now on, I want you to respond only in ${selectedWritingStyle.name} writing style (writingStyleCode: ${selectedWritingStyle.code}).\n`;

  if (forceAddInstructions || lastLanguageCodeInConversation !== selectedLanguage.code || articles.length === 0) {
    if (selectedLanguage.code !== 'default' || (lastLanguageCodeInConversation && lastLanguageCodeInConversation !== 'default')) {
      instructions += languageInstructions;
      includeInstructions = true;
    }
  }
  if (forceAddInstructions || lastToneCodeInConversation !== selectedTone.code || articles.length === 0) {
    if (selectedTone.code !== 'default' || (lastToneCodeInConversation && lastToneCodeInConversation !== 'default')) {
      instructions += toneInstructions;
      includeInstructions = true;
    }
  }
  if (forceAddInstructions || lastWritingStyleCodeInConversation !== selectedWritingStyle.code || articles.length === 0) {
    if (selectedWritingStyle.code !== 'default' || (lastWritingStyleCodeInConversation && lastWritingStyleCodeInConversation !== 'default')) {
      instructions += writingStyleInstructions;
      includeInstructions = true;
    }
  }
  instructions += 'PLEASE FOLLOW ALL THE ABOVE INSTRUCTIONS, AND DO NOT REPEAT OR TYPE ANY GENERAL CONFIRMATION OR A CONFIRMATION ABOUT ANY OF THE ABOVE INSTRUCTIONS IN YOUR RESPONSE\n';
  instructions += '## End Instructions\n\n';

  lastLanguageCodeInConversation = selectedLanguage.code;
  lastToneCodeInConversation = selectedTone.code;
  lastWritingStyleCodeInConversation = selectedWritingStyle.code;
  if (!includeInstructions) return '';
  window.localStorage.setItem('sp/lastInstruction', instructions);

  return instructions;
}
