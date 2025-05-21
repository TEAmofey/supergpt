/* global isDescendant, toast, closeMenus, generateRandomDarkColor, errorUpgradeConfirmation, translate, addNewConvFolderElementToSidebar, addNewConvFolderElementToManagerSidebar, loadingSpinner, debounce, getLastSelectedConversationFolder, throttleGetConvSubFolders */

/* eslint-disable no-unused-vars */
async function openMoveConvFolderModal(movingFolder) {
  const moveConvFolderModal = `
  <div id="move-conv-folder-modal" class="absolute inset-0" style="z-index: 10000;">
    <div data-state="open" class="fixed inset-0 bg-black/50 dark:bg-black/80" style="pointer-events: auto;">
      <div class="h-full w-full grid grid-cols-[10px_1fr_10px] grid-rows-[minmax(10px,1fr)_auto_minmax(10px,1fr)] md:grid-rows-[minmax(20px,1fr)_auto_minmax(20px,1fr)] overflow-y-auto">
        <div id="move-conv-folder-content" role="dialog" aria-describedby="radix-:r3o:" aria-labelledby="radix-:r3n:" data-state="open" class="popover bg-token-main-surface-primary relative start-1/2 col-auto col-start-2 row-auto row-start-2 h-full w-full text-start ltr:-translate-x-1/2 rtl:translate-x-1/2 rounded-2xl shadow-xl flex flex-col focus:outline-hidden overflow-hidden max-w-lg" tabindex="-1" style="pointer-events: auto;">
          <div class="px-4 pb-4 pt-5 flex items-center justify-between border-b border-token-border-medium">
            <div class="flex">
              <div class="flex items-center">
                <div class="flex grow flex-col gap-1">
                  <h2 as="h3" class="text-lg font-medium leading-6 text-token-text-primary">${translate('Select a folder')}</h2>
                </div>
              </div>
            </div>
            <div class="flex items-center">
              <button id="move-conv-folder-new-folder" class="btn flex justify-center gap-2 btn-primary me-2 border" data-default="true" style="min-width: 72px; height: 34px;">${translate('plus New Folder')}</button>
              <button id="move-conv-folder-close-button" class="text-token-text-tertiary hover:text-token-text-primary transition">
                <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="20" width="20"
                  xmlns="http://www.w3.org/2000/svg">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
          <div class="px-4 pt-4">
            <input id="move-conv-folder-search-input" type="search" placeholder="${translate('Search folders')}" class="w-full p-2 rounded-md border border-token-border-medium bg-token-main-surface-secondary text-token-text-tertiary">
          </div>
          <div id="move-conv-folder-list" class="p-4 overflow-y-auto" style="height:500px;">
            <!-- folder list here -->
          </div>
        </div>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', moveConvFolderModal);
  await moveConvFolderLoadFolderList(movingFolder);
  addMoveConvFolderModalEventListener(movingFolder);

  // search input
  const delayedSearch = debounce(async (searchTerm) => {
    await moveConvFolderLoadFolderList(movingFolder, searchTerm);
    addMoveConvFolderModalEventListener(movingFolder);
  }, 500);
  const moveConvFolderSearchInput = document.querySelector('#move-conv-folder-search-input');
  moveConvFolderSearchInput.addEventListener('input', async () => {
    delayedSearch(moveConvFolderSearchInput.value);
  });
}

async function moveConvFolderLoadFolderList(movingFolder, searchTerm = '') {
  const moveConvFolderList = document.querySelector('#move-conv-folder-list');
  moveConvFolderList.innerHTML = '';
  moveConvFolderList.appendChild(loadingSpinner('move-conv-folder-list'));
  const conversationFolders = await chrome.runtime.sendMessage({
    type: 'getConversationFolders',
    detail: {
      sortBy: 'alphabetical',
      searchTerm,
    },
  });
  const parentFolderId = movingFolder.parent_folder;
  moveConvFolderList.innerHTML = conversationFolders.length > 0
    ? `<button id="move-conv-to-root-button" class="btn btn-large w-full btn-primary mb-2 ${parentFolderId ? '' : 'opacity-50 pointer-events-none'}" ${parentFolderId ? '' : 'disabled="true"'}>Move to root</button>${conversationFolders.map((folder) => moveConvFolderSimpleFolderElement(folder, movingFolder.id)).join('')}`
    : '<div id="no-conversation-folders" class="text-sm text-token-text-tertiary">No folders found.</div>';
}
function moveConvFolderSimpleFolderElement(folder, movingFolderId) {
  const isLocked = folder.id === -1;
  const folderImageURL = folder.image || folder.image_url || chrome.runtime.getURL('icons/folder.png');

  return `<div id="move-conv-folder-wrapper-folder-${folder.id}" class="flex w-full mb-2 group ${isLocked || movingFolderId === folder.id ? 'opacity-50 pointer-events-none' : ''}" style="flex-wrap: wrap;"><div id="folder-${folder.id}" class="flex py-3 px-3 pe-3 w-full border border-token-border-medium items-center gap-3 relative rounded-md cursor-pointer break-all hover:pe-10 group" title="${folder.name}" style="background-color: ${folder.color};"><img class="w-6 h-6 object-cover rounded-md" src="${folderImageURL}" style="filter:drop-shadow(0px 0px 1px black);" data-is-open="false"><div id="title-folder-${folder.id}" class="flex-1 text-ellipsis max-h-5 overflow-hidden whitespace-nowrap break-all relative text-white relative" style="bottom: 6px;">${folder.name}</div><div id="folder-actions-wrapper-${folder.id}" class="absolute flex end-1 z-10 text-gray-300"><button id="move-conv-folder-button-${folder.id}" class="btn btn-xs btn-primary group-hover:visible ${isLocked || movingFolderId === folder.id ? '' : 'invisible'}" ${movingFolderId === folder.id ? 'disabled="true"' : ''} title="Move to folder">${isLocked ? 'Upgrade to pro' : movingFolderId === folder.id ? 'Moving folder' : 'Move to this folder'}</button></div><div id="count-folder-${folder.id}" style="color: rgba(255, 255, 255, 0.6);font-size: 10px; position: absolute; left: 50px; bottom: 2px; display: block;">${folder?.subfolders?.length || 0} folder${folder?.subfolders?.length === 1 ? '' : 's'} - ${folder.conversation_count} chat${folder.conversation_count === 1 ? '' : 's'}</div></div></div>`;
}
function addMoveConvFolderModalEventListener(movingFolder) {
  const moveConvToRootButton = document.querySelector('#move-conv-to-root-button');
  moveConvToRootButton.addEventListener('click', () => {
    moveConvFolder(movingFolder, 0);
    toast('Folder moved successfully');
    const moveConvFolderModal = document.querySelector('#move-conv-folder-modal');
    moveConvFolderModal?.remove();
  });

  const folderWrappers = document.querySelectorAll('[id^=move-conv-folder-wrapper-folder-]');
  folderWrappers.forEach((folderWrapper) => {
    folderWrapper.addEventListener('click', (e) => {
      moveConvFolderOpenFolder(folderWrapper, movingFolder, e.shiftKey);
    });
  });
  const moveConvFolderButtons = document.querySelectorAll('button[id^=move-conv-folder-button-]');
  moveConvFolderButtons.forEach((moveConvFolderButton) => {
    const toFolderId = moveConvFolderButton.id.split('move-conv-folder-button-')[1];
    moveConvFolderButton.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const isLocked = toFolderId === '-1';
      if (isLocked) {
        const error = { type: 'limit', title: 'You have reached the limit', message: 'With free account, you can only have up to 5 conversation folders. Upgrade to Pro to remove all limits.' };
        errorUpgradeConfirmation(error);
        return;
      }
      moveConvFolder(movingFolder, toFolderId);
      toast('Folder moved successfully');
      const moveConvFolderModal = document.querySelector('#move-conv-folder-modal');
      moveConvFolderModal?.remove();
    });
  });

  const newFolderButton = document.querySelector('#move-conv-folder-new-folder');
  newFolderButton.addEventListener('click', async () => {
    const hasSubscription = await chrome.runtime.sendMessage({
      type: 'checkHasSubscription',
    });
    const currentFolders = document.querySelectorAll('#move-conv-folder-content [id^=move-conv-folder-wrapper-folder-]');
    if (!hasSubscription && currentFolders.length >= 5) {
      const error = { type: 'limit', title: 'You have reached the limit', message: 'You have reached the limits of Folders with free account. Upgrade to Pro to remove all limits.' };
      errorUpgradeConfirmation(error);
      return;
    }
    const noConversationFolders = document.querySelectorAll('#no-conversation-folders');
    noConversationFolders.forEach((el) => el.remove());
    const newConversationFolders = await chrome.runtime.sendMessage({
      type: 'addConversationFolders',
      detail: {
        folders: [{
          name: 'New Folder',
          color: generateRandomDarkColor(),
        }],
      },
    });
    if (newConversationFolders.error && newConversationFolders.error.type === 'limit') {
      errorUpgradeConfirmation(newConversationFolders.error);
      return;
    }

    const moveConvFolderList = document.querySelector('#move-conv-folder-list');
    moveConvToRootButton.insertAdjacentHTML('afterend', moveConvFolderSimpleFolderElement(newConversationFolders[0], movingFolder.id));
    const folderWrapper = document.querySelector(`#move-conv-folder-wrapper-folder-${newConversationFolders[0].id}`);
    folderWrapper.addEventListener('click', (e) => {
      moveConvFolderOpenFolder(folderWrapper, movingFolder, e.shiftKey);
    });
    const moveConvFolderButton = document.querySelector(`#move-conv-folder-button-${newConversationFolders[0].id}`);
    moveConvFolderButton.addEventListener('click', () => {
      moveConvFolder(movingFolder, newConversationFolders[0].id);
      toast('Folder moved successfully');
      const moveConvFolderModal = document.querySelector('#move-conv-folder-modal');
      moveConvFolderModal?.remove();
    });
    // if looking at root, add to sidebar
    const lastSelectedConversationFolder = getLastSelectedConversationFolder();
    if (!lastSelectedConversationFolder) {
      addNewConvFolderElementToSidebar(newConversationFolders[0]);
    }
    addNewConvFolderElementToManagerSidebar(newConversationFolders[0]);
  });
  const moveConvFolderCloseButton = document.querySelector('#move-conv-folder-close-button');
  moveConvFolderCloseButton.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    closeMenus();
    const moveConvFolderModal = document.querySelector('#move-conv-folder-modal');
    moveConvFolderModal?.remove();
  });

  // close modal when clicked outside
  document.body.addEventListener('click', (e) => {
    const moveConvFolderModal = document.querySelector('#move-conv-folder-modal');
    const moveConvFolderContent = document.querySelector('#move-conv-folder-content');
    if (moveConvFolderContent && isDescendant(moveConvFolderModal, e.target) && !isDescendant(moveConvFolderContent, e.target)) {
      moveConvFolderModal?.remove();
    }
  });
}
function moveConvFolderOpenFolder(folderWrapper, movingFolder, forceRefresh = false) {
  // if next elemnt is a subfolder wrapper, then hide it
  const parentFolderId = folderWrapper.id.split('move-conv-folder-wrapper-folder-')[1];
  const nextElement = folderWrapper.nextElementSibling;
  if (!forceRefresh) {
    if (nextElement && nextElement.id === `subfolder-wrapper-${parentFolderId}`) {
      if (nextElement.classList.contains('hidden')) {
        nextElement.classList.remove('hidden');
      } else {
        nextElement.classList.add('hidden');
      }
      return;
    }
  } else {
    if (nextElement && nextElement.id === `subfolder-wrapper-${parentFolderId}`) {
      nextElement.remove();
    }
  }
  // if next elemnt is not a subfolder wrapper, then add it and load subfolders
  const subfolderWrapper = document.createElement('div');
  subfolderWrapper.id = `subfolder-wrapper-${parentFolderId}`;
  subfolderWrapper.classList = 'ps-4 border-s border-token-border-medium';
  folderWrapper.insertAdjacentElement('afterend', subfolderWrapper);
  const subfolderList = document.createElement('div');
  subfolderList.classList = 'flex flex-col mb-4 relative';
  subfolderList.style.minHeight = '32px';
  subfolderList.appendChild(loadingSpinner('subfolder-list'));
  subfolderWrapper.appendChild(subfolderList);
  chrome.runtime.sendMessage({
    type: 'getConversationFolders',
    forceRefresh,
    detail: {
      sortBy: 'alphabetical',
      parentFolderId,
    },
  }, (conversationFolders) => {
    if (!conversationFolders) return;
    if (!Array.isArray(conversationFolders)) return;
    subfolderList.innerHTML = '';
    if (conversationFolders.length > 0) {
      conversationFolders?.forEach((subfolder) => {
        subfolderList.insertAdjacentHTML('beforeend', moveConvFolderSimpleFolderElement(subfolder, movingFolder.id));
        const curSubfolderWrapper = document.querySelector(`#move-conv-folder-wrapper-folder-${subfolder.id}`);
        if (!curSubfolderWrapper) return;
        curSubfolderWrapper?.addEventListener('click', (e) => {
          moveConvFolderOpenFolder(curSubfolderWrapper, movingFolder, e.shiftKey);
        });
        const moveConvFolderButton = document.querySelector(`#move-conv-folder-button-${subfolder.id}`);
        moveConvFolderButton.addEventListener('click', () => {
          moveConvFolder(movingFolder, subfolder.id);
          toast('Folder moved successfully');
          const moveConvFolderModal = document.querySelector('#move-conv-folder-modal');
          moveConvFolderModal?.remove();
        });
      });
    } else {
      subfolderList.insertAdjacentHTML('beforeend', '<div class="text-sm text-token-text-tertiary">No subfolders</div>');
    }
  });
}
async function moveConvFolder(movingFolder, toFolderId) {
  const lastSelectedConversationFolder = getLastSelectedConversationFolder();

  // if moving to root and manager is open, add to manager sidebar
  if (toFolderId === 0) {
    const conversationManagerSidebarFolders = document.querySelector('#conversation-manager-sidebar-folders');
    const folderElement = document.querySelector(`#conversation-manager-subfolder-list #conversation-folder-wrapper-${movingFolder.id}`);

    if (conversationManagerSidebarFolders && folderElement) {
      conversationManagerSidebarFolders.appendChild(folderElement);
    }
    // remove folder from sidebar
    const folderElements = document.querySelectorAll(`#sidebar-folder-content #conversation-folder-wrapper-${movingFolder.id}`);
    folderElements.forEach((el) => el.remove());
  } else {
    // remove folder from sidebar and manager
    const folderElements = document.querySelectorAll(`#conversation-folder-wrapper-${movingFolder.id}`);
    folderElements.forEach((el) => el.remove());
  }
  // update parent folder count
  const parentFolderId = movingFolder.parent_folder;
  const parentFolderCounts = document.querySelectorAll(`#folder-subfolder-count-${parentFolderId}`);
  parentFolderCounts.forEach((parentFolderCount) => {
    const count = parseInt(parentFolderCount.innerText.split(' ')[0], 10);
    parentFolderCount.innerText = `${count - 1} folder${count - 1 === 1 ? '' : 's'} -`;
  });
  // update to folder count
  const toFolderCounts = document.querySelectorAll(`#folder-subfolder-count-${toFolderId}`);
  toFolderCounts.forEach((toFolderCount) => {
    const count = parseInt(toFolderCount.innerText.split(' ')[0], 10);
    toFolderCount.innerText = `${count + 1} folder${count + 1 === 1 ? '' : 's'} -`;
  });
  const newData = {
    parent_folder_id: toFolderId,
  };
  chrome.runtime.sendMessage({
    type: 'updateConversationFolder',
    forceRefresh: true,
    detail: {
      folderId: movingFolder.id,
      newData,
    },
  }, () => {
    if (toFolderId === lastSelectedConversationFolder.id.toString()) {
      throttleGetConvSubFolders(lastSelectedConversationFolder.id, true);
    }
  });
}
