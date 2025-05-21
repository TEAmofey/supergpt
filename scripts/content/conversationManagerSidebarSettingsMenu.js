/* global conversationManagerSidebarContent, showConfirmDialog, deleteAllConversations, archiveAllConversations, openExportModal, showDateSelectorDialog, getConversationIds, translate, errorUpgradeConfirmation, noConversationElement, resetConversationCounts, cachedSettings */
// eslint-disable-next-line no-unused-vars
async function showConversationManagerSidebarSettingsMenu(sidebarSettingsElement) {
  const { right, top } = sidebarSettingsElement.getBoundingClientRect();

  const hasSubscription = await chrome.runtime.sendMessage({
    type: 'checkHasSubscription',
  });
  const translateX = right + 2;
  const translateY = top - 215;
  const menu = `<div id="conversation-manager-sidebar-settings-menu" dir="ltr" style="position:fixed;left:0;top:0;transform:translate3d(${translateX}px,${translateY}px,0);min-width:max-content;z-index:10001;--radix-popper-anchor-width:18px;--radix-popper-anchor-height:18px;--radix-popper-available-width:1167px;--radix-popper-available-height:604px;--radix-popper-transform-origin:0% 0px"><div data-side="bottom" data-align="start" role="menu" aria-orientation="vertical" data-state="open" data-radix-menu-content="" dir="ltr" aria-labelledby="radix-:r6g:" class="text-token-text-primary mt-2 min-w-[200px] max-w-xs rounded-lg border border-token-border-medium bg-token-main-surface-primary shadow-lg" tabindex="-1" data-orientation="vertical" style="outline:0;--radix-dropdown-menu-content-transform-origin:var(--radix-popper-transform-origin);--radix-dropdown-menu-content-available-width:var(--radix-popper-available-width);--radix-dropdown-menu-content-available-height:var(--radix-popper-available-height);--radix-dropdown-menu-trigger-width:var(--radix-popper-anchor-width);--radix-dropdown-menu-trigger-height:var(--radix-popper-anchor-height);pointer-events:auto">
  
  <div role="menuitem" id="sort-conversation-folders-button" class="flex items-center justify-between gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item="">${translate('Sort folders')} <svg aria-hidden="true" fill="none" focusable="false" height="1em" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" style="min-width:16px" viewBox="0 0 24 24" width="1em"><path d="m9 18 6-6-6-6"></path></svg></div>

  <div role="menuitem" id="export-all-conversations-button" class="flex items-center justify-between gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item="">${translate('Export all')} ${hasSubscription ? '' : '<span class="text-white rounded-md bg-green-500 px-2 text-sm">Pro</span>'}</div>

  <div role="menuitem" id="export-conversations-date-range-button" class="flex items-center justify-between gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item="">${translate('Export by date range')} ${hasSubscription ? '' : '<span class="text-white rounded-md bg-green-500 px-2 text-sm">Pro</span>'}</div>

  <div role="menuitem" id="archive-all-conversations-button" class="flex items-center justify-between gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item="">${translate('Archive all')}</div>

  <div role="menuitem" id="delete-all-conversations-button" class="flex items-center justify-between gap-2 m-1.5 rounded p-2.5 text-sm text-token-text-error cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item="">${translate('Delete all')}</div>

  
  </div></div>`;
  document.body.insertAdjacentHTML('beforeend', menu);
  addConversationManagerSidebarSettingsMenuEventListeners();
}
function addConversationManagerSidebarSettingsMenuEventListeners() {
  const menu = document.querySelector('#conversation-manager-sidebar-settings-menu');
  const sortConversationFoldersButton = menu?.querySelector('#sort-conversation-folders-button');
  const exportAllConversationButton = menu?.querySelector('#export-all-conversations-button');
  const expoprtConversationByDateRangeButton = menu?.querySelector('#export-conversations-date-range-button');
  const archiveAllConversationsButton = menu?.querySelector('#archive-all-conversations-button');
  const deleteAllConversationsButton = menu?.querySelector('#delete-all-conversations-button');

  sortConversationFoldersButton?.addEventListener('mouseenter', () => {
    showConversationFolderSortByMenu();
  });

  exportAllConversationButton?.addEventListener('mouseover', () => {
    document.querySelector('#conversation-manager-sidebar-settings-sort-menu')?.remove();
  });
  exportAllConversationButton?.addEventListener('click', () => {
    chrome.runtime.sendMessage({
      type: 'checkHasSubscription',
    }, (hasSubscription) => {
      if (!hasSubscription) {
        const error = { title: 'This is a Pro feature', message: 'Exporting all conversations requires a Pro subscription. Upgrade to Pro to remove all limits.' };
        errorUpgradeConfirmation(error);
        return;
      }
      menu?.remove();
      openExportModal([], 'all');
    });
  });
  expoprtConversationByDateRangeButton?.addEventListener('mouseover', () => {
    document.querySelector('#conversation-manager-sidebar-settings-sort-menu')?.remove();
  });
  expoprtConversationByDateRangeButton?.addEventListener('click', () => {
    chrome.runtime.sendMessage({
      type: 'checkHasSubscription',
    }, (hasSubscription) => {
      if (!hasSubscription) {
        const error = { title: 'This is a Pro feature', message: 'Exporting all conversations requires a Pro subscription. Upgrade to Pro to remove all limits.' };
        errorUpgradeConfirmation(error);
        return;
      }
      menu?.remove();
      showDateSelectorDialog('Export Conversations', 'Select date range', 'Cancel', 'Export', null, async (startDate, endDate) => {
        const conversationIds = await getConversationIds(startDate / 1000, endDate / 1000);
        openExportModal(conversationIds, 'dateRange');
        const dateSelectorDialogElement = document.querySelector('#date-selector-dialog');
        dateSelectorDialogElement?.remove();
      }, 'green', false);
    });
  });
  archiveAllConversationsButton?.addEventListener('mouseover', () => {
    document.querySelector('#conversation-manager-sidebar-settings-sort-menu')?.remove();
  });
  archiveAllConversationsButton?.addEventListener('click', () => {
    menu?.remove();
    showConfirmDialog('Archive all conversations', 'Are you sure you want to archive all your conversations?', 'Cancel', 'Confirm', null, () => {
      // click on root in the sidebar
      document.querySelector('#sidebar-folder-drawer #folder-breadcrumb-root')?.click();

      const conversationList = document.querySelector('#conversation-manager-conversation-list');
      conversationList.innerHTML = '';
      conversationList.appendChild(noConversationElement());

      resetConversationCounts();
      archiveAllConversations();
      chrome.runtime.sendMessage({
        type: 'archiveAllConversations',
      });
    });
  });
  deleteAllConversationsButton?.addEventListener('mouseover', () => {
    document.querySelector('#conversation-manager-sidebar-settings-sort-menu')?.remove();
  });
  deleteAllConversationsButton?.addEventListener('click', () => {
    menu?.remove();
    showConfirmDialog('Delete all conversations', 'Are you sure you want to delete all your conversations? This will also delete all conversations in all folders.', 'Cancel', 'Confirm', null, () => {
      // click on root in the sidebar
      document.querySelector('#sidebar-folder-drawer #folder-breadcrumb-root')?.click();

      const conversationList = document.querySelector('#conversation-manager-conversation-list');
      conversationList.innerHTML = '';
      conversationList.appendChild(noConversationElement());

      resetConversationCounts();
      deleteAllConversations();
      chrome.runtime.sendMessage({
        type: 'deleteAllConversations',
      });
    });
  });
}

function showConversationFolderSortByMenu() {
  const { selectedConversationsManagerFoldersSortBy = 'alphabetical' } = cachedSettings;
  const conversationManagerSidebarSettingsMenu = document.querySelector('#conversation-manager-sidebar-settings-menu');
  const { right, top } = conversationManagerSidebarSettingsMenu.getBoundingClientRect();

  const translateX = right + 2;
  const translateY = top - 50;
  const menu = `<div id="conversation-manager-sidebar-settings-sort-menu" dir="ltr" style="position:fixed;left:0;top:0;transform:translate3d(${translateX}px,${translateY}px,0);min-width:max-content;z-index:10001;--radix-popper-anchor-width:18px;--radix-popper-anchor-height:18px;--radix-popper-available-width:1167px;--radix-popper-available-height:604px;--radix-popper-transform-origin:0% 0px"><div data-side="bottom" data-align="start" role="menu" aria-orientation="vertical" data-state="open" data-radix-menu-content="" dir="ltr" aria-labelledby="radix-:r6g:" class="text-token-text-primary mt-2 min-w-[200px] max-w-xs rounded-lg border border-token-border-medium bg-token-main-surface-primary shadow-lg" tabindex="-1" data-orientation="vertical" style="outline:0;--radix-dropdown-menu-content-transform-origin:var(--radix-popper-transform-origin);--radix-dropdown-menu-content-available-width:var(--radix-popper-available-width);--radix-dropdown-menu-content-available-height:var(--radix-popper-available-height);--radix-dropdown-menu-trigger-width:var(--radix-popper-anchor-width);--radix-dropdown-menu-trigger-height:var(--radix-popper-anchor-height);pointer-events:auto">
  
    <div role="menuitem" id="alphabetical-sort-conversations-button" class="flex items-center justify-between gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item="">${translate('Alphabetical')} ${selectedConversationsManagerFoldersSortBy === 'alphabetical' ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md"><path fill="currentColor" fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m14.076-4.068a1 1 0 0 1 .242 1.393l-4.75 6.75a1 1 0 0 1-1.558.098l-2.5-2.75a1 1 0 0 1 1.48-1.346l1.66 1.827 4.032-5.73a1 1 0 0 1 1.394-.242" clip-rule="evenodd"></path></svg>' : ''}</div>

    <div role="menuitem" id="create-at-sort-conversations-button" class="flex gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item="">${translate('Create date')} ${selectedConversationsManagerFoldersSortBy === 'created_at' ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md"><path fill="currentColor" fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m14.076-4.068a1 1 0 0 1 .242 1.393l-4.75 6.75a1 1 0 0 1-1.558.098l-2.5-2.75a1 1 0 0 1 1.48-1.346l1.66 1.827 4.032-5.73a1 1 0 0 1 1.394-.242" clip-rule="evenodd"></path></svg>' : ''}</div>
    
    <div role="menuitem" id="update-at-sort-conversations-button" class="flex gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item="">${translate('Update date')} ${selectedConversationsManagerFoldersSortBy === 'updated_at' ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md"><path fill="currentColor" fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m14.076-4.068a1 1 0 0 1 .242 1.393l-4.75 6.75a1 1 0 0 1-1.558.098l-2.5-2.75a1 1 0 0 1 1.48-1.346l1.66 1.827 4.032-5.73a1 1 0 0 1 1.394-.242" clip-rule="evenodd"></path></svg>' : ''}</div></div></div>`;
  document.body.insertAdjacentHTML('beforeend', menu);
  addConversationFolderSortByMenuEventListeners();
}
function addConversationFolderSortByMenuEventListeners() {
  const alphabeticalSortConversationsButton = document.querySelector('#alphabetical-sort-conversations-button');
  const createAtSortConversationsButton = document.querySelector('#create-at-sort-conversations-button');
  const updateAtSortConversationsButton = document.querySelector('#update-at-sort-conversations-button');

  alphabeticalSortConversationsButton.addEventListener('click', () => {
    chrome.storage.local.set({ settings: { ...cachedSettings, selectedConversationsManagerFoldersSortBy: 'alphabetical' } }, () => {
      const conversationManagerSidebar = document.querySelector('#conversation-manager-sidebar');
      conversationManagerSidebar.innerHTML = '';
      conversationManagerSidebar.insertAdjacentElement('beforeend', conversationManagerSidebarContent());
    });
  });

  createAtSortConversationsButton.addEventListener('click', () => {
    chrome.storage.local.set({ settings: { ...cachedSettings, selectedConversationsManagerFoldersSortBy: 'created_at' } }, () => {
      const conversationManagerSidebar = document.querySelector('#conversation-manager-sidebar');
      conversationManagerSidebar.innerHTML = '';
      conversationManagerSidebar.insertAdjacentElement('beforeend', conversationManagerSidebarContent());
    });
  });

  updateAtSortConversationsButton.addEventListener('click', () => {
    chrome.storage.local.set({ settings: { ...cachedSettings, selectedConversationsManagerFoldersSortBy: 'updated_at' } }, () => {
      const conversationManagerSidebar = document.querySelector('#conversation-manager-sidebar');
      conversationManagerSidebar.innerHTML = '';
      conversationManagerSidebar.insertAdjacentElement('beforeend', conversationManagerSidebarContent());
    });
  });
}
