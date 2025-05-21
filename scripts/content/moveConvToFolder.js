/* global isDescendant, toast, closeMenus, generateRandomDarkColor, errorUpgradeConfirmation, translate, updateConversationFolderCount, addNewConvFolderElementToSidebar, addNewConvFolderElementToManagerSidebar, getLastSelectedConversationFolder, resetConversationManagerSelection, isDefaultConvFolder, updateConversationFolderIndicators, noConversationElement, loadingSpinner, debounce, cachedSettings, resetSidebarConversationSelection */

/* eslint-disable no-unused-vars */
async function openMoveConvToFolderModal(conversationIds) {
  const moveConvToFolderModal = `
  <div id="move-conv-to-folder-modal" class="absolute inset-0" style="z-index: 10000;">
    <div data-state="open" class="fixed inset-0 bg-black/50 dark:bg-black/80" style="pointer-events: auto;">
      <div class="h-full w-full grid grid-cols-[10px_1fr_10px] grid-rows-[minmax(10px,1fr)_auto_minmax(10px,1fr)] md:grid-rows-[minmax(20px,1fr)_auto_minmax(20px,1fr)] overflow-y-auto">
        <div id="move-conv-to-folder-content" role="dialog" aria-describedby="radix-:r3o:" aria-labelledby="radix-:r3n:" data-state="open" class="popover bg-token-main-surface-primary relative start-1/2 col-auto col-start-2 row-auto row-start-2 h-full w-full text-start ltr:-translate-x-1/2 rtl:translate-x-1/2 rounded-2xl shadow-xl flex flex-col focus:outline-hidden overflow-hidden max-w-lg" tabindex="-1" style="pointer-events: auto;">
          <div class="px-4 pb-4 pt-5 flex items-center justify-between border-b border-token-border-medium">
            <div class="flex">
              <div class="flex items-center">
                <div class="flex grow flex-col gap-1">
                  <h2 as="h3" class="text-lg font-medium leading-6 text-token-text-primary">${translate('Select a folder')}</h2>
                </div>
              </div>
            </div>
            <div class="flex items-center">
              <button id="move-conv-to-folder-new-folder" class="btn flex justify-center gap-2 btn-primary me-2 border" data-default="true" style="min-width: 72px; height: 34px;">${translate('plus New Folder')}</button>
              <button id="move-conv-to-folder-close-button" class="text-token-text-tertiary hover:text-token-text-primary transition">
                <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="20" width="20"
                  xmlns="http://www.w3.org/2000/svg">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
          <div class="px-4 pt-4">
            <input id="move-conv-to-folder-search-input" type="search" placeholder="${translate('Search folders')}" class="w-full p-2 rounded-md border border-token-border-medium bg-token-main-surface-secondary text-token-text-tertiary">
          </div>
          <div id="move-conv-to-folder-list" class="p-4 overflow-y-auto" style="height:500px;">
            <!-- folder list here -->
          </div>
        </div>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', moveConvToFolderModal);
  await moveConvToFolderLoadFolderList();
  addMoveConvToFolderModalEventListener(conversationIds);

  // search input
  const delayedSearch = debounce(async (searchTerm) => {
    await moveConvToFolderLoadFolderList(searchTerm);
    addMoveConvToFolderModalEventListener(conversationIds);
  }, 500);
  const moveConvToFolderSearchInput = document.querySelector('#move-conv-to-folder-search-input');
  moveConvToFolderSearchInput.addEventListener('input', async () => {
    delayedSearch(moveConvToFolderSearchInput.value);
  });
}

async function moveConvToFolderLoadFolderList(searchTerm = '') {
  const moveConvToFolderList = document.querySelector('#move-conv-to-folder-list');
  moveConvToFolderList.innerHTML = '';
  moveConvToFolderList.appendChild(loadingSpinner('move-conv-to-folder-list'));
  const conversationFolders = await chrome.runtime.sendMessage({
    type: 'getConversationFolders',
    detail: {
      sortBy: 'alphabetical',
      searchTerm,
    },
  });

  moveConvToFolderList.innerHTML = conversationFolders.length > 0 ? conversationFolders.map((folder) => moveConvToFolderSimpleFolderElement(folder)).join('') : '<div id="no-conversation-folders" class="text-sm text-token-text-tertiary">No folders found.</div>';
}
function moveConvToFolderSimpleFolderElement(folder) {
  const isLocked = folder.id === -1;
  const folderImageURL = folder.image || folder.image_url || chrome.runtime.getURL('icons/folder.png');

  return `<div id="move-conv-to-folder-wrapper-folder-${folder.id}" class="flex w-full mb-2 group ${isLocked ? 'opacity-50 pointer-events-none' : ''}" style="flex-wrap: wrap;"><div id="folder-${folder.id}" class="flex py-3 px-3 pe-3 w-full border border-token-border-medium items-center gap-3 relative rounded-md cursor-pointer break-all hover:pe-10 group" title="${folder.name}" style="background-color: ${folder.color};"><img class="w-6 h-6 object-cover rounded-md" src="${folderImageURL}" style="filter:drop-shadow(0px 0px 1px black);" data-is-open="false"><div id="title-folder-${folder.id}" class="flex-1 text-ellipsis max-h-5 overflow-hidden whitespace-nowrap break-all relative text-white relative" style="bottom: 6px;">${folder.name}</div><div id="folder-actions-wrapper-${folder.id}" class="absolute flex end-1 z-10 text-gray-300"><button id="move-conv-to-folder-button-${folder.id}" class="btn btn-xs btn-primary group-hover:visible ${isLocked ? '' : 'invisible'}" title="Move to folder">${isLocked ? 'Upgrade to pro' : 'Add to this folder'}</button></div><div id="count-folder-${folder.id}" style="color: rgba(255, 255, 255, 0.6); font-size: 10px; position: absolute; left: 50px; bottom: 2px; display: block;">${folder?.subfolders?.length || 0} folder${folder?.subfolders?.length === 1 ? '' : 's'} - ${folder.conversation_count} chat${folder.conversation_count === 1 ? '' : 's'}</div></div></div>`;
}
function addMoveConvToFolderModalEventListener(conversationIds) {
  const folderWrappers = document.querySelectorAll('[id^=move-conv-to-folder-wrapper-folder-]');
  folderWrappers.forEach((folderWrapper) => {
    folderWrapper.addEventListener('click', (e) => {
      moveConvToFolderOpenFolder(folderWrapper, conversationIds, e.shiftKey);
    });
  });
  const moveConvToFolderButtons = document.querySelectorAll('button[id^=move-conv-to-folder-button-]');
  moveConvToFolderButtons.forEach((moveConvToFolderButton) => {
    const toFolderId = moveConvToFolderButton.id.split('move-conv-to-folder-button-')[1];
    const toFolderName = document.querySelector(`#title-folder-${toFolderId}`).textContent;
    const toFolderColor = document.querySelector(`#folder-${toFolderId}`).style.backgroundColor;
    moveConvToFolderButton.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const isLocked = toFolderId === '-1';
      if (isLocked) {
        const error = { type: 'limit', title: 'You have reached the limit', message: 'With free account, you can only have up to 5 conversation folders. Upgrade to Pro to remove all limits.' };
        errorUpgradeConfirmation(error);
        return;
      }
      moveConvToFolder(conversationIds, toFolderId, toFolderName, toFolderColor);
      toast('Conversation moved to folder');
      const moveConvToFolderModal = document.querySelector('#move-conv-to-folder-modal');
      moveConvToFolderModal?.remove();
    });
  });

  const newFolderButton = document.querySelector('#move-conv-to-folder-new-folder');
  newFolderButton.addEventListener('click', async () => {
    const hasSubscription = await chrome.runtime.sendMessage({
      type: 'checkHasSubscription',
    });
    const currentFolders = document.querySelectorAll('#move-conv-to-folder-content [id^=move-conv-to-folder-wrapper-folder-]');
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

    const moveConvToFolderList = document.querySelector('#move-conv-to-folder-list');
    moveConvToFolderList.insertAdjacentHTML('afterbegin', moveConvToFolderSimpleFolderElement(newConversationFolders[0]));
    const folderWrapper = document.querySelector(`#move-conv-to-folder-wrapper-folder-${newConversationFolders[0].id}`);
    folderWrapper.addEventListener('click', (e) => {
      moveConvToFolderOpenFolder(folderWrapper, conversationIds, e.shiftKey);
    });
    const moveConvToFolderButton = document.querySelector(`#move-conv-to-folder-button-${newConversationFolders[0].id}`);
    moveConvToFolderButton.addEventListener('click', () => {
      moveConvToFolder(conversationIds, newConversationFolders[0].id, newConversationFolders[0].name, newConversationFolders[0].color);
      toast('Conversation moved to folder');
      const moveConvToFolderModal = document.querySelector('#move-conv-to-folder-modal');
      moveConvToFolderModal?.remove();
    });
    // if looking at root, add to sidebar
    const lastSelectedConversationFolder = getLastSelectedConversationFolder();
    if (!lastSelectedConversationFolder) {
      addNewConvFolderElementToSidebar(newConversationFolders[0]);
    }
    addNewConvFolderElementToManagerSidebar(newConversationFolders[0]);
  });
  const moveConvToFolderCloseButton = document.querySelector('#move-conv-to-folder-close-button');
  moveConvToFolderCloseButton.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    closeMenus();
    const moveConvToFolderModal = document.querySelector('#move-conv-to-folder-modal');
    moveConvToFolderModal?.remove();
  });

  // close modal when clicked outside
  document.body.addEventListener('click', (e) => {
    const moveConvToFolderModal = document.querySelector('#move-conv-to-folder-modal');
    const moveConvToFolderContent = document.querySelector('#move-conv-to-folder-content');
    if (moveConvToFolderContent && isDescendant(moveConvToFolderModal, e.target) && !isDescendant(moveConvToFolderContent, e.target)) {
      moveConvToFolderModal.remove();
    }
  });
}
function moveConvToFolderOpenFolder(folderWrapper, conversationIds, forceRefresh = false) {
  // if next elemnt is a subfolder wrapper, then hide it
  const parentFolderId = folderWrapper.id.split('move-conv-to-folder-wrapper-folder-')[1];
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
        subfolderList.insertAdjacentHTML('beforeend', moveConvToFolderSimpleFolderElement(subfolder));
        const curSubfolderWrapper = document.querySelector(`#move-conv-to-folder-wrapper-folder-${subfolder.id}`);
        if (!curSubfolderWrapper) return;
        curSubfolderWrapper?.addEventListener('click', (e) => {
          moveConvToFolderOpenFolder(curSubfolderWrapper, conversationIds, e.shiftKey);
        });
        const moveConvToFolderButton = document.querySelector(`#move-conv-to-folder-button-${subfolder.id}`);
        moveConvToFolderButton.addEventListener('click', () => {
          moveConvToFolder(conversationIds, subfolder.id, subfolder.name, subfolder.color);
          toast('Conversation moved to folder');
          const moveConvToFolderModal = document.querySelector('#move-conv-to-folder-modal');
          moveConvToFolderModal?.remove();
        });
      });
    } else {
      subfolderList.insertAdjacentHTML('beforeend', '<div class="text-sm text-token-text-tertiary">No subfolders</div>');
    }
  });
}
async function moveConvToFolder(conversationIds, toFolderId, toFolderName, toFolderColor) {
  const lastSelectedConversationFolder = getLastSelectedConversationFolder();
  // count total moving con minus any conv already in the toFolder
  let totalMovingConversations = conversationIds.length;
  conversationIds.forEach((conversationId) => {
    const folderIndicator = document.querySelector(`#conversation-card-folder-color-indicator-${conversationId}`);
    if (folderIndicator) {
      const { folderId } = folderIndicator.dataset;
      if (folderId === toFolderId) {
        totalMovingConversations -= 1;
      }
    }
  });

  updateConversationFolderCount(lastSelectedConversationFolder?.id, toFolderId, totalMovingConversations);

  // remove conversation cards from the current folder
  const shouldRemoveConversationCard = lastSelectedConversationFolder?.id !== toFolderId
    && (
      !isDefaultConvFolder(lastSelectedConversationFolder?.id?.toString())
      || (cachedSettings?.excludeConvInFolders && lastSelectedConversationFolder?.id?.toString() === 'all')
    );
  if (shouldRemoveConversationCard) {
    conversationIds.forEach((conversationId) => {
      const conversationcards = document.querySelectorAll(`#conversation-card-${conversationId}`);
      conversationcards.forEach((conversationCard) => {
        conversationCard.remove();
      });
    });
    // if nothing left in the folder, show no conversation element
    // manager
    const conversationList = document.querySelector('#modal-manager #conversation-manager-conversation-list');
    if (conversationList && conversationList.children.length === 0) {
      conversationList.appendChild(noConversationElement());
    }
    // sidebar
    const sidebarFolderContent = document.querySelector('#sidebar-folder-content');
    if (sidebarFolderContent && sidebarFolderContent.querySelectorAll('[id^=conversation-card-]').length === 0) {
      sidebarFolderContent.appendChild(noConversationElement());
    }
  } else {
    conversationIds.forEach((conversationId) => {
      const conversationCards = document.querySelectorAll(`#conversation-card-${conversationId}`);
      conversationCards.forEach((conversationCard) => {
        conversationCard.dataset.folderId = toFolderId;
      });

      // update sidebar conv indicator
      const conversationCardFolderColorIndicator = document.querySelector(`#sidebar-folder-content #conversation-card-folder-color-indicator-${conversationId}`);
      if (conversationCardFolderColorIndicator) {
        conversationCardFolderColorIndicator.style.backgroundColor = toFolderColor;
        conversationCardFolderColorIndicator.title = toFolderName || '';
      }
      // uncheck the conversation
      const conversationCheckbox = document.querySelector(`#modal-manager #conversation-checkbox-${conversationId}`);
      if (conversationCheckbox) conversationCheckbox.checked = false;
    });
    // update manager conv indicator
    updateConversationFolderIndicators(toFolderId, { name: toFolderName, color: toFolderColor });
  }
  resetConversationManagerSelection();
  resetSidebarConversationSelection();

  chrome.runtime.sendMessage({
    type: 'moveConversationIdsToFolder',
    detail: {
      folderId: parseInt(toFolderId, 10),
      conversationIds,
    },
  });
}
