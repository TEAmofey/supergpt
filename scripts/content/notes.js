/* global errorUpgradeConfirmation, createModal, debounce, dropdown, notesSortByList, getConversationName, createManager, getConversationIdFromUrl, translate, closeMenus, closeSidebarFolder, createHighlightOverlay, isDarkMode, sidebarFolderIsOpen, initializePresentation, showNoteSettingsMenu, cachedSettings */
const sidebarNoteInputWrapperWidth = 30; // percentage

let sidebarNoteIsOpen = false;
let noteListPageNumber = 1;
let noteListSearchTerm = '';
let lastSelectedNoteCardId = null;
// eslint-disable-next-line no-unused-vars
function loadNote() {
  const sidebarNoteButton = document.querySelector('#sidebar-note-button');
  if (sidebarNoteButton?.querySelector('#ping')) sidebarNoteButton?.querySelector('#ping')?.remove();

  const sidebarNoteInput = document.querySelector('#sidebar-note-input');
  if (!sidebarNoteInput) {
    addSidebarNoteInput();
  }

  const conversationIdFromUrl = getConversationIdFromUrl();
  if (!conversationIdFromUrl) {
    sidebarNoteInput.value = '';
    sidebarNoteInput.disabled = true;
    addStartChatOverlay();
    return;
  }
  hideStartChatOverlay();

  let noteIsLoading = true;
  if (sidebarNoteIsOpen) {
    setTimeout(() => {
      if (noteIsLoading) {
        sidebarNoteInput.value = '';
        sidebarNoteInput.disabled = true;
        addLoadingOverlay();
      }
    }, 500);
  }
  chrome.runtime.sendMessage({
    type: 'getNote',
    detail: {
      conversationId: conversationIdFromUrl,
    },
  }, (note) => {
    sidebarNoteInput.disabled = false;
    noteIsLoading = false;
    removeLoadingOverlay();
    if (note) {
      const curConversationIdFromUrl = getConversationIdFromUrl();

      if (!sidebarNoteInput) {
        addSidebarNoteInput();
      }
      if (conversationIdFromUrl === curConversationIdFromUrl) {
        sidebarNoteInput.value = note.text;
      }
      toggleNoteIndicator(conversationIdFromUrl, note.text);
    }
  });
}

// eslint-disable-next-line no-unused-vars
function hideStartChatOverlay() {
  const startChatWrapper = document.querySelector('#start-chat-overlay');
  if (startChatWrapper) startChatWrapper.remove();
}
// eslint-disable-next-line no-unused-vars
function addStartChatOverlay() {
  const sidebarNoteInputWrapper = document.querySelector('#sidebar-note-input-wrapper');
  if (!sidebarNoteInputWrapper) return;
  const existingStartChatOverlay = sidebarNoteInputWrapper.querySelector('#start-chat-overlay');
  if (existingStartChatOverlay) return;
  const startChatWrapper = document.createElement('div');
  startChatWrapper.id = 'start-chat-overlay';
  startChatWrapper.classList = 'w-full absolute top-0 bg-black/50 dark:bg-black/80 rounded-bs-md flex justify-center items-center';
  startChatWrapper.style = 'top: 56px; height: calc(100% - 56px);';
  sidebarNoteInputWrapper.appendChild(startChatWrapper);

  const startChatText = document.createElement('div');
  startChatText.classList = 'flex flex-wrap p-3 items-center rounded-md bg-token-main-surface-primary text-token-text-primary text-sm';
  startChatText.innerHTML = 'Start the chat to enable notes';
  startChatWrapper.appendChild(startChatText);
}
function addLoadingOverlay() {
  const sidebarNoteInputWrapper = document.querySelector('#sidebar-note-input-wrapper');
  const loadingWrapper = document.createElement('div');
  loadingWrapper.id = 'note-loading-wrapper';
  loadingWrapper.classList = 'w-full absolute top-0 bg-black/50 dark:bg-black/80 rounded-bs-md flex justify-center items-center';
  loadingWrapper.style = 'top: 56px; height: calc(100% - 56px);';
  loadingWrapper.innerHTML = '<svg x="0" y="0" viewbox="0 0 40 40" class="spinner icon-xl"><circle fill="transparent" stroke="#ffffff50" stroke-width="2" stroke-linecap="round" stroke-dasharray="125.6" cx="20" cy="20" r="18"></circle></svg>';
  sidebarNoteInputWrapper.appendChild(loadingWrapper);
}
function removeLoadingOverlay() {
  const loadingWrapper = document.querySelector('#note-loading-wrapper');
  if (loadingWrapper) loadingWrapper.remove();
}
function toggleSidebarNote() {
  closeSidebarFolder();
  const sidebarNoteInputWrapper = document.querySelector('#sidebar-note-input-wrapper');
  if (!sidebarNoteInputWrapper) {
    addSidebarNoteInput();
    // wait 2 seconds for the sidebarNoteInputWrapper to be added
    setTimeout(() => {
      toggleSidebarNote();
    }, 1000);
    return;
  }
  const main = document.querySelector('main');
  const presentation = initializePresentation();
  if (!presentation) return;

  const floatingButtonWrapper = document.querySelector('#floating-button-wrapper');
  if (sidebarNoteIsOpen) {
    sidebarNoteIsOpen = false;
    sidebarNoteInputWrapper.style.width = '0';
    presentation.style.width = '100%';
    if (floatingButtonWrapper) floatingButtonWrapper.style.right = '3rem';
  } else {
    sidebarNoteIsOpen = true;
    // sidebarNoteInputWrapper.style.width = `${main.offsetWidth * (sidebarNoteInputWrapperWidth/100)}px`;
    sidebarNoteInputWrapper.style.width = `${sidebarNoteInputWrapperWidth}%`;
    presentation.style.width = `${100 - sidebarNoteInputWrapperWidth}%`;
    if (floatingButtonWrapper) floatingButtonWrapper.style.right = `calc(1rem + ${main.offsetWidth * (sidebarNoteInputWrapperWidth / 100)}px)`;
  }
}
// eslint-disable-next-line no-unused-vars
function closeSidebarNote() {
  const sidebarNoteInputWrapper = document.querySelector('#sidebar-note-input-wrapper');
  if (sidebarNoteInputWrapper) sidebarNoteInputWrapper.style.width = '0';
  sidebarNoteIsOpen = false;
}

function addSidebarNoteButton() {
  const existingSidebarNoteButton = document.querySelector('#sidebar-note-button');
  if (existingSidebarNoteButton) existingSidebarNoteButton.remove();
  const { showSidebarNoteButton } = cachedSettings;

  const sidebarNoteButton = document.createElement('button');
  sidebarNoteButton.id = 'sidebar-note-button';
  sidebarNoteButton.innerHTML = translate('Notes');
  sidebarNoteButton.classList = `absolute flex items-center justify-center border border-token-border-medium text-token-text-tertiary hover:border-token-border-medium hover:text-token-text-primary text-xs font-sans cursor-pointer rounded-t-md z-10 bg-token-main-surface-primary opacity-85 hover:opacity-100 ${showSidebarNoteButton ? '' : 'hidden'}`;
  sidebarNoteButton.style = 'top: 12rem;right: -1rem;width: 4rem;height: 2rem;flex-wrap:wrap;transform: rotate(-90deg);';
  sidebarNoteButton.addEventListener('click', () => {
    toggleSidebarNote();
    if (sidebarNoteButton.querySelector('#ping')) sidebarNoteButton.querySelector('#ping').remove();
  });
  document.body.appendChild(sidebarNoteButton);
}
function resetNoteManagerParams() {
  noteListPageNumber = 1;
  noteListSearchTerm = '';
  lastSelectedNoteCardId = null;
}
// eslint-disable-next-line no-unused-vars
function noteListModalContent() {
  resetNoteManagerParams();
  const content = document.createElement('div');
  content.id = 'modal-content-note-list';
  content.style = 'display: flex; flex-direction: column; justify-content: start; align-items: center;overflow-y: hidden;height:100%;';

  // note filter
  const noteListFilterBar = document.createElement('div');
  noteListFilterBar.style = 'display: flex; flex-direction: row; justify-content: space-between; align-items: flex-start; width: 100%; z-index: 100; position: sticky; top: 0;';
  noteListFilterBar.classList = 'bg-token-main-surface-primary p-2 border-b border-token-border-medium';

  // add note search box
  const noteListSearchInput = document.createElement('input');
  noteListSearchInput.type = 'search';
  noteListSearchInput.classList = 'text-token-text-primary bg-token-main-surface-secondary border border-token-border-medium text-sm rounded-md w-full h-full';
  noteListSearchInput.placeholder = translate('Search notes');
  noteListSearchInput.id = 'note-manager-search-input';
  noteListSearchInput.autocomplete = 'off';

  const delayedSearch = debounce((e) => {
    const { value } = e.target;
    noteListSearchTerm = value;
    noteListPageNumber = 1;
    fetchNotes(noteListPageNumber);
  });
  noteListSearchInput.addEventListener('input', (e) => {
    if (e.target.value.trim().length > 2) {
      delayedSearch(e);
    } else if (e.target.value.length === 0) {
      noteListSearchTerm = '';
      noteListPageNumber = 1;
      fetchNotes(noteListPageNumber);
    }
  });
  noteListFilterBar.appendChild(noteListSearchInput);

  const { selectedNotesSortBy, selectedNotesView } = cachedSettings;
  // add sort button
  const sortBySelectorWrapper = document.createElement('div');
  sortBySelectorWrapper.style = 'position:relative;width:150px;z-index:1000;margin-left:8px;';
  sortBySelectorWrapper.innerHTML = dropdown('Notes-SortBy', notesSortByList, selectedNotesSortBy, 'code', 'right');
  noteListFilterBar.appendChild(sortBySelectorWrapper);
  // add compact view button
  const compactViewButton = document.createElement('button');
  compactViewButton.classList = 'h-full aspect-1 flex items-center justify-center rounded-lg px-2 ms-2 text-token-text-tertiary focus-visible:outline-0 bg-token-sidebar-surface-primary hover:bg-token-sidebar-surface-secondary focus-visible:bg-token-sidebar-surface-secondary border border-token-border-medium';
  compactViewButton.innerHTML = selectedNotesView === 'list' ? '<svg fill="currentColor" class="icon-md" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M320 192h96c17.6 0 32-14.4 32-32V64c0-17.6-14.4-32-32-32h-96c-17.6 0-32 14.4-32 32v96C288 177.6 302.4 192 320 192zM336 80h64v64h-64V80zM480 256h-160c-17.67 0-32 14.33-32 32v160c0 17.67 14.33 32 32 32h160c17.67 0 32-14.33 32-32V288C512 270.3 497.7 256 480 256zM464 432h-128v-128h128V432zM206.4 335.1L152 394.9V56.02C152 42.76 141.3 32 128 32S104 42.76 104 56.02v338.9l-54.37-58.95c-4.719-5.125-11.16-7.719-17.62-7.719c-5.812 0-11.66 2.094-16.28 6.375c-9.75 8.977-10.34 24.18-1.344 33.94l95.1 104.1c9.062 9.82 26.19 9.82 35.25 0l95.1-104.1c9-9.758 8.406-24.96-1.344-33.94C230.5 325.5 215.3 326.2 206.4 335.1z"/></svg>' : '<svg fill="currentColor" class="icon-md" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M480 256h-160c-17.67 0-32 14.33-32 32v160c0 17.67 14.33 32 32 32h160c17.67 0 32-14.33 32-32V288C512 270.3 497.7 256 480 256zM464 432h-128v-128h128V432zM320 192h96c17.6 0 32-14.4 32-32V64c0-17.6-14.4-32-32-32h-96c-17.6 0-32 14.4-32 32v96C288 177.6 302.4 192 320 192zM336 80h64v64h-64V80zM145.6 39.37c-9.062-9.82-26.19-9.82-35.25 0L14.38 143.4c-9 9.758-8.406 24.96 1.344 33.94C20.35 181.7 26.19 183.8 32 183.8c6.469 0 12.91-2.594 17.62-7.719L104 117.1v338.9C104 469.2 114.8 480 128 480s24-10.76 24-24.02V117.1l54.37 58.95C215.3 185.8 230.5 186.5 240.3 177.4C250 168.4 250.6 153.2 241.6 143.4L145.6 39.37z"/></svg>';
  compactViewButton.addEventListener('click', () => {
    // switch between aspect-1 to aspect-2 for all noteItem
    const noteItems = document.querySelectorAll('[id^=note-item-]');
    noteItems.forEach((noteItem) => {
      if (cachedSettings.selectedNotesView === 'list') {
        noteItem.classList.remove('aspect-2');
        noteItem.classList.add('aspect-1');
      } else {
        noteItem.classList.remove('aspect-1');
        noteItem.classList.add('aspect-2');
      }
    });
    if (cachedSettings.selectedNotesView === 'list') {
      compactViewButton.innerHTML = '<svg fill="currentColor" class="icon-md" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M480 256h-160c-17.67 0-32 14.33-32 32v160c0 17.67 14.33 32 32 32h160c17.67 0 32-14.33 32-32V288C512 270.3 497.7 256 480 256zM464 432h-128v-128h128V432zM320 192h96c17.6 0 32-14.4 32-32V64c0-17.6-14.4-32-32-32h-96c-17.6 0-32 14.4-32 32v96C288 177.6 302.4 192 320 192zM336 80h64v64h-64V80zM145.6 39.37c-9.062-9.82-26.19-9.82-35.25 0L14.38 143.4c-9 9.758-8.406 24.96 1.344 33.94C20.35 181.7 26.19 183.8 32 183.8c6.469 0 12.91-2.594 17.62-7.719L104 117.1v338.9C104 469.2 114.8 480 128 480s24-10.76 24-24.02V117.1l54.37 58.95C215.3 185.8 230.5 186.5 240.3 177.4C250 168.4 250.6 153.2 241.6 143.4L145.6 39.37z"/></svg>';
    } else {
      compactViewButton.innerHTML = '<svg fill="currentColor" class="icon-md" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M320 192h96c17.6 0 32-14.4 32-32V64c0-17.6-14.4-32-32-32h-96c-17.6 0-32 14.4-32 32v96C288 177.6 302.4 192 320 192zM336 80h64v64h-64V80zM480 256h-160c-17.67 0-32 14.33-32 32v160c0 17.67 14.33 32 32 32h160c17.67 0 32-14.33 32-32V288C512 270.3 497.7 256 480 256zM464 432h-128v-128h128V432zM206.4 335.1L152 394.9V56.02C152 42.76 141.3 32 128 32S104 42.76 104 56.02v338.9l-54.37-58.95c-4.719-5.125-11.16-7.719-17.62-7.719c-5.812 0-11.66 2.094-16.28 6.375c-9.75 8.977-10.34 24.18-1.344 33.94l95.1 104.1c9.062 9.82 26.19 9.82 35.25 0l95.1-104.1c9-9.758 8.406-24.96-1.344-33.94C230.5 325.5 215.3 326.2 206.4 335.1z"/></svg>';
    }
    chrome.storage.local.set({
      settings: {
        ...cachedSettings,
        selectedNotesView: cachedSettings.selectedNotesView === 'list' ? 'grid' : 'list',
      },

    });
  });
  noteListFilterBar.appendChild(compactViewButton);

  content.appendChild(noteListFilterBar);

  const noteList = noteListComponent();
  content.appendChild(noteList);
  return content;
}
function fetchNotes(newPageNumber = 1) {
  const { selectedNotesSortBy } = cachedSettings;

  noteListPageNumber = newPageNumber;
  chrome.runtime.sendMessage({
    type: 'getNotes',
    detail: {
      page: noteListPageNumber,
      sortBy: selectedNotesSortBy.code,
      searchTerm: noteListSearchTerm,
    },
  }, (data) => {
    renderNoteCards(data);
    if (newPageNumber === 1) {
      const noteList = document.querySelector('#note-list');
      noteList?.scrollTo(0, 0);
    }
  });
}
function noteListComponent() {
  const noteList = document.createElement('div');
  noteList.id = 'note-list';
  noteList.classList = 'w-full grid grid-cols-4 gap-4 overflow-y-auto p-4 pb-32 h-full content-start';

  // show loading spinner
  const noResult = document.createElement('div');
  noResult.style = 'position:absolute;display: flex; justify-content: center; align-items: center; height: 340px; width: 100%;';
  noResult.innerHTML = '<svg x="0" y="0" viewbox="0 0 40 40" class="spinner icon-xl"><circle fill="transparent" stroke="#ffffff50" stroke-width="2" stroke-linecap="round" stroke-dasharray="125.6" cx="20" cy="20" r="18"></circle></svg>';
  noteList.appendChild(noResult);
  return noteList;
}
function renderNoteCards(data) {
  const noteList = document.querySelector('#note-list');
  if (!noteList) return;
  const existingLoadMoreButton = noteList.querySelector('#load-more-notes-button');
  if (existingLoadMoreButton) existingLoadMoreButton.remove();
  if (noteListPageNumber === 1) noteList.innerHTML = '';
  if (data.results.length === 0) {
    const noResult = document.createElement('div');
    noResult.style = 'position:absolute;display: flex; justify-content: center; align-items: center; height: 340px; width: 100%;';
    noResult.textContent = translate('No notes found');
    noteList.appendChild(noResult);
    return;
  }
  data.results.forEach((note) => {
    const noteItem = document.createElement('div');
    noteItem.id = `note-item-${note.id}`;
    // set data attribute for conversation id
    noteItem.dataset.conversationId = note.conversation_id;
    noteItem.classList = `group flex flex-col w-full ${cachedSettings.selectedNotesView === 'list' ? 'aspect-2' : 'aspect-1'} p-3 pb-2 h-auto cursor-pointer border bg-token-main-surface-primary border-token-border-medium rounded-md overflow-hidden`;
    noteItem.style = 'height:max-content;outline-offset: 4px; outline: none;';
    noteItem.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMenus();
      updateSelectedNoteCard(note.id);
      openNotePreviewModal(note);
    });
    const noteItemHeader = document.createElement('div');
    noteItemHeader.classList = 'flex justify-between items-center border-b border-token-border-medium pb-1';
    const noteItemTitle = document.createElement('div');
    noteItemTitle.id = `note-name-${note.id}`;
    noteItemTitle.classList = 'text-token-text-primary text-md whitespace-nowrap overflow-hidden text-ellipsis';
    noteItemTitle.textContent = note.name;
    noteItemTitle.title = note.name;
    noteItemHeader.appendChild(noteItemTitle);

    const notItemBody = document.createElement('div');
    notItemBody.id = `note-item-body-${note.conversation_id}`;
    notItemBody.classList = 'flex flex-1 text-token-text-tertiary text-sm py-1 whitespace-wrap overflow-hidden text-ellipsis break-all border-b border-token-border-medium ';
    notItemBody.textContent = note.text;
    notItemBody.title = note.text;

    const noteItemActions = document.createElement('div');
    noteItemActions.classList = 'flex justify-between items-center pt-2';

    const noteDate = document.createElement('div');
    noteDate.id = `note-date-${note.id}`;
    noteDate.classList = 'text-token-text-tertiary text-xs';
    if (cachedSettings.selectedNotesSortBy.code === 'created_at') {
      noteDate.textContent = new Date(note.created_at).toLocaleString();
      noteDate.title = `Created: ${new Date(note.created_at).toLocaleString()}`;
    } else {
      noteDate.textContent = new Date(note.updated_at).toLocaleString();
      noteDate.title = `Last updated: ${new Date(note.updated_at).toLocaleString()}`;
    }
    noteItemActions.appendChild(noteDate);

    const noteSettingsButton = document.createElement('button');
    noteSettingsButton.id = `note-settings-button-${note.id}`;
    noteSettingsButton.classList = 'relative flex items-center justify-center h-8 rounded-lg px-2 text-token-text-tertiary focus-visible:outline-0 hover:bg-token-sidebar-surface-tertiary focus-visible:bg-token-sidebar-surface-secondary';
    noteSettingsButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md"><path fill-rule="evenodd" clip-rule="evenodd" d="M3 12C3 10.8954 3.89543 10 5 10C6.10457 10 7 10.8954 7 12C7 13.1046 6.10457 14 5 14C3.89543 14 3 13.1046 3 12ZM10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12ZM17 12C17 10.8954 17.8954 10 19 10C20.1046 10 21 10.8954 21 12C21 13.1046 20.1046 14 19 14C17.8954 14 17 13.1046 17 12Z" fill="currentColor"></path></svg>';
    noteSettingsButton.addEventListener('click', async (e) => {
      e.stopPropagation();
      closeMenus();
      const curNoteList = document.querySelector('#modal-manager #note-list');
      const noteCard = document.querySelector(`#modal-manager #note-item-${note.id}`);
      const index = curNoteList ? Array.from(curNoteList.children).indexOf(noteCard) : 0;

      const is4n = (index + 1) % 4 === 0;
      const leftMenu = is4n;

      showNoteSettingsMenu(noteSettingsButton, note, leftMenu);
    });
    noteItemActions.appendChild(noteSettingsButton);

    noteItem.appendChild(noteItemHeader);
    noteItem.appendChild(notItemBody);
    noteItem.appendChild(noteItemActions);
    noteList.appendChild(noteItem);
  });
  // add loading spinner
  if (data.next) {
    const loadMoreButton = document.createElement('button');
    loadMoreButton.id = 'load-more-notes-button';
    loadMoreButton.classList = 'w-full h-full flex justify-center items-center';
    loadMoreButton.innerHTML = '<svg x="0" y="0" viewbox="0 0 40 40" class="spinner icon-xl"><circle fill="transparent" stroke="#ffffff50" stroke-width="2" stroke-linecap="round" stroke-dasharray="125.6" cx="20" cy="20" r="18"></circle></svg>';
    loadMoreButton.addEventListener('click', () => {
      fetchNotes(noteListPageNumber + 1);
    });
    noteList.appendChild(loadMoreButton);
    // add intersection observer to load more notes automatically
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadMoreButton?.click();
        }
      });
    }, { threshold: 0.5 });
    if (loadMoreButton) {
      observer.observe(loadMoreButton);
    }
  }
}
function updateSelectedNoteCard(noteId) {
  if (lastSelectedNoteCardId) {
    const prevSelectedCard = document.querySelector(`#modal-manager #note-item-${lastSelectedNoteCardId}`);
    if (prevSelectedCard) prevSelectedCard.style.outline = 'none';
  }
  if (!noteId) return;
  const noteCard = document.querySelector(`#modal-manager #note-item-${noteId}`);
  lastSelectedNoteCardId = noteId;
  noteCard.style.outline = `2px solid ${isDarkMode() ? '#fff' : '#000'}`;
}
function openNotePreviewModal(note) {
  const bodyContent = notePreviewModalContent(note);
  const actionsBarContent = notePreviewModalActions(note);
  createModal(note.name, '', bodyContent, actionsBarContent, false, 'small');
  // if close note preview modal and text is empty, rmove the note card
  const closeButton = document.querySelector(`#modal-close-button-${note.name.toLowerCase().replaceAll(' ', '-')}`);
  closeButton?.addEventListener('click', () => {
    setTimeout(() => {
      if (document.querySelector(`#note-item-body-${note.conversation_id}`)?.textContent === '') {
        document.querySelector(`#modal-manager #note-item-${note.id}`)?.remove();
      }
    }, 200);
  });
}
function notePreviewModalContent(note) {
  // get note from server everytime you open in case it was edited once and closed
  const content = document.createElement('div');
  content.id = 'modal-content-note-preview';
  content.classList = 'w-full h-full flex justify-center items-center overflow-hidden';
  const notePreview = document.createElement('div');
  notePreview.classList = 'w-full rounded-md flex justify-center items-center relative';
  notePreview.style = 'height: 100%;';
  notePreview.innerHTML = '<svg x="0" y="0" viewbox="0 0 40 40" class="spinner icon-xl"><circle fill="transparent" stroke="#ffffff50" stroke-width="2" stroke-linecap="round" stroke-dasharray="125.6" cx="20" cy="20" r="18"></circle></svg>';

  const notePreviewText = document.createElement('textarea');
  notePreviewText.id = 'note-preview-text';
  notePreviewText.classList = 'w-full h-full bg-token-main-surface-primary border border-token-border-medium text-token-text-primary p-3 rounded-md placeholder:text-gray-500 text-lg resize-none';
  notePreviewText.placeholder = 'Add notes here...\n- Each conversation has its own note\n- Notes are synced accross devices';

  chrome.runtime.sendMessage({
    type: 'getNote',
    detail: {
      conversationId: note.conversation_id,
    },
  }, (data) => {
    notePreview.innerHTML = '';
    notePreviewText.value = data.text;
    const conversationId = data.conversation_id || note.conversation_id;
    const name = data.name || note.name;
    notePreviewText.addEventListener('blur', () => {
      chrome.runtime.sendMessage({
        type: 'updateNote',
        detail: {
          conversationId,
          name,
          text: notePreviewText.value,
        },
      }, (newNote) => {
        if (newNote.error && newNote.error.type === 'limit') {
          errorUpgradeConfirmation(newNote.error);
          return;
        }
        // update note manager card
        const noteItemBody = document.querySelector(`#note-item-body-${conversationId}`);
        if (noteItemBody) {
          noteItemBody.textContent = notePreviewText.value;
        }
        const noteItemDate = document.querySelector(`#note-date-${data.id}`);
        if (noteItemDate) {
          if (noteItemDate?.title?.includes('updated')) {
            noteItemDate.textContent = new Date().toLocaleString();
            noteItemDate.title = `Last updated: ${new Date().toLocaleString()}`;
          }
        }
        toggleNoteIndicator(conversationId, notePreviewText.value);
        // update sidebar note input if exists
        const conversationIdFromUrl = getConversationIdFromUrl();
        if (conversationIdFromUrl && conversationIdFromUrl === conversationId) {
          const sidebarNoteInput = document.querySelector('#sidebar-note-input');
          if (sidebarNoteInput) {
            sidebarNoteInput.value = notePreviewText.value;
          }
        }
      });
    });

    const searchValue = document.querySelector('#modal-manager input[id$="-manager-search-input"]')?.value;
    if (searchValue) {
      const overlayElemet = createHighlightOverlay(notePreviewText, searchValue);
      notePreview.appendChild(overlayElemet);
    }
    notePreview.appendChild(notePreviewText);
  });
  content.appendChild(notePreview);
  return content;
}
function notePreviewModalActions(note) {
  const actionsBar = document.createElement('div');
  actionsBar.classList = 'flex w-full justify-end items-center pt-2';
  const openConversationButton = document.createElement('button');
  openConversationButton.classList = 'btn btn-small btn-primary';
  openConversationButton.textContent = `${translate('Open Conversation in New Tab')} ➜`;
  openConversationButton.addEventListener('click', () => {
    window.open(`https://chatgpt.com/c/${note.conversation_id}`, '_blank');
  });
  actionsBar.appendChild(openConversationButton);
  return actionsBar;
}
function addSidebarNoteInput() {
  const sidebarNoteInputWrapper = document.createElement('div');
  sidebarNoteInputWrapper.id = 'sidebar-note-input-wrapper';
  sidebarNoteInputWrapper.classList = 'absolute end-0 w-0 top-0 overflow-hidden transition transition-width z-10 flex flex-col h-full';
  // note title
  const sidebarNoteHeader = document.createElement('div');
  sidebarNoteHeader.classList = 'w-full bg-token-main-surface-secondary border border-token-border-medium p-3 h-14 rounded-ts-md flex justify-between items-center';

  const sidebarNoteTitle = document.createElement('div');
  sidebarNoteTitle.innerHTML = `${translate('Notes')} <a href="https://www.youtube.com/watch?v=JjBuaNtvTv4" target="_blank" rel="noreferrer"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md ps-0.5 text-token-text-tertiary h-5 w-5"><path fill="currentColor" d="M13 12a1 1 0 1 0-2 0v4a1 1 0 1 0 2 0zM12 9.5A1.25 1.25 0 1 0 12 7a1.25 1.25 0 0 0 0 2.5"></path><path fill="currentColor" fill-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2M4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0" clip-rule="evenodd"></path></svg></a>`;
  sidebarNoteTitle.classList = 'w-1/2 text-token-text-primary h-14 flex items-center justify-start gap-2';
  sidebarNoteHeader.appendChild(sidebarNoteTitle);

  const seeAllNotesButton = document.createElement('button');
  seeAllNotesButton.textContent = translate('See All Notes');
  seeAllNotesButton.classList = 'btn flex justify-center gap-2 btn-secondary border';
  seeAllNotesButton.addEventListener('click', () => {
    createManager('notes');
  });
  sidebarNoteHeader.appendChild(seeAllNotesButton);
  sidebarNoteInputWrapper.appendChild(sidebarNoteHeader);

  const sidebarNoteInput = document.createElement('textarea');
  sidebarNoteInput.id = 'sidebar-note-input';
  sidebarNoteInput.placeholder = 'Add notes here...\n- Each conversation has its own note\n- Notes are synced accross devices\n- To see all notes and search them, click on "See All Notes" button';
  sidebarNoteInput.classList = 'w-full bg-token-main-surface-secondary border border-token-border-medium text-token-text-primary p-3 rounded-bs-md flex-grow placeholder:text-gray-500';
  sidebarNoteInput.style = 'border-top:none;';
  sidebarNoteInputWrapper.appendChild(sidebarNoteInput);
  sidebarNoteInput.addEventListener('blur', () => {
    const conversationIdFromUrl = getConversationIdFromUrl();
    if (conversationIdFromUrl) {
      const conversationName = getConversationName(conversationIdFromUrl);
      const text = document.querySelector('#sidebar-note-input').value;
      chrome.runtime.sendMessage({
        type: 'updateNote',
        detail: {
          conversationId: conversationIdFromUrl,
          name: conversationName,
          text,
        },
      }, (newNote) => {
        if (newNote.error && newNote.error.type === 'limit') {
          errorUpgradeConfirmation(newNote.error);
          return;
        }
        toggleNoteIndicator(conversationIdFromUrl, text);
      });
    }
  });
  const main = document.querySelector('main');
  if (!main) return;
  const existingSidebarNoteInputWrapper = main.querySelector('#sidebar-note-input-wrapper');
  if (existingSidebarNoteInputWrapper) return;
  main.appendChild(sidebarNoteInputWrapper);
  const presentation = initializePresentation();
  if (!presentation) return;

  const floatingButtonWrapper = document.querySelector('#floating-button-wrapper');
  if (sidebarNoteIsOpen) {
    // sidebarNoteInputWrapper.style.width = `${main.offsetWidth * (sidebarNoteInputWrapperWidth/100)}px`;
    sidebarNoteInputWrapper.style.width = `${sidebarNoteInputWrapperWidth}%`;
    presentation.style.width = `${100 - sidebarNoteInputWrapperWidth}%`;
    if (floatingButtonWrapper) floatingButtonWrapper.style.right = `calc(1rem + ${main.offsetWidth * (sidebarNoteInputWrapperWidth / 100)}px)`;
  } else if (!sidebarFolderIsOpen()) {
    sidebarNoteInputWrapper.style.width = '0';
    presentation.style.width = '100%';
    if (floatingButtonWrapper) floatingButtonWrapper.style.right = '3rem';
  }
}
function toggleNoteIndicator(conversationId, text) {
  const noteIndicators = document.querySelectorAll(`#conversation-note-indicator-${conversationId}`);
  if (noteIndicators.length === 0) return;
  for (let i = 0; i < noteIndicators.length; i += 1) {
    const noteIndicator = noteIndicators[i];
    if (text.length > 0) {
      noteIndicator.classList.remove('hidden');
    } else {
      noteIndicator.classList.add('hidden');
    }
  }
}

// eslint-disable-next-line no-unused-vars
function hideNotesButton() {
  const sidebarNoteButton = document.querySelector('#sidebar-note-button');
  if (sidebarNoteButton) {
    sidebarNoteButton.classList.add('hidden');
  }
  if (sidebarNoteIsOpen) {
    toggleSidebarNote();
  }
}
// eslint-disable-next-line no-unused-vars
function createSidebarNotesButton(url = window.location) {
  // check if on /gpts
  const onGPTs = url.pathname.includes('/gpts');
  const onAdmin = url.pathname.includes('/admin');
  const onProject = url.pathname.startsWith('/g/g-p-') && url.pathname.endsWith('/project');

  const sidebarNoteButton = document.querySelector('#sidebar-note-button');
  if (sidebarNoteButton) {
    sidebarNoteButton.classList.remove('hidden');
  } else {
    addSidebarNoteButton();
  }
  const sidebarNoteInputWrapper = document.querySelector('#sidebar-note-input-wrapper');
  if (!sidebarNoteInputWrapper) {
    addSidebarNoteInput();
  }

  if (onGPTs || onAdmin || onProject) {
    const curSidebarNoteButton = document.querySelector('#sidebar-note-button');
    curSidebarNoteButton.classList.add('hidden');
    const floatingButtonWrapper = document.querySelector('#floating-button-wrapper');
    if (floatingButtonWrapper) floatingButtonWrapper.style.right = '3rem';
  } else {
    loadNote();
  }
}
