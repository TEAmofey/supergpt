/* global debounce, selectedConversationFolderBreadcrumb:true, createFullSearchButton, getConversationIdFromUrl, translate, closeMenus, addConversationCardEventListeners, closeSidebarNote, loadingSpinner, conversationFolderElement, noConversationElement, defaultConversationFoldersList, errorUpgradeConfirmation, generateRandomDarkColor, handleRenameConversationFolderClick, showConversationPreviewWrapper, updateSelectedConvCard, getConversations, syncHistoryResponseToConversationDB, getLastSelectedConversationFolder, sidebarNoteIsOpen, isDefaultConvFolder, generateConvFolderBreadcrumb, throttleGetConvSubFolders, throttle, formatDate, formatTime, initializePresentation, startNewChat, initiateNewChatFolderIndicator, toast, toggleLeftSidebarSwitch, noConversationFolderElemet, isWindows, cachedSettings, openMoveConvToFolderModal, handleClickArchiveConversationsButton, handleClickUnarchiveConversationsButton, openExportModal, handleDeleteSelectedConversations, createTooltip, rgba2hex */
const sidebarFolderDrawerWidth = 280; // px
let sidebarSelectedConversationIds = [];
// eslint-disable-next-line no-unused-vars
let folderForNewChat;

function sidebarFolderIsOpen() {
  return window.localStorage.getItem('sp/sidebarFolderIsOpen') === 'true';
}

async function loadSidebarFolders(forceRefresh = false) {
  const { selectedConversationsManagerFoldersSortBy = 'alphabetical' } = cachedSettings;
  const sidebarFolderContent = document.querySelector('#sidebar-folder-content');
  if (!sidebarFolderContent) return;
  const loadingSpinnerElement = document.querySelector('#sidebar-folder-drawer #loading-spinner-sidebar-folder-content');
  if (!loadingSpinnerElement) {
    sidebarFolderContent.innerHTML = '';
    sidebarFolderContent.appendChild(loadingSpinner('sidebar-folder-content'));
  }
  chrome.runtime.sendMessage({
    type: 'getConversationFolders',
    forceRefresh,
    detail: {
      sortBy: selectedConversationsManagerFoldersSortBy,
    },
  }, async (conversationFolders) => {
    if (!conversationFolders) return;
    if (!Array.isArray(conversationFolders)) return;
    const curLoadingSpinnerElement = document.querySelector('#loading-spinner-sidebar-folder-content');
    if (curLoadingSpinnerElement) curLoadingSpinnerElement.remove();

    const sidebarFolderDrawer = document.querySelector('#sidebar-folder-drawer');
    if (!sidebarFolderDrawer) {
      await addSidebarFolderDrawer();
    }

    sidebarFolderContent.innerHTML = '';
    sidebarFolderContent.appendChild(defaultConversationFoldersList(true));

    if (conversationFolders.length === 0) {
      const lastSelectedConversationFolder = getLastSelectedConversationFolder();
      if (!lastSelectedConversationFolder || lastSelectedConversationFolder?.id === 'root') {
        sidebarFolderContent.appendChild(noConversationFolderElemet());
      }
    }
    conversationFolders.forEach((folder) => {
      sidebarFolderContent.appendChild(conversationFolderElement(folder, true));
    });

    if (selectedConversationFolderBreadcrumb.length > 0) {
      const lastSelectedConversationFolder = getLastSelectedConversationFolder();
      throttleGetConvSubFolders(lastSelectedConversationFolder.id);
      throttleFetchSidebarConversations();
    }
  });
}

const throttleFetchSidebarConversations = throttle(async (pageNumber = 1, fullSearch = false, forceRefresh = false) => {
  await fetchSidebarConversations(pageNumber, fullSearch, forceRefresh);
}, 1000);
async function fetchSidebarConversations(pageNumber = 1, fullSearch = false, forceRefresh = false) {
  const sidebarFolderSearchTerm = document.querySelector('#sidebar-folder-search-input')?.value;
  const lastSelectedConversationFolder = getLastSelectedConversationFolder();

  if (!lastSelectedConversationFolder && !sidebarFolderSearchTerm) return;

  const sidebarFolderContent = document.querySelector('#sidebar-folder-content');
  if (!sidebarFolderContent) return;
  if (pageNumber === 1) {
    document.querySelectorAll('#sidebar-folder-drawer #load-more-conversations-button')?.forEach((el) => el.remove());
    sidebarFolderContent.querySelector('button[id^="full-search-button"]')?.remove();
    sidebarFolderContent.querySelector('p[id^="no-conversations-found"]')?.remove();
    sidebarFolderContent.querySelector('p[id^="no-conversation-folder"]')?.remove();
    sidebarFolderContent.querySelectorAll('div[id^="conversation-card-"]')?.forEach((el) => el.remove());
    sidebarFolderContent.appendChild(loadingSpinner('sidebar-folder-content'));
  }
  let conversations = [];
  let hasMore = false;
  const allFavoriteConvIds = [];
  const allNoteConvIds = [];

  if (sidebarFolderSearchTerm === '' && lastSelectedConversationFolder?.id === 'archived') {
    const convPerPage = 100;
    const offset = (pageNumber - 1) * convPerPage;
    const limit = convPerPage;
    const isArchived = lastSelectedConversationFolder?.id === 'archived';
    try {
      const response = await getConversations(offset, limit, 'updated', isArchived, forceRefresh);
      // sync new chats to the database
      conversations = syncHistoryResponseToConversationDB(response, isArchived);
      hasMore = response.total > offset + limit;
    } catch (error) {
      // set load more button to show "load more" and on click fetchConversations(pageNumber + 1) again
      const loadMoreButton = document.querySelector('#sidebar-folder-drawer #load-more-conversations-button');
      if (loadMoreButton) {
        loadMoreButton.innerHTML = '<div class="w-full h-full flex items-center justify-center">Load more...</div>';
        loadMoreButton.onclick = () => {
          fetchSidebarConversations(pageNumber + 1, fullSearch, forceRefresh);
        };
        return;
      }
    }
  } else {
    const loadMoreButtons = document.querySelectorAll('#sidebar-folder-drawer #load-more-conversations-button');
    loadMoreButtons?.forEach((el) => el.remove());
    const { selectedConversationsManagerSortBy, excludeConvInFolders } = cachedSettings;
    const sortBy = selectedConversationsManagerSortBy?.code;
    const response = await chrome.runtime.sendMessage({
      type: 'getConversations',
      forceRefresh,
      detail: {
        pageNumber,
        searchTerm: sidebarFolderSearchTerm,
        sortBy: (sidebarFolderSearchTerm || ['all', 'archived'].includes(lastSelectedConversationFolder?.id)) ? 'updated_at' : sortBy,
        fullSearch,
        folderId: (sidebarFolderSearchTerm || typeof lastSelectedConversationFolder?.id === 'string') ? null : lastSelectedConversationFolder?.id,
        isArchived: lastSelectedConversationFolder?.id === 'archived' ? true : null,
        isFavorite: lastSelectedConversationFolder?.id === 'favorites' ? true : null,
        excludeConvInFolders: lastSelectedConversationFolder?.id === 'all' && excludeConvInFolders,
      },
    });
    conversations = response.results;
    hasMore = response.next;
  }
  const loadingSpinnerElement = document.querySelector('#sidebar-folder-drawer #loading-spinner-sidebar-folder-content');
  if (loadingSpinnerElement) loadingSpinnerElement.remove();
  if (conversations?.length === 0 && pageNumber === 1) {
    if (sidebarFolderSearchTerm && !fullSearch) {
      const fullSearchButton = createFullSearchButton(true);
      sidebarFolderContent.appendChild(fullSearchButton);
      fullSearchButton.click();
    } else {
      sidebarFolderContent.appendChild(noConversationElement());
    }
  } else {
    conversations?.forEach((conversation) => {
      const isFavorite = allFavoriteConvIds.includes(conversation.conversation_id) || conversation.is_favorite;
      const hasNote = allNoteConvIds.includes(conversation.conversation_id) || conversation.has_note;
      const conv = { ...conversation, is_favorite: isFavorite, has_note: hasNote };
      const conversationElement = createConversationElement(conv);
      sidebarFolderContent.appendChild(conversationElement);
      addConversationElementEventListeners(conversationElement, conv);
    });
    matchConversationNames();
    if (hasMore) {
      const loadMoreConversationsButton = document.createElement('button');
      loadMoreConversationsButton.id = 'load-more-conversations-button';
      loadMoreConversationsButton.classList = 'flex items-center justify-between text-token-text-primary text-sm relative rounded-lg px-2 py-1 cursor-pointer w-full h-10';
      loadMoreConversationsButton.appendChild(loadingSpinner('load-more-conversations-button'));
      sidebarFolderContent.appendChild(loadMoreConversationsButton);
      loadMoreConversationsButton.onclick = () => {
        fetchSidebarConversations(pageNumber + 1, fullSearch, forceRefresh);
      };
      // add an observer to click the load more button when it is visible
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // no throttle since if the first 24 conv fit on screen, the second page will not be fetched with throttle
            fetchSidebarConversations(pageNumber + 1, fullSearch, forceRefresh);
          }
        });
      }, { threshold: 0.5 });
      if (loadMoreConversationsButton) {
        observer.observe(loadMoreConversationsButton);
      }
    } else if (sidebarFolderSearchTerm && !fullSearch) {
      const fullSearchButton = createFullSearchButton(true);
      sidebarFolderContent.appendChild(fullSearchButton);
    }
  }
}
function createConversationElement(conversation) {
  const lastSelectedConversationFolder = getLastSelectedConversationFolder();

  const conversationIdFromUrl = getConversationIdFromUrl();
  const isDefaultFolder = isDefaultConvFolder(lastSelectedConversationFolder?.id);
  const sidebarFolderSearchTerm = document.querySelector('#sidebar-folder-search-input')?.value;

  const conversationElement = document.createElement('div');
  conversationElement.id = `conversation-card-${conversation.conversation_id}`;
  conversationElement.dataset.conversationId = conversation.conversation_id;
  conversationElement.classList = `flex items-center justify-between text-token-text-primary text-sm relative rounded-lg ${conversationIdFromUrl === conversation.conversation_id ? 'bg-token-sidebar-surface-tertiary' : ''} hover:bg-token-sidebar-surface-tertiary px-2 py-1 cursor-pointer group`;
  conversationElement.innerHTML = `
    ${(isDefaultFolder || sidebarFolderSearchTerm) ? `<div id="conversation-card-folder-color-indicator-${conversation.conversation_id}" data-folder-id="${conversation?.folder?.id}" title="${conversation?.folder?.name || ''}" class="absolute w-1 h-full top-0 start-0 rounded-s-xl" style="background-color: ${conversation?.folder?.name ? `${conversation?.folder?.color}` : 'transparent'};"></div>` : ''}

    <div class="flex flex-wrap grow overflow-hidden w-full">
      <div id="conversation-title" title="${conversation.title}" class="relative grow overflow-hidden whitespace-nowrap flex">
        <input id="sidebar-conversation-checkbox-${conversation.conversation_id}" data-conversation-id="${conversation.conversation_id}" type="checkbox" class="manager-modal border border-token-border-medium me-2" style="cursor: pointer; border-radius: 2px; display: ${sidebarSelectedConversationIds.length > 0 ? 'block' : 'none'};">
        
        ${conversation.title || 'New chat'}
      </div>

      <div class="w-full flex flex-wrap text-token-text-tertiary items-center" style="font-size: 0.7rem">
      ${false && conversation.folder?.name ? `<div class="flex items-center justify-center h-4 rounded-lg px-2 me-2 text-white relative" style="top:2px;background-color:${conversation?.folder?.color}">${conversation.folder?.name}</div>` : ''}

      ${cachedSettings?.showConversationTimestampInSidebar ? `<span class="me-1">${formatDate(new Date(formatTime(conversation.update_time || conversation.create_time)))}</span>` : ''}

      ${cachedSettings?.showConversationIndicatorsInSidebar ? `
      <span title="This conversations has notes">
        <svg id="conversation-note-indicator-${conversation.conversation_id}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="#19c37d" class="me-1 icon-xs ${conversation.has_note ? '' : 'hidden'}"><path d="M320 480l128-128h-128V480zM400 31.1h-352c-26.51 0-48 21.49-48 48v352C0 458.5 21.49 480 48 480H288l.0039-128c0-17.67 14.33-32 32-32H448v-240C448 53.49 426.5 31.1 400 31.1z"></path></svg>
      </span>

      <span title="Favorite conversation">
        <svg id="conversation-favorite-indicator-${conversation.conversation_id}" class="icon-xs ${conversation.is_favorite ? '' : 'hidden'}" fill="gold" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M381.2 150.3L524.9 171.5C536.8 173.2 546.8 181.6 550.6 193.1C554.4 204.7 551.3 217.3 542.7 225.9L438.5 328.1L463.1 474.7C465.1 486.7 460.2 498.9 450.2 506C440.3 513.1 427.2 514 416.5 508.3L288.1 439.8L159.8 508.3C149 514 135.9 513.1 126 506C116.1 498.9 111.1 486.7 113.2 474.7L137.8 328.1L33.58 225.9C24.97 217.3 21.91 204.7 25.69 193.1C29.46 181.6 39.43 173.2 51.42 171.5L195 150.3L259.4 17.97C264.7 6.954 275.9-.0391 288.1-.0391C300.4-.0391 311.6 6.954 316.9 17.97L381.2 150.3z"></path></svg>
      </span>
      ` : ''}
      </div>
    </div>

    <div id="conversation-card-settings-menu-${conversation.conversation_id}" class="relative items-center justify-center h-8 rounded-lg px-2 text-token-text-tertiary focus-visible:outline-0 hover:bg-token-sidebar-surface-secondary focus-visible:bg-token-sidebar-surface-secondary">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md hidden group-hover:flex items-center justify-center h-full"><path fill-rule="evenodd" clip-rule="evenodd" d="M3 12C3 10.8954 3.89543 10 5 10C6.10457 10 7 10.8954 7 12C7 13.1046 6.10457 14 5 14C3.89543 14 3 13.1046 3 12ZM10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12ZM17 12C17 10.8954 17.8954 10 19 10C20.1046 10 21 10.8954 21 12C21 13.1046 20.1046 14 19 14C17.8954 14 17 13.1046 17 12Z" fill="currentColor"></path></svg>
    </div>
  `;
  conversationElement.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenus();
    if (e.metaKey || (isWindows() && e.ctrlKey)) {
      window.open(`/c/${conversation.conversation_id}`, '_blank');
    } else {
      const conversationElementInHistory = document.querySelector(`nav li a[href$="${conversation.conversation_id}"]`);
      const curSidebarFolderSearchTerm = document.querySelector('#sidebar-folder-search-input')?.value;
      if (conversationElementInHistory && !curSidebarFolderSearchTerm) {
        conversationElementInHistory.click();
        updateSelectedConvCard(conversation.conversation_id, true);
      } else {
        if (curSidebarFolderSearchTerm) {
          updateSelectedConvCard(conversation.conversation_id, true);
          showConversationPreviewWrapper(conversation.conversation_id, null, true);
        } else {
          // if url not includes conversation id, open conversation in the same tab
          if (!window.location.href.includes(`/c/${conversation.conversation_id}`)) {
            window.open(`/c/${conversation.conversation_id}`, '_self');
          }
        }
      }
    }
  });
  conversationElement.addEventListener('mouseenter', () => {
    closeMenus();
    const conversationCardSettingsButtons = document.querySelectorAll('#sidebar-folder-content div[id^="conversation-card-settings-menu"]');
    conversationCardSettingsButtons.forEach((btn) => {
      btn.querySelector('svg').classList.replace('flex', 'hidden');
    });

    // checkbox
    const conversationCheckbox = document.querySelector(`#sidebar-conversation-checkbox-${conversation.conversation_id}`);
    if (conversationCheckbox) conversationCheckbox.style.display = 'block';
  });

  conversationElement.addEventListener('mouseleave', () => {
    // checkbox
    const conversationCheckbox = document.querySelector(`#sidebar-conversation-checkbox-${conversation.conversation_id}`);
    if (conversationCheckbox && sidebarSelectedConversationIds.length === 0) conversationCheckbox.style.display = 'none';
  });
  // checkbox
  const conversationCheckbox = conversationElement.querySelector(`#sidebar-conversation-checkbox-${conversation.conversation_id}`);
  conversationCheckbox?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenus();
    if (e.target.checked) {
      if (e.shiftKey && sidebarSelectedConversationIds.length > 0) {
        const lastChecked = sidebarSelectedConversationIds[sidebarSelectedConversationIds.length - 1];
        sidebarSelectedConversationIds.push(conversation.conversation_id);

        const conversationCheckboxes = document.querySelectorAll('input[id^="sidebar-conversation-checkbox-"]');
        let start = false;
        conversationCheckboxes.forEach((checkbox) => {
          if (checkbox.dataset.conversationId === lastChecked || checkbox.dataset.conversationId === conversation.conversation_id) {
            start = !start;
          }
          if (start && !sidebarSelectedConversationIds.includes(checkbox.dataset.conversationId)) {
            checkbox.checked = true;
            sidebarSelectedConversationIds.push(checkbox.dataset.conversationId);
          }
        });
      } else {
        sidebarSelectedConversationIds.push(conversation.conversation_id);
      }
    } else {
      sidebarSelectedConversationIds = sidebarSelectedConversationIds.filter((id) => id !== conversation.conversation_id);
    }
    // show/hide other checkboxes
    const conversationCheckboxes = document.querySelectorAll('input[id^="sidebar-conversation-checkbox-"]');
    if (sidebarSelectedConversationIds.length > 0) {
      conversationCheckboxes.forEach((checkbox) => {
        checkbox.style.display = 'block';
      });
      showSidebarBulkActions();
    } else {
      conversationCheckboxes.forEach((checkbox) => {
        checkbox.style.display = 'none';
      });
      hideSidebarBulkActions();
    }
  });

  return conversationElement;
}
function showSidebarBulkActions() {
  const existingBulkActionWrapper = document.querySelector('#sidebar-bulk-action-wrapper');
  if (existingBulkActionWrapper) return;
  const { showFoldersInLeftSidebar } = cachedSettings;
  const nav = document.querySelector('nav');
  const sidebarFolderDrawer = document.querySelector('#sidebar-folder-drawer');
  const parentElement = showFoldersInLeftSidebar ? nav : sidebarFolderDrawer;
  if (!parentElement) return;

  const bulkActionWrapper = document.createElement('div');
  bulkActionWrapper.id = 'sidebar-bulk-action-wrapper';
  bulkActionWrapper.classList = 'flex items-center justify-around w-full mt-2 absolute bottom-0 start-0 bg-token-main-surface-tertiary z-50 h-14';
  // cancel, move, export, archive, delete
  bulkActionWrapper.innerHTML = `<div id="sidebar-bulk-action-reset-button" class="relative flex items-center justify-center h-8 rounded-lg px-2 text-token-red focus-visible:outline-0 hover:bg-token-sidebar-surface-secondary focus-visible:bg-token-sidebar-surface-secondary">
      <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
</div>

<div id="sidebar-bulk-action-move-button" class="relative flex items-center justify-center h-8 rounded-lg px-2 text-token-red focus-visible:outline-0 hover:bg-token-sidebar-surface-secondary focus-visible:bg-token-sidebar-surface-secondary">
      <svg xmlns="http://www.w3.org/2000/svg" stroke="currentColor" fill="currentColor" stroke-linecap="round" stroke-linejoin="round" class="icon-md" stroke-width="2" viewBox="0 0 512 512"><path d="M448 96h-172.1L226.7 50.75C214.7 38.74 198.5 32 181.5 32H64C28.66 32 0 60.66 0 96v320c0 35.34 28.66 64 64 64h384c35.34 0 64-28.66 64-64V160C512 124.7 483.3 96 448 96zM464 416c0 8.824-7.18 16-16 16H64c-8.82 0-16-7.176-16-16V96c0-8.824 7.18-16 16-16h117.5c4.273 0 8.289 1.664 11.31 4.688L256 144h192c8.82 0 16 7.176 16 16V416zM336 264h-56V207.1C279.1 194.7 269.3 184 256 184S232 194.7 232 207.1V264H175.1C162.7 264 152 274.7 152 288c0 13.26 10.73 23.1 23.1 23.1h56v56C232 381.3 242.7 392 256 392c13.26 0 23.1-10.74 23.1-23.1V311.1h56C349.3 311.1 360 301.3 360 288S349.3 264 336 264z"/></svg>
</div>

<div id="sidebar-bulk-action-export-button" class="relative flex items-center justify-center h-8 rounded-lg px-2 text-token-red focus-visible:outline-0 hover:bg-token-sidebar-surface-secondary focus-visible:bg-token-sidebar-surface-secondary">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" stroke="currentColor" fill="currentColor" stroke-width="2" stroke-linejoin="round" class="icon-md"><path d="M568.1 303l-80-80c-9.375-9.375-24.56-9.375-33.94 0s-9.375 24.56 0 33.94L494.1 296H216C202.8 296 192 306.8 192 320s10.75 24 24 24h278.1l-39.03 39.03C450.3 387.7 448 393.8 448 400s2.344 12.28 7.031 16.97c9.375 9.375 24.56 9.375 33.94 0l80-80C578.3 327.6 578.3 312.4 568.1 303zM360 384c-13.25 0-24 10.74-24 24V448c0 8.836-7.164 16-16 16H64.02c-8.836 0-16-7.164-16-16L48 64.13c0-8.836 7.164-16 16-16h160L224 128c0 17.67 14.33 32 32 32h79.1v72c0 13.25 10.74 24 23.1 24S384 245.3 384 232V138.6c0-16.98-6.742-33.26-18.75-45.26l-74.63-74.64C278.6 6.742 262.3 0 245.4 0H63.1C28.65 0-.002 28.66 0 64l.0065 384c.002 35.34 28.65 64 64 64H320c35.2 0 64-28.8 64-64v-40C384 394.7 373.3 384 360 384z"/></svg>
</div>

<div id="sidebar-bulk-action-archive-button" class="relative flex items-center justify-center h-8 rounded-lg px-2 text-token-red focus-visible:outline-0 hover:bg-token-sidebar-surface-secondary focus-visible:bg-token-sidebar-surface-secondary">
      <svg viewBox="0 0 18 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="icon-md"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.62188 3.07918C3.87597 2.571 4.39537 2.25 4.96353 2.25H13.0365C13.6046 2.25 14.124 2.571 14.3781 3.07918L15.75 5.82295V13.5C15.75 14.7426 14.7426 15.75 13.5 15.75H4.5C3.25736 15.75 2.25 14.7426 2.25 13.5V5.82295L3.62188 3.07918ZM13.0365 3.75H4.96353L4.21353 5.25H13.7865L13.0365 3.75ZM14.25 6.75H3.75V13.5C3.75 13.9142 4.08579 14.25 4.5 14.25H13.5C13.9142 14.25 14.25 13.9142 14.25 13.5V6.75ZM6.75 9C6.75 8.58579 7.08579 8.25 7.5 8.25H10.5C10.9142 8.25 11.25 8.58579 11.25 9C11.25 9.41421 10.9142 9.75 10.5 9.75H7.5C7.08579 9.75 6.75 9.41421 6.75 9Z" fill="currentColor"></path></svg>
</div>

<div id="sidebar-bulk-action-delete-button" class="relative flex items-center justify-center h-8 rounded-lg px-2 text-token-red focus-visible:outline-0 hover:bg-token-sidebar-surface-secondary focus-visible:bg-token-sidebar-surface-secondary text-red-500">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md "><path fill-rule="evenodd" clip-rule="evenodd" d="M10.5555 4C10.099 4 9.70052 4.30906 9.58693 4.75114L9.29382 5.8919H14.715L14.4219 4.75114C14.3083 4.30906 13.9098 4 13.4533 4H10.5555ZM16.7799 5.8919L16.3589 4.25342C16.0182 2.92719 14.8226 2 13.4533 2H10.5555C9.18616 2 7.99062 2.92719 7.64985 4.25342L7.22886 5.8919H4C3.44772 5.8919 3 6.33961 3 6.8919C3 7.44418 3.44772 7.8919 4 7.8919H4.10069L5.31544 19.3172C5.47763 20.8427 6.76455 22 8.29863 22H15.7014C17.2354 22 18.5224 20.8427 18.6846 19.3172L19.8993 7.8919H20C20.5523 7.8919 21 7.44418 21 6.8919C21 6.33961 20.5523 5.8919 20 5.8919H16.7799ZM17.888 7.8919H6.11196L7.30423 19.1057C7.3583 19.6142 7.78727 20 8.29863 20H15.7014C16.2127 20 16.6417 19.6142 16.6958 19.1057L17.888 7.8919ZM10 10C10.5523 10 11 10.4477 11 11V16C11 16.5523 10.5523 17 10 17C9.44772 17 9 16.5523 9 16V11C9 10.4477 9.44772 10 10 10ZM14 10C14.5523 10 15 10.4477 15 11V16C15 16.5523 14.5523 17 14 17C13.4477 17 13 16.5523 13 16V11C13 10.4477 13.4477 10 14 10Z" fill="currentColor"></path></svg>
</div>`;
  parentElement.appendChild(bulkActionWrapper);

  const resetButton = document.querySelector('#sidebar-bulk-action-reset-button');
  const moveButton = document.querySelector('#sidebar-bulk-action-move-button');
  const exportButton = document.querySelector('#sidebar-bulk-action-export-button');
  const archiveButton = document.querySelector('#sidebar-bulk-action-archive-button');
  const deleteButton = document.querySelector('#sidebar-bulk-action-delete-button');

  const lastSelectedConversationFolder = getLastSelectedConversationFolder();
  const isArchived = lastSelectedConversationFolder?.id === 'archived';
  createTooltip(resetButton, 'Cancel', 'transform: translate(40%, -110%);');
  createTooltip(moveButton, 'Move', 'transform: translate(20%, -110%);');
  createTooltip(exportButton, 'Export', 'transform: translate(20%, -110%);');
  createTooltip(archiveButton, isArchived ? 'Unarchive' : 'Archive', 'transform: translate(20%, -110%);');
  createTooltip(deleteButton, 'Delete', 'transform: translate(0%, -110%);');

  resetButton?.addEventListener('click', () => {
    resetSidebarConversationSelection();
  });

  moveButton?.addEventListener('click', () => {
    openMoveConvToFolderModal(sidebarSelectedConversationIds);
  });
  exportButton?.addEventListener('click', () => {
    openExportModal(sidebarSelectedConversationIds, 'selected');
  });
  archiveButton?.addEventListener('click', () => {
    // if current folder is archived, unarchive
    const curLastSelectedConversationFolder = getLastSelectedConversationFolder();
    const curIsArchived = curLastSelectedConversationFolder?.id === 'archived';
    if (curIsArchived) {
      handleClickUnarchiveConversationsButton(sidebarSelectedConversationIds);
    } else {
      handleClickArchiveConversationsButton(sidebarSelectedConversationIds);
    }
  });
  deleteButton?.addEventListener('click', () => {
    handleDeleteSelectedConversations(sidebarSelectedConversationIds);
  });
}
function hideSidebarBulkActions() {
  const bulkActionWrapper = document.querySelector('#sidebar-bulk-action-wrapper');
  if (bulkActionWrapper) bulkActionWrapper.remove();
}
function resetSidebarConversationSelection() {
  hideSidebarBulkActions();
  sidebarSelectedConversationIds = [];
  const conversationCheckboxes = document.querySelectorAll('input[id^="sidebar-conversation-checkbox-"]');
  conversationCheckboxes?.forEach((checkbox) => {
    checkbox.checked = false;
    checkbox.style.display = 'none';
  });
}
// eslint-disable-next-line no-unused-vars
function toggleFovoriteIndicator(conversationId, isFavorite) {
  const favoriteIndicators = document.querySelectorAll(`#conversation-favorite-indicator-${conversationId}`);
  if (favoriteIndicators.length === 0) return;
  for (let i = 0; i < favoriteIndicators.length; i += 1) {
    const favoriteIndicator = favoriteIndicators[i];
    if (isFavorite) {
      favoriteIndicator.classList.remove('hidden');
    } else {
      favoriteIndicator.classList.add('hidden');
    }
  }
}
function addConversationElementEventListeners(conversationElement, conversation) {
  addConversationCardEventListeners(conversationElement, conversation, true);
}
async function toggleSidebarFolder() {
  closeSidebarNote();
  const presentation = initializePresentation();
  if (!presentation) return;

  const floatingButtonWrapper = document.querySelector('#floating-button-wrapper');

  const sidebarFolderDrawer = document.querySelector('#sidebar-folder-drawer');
  if (!sidebarFolderDrawer) {
    await addSidebarFolderDrawer();
  }
  if (sidebarFolderIsOpen()) {
    if (sidebarFolderDrawer) sidebarFolderDrawer.style.width = '0';
    window.localStorage.setItem('sp/sidebarFolderIsOpen', 'false');
    presentation.style.width = '100%';
    if (floatingButtonWrapper) floatingButtonWrapper.style.right = '3rem';
  } else {
    window.localStorage.setItem('sp/sidebarFolderIsOpen', 'true');
    // sidebarFolderDrawer.style.width = `${sidebarFolderDrawerWidth}px`;
    sidebarFolderDrawer.style.width = `${sidebarFolderDrawerWidth}px`;
    presentation.style.width = `calc(100% - ${sidebarFolderDrawerWidth}px)`;
    if (floatingButtonWrapper) floatingButtonWrapper.style.right = `calc(1rem + ${sidebarFolderDrawerWidth}px)`;
  }
}
// eslint-disable-next-line no-unused-vars
function closeSidebarFolder() {
  const sidebarFolderDrawer = document.querySelector('main #sidebar-folder-drawer');
  if (sidebarFolderDrawer) sidebarFolderDrawer.style.width = '0';
  window.localStorage.setItem('sp/sidebarFolderIsOpen', 'false');
}
function addSidebarFolderButton() {
  const existingSidebarFolderButton = document.querySelector('#sidebar-folder-button');
  if (existingSidebarFolderButton) existingSidebarFolderButton.remove();
  const { showSidebarFolderButton } = cachedSettings;

  const sidebarFolderButton = document.createElement('button');
  sidebarFolderButton.id = 'sidebar-folder-button';
  sidebarFolderButton.innerHTML = translate('Folders');
  sidebarFolderButton.classList = `absolute flex items-center justify-center border border-token-border-medium text-token-text-tertiary hover:border-token-border-medium hover:text-token-text-primary text-xs font-sans cursor-pointer rounded-t-md z-10 bg-token-main-surface-primary opacity-85 hover:opacity-100 ${showSidebarFolderButton ? '' : 'hidden'}`;
  sidebarFolderButton.style = 'top: 16rem;right: -1rem;width: 4rem;height: 2rem;flex-wrap:wrap;transform: rotate(-90deg);';
  sidebarFolderButton.addEventListener('click', () => {
    toggleSidebarFolder();
  });
  document.body.appendChild(sidebarFolderButton);
}

function toggleNewConversationInFolderButton(hidden = true) {
  folderForNewChat = null;
  initiateNewChatFolderIndicator();
  const lastSelectedConversationFolder = getLastSelectedConversationFolder();
  const newConversationInFolderButtonWrapper = document.querySelector('#new-conversation-in-folder-button-wrapper');
  const newConversationInFolderButton = document.querySelector('#new-conversation-in-folder-button');
  const conversationManagerStartNewChatButton = document.querySelector('#conversation-manager-start-new-chat-button');
  if (hidden) {
    newConversationInFolderButtonWrapper?.classList?.replace('flex', 'hidden');
    if (newConversationInFolderButton) newConversationInFolderButton.innerText = translate('Start a New Chat');
    if (conversationManagerStartNewChatButton) conversationManagerStartNewChatButton.innerText = translate('Start a New Chat');
  } else {
    newConversationInFolderButtonWrapper?.classList?.replace('hidden', 'flex');
    if (newConversationInFolderButton) newConversationInFolderButton.innerText = lastSelectedConversationFolder?.gizmo_id ? translate('Start a New Chat with this GPT') : translate('Start a New Chat in this Folder');
    if (conversationManagerStartNewChatButton) conversationManagerStartNewChatButton.innerText = lastSelectedConversationFolder?.gizmo_id ? translate('Start a New Chat with this GPT') : translate('Start a New Chat in this Folder');
  }
}
async function addSidebarFolderDrawer() {
  const { showFoldersInLeftSidebar } = cachedSettings;
  if (showFoldersInLeftSidebar) {
    closeSidebarFolder();
  }
  const lastSelectedConversationFolder = getLastSelectedConversationFolder();
  const isDefaultFolder = isDefaultConvFolder(lastSelectedConversationFolder?.id);
  const isRoot = !lastSelectedConversationFolder || lastSelectedConversationFolder?.id === 'all';

  const sidebarFolderDrawer = document.createElement('div');
  sidebarFolderDrawer.id = 'sidebar-folder-drawer';
  sidebarFolderDrawer.classList = `overflow-hidden transition transition-width flex flex-col h-full bg-token-sidebar-surface-primary z-50 ${showFoldersInLeftSidebar ? 'w-full' : 'absolute end-0 top-0 w-0'}`;

  const sidebarFolderHeader = document.createElement('div');
  sidebarFolderHeader.classList = `w-full ${showFoldersInLeftSidebar ? 'pb-3' : 'p-3'} flex justify-between items-center`;
  // move to left sidebar button
  const moveToLeftSidebar = document.createElement('button');
  moveToLeftSidebar.id = 'move-to-left-sidebar';
  moveToLeftSidebar.title = 'Move to Left Sidebar';
  moveToLeftSidebar.classList = `flex items-center justify-center h-full rounded-lg me-1 text-token-text-tertiary focus-visible:outline-0 hover:bg-token-sidebar-surface-secondary focus-visible:bg-token-sidebar-surface-secondary px-1 ${showFoldersInLeftSidebar ? 'hidden' : ''}`;
  moveToLeftSidebar.innerHTML = '<svg fill="currentColor" class="icon-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M105.4 233.8C99.13 240 96 248.2 96 256.4S99.13 272.8 105.4 279l150.4 135.9C286.7 442.8 336 420.9 336 379.3v-42.91h64c26.51 0 48-21.49 48-48v-64c0-26.51-21.49-48-48-48h-64V133.1c0-41.63-49.37-63.52-80.23-35.58L105.4 233.8zM288 224.4h112v64H288v89.37L150.6 256.4L288 135V224.4zM48 424V88C48 74.75 37.25 64 24 64S0 74.75 0 88v336C0 437.3 10.75 448 24 448S48 437.3 48 424z"/></svg>';
  moveToLeftSidebar.addEventListener('click', () => {
    chrome.storage.local.set({ settings: { ...cachedSettings, showFoldersInLeftSidebar: true } }).then(() => {
      toggleLeftSidebarSwitch(true);
    });
  });
  sidebarFolderHeader.appendChild(moveToLeftSidebar);
  // search input
  const searchInput = document.createElement('input');
  searchInput.id = 'sidebar-folder-search-input';
  searchInput.type = 'search';
  searchInput.placeholder = translate('Search conversations');
  searchInput.classList = 'w-full p-2 rounded-md border border-token-border-medium bg-token-main-surface-secondary text-token-text-tertiary';
  const delayedSearch = debounce(() => {
    const sidebarFolderContent = document.querySelector('#sidebar-folder-content');
    if (sidebarFolderContent) sidebarFolderContent.innerHTML = '';
    const sidebarBreadcrumbElement = document.querySelector('#sidebar-folder-breadcrumb');
    if (sidebarBreadcrumbElement) {
      selectedConversationFolderBreadcrumb = [];
      chrome.storage.local.set({ selectedConversationFolderBreadcrumb });
      generateConvFolderBreadcrumb(sidebarBreadcrumbElement, true);
    }
    fetchSidebarConversations();
  });
  searchInput.addEventListener('input', (e) => {
    if (e.target.value.trim().length > 2) {
      delayedSearch(e);
    } else if (e.target.value.length === 0) {
      loadSidebarFolders();
    }
  });
  sidebarFolderHeader.appendChild(searchInput);
  // new folder button
  const newFolderButton = document.createElement('button');
  newFolderButton.id = 'sidebar-new-folder-button';
  newFolderButton.title = 'Add New Folder';
  newFolderButton.classList = 'flex items-center justify-center h-full rounded-lg p-2 ms-1 text-token-text-tertiary focus-visible:outline-0 hover:bg-token-sidebar-surface-secondary focus-visible:bg-token-sidebar-surface-secondary';
  newFolderButton.innerHTML = '<svg stroke="currentColor" fill="currentColor" class="icon-lg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M464 96h-192l-64-64h-160C21.5 32 0 53.5 0 80v352C0 458.5 21.5 480 48 480h416c26.5 0 48-21.5 48-48v-288C512 117.5 490.5 96 464 96zM336 311.1h-56v56C279.1 381.3 269.3 392 256 392c-13.27 0-23.1-10.74-23.1-23.1V311.1H175.1C162.7 311.1 152 301.3 152 288c0-13.26 10.74-23.1 23.1-23.1h56V207.1C232 194.7 242.7 184 256 184s23.1 10.74 23.1 23.1V264h56C349.3 264 360 274.7 360 288S349.3 311.1 336 311.1z"/></svg>';
  chrome.runtime.sendMessage({
    type: 'checkHasSubscription',
  }, (hasSubscription) => {
    newFolderButton.addEventListener('click', () => {
      const curLastSelectedConversationFolder = getLastSelectedConversationFolder();
      if (curLastSelectedConversationFolder) {
        const curIsDefaultFolder = isDefaultConvFolder(curLastSelectedConversationFolder.id);
        if (curIsDefaultFolder) {
          toast('You cannot add a folder to this folder.', 'error');
          return;
        }
      }
      // document.querySelector('#sidebar-folder-drawer #folder-breadcrumb-root')?.click();
      const userFolders = document.querySelectorAll('#sidebar-folder-drawer #sidebar-folder-content > div[id^="conversation-folder-wrapper-"]');
      if (!hasSubscription && userFolders.length >= 5) {
        const error = { type: 'limit', title: 'You have reached the limit', message: 'You have reached the limits of Conversation Folders with free account. Upgrade to Pro to remove all limits.' };
        errorUpgradeConfirmation(error);
        return;
      }
      const noConversationFolders = document.querySelectorAll('#no-conversation-folders');
      noConversationFolders.forEach((el) => el.remove());

      const newFolder = {
        name: 'New Folder',
        color: generateRandomDarkColor(),
      };
      if (curLastSelectedConversationFolder) {
        newFolder.profile = curLastSelectedConversationFolder.profile?.id;
        newFolder.color = curLastSelectedConversationFolder.color;
        newFolder.parent_folder = curLastSelectedConversationFolder.id;
        newFolder.image_url = curLastSelectedConversationFolder.image || curLastSelectedConversationFolder.image_url;
        newFolder.gizmo_id = curLastSelectedConversationFolder.gizmo_id;
      }
      chrome.runtime.sendMessage({
        type: 'addConversationFolders',
        detail: {
          folders: [newFolder],
        },
      }, (newConversationFolders) => {
        if (newConversationFolders.error && newConversationFolders.error.type === 'limit') {
          errorUpgradeConfirmation(newConversationFolders.error);
          return;
        }
        if (!newConversationFolders || newConversationFolders.length === 0) return;
        addNewConvFolderElementToSidebar(newConversationFolders[0]);

        // rename new folder
        handleRenameConversationFolderClick(newConversationFolders[0].id, true);
      });
    });
  });
  sidebarFolderHeader.appendChild(newFolderButton);

  // move to right sidebar button
  const moveToRightSidebar = document.createElement('button');
  moveToRightSidebar.id = 'move-to-right-sidebar';
  moveToRightSidebar.title = 'Move to Right Sidebar';
  moveToRightSidebar.classList = `flex items-center justify-center h-full rounded-lg text-token-text-tertiary focus-visible:outline-0 hover:bg-token-sidebar-surface-secondary focus-visible:bg-token-sidebar-surface-secondary py-3 px-1 ${showFoldersInLeftSidebar ? '' : 'hidden'}`;
  moveToRightSidebar.innerHTML = '<svg fill="currentColor" class="icon-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M448 424V88C448 74.75 437.3 64 424 64S400 74.75 400 88v336c0 13.25 10.75 24 24 24S448 437.3 448 424zM342.6 278.3C348.9 272 352 263.8 352 255.6S348.9 239.3 342.6 233L192.2 97.09C161.3 69.21 112 91.11 112 132.7v42.91h-64c-26.51 0-48 21.49-48 48v64c0 26.51 21.49 48 48 48h64v43.29c0 41.63 49.37 63.52 80.23 35.58L342.6 278.3zM160 287.6H48v-64H160V134.3l137.4 121.4L160 376.1V287.6z"/></svg>';
  moveToRightSidebar.addEventListener('click', () => {
    chrome.storage.local.set({ settings: { ...cachedSettings, showFoldersInLeftSidebar: false } }).then(() => {
      toggleLeftSidebarSwitch(false);
    });
  });
  sidebarFolderHeader.appendChild(moveToRightSidebar);

  sidebarFolderDrawer.appendChild(sidebarFolderHeader);

  // breadcrumb
  const breadcrumbWrapper = document.createElement('div');
  breadcrumbWrapper.classList = `flex items-center justify-start pb-3 ${showFoldersInLeftSidebar ? '' : 'px-3'} w-full`;

  const breadcrumb = document.createElement('div');
  breadcrumb.id = 'sidebar-folder-breadcrumb';
  breadcrumb.classList = 'flex flex-wrap items-center justify-start bg-token-main-surface-tertiary p-2 rounded-lg border border-token-border-medium w-full';
  breadcrumb.addEventListener('click', async (event) => {
    // Check if the clicked element is a breadcrumb item.
    if (event.target && event.target.matches('[data-folder-id]')) {
      const folderId = event.target.getAttribute('data-folder-id');
      resetSidebarConversationSelection();
      if (folderId === 'root') {
        const sidebarFolderSearchInput = document.querySelector('#sidebar-folder-search-input');
        // loading-spinner-sidebar-folder-content
        const loadingSpinner = document.querySelector('#sidebar-folder-content #loading-spinner-sidebar-folder-content');
        if (!loadingSpinner && selectedConversationFolderBreadcrumb.length === 0 && sidebarFolderSearchInput?.value === '') return;
        selectedConversationFolderBreadcrumb = [];
        if (sidebarFolderSearchInput) sidebarFolderSearchInput.value = '';

        await chrome.storage.local.set({ selectedConversationFolderBreadcrumb });
        generateConvFolderBreadcrumb(breadcrumb, true);
        loadSidebarFolders();
        toggleNewConversationInFolderButton(true);
        return;
      }
      // Find the clicked folder in the breadcrumb list.
      const folderIndex = selectedConversationFolderBreadcrumb.findIndex((f) => f.id.toString() === folderId.toString());
      if (folderIndex !== -1 && (folderIndex < selectedConversationFolderBreadcrumb.length - 1 || event.shiftKey)) {
        selectedConversationFolderBreadcrumb = selectedConversationFolderBreadcrumb.slice(0, folderIndex + 1);
        await chrome.storage.local.set({ selectedConversationFolderBreadcrumb });
        toggleNewConversationInFolderButton(isDefaultConvFolder(folderId));
        generateConvFolderBreadcrumb(breadcrumb, true);
        throttleGetConvSubFolders(folderId, event.shiftKey);
        throttleFetchSidebarConversations(1, false, event.shiftKey);
      }
    }
  });
  breadcrumbWrapper.appendChild(breadcrumb);
  sidebarFolderDrawer.appendChild(breadcrumbWrapper);

  // new conv in folder button
  const newConversationInFolderButtonWrapper = document.createElement('div');
  newConversationInFolderButtonWrapper.id = 'new-conversation-in-folder-button-wrapper';
  newConversationInFolderButtonWrapper.classList = `items-center justify-start pb-3 ${showFoldersInLeftSidebar ? '' : 'px-3'} w-full ${(isDefaultFolder || isRoot) ? 'hidden' : 'flex'}`;

  const newConversationInFolderButton = document.createElement('button');
  newConversationInFolderButton.id = 'new-conversation-in-folder-button';
  newConversationInFolderButton.classList = 'btn btn-secondary w-full ';
  newConversationInFolderButton.innerHTML = lastSelectedConversationFolder?.gizmo_id ? translate('Start a New Chat with this GPT') : translate('Start a New Chat in this Folder');
  newConversationInFolderButton.addEventListener('click', () => {
    const curLastSelectedConversationFolder = getLastSelectedConversationFolder();
    folderForNewChat = curLastSelectedConversationFolder;
    startNewChat(false, curLastSelectedConversationFolder.gizmo_id);
    initiateNewChatFolderIndicator();
  });
  newConversationInFolderButtonWrapper.appendChild(newConversationInFolderButton);
  sidebarFolderDrawer.appendChild(newConversationInFolderButtonWrapper);

  // folder content
  const sidebarFolderContent = document.createElement('div');
  sidebarFolderContent.id = 'sidebar-folder-content';
  sidebarFolderContent.classList = `relative pb-20 ${showFoldersInLeftSidebar ? '' : 'px-3'} overflow-y-auto min-w-full h-full`;
  sidebarFolderContent.appendChild(loadingSpinner('sidebar-folder-content'));
  sidebarFolderDrawer.appendChild(sidebarFolderContent);

  const existingSidebarFolderDrawer = document.querySelector('#sidebar-folder-drawer');
  if (existingSidebarFolderDrawer) return;

  const nav = document.querySelector('nav');
  if (nav && showFoldersInLeftSidebar) {
    const originalHistory = getOriginalHistory();
    if (originalHistory) {
      originalHistory.id = 'original-history';
      originalHistory?.firstChild?.classList?.add('hidden');
      originalHistory.appendChild(sidebarFolderDrawer);
      // } else {
      //   chrome.storage.local.set({ settings: { ...cachedSettings, showFoldersInLeftSidebar: false } }).then(() => {
      //     refreshPage();
      //   });
    }
  } else {
    const main = document.querySelector('main');
    if (!main) return;
    main.appendChild(sidebarFolderDrawer);
  }

  generateConvFolderBreadcrumb(breadcrumb, true);

  const presentation = initializePresentation();
  if (!presentation) return;

  const floatingButtonWrapper = document.querySelector('#floating-button-wrapper');
  if (showFoldersInLeftSidebar) {
    sidebarFolderDrawer.style.width = '100%';
  } else {
    if (sidebarFolderIsOpen()) {
      // sidebarFolderDrawer.style.width = `${sidebarFolderDrawerWidth}px`;
      sidebarFolderDrawer.style.width = `${sidebarFolderDrawerWidth}px`;
      presentation.style.width = `calc(100% - ${sidebarFolderDrawerWidth}px)`;
      if (floatingButtonWrapper) floatingButtonWrapper.style.right = `calc(1rem + ${sidebarFolderDrawerWidth}px)`;
    } else if (!sidebarNoteIsOpen) {
      if (sidebarFolderDrawer) sidebarFolderDrawer.style.width = '0';
      presentation.style.width = '100%';
      if (floatingButtonWrapper) floatingButtonWrapper.style.right = '3rem';
    }
  }
}

function addNewConvFolderElementToSidebar(folder) {
  const defaultConversationFolders = document.querySelector('#sidebar-folder-content #default-conversation-folders');
  // add after default folders
  if (defaultConversationFolders) {
    defaultConversationFolders.after(conversationFolderElement(folder, true));
  } else {
    const sidebarFolderContent = document.querySelector('#sidebar-folder-content');
    sidebarFolderContent.prepend(conversationFolderElement(folder, true));
  }
  // scroll element into view
  const newFolderElement = document.querySelector(`#sidebar-folder-content #conversation-folder-wrapper-${folder.id}`);
  newFolderElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
}
// eslint-disable-next-line no-unused-vars
async function addConversationToSidebarFolder(conversation, folderId = 'all') {
  const lastSelectedConversationFolder = getLastSelectedConversationFolder();

  // create conversation element and add it to the top of the conversation list if looking at the all conversations folder
  if (lastSelectedConversationFolder?.id !== folderId) return;
  const sidebarFolderContent = document.querySelector('#sidebar-folder-content');
  if (!sidebarFolderContent) return;

  // if conversation already exist, remove it
  const existingConversationElement = document.querySelector(`#sidebar-folder-content #conversation-card-${conversation.conversation_id}`);
  let isFavorite = false;
  let hasNote = false;
  let conversationFolder = {};
  if (existingConversationElement) {
    isFavorite = !existingConversationElement.querySelector('svg[id^="conversation-favorite-indicator-"]')?.classList?.contains('hidden');
    hasNote = !existingConversationElement.querySelector('svg[id^="conversation-note-indicator-"]')?.classList?.contains('hidden');
    // <div id="conversation-card-folder-color-indicator-68004b4e-ec1c-800c-8338-c48b796776b1" data-folder-id="156" title="canvas" class="absolute w-1 h-full top-0 start-0 rounded-s-xl" style="background-color: #b68702;"></div>
    const folderIndicatorElement = existingConversationElement.querySelector('div[id^="conversation-card-folder-color-indicator-"]');
    if (folderIndicatorElement) {
      conversationFolder = {
        id: folderIndicatorElement.dataset.folderId,
        name: folderIndicatorElement.title,
        color: rgba2hex(folderIndicatorElement.style.backgroundColor),
      };
    }
    existingConversationElement.remove();
  }
  const conversationElement = createConversationElement({
    ...conversation, is_favorite: isFavorite, has_note: hasNote, folder: conversationFolder,
  });

  // if noConversationElement is present, remove it
  const noConversationElement = document.querySelector('#sidebar-folder-content #no-conversations-found');
  const firstConversationCard = document.querySelector('#sidebar-folder-content div[id^=conversation-card-]');
  if (noConversationElement) {
    noConversationElement.remove();
    sidebarFolderContent.appendChild(conversationElement);
  } else if (firstConversationCard) {
    firstConversationCard.before(conversationElement);
  }
  addConversationElementEventListeners(conversationElement, conversation);
  setTimeout(() => {
    // update title of conversation in the sidebar from the conversation history
    matchConversationNames(true);
  }, 2000);
}
// eslint-disable-next-line no-unused-vars
async function replaceConversationInSidebarFolder(conversation) {
  // create conversation element and add it to the top of the conversation list if looking at the all conversations folder
  const sidebarFolderContent = document.querySelector('#sidebar-folder-content');
  if (!sidebarFolderContent) return;
  const newConversationElement = createConversationElement(conversation);
  const existingConversationElement = document.querySelector(`#sidebar-folder-content #conversation-card-${conversation.conversation_id}`);

  if (existingConversationElement) {
    existingConversationElement.replaceWith(newConversationElement);
  }
  addConversationElementEventListeners(newConversationElement, conversation);
}
function getOriginalHistory() {
  return document.querySelector('nav div[class="flex flex-col gap-2 text-token-text-primary text-sm mt-5 first:mt-0 false"]') || document.querySelector('nav div[class="flex flex-col gap-2 text-token-text-primary text-sm false mt-5 pb-2"]');// || document.querySelector('nav div[class="group/sidebar"]').lastChild;
}
// eslint-disable-next-line no-unused-vars
async function createSidebarFolderButton(url = window.location) {
  const existingSidebarFolderDrawer = document.querySelector('#sidebar-folder-drawer');
  if (existingSidebarFolderDrawer) return;
  const { showFoldersInLeftSidebar } = cachedSettings;
  const nav = document.querySelector('nav');
  if (showFoldersInLeftSidebar && !nav) return;

  let originalHistory = getOriginalHistory();
  if (showFoldersInLeftSidebar && nav) {
    if (!originalHistory) {
      // before continue, check every 100ms for 5 sec if on new chat page
      let counter = 0;
      const interval = setInterval(() => {
        originalHistory = getOriginalHistory();
        if (originalHistory || counter >= 50) {
          clearInterval(interval);
          createSidebarFolderButton(url);
        }
        counter += 1;
      }, 100);
    }
  }

  // check if on /gpts
  const onGPTs = url.pathname.includes('/gpts');
  const onAdmin = url.pathname.includes('/admin');
  const onProject = url.pathname.startsWith('/g/g-p-') && url.pathname.endsWith('/project');

  if (!showFoldersInLeftSidebar) {
    const sidebarFolderButton = document.querySelector('#sidebar-folder-button');
    if (sidebarFolderButton) {
      sidebarFolderButton.classList.remove('hidden');
    } else {
      addSidebarFolderButton();
    }
  }

  await addSidebarFolderDrawer();

  if (!showFoldersInLeftSidebar && (onGPTs || onAdmin || onProject)) {
    const curSidebarFolderButton = document.querySelector('#sidebar-folder-button');
    curSidebarFolderButton.classList.add('hidden');
    const floatingButtonWrapper = document.querySelector('#floating-button-wrapper');
    if (floatingButtonWrapper) floatingButtonWrapper.style.right = '3rem';
  } else {
    loadSidebarFolders();
    setTimeout(() => {
      const loadingSpinnerElement = document.querySelector('#sidebar-folder-drawer #loading-spinner-sidebar-folder-content');
      if (loadingSpinnerElement) loadSidebarFolders();
    }, 1500);
  }
}
function animateConversationName(conversationTitleElement, newTitle) {
  conversationTitleElement.innerText = '';
  newTitle.split('').forEach((c, i) => {
    setTimeout(() => {
      conversationTitleElement.innerHTML += c;
    }, i * 50);
  });
}
function matchConversationNames(animate = false) {
  // get first 5 conversations in the sidebar: sidebar-folder-content div[id^=conversation-card-] and data-conversation-id
  const conversationsInSidebar = Array.from(document.querySelectorAll('#sidebar-folder-content div[id^=conversation-card-][data-conversation-id]')).slice(0, 5);

  conversationsInSidebar.forEach((convInSidebar, index) => {
    const convInHistory = document.querySelector(`nav li a[href$="${convInSidebar.dataset.conversationId}"]`);
    if (!convInHistory) return;
    if (convInHistory.innerText === 'New chat') return;
    if (convInSidebar.querySelector('#conversation-title').innerText === convInHistory.innerText) return;
    if (convInSidebar.querySelector('#conversation-title').innerText !== 'New chat') return;

    if (convInHistory) {
      if (index === 0 && animate) {
        animateConversationName(convInSidebar.querySelector('#conversation-title'), convInHistory.innerText);
      } else {
        convInSidebar.querySelector('#conversation-title').innerHTML = convInHistory.innerText;
      }
    }
  });
}
// eslint-disable-next-line no-unused-vars
async function goToFolder(folderList) {
  const sidebarFolderContent = document.querySelector('#sidebar-folder-content');
  if (!sidebarFolderContent) return;
  sidebarFolderContent.innerHTML = '';
  const sidebarBreadcrumbElement = document.querySelector('#sidebar-folder-breadcrumb');
  if (sidebarBreadcrumbElement) {
    selectedConversationFolderBreadcrumb = folderList;
    chrome.storage.local.set({ selectedConversationFolderBreadcrumb });
    generateConvFolderBreadcrumb(sidebarBreadcrumbElement, true);
  }

  await throttleGetConvSubFolders(folderList[folderList.length - 1].id);
  await throttleFetchSidebarConversations(1, false, true);
}
