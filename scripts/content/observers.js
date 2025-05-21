/* global removeUpdateButton, setConversationWidth, debounceInitializeContinueButton, throttleReplaceAllInstructionsInConversation, getConversationIdFromUrl, initializeNavbar, throttleInitializeCanvasChanges, throttleUndoCanvasChanges, overrideModelSwitcher, sidebarNoteIsOpen, sidebarNoteInputWrapperWidth, throttleReplaceShareButtonWithConversationMenu, throttleSetPresentationsWidth, debounceAddMessageCharWordCounters, debounceAddMessageTimestamps, debounceInitializeCustomInstructionProfileSelector, errorUpgradeConfirmation, makeElementDraggable, disableDraggable, debounceCreateConversationMiniMap, debounceAddMemoryToggleButtonsToInput, debounceCreatePinButtons, cachedSettings, showImagePicker, closeMenus */

// eslint-disable-next-line no-unused-vars

// eslint-disable-next-line no-unused-vars
async function generalObserver() {
  const hasSubscription = await chrome.runtime.sendMessage({
    type: 'checkHasSubscription',
  });
  const observer = new MutationObserver((mutations, _observerInstance) => {
    customWidthObserverCallback();
    continueButtonObserverCallback();
    memoryTogglesObserverCallback();
    bloopObserverCallback();
    attachObserverCallback(hasSubscription);
    customInstructionProfileSelectorObserverCallback();
    canvasObserverCallback();
    // sidebarObserverCallback();
    topNavObserverCallback(mutations);
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

const sidebysideExpandSVG = '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="icon-lg text-token-main-surface-primary-inverse" viewBox="0 0 512 512"><path d="M183 295l-81.38 81.38l-47.03-47.03c-6.127-6.117-14.29-9.367-22.63-9.367c-4.117 0-8.279 .8086-12.25 2.43c-11.97 4.953-19.75 16.63-19.75 29.56v135.1C.0013 501.3 10.75 512 24 512h136c12.94 0 24.63-7.797 29.56-19.75c4.969-11.97 2.219-25.72-6.938-34.87l-47.03-47.03l81.38-81.38c9.375-9.375 9.375-24.56 0-33.94S192.4 285.7 183 295zM487.1 0h-136c-12.94 0-24.63 7.797-29.56 19.75c-4.969 11.97-2.219 25.72 6.938 34.87l47.04 47.03l-81.38 81.38c-9.375 9.375-9.375 24.56 0 33.94s24.56 9.375 33.94 0l81.38-81.38l47.03 47.03c6.127 6.117 14.3 9.35 22.63 9.35c4.117 0 8.275-.7918 12.24-2.413C504.2 184.6 512 172.9 512 159.1V23.1C512 10.75 501.3 0 487.1 0z"/></svg>';
const sidebysideCollapseSVG = '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="icon-lg text-token-main-surface-primary-inverse" viewBox="0 0 512 512"><path d="M488.1 23.03c-9.375-9.375-24.56-9.375-33.94 0l-81.38 81.38l-47.03-47.03c-6.127-6.117-14.3-9.35-22.63-9.35c-4.117 0-8.275 .7918-12.24 2.413c-11.97 4.953-19.75 16.63-19.75 29.56v135.1c0 13.25 10.74 23.1 24 23.1h136c12.94 0 24.63-7.797 29.56-19.75c4.969-11.97 2.219-25.72-6.938-34.87l-47.04-47.03l81.38-81.38C498.3 47.59 498.3 32.41 488.1 23.03zM215.1 272h-136c-12.94 0-24.63 7.797-29.56 19.75C45.47 303.7 48.22 317.5 57.37 326.6l47.04 47.03l-81.38 81.38c-9.375 9.375-9.375 24.56 0 33.94s24.56 9.375 33.94 0l81.38-81.38l47.03 47.03c6.127 6.117 14.29 9.367 22.63 9.367c4.117 0 8.279-.8086 12.25-2.43c11.97-4.953 19.75-16.63 19.75-29.56V296C239.1 282.7 229.3 272 215.1 272z"/></svg>';

function bloopObserverCallback() {
  const { sidebysideVoice } = cachedSettings;
  const existingSidebysideButton = document.querySelector('#sidebyside-voice-button');
  if (existingSidebysideButton) return;
  // check if div with class min-h-bloop w-max min-w-bloop is present
  const bloop = document.querySelector('div[class*="min-h-bloop w-max min-w-bloop"]');
  if (bloop) {
    const closeButtonSVG = document.querySelector('button svg path[d="M7.30286 6.80256C7.89516 6.21026 8.85546 6.21026 9.44775 6.80256L14.5003 11.8551L19.5529 6.80256C20.1452 6.21026 21.1055 6.21026 21.6978 6.80256C22.2901 7.39485 22.2901 8.35515 21.6978 8.94745L16.6452 14L21.6978 19.0526C22.2901 19.6449 22.2901 20.6052 21.6978 21.1974C21.1055 21.7897 20.1452 21.7897 19.5529 21.1974L14.5003 16.1449L9.44775 21.1974C8.85546 21.7897 7.89516 21.7897 7.30286 21.1974C6.71057 20.6052 6.71057 19.6449 7.30286 19.0526L12.3554 14L7.30286 8.94745C6.71057 8.35515 6.71057 7.39485 7.30286 6.80256Z"]');
    if (!closeButtonSVG) return;
    closeButtonSVG.closest('button').id = 'sidebyside-close-button';

    const closeButtonWrapper = closeButtonSVG?.closest('button')?.parentElement?.parentElement;
    if (!closeButtonWrapper) return;
    // clone the button
    const sidebysideButton = closeButtonWrapper?.cloneNode(true);
    sidebysideButton.id = 'sidebyside-voice-button';
    if (sidebysideVoice) {
      sidebysideButton.querySelector('svg').outerHTML = sidebysideExpandSVG;
    } else {
      sidebysideButton.querySelector('svg').outerHTML = sidebysideCollapseSVG;
    }

    sidebysideButton.addEventListener('click', async () => {
      const hasSubscription = await chrome.runtime.sendMessage({
        type: 'checkHasSubscription',
      });
      if (!hasSubscription) {
        const error = { title: 'This is a Pro feature', message: 'Using the Side by Side voice mode requires a Pro subscription. Upgrade to Pro to remove all limits.' };
        errorUpgradeConfirmation(error);
        return;
      }
      // update the settings
      setVoiceModeWrapper(!cachedSettings.sidebysideVoice);
      chrome.storage.local.set({ settings: { ...cachedSettings, sidebysideVoice: !cachedSettings.sidebysideVoice } });
    });
    // add the sidebyside button to the parent of the close button wrapper
    closeButtonWrapper?.parentElement?.appendChild(sidebysideButton);
    setVoiceModeWrapper(sidebysideVoice);
  }
}
async function setVoiceModeWrapper(sidebysideVoice) {
  const closeButtonSVG = document.querySelector('button svg path[d="M7.30286 6.80256C7.89516 6.21026 8.85546 6.21026 9.44775 6.80256L14.5003 11.8551L19.5529 6.80256C20.1452 6.21026 21.1055 6.21026 21.6978 6.80256C22.2901 7.39485 22.2901 8.35515 21.6978 8.94745L16.6452 14L21.6978 19.0526C22.2901 19.6449 22.2901 20.6052 21.6978 21.1974C21.1055 21.7897 20.1452 21.7897 19.5529 21.1974L14.5003 16.1449L9.44775 21.1974C8.85546 21.7897 7.89516 21.7897 7.30286 21.1974C6.71057 20.6052 6.71057 19.6449 7.30286 19.0526L12.3554 14L7.30286 8.94745C6.71057 8.35515 6.71057 7.39485 7.30286 6.80256Z"]');
  if (!closeButtonSVG) return;
  const closeButtonWrapper = closeButtonSVG?.closest('button')?.parentElement?.parentElement;
  if (!closeButtonWrapper) return;

  const voiceModeWrapper = closeButtonWrapper.closest('div[class*="top-0 z-50 flex h-full w-full"]');
  if (!voiceModeWrapper) return;
  voiceModeWrapper.classList.add('end-0', 'border', 'border-token-border-medium', 'rounded-2xl', 'shadow-lg');
  voiceModeWrapper.classList.remove('start-0');

  if (sidebysideVoice) {
    voiceModeWrapper.style = 'opacity: 1; will-change: auto; height: 500px; width: 300px; transform: scale(.5);cursor: grab;';
    makeElementDraggable(voiceModeWrapper);
  } else {
    voiceModeWrapper.style = 'opacity: 1; will-change: auto;';
    disableDraggable(voiceModeWrapper);
  }

  const sidebysideButton = document.querySelector('#sidebyside-voice-button');
  if (!sidebysideButton) return;
  // update the icon
  const sidebysideButtonSVG = sidebysideButton.querySelector('svg');
  if (sidebysideButtonSVG) {
    sidebysideButtonSVG.outerHTML = sidebysideVoice ? sidebysideExpandSVG : sidebysideCollapseSVG;
  }
}

function customWidthObserverCallback() {
  // Logic to determine when rendering is complete
  if (cachedSettings.customConversationWidth) {
    setConversationWidth(cachedSettings.conversationWidth);
  }
}

function memoryTogglesObserverCallback() {
  if (cachedSettings.showMemoryTogglesInInput) {
    debounceAddMemoryToggleButtonsToInput();
  }
}

function continueButtonObserverCallback() {
  if (cachedSettings.showFavoritePromptsButton) {
    debounceInitializeContinueButton();
  }
}
async function attachObserverCallback(hasSubscription) {
  const existingSelectFromGalleryButton = document.querySelector('#select-from-gallery-button');
  if (existingSelectFromGalleryButton) return;

  const uploadFileSVG = document.querySelector('div[data-radix-popper-content-wrapper] div[role="menuitem"] svg path[d="M18.0322 5.02393C17.7488 5.00078 17.3766 5 16.8 5H11.5002C11.3 6 11.0989 6.91141 10.8903 7.85409C10.7588 8.44955 10.6432 8.97304 10.3675 9.41399C10.1262 9.80009 9.80009 10.1262 9.41399 10.3675C8.97304 10.6432 8.44955 10.7588 7.85409 10.8903C7.81276 10.8994 7.77108 10.9086 7.72906 10.9179L5.21693 11.4762C5.1442 11.4924 5.07155 11.5001 5 11.5002V16.8C5 17.3766 5.00078 17.7488 5.02393 18.0322C5.04612 18.3038 5.0838 18.4045 5.109 18.454C5.20487 18.6422 5.35785 18.7951 5.54601 18.891C5.59546 18.9162 5.69617 18.9539 5.96784 18.9761C6.25118 18.9992 6.62345 19 7.2 19H10C10.5523 19 11 19.4477 11 20C11 20.5523 10.5523 21 10 21H7.16144C6.6343 21 6.17954 21 5.80497 20.9694C5.40963 20.9371 5.01641 20.8658 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3.13419 18.9836 3.06287 18.5904 3.03057 18.195C2.99997 17.8205 2.99998 17.3657 3 16.8385L3 11C3 8.92477 4.02755 6.93324 5.4804 5.4804C6.93324 4.02755 8.92477 3 11 3L16.8385 3C17.3657 2.99998 17.8205 2.99997 18.195 3.03057C18.5904 3.06287 18.9836 3.13419 19.362 3.32698C19.9265 3.6146 20.3854 4.07354 20.673 4.63803C20.8658 5.01641 20.9371 5.40963 20.9694 5.80497C21 6.17954 21 6.6343 21 7.16144V10C21 10.5523 20.5523 11 20 11C19.4477 11 19 10.5523 19 10V7.2C19 6.62345 18.9992 6.25118 18.9761 5.96784C18.9539 5.69617 18.9162 5.59546 18.891 5.54601C18.7951 5.35785 18.6422 5.20487 18.454 5.109C18.4045 5.0838 18.3038 5.04612 18.0322 5.02393ZM5.28014 9.41336L7.2952 8.96556C8.08861 8.78925 8.24308 8.74089 8.35381 8.67166C8.48251 8.59121 8.59121 8.48251 8.67166 8.35381C8.74089 8.24308 8.78925 8.08861 8.96556 7.2952L9.41336 5.28014C8.51014 5.59289 7.63524 6.15398 6.89461 6.89461C6.15398 7.63524 5.59289 8.51014 5.28014 9.41336ZM17 15C17 14.4477 17.4477 14 18 14C18.5523 14 19 14.4477 19 15V17H21C21.5523 17 22 17.4477 22 18C22 18.5523 21.5523 19 21 19H19V21C19 21.5523 18.5523 22 18 22C17.4477 22 17 21.5523 17 21V19H15C14.4477 19 14 18.5523 14 18C14 17.4477 14.4477 17 15 17H17V15Z"]');
  if (!uploadFileSVG) return;
  // closest div role=menuitem
  const attachButton = uploadFileSVG.closest('div[role="menuitem"]');
  if (!attachButton) return;
  if (attachButton.parentElement.innerText.includes('Delete')) return;
  // clone the button
  const selectFromGalleryButton = attachButton.cloneNode(true);
  selectFromGalleryButton.id = 'select-from-gallery-button';
  selectFromGalleryButton.innerHTML = `<div class="flex items-center justify-center text-token-text-tertiary h-5 w-5"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon-sm" fill="currentColor"><path d="M152 120c-26.51 0-48 21.49-48 48s21.49 48 48 48s48-21.49 48-48S178.5 120 152 120zM447.1 32h-384C28.65 32-.0091 60.65-.0091 96v320c0 35.35 28.65 64 63.1 64h384c35.35 0 64-28.65 64-64V96C511.1 60.65 483.3 32 447.1 32zM463.1 409.3l-136.8-185.9C323.8 218.8 318.1 216 312 216c-6.113 0-11.82 2.768-15.21 7.379l-106.6 144.1l-37.09-46.1c-3.441-4.279-8.934-6.809-14.77-6.809c-5.842 0-11.33 2.529-14.78 6.809l-75.52 93.81c0-.0293 0 .0293 0 0L47.99 96c0-8.822 7.178-16 16-16h384c8.822 0 16 7.178 16 16V409.3z"/></svg></div>Select from gallery  ${hasSubscription ? '' : '<span class="ms-auto text-white rounded-md bg-green-500 px-2 text-sm">Pro</span>'}</div>`;

  selectFromGalleryButton.addEventListener('click', async (e) => {
    closeMenus();

    // closest div[data-radix-popper-content-wrapper]
    const menu = e.target.closest('div[data-radix-popper-content-wrapper]');
    if (menu) {
      // Dispatch an Escape key event (Radix listens for this)
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      // remove pointer-events: none; from body style
      document.body.style.pointerEvents = 'auto';

      // Alternative: Simulate a click outside
      document.body.click();
    }

    if (!hasSubscription) {
      const error = { title: 'This is a Pro feature', message: 'Using the Gallery requires a Pro subscription. Upgrade to Pro to remove all limits.' };
      errorUpgradeConfirmation(error);
      return;
    }
    // open the image picker
    showImagePicker();
  });
  // add the button to the parent of the attach button
  attachButton.parentElement.appendChild(selectFromGalleryButton);
}

function customInstructionProfileSelectorObserverCallback() {
  if (cachedSettings.showCustomInstructionProfileSelector) {
    debounceInitializeCustomInstructionProfileSelector();
  }
}

function canvasObserverCallback() {
  const mains = document.querySelectorAll('main');
  const header = document.querySelector('header');
  // canvas has a div with style width: calc(-400px + 100vw);
  const canvasDiv = document.querySelector('div[style*="width: calc(-400px + 100vw)"]');
  // const codeMirrors = document.querySelectorAll('#codemirror');
  const isInOpenCanvas = mains.length >= 2 && header && header.parentElement.tagName === 'SECTION';

  const brush = document.querySelector('button svg path[d="M11.5047 10C12.8828 10 14 11.1172 14 12.4953C14 15.2919 10.9404 14.9905 9.00947 14.9905C9.00947 13.0596 8.70813 10 11.5047 10Z"]');
  const chart = document.querySelector('div[style*="width: 450px"]');

  // voice mode
  const voiceMode = document.querySelector('div[class*="lk-room-container"]');
  if (isInOpenCanvas || brush || chart || canvasDiv || voiceMode) {
    throttleInitializeCanvasChanges();
  } else {
    throttleUndoCanvasChanges();
  }
}

async function topNavObserverCallback(mutationsList) {
  removeUpdateButton();
  throttleSetPresentationsWidth();
  if (cachedSettings?.overrideModelSwitcher) {
    overrideModelSwitcher();
  } else {
    window.sessionStorage.removeItem('sp/selectedModel');
  }
  // eslint-disable-next-line no-restricted-syntax
  for (const mutation of mutationsList) {
    const conversationIdFromUrl = getConversationIdFromUrl();
    // Check added nodes in the mutation
    const main = document.querySelector('main');
    if (!main) continue;
    const articles = main.querySelectorAll('article');
    if (conversationIdFromUrl && articles.length === 0) continue;
    if (conversationIdFromUrl) {
      throttleReplaceShareButtonWithConversationMenu();
    }
    const userMessages = main.querySelectorAll('article div[data-message-author-role="user"]');
    if (conversationIdFromUrl && userMessages.length === 0) continue;
    if (!conversationIdFromUrl && articles.length === 0) {
      initializeNavbar();
      return;
    }

    // check if last user messages have innertext
    if (userMessages.length > 0 && !userMessages[userMessages.length - 1]?.querySelector('div.whitespace-pre-wrap')?.innerText) continue;

    if (mutation.target.nodeType === Node.ELEMENT_NODE && isArticleOrSubArticle(mutation.target)) {
      throttleReplaceAllInstructionsInConversation();

      if (cachedSettings.showMessageCharWordCount) {
        debounceAddMessageCharWordCounters();
      }
      if (cachedSettings.showMessageTimestamp) {
        debounceAddMessageTimestamps();
      }
      // eslint-disable-next-line no-await-in-loop
      await debounceCreatePinButtons();

      debounceCreateConversationMiniMap();
    }
  }
}

// eslint-disable-next-line no-unused-vars
function sidebarObserverCallback() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  const limitWidth = document.querySelector('#limit-width');
  if (!limitWidth) return;
  const appSidebarWidth = window.localStorage.getItem('sp/appSidebarWidth') || 260;
  const canvasIsOpen = window.localStorage.getItem('sp/canvasIsOpen') === 'true';
  if (canvasIsOpen) {
    limitWidth.parentElement.style.minWidth = '0px';
  } else {
    limitWidth.parentElement.style.width = `${appSidebarWidth}px`;
  }
}
// // mouse down event listener
// document.body.addEventListener('mousedown', (event) => {
//   window.localStorage.setItem('sp/mouseDown', 'true');
//   const limitWidth = document.querySelector('#limit-width');
//   if (!limitWidth) return;
//   // if clicked on the limitWidth parent, set min-width to 0px, so we can resize to smaller width
//   if (event.target === limitWidth.parentElement) {
//     limitWidth.parentElement.style.minWidth = '0px';
//     limitWidth.parentElement.style.width = '260px';
//   }
// });
// // mouse up event listener
// document.body.addEventListener('mouseup', () => {
//   window.localStorage.removeItem('sp/mouseDown');
// });

function resizeObserverCallback(width, settingKey) {
  // if mouse is not down, return
  if (settingKey.startsWith('sp/')) {
    window.localStorage.setItem(settingKey, Math.round(width));
  } else {
    const settings = cachedSettings;
    settings[settingKey] = Math.round(width);
    chrome.storage.local.set({ settings });
  }
}
// eslint-disable-next-line no-unused-vars
function elementResizeObserver(element, settingKey) {
  const resizeObserver = new ResizeObserver((entries) => {
    if (window.localStorage.getItem('sp/mouseDown') !== 'true') return;
    if (entries.length === 0) return;
    if (!entries[0].contentRect) return;
    if (entries[0].target !== element) return;
    const { width } = entries[0].contentRect;
    // when element is removed from the DOM, the width is 0. In this case, we don't want to save the width
    if (width === 0) return;

    resizeObserverCallback(width, settingKey);
  });
  resizeObserver.observe(element);
}

// eslint-disable-next-line no-unused-vars
function mainResizeObserver() {
  const resizeObserver = new ResizeObserver(() => {
    const sidebarNoteInputWrapper = document.querySelector('#sidebar-note-input-wrapper');
    const onGPTs = window.location.pathname.includes('/gpts');
    const onAdmin = window.location.pathname.includes('/admin');
    const onProject = window.location.pathname.startsWith('/g/g-p-') && window.location.pathname.endsWith('/project');

    const floatingButtonWrapper = document.querySelector('#floating-button-wrapper');
    if (sidebarNoteInputWrapper && sidebarNoteIsOpen && !onGPTs && !onAdmin && !onProject) {
      if (floatingButtonWrapper) floatingButtonWrapper.style.right = `calc(1rem + ${main.offsetWidth * (sidebarNoteInputWrapperWidth / 100)}px)`;
    }
  });
  const main = document.querySelector('main');
  resizeObserver.observe(main);
}
function isArticleOrSubArticle(element) {
  while (element) {
    if (element.tagName === 'ARTICLE') { // } && element.querySelector('[data-message-author-role="user"]')) {
      return true;
    }
    element = element.parentElement;
  }
  return false;
}
