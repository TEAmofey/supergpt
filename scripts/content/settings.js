/* global isFirefox, isOpera, isWindows, createModal, createReleaseNoteModal, createSwitch, refreshPage, openUpgradeModal, dropdown, addDropdownEventListener, speechToTextLanguageList, updateAccountUserSetting, getVoices, initializeContinueButton, capitalize, translate, isOnNewChatPage, loadSidebarFolders, initializeCustomInstructionProfileSelector, reorderGPTList, deleteConversation, removeConversationElements, archiveConversation, createConversationMiniMap, articleObservers, addMemoryTogglesToPromptInput */

let settingTestAudio;
// eslint-disable-next-line no-unused-vars
let cachedSettings = {};

// eslint-disable-next-line no-unused-vars
function createSettingsModal(initialTab = 'general') {
  const bodyContent = settingsModalContent(initialTab);
  const actionsBarContent = settingsModalActions();
  createModal('Settings', 'You can change the Superpower settings here', bodyContent, actionsBarContent, false);
}
const inactiveTabElementStyles = 'border-right: 1px solid; border-bottom:2px solid; border-top-right-radius: 16px; min-width:150px;';
const activeTabElementStyles = 'border:solid 2px ; border-bottom:0; border-top-right-radius: 16px;min-width:150px;';

const inactiveTabElementClasses = 'bg-token-sidebar-surface-primary text-sm text-token-text-primary px-2 py-3 h-full border-token-border-medium';
const activeTabElementClasses = 'bg-token-sidebar-surface-secondary text-sm text-token-text-primary px-2 py-3 h-full border-token-border-medium active-tab';

function selectedSettingsTabContent(selectedTab, hasSubscription) {
  switch (selectedTab) {
    case 'general':
      return generalTabContent(hasSubscription);
    case 'conversation':
      return conversationTabContent(hasSubscription);
    case 'folders':
      return foldersTabContent(hasSubscription);
    case 'voice':
      return textToSpeechTabContent(hasSubscription);
    case 'prompt-input':
      return promptInputTabContent(hasSubscription);
    case 'splitter':
      return splitterTabContent(hasSubscription);
    default:
      return generalTabContent(hasSubscription);
  }
}
function settingsModalContent(initialTab = 'general') {
  // const settingsTabs = ['General', 'Auto Sync', 'History', 'Conversation', 'Voice', 'Prompt Input', 'Models', 'Custom Instruction', 'Export', 'Splitter', 'Newsletter'];

  const settingsTabs = ['general', 'conversation', 'folders', 'voice', 'prompt-input', 'splitter'];
  let activeTab = initialTab;
  window.location.hash = `setting/${activeTab}`;
  // create history modal content
  const content = document.createElement('div');
  content.style = 'display: flex; flex-direction: column; justify-content: start; align-items: start;width:100%; height: 100%;';
  const tabs = document.createElement('div');
  tabs.style = 'display: flex; flex-direction: row; justify-content: start; align-items: center; width: 100%; z-index:1000;overflow:hidden; overflow-x:scroll;-ms-overflow-style: none; scrollbar-width: none;';
  // hide scrollbar for chrome
  tabs.classList = 'scrollbar-hide bg-token-sidebar-surface-primary';
  chrome.runtime.sendMessage({
    type: 'checkHasSubscription',
  }, (hasSubscription) => {
    settingsTabs.forEach((tab) => {
      const tabButton = document.createElement('button');
      tabButton.classList = activeTab === tab ? activeTabElementClasses : inactiveTabElementClasses;
      tabButton.style = activeTab === tab ? activeTabElementStyles : inactiveTabElementStyles;

      tabButton.textContent = translate(capitalize(tab).replace('-', ' '));
      tabButton.addEventListener('click', () => {
        window.location.hash = `setting/${tab}`;
        activeTab = tab;
        const activeTabElemet = document.querySelector('.active-tab');
        activeTabElemet.classList = inactiveTabElementClasses;
        activeTabElemet.style = inactiveTabElementStyles;
        tabButton.classList = activeTabElementClasses;
        tabButton.style = activeTabElementStyles;
        const settingsModalTabContent = document.querySelector('#settings-modal-tab-content');
        const newContent = selectedSettingsTabContent(activeTab, hasSubscription);
        settingsModalTabContent.parentNode.replaceChild(newContent, settingsModalTabContent);
      });
      tabs.appendChild(tabButton);
    });
    const tabsLastChild = document.createElement('div');
    tabsLastChild.classList = 'w-full h-full border-b-2 border-token-border-xheavy';
    tabs.appendChild(tabsLastChild);
    content.appendChild(selectedSettingsTabContent(activeTab, hasSubscription));
  });

  content.appendChild(tabs);
  return content;
}
// eslint-disable-next-line no-unused-vars
function generalTabContent(hasSubscription = false) {
  const content = document.createElement('div');
  content.id = 'settings-modal-tab-content';
  content.style = 'display: flex; justify-content: start; align-items: start;overflow-y: auto; width:100%; padding: 16px; height: 100%;padding-bottom:80px;';
  const leftContent = document.createElement('div');
  leftContent.style = 'display: flex; flex-direction: column; justify-content: start; align-items: start; width: 50%;padding-right: 8px;';
  const rightContent = document.createElement('div');
  rightContent.style = 'display: flex; flex-direction: column; justify-content: start; align-items: end; width: 50%;padding-left: 8px;';

  // dark mode
  const darkModeSwitchWrapper = document.createElement('div');
  darkModeSwitchWrapper.style = 'display: flex; flex-direction: column; justify-content: start; align-items: start; width: 100%; margin: 8px 0;';
  const darkModeSwitch = document.createElement('div');
  darkModeSwitch.style = 'display: flex; flex-direction: row; justify-content: start; align-items: center; width: 100%; margin: 8px 0;';
  darkModeSwitch.textContent = 'Dark mode';
  const darkModeLabel = document.createElement('label');
  darkModeLabel.classList = 'sp-switch';
  const darkModeInput = document.createElement('input');
  darkModeInput.type = 'checkbox';
  darkModeInput.checked = !!document.querySelector('html').classList.contains('dark');
  darkModeInput.addEventListener('change', () => {
    if (document.querySelector('html').classList.contains('dark')) {
      document.querySelector('html').classList.replace('dark', 'light');
      document.querySelector('html').style = 'color-scheme: light;';
      window.localStorage.setItem('theme', 'light');
    } else {
      document.querySelector('html').classList.replace('light', 'dark');
      document.querySelector('html').style = 'color-scheme: dark;';
      window.localStorage.setItem('theme', 'dark');
    }
    refreshPage();
  });
  const darkModeSlider = document.createElement('span');
  darkModeSlider.classList = 'sp-switch-slider round';

  darkModeLabel.appendChild(darkModeInput);
  darkModeLabel.appendChild(darkModeSlider);
  darkModeSwitch.appendChild(darkModeLabel);
  darkModeSwitchWrapper.appendChild(darkModeSwitch);
  leftContent.appendChild(darkModeSwitchWrapper);

  // autoReloadOnUpdate
  const autoReloadOnUpdateSwitch = createSwitch('Auto Reload on Update', 'Automatically reload all ChatGPT tabs when extension is updated', 'autoReloadOnUpdate', true);
  leftContent.appendChild(autoReloadOnUpdateSwitch);

  // release note
  const hideReleaseNoteSwitch = createSwitch('Hide Release Note', 'Don’t show release note when extension is updated', 'hideReleaseNote', true);
  leftContent.appendChild(hideReleaseNoteSwitch);

  const hideUpdateNotificationSwitch = createSwitch('Hide Update Notification', 'Don’t show update notification when new version is available', 'hideUpdateNotification', false);
  leftContent.appendChild(hideUpdateNotificationSwitch);

  // daily newsletter
  const dailyNewsletterSwitch = createSwitch('Hide Daily Newsletter', 'Do not show the daily newsletter popup inside ChatGPT.', 'hideNewsletter', false);
  leftContent.appendChild(dailyNewsletterSwitch);

  // discord widget
  const discordWidget = document.createElement('div');
  discordWidget.innerHTML = '<iframe style="border-radius:8px;width:350px; max-width:100%;height:400px;" src="https://discord.com/widget?id=1083455984489476220&theme=dark" allowtransparency="true" frameborder="0" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"></iframe>';
  rightContent.appendChild(discordWidget);
  content.appendChild(leftContent);
  content.appendChild(rightContent);
  // extra links
  const linkWrapper = document.createElement('div');
  // linkWrapper.style = 'display: flex; flex-direction: row; flex-wrap:wrap; justify-content: start; align-items: start; width: 100%; padding: 8px 16px; position:absolute; bottom:0; left:0;background-color:#0b0d0e;border-top:1px solid #565869;';
  linkWrapper.classList = 'text-xs text-token-text-tertiary flex justify-start items-center flex-wrap w-full px-4 py-2 bg-token-sidebar-surface-primary border-t border-token-border-medium absolute bottom-0 start-0';

  // add a link to Updates and FAQ
  const updatesLink = document.createElement('a');
  updatesLink.href = 'https://help.openai.com/en/collections/3742473-chatgpt';
  updatesLink.target = '_blank';
  updatesLink.textContent = 'Get help ➜';
  updatesLink.style = 'color: #999; font-size: 12px; margin: 8px 0;min-width: 20%;text-align:center;padding-right: 8px;padding-right:';
  linkWrapper.appendChild(updatesLink);

  // add link for sponsorship
  const sponsorLink = document.createElement('a');
  sponsorLink.href = 'https://www.passionfroot.me/superpower';
  sponsorLink.target = '_blank';
  sponsorLink.textContent = 'Partner with us ➜';
  sponsorLink.style = 'color: #999; font-size: 12px; margin: 8px 0;min-width: 20%;text-align:center;padding-right: 8px;';
  linkWrapper.appendChild(sponsorLink);

  // add link for FAQ
  const faqLink = document.createElement('a');
  faqLink.href = 'https://ezi.notion.site/Superpower-ChatGPT-FAQ-9d43a8a1c31745c893a4080029d2eb24';
  faqLink.target = '_blank';
  faqLink.textContent = 'FAQ ➜';
  faqLink.style = 'color: #999; font-size: 12px; margin: 8px 0;min-width: 20%;text-align:center;padding-right: 8px;';
  linkWrapper.appendChild(faqLink);

  // add link for YouTube
  const youtubeLink = document.createElement('a');
  youtubeLink.href = 'https://www.youtube.com/@spchatgpt';
  youtubeLink.target = '_blank';
  youtubeLink.textContent = 'YouTube ➜';
  youtubeLink.style = 'color: #999; font-size: 12px; margin: 8px 0;min-width: 20%;text-align:center;padding-right: 8px;';
  linkWrapper.appendChild(youtubeLink);

  // add link affiliate
  const affiliateLink = document.createElement('a');
  affiliateLink.href = 'https://spchatgpt.com/affiliate';
  affiliateLink.target = '_blank';
  affiliateLink.textContent = 'Affiliate ➜';
  affiliateLink.style = 'color: #999; font-size: 12px; margin: 8px 0;min-width: 20%;text-align:center;padding-right: 8px;';
  linkWrapper.appendChild(affiliateLink);

  content.appendChild(linkWrapper);

  return content;
}

function setConversationWidth(newValue) {
  const articles = document.querySelectorAll('main article');
  if (articles.length === 0 && !isOnNewChatPage()) return;
  const elements = Array.from(document.querySelectorAll('.md\\:max-w-3xl, .lg\\:max-w-\\[40rem\\], .xl\\:max-w-\\[48rem\\]'));
  elements.forEach((el) => {
    el.style.maxWidth = `${newValue}%`;
  });
  // class=_conversationTurnWrapper_qp8iq_202
  const newElements = Array.from(document.querySelectorAll('[class*="_conversationTurnWrapper_"]'));
  newElements.forEach((el) => {
    el.style.width = `${newValue}%`;
  });
  const newNewElements = Array.from(document.querySelectorAll('[class*="[--thread-content-max-width:32rem]"]'));
  newNewElements.forEach((el) => {
    // if element is under <div data-paragen-root="true" skip
    if (el.closest('div[data-paragen-root="true"]')) return;
    el.style.maxWidth = `${newValue}%`;
    el.style.marginLeft = 'auto';
    el.style.marginRight = 'auto';
  });

  const footer = document.querySelector('[class*="_footer_"]');
  if (footer) {
    footer.style.width = `${newValue}%`;
  }
}
function resetConversationWidth() {
  const articles = document.querySelectorAll('main article');
  if (articles.length === 0 && !isOnNewChatPage()) return;
  const elements = Array.from(document.querySelectorAll('.md\\:max-w-3xl, .lg\\:max-w-\\[40rem\\], .xl\\:max-w-\\[48rem\\]'));
  elements.forEach((el) => {
    el.style.removeProperty('max-width');
  });
  const newElements = Array.from(document.querySelectorAll('[class*="_conversationTurnWrapper_"]'));
  newElements.forEach((el) => {
    el.style.removeProperty('width');
  });
  const footer = document.querySelector('[class*="_footer_"]');
  if (footer) {
    footer.style.removeProperty('width');
  }
}
function toggleCustomWidthSwitch(customConversationWidth) {
  const customWidthInput = document.querySelector('#conversation-width-input');
  const conversationWidthDetail = document.querySelector('#conversation-width-detail');
  customWidthInput.disabled = !customConversationWidth;
  // get all elements with these classes: md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem]
  if (customConversationWidth) {
    setConversationWidth(cachedSettings.conversationWidth);
    conversationWidthDetail.classList = 'flex flex-row justify-start items-center w-full mb-2 text-token-text-secondary opacity-100';
  } else {
    resetConversationWidth();
    conversationWidthDetail.classList = 'flex flex-row justify-start items-center w-full mb-2 text-token-text-secondary opacity-50';
  }
}

// eslint-disable-next-line no-unused-vars
function conversationTabContent(hasSubscription = false) {
  const content = document.createElement('div');
  content.id = 'settings-modal-tab-content';
  content.style = 'display: flex; flex-direction: column; justify-content: start; align-items: start;overflow-y: auto; width:100%; padding: 16px; margin-width:100%; height: 100%;';

  const {
    customConversationWidth,
    conversationWidth,
    autoDelete,
    autoDeleteNumDays,
    autoDeleteExcludeFolders,
    autoArchive,
    autoArchiveNumDays,
    autoArchiveExcludeFolders,
  } = cachedSettings;

  // conversation width
  const customConversationWidthSwitch = createSwitch('Custom Conversation Width', 'OFF: Use default / ON: Set Conversation Width (30%-90%) (<a style="text-decoration:underline; " href="https://youtu.be/UYX-J4ybB14?si=uq7UwE92uds7pIAr" target="blank">Learn More</a>)', 'customConversationWidth', false, toggleCustomWidthSwitch);
  content.appendChild(customConversationWidthSwitch);

  const conversationWidthDetail = document.createElement('div');
  conversationWidthDetail.id = 'conversation-width-detail';
  conversationWidthDetail.classList = `flex flex-row justify-start items-center w-full mb-2 text-token-text-secondary opacity-${customConversationWidth ? '100' : '50'}`;
  content.appendChild(conversationWidthDetail);

  const downRightArrow = document.createElement('div');
  downRightArrow.classList = 'flex flex-row justify-start items-center me-2';
  downRightArrow.style = 'transform: scale(-1, 1);';
  downRightArrow.textContent = '↲';
  conversationWidthDetail.appendChild(downRightArrow);

  const conversationWidthPreLabel = document.createElement('div');
  conversationWidthPreLabel.classList = 'flex flex-row justify-start items-center me-2';
  conversationWidthPreLabel.textContent = 'Width';
  conversationWidthDetail.appendChild(conversationWidthPreLabel);

  const conversationWidthInput = document.createElement('input');
  conversationWidthInput.id = 'conversation-width-input';
  conversationWidthInput.type = 'number';
  conversationWidthInput.classList = 'max-w-full min-w-20 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-token-main-surface-secondary disabled:opacity-40 text-token-text-primary';
  conversationWidthInput.disabled = !customConversationWidth;
  conversationWidthInput.value = conversationWidth;
  conversationWidthInput.min = 30;
  conversationWidthInput.max = 90;
  conversationWidthInput.addEventListener('change', () => {
    const curConversationWidthInput = document.querySelector('#conversation-width-input');
    let newValue = Math.round(curConversationWidthInput.value);
    curConversationWidthInput.value = newValue;
    // make sure the value is between 30 and 90
    if (newValue < 30) {
      newValue = 30;
    }
    if (newValue > 90) {
      newValue = 90;
    }

    setConversationWidth(newValue);

    chrome.storage.local.set({ settings: { ...cachedSettings, conversationWidth: newValue, customConversationWidth: true } });
  });
  conversationWidthInput.addEventListener('input', () => {
    const curConversationWidthInput = document.querySelector('#conversation-width-input');
    let newValue = Math.round(curConversationWidthInput.value);
    curConversationWidthInput.value = newValue;
    // make sure the value is between 30 and 90
    if (newValue < 30) {
      newValue = 30;
    }
    if (newValue > 90) {
      newValue = 90;
    }
    setConversationWidth(newValue);

    chrome.storage.local.set({ settings: { ...cachedSettings, conversationWidth: newValue, customConversationWidth: true } });
  });
  conversationWidthDetail.appendChild(conversationWidthInput);

  const conversationWidthPostLabel = document.createElement('div');
  conversationWidthPostLabel.classList = 'flex flex-row justify-start items-center ms-2';
  conversationWidthPostLabel.textContent = '%';
  conversationWidthDetail.appendChild(conversationWidthPostLabel);

  // auto delete
  const autoDeleteSwitch = createSwitch('Auto Delete', 'Automatically delete old conversations after selected # of days', 'autoDelete', false, toggleAutoDelete, hasSubscription ? ['New'] : ['New', '⚡️ Requires Pro Account'], !hasSubscription);
  content.appendChild(autoDeleteSwitch);

  // add row for details
  const autoDeleteDetails = document.createElement('div');
  autoDeleteDetails.id = 'auto-delete-details';
  autoDeleteDetails.classList = `flex flex-row justify-start items-center w-full mb-2 text-token-text-secondary opacity-${autoDelete ? '100' : '50'}`;
  content.appendChild(autoDeleteDetails);

  // add a down right arrow
  const autoDeleteDownRightArrow = document.createElement('div');
  autoDeleteDownRightArrow.classList = 'flex flex-row justify-start items-center me-2';
  autoDeleteDownRightArrow.style = 'transform: scale(-1, 1);';
  autoDeleteDownRightArrow.textContent = '↲';
  autoDeleteDetails.appendChild(autoDeleteDownRightArrow);

  const autoDeleteNumDaysPreLabel = document.createElement('div');
  autoDeleteNumDaysPreLabel.classList = 'flex flex-row justify-start items-center me-2';
  autoDeleteNumDaysPreLabel.textContent = 'Delete after';
  autoDeleteDetails.appendChild(autoDeleteNumDaysPreLabel);
  // add an input for the number of days
  const autoDeleteInput = document.createElement('input');
  autoDeleteInput.id = 'auto-delete-input';
  autoDeleteInput.type = 'number';
  autoDeleteInput.classList = 'max-w-full min-w-20 px-4 py-2 me-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-token-main-surface-secondary disabled:opacity-40 text-token-text-primary';
  autoDeleteInput.disabled = !autoDelete;
  autoDeleteInput.value = autoDeleteNumDays;
  autoDeleteInput.min = 1;
  autoDeleteInput.max = 365;
  autoDeleteInput.addEventListener('change', () => {
    const curAutoDeleteInput = document.querySelector('#auto-delete-input');
    let newValue = Math.round(curAutoDeleteInput.value);
    curAutoDeleteInput.value = newValue;
    // make sure the value is between 1 and 365
    if (newValue < 1) {
      newValue = 1;
    }
    if (newValue > 365) {
      newValue = 365;
    }

    chrome.storage.local.set({ settings: { ...cachedSettings, autoDeleteNumDays: newValue } });
  });
  autoDeleteInput.addEventListener('input', () => {
    const curAutoDeleteInput = document.querySelector('#auto-delete-input');
    let newValue = Math.round(curAutoDeleteInput.value);
    curAutoDeleteInput.value = newValue;
    // make sure the value is between 1 and 365
    if (newValue < 1) {
      newValue = 1;
    }
    if (newValue > 365) {
      newValue = 365;
    }

    chrome.storage.local.set({ settings: { ...cachedSettings, autoDeleteNumDays: newValue } });
  });
  autoDeleteDetails.appendChild(autoDeleteInput);

  const autoDeleteNumDaysPostLabel = document.createElement('div');
  autoDeleteNumDaysPostLabel.classList = 'flex flex-row justify-start items-center ms-2';
  autoDeleteNumDaysPostLabel.textContent = 'days';
  autoDeleteDetails.appendChild(autoDeleteNumDaysPostLabel);

  // add a lable and checkbox for autoDeleteExcludeFolders: Skip conversations in folders
  const dividerDash = document.createElement('div');
  dividerDash.classList = 'mx-4';
  dividerDash.innerText = '—';
  autoDeleteDetails.appendChild(dividerDash);

  const autoDeleteExcludeFoldersLabel = document.createElement('label');
  autoDeleteExcludeFoldersLabel.classList = 'flex flex-row justify-start items-center';
  autoDeleteExcludeFoldersLabel.textContent = 'Skip conversations in folders';
  const autoDeleteExcludeFoldersInput = document.createElement('input');
  autoDeleteExcludeFoldersInput.id = 'auto-delete-exclude-folders-input';
  autoDeleteExcludeFoldersInput.classList = 'ms-2';
  autoDeleteExcludeFoldersInput.type = 'checkbox';
  autoDeleteExcludeFoldersInput.disabled = !autoDelete;
  autoDeleteExcludeFoldersInput.checked = autoDeleteExcludeFolders;
  autoDeleteExcludeFoldersInput.addEventListener('change', () => {
    chrome.storage.local.set({ settings: { ...cachedSettings, autoDeleteExcludeFolders: autoDeleteExcludeFoldersInput.checked } });
  });
  autoDeleteExcludeFoldersLabel.appendChild(autoDeleteExcludeFoldersInput);
  autoDeleteDetails.appendChild(autoDeleteExcludeFoldersLabel);

  // auto archive
  const autoArchiveSwitch = createSwitch('Auto Archive', 'Automatically archive old conversations after selected # of days', 'autoArchive', false, toggleAutoArchive, hasSubscription ? ['New'] : ['New', '⚡️ Requires Pro Account'], !hasSubscription);
  content.appendChild(autoArchiveSwitch);

  // add row for details
  const autoArchiveDetails = document.createElement('div');
  autoArchiveDetails.id = 'auto-archive-details';
  autoArchiveDetails.classList = `flex flex-row justify-start items-center w-full mb-2 text-token-text-secondary opacity-${autoArchive ? '100' : '50'}`;
  content.appendChild(autoArchiveDetails);

  // add a down right arrow
  const autoArchiveDownRightArrow = document.createElement('div');
  autoArchiveDownRightArrow.classList = 'flex flex-row justify-start items-center me-2';
  autoArchiveDownRightArrow.style = 'transform: scale(-1, 1);';
  autoArchiveDownRightArrow.textContent = '↲';
  autoArchiveDetails.appendChild(autoArchiveDownRightArrow);

  const autoArchiveNumDaysPreLabel = document.createElement('div');
  autoArchiveNumDaysPreLabel.classList = 'flex flex-row justify-start items-center me-2';
  autoArchiveNumDaysPreLabel.textContent = 'Archive after';
  autoArchiveDetails.appendChild(autoArchiveNumDaysPreLabel);
  // add an input for the number of days
  const autoArchiveInput = document.createElement('input');
  autoArchiveInput.id = 'auto-archive-input';
  autoArchiveInput.type = 'number';
  autoArchiveInput.classList = 'max-w-full min-w-20 px-4 py-2 me-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-token-main-surface-secondary disabled:opacity-40 text-token-text-primary';
  autoArchiveInput.disabled = !autoArchive;
  autoArchiveInput.value = autoArchiveNumDays;
  autoArchiveInput.min = 1;
  autoArchiveInput.max = 365;
  autoArchiveInput.addEventListener('change', () => {
    const curAutoArchiveInput = document.querySelector('#auto-archive-input');
    let newValue = Math.round(curAutoArchiveInput.value);
    curAutoArchiveInput.value = newValue;
    // make sure the value is between 1 and 365
    if (newValue < 1) {
      newValue = 1;
    }
    if (newValue > 365) {
      newValue = 365;
    }

    chrome.storage.local.set({ settings: { ...cachedSettings, autoArchiveNumDays: newValue } });
  });
  autoArchiveInput.addEventListener('input', () => {
    const curAutoArchiveInput = document.querySelector('#auto-archive-input');
    let newValue = Math.round(curAutoArchiveInput.value);
    curAutoArchiveInput.value = newValue;
    // make sure the value is between 1 and 365
    if (newValue < 1) {
      newValue = 1;
    }
    if (newValue > 365) {
      newValue = 365;
    }

    chrome.storage.local.set({ settings: { ...cachedSettings, autoArchiveNumDays: newValue } });
  });
  autoArchiveDetails.appendChild(autoArchiveInput);

  const autoArchiveNumDaysPostLabel = document.createElement('div');
  autoArchiveNumDaysPostLabel.classList = 'flex flex-row justify-start items-center ms-2';
  autoArchiveNumDaysPostLabel.textContent = 'days';
  autoArchiveDetails.appendChild(autoArchiveNumDaysPostLabel);

  // add a lable and checkbox for autoArchiveExcludeFolders: Skip conversations in folders
  const dividerDash2 = document.createElement('div');
  dividerDash2.classList = 'mx-4';
  dividerDash2.innerText = '—';
  autoArchiveDetails.appendChild(dividerDash2);

  const autoArchiveExcludeFoldersLabel = document.createElement('label');
  autoArchiveExcludeFoldersLabel.classList = 'flex flex-row justify-start items-center';
  autoArchiveExcludeFoldersLabel.textContent = 'Skip conversations in folders';
  const autoArchiveExcludeFoldersInput = document.createElement('input');
  autoArchiveExcludeFoldersInput.id = 'auto-archive-exclude-folders-input';
  autoArchiveExcludeFoldersInput.classList = 'ms-2';
  autoArchiveExcludeFoldersInput.type = 'checkbox';
  autoArchiveExcludeFoldersInput.disabled = !autoArchive;
  autoArchiveExcludeFoldersInput.checked = autoArchiveExcludeFolders;
  autoArchiveExcludeFoldersInput.addEventListener('change', () => {
    chrome.storage.local.set({ settings: { ...cachedSettings, autoArchiveExcludeFolders: autoArchiveExcludeFoldersInput.checked } });
  });
  autoArchiveExcludeFoldersLabel.appendChild(autoArchiveExcludeFoldersInput);
  autoArchiveDetails.appendChild(autoArchiveExcludeFoldersLabel);

  const showMiniMapSwitch = createSwitch('Show Mini Map', 'Show a mini map of the full conversation on the right side of the conversation', 'showMiniMap', false, toggleShowMiniMap, ['New']);
  content.appendChild(showMiniMapSwitch);

  const showSidebarNoteButtonSwitch = createSwitch('Show Sidebar Note Button', 'Show the note button on the right edge of screen', 'showSidebarNoteButton', true, toggleSidebarNoteVisibilitySwitch, ['New']);
  content.appendChild(showSidebarNoteButtonSwitch);

  const overrideModelSwitcherSwitch = createSwitch('Override Model Switcher', 'Replace the default model switcher to show all available models', 'overrideModelSwitcher', false, refreshPage, ['Requires Refresh']);
  content.appendChild(overrideModelSwitcherSwitch);

  const showLanguageSelectorSwitch = createSwitch('Show Language Selector', 'Show the language selector in top nav', 'showLanguageSelector', false, toggleShowLanguageSelector);
  content.appendChild(showLanguageSelectorSwitch);

  const showWritingStyleSelectorSwitch = createSwitch('Show Writing Style Selector', 'Show the writing style selector in top nav', 'showWritingStyleSelector', false, toggleShowWritingStyleSelector);
  content.appendChild(showWritingStyleSelectorSwitch);

  const showToneSelectorSwitch = createSwitch('Show Tone Selector', 'Show the tone selector in top nav', 'showToneSelector', false, toggleShowToneSelector);
  content.appendChild(showToneSelectorSwitch);

  const autoResetTopNav = createSwitch('Auto Reset Top Navbar', 'Automatically reset the tone, writing style, and language to default when switching to new chats', 'autoResetTopNav', true);
  content.appendChild(autoResetTopNav);

  const showMessageCharWordCountSwitch = createSwitch('Show Message Char/Word Count', 'Show the character and word count for each message', 'showMessageCharWordCount', false, refreshPage, ['Requires Refresh']);
  content.appendChild(showMessageCharWordCountSwitch);

  const showMessageTimestampSwitch = createSwitch('Show Message Timestamp', 'Show the timestamp for each message', 'showMessageTimestamp', false, refreshPage, ['Requires Refresh']);
  content.appendChild(showMessageTimestampSwitch);

  const chatEndedSoundSwitch = createSwitch('Sound Alarm', 'Play a sound when the ChatGPT finish responding', 'chatEndedSound', false);
  content.appendChild(chatEndedSoundSwitch);

  const animateFaviconSwitch = createSwitch('Animate Favicon', 'Animate the ChatGPT icon on browser tab while chat is responding', 'animateFavicon', false);
  content.appendChild(animateFaviconSwitch);

  // copy mode
  const copyModeSwitch = createSwitch('Copy mode', 'OFF: only copy response / ON: copy both request and response', 'copyMode', false);
  content.appendChild(copyModeSwitch);

  return content;
}
function toggleSidebarNoteVisibilitySwitch(isChecked) {
  const sidebarNoteButton = document.querySelector('#sidebar-note-button');
  if (sidebarNoteButton) {
    if (isChecked) {
      sidebarNoteButton.classList.remove('hidden');
    } else {
      sidebarNoteButton.classList.add('hidden');
    }
  }
}
function toggleAutoDelete(isChecked) {
  const autoDeleteDetails = document.querySelector('#auto-delete-details');
  const autoDeleteInput = document.querySelector('#auto-delete-input');
  const autoArchiveExcludeFoldersInput = document.querySelector('#auto-delete-exclude-folders-input');
  if (autoDeleteInput) {
    if (isChecked) {
      autoDeleteDetails.style.opacity = '1';
      autoDeleteInput.disabled = false;
      autoArchiveExcludeFoldersInput.disabled = false;
    } else {
      autoDeleteDetails.style.opacity = '0.5';
      autoDeleteInput.disabled = true;
      autoArchiveExcludeFoldersInput.disabled = true;
      refreshPage();
    }
  }
}
// eslint-disable-next-line no-unused-vars
async function autoDeleteConversations() {
  const { autoDelete, autoDeleteNumDays, autoDeleteExcludeFolders } = cachedSettings;
  if (autoDelete) {
    const conversationIds = await chrome.runtime.sendMessage({
      type: 'getConversationIds',
      detail: {
        endDate: (new Date(Date.now() - autoDeleteNumDays * 24 * 60 * 60 * 1000)).getTime(),
        includeArchived: false,
        excludeConvInFolders: autoDeleteExcludeFolders,
      },
    });
    // delete the conversations
    for (let i = 0; i < conversationIds.length; i += 1) {
      const conversationId = conversationIds[i];
      chrome.runtime.sendMessage({
        type: 'deleteConversations',
        detail: {
          conversationIds: [conversationId],
        },
      });
      try {
        // eslint-disable-next-line no-await-in-loop
        await deleteConversation(conversationId);
        removeConversationElements(conversationId);
      } catch (error) {
        console.error(error);
      }
      // wait for 1 second before deleting the next conversation
      // eslint-disable-next-line no-await-in-loop, no-promise-executor-return
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}
function toggleShowMiniMap(isChecked) {
  if (isChecked) {
    createConversationMiniMap(true);
  } else {
    const miniMapWrapper = document.querySelector('#minimap-wrapper');
    if (miniMapWrapper) {
      miniMapWrapper.remove();
    }
    articleObservers?.forEach((observer) => {
      observer.disconnect();
    });
  }
}
function toggleAutoArchive(isChecked) {
  const autoArchiveDetails = document.querySelector('#auto-archive-details');
  const autoArchiveInput = document.querySelector('#auto-archive-input');
  const autoArchiveExcludeFoldersInput = document.querySelector('#auto-archive-exclude-folders-input');
  if (autoArchiveInput) {
    if (isChecked) {
      autoArchiveDetails.style.opacity = '1';
      autoArchiveInput.disabled = false;
      autoArchiveExcludeFoldersInput.disabled = false;
    } else {
      autoArchiveDetails.style.opacity = '0.5';
      autoArchiveInput.disabled = true;
      autoArchiveExcludeFoldersInput.disabled = true;
      refreshPage();
    }
  }
}
// eslint-disable-next-line no-unused-vars
async function autoArchiveConversations() {
  const { autoArchive, autoArchiveNumDays, autoArchiveExcludeFolders } = cachedSettings;
  if (autoArchive) {
    const conversationIds = await chrome.runtime.sendMessage({
      type: 'getConversationIds',
      detail: {
        endDate: (new Date(Date.now() - autoArchiveNumDays * 24 * 60 * 60 * 1000)).getTime(),
        includeArchived: false,
        excludeConvInFolders: autoArchiveExcludeFolders,
      },
    });
    // archive the conversations
    for (let i = 0; i < conversationIds.length; i += 1) {
      const conversationId = conversationIds[i];
      chrome.runtime.sendMessage({
        type: 'archiveConversations',
        detail: {
          conversationIds: [conversationId],
        },
      });
      try {
        // eslint-disable-next-line no-await-in-loop
        await archiveConversation(conversationId);
        removeConversationElements(conversationId);
      } catch (error) {
        console.error(error);
      }
      // wait for 1 second before deleting the next conversation
      // eslint-disable-next-line no-await-in-loop, no-promise-executor-return
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}
let autoArchiveIsRunning = false;
let autoDeleteIsRunning = false;
chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
  (async () => {
    const requestType = request.type;
    if (requestType === 'syncIsDone') {
      const hasSubscription = await chrome.runtime.sendMessage({
        type: 'checkHasSubscription',
      });
      if (hasSubscription) {
        if (cachedSettings.autoArchive && !autoArchiveIsRunning) {
          autoArchiveIsRunning = true;
          autoArchiveConversations();
        } else if (cachedSettings.autoDelete && !autoDeleteIsRunning) {
          autoDeleteIsRunning = true;
          autoDeleteConversations();
        }
      }
    }
  })();
  return true;
});
function toggleShowLanguageSelector(isChecked) {
  const languageSelector = document.querySelector('#language-selector-wrapper');
  if (languageSelector) {
    if (isChecked) {
      languageSelector.style.display = 'block';
    } else {
      languageSelector.style.display = 'none';

      chrome.storage.local.set({
        settings: {
          ...cachedSettings,
          selectedLanguage: 'default',
        },
      });
    }
  }
}
function toggleShowWritingStyleSelector(isChecked) {
  const writingStyleSelector = document.querySelector('#writing-style-selector-wrapper');
  if (writingStyleSelector) {
    if (isChecked) {
      writingStyleSelector.style.display = 'block';
    } else {
      writingStyleSelector.style.display = 'none';

      chrome.storage.local.set({
        settings: {
          ...cachedSettings,
          selectedWritingStyle: 'default',
        },
      });
    }
  }
}
function toggleShowToneSelector(isChecked) {
  const toneSelector = document.querySelector('#tone-selector-wrapper');
  if (toneSelector) {
    if (isChecked) {
      toneSelector.style.display = 'block';
    } else {
      toneSelector.style.display = 'none';

      chrome.storage.local.set({
        settings: {
          ...cachedSettings,
          selectedTone: 'default',
        },
      });
    }
  }
}

// eslint-disable-next-line no-unused-vars
function foldersTabContent(hasSubscription = false) {
  const content = document.createElement('div');
  content.id = 'settings-modal-tab-content';
  content.style = 'display: flex; flex-direction: column; justify-content: start; align-items: start;overflow-y: auto; width:100%; padding: 16px; margin-width:100%; height: 100%;';

  const autoFolderCustomGPTsSwitch = createSwitch('Auto Folder Custom GPTs', 'Automatically create folders for custom GPTs and save new conversations in them', 'autoFolderCustomGPTs', false, null, hasSubscription ? ['New'] : ['New', '⚡️ Requires Pro Account'], !hasSubscription);
  content.appendChild(autoFolderCustomGPTsSwitch);

  const showSidebarFolderButtonSwitch = createSwitch('Show Sidebar Folder Button', 'Show the folder button on the right edge of screen (Only for when "Show Folders in Left Sidebar" 👇 is OFF)', 'showSidebarFolderButton', true, toggleSidebarFolderVisibilitySwitch, ['New']);
  content.appendChild(showSidebarFolderButtonSwitch);

  const showFoldersInLeftSidebarSwitch = createSwitch('Show Folders in Left Sidebar', 'Show the folders in the left sidebar', 'showFoldersInLeftSidebar', false, toggleLeftSidebarSwitch, ['Requires Refresh', 'Experimental']);
  content.appendChild(showFoldersInLeftSidebarSwitch);

  const excludeConvInFoldersSwitch = createSwitch('Exclude Conversations in Folders', 'Hide conversations saved in folders from the All Conversation list', 'excludeConvInFolders', false, loadSidebarFolders);
  content.appendChild(excludeConvInFoldersSwitch);

  const showConversationTimestampInSidebarSwitch = createSwitch('Show Conversation Timestamp in Sidebar', 'Show the timestamp for each conversation in the sidebar', 'showConversationTimestampInSidebar', false, loadSidebarFolders, []);
  content.appendChild(showConversationTimestampInSidebarSwitch);

  const showConversationIndicatorsInSidebarSwitch = createSwitch('Show Conversation Indicators in Sidebar', 'Show note, favorite, and other indicators for each conversation in the sidebar', 'showConversationIndicatorsInSidebar', false, loadSidebarFolders, []);
  content.appendChild(showConversationIndicatorsInSidebarSwitch);

  const reorderGPTsSwitch = createSwitch('Reorder GPTs', 'Sort GPTs in the sidebar in alphabetical order', 'reorderGPTs', false, toggleReorderGPTs, ['New']);
  content.appendChild(reorderGPTsSwitch);

  return content;
}
function toggleSidebarFolderVisibilitySwitch(isChecked) {
  const sidebarFolderButton = document.querySelector('#sidebar-folder-button');
  if (sidebarFolderButton) {
    if (isChecked) {
      sidebarFolderButton.classList.remove('hidden');
    } else {
      sidebarFolderButton.classList.add('hidden');
    }
  }
}
function toggleLeftSidebarSwitch(isChecked) {
  if (isChecked) {
    window.localStorage.setItem('sp/sidebarFolderIsOpen', 'false');
  } else {
    window.localStorage.setItem('sp/sidebarFolderIsOpen', 'true');
  }
  refreshPage();
}
function toggleReorderGPTs(isChecked) {
  if (isChecked) {
    reorderGPTList();
  } else {
    refreshPage();
  }
}
function textToSpeechTabContent(hasSubscription = false) {
  const content = document.createElement('div');
  content.id = 'settings-modal-tab-content';
  content.style = 'display: flex; flex-direction: column; justify-content: start; align-items: start;overflow-y: auto; width:100%; padding: 16px; margin-width:100%; height: 100%;';

  // text to speech
  const textToSpeechHeader = document.createElement('div');
  textToSpeechHeader.style = 'display: flex; flex-direction: row; justify-content: space-between; align-items: center; width: 100%; margin: 8px 0;';
  const textToSpeechLabel = document.createElement('div');
  textToSpeechLabel.style = '';
  textToSpeechLabel.innerHTML = 'Text To Speech<span class="text-xs"> — ChatGPT talks to you. <a class="underline " href="https://www.youtube.com/watch?v=ckHAyrVqj-w&ab_channel=Superpower">Learn more</a></span></span>';
  textToSpeechHeader.appendChild(textToSpeechLabel);

  content.appendChild(textToSpeechHeader);

  const textToSpeechWrapper = document.createElement('div');
  textToSpeechWrapper.classList = 'relative flex flex-wrap justify-start items-center w-full p-4 bg-token-sidebar-surface-tertiary rounded-md mt-3 mb-6';
  const autoSpeakSwitch = createSwitch('Auto Speak', 'Automatically speak the response once it\'s finished', 'autoSpeak', false, null, hasSubscription ? [] : ['⚡️ Requires Pro Account'], !hasSubscription);
  textToSpeechWrapper.appendChild(autoSpeakSwitch);

  const ttsVoiceSelectorWrapper = document.createElement('div');
  ttsVoiceSelectorWrapper.id = 'tts-voice-selector-wrapper';
  ttsVoiceSelectorWrapper.style = 'position:absolute;top:10px;right:10px;width:150px;margin-left:8px;';
  textToSpeechWrapper.appendChild(ttsVoiceSelectorWrapper);
  const audioTestButton = document.createElement('button');
  audioTestButton.classList = 'btn flex justify-center gap-2 btn-primary border';
  audioTestButton.style = 'min-width:120px;height:34px;margin-left:auto;';
  audioTestButton.textContent = 'Test Audio 🎧';
  textToSpeechWrapper.appendChild(audioTestButton);

  getVoices().then((allVoices) => {
    const selectedVoice = allVoices.voices.find((v) => v.voice === allVoices.selected) || allVoices.voices[0];
    ttsVoiceSelectorWrapper.innerHTML = dropdown('TTS-Voice', allVoices.voices, selectedVoice, 'voice', 'right');

    addDropdownEventListener('TTS-Voice', allVoices.voices, 'voice', (voice) => {
      updateAccountUserSetting('voice_name', voice.code);
    });

    audioTestButton.addEventListener('click', () => {
      if (settingTestAudio) settingTestAudio.pause();
      if (audioTestButton.innerText === 'Stop Audio 🎧') {
        audioTestButton.innerText = 'Test Audio 🎧';
        return;
      }
      const voiceName = document.querySelector('#selected-tts-voice-title').innerText;
      let audioFile = allVoices?.voices?.find((v) => v.name === voiceName);
      if (!audioFile) {
        // eslint-disable-next-line prefer-destructuring
        audioFile = allVoices?.voices?.[0];
      }
      const audio = new Audio(audioFile.preview_url);
      audio.play();
      audioTestButton.innerText = 'Stop Audio 🎧';
      settingTestAudio = audio;
      audio.addEventListener('ended', () => {
        audioTestButton.innerText = 'Test Audio 🎧';
        settingTestAudio = null;
      });
    });
    audioTestButton.addEventListener('blur', () => {
      if (settingTestAudio) settingTestAudio.pause();
      settingTestAudio = null;
      audioTestButton.innerText = 'Test Audio 🎧';
    });
  });

  content.appendChild(textToSpeechWrapper);

  // speech to text

  const speechToTextHeader = document.createElement('div');
  speechToTextHeader.style = 'display: flex; flex-direction: row; justify-content: space-between; align-items: center; width: 100%; margin: 8px 0; ';
  const speechToTextLabel = document.createElement('div');
  speechToTextLabel.style = '';
  speechToTextLabel.innerHTML = `Speech To Text${isFirefox || isOpera ? '<span class="text-xs"> (Firefox and Opera do not support <a class="underline " href="https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition#browser_compatibility">Speech Recognition</a>)</span>' : '<span class="text-xs"> — You talk to ChatGPT. <a class="underline " href="https://www.youtube.com/watch?v=ckHAyrVqj-w&ab_channel=Superpower">Learn more</a></span></span>'}`;
  speechToTextHeader.appendChild(speechToTextLabel);

  const sttLanguageSelectorWrapper = document.createElement('div');
  sttLanguageSelectorWrapper.style = 'position:relative;width:150px;margin-left:8px;';
  if (isFirefox || isOpera) {
    sttLanguageSelectorWrapper.style.opacity = 0.5;
    sttLanguageSelectorWrapper.style.pointerEvents = 'none';
  }

  const { speechToTextLanguage } = cachedSettings;
  sttLanguageSelectorWrapper.innerHTML = dropdown('STT-Language', speechToTextLanguageList, speechToTextLanguage, 'code', 'right');
  setTimeout(() => {
    // wait for content to be added
    addDropdownEventListener('STT-Language', speechToTextLanguageList, 'code', (lang) => {
      chrome.storage.local.set({ settings: { ...cachedSettings, speechToTextLanguage: lang } });
    });
  }, 1000);
  speechToTextHeader.appendChild(sttLanguageSelectorWrapper);

  content.appendChild(speechToTextHeader);

  const speechToTextWrapper = document.createElement('div');
  speechToTextWrapper.classList = 'relative flex flex-wrap justify-start items-center w-full p-4 bg-token-sidebar-surface-tertiary rounded-md my-3';

  if (isFirefox || isOpera) {
    speechToTextWrapper.style.opacity = 0.5;
    speechToTextWrapper.style.pointerEvents = 'none';
  }
  const speechToTextInterimResultsSwitch = createSwitch('Interim Results', 'Show interim results while speaking', 'speechToTextInterimResults', true, null, hasSubscription ? [] : ['⚡️ Requires Pro Account'], !hasSubscription);
  speechToTextWrapper.appendChild(speechToTextInterimResultsSwitch);

  const autoSubmitWhenReleaseAltSwitch = createSwitch('Auto Submit When Release Alt', 'Automatically submit the message when you release the Alt key', 'autoSubmitWhenReleaseAlt', false, null, hasSubscription ? [] : ['⚡️ Requires Pro Account'], !hasSubscription);
  speechToTextWrapper.appendChild(autoSubmitWhenReleaseAltSwitch);

  content.appendChild(speechToTextWrapper);

  return content;
}

// eslint-disable-next-line no-unused-vars
function promptInputTabContent(hasSubscription = false) {
  const content = document.createElement('div');
  content.id = 'settings-modal-tab-content';
  content.style = 'display: flex; flex-direction: column; justify-content: start; align-items: start;overflow-y: auto; width:100%; padding: 16px; margin-width:100%; height: 100%;';
  // input history
  const promptHistorySwitch = createSwitch('Recent Prompts Shortkey', 'Enable/disable the up and down arrow keys to cycle through recent prompt history.', 'promptHistoryUpDownKey', true);
  content.appendChild(promptHistorySwitch);

  const showMemoryTogglesInInputSwitch = createSwitch('Show Memory Toggles in Input', 'Show/hide the memory toggles in the prompt input area.', 'showMemoryTogglesInInput', true, toggleMemoryTogglesInInputVisibility, ['New']);
  content.appendChild(showMemoryTogglesInInputSwitch);

  const showFavoritePromptsButtonSwitch = createSwitch('Show Favorite Prompts Button', 'Show/hide the button above input to use favorite prompts. <a href="https://www.youtube.com/watch?v=FBgR7YmrxUk&ab_channel=Superpower" target="_blank" class="underline " rel="noreferrer">Learn more</a>', 'showFavoritePromptsButton', true, toggleFavoritePromptsButtonVisibility);
  content.appendChild(showFavoritePromptsButtonSwitch);

  const showCustomInstructionProfileSelectorSwitch = createSwitch('Show Custom Instruction Profile Selector', 'Show/hide the profile selector for custom instructions.', 'showCustomInstructionProfileSelector', true, toggleCustomInstructionProfileSelectorVisibility, ['New']);
  content.appendChild(showCustomInstructionProfileSelectorSwitch);

  const autoContinueWhenPossibleSwitch = createSwitch('Auto Continue When Available', 'Automatically continue the response when the option is available at the end of a long response', 'autoContinueWhenPossible', true, null);
  content.appendChild(autoContinueWhenPossibleSwitch);

  // const showGpt4Counter = createSwitch('Show GPT-4 Counter', 'Show the number of GPT-4 messages in the last 3 hours (<a style="text-decoration:underline; " href="https://www.youtube.com/watch?v=53EMaGGBwhQ" target="blank">Learn More</a>)', 'showGpt4Counter', true, toggleGpt4Counter);
  // content.appendChild(showGpt4Counter);

  // prompt template
  const promptTemplateSwitch = createSwitch('Prompt Template', 'Enable/disable the doube {{curly}} brackets replacement (<a style="text-decoration:underline; " href="https://www.youtube.com/watch?v=JMBjq0XtutA&ab_channel=Superpower" target="blank">Learn More</a>)', 'promptTemplate', true);
  content.appendChild(promptTemplateSwitch);

  // submitPromptOnEnter
  const submitPromptOnEnterSwitch = createSwitch('Submit Prompt on Enter', `Submit the prompt when you press Enter. If disable, you can submit prompt using ${isWindows() ? 'CTRL' : 'CMD'} + Enter`, 'submitPromptOnEnter', true, refreshPage, ['Requires Refresh']);
  content.appendChild(submitPromptOnEnterSwitch);
  return content;
}
function toggleMemoryTogglesInInputVisibility(isChecked) {
  const memoryTogglesWrapper = document.querySelector('#memory-toggles-wrapper');
  if (memoryTogglesWrapper) {
    if (isChecked) {
      addMemoryTogglesToPromptInput();
    } else {
      memoryTogglesWrapper.remove();
    }
  }
}
function splitterTabContent(_hasSubscription = false) {
  const content = document.createElement('div');
  content.id = 'settings-modal-tab-content';
  content.style = 'display: flex; flex-direction: column; justify-content: start; align-items: start;overflow-y: scroll; width:100%; padding: 16px; margin-width:100%; height: 100%;';

  // conversation width
  const splitterSwitchWrapper = document.createElement('div');
  splitterSwitchWrapper.style = 'display: flex; gap:16px; justify-content: start; align-items: start; width: 100%; margin: 8px 0;';
  const autoSplitSwitch = createSwitch('Auto Split', 'Automatically split long prompts into smaller chunks (<a style="text-decoration:underline; color:gold;" href="https://www.youtube.com/watch?v=IhRbmIhAm3I&ab_channel=Superpower" target="blank">Learn More</a>)', 'autoSplit', false, toggleAutoSummarizerSwitch, ['Requires Refresh']);
  const autoSummarizeSwitch = createSwitch('Auto Summarize', 'Automatically summarize each chunk after auto split (<a style="text-decoration:underline; color:gold;" href="https://www.youtube.com/watch?v=IhRbmIhAm3I&ab_channel=Superpower" target="blank">Learn More</a>)', 'autoSummarize', false, updateAutoSplitPrompt, ['Requires Refresh']);

  const autoSplitChunkSizeLabel = document.createElement('div');
  autoSplitChunkSizeLabel.style = 'display: flex; flex-direction: row; justify-content: start; align-items: center; width: 100%; margin: 8px 0; color:white;';
  autoSplitChunkSizeLabel.textContent = 'Auto Split Chunk Size (GPT-3.5: <28,000 - GPT-4: <120,000)';

  const autoSplitChunkSizeInput = document.createElement('input');
  autoSplitChunkSizeInput.id = 'split-prompt-limit-input';
  autoSplitChunkSizeInput.type = 'number';
  autoSplitChunkSizeInput.classList = 'w-full px-4 py-2 mb-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-token-main-surface-secondary disabled:opacity-40';

  autoSplitChunkSizeInput.value = cachedSettings.autoSplitLimit;

  autoSplitChunkSizeInput.addEventListener('change', () => {
    const curAutoSplitChunkSizeInput = document.querySelector('#split-prompt-limit-input');
    const newValue = Math.round(curAutoSplitChunkSizeInput.value);

    curAutoSplitChunkSizeInput.value = newValue;

    chrome.storage.local.set({ settings: { ...cachedSettings, autoSplitLimit: newValue } });
  });
  autoSplitChunkSizeInput.addEventListener('input', () => {
    const curAutoSplitChunkSizeInput = document.querySelector('#split-prompt-limit-input');
    const newValue = Math.round(curAutoSplitChunkSizeInput.value);

    curAutoSplitChunkSizeInput.value = newValue;

    chrome.storage.local.set({ settings: { ...cachedSettings, autoSplitLimit: newValue } });
  });

  // splitter initial prompt
  const autoSplitInitialPromptLabel = document.createElement('div');
  autoSplitInitialPromptLabel.style = 'display: flex; flex-direction: row; justify-content: start; align-items: center; width: 100%; margin-top: 16px; color:white;';
  autoSplitInitialPromptLabel.textContent = 'Auto Split Prompt';

  const autoSplitInitialPromptHelper = document.createElement('div');
  autoSplitInitialPromptHelper.style = 'font-size: 12px; color: #999;margin-bottom: 8px;';
  autoSplitInitialPromptHelper.textContent = 'Auto Split Prompt is a instruction that will be used to split long user inputs into multiple chunks.';

  const autoSplitInitialPromptText = document.createElement('textarea');
  autoSplitInitialPromptText.id = 'split-initial-prompt-textarea';
  autoSplitInitialPromptText.classList = 'bg-token-main-surface-secondary text-token-text-primary';
  autoSplitInitialPromptText.style = 'width: 100%; height: 200px; min-height: 200px; border-radius: 4px; border: 1px solid #565869; padding: 4px 8px; font-size: 14px;';
  autoSplitInitialPromptText.placeholder = 'Enter Auto Split Prompt here...';
  autoSplitInitialPromptText.value = cachedSettings.autoSplitInitialPrompt;

  autoSplitInitialPromptText.dir = 'auto';
  autoSplitInitialPromptText.addEventListener('input', () => {
    autoSplitInitialPromptText.style.borderColor = '#565869';
    chrome.storage.local.set({ settings: { ...cachedSettings, autoSplitInitialPrompt: autoSplitInitialPromptText.value } });
  });

  // splitter chunk prompt
  const autoSplitChunkPromptLabel = document.createElement('div');
  autoSplitChunkPromptLabel.style = 'display: flex; flex-direction: row; justify-content: start; align-items: center; width: 100%; margin-top: 16px; color:white;';
  autoSplitChunkPromptLabel.textContent = 'Auto Split Chunk Prompt';

  const autoSplitChunkPromptHelper = document.createElement('div');
  autoSplitChunkPromptHelper.style = 'font-size: 12px; color: #999;margin-bottom: 8px;';
  autoSplitChunkPromptHelper.textContent = 'Auto Split Chunk Prompt is the instruction used to process each chunk. For instance, it can be used to summarize the chunk.';

  const autoSplitChunkPromptText = document.createElement('textarea');
  autoSplitChunkPromptText.id = 'split-chunk-prompt-textarea';
  autoSplitChunkPromptText.classList = 'bg-token-main-surface-secondary text-token-text-primary';
  autoSplitChunkPromptText.style = 'width: 100%; height: 100px; min-height: 100px; border-radius: 4px; border: 1px solid #565869; padding: 4px 8px; font-size: 14px;';
  autoSplitChunkPromptText.placeholder = 'Enter splitter prompt here...';

  autoSplitChunkPromptText.value = cachedSettings.autoSplitChunkPrompt;

  autoSplitChunkPromptText.dir = 'auto';
  autoSplitChunkPromptText.addEventListener('input', () => {
    autoSplitChunkPromptText.style.borderColor = '#565869';
    chrome.storage.local.set({ settings: { ...cachedSettings, autoSplitChunkPrompt: autoSplitChunkPromptText.value } });
  });

  splitterSwitchWrapper.appendChild(autoSplitSwitch);
  splitterSwitchWrapper.appendChild(autoSummarizeSwitch);
  content.appendChild(splitterSwitchWrapper);
  content.appendChild(autoSplitChunkSizeLabel);
  content.appendChild(autoSplitChunkSizeInput);
  content.appendChild(autoSplitInitialPromptLabel);
  content.appendChild(autoSplitInitialPromptHelper);
  content.appendChild(autoSplitInitialPromptText);
  content.appendChild(autoSplitChunkPromptLabel);
  content.appendChild(autoSplitChunkPromptHelper);
  content.appendChild(autoSplitChunkPromptText);

  return content;
}
function toggleAutoSummarizerSwitch(isChecked) {
  // if autoSplit is off, check autoSummarize and turn it off if it's on
  if (!isChecked) {
    const autoSummarizeSwitch = document.querySelector('#switch-auto-summarize');
    if (autoSummarizeSwitch.checked) {
      autoSummarizeSwitch.checked = false;
      chrome.storage.local.set({ settings: { ...cachedSettings, autoSummarize: false } }, () => {
        refreshPage();
      });
    } else {
      refreshPage();
    }
  } else {
    refreshPage();
  }
}
function updateAutoSplitPrompt(autoSummarize) {
  const autoSplitChunkPrompt = `Reply with OK: [CHUNK x/TOTAL]
Don't reply with anything else!`;
  const autoSplitChunkPromptSummarize = `Reply with OK: [CHUNK x/TOTAL]
Summary: A short summary of the last chunk. Keep important facts and names in the summary. Don't reply with anything else!`;

  chrome.storage.local.set({
    settings: { ...cachedSettings, autoSplitChunkPrompt: autoSummarize ? autoSplitChunkPromptSummarize : autoSplitChunkPrompt },
  }, () => {
    const autoSplitInitialPromptText = document.querySelector('#split-chunk-prompt-textarea');
    autoSplitInitialPromptText.value = autoSummarize ? autoSplitChunkPromptSummarize : autoSplitChunkPrompt;
    refreshPage();
  });
}
function toggleFavoritePromptsButtonVisibility(isChecked) {
  if (isChecked) {
    initializeContinueButton(true);
  } else {
    const favoritePromptsButton = document.querySelector('#continue-conversation-button-wrapper');
    favoritePromptsButton?.remove();
  }
}
function toggleCustomInstructionProfileSelectorVisibility(isChecked) {
  if (isChecked) {
    initializeCustomInstructionProfileSelector(true);
  } else {
    const customInstructionProfileSelector = document.querySelector('#custom-instruction-profile-selector-wrapper');
    customInstructionProfileSelector?.remove();
  }
}
function settingsModalActions() {
  // add actionbar at the bottom of the content
  const actionBar = document.createElement('div');
  actionBar.style = 'display: flex; flex-direction: row; justify-content: start; align-items: end; margin-top: 8px;width:100%;';
  const logo = document.createElement('img');
  logo.src = chrome.runtime.getURL('icons/logo.png');
  logo.style = 'width: 40px; height: 40px;';

  actionBar.appendChild(logo);
  const textWrapper = document.createElement('div');
  textWrapper.style = 'display: flex; flex-direction: column; justify-content: start; align-items: start; margin-left: 8px;';
  // powere by
  const poweredBy = document.createElement('div');
  poweredBy.textContent = 'Powered by';
  poweredBy.style = 'color: #999; font-size: 12px;';
  const superpowerChatGPT = document.createElement('a');
  superpowerChatGPT.href = 'https://spchatgpt.com';
  superpowerChatGPT.target = '_blank';
  superpowerChatGPT.textContent = 'Superpower ChatGPT';
  superpowerChatGPT.style = 'color: #999; font-size: 12px; margin-left: 4px; text-decoration: underline;';

  poweredBy.appendChild(superpowerChatGPT);
  const versionNumber = document.createElement('span');
  const { version } = chrome.runtime.getManifest();
  versionNumber.textContent = `(v ${version}`;
  versionNumber.style = 'color: #999; font-size: 12px; margin-left: 4px;';
  poweredBy.appendChild(versionNumber);
  const releaseNote = document.createElement('span');
  releaseNote.textContent = 'Release Note)';
  releaseNote.style = 'color: #999; font-size: 12px; margin-left: 4px; text-decoration: underline; cursor: pointer;';

  releaseNote.addEventListener('click', () => {
    // click on close settings modal close button
    document.querySelector('button[id^=modal-close-button-release-note]')?.click();
    createReleaseNoteModal(version);
  });
  poweredBy.appendChild(releaseNote);
  textWrapper.appendChild(poweredBy);
  // made by
  const madeBy = document.createElement('div');
  madeBy.textContent = 'Made by';
  madeBy.style = 'color: #999; font-size: 12px;';
  const madeByLink = document.createElement('a');
  madeByLink.href = 'https://twitter.com/eeeziii';
  madeByLink.target = '_blank';
  madeByLink.textContent = 'Saeed Ezzati';
  madeByLink.style = 'color: #999; font-size: 12px; margin-left: 4px; text-decoration: underline;';

  // support
  const support = document.createElement('span');
  support.textContent = ' - ';
  support.style = 'color: #999; font-size: 12px;';
  const supportLink = document.createElement('a');
  supportLink.href = 'https://www.buymeacoffee.com/ezii';
  supportLink.target = '_blank';
  supportLink.textContent = '🍕 Buy me a pizza ➜';
  supportLink.style = 'color: #999; font-size: 12px; margin-left: 4px; text-decoration: underline;';

  madeBy.appendChild(madeByLink);
  support.appendChild(supportLink);
  madeBy.appendChild(madeByLink);
  madeBy.appendChild(support);

  textWrapper.appendChild(madeBy);
  actionBar.appendChild(textWrapper);
  const upgradeToPro = document.createElement('button');
  upgradeToPro.id = 'upgrade-to-pro-button-settings';
  upgradeToPro.classList = 'flex flex-wrap p-1 items-center rounded-md bg-gold hover:bg-gold-dark transition-colors duration-200 text-black cursor-pointer text-sm ms-auto font-bold';
  upgradeToPro.style = 'width: 230px;';
  upgradeToPro.innerHTML = '<div class="flex w-full"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" style="width:20px; height:20px; margin-right:6px;position:relative; top:10px;" stroke="purple" fill="purple"><path d="M240.5 224H352C365.3 224 377.3 232.3 381.1 244.7C386.6 257.2 383.1 271.3 373.1 280.1L117.1 504.1C105.8 513.9 89.27 514.7 77.19 505.9C65.1 497.1 60.7 481.1 66.59 467.4L143.5 288H31.1C18.67 288 6.733 279.7 2.044 267.3C-2.645 254.8 .8944 240.7 10.93 231.9L266.9 7.918C278.2-1.92 294.7-2.669 306.8 6.114C318.9 14.9 323.3 30.87 317.4 44.61L240.5 224z"/></svg> Upgrade to Pro</div><div style="font-size:10px;font-weight:400;margin-left:28px;" class="flex w-full">GPT Store, Image Gallery, Voice & more</div>';

  chrome.runtime.sendMessage({
    type: 'checkHasSubscription',
  }, (hasSubscription) => {
    if (hasSubscription) {
      upgradeToPro.classList = 'flex p-3 items-center rounded-md bg-gold hover:bg-gold-dark transition-colors duration-200 text-black cursor-pointer text-sm ms-auto font-bold';
      upgradeToPro.style = 'width: auto;';
      upgradeToPro.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" style="width:20px; height:20px;margin-right:6px;" stroke="purple" fill="purple"><path d="M240.5 224H352C365.3 224 377.3 232.3 381.1 244.7C386.6 257.2 383.1 271.3 373.1 280.1L117.1 504.1C105.8 513.9 89.27 514.7 77.19 505.9C65.1 497.1 60.7 481.1 66.59 467.4L143.5 288H31.1C18.67 288 6.733 279.7 2.044 267.3C-2.645 254.8 .8944 240.7 10.93 231.9L266.9 7.918C278.2-1.92 294.7-2.669 306.8 6.114C318.9 14.9 323.3 30.87 317.4 44.61L240.5 224z"/></svg> ${translate('Pro account')}`;
    }
    upgradeToPro.addEventListener('click', () => {
      openUpgradeModal(hasSubscription);
    });
    actionBar.appendChild(upgradeToPro);
  });
  return actionBar;
}

// eslint-disable-next-line no-unused-vars
async function initializeSettings() {
  const { settings } = await chrome.storage.local.get(['settings']);
  const newSettings = {
    ...settings,
    autoReloadOnUpdate: settings.autoReloadOnUpdate !== undefined ? settings.autoReloadOnUpdate : true,
    animateFavicon: settings.animateFavicon !== undefined ? settings.animateFavicon : false,
    dontShowPromptManagerMoveHelper: settings.dontShowPromptManagerMoveHelper !== undefined ? settings.dontShowPromptManagerMoveHelper : false,
    promptHistoryUpDownKey: settings.promptHistoryUpDownKey !== undefined ? settings.promptHistoryUpDownKey : true,
    copyMode: settings.copyMode !== undefined ? settings.copyMode : false,
    exportMode: settings.exportMode !== undefined ? settings.exportMode : true,
    autoResetTopNav: settings.autoResetTopNav !== undefined ? settings.autoResetTopNav : true,
    showFavoritePromptsButton: settings.showFavoritePromptsButton !== undefined ? settings.showFavoritePromptsButton : true,
    hideNewsletter: settings.hideNewsletter !== undefined ? settings.hideNewsletter : true,
    hideReleaseNote: settings.hideReleaseNote !== undefined ? settings.hideReleaseNote : true,
    hideUpdateNotification: settings.hideUpdateNotification !== undefined ? settings.hideUpdateNotification : false,
    chatEndedSound: settings.chatEndedSound !== undefined ? settings.chatEndedSound : false,
    customConversationWidth: settings.customConversationWidth !== undefined ? settings.customConversationWidth : false,
    conversationWidth: settings.conversationWidth !== undefined ? settings.conversationWidth : 50,
    submitPromptOnEnter: settings.submitPromptOnEnter !== undefined ? settings.submitPromptOnEnter : true,
    promptTemplate: settings.promptTemplate !== undefined ? settings.promptTemplate : true,
    autoClick: settings.autoClick !== undefined ? settings.autoClick : false,
    showLanguageSelector: settings.showLanguageSelector !== undefined ? settings.showLanguageSelector : false,
    showToneSelector: settings.showToneSelector !== undefined ? settings.showToneSelector : false,
    showWritingStyleSelector: settings.showWritingStyleSelector !== undefined ? settings.showWritingStyleSelector : false,
    selectedLanguage: settings.selectedLanguage || { code: 'default', name: 'Default' },
    selectedTone: settings.selectedTone || { code: 'default', name: 'Default', description: 'No specific tone instruction' },
    selectedWritingStyle: settings.selectedWritingStyle || { code: 'default', name: 'Default', description: 'No specific writing style instruction' },
    selectedNotesSortBy: settings.selectedNotesSortBy || { name: 'Update date', code: 'updated_at' },
    selectedNotesView: settings.selectedNotesView || 'grid', // list, grid
    selectedConversationView: settings.selectedConversationView || 'grid', // list, grid
    selectedPromptView: settings.selectedPromptView || 'grid', // list, grid
    selectedPinnedMessageView: settings.selectedPinnedMessageView || 'grid', // list, grid
    selectedProfileView: settings.selectedProfileView || 'grid', // list, grid
    selectedConversationsManagerSortBy: settings.selectedConversationsManagerSortBy || { name: 'Update date', code: 'updated_at' },
    selectedPromptsManagerSortBy: settings.selectedPromptsManagerSortBy || { name: 'Update date', code: 'updated_at' },
    selectedPromptsManagerTag: settings.selectedPromptsManagerTag || { name: 'All', code: 'all' },
    selectedPromptsManagerLanguage: settings.selectedPromptsManagerLanguage || { name: 'All', code: 'all' },
    selectedPromptEditorLanguage: settings.selectedPromptEditorLanguage || { name: 'Select', code: 'select' },
    autoContinueWhenPossible: settings.autoContinueWhenPossible !== undefined ? settings.autoContinueWhenPossible : true,
    autoSpeak: settings.autoSpeak !== undefined ? settings.autoSpeak : false,
    // speech to text
    speechToTextLanguage: settings.speechToTextLanguage || { name: 'English (United Kingdom)', code: 'en-GB' },
    speechToTextInterimResults: settings.speechToTextInterimResults !== undefined ? settings.speechToTextInterimResults : true,
    autoSubmitWhenReleaseAlt: settings.autoSubmitWhenReleaseAlt !== undefined ? settings.autoSubmitWhenReleaseAlt : false,
    managerSidebarWidth: settings.managerSidebarWidth || 220,
    excludeConvInFolders: settings.excludeConvInFolders !== undefined ? settings.excludeConvInFolders : false,

    showMessageTimestamp: settings.showMessageTimestamp !== undefined ? settings.showMessageTimestamp : false,
    showMessageCharWordCount: settings.showMessageCharWordCount !== undefined ? settings.showMessageCharWordCount : false,
    showConversationTimestampInSidebar: settings.showConversationTimestampInSidebar !== undefined ? settings.showConversationTimestampInSidebar : false,
    showConversationIndicatorsInSidebar: settings.showConversationIndicatorsInSidebar !== undefined ? settings.showConversationIndicatorsInSidebar : false,
    showCustomInstructionProfileSelector: settings.showCustomInstructionProfileSelector !== undefined ? settings.showCustomInstructionProfileSelector : true,
    autoFolderCustomGPTs: settings.autoFolderCustomGPTs !== undefined ? settings.autoFolderCustomGPTs : false,
    showFoldersInLeftSidebar: settings.showFoldersInLeftSidebar !== undefined ? settings.showFoldersInLeftSidebar : false,
    syncGizmos: settings.syncGizmos !== undefined ? settings.syncGizmos : false,
    syncProjects: settings.syncProjects !== undefined ? settings.syncProjects : false,
    syncHistoryResponses: settings.syncHistoryResponses !== undefined ? settings.syncHistoryResponses : true,
    reorderGPTs: settings.reorderGPTs !== undefined ? settings.reorderGPTs : false,
    showMiniMap: settings.showMiniMap !== undefined ? settings.showMiniMap : settings.showPinNav || false,
    showSidebarNoteButton: settings.showSidebarNoteButton !== undefined ? settings.showSidebarNoteButton : true,
    showSidebarFolderButton: settings.showSidebarFolderButton !== undefined ? settings.showSidebarFolderButton : true,

    showMemoryTogglesInInput: settings.showMemoryTogglesInInput !== undefined ? settings.showMemoryTogglesInInput : true,

    overrideModelSwitcher: settings.overrideModelSwitcher !== undefined ? settings.overrideModelSwitcher : false,

    triggerEndOfConvOnEvent: settings.triggerEndOfConvOnEvent !== undefined ? settings.triggerEndOfConvOnEvent : false,

    autoDelete: settings.autoDelete !== undefined ? settings.autoDelete : false,
    autoDeleteNumDays: settings.autoDeleteNumDays || 7,
    autoDeleteExcludeFolders: settings.autoDeleteExcludeFolders !== undefined ? settings.autoDeleteExcludeFolders : true,

    autoArchive: settings.autoArchive !== undefined ? settings.autoArchive : false,
    autoArchiveNumDays: settings.autoArchiveNumDays || 7,
    autoArchiveExcludeFolders: settings.autoArchiveExcludeFolders !== undefined ? settings.autoArchiveExcludeFolders : true,

    autoSummarize: settings.autoSummarize !== undefined ? settings.autoSummarize : false,
    autoSplit: settings.autoSplit !== undefined ? settings.autoSplit : false,
    autoSplitLimit: settings.autoSplitLimit || 28000,
    autoSplitInitialPrompt: settings.autoSplitInitialPrompt || `Act like a document/text loader until you load and remember the content of the next text/s or document/s.
There might be multiple files, each file is marked by name in the format ### DOCUMENT NAME.
I will send them to you in chunks. Each chunk starts will be noted as [START CHUNK x/TOTAL], and the end of this chunk will be noted as [END CHUNK x/TOTAL], where x is the number of current chunks, and TOTAL is the number of all chunks I will send you.
I will split the message in chunks, and send them to you one by one. For each message follow the instructions at the end of the message.
Let's begin:

`,
    autoSplitChunkPrompt: settings.autoSplitChunkPrompt || `Reply with OK: [CHUNK x/TOTAL]
Don't reply with anything else!`,
  };
  cachedSettings = newSettings;
  chrome.storage.local.set({
    settings: newSettings,
  });
}
// Listen for storage changes and update cache
chrome.storage.onChanged.addListener((changes) => {
  if (changes.settings) {
    cachedSettings = changes.settings.newValue;
  }
});
