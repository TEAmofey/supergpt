/* global translate, adjustMenuPosition, closeMenus, updateSelectedNoteCard, openNotePreviewModal, showConfirmDialog, getConversationIdFromUrl, toggleNoteIndicator, uploadTextToInput */
// eslint-disable-next-line no-unused-vars
async function showNoteSettingsMenu(noteSettingsElement, note, leftMenu = false) {
  const noteId = note.id;

  const { right, top } = noteSettingsElement.getBoundingClientRect();

  const translateX = leftMenu ? right - 244 : right - 6;
  const translateY = top + 20;

  const menu = `<div id="note-settings-menu" dir="ltr" style="transform:translate3d(${translateX}px,${translateY}px,0);position:fixed;left:0;top:0;min-width:max-content;z-index:10001;--radix-popper-anchor-width:18px;--radix-popper-anchor-height:18px;--radix-popper-available-width:1167px;--radix-popper-available-height:604px;--radix-popper-transform-origin:0% 0px"><div data-side="bottom" data-align="start" role="menu" aria-orientation="vertical" data-state="open" data-radix-menu-content="" dir="ltr" aria-labelledby="radix-:r6g:" class="max-w-xs rounded-lg border text-token-text-primary border-token-border-medium bg-token-main-surface-primary shadow-lg" tabindex="-1" data-orientation="vertical" style="min-width:200px; outline:0;--radix-dropdown-menu-content-transform-origin:var(--radix-popper-transform-origin);--radix-dropdown-menu-content-available-width:var(--radix-popper-available-width);--radix-dropdown-menu-content-available-height:var(--radix-popper-available-height);--radix-dropdown-menu-trigger-width:var(--radix-popper-anchor-width);--radix-dropdown-menu-trigger-height:var(--radix-popper-anchor-height);pointer-events:auto">
  
  <div role="menuitem" id="rename-note-settings-button-${noteId}" class="flex items-center justify-between gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item=""><div class="flex gap-2"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" fill="none" class="icon-md"><path fill="currentColor" d="M184 160C193.5 160 202.1 165.6 205.9 174.3L269.9 318.3C275.3 330.4 269.9 344.5 257.7 349.9C245.6 355.3 231.5 349.9 226.1 337.7L221.7 328H146.3L141.9 337.7C136.5 349.9 122.4 355.3 110.3 349.9C98.14 344.5 92.69 330.4 98.07 318.3L162.1 174.3C165.9 165.6 174.5 160 184 160H184zM167.6 280H200.4L184 243.1L167.6 280zM304 184C304 170.7 314.7 160 328 160H380C413.1 160 440 186.9 440 220C440 229.2 437.9 237.9 434.2 245.7C447.5 256.7 456 273.4 456 292C456 325.1 429.1 352 396 352H328C314.7 352 304 341.3 304 328V184zM352 208V232H380C386.6 232 392 226.6 392 220C392 213.4 386.6 208 380 208H352zM352 304H396C402.6 304 408 298.6 408 292C408 285.4 402.6 280 396 280H352V304zM0 128C0 92.65 28.65 64 64 64H576C611.3 64 640 92.65 640 128V384C640 419.3 611.3 448 576 448H64C28.65 448 0 419.3 0 384V128zM48 128V384C48 392.8 55.16 400 64 400H576C584.8 400 592 392.8 592 384V128C592 119.2 584.8 112 576 112H64C55.16 112 48 119.2 48 128z"/></svg>${translate('Rename')}</div></div>

  <div role="menuitem" id="edit-note-settings-button-${noteId}" class="flex items-center justify-between gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item=""><div class="flex gap-2"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md"><path fill-rule="evenodd" clip-rule="evenodd" d="M13.2929 4.29291C15.0641 2.52167 17.9359 2.52167 19.7071 4.2929C21.4783 6.06414 21.4783 8.93588 19.7071 10.7071L18.7073 11.7069L11.1603 19.2539C10.7182 19.696 10.1489 19.989 9.53219 20.0918L4.1644 20.9864C3.84584 21.0395 3.52125 20.9355 3.29289 20.7071C3.06453 20.4788 2.96051 20.1542 3.0136 19.8356L3.90824 14.4678C4.01103 13.8511 4.30396 13.2818 4.7461 12.8397L13.2929 4.29291ZM13 7.41422L6.16031 14.2539C6.01293 14.4013 5.91529 14.591 5.88102 14.7966L5.21655 18.7835L9.20339 18.119C9.40898 18.0847 9.59872 17.9871 9.7461 17.8397L16.5858 11L13 7.41422ZM18 9.5858L14.4142 6.00001L14.7071 5.70712C15.6973 4.71693 17.3027 4.71693 18.2929 5.70712C19.2831 6.69731 19.2831 8.30272 18.2929 9.29291L18 9.5858Z" fill="currentColor"></path></svg>${translate('Edit')}</div></div>

  <div role="menuitem" id="download-note-settings-button-${noteId}" class="flex items-center justify-between gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item=""><div class="flex gap-2"><svg stroke="currentColor" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.70711 10.2929C7.31658 9.90237 6.68342 9.90237 6.29289 10.2929C5.90237 10.6834 5.90237 11.3166 6.29289 11.7071L11.2929 16.7071C11.6834 17.0976 12.3166 17.0976 12.7071 16.7071L17.7071 11.7071C18.0976 11.3166 18.0976 10.6834 17.7071 10.2929C17.3166 9.90237 16.6834 9.90237 16.2929 10.2929L13 13.5858L13 4C13 3.44771 12.5523 3 12 3C11.4477 3 11 3.44771 11 4L11 13.5858L7.70711 10.2929ZM5 19C4.44772 19 4 19.4477 4 20C4 20.5523 4.44772 21 5 21H19C19.5523 21 20 20.5523 20 20C20 19.4477 19.5523 19 19 19L5 19Z" fill="currentColor"></path></svg>${translate('Download')}</div></div>

  <div role="menuitem" id="attach-note-settings-button-${noteId}" class="flex items-center justify-between gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item=""><div class="flex gap-2"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md"><path fill-rule="evenodd" clip-rule="evenodd" d="M18.0322 5.02393C17.7488 5.00078 17.3766 5 16.8 5H11.5002C11.3 6 11.0989 6.91141 10.8903 7.85409C10.7588 8.44955 10.6432 8.97304 10.3675 9.41399C10.1262 9.80009 9.80009 10.1262 9.41399 10.3675C8.97304 10.6432 8.44955 10.7588 7.85409 10.8903C7.81276 10.8994 7.77108 10.9086 7.72906 10.9179L5.21693 11.4762C5.1442 11.4924 5.07155 11.5001 5 11.5002V16.8C5 17.3766 5.00078 17.7488 5.02393 18.0322C5.04612 18.3038 5.0838 18.4045 5.109 18.454C5.20487 18.6422 5.35785 18.7951 5.54601 18.891C5.59546 18.9162 5.69617 18.9539 5.96784 18.9761C6.25118 18.9992 6.62345 19 7.2 19H10C10.5523 19 11 19.4477 11 20C11 20.5523 10.5523 21 10 21H7.16144C6.6343 21 6.17954 21 5.80497 20.9694C5.40963 20.9371 5.01641 20.8658 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3.13419 18.9836 3.06287 18.5904 3.03057 18.195C2.99997 17.8205 2.99998 17.3657 3 16.8385L3 11C3 8.92477 4.02755 6.93324 5.4804 5.4804C6.93324 4.02755 8.92477 3 11 3L16.8385 3C17.3657 2.99998 17.8205 2.99997 18.195 3.03057C18.5904 3.06287 18.9836 3.13419 19.362 3.32698C19.9265 3.6146 20.3854 4.07354 20.673 4.63803C20.8658 5.01641 20.9371 5.40963 20.9694 5.80497C21 6.17954 21 6.6343 21 7.16144V10C21 10.5523 20.5523 11 20 11C19.4477 11 19 10.5523 19 10V7.2C19 6.62345 18.9992 6.25118 18.9761 5.96784C18.9539 5.69617 18.9162 5.59546 18.891 5.54601C18.7951 5.35785 18.6422 5.20487 18.454 5.109C18.4045 5.0838 18.3038 5.04612 18.0322 5.02393ZM5.28014 9.41336L7.2952 8.96556C8.08861 8.78925 8.24308 8.74089 8.35381 8.67166C8.48251 8.59121 8.59121 8.48251 8.67166 8.35381C8.74089 8.24308 8.78925 8.08861 8.96556 7.2952L9.41336 5.28014C8.51014 5.59289 7.63524 6.15398 6.89461 6.89461C6.15398 7.63524 5.59289 8.51014 5.28014 9.41336ZM17 15C17 14.4477 17.4477 14 18 14C18.5523 14 19 14.4477 19 15V17H21C21.5523 17 22 17.4477 22 18C22 18.5523 21.5523 19 21 19H19V21C19 21.5523 18.5523 22 18 22C17.4477 22 17 21.5523 17 21V19H15C14.4477 19 14 18.5523 14 18C14 17.4477 14.4477 17 15 17H17V15Z" fill="currentColor"></path></svg>${translate('Reference this note')}</div></div>
  
  <div role="menuitem" id="delete-note-settings-button-${noteId}" class="flex gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group text-red-500" tabindex="-1" data-orientation="vertical" data-radix-collection-item=""><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.5555 4C10.099 4 9.70052 4.30906 9.58693 4.75114L9.29382 5.8919H14.715L14.4219 4.75114C14.3083 4.30906 13.9098 4 13.4533 4H10.5555ZM16.7799 5.8919L16.3589 4.25342C16.0182 2.92719 14.8226 2 13.4533 2H10.5555C9.18616 2 7.99062 2.92719 7.64985 4.25342L7.22886 5.8919H4C3.44772 5.8919 3 6.33961 3 6.8919C3 7.44418 3.44772 7.8919 4 7.8919H4.10069L5.31544 19.3172C5.47763 20.8427 6.76455 22 8.29863 22H15.7014C17.2354 22 18.5224 20.8427 18.6846 19.3172L19.8993 7.8919H20C20.5523 7.8919 21 7.44418 21 6.8919C21 6.33961 20.5523 5.8919 20 5.8919H16.7799ZM17.888 7.8919H6.11196L7.30423 19.1057C7.3583 19.6142 7.78727 20 8.29863 20H15.7014C16.2127 20 16.6417 19.6142 16.6958 19.1057L17.888 7.8919ZM10 10C10.5523 10 11 10.4477 11 11V16C11 16.5523 10.5523 17 10 17C9.44772 17 9 16.5523 9 16V11C9 10.4477 9.44772 10 10 10ZM14 10C14.5523 10 15 10.4477 15 11V16C15 16.5523 14.5523 17 14 17C13.4477 17 13 16.5523 13 16V11C13 10.4477 13.4477 10 14 10Z" fill="currentColor"></path></svg>${translate('Delete')}</div>


  </div></div>`;
  document.body.insertAdjacentHTML('beforeend', menu);
  adjustMenuPosition(document.querySelector('#note-settings-menu'));

  addNoteSettingsMenuEventListeners(note);
}
function addNoteSettingsMenuEventListeners(note) {
  const noteId = note.id;
  const renameNoteSettingsButton = document.getElementById(`rename-note-settings-button-${noteId}`);
  const editNoteSettingsButton = document.getElementById(`edit-note-settings-button-${noteId}`);
  const downloadNoteSettingsButton = document.getElementById(`download-note-settings-button-${noteId}`);
  const attachNoteSettingsButton = document.getElementById(`attach-note-settings-button-${noteId}`);
  const deleteNoteSettingsButton = document.getElementById(`delete-note-settings-button-${noteId}`);

  renameNoteSettingsButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenus();
    handleRenameNoteClick(note);
  });
  editNoteSettingsButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenus();
    updateSelectedNoteCard(note.id);
    openNotePreviewModal(note);
  });
  downloadNoteSettingsButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenus();
    chrome.runtime.sendMessage({
      type: 'getNote',
      detail: {
        conversationId: note.conversation_id,
      },
    }, (data) => {
      // create a txt file from note.name and note.text
      const blob = new Blob([`${data.name}\n\n${data.text}`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.name}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    });
  });
  attachNoteSettingsButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenus();
    // create a txt file from note.name and note.text
    chrome.runtime.sendMessage({
      type: 'getNote',
      detail: {
        conversationId: note.conversation_id,
      },
    }, (data) => {
      uploadTextToInput(data.text, `${data.name}.txt`);
    });
  });
  deleteNoteSettingsButton?.addEventListener('click', () => {
    showConfirmDialog('Delete note', 'Are you sure you want to delete this note?', 'Cancel', 'Delete', null, () => handleDeleteNote(note));
  });
}

function handleRenameNoteClick(note) {
  let skipBlur = false;
  closeMenus();
  const textInput = document.createElement('input');
  const noteNameElement = document.querySelector(`#modal-manager #note-name-${note.id}`);
  const oldNoteName = noteNameElement.innerText;
  textInput.id = `note-rename-${note.id}`;
  textInput.classList = 'border-0 bg-transparent p-0 focus:ring-0 focus-visible:ring-0 w-full';
  textInput.value = oldNoteName;
  noteNameElement?.parentElement?.replaceChild(textInput, noteNameElement);
  textInput.focus();
  setTimeout(() => {
    textInput.select();
  }, 50);
  textInput?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeMenus();
    textInput.focus();
  });
  // click out of input or press enter will save the new title
  textInput?.addEventListener('blur', () => {
    if (skipBlur) return;
    const newNoteName = textInput.value;
    if (newNoteName !== oldNoteName) {
      updateNoteNameElement(noteNameElement, note.id, newNoteName);
    }
    textInput.parentElement?.replaceChild(noteNameElement, textInput);
  });
  textInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.which === 13) {
      skipBlur = true;
      const newNoteName = textInput.value;
      if (newNoteName !== oldNoteName) {
        updateNoteNameElement(noteNameElement, note.id, newNoteName);
      }
      textInput.parentElement?.replaceChild(noteNameElement, textInput);
    }
    // esc key cancels the rename
    if (e.key === 'Escape') {
      skipBlur = true;
      noteNameElement.innerText = oldNoteName;
      textInput.parentElement?.replaceChild(noteNameElement, textInput);
    }
  });
}
function updateNoteNameElement(noteNameElement, noteId, newName) {
  if (!newName.trim()) return;
  noteNameElement.innerText = newName;
  // update folder name
  chrome.runtime.sendMessage({
    type: 'renameNote',
    detail: {
      noteId,
      newName,
    },
  });
}
function handleDeleteNote(note) {
  // remove note from list
  document.getElementById(`note-item-${note.id}`)?.remove();
  // check if note list is empty
  const noteList = document.getElementById('note-list');
  if (!noteList.children.length) {
    document.getElementById('no-notes').classList.remove('hidden');
    const noResult = document.createElement('div');
    noResult.style = 'position:absolute;display: flex; justify-content: center; align-items: center; height: 340px; width: 100%;';
    noResult.textContent = translate('No notes found');
    noteList.appendChild(noResult);
  }
  toggleNoteIndicator(note.conversation_id, '');
  // update sidebar note input if exists
  const conversationIdFromUrl = getConversationIdFromUrl();
  if (conversationIdFromUrl && conversationIdFromUrl === note.conversation_id) {
    const sidebarNoteInput = document.querySelector('#sidebar-note-input');
    if (sidebarNoteInput) {
      sidebarNoteInput.value = '';
    }
  }
  chrome.runtime.sendMessage({
    type: 'deleteNote',
    detail: {
      noteId: note.id,
    },
  });
}
