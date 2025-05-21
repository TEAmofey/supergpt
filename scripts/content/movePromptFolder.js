/* global isDescendant, toast, closeMenus, generateRandomDarkColor, errorUpgradeConfirmation, translate, addNewPromptFolderElementToManagerSidebar, loadingSpinner, debounce, getLastSelectedPromptFolder, throttleGetPromptSubFolders */

/* eslint-disable no-unused-vars */
async function openMovePromptFolderModal(movingFolder) {
  const movePromptFolderModal = `
  <div id="move-prompt-folder-modal" class="absolute inset-0" style="z-index: 10000;">
    <div data-state="open" class="fixed inset-0 bg-black/50 dark:bg-black/80" style="pointer-events: auto;">
      <div class="h-full w-full grid grid-cols-[10px_1fr_10px] grid-rows-[minmax(10px,1fr)_auto_minmax(10px,1fr)] md:grid-rows-[minmax(20px,1fr)_auto_minmax(20px,1fr)] overflow-y-auto">
        <div id="move-prompt-folder-content" role="dialog" aria-describedby="radix-:r3o:" aria-labelledby="radix-:r3n:" data-state="open" class="popover bg-token-main-surface-primary relative start-1/2 col-auto col-start-2 row-auto row-start-2 h-full w-full text-start ltr:-translate-x-1/2 rtl:translate-x-1/2 rounded-2xl shadow-xl flex flex-col focus:outline-hidden overflow-hidden max-w-lg" tabindex="-1" style="pointer-events: auto;">
          <div class="px-4 pb-4 pt-5 flex items-center justify-between border-b border-token-border-medium">
            <div class="flex">
              <div class="flex items-center">
                <div class="flex grow flex-col gap-1">
                  <h2 as="h3" class="text-lg font-medium leading-6 text-token-text-primary">${translate('Select a folder')}</h2>
                </div>
              </div>
            </div>
            <div class="flex items-center">
              <button id="move-prompt-folder-new-folder" class="btn flex justify-center gap-2 btn-primary me-2 border" data-default="true" style="min-width: 72px; height: 34px;">${translate('plus New Folder')}</button>
              <button id="move-prompt-folder-close-button" class="text-token-text-tertiary hover:text-token-text-primary transition">
                <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="20" width="20"
                  xmlns="http://www.w3.org/2000/svg">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
          <div class="px-4 pt-4">
            <input id="move-prompt-folder-search-input" type="search" placeholder="${translate('Search folders')}" class="w-full p-2 rounded-md border border-token-border-medium bg-token-main-surface-secondary text-token-text-tertiary">
          </div>
          <div id="move-prompt-folder-list" class="p-4 overflow-y-auto" style="height:500px;">
            <!-- folder list here -->
          </div>
        </div>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', movePromptFolderModal);
  await movePromptFolderLoadFolderList(movingFolder);
  addMovePromptFolderModalEventListener(movingFolder);

  // search input
  const delayedSearch = debounce(async (searchTerm) => {
    await movePromptFolderLoadFolderList(movingFolder, searchTerm);
    addMovePromptFolderModalEventListener(movingFolder);
  }, 500);
  const movePromptFolderSearchInput = document.querySelector('#move-prompt-folder-search-input');
  movePromptFolderSearchInput.addEventListener('input', async () => {
    delayedSearch(movePromptFolderSearchInput.value);
  });
}

async function movePromptFolderLoadFolderList(movingFolder, searchTerm = '') {
  const movePromptFolderList = document.querySelector('#move-prompt-folder-list');
  movePromptFolderList.innerHTML = '';
  movePromptFolderList.appendChild(loadingSpinner('move-prompt-folder-list'));
  const promptFolders = await chrome.runtime.sendMessage({
    type: 'getPromptFolders',
    detail: {
      sortBy: 'alphabetical',
      searchTerm,
    },
  });
  const parentFolderId = movingFolder.parent_folder;
  movePromptFolderList.innerHTML = promptFolders.length > 0
    ? `<button id="move-prompt-to-root-button" class="btn btn-large w-full btn-primary mb-2 ${parentFolderId ? '' : 'opacity-50 pointer-events-none'}" ${parentFolderId ? '' : 'disabled="true"'}>Move to root</button>${promptFolders.map((folder) => movePromptFolderSimpleFolderElement(folder, movingFolder.id)).join('')}`
    : '<div id="no-prompt-folders" class="text-sm text-token-text-tertiary">No folders found.</div>';
}
function movePromptFolderSimpleFolderElement(folder, movingFolderId) {
  const isLocked = folder.id === -1;
  const folderImageURL = folder.image || folder.image_url || chrome.runtime.getURL('icons/folder.png');

  return `<div id="move-prompt-folder-wrapper-folder-${folder.id}" class="flex w-full mb-2 group ${isLocked || movingFolderId === folder.id ? 'opacity-50 pointer-events-none' : ''}" style="flex-wrap: wrap;"><div id="folder-${folder.id}" class="flex py-3 px-3 pe-3 w-full border border-token-border-medium items-center gap-3 relative rounded-md cursor-pointer break-all hover:pe-10 group" title="${folder.name}" style="background-color: ${folder.color};"><img class="w-6 h-6 object-cover rounded-md" src="${folderImageURL}" style="filter:drop-shadow(0px 0px 1px black);" data-is-open="false"><div id="title-folder-${folder.id}" class="flex-1 text-ellipsis max-h-5 overflow-hidden whitespace-nowrap break-all relative text-white relative" style="bottom: 6px;">${folder.name}</div><div id="folder-actions-wrapper-${folder.id}" class="absolute flex end-1 z-10 text-gray-300"><button id="move-prompt-folder-button-${folder.id}" class="btn btn-xs btn-primary group-hover:visible ${isLocked || movingFolderId === folder.id ? '' : 'invisible'}" ${movingFolderId === folder.id ? 'disabled="true"' : ''} title="Move to folder">${isLocked ? 'Upgrade to pro' : movingFolderId === folder.id ? 'Moving folder' : 'Move to this folder'}</button></div><div id="count-folder-${folder.id}" style="color: rgba(255, 255, 255, 0.6);font-size: 10px; position: absolute; left: 50px; bottom: 2px; display: block;">${folder?.subfolders?.length || 0} folder${folder?.subfolders?.length === 1 ? '' : 's'} - ${folder.prompt_count} prompt${folder.prompt_count === 1 ? '' : 's'}</div></div></div>`;
}
function addMovePromptFolderModalEventListener(movingFolder) {
  const movePromptToRootButton = document.querySelector('#move-prompt-to-root-button');
  movePromptToRootButton.addEventListener('click', () => {
    movePromptFolder(movingFolder, 0);
    toast('Folder moved successfully');
    const movePromptFolderModal = document.querySelector('#move-prompt-folder-modal');
    movePromptFolderModal?.remove();
  });

  const folderWrappers = document.querySelectorAll('[id^=move-prompt-folder-wrapper-folder-]');
  folderWrappers.forEach((folderWrapper) => {
    folderWrapper.addEventListener('click', (e) => {
      movePromptFolderOpenFolder(folderWrapper, movingFolder, e.shiftKey);
    });
  });
  const movePromptFolderButtons = document.querySelectorAll('button[id^=move-prompt-folder-button-]');
  movePromptFolderButtons.forEach((movePromptFolderButton) => {
    const toFolderId = movePromptFolderButton.id.split('move-prompt-folder-button-')[1];
    movePromptFolderButton.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const isLocked = toFolderId === '-1';
      if (isLocked) {
        const error = { type: 'limit', title: 'You have reached the limit', message: 'With free account, you can only have up to 5 prompt folders. Upgrade to Pro to remove all limits.' };
        errorUpgradeConfirmation(error);
        return;
      }
      movePromptFolder(movingFolder, toFolderId);
      toast('Folder moved successfully');
      const movePromptFolderModal = document.querySelector('#move-prompt-folder-modal');
      movePromptFolderModal?.remove();
    });
  });

  const newFolderButton = document.querySelector('#move-prompt-folder-new-folder');
  newFolderButton.addEventListener('click', async () => {
    const hasSubscription = await chrome.runtime.sendMessage({
      type: 'checkHasSubscription',
    });
    const currentFolders = document.querySelectorAll('#move-prompt-folder-content [id^=move-prompt-folder-wrapper-folder-]');
    if (!hasSubscription && currentFolders.length >= 5) {
      const error = { type: 'limit', title: 'You have reached the limit', message: 'You have reached the limits of Folders with free account. Upgrade to Pro to remove all limits.' };
      errorUpgradeConfirmation(error);
      return;
    }
    const noPromptFolders = document.querySelectorAll('#no-prompt-folders');
    noPromptFolders.forEach((el) => el.remove());
    const newPromptFolders = await chrome.runtime.sendMessage({
      type: 'addPromptFolders',
      detail: {
        folders: [{
          name: 'New Category',
          color: generateRandomDarkColor(),
        }],
      },
    });
    if (newPromptFolders.error && newPromptFolders.error.type === 'limit') {
      errorUpgradeConfirmation(newPromptFolders.error);
      return;
    }

    const movePromptFolderList = document.querySelector('#move-prompt-folder-list');
    movePromptToRootButton.insertAdjacentHTML('afterend', movePromptFolderSimpleFolderElement(newPromptFolders[0], movingFolder.id));
    const folderWrapper = document.querySelector(`#move-prompt-folder-wrapper-folder-${newPromptFolders[0].id}`);
    folderWrapper.addEventListener('click', (e) => {
      movePromptFolderOpenFolder(folderWrapper, movingFolder, e.shiftKey);
    });
    const movePromptFolderButton = document.querySelector(`#move-prompt-folder-button-${newPromptFolders[0].id}`);
    movePromptFolderButton.addEventListener('click', () => {
      movePromptFolder(movingFolder, newPromptFolders[0].id);
      toast('Folder moved successfully');
      const movePromptFolderModal = document.querySelector('#move-prompt-folder-modal');
      movePromptFolderModal?.remove();
    });

    addNewPromptFolderElementToManagerSidebar(newPromptFolders[0]);
  });
  const movePromptFolderCloseButton = document.querySelector('#move-prompt-folder-close-button');
  movePromptFolderCloseButton.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    closeMenus();
    const movePromptFolderModal = document.querySelector('#move-prompt-folder-modal');
    movePromptFolderModal?.remove();
  });

  // close modal when clicked outside
  document.body.addEventListener('click', (e) => {
    const movePromptFolderModal = document.querySelector('#move-prompt-folder-modal');
    const movePromptFolderContent = document.querySelector('#move-prompt-folder-content');
    if (movePromptFolderContent && isDescendant(movePromptFolderModal, e.target) && !isDescendant(movePromptFolderContent, e.target)) {
      movePromptFolderModal?.remove();
    }
  });
}
function movePromptFolderOpenFolder(folderWrapper, movingFolder, forceRefresh = false) {
  // if next elemnt is a subfolder wrapper, then hide it
  const parentFolderId = folderWrapper.id.split('move-prompt-folder-wrapper-folder-')[1];
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
    type: 'getPromptFolders',
    forceRefresh,
    detail: {
      sortBy: 'alphabetical',
      parentFolderId,
    },
  }, (promptFolders) => {
    if (!promptFolders) return;
    if (!Array.isArray(promptFolders)) return;
    subfolderList.innerHTML = '';
    if (promptFolders.length > 0) {
      promptFolders?.forEach((subfolder) => {
        subfolderList.insertAdjacentHTML('beforeend', movePromptFolderSimpleFolderElement(subfolder, movingFolder.id));
        const curSubfolderWrapper = document.querySelector(`#move-prompt-folder-wrapper-folder-${subfolder.id}`);
        if (!curSubfolderWrapper) return;
        curSubfolderWrapper?.addEventListener('click', (e) => {
          movePromptFolderOpenFolder(curSubfolderWrapper, movingFolder, e.shiftKey);
        });
        const movePromptFolderButton = document.querySelector(`#move-prompt-folder-button-${subfolder.id}`);
        movePromptFolderButton.addEventListener('click', () => {
          movePromptFolder(movingFolder, subfolder.id);
          toast('Folder moved successfully');
          const movePromptFolderModal = document.querySelector('#move-prompt-folder-modal');
          movePromptFolderModal?.remove();
        });
      });
    } else {
      subfolderList.insertAdjacentHTML('beforeend', '<div class="text-sm text-token-text-tertiary">No subfolders</div>');
    }
  });
}
async function movePromptFolder(movingFolder, toFolderId) {
  const lastSelectedPromptFolder = getLastSelectedPromptFolder();

  // if moving to root and manager is open, add to manager sidebar
  if (toFolderId === 0) {
    const promptManagerSidebarFolders = document.querySelector('#prompt-manager-sidebar-folders');
    const folderElement = document.querySelector(`#prompt-manager-subfolder-list #prompt-folder-wrapper-${movingFolder.id}`);

    if (promptManagerSidebarFolders && folderElement) {
      promptManagerSidebarFolders.appendChild(folderElement);
    }
    // remove folder from sidebar
    const folderElements = document.querySelectorAll(`#sidebar-folder-content #prompt-folder-wrapper-${movingFolder.id}`);
    folderElements.forEach((el) => el.remove());
  } else {
    // remove folder from sidebar and manager
    const folderElements = document.querySelectorAll(`#prompt-folder-wrapper-${movingFolder.id}`);
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
  chrome.runtime.sendMessage({
    type: 'updatePromptFolder',
    forceRefresh: true,
    detail: {
      folderId: movingFolder.id,
      newData: {
        parent_folder_id: toFolderId,
      },
    },
  }, () => {
    if (toFolderId === lastSelectedPromptFolder.id.toString()) {
      throttleGetPromptSubFolders(lastSelectedPromptFolder.id, true);
    }
  });
}
