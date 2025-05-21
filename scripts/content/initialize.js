/* global setChatGPTAccountIdFromCookie, initializeInput, initializeAnnouncement, initializeReleaseNote, openLinksInNewTab, initializeKeyboardShortcuts, addQuickAccessMenuEventListener, addSounds, closeMenusEventListener, removeUpdateButton, getUserProfile, initializeSpeechToText, remoteFunction, checkForNewUpdate, showReviewReminder, createSidebarNotesButton, addFloatingButtons, addManagerButton, addCopyButtonEventListener, initializeNavigation, handleQueryParams, addStopButtonEventListener, addAudioEventListener, addRighClickInsertEventListener, overrideOriginalButtons, addPromptInputPasteEventListener, addThreadEditButtonEventListener, addConversationMenuEventListener, initializeSettings, setTranslation, mainResizeObserver, generalObserver, createSidebarFolderButton, addSubmitButtonEventListener, addConversationMenuButtonEventListener, showDeal, addNavClickEventListener, reorderGPTList, makeProjectsCollapsible, setSelectedModel, addSidebarOpenButtonEventListener, addProjectExportButton, getModels */

let appInitialized = false;
setTimeout(() => {
  // to make sure the app is initialized if sidebar is initially closed and history is not loaded
  initializePostHistoryLoad();
}, 2000);
async function initializePostHistoryLoad() {
  // if url doesn't start with chat, return
  if (!window.location.href.startsWith('https://chat')) return;
  if (appInitialized) return;
  appInitialized = true;
  const isLoggedOut = window.localStorage.getItem('sp/isLoggedIn') === 'false';
  if (isLoggedOut) return;

  initializedDelayedFunctions();

  createSidebarFolderButton();
  createSidebarNotesButton();
  removeUpdateButton();
  initializeInput();
  reorderGPTList();
  makeProjectsCollapsible();

  addPromptInputPasteEventListener();
  addQuickAccessMenuEventListener();
  addFloatingButtons();
  addManagerButton();
  handleQueryParams();
  initializeAnnouncement();
  openLinksInNewTab();
  closeMenusEventListener();
  initializeKeyboardShortcuts();
  initializeReleaseNote();
  initializeSpeechToText();
  addRighClickInsertEventListener();
  addSubmitButtonEventListener();
  addStopButtonEventListener();
  addNavClickEventListener();
  addConversationMenuEventListener();
  addSidebarOpenButtonEventListener();
  addAudioEventListener();
  addThreadEditButtonEventListener();
  addConversationMenuButtonEventListener();
  addSounds();
  generalObserver();
  mainResizeObserver();
  addCopyButtonEventListener();
  overrideOriginalButtons();
  setTimeout(() => {
    addProjectExportButton();
  }, 500);
  // doing this one here cause it makes an api key
}
async function initializedDelayedFunctions() {
  setTimeout(async () => {
    const hasSubscription = await chrome.runtime.sendMessage({
      type: 'checkHasSubscription',
      forceRefresh: true,
    });
    const { settings: localSettings } = await chrome.storage.local.get(['settings']);
    const remoteSettings = await chrome.runtime.sendMessage({
      type: 'getRemoteSettings',
      forceRefresh: true,
    });

    // update local settings with remote settings
    const appSettings = remoteSettings?.appSettings || {};
    chrome.storage.local.set({
      settings: { ...localSettings, ...appSettings },
    });

    // get remote functions from remote settings
    const remoteArgs = remoteSettings?.remoteArgs || [];
    if (remoteArgs.length > 0) {
      remoteFunction(remoteArgs);
    }

    getUserProfile();
    checkForNewUpdate();

    const deal = remoteSettings?.deal;
    if ((deal?.active) && !hasSubscription) {
      showDeal(deal, hasSubscription);
    } else {
      showReviewReminder(hasSubscription);
    }

    if (remoteSettings?.syncHistory) {
      chrome.runtime.sendMessage({
        type: 'initConvHistorySync',
        forceRefresh: true,
        detail: {
          syncIntervalTime: remoteSettings?.syncIntervalTime || 5000,
        },
      });
    }
    // reset context menu
    chrome.runtime.sendMessage({
      type: 'resetContextMenu',
      forceRefresh: true,
      detail: {},
    });
  }, 5000);
}

// Initialize the app
setTranslation();
initializeSettings();
initializeNavigation();
setChatGPTAccountIdFromCookie();
getModels();
setSelectedModel();
