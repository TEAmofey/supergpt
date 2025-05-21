/* global createSettingsModal, openUpgradeModal, createReleaseNoteModal, createKeyboardShortcutsModal, getConversations, translate, closeMenus */
// eslint-disable-next-line no-unused-vars
function showManagerSidebarSettingsMenu(sidebarSettingsElement, hasSubscription, showSyncStatus = false) {
  const { right, top } = sidebarSettingsElement.getBoundingClientRect();

  const translateX = right + 2;
  const translateY = top - 240;
  const menu = `<div id="manager-sidebar-settings-menu" dir="ltr" style="position:fixed;left:0;top:0;transform:translate3d(${translateX}px,${translateY}px,0);min-width:max-content;z-index:10001;--radix-popper-anchor-width:18px;--radix-popper-anchor-height:18px;--radix-popper-available-width:1167px;--radix-popper-available-height:604px;--radix-popper-transform-origin:0% 0px"><div data-side="bottom" data-align="start" role="menu" aria-orientation="vertical" data-state="open" data-radix-menu-content="" dir="ltr" aria-labelledby="radix-:r6g:" class="text-token-text-primary mt-2 min-w-[200px] max-w-xs rounded-lg border border-token-border-medium bg-token-main-surface-primary shadow-lg" tabindex="-1" data-orientation="vertical" style="outline:0;--radix-dropdown-menu-content-transform-origin:var(--radix-popper-transform-origin);--radix-dropdown-menu-content-available-width:var(--radix-popper-available-width);--radix-dropdown-menu-content-available-height:var(--radix-popper-available-height);--radix-dropdown-menu-trigger-width:var(--radix-popper-anchor-width);--radix-dropdown-menu-trigger-height:var(--radix-popper-anchor-height);pointer-events:auto">
  

  <div role="menuitem" id="manager-settings-button" class="flex items-center justify-between gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item="">${translate('Settings')}</div>
  
  <!--div role="menuitem" id="manager-${hasSubscription ? 'subscription' : 'upgrade'}-button" class="flex items-center justify-between gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item="">${hasSubscription ? translate('Manage subscription') : translate('Upgrade to Pro')}</div-->  
  
  
  <div role="menuitem" id="manager-keyboard-shortcuts-button" class="flex items-center justify-between gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item="">${translate('Keyboard shortcuts')}</div>
  
  <div role="menuitem" id="manager-release-note-button" class="flex items-center justify-between gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item="">${translate('Release note')}</div>
  
  <div role="menuitem" id="manager-help-button" class="flex items-center justify-between gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item="">${translate('Help')}</div>
  
  <div role="menuitem" id="manager-about-button" class="flex items-center justify-between gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item="">${translate('About')}</div>
  <div id="conv-sync-status" class="text-xs m-1 px-2.5 ${showSyncStatus ? '' : 'hidden'}"></div>
  </div></div>`;
  document.body.insertAdjacentHTML('beforeend', menu);
  addManagerSidebarSettingsMenuEventListeners(showSyncStatus);
}
function addManagerSidebarSettingsMenuEventListeners(showSyncStatus = false) {
  const menu = document.querySelector('#manager-sidebar-settings-menu');
  const managerSettingsButton = document.querySelector('#manager-settings-button');
  const managerUpgradeButton = document.querySelector('#manager-upgrade-button');
  const managerSubscriptionButton = document.querySelector('#manager-subscription-button');
  const managerHelpButton = document.querySelector('#manager-help-button');
  const managerKeyboardShortcutsButton = document.querySelector('#manager-keyboard-shortcuts-button');
  const managerReleaseNoteButton = document.querySelector('#manager-release-note-button');
  const managerAboutButton = document.querySelector('#manager-about-button');

  managerSettingsButton?.addEventListener('click', () => {
    menu?.remove();
    createSettingsModal();
  });
  managerUpgradeButton?.addEventListener('click', () => {
    menu?.remove();
    openUpgradeModal(false);
  });
  managerSubscriptionButton?.addEventListener('click', () => {
    menu?.remove();
    openUpgradeModal(true);
  });
  managerHelpButton?.addEventListener('click', () => {
    menu?.remove();
    showHelpModal();
  });
  managerKeyboardShortcutsButton?.addEventListener('click', () => {
    menu?.remove();
    createKeyboardShortcutsModal();
  });
  managerReleaseNoteButton?.addEventListener('click', () => {
    menu?.remove();
    const { version } = chrome.runtime.getManifest();
    createReleaseNoteModal(version);
  });
  managerAboutButton?.addEventListener('click', () => {
    menu?.remove();
    showAboutModal();
  });
  if (showSyncStatus) {
    getConversations(0, 1).then((response) => {
      chrome.runtime.sendMessage({
        type: 'getSyncedConversationCount',
        forceRefresh: true,
      }, (syncedCount) => {
        const syncStatusElement = document.querySelector('#conv-sync-status');
        if (!syncStatusElement) return;
        syncStatusElement.classList.remove('hidden');
        syncStatusElement.textContent = `${syncedCount} / ${response.total}`;
      });
    });
  }
}
function showHelpModal() {
  const modal = `<div id="manager-help-modal" class="absolute inset-0" style="z-index:10000;">
  <div data-state="open" class="fixed inset-0 bg-black/50 dark:bg-black/80" style="pointer-events: auto;">
    <div class="z-50 h-full w-full overflow-y-auto grid grid-cols-[10px_1fr_10px] grid-cols-[10px_1fr_10px] grid-rows-[minmax(10px,1fr)_auto_minmax(10px,1fr)] md:grid-rows-[minmax(20px,1fr)_auto_minmax(20px,1fr)]">
      <div id="manager-help-modal-dialog" role="dialog" aria-describedby="radix-:r9e:" aria-labelledby="radix-:r9d:" data-state="open" class="popover relative start-1/2 col-auto col-start-2 row-auto row-start-2 h-full w-full bg-token-main-surface-primary text-start shadow-xl ltr:-translate-x-1/2 rtl:translate-x-1/2 rounded-2xl flex flex-col focus:outline-none max-w-[550px]" tabindex="-1" style="pointer-events: auto;">
        <div class="p-4 flex items-center justify-between border-b border-black/10 dark:border-white/10">
          <div class="flex">
            <div class="flex items-center">
              <div class="flex grow items-center gap-1">
                <h2 class="text-lg font-semibold leading-6 text-token-text-primary">Help center</h2>
              </div>
            </div>
          </div>
          <button id="help-modal-close-button" data-testid="close-button" class="flex h-8 w-8 items-center justify-center rounded-full text-token-text-primary  bg-transparent hover:bg-token-main-surface-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-token-text-quaternary focus-visible:ring-offset-1 focus-visible:ring-offset-transparent dark:hover:bg-token-main-surface-tertiary sm:mt-0" aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"
              xmlns="http://www.w3.org/2000/svg" class="icon-md">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M5.63603 5.63604C6.02656 5.24552 6.65972 5.24552 7.05025 5.63604L12 10.5858L16.9497 5.63604C17.3403 5.24552 17.9734 5.24552 18.364 5.63604C18.7545 6.02657 18.7545 6.65973 18.364 7.05025L13.4142 12L18.364 16.9497C18.7545 17.3403 18.7545 17.9734 18.364 18.364C17.9734 18.7545 17.3403 18.7545 16.9497 18.364L12 13.4142L7.05025 18.364C6.65972 18.7545 6.02656 18.7545 5.63603 18.364C5.24551 17.9734 5.24551 17.3403 5.63603 16.9497L10.5858 12L5.63603 7.05025C5.24551 6.65973 5.24551 6.02657 5.63603 5.63604Z"></path>
            </svg>
          </button>
        </div>
        <div class="flex-grow overflow-y-auto p-4 sm:p-6">
          <div class="w-full">
            <p>Here are some resources to help you get started with Superpower ChatGPT:</p>
            <ul class="list-disc list-inside mt-4">
              <li class="text-token-text-tertiary">
                Join our <a href="https://discord.gg/superpower-chatgpt-1083455984489476220" class="inline-flex items-center gap-2 text-token-text-tertiary underline hover:text-token-text-tertiary" target="_blank" rel="noreferrer">Discord</a> community to get help and share your feedback
              </li>
              <li class="text-token-text-tertiary">
                Watch our <a href="https://www.youtube.com/@spchatgpt" class="inline-flex items-center gap-2 text-token-text-tertiary underline hover:text-token-text-tertiary" target="_blank" rel="noreferrer">YouTube</a> channel for tutorials and tips
              </li>
              <li class="text-token-text-tertiary">
                Read our <a href="https://ezi.notion.site/Superpower-ChatGPT-FAQ-9d43a8a1c31745c893a4080029d2eb24" class="inline-flex items-center gap-2 text-token-text-tertiary underline hover:text-token-text-tertiary" target="_blank" rel="noreferrer">FAQ</a>
              </li>
              <li class="text-token-text-tertiary">
                Visit <a href="https://help.openai.com/en/collections/3742473-chatgpt" class="inline-flex items-center gap-2 text-token-text-tertiary underline hover:text-token-text-tertiary" target="_blank" rel="noreferrer">ChatGPT help center</a>
              </li>
            </ul>
            <br/>
            <p>For any other questions, feel free to <a target="_blank" class="mx-1 font-semibold underline" href="mailto:support@spchatgpt.com?subject=Superpower ChatGPT Pro Subscription">Email Us</a> or <a target="_blank" class="mx-1 font-semibold underline" href="https://calendly.com/ezii/20min">Book a call</a> with us. We will be happy to walk you through the features and answer any questions you may have.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', modal);
  addManagerHelpModalEventListeners();
}
function addManagerHelpModalEventListeners() {
  const helpModal = document.querySelector('#manager-help-modal');
  const closeButton = helpModal.querySelector('[data-testid="close-button"]');
  helpModal?.addEventListener('click', (e) => {
    const helpModalDialog = document.querySelector('#manager-help-modal-dialog');
    if (helpModalDialog && !helpModalDialog?.contains(e.target)) {
      helpModal?.remove();
    }
  });
  closeButton?.addEventListener('click', () => {
    helpModal?.remove();
  });
}
function showAboutModal() {
  const { version } = chrome.runtime.getManifest();
  const modal = `<div id="manager-about-modal" class="absolute inset-0" style="z-index:10000;">
  <div data-state="open" class="fixed inset-0 bg-black/50 dark:bg-black/80" style="pointer-events: auto;">
    <div class="z-50 h-full w-full overflow-y-auto grid grid-cols-[10px_1fr_10px] grid-cols-[10px_1fr_10px] grid-rows-[minmax(10px,1fr)_auto_minmax(10px,1fr)] md:grid-rows-[minmax(20px,1fr)_auto_minmax(20px,1fr)]">
      <div id="manager-about-modal-dialog" role="dialog" aria-describedby="radix-:r9e:" aria-labelledby="radix-:r9d:" data-state="open" class="popover relative start-1/2 col-auto col-start-2 row-auto row-start-2 h-full w-full bg-token-main-surface-primary text-start shadow-xl ltr:-translate-x-1/2 rtl:translate-x-1/2 rounded-2xl flex flex-col focus:outline-none max-w-[550px]" tabindex="-1" style="pointer-events: auto;">
        <div class="p-4 flex items-center justify-between border-b border-black/10 dark:border-white/10">
          <div class="flex">
            <div class="flex items-center">
              <div class="flex grow items-center gap-1">
                <img src="chrome-extension://njgdpojknfpngmcajmfhmmefhdimlgdg/icons/logo.png" style="width: 64px; height: 64px;">
                <h2 class="text-lg font-semibold leading-6 text-token-text-primary">Superpower ChatGPT</h2>
              </div>
            </div>
          </div>
          <button id="about-modal-close-button" data-testid="close-button" class="flex h-8 w-8 items-center justify-center rounded-full text-token-text-primary  bg-transparent hover:bg-token-main-surface-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-token-text-quaternary focus-visible:ring-offset-1 focus-visible:ring-offset-transparent dark:hover:bg-token-main-surface-tertiary sm:mt-0" aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"
              xmlns="http://www.w3.org/2000/svg" class="icon-md">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M5.63603 5.63604C6.02656 5.24552 6.65972 5.24552 7.05025 5.63604L12 10.5858L16.9497 5.63604C17.3403 5.24552 17.9734 5.24552 18.364 5.63604C18.7545 6.02657 18.7545 6.65973 18.364 7.05025L13.4142 12L18.364 16.9497C18.7545 17.3403 18.7545 17.9734 18.364 18.364C17.9734 18.7545 17.3403 18.7545 16.9497 18.364L12 13.4142L7.05025 18.364C6.65972 18.7545 6.02656 18.7545 5.63603 18.364C5.24551 17.9734 5.24551 17.3403 5.63603 16.9497L10.5858 12L5.63603 7.05025C5.24551 6.65973 5.24551 6.02657 5.63603 5.63604Z"></path>
            </svg>
          </button>
        </div>
        <div class="flex-grow overflow-y-auto p-4 sm:p-6">
          <div class="w-full">
            <p class="mb-6 text-token-text-tertiary">
              <span>Take ChatGPT to the next level with features like folders, search, enhanced GPT store, image gallery, voice GPT, custom prompts, prompt chains, hidden models, and many more...  
                <a href="https://spchatgpt.com/" class="inline-flex items-center gap-2 text-token-text-tertiary underline hover:text-token-text-tertiary" target="_blank" rel="noreferrer">Learn more</a>
              </span>
            </p>
            <p class="mb-6 text-token-text-tertiary">
              <span>Enjoy Superpower ChatGPT and want the share it with others?   
                <a href="https://spchatgpt.com/affiliate" class="inline-flex items-center gap-2 text-token-text-tertiary underline hover:text-token-text-tertiary" target="_blank" rel="noreferrer">Become an affiliate</a>
              </span>
            </p>
            <p class="mb-6 text-token-text-tertiary">
              <span>Version v${version} -   
                <span id="manager-release-note" class="underline cursor-pointer inline-flex items-center gap-2 text-token-text-tertiary underline hover:text-token-text-tertiary">Release Note</span>
              </span>
            </p>
            <p class="mb-6 text-token-text-tertiary">
              <span>
                Created by <a href="https://twitter.com/eeeziii" target="_blank" class="underline cursor-pointer inline-flex items-center gap-2 text-token-text-tertiary underline hover:text-token-text-tertiary">Saeed Ezzati</a> - 
                <a href="https://www.buymeacoffee.com/ezii" target="_blank" class="underline cursor-pointer inline-flex items-center gap-2 text-token-text-tertiary underline hover:text-token-text-tertiary">🍕 Buy me a pizza ➜</a>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', modal);
  addAboutModalEventListeners(version);
}
function addAboutModalEventListeners(version) {
  const aboutModal = document.querySelector('#manager-about-modal');
  if (!aboutModal) return;
  const closeButton = aboutModal?.querySelector('button');
  const releaseNoteButton = aboutModal?.querySelector('#manager-release-note');
  aboutModal?.addEventListener('click', (e) => {
    const aboutModalDialog = document.querySelector('#manager-about-modal-dialog');
    if (aboutModalDialog && !aboutModalDialog?.contains(e.target)) {
      aboutModal?.remove();
    }
  });

  closeButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenus();
    aboutModal?.remove();
  });
  releaseNoteButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenus();
    aboutModal?.remove();
    createReleaseNoteModal(version);
  });
}
