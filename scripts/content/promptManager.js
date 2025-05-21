/* eslint-disable no-restricted-globals */
/* global toast, isWindows, dropdown, addDropdownEventListener, openPromptEditorModal, showConfirmDialog, loadingSpinner, debounce, promptsSortByList, showPromptManagerFolderMenu, handleRenamePromptFolderClick, closeMenus, showPromptManagerCardMenu, runPromptChain, initializeContinueButton, languageList, errorUpgradeConfirmation, showPromptManagerSidebarSettingsMenu, escapeHTML, generateRandomDarkColor, translate, elementResizeObserver, isDarkMode, throttle, openMovePromptToFolderModal, cachedSettings */

let selectedPromptFolderBreadcrumb = [];
let lastSelectedPromptCardId = '';
let lastSelectedPromptCheckboxId = '';
chrome.storage.local.get(['selectedPromptFolderBreadcrumb'], (result) => {
  selectedPromptFolderBreadcrumb = result.selectedPromptFolderBreadcrumb || [];
});
function getLastSelectedPromptFolder() {
  if (selectedPromptFolderBreadcrumb.length === 0) return null;
  return selectedPromptFolderBreadcrumb[selectedPromptFolderBreadcrumb.length - 1];
}
function generatePromptFolderBreadcrumb(breadcrumbElement) {
  breadcrumbElement.innerHTML = '';
  const separator = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md-heavy me-1"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.29289 18.7071C8.90237 18.3166 8.90237 17.6834 9.29289 17.2929L14.5858 12L9.29289 6.70711C8.90237 6.31658 8.90237 5.68342 9.29289 5.29289C9.68342 4.90237 10.3166 4.90237 10.7071 5.29289L16.7071 11.2929C16.8946 11.4804 17 11.7348 17 12C17 12.2652 16.8946 12.5196 16.7071 12.7071L10.7071 18.7071C10.3166 19.0976 9.68342 19.0976 9.29289 18.7071Z" fill="currentColor"></path></svg>';
  const folderIcon = (isLast) => `<svg stroke="currentColor" fill="currentColor" class="icon-sm me-1 ${isLast ? 'text-token-text-primary' : ''} group-hover:text-token-text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M147.8 192H480V144C480 117.5 458.5 96 432 96h-160l-64-64h-160C21.49 32 0 53.49 0 80v328.4l90.54-181.1C101.4 205.6 123.4 192 147.8 192zM543.1 224H147.8C135.7 224 124.6 230.8 119.2 241.7L0 480h447.1c12.12 0 23.2-6.852 28.62-17.69l96-192C583.2 249 567.7 224 543.1 224z"/></svg>`;
  breadcrumbElement.innerHTML += separator;

  const isDefaultFolder = isDefaultPromptFolder(selectedPromptFolderBreadcrumb[0]?.id);
  const newFolderButton = document.querySelector('#modal-manager #prompt-manager-new-folder-button');
  if (isDefaultFolder) {
    breadcrumbElement.classList.replace('flex', 'hidden');
    if (newFolderButton) newFolderButton.classList.replace('flex', 'hidden');
  } else {
    breadcrumbElement.classList.replace('hidden', 'flex');
    if (newFolderButton) newFolderButton.classList.replace('hidden', 'flex');
  }

  const breadcrumbList = selectedPromptFolderBreadcrumb;
  breadcrumbList.forEach((folder, i) => {
    const breadcrumbItem = document.createElement('span');
    breadcrumbItem.classList = 'flex items-center text-token-text-tertiary text-sm group';

    const breadcrumbFolderName = document.createElement('span');
    breadcrumbFolderName.id = `folder-breadcrumb-${folder.id}`;
    breadcrumbFolderName.classList = `me-1 text-nowrap hover:underline cursor-pointer ${i === breadcrumbList.length - 1 ? 'text-token-text-primary' : 'text-token-text-tertiary hover:text-token-text-primary'}`;
    breadcrumbFolderName.innerText = isDefaultPromptFolder(folder.id) ? folder.displayName : folder.name;
    breadcrumbFolderName.setAttribute('data-folder-id', folder.id);
    breadcrumbItem.innerHTML = folderIcon(i === breadcrumbList.length - 1);
    breadcrumbItem.appendChild(breadcrumbFolderName);
    if (i < breadcrumbList.length - 1) {
      breadcrumbItem.innerHTML += separator;
    }
    breadcrumbElement.appendChild(breadcrumbItem);
  });
}

const defaultPromptFolders = [{
  id: 'recent',
  name: '<div class="flex items-center"><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="icon-sm me-2" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" > <circle cx="12" cy="12" r="10"></circle> <polyline points="12 6 12 12 16 14"></polyline></svg> Recent</div>',
  displayName: 'Recent',
},
{
  id: 'favorites',
  name: '<div class="flex items-center"><svg class="icon-sm me-2" fill="gold" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M381.2 150.3L524.9 171.5C536.8 173.2 546.8 181.6 550.6 193.1C554.4 204.7 551.3 217.3 542.7 225.9L438.5 328.1L463.1 474.7C465.1 486.7 460.2 498.9 450.2 506C440.3 513.1 427.2 514 416.5 508.3L288.1 439.8L159.8 508.3C149 514 135.9 513.1 126 506C116.1 498.9 111.1 486.7 113.2 474.7L137.8 328.1L33.58 225.9C24.97 217.3 21.91 204.7 25.69 193.1C29.46 181.6 39.43 173.2 51.42 171.5L195 150.3L259.4 17.97C264.7 6.954 275.9-.0391 288.1-.0391C300.4-.0391 311.6 6.954 316.9 17.97L381.2 150.3z"/></svg> Favorites</div>',
  displayName: 'Favorites',
},
{
  id: 'public',
  name: '<div class="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" stroke="currentColor" fill="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-sm me-2" height="1em" width="1em"><path d="M319.9 320c57.41 0 103.1-46.56 103.1-104c0-57.44-46.54-104-103.1-104c-57.41 0-103.1 46.56-103.1 104C215.9 273.4 262.5 320 319.9 320zM369.9 352H270.1C191.6 352 128 411.7 128 485.3C128 500.1 140.7 512 156.4 512h327.2C499.3 512 512 500.1 512 485.3C512 411.7 448.4 352 369.9 352zM512 160c44.18 0 80-35.82 80-80S556.2 0 512 0c-44.18 0-80 35.82-80 80S467.8 160 512 160zM183.9 216c0-5.449 .9824-10.63 1.609-15.91C174.6 194.1 162.6 192 149.9 192H88.08C39.44 192 0 233.8 0 285.3C0 295.6 7.887 304 17.62 304h199.5C196.7 280.2 183.9 249.7 183.9 216zM128 160c44.18 0 80-35.82 80-80S172.2 0 128 0C83.82 0 48 35.82 48 80S83.82 160 128 160zM551.9 192h-61.84c-12.8 0-24.88 3.037-35.86 8.24C454.8 205.5 455.8 210.6 455.8 216c0 33.71-12.78 64.21-33.16 88h199.7C632.1 304 640 295.6 640 285.3C640 233.8 600.6 192 551.9 192z"/></svg> Public</div>',
  displayName: 'Public',
}];
function isDefaultPromptFolder(folderId) {
  if (!folderId) return false;
  return defaultPromptFolders.map((f) => f.id).includes(folderId.toString());
}
// eslint-disable-next-line no-unused-vars
function promptManagerModalContent() {
  resetPromptManagerParams();
  const content = document.createElement('div');
  content.id = 'modal-content-prompt-manager';
  content.style = 'overflow-y: hidden;position: relative;height:100%; width:100%';
  content.classList = 'markdown prose-invert flex';
  const { managerSidebarWidth = 220 } = cachedSettings;
  // sidebar
  const sidebar = document.createElement('div');
  sidebar.id = 'prompt-manager-sidebar';
  sidebar.style = `width:${managerSidebarWidth}px;min-width:220px;resize:horizontal;overflow:hidden;`;
  sidebar.classList = 'bg-token-main-surface-primary border-e border-token-border-medium relative h-full';
  sidebar.appendChild(promptManagerSidebarContent());
  elementResizeObserver(sidebar, 'managerSidebarWidth');
  content.appendChild(sidebar);

  // main content
  const mainContent = document.createElement('div');
  mainContent.id = 'prompt-manager-main-content';
  mainContent.style = `width:calc(100% - ${managerSidebarWidth}px)`;
  mainContent.classList = 'overflow-y-auto h-full';
  mainContent.appendChild(promptManagerMainContent());
  content.appendChild(mainContent);

  return content;
}
// eslint-disable-next-line no-unused-vars
function promptManagerModalActions() {
  const actions = document.createElement('div');
  actions.classList = 'flex items-center justify-end w-full mt-2';
  const addNewPromptButton = document.createElement('button');
  addNewPromptButton.classList = 'btn btn-primary';
  addNewPromptButton.innerText = translate('plus Add New Prompt');
  addNewPromptButton.addEventListener('click', () => {
    const lastSelectedPromptFolder = getLastSelectedPromptFolder();
    const newPromptChain = {
      title: '',
      steps: [''],
      folder: { id: lastSelectedPromptFolder?.id },
    };
    openPromptEditorModal(newPromptChain);
  });
  actions.appendChild(addNewPromptButton);
  return actions;
}
function promptManagerSidebarContent() {
  const content = document.createElement('div');
  content.classList = 'relative h-full';
  const title = document.createElement('div');
  title.classList = 'text-lg p-4';
  title.innerText = translate('Categories');
  content.appendChild(title);
  const sidebarFolderList = document.createElement('div');
  sidebarFolderList.id = 'prompt-manager-sidebar-folders';
  sidebarFolderList.classList = 'px-2 pb-32 overflow-y-auto h-full';
  sidebarFolderList.addEventListener('scroll', () => {
    const promptFolderMenu = document.querySelector('#modal-manager #prompt-manager-folder-menu');
    if (promptFolderMenu) promptFolderMenu.remove();
  });
  content.appendChild(sidebarFolderList);

  sidebarFolderList.appendChild(defaultPromptFoldersList());

  sidebarFolderList.appendChild(loadingSpinner('prompt-manager-sidebar'));

  const { selectedPromptsManagerFoldersSortBy = 'alphabetical' } = cachedSettings;
  chrome.runtime.sendMessage({
    type: 'getPromptFolders',
    detail: {
      sortBy: selectedPromptsManagerFoldersSortBy,
    },
  }, async (promptFolders) => {
    if (!promptFolders) return;
    if (!Array.isArray(promptFolders)) return;
    const loadingSpinnerElement = document.querySelector('#modal-manager #loading-spinner-prompt-manager-sidebar');
    if (loadingSpinnerElement) loadingSpinnerElement.remove();

    let lastSelectedPromptFolder = getLastSelectedPromptFolder();

    if (promptFolders.length === 0) {
      sidebarFolderList.appendChild(noPromptFolderElemet());
      if (!lastSelectedPromptFolder || !isDefaultPromptFolder(lastSelectedPromptFolder?.id?.toString())) {
        selectedPromptFolderBreadcrumb = [defaultPromptFolders[0]];
        const curFolderElement = document.querySelector(`#modal-manager #prompt-folder-wrapper-${selectedPromptFolderBreadcrumb[0]?.id}`);
        curFolderElement?.querySelector('div[id^="prompt-folder-indicator-"]')?.classList?.add('bg-black', 'dark:bg-white');
      }
    } else {
      if (!lastSelectedPromptFolder || ![...defaultPromptFolders, ...promptFolders].map((f) => f.id.toString()).includes(selectedPromptFolderBreadcrumb?.[0]?.id?.toString())) {
        selectedPromptFolderBreadcrumb = [promptFolders[0]];
      }
      promptFolders?.forEach((folder, index) => {
        const is4n = (index + 1) % 4 === 0;
        sidebarFolderList.appendChild(promptFolderElement(folder, is4n));
      });
    }
    lastSelectedPromptFolder = getLastSelectedPromptFolder();
    chrome.storage.local.set({ selectedPromptFolderBreadcrumb });
    // update breadcrumb element
    const managerBreadcrumbElement = document.querySelector('#modal-manager #prompt-manager-breadcrumb');
    if (managerBreadcrumbElement) {
      generatePromptFolderBreadcrumb(managerBreadcrumbElement);
    }
    await fetchPrompts();
    throttleGetPromptSubFolders(lastSelectedPromptFolder?.id);
  });

  const sidebarActions = document.createElement('div');
  sidebarActions.classList = 'flex items-center justify-between absolute start-0 bottom-0 w-full bg-token-main-surface-secondary border-t border-token-border-medium px-2 h-10 z-10';
  content.appendChild(sidebarActions);

  const sidebarSettingsButton = document.createElement('button');
  sidebarSettingsButton.id = 'prompt-manager-sidebar-settings-button';
  sidebarSettingsButton.classList = 'flex items-center justify-center h-8 rounded-lg px-2 text-token-text-tertiary focus-visible:outline-0 hover:bg-token-sidebar-surface-secondary focus-visible:bg-token-sidebar-surface-secondary';
  sidebarSettingsButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" stroke="currentColor" fill="currentColor" stroke-linecap="round" stroke-linejoin="round" class="icon-md" fill="currentColor" viewBox="0 0 448 512"><path d="M0 88C0 74.75 10.75 64 24 64H424C437.3 64 448 74.75 448 88C448 101.3 437.3 112 424 112H24C10.75 112 0 101.3 0 88zM0 248C0 234.7 10.75 224 24 224H424C437.3 224 448 234.7 448 248C448 261.3 437.3 272 424 272H24C10.75 272 0 261.3 0 248zM424 432H24C10.75 432 0 421.3 0 408C0 394.7 10.75 384 24 384H424C437.3 384 448 394.7 448 408C448 421.3 437.3 432 424 432z"/></svg>';
  sidebarSettingsButton.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    closeMenus();
    showPromptManagerSidebarSettingsMenu(sidebarSettingsButton);
  });
  sidebarActions.appendChild(sidebarSettingsButton);

  const addPromptFolderButton = document.createElement('button');
  addPromptFolderButton.id = 'add-prompt-folder-button';
  addPromptFolderButton.title = 'Add New Category';
  addPromptFolderButton.classList = 'flex items-center justify-center h-8 rounded-lg px-2 text-token-text-tertiary focus-visible:outline-0 hover:bg-token-sidebar-surface-secondary focus-visible:bg-token-sidebar-surface-secondary';
  addPromptFolderButton.innerHTML = '<svg stroke="currentColor" fill="currentColor" stroke-width="2" viewBox="0 0 448 512" stroke-linecap="round" stroke-linejoin="round" class="icon-md" xmlns="http://www.w3.org/2000/svg"> <path d="M432 256C432 269.3 421.3 280 408 280h-160v160c0 13.25-10.75 24.01-24 24.01S200 453.3 200 440v-160h-160c-13.25 0-24-10.74-24-23.99C16 242.8 26.75 232 40 232h160v-160c0-13.25 10.75-23.99 24-23.99S248 58.75 248 72v160h160C421.3 232 432 242.8 432 256z"> </path> </svg>';
  chrome.runtime.sendMessage({
    type: 'checkHasSubscription',
  }, (hasSubscription) => {
    addPromptFolderButton.addEventListener('click', () => {
      const noPromptFolders = document.querySelector('#modal-manager #no-prompt-folders');
      if (noPromptFolders) noPromptFolders.remove();
      const userFolders = document.querySelectorAll('#modal-manager #prompt-manager-sidebar-folders > div[id^="prompt-folder-wrapper-"]');
      if (!hasSubscription && userFolders.length >= 5) {
        const error = { type: 'limit', title: 'You have reached the limit', message: 'You have reached the limits of Prompt Categories with free account. Upgrade to Pro to remove all limits.' };
        errorUpgradeConfirmation(error);
        return;
      }
      chrome.runtime.sendMessage({
        type: 'addPromptFolders',
        detail: {
          folders: [{
            name: 'New Category',
            color: generateRandomDarkColor(),
          }],
        },
      }, (newPromptFolders) => {
        if (newPromptFolders.error && newPromptFolders.error.type === 'limit') {
          errorUpgradeConfirmation(newPromptFolders.error);
          return;
        }
        if (!newPromptFolders || newPromptFolders.length === 0) return;
        addNewPromptFolderElementToManagerSidebar(newPromptFolders[0]);
        // click the new folder
        const newFolderElement = document.querySelector(`#modal-manager #prompt-folder-wrapper-${newPromptFolders[0].id}`);
        newFolderElement.click();
        handleRenamePromptFolderClick(newPromptFolders[0].id);
      });
    });
  });
  sidebarActions.appendChild(addPromptFolderButton);

  return content;
}
function addNewPromptFolderElementToManagerSidebar(folder) {
  const curManagerSidebarFolderList = document.querySelector('#modal-manager #prompt-manager-sidebar-folders');
  if (!curManagerSidebarFolderList) return;
  curManagerSidebarFolderList.appendChild(promptFolderElement(folder));
  // scroll to bottom
  curManagerSidebarFolderList.scrollTop = curManagerSidebarFolderList.scrollHeight;
}
function defaultPromptFoldersList() {
  const content = document.createElement('div');
  content.id = 'default-prompt-folders';
  content.classList = 'pb-2 mb-4 border-b border-token-border-medium';

  defaultPromptFolders.forEach((folder) => {
    content.appendChild(promptFolderElement(folder));
  });

  return content;
}
function promptFolderElement(folder, leftMenu = false) {
  if (!folder) return null;
  const isDefaultFolder = isDefaultPromptFolder(folder.id);
  const isLocked = folder.id === -1;
  const folderElement = document.createElement('div');
  folderElement.id = `prompt-folder-wrapper-${folder.id}`;
  folderElement.classList = `relative flex items-center justify-between p-2 ${isDefaultFolder ? '' : 'py-1'} cursor-pointer border bg-token-main-surface-secondary border-token-border-medium rounded-md mb-2 group ${isLocked ? 'opacity-50' : ''}`;
  folderElement.style.minHeight = '42px';
  if (folder.color) {
    folderElement.style.backgroundColor = folder.color;
  }
  const folderIndicator = document.createElement('div');
  folderIndicator.id = `prompt-folder-indicator-${folder.id}`;
  folderIndicator.classList = `w-1 h-10 rounded-s-xl absolute ${selectedPromptFolderBreadcrumb[0]?.id?.toString() === folder.id.toString() ? 'bg-black dark:bg-white' : ''}`;
  folderIndicator.style.right = '-9px';
  folderElement.appendChild(folderIndicator);

  folderElement.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeMenus();
    if (isLocked) {
      const error = { type: 'limit', title: 'You have reached the limit', message: 'With free account, you can only have up to 5 prompt categories. Upgrade to Pro to remove all limits.' };
      errorUpgradeConfirmation(error);
      return;
    }
    const curLastSelectedPromptFolder = getLastSelectedPromptFolder();

    if (curLastSelectedPromptFolder?.id?.toString() === folder.id.toString() && !e.shiftKey) return;

    // if folder has a parent and parent is the last selected folder
    if (folder.parent_folder && folder.parent_folder === curLastSelectedPromptFolder?.id) {
      selectedPromptFolderBreadcrumb.push(folder);
    } else {
      selectedPromptFolderBreadcrumb = [folder];
    }

    // update breadcrumb element
    const managerBreadcrumbElement = document.querySelector('#modal-manager #prompt-manager-breadcrumb');
    if (managerBreadcrumbElement) {
      generatePromptFolderBreadcrumb(managerBreadcrumbElement);
    }

    chrome.storage.local.set({ selectedPromptFolderBreadcrumb });

    const folders = document.querySelectorAll('#modal-manager div[id^="prompt-folder-wrapper-"]');
    folders.forEach((f) => {
      f.querySelector('div[id^="prompt-folder-indicator-"]')?.classList.remove('bg-black', 'dark:bg-white');
    });

    const curFolderElement = document.querySelector(`#modal-manager #prompt-folder-wrapper-${selectedPromptFolderBreadcrumb[0]?.id}`);
    curFolderElement?.querySelector('div[id^="prompt-folder-indicator-"]')?.classList?.add('bg-black', 'dark:bg-white');

    resetPromptManagerSelection();
    throttleGetPromptSubFolders(folder.id, e.shiftKey);
    fetchPrompts(1, e.shiftKey);
  });

  // if right click on folder show showPromptManagerFolderMenu
  folderElement.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const folderSettingsButton = document.querySelector(`#prompt-folder-settings-${folder.id}`);
    folderSettingsButton?.click();
  });

  folderElement.addEventListener('dblclick', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLocked) return;
    if (!isDefaultFolder) {
      handleRenamePromptFolderClick(folder.id);
    }
  });
  folderElement.addEventListener('mouseenter', () => {
    closeMenus();
    const folderSettingsButtons = document.querySelectorAll('div[id^="prompt-folder-settings-"]');
    folderSettingsButtons.forEach((btn) => {
      if (btn.dataset.action === 'move') return;
      btn.classList.replace('flex', 'hidden');
    });
    const curFolderName = document.querySelector(`#prompt-folder-name-${folder.id}`);
    if (curFolderName) curFolderName.style.paddingRight = '36px';
  });
  folderElement.addEventListener('mouseleave', () => {
    const curFolderName = document.querySelector(`#prompt-folder-name-${folder.id}`);
    if (curFolderName) curFolderName.style.paddingRight = '0px';
  });
  const folderLeft = document.createElement('div');
  folderLeft.classList = 'flex items-center justify-start w-full h-full';

  // folder image
  const hasImage = folder.image || folder.image_url;
  const folderImageURL = folder.image || folder.image_url || (isDefaultFolder ? '' : chrome.runtime.getURL('icons/folder.png'));
  const folderImage = document.createElement('img');
  folderImage.id = `prompt-folder-image-${folder.id}`;
  folderImage.src = folderImageURL;
  folderImage.classList = `${hasImage ? 'w-6 h-6 me-2' : 'w-5 h-5 me-3'} rounded-md object-cover ${folderImageURL ? '' : 'hidden'}`;
  folderImage.style = 'filter:drop-shadow(0px 0px 1px black);padding-left:1px;';
  folderLeft.appendChild(folderImage);

  // folder name count wrapper
  const folderNameCountWrapper = document.createElement('div');
  folderNameCountWrapper.classList = 'flex items-center justify-start w-full flex-wrap overflow-hidden';
  folderLeft.appendChild(folderNameCountWrapper);

  // folder name
  const folderName = document.createElement('span');
  folderName.id = `prompt-folder-name-${folder.id}`;
  folderName.classList = `w-full truncate max-h-5 relative text-sm ${isDefaultFolder ? 'text-token-text-primary' : 'text-white'}`;
  folderName.innerHTML = folder.name;
  folderNameCountWrapper.appendChild(folderName);

  if (!isDefaultFolder) {
    const subfolderCount = document.createElement('span');
    subfolderCount.id = `folder-subfolder-count-${folder.id}`;
    subfolderCount.style = 'color: rgba(255, 255, 255, 0.6); font-size: 0.7rem;margin-right: 4px;';
    subfolderCount.innerText = `${folder?.subfolders?.length || 0} folder${folder?.subfolders?.length === 1 ? '' : 's'} -`;
    folderNameCountWrapper.appendChild(subfolderCount);

    const promptCount = document.createElement('span');
    promptCount.id = `folder-prompt-count-${folder.id}`;
    promptCount.style = 'color: rgba(255, 255, 255, 0.6); font-size: 0.7rem;';
    promptCount.innerText = `${folder.prompt_count || 0} prompt${folder.prompt_count !== 1 ? 's' : ''}`;
    folderNameCountWrapper.appendChild(promptCount);
  }

  folderElement.appendChild(folderLeft);

  const folderSettingsButton = document.createElement('div');
  folderSettingsButton.id = `prompt-folder-settings-${folder.id}`;
  folderSettingsButton.classList = 'absolute end-1 flex items-center justify-center h-6 rounded-lg px-2 text-token-text-primary focus-visible:outline-0 bg-token-sidebar-surface-secondary focus-visible:bg-token-sidebar-surface-secondary hidden group-hover:flex';
  folderSettingsButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md"><path fill-rule="evenodd" clip-rule="evenodd" d="M3 12C3 10.8954 3.89543 10 5 10C6.10457 10 7 10.8954 7 12C7 13.1046 6.10457 14 5 14C3.89543 14 3 13.1046 3 12ZM10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12ZM17 12C17 10.8954 17.8954 10 19 10C20.1046 10 21 10.8954 21 12C21 13.1046 20.1046 14 19 14C17.8954 14 17 13.1046 17 12Z" fill="currentColor"></path></svg>';
  folderSettingsButton.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    closeMenus();
    folderSettingsButton.classList.replace('hidden', 'flex');
    showPromptManagerFolderMenu(folderSettingsButton, folder, leftMenu);
  });
  if (folder.id !== 'public' && !isLocked) {
    folderElement.appendChild(folderSettingsButton);
  }

  if (isLocked) {
    const lockedFolderIndicator = document.createElement('div');
    lockedFolderIndicator.classList = 'absolute end-1 flex items-center justify-center h-6 rounded-lg px-2';
    lockedFolderIndicator.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="icon-lg" fill="#ef4146"><path d="M80 192V144C80 64.47 144.5 0 224 0C303.5 0 368 64.47 368 144V192H384C419.3 192 448 220.7 448 256V448C448 483.3 419.3 512 384 512H64C28.65 512 0 483.3 0 448V256C0 220.7 28.65 192 64 192H80zM144 192H304V144C304 99.82 268.2 64 224 64C179.8 64 144 99.82 144 144V192z"/></svg>';
    folderElement.appendChild(lockedFolderIndicator);
  }
  return folderElement;
}
function updatePromptFolderCount(fromFolderId, toFolderId, diff) {
  const fromIsDefaultFolder = isDefaultPromptFolder(fromFolderId);
  if (!fromIsDefaultFolder) {
    const fromFolderCounts = document.querySelectorAll(`#folder-prompt-count-${fromFolderId}`);
    fromFolderCounts.forEach((fromFolderCount) => {
      const count = parseInt(fromFolderCount.innerText.split(' ')[0], 10) - diff;
      fromFolderCount.innerText = `${count} prompt${count !== 1 ? 's' : ''}`;
    });
  }
  const toIsDefaultFolder = isDefaultPromptFolder(toFolderId);
  if (!toIsDefaultFolder) {
    const toFolderCounts = document.querySelectorAll(`#folder-prompt-count-${toFolderId}`);
    toFolderCounts.forEach((toFolderCount) => {
      const count = parseInt(toFolderCount.innerText.split(' ')[0], 10) + diff;
      toFolderCount.innerText = `${count} prompt${count !== 1 ? 's' : ''}`;
    });
  }
}
const throttleGetPromptSubFolders = throttle(async (folderId, forceRefresh = false) => {
  await getPromptSubFolders(folderId, forceRefresh);
}, 500);
async function getPromptSubFolders(folderId, forceRefresh = false) {
  if (!folderId) return;

  const managerSubfolderList = document.querySelector('#modal-manager #prompt-manager-subfolder-list');
  if (managerSubfolderList) {
    managerSubfolderList.innerHTML = '';
  }

  const isDefaultFolder = isDefaultPromptFolder(folderId);
  if (isDefaultFolder) return;

  const { selectedPromptsManagerFoldersSortBy = 'alphabetical' } = cachedSettings;
  chrome.runtime.sendMessage({
    type: 'getPromptFolders',
    forceRefresh,
    detail: {
      sortBy: selectedPromptsManagerFoldersSortBy,
      parentFolderId: folderId,
    },
  }, (promptFolders) => {
    if (!promptFolders) return;
    if (!Array.isArray(promptFolders)) return;
    if (promptFolders.length > 0) {
      promptFolders.forEach((folder, index) => {
        const is4n = (index + 1) % 4 === 0;
        managerSubfolderList?.appendChild(promptFolderElement(folder, is4n));
      });
    }
  });
}
function promptCardCompactViewButton() {
  const { selectedPromptView } = cachedSettings;

  const promptViewModeButton = document.createElement('button');
  promptViewModeButton.classList = 'h-10 aspect-1 flex items-center justify-center rounded-lg px-2 ms-2 text-token-text-tertiary focus-visible:outline-0 bg-token-sidebar-surface-primary hover:bg-token-sidebar-surface-secondary focus-visible:bg-token-sidebar-surface-secondary border border-token-border-medium';
  promptViewModeButton.innerHTML = selectedPromptView === 'list' ? '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="icon-md" viewBox="0 0 448 512"><path d="M88 32C110.1 32 128 49.91 128 72V120C128 142.1 110.1 160 88 160H40C17.91 160 0 142.1 0 120V72C0 49.91 17.91 32 40 32H88zM88 64H40C35.58 64 32 67.58 32 72V120C32 124.4 35.58 128 40 128H88C92.42 128 96 124.4 96 120V72C96 67.58 92.42 64 88 64zM88 192C110.1 192 128 209.9 128 232V280C128 302.1 110.1 320 88 320H40C17.91 320 0 302.1 0 280V232C0 209.9 17.91 192 40 192H88zM88 224H40C35.58 224 32 227.6 32 232V280C32 284.4 35.58 288 40 288H88C92.42 288 96 284.4 96 280V232C96 227.6 92.42 224 88 224zM0 392C0 369.9 17.91 352 40 352H88C110.1 352 128 369.9 128 392V440C128 462.1 110.1 480 88 480H40C17.91 480 0 462.1 0 440V392zM32 392V440C32 444.4 35.58 448 40 448H88C92.42 448 96 444.4 96 440V392C96 387.6 92.42 384 88 384H40C35.58 384 32 387.6 32 392zM248 32C270.1 32 288 49.91 288 72V120C288 142.1 270.1 160 248 160H200C177.9 160 160 142.1 160 120V72C160 49.91 177.9 32 200 32H248zM248 64H200C195.6 64 192 67.58 192 72V120C192 124.4 195.6 128 200 128H248C252.4 128 256 124.4 256 120V72C256 67.58 252.4 64 248 64zM160 232C160 209.9 177.9 192 200 192H248C270.1 192 288 209.9 288 232V280C288 302.1 270.1 320 248 320H200C177.9 320 160 302.1 160 280V232zM192 232V280C192 284.4 195.6 288 200 288H248C252.4 288 256 284.4 256 280V232C256 227.6 252.4 224 248 224H200C195.6 224 192 227.6 192 232zM248 352C270.1 352 288 369.9 288 392V440C288 462.1 270.1 480 248 480H200C177.9 480 160 462.1 160 440V392C160 369.9 177.9 352 200 352H248zM248 384H200C195.6 384 192 387.6 192 392V440C192 444.4 195.6 448 200 448H248C252.4 448 256 444.4 256 440V392C256 387.6 252.4 384 248 384zM320 72C320 49.91 337.9 32 360 32H408C430.1 32 448 49.91 448 72V120C448 142.1 430.1 160 408 160H360C337.9 160 320 142.1 320 120V72zM352 72V120C352 124.4 355.6 128 360 128H408C412.4 128 416 124.4 416 120V72C416 67.58 412.4 64 408 64H360C355.6 64 352 67.58 352 72zM408 192C430.1 192 448 209.9 448 232V280C448 302.1 430.1 320 408 320H360C337.9 320 320 302.1 320 280V232C320 209.9 337.9 192 360 192H408zM408 224H360C355.6 224 352 227.6 352 232V280C352 284.4 355.6 288 360 288H408C412.4 288 416 284.4 416 280V232C416 227.6 412.4 224 408 224zM320 392C320 369.9 337.9 352 360 352H408C430.1 352 448 369.9 448 392V440C448 462.1 430.1 480 408 480H360C337.9 480 320 462.1 320 440V392zM352 392V440C352 444.4 355.6 448 360 448H408C412.4 448 416 444.4 416 440V392C416 387.6 412.4 384 408 384H360C355.6 384 352 387.6 352 392z"/></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="icon-md" viewBox="0 0 512 512"><path d="M16 72C16 58.75 26.75 48 40 48H88C101.3 48 112 58.75 112 72V120C112 133.3 101.3 144 88 144H40C26.75 144 16 133.3 16 120V72zM80 112V80H48V112H80zM496 80C504.8 80 512 87.16 512 96C512 104.8 504.8 112 496 112H176C167.2 112 160 104.8 160 96C160 87.16 167.2 80 176 80H496zM496 240C504.8 240 512 247.2 512 256C512 264.8 504.8 272 496 272H176C167.2 272 160 264.8 160 256C160 247.2 167.2 240 176 240H496zM496 400C504.8 400 512 407.2 512 416C512 424.8 504.8 432 496 432H176C167.2 432 160 424.8 160 416C160 407.2 167.2 400 176 400H496zM88 208C101.3 208 112 218.7 112 232V280C112 293.3 101.3 304 88 304H40C26.75 304 16 293.3 16 280V232C16 218.7 26.75 208 40 208H88zM48 240V272H80V240H48zM16 392C16 378.7 26.75 368 40 368H88C101.3 368 112 378.7 112 392V440C112 453.3 101.3 464 88 464H40C26.75 464 16 453.3 16 440V392zM80 432V400H48V432H80z"/></svg>';
  promptViewModeButton.addEventListener('click', () => {
    const promptList = document.querySelector('#modal-manager #prompt-manager-prompt-list');
    promptList.classList = `grid ${cachedSettings.selectedPromptView !== 'list' ? 'grid-cols-1 gap-3' : 'grid-cols-4 gap-4'} w-full content-start`;

    if (cachedSettings.selectedPromptView === 'list') {
      promptViewModeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="icon-md" viewBox="0 0 512 512"><path d="M16 72C16 58.75 26.75 48 40 48H88C101.3 48 112 58.75 112 72V120C112 133.3 101.3 144 88 144H40C26.75 144 16 133.3 16 120V72zM80 112V80H48V112H80zM496 80C504.8 80 512 87.16 512 96C512 104.8 504.8 112 496 112H176C167.2 112 160 104.8 160 96C160 87.16 167.2 80 176 80H496zM496 240C504.8 240 512 247.2 512 256C512 264.8 504.8 272 496 272H176C167.2 272 160 264.8 160 256C160 247.2 167.2 240 176 240H496zM496 400C504.8 400 512 407.2 512 416C512 424.8 504.8 432 496 432H176C167.2 432 160 424.8 160 416C160 407.2 167.2 400 176 400H496zM88 208C101.3 208 112 218.7 112 232V280C112 293.3 101.3 304 88 304H40C26.75 304 16 293.3 16 280V232C16 218.7 26.75 208 40 208H88zM48 240V272H80V240H48zM16 392C16 378.7 26.75 368 40 368H88C101.3 368 112 378.7 112 392V440C112 453.3 101.3 464 88 464H40C26.75 464 16 453.3 16 440V392zM80 432V400H48V432H80z"/></svg>';
    } else {
      promptViewModeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="icon-md" viewBox="0 0 448 512"><path d="M88 32C110.1 32 128 49.91 128 72V120C128 142.1 110.1 160 88 160H40C17.91 160 0 142.1 0 120V72C0 49.91 17.91 32 40 32H88zM88 64H40C35.58 64 32 67.58 32 72V120C32 124.4 35.58 128 40 128H88C92.42 128 96 124.4 96 120V72C96 67.58 92.42 64 88 64zM88 192C110.1 192 128 209.9 128 232V280C128 302.1 110.1 320 88 320H40C17.91 320 0 302.1 0 280V232C0 209.9 17.91 192 40 192H88zM88 224H40C35.58 224 32 227.6 32 232V280C32 284.4 35.58 288 40 288H88C92.42 288 96 284.4 96 280V232C96 227.6 92.42 224 88 224zM0 392C0 369.9 17.91 352 40 352H88C110.1 352 128 369.9 128 392V440C128 462.1 110.1 480 88 480H40C17.91 480 0 462.1 0 440V392zM32 392V440C32 444.4 35.58 448 40 448H88C92.42 448 96 444.4 96 440V392C96 387.6 92.42 384 88 384H40C35.58 384 32 387.6 32 392zM248 32C270.1 32 288 49.91 288 72V120C288 142.1 270.1 160 248 160H200C177.9 160 160 142.1 160 120V72C160 49.91 177.9 32 200 32H248zM248 64H200C195.6 64 192 67.58 192 72V120C192 124.4 195.6 128 200 128H248C252.4 128 256 124.4 256 120V72C256 67.58 252.4 64 248 64zM160 232C160 209.9 177.9 192 200 192H248C270.1 192 288 209.9 288 232V280C288 302.1 270.1 320 248 320H200C177.9 320 160 302.1 160 280V232zM192 232V280C192 284.4 195.6 288 200 288H248C252.4 288 256 284.4 256 280V232C256 227.6 252.4 224 248 224H200C195.6 224 192 227.6 192 232zM248 352C270.1 352 288 369.9 288 392V440C288 462.1 270.1 480 248 480H200C177.9 480 160 462.1 160 440V392C160 369.9 177.9 352 200 352H248zM248 384H200C195.6 384 192 387.6 192 392V440C192 444.4 195.6 448 200 448H248C252.4 448 256 444.4 256 440V392C256 387.6 252.4 384 248 384zM320 72C320 49.91 337.9 32 360 32H408C430.1 32 448 49.91 448 72V120C448 142.1 430.1 160 408 160H360C337.9 160 320 142.1 320 120V72zM352 72V120C352 124.4 355.6 128 360 128H408C412.4 128 416 124.4 416 120V72C416 67.58 412.4 64 408 64H360C355.6 64 352 67.58 352 72zM408 192C430.1 192 448 209.9 448 232V280C448 302.1 430.1 320 408 320H360C337.9 320 320 302.1 320 280V232C320 209.9 337.9 192 360 192H408zM408 224H360C355.6 224 352 227.6 352 232V280C352 284.4 355.6 288 360 288H408C412.4 288 416 284.4 416 280V232C416 227.6 412.4 224 408 224zM320 392C320 369.9 337.9 352 360 352H408C430.1 352 448 369.9 448 392V440C448 462.1 430.1 480 408 480H360C337.9 480 320 462.1 320 440V392zM352 392V440C352 444.4 355.6 448 360 448H408C412.4 448 416 444.4 416 440V392C416 387.6 412.4 384 408 384H360C355.6 384 352 387.6 352 392z"/></svg>';
    }
    chrome.storage.local.set({
      settings: {
        ...cachedSettings,
        selectedPromptView: cachedSettings.selectedPromptView === 'list' ? 'grid' : 'list',
      },
    }, () => {
      fetchPrompts();
    });
  });
  return promptViewModeButton;
}
function promptManagerMainContent() {
  const lastSelectedPromptFolder = getLastSelectedPromptFolder();
  const isDefaultFolder = isDefaultPromptFolder(selectedPromptFolderBreadcrumb[0]?.id);
  const content = document.createElement('div');
  content.id = 'prompt-manager-content-wrapper';
  content.classList = 'relative h-full overflow-hidden';
  content.style.paddingBottom = '59px';
  const filterBar = document.createElement('div');
  filterBar.classList = 'flex items-center justify-between p-2 bg-token-main-surface-primary border-b border-token-border-medium sticky top-0 z-10';
  content.appendChild(filterBar);

  const searchInput = document.createElement('input');
  searchInput.id = 'prompt-manager-search-input';
  searchInput.type = 'search';
  searchInput.placeholder = translate('Search prompts');
  searchInput.classList = 'w-full p-2 rounded-md border border-token-border-medium bg-token-main-surface-secondary text-token-text-tertiary';
  const delayedSearch = debounce(() => {
    fetchPrompts();
  });
  searchInput.addEventListener('input', (e) => {
    if (e.target.value.trim().length > 2) {
      delayedSearch(e);
    } else if (e.target.value.length === 0) {
      fetchPrompts();
    }
  });
  filterBar.appendChild(searchInput);

  const rightSection = document.createElement('div');
  rightSection.id = 'prompt-manager-filters-right-section';
  rightSection.classList = `flex items-center ${lastSelectedPromptFolder?.id === 'recent' ? 'hidden' : ''}`;
  filterBar.appendChild(rightSection);

  const { selectedPromptsManagerSortBy, selectedPromptsManagerTag, selectedPromptsManagerLanguage } = cachedSettings;
  // add sort button
  const sortBySelectorWrapper = document.createElement('div');
  sortBySelectorWrapper.id = 'prompt-manager-sort-by-wrapper';
  sortBySelectorWrapper.style = 'position:relative;width:150px;z-index:1000;margin-left:8px;';
  sortBySelectorWrapper.innerHTML = dropdown('Prompts-Manager-SortBy', promptsSortByList, selectedPromptsManagerSortBy, 'code', 'right');
  rightSection.appendChild(sortBySelectorWrapper);
  if (lastSelectedPromptFolder?.id !== 'public') {
    const sortBySelectorVoteOption = document.querySelector('#modal-manager #prompts-manager-sortby-selector-option-vote');
    if (sortBySelectorVoteOption) sortBySelectorVoteOption.classList.add('hidden');
    const sortBySelectorUseOption = document.querySelector('#modal-manager #prompts-manager-sortby-selector-option-use');
    if (sortBySelectorUseOption) sortBySelectorUseOption.classList.add('hidden');
  }

  const tagSelectorWrapper = document.createElement('div');
  tagSelectorWrapper.id = 'prompt-manager-tag-selector-wrapper';
  tagSelectorWrapper.style = 'position:relative;width:150px;z-index:1000;margin-left:8px;';
  rightSection.appendChild(tagSelectorWrapper);
  chrome.runtime.sendMessage({
    type: 'getPromptTags',
  }, (tagList) => {
    if (!tagList) return;
    if (!Array.isArray(tagList)) return;
    tagList.sort((a, b) => a.name.localeCompare(b.name));
    // add { code: 'all', name: 'All' } to the tag list
    tagList?.unshift({ id: 'all', name: 'All' });
    tagSelectorWrapper.innerHTML = dropdown('Prompts-Manager-Tag', tagList, selectedPromptsManagerTag, 'id', 'right');
    addDropdownEventListener('Prompts-Manager-Tag', tagList, 'id', () => fetchPrompts());
  });

  const promptLanguageList = [{ code: 'all', name: 'All' }, ...languageList.slice(1)];
  const languageSelectorWrapper = document.createElement('div');
  languageSelectorWrapper.id = 'prompt-manager-language-selector-wrapper';
  languageSelectorWrapper.style = 'position:relative;width:150px;z-index:1000;margin-left:8px;';
  languageSelectorWrapper.innerHTML = dropdown('Prompts-Manager-Language', promptLanguageList, selectedPromptsManagerLanguage, 'code', 'right');
  rightSection.appendChild(languageSelectorWrapper);

  const compactViewButton = promptCardCompactViewButton();
  filterBar.appendChild(compactViewButton);

  const selectionBar = document.createElement('div');
  selectionBar.id = 'prompt-manager-selection-bar';
  selectionBar.classList = 'flex items-center justify-end px-2 py-3 hidden sticky top-0 bg-token-main-surface-primary z-10';
  content.appendChild(selectionBar);

  const cancelButton = document.createElement('button');
  cancelButton.id = 'prompt-manager-selection-cancel-button';
  cancelButton.classList = 'flex items-center justify-center h-8 rounded-lg px-2 text-token-text-primary focus-visible:outline-0 bg-token-main-surface-secondary hover:bg-token-main-surface-tertiary focus-visible:bg-token-main-surface-tertiary ms-2 me-auto border border-token-border-medium';
  cancelButton.innerText = translate('Cancel');
  cancelButton.addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('#modal-manager input[id^="prompt-checkbox-"]');
    checkboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });
    resetPromptManagerSelection();
  });
  selectionBar.appendChild(cancelButton);

  const selectionCount = document.createElement('span');
  selectionCount.id = 'prompt-manager-selection-count';
  selectionCount.classList = 'text-token-text-tertiary text-xs me-4';
  selectionCount.innerText = '0 selected';
  selectionBar.appendChild(selectionCount);

  const deleteButton = document.createElement('button');
  deleteButton.classList = 'flex items-center justify-center h-8 rounded-lg px-2 text-token-text-primary focus-visible:outline-0 bg-token-main-surface-secondary hover:bg-token-main-surface-tertiary focus-visible:bg-token-main-surface-tertiary me-2 border border-token-border-medium';
  deleteButton.innerText = translate('Delete');
  deleteButton.addEventListener('click', () => {
    const selectedPrompts = Array.from(document.querySelectorAll('#modal-manager input[id^="prompt-checkbox-"]:checked'));
    if (selectedPrompts.length === 0) return;
    showConfirmDialog('Delete prompts', 'Are you sure you want to delete the selected prompts?', 'Cancel', 'Delete', null, () => {
      const curLastSelectedPromptFolder = getLastSelectedPromptFolder();

      resetPromptManagerSelection();
      // remove the prompts from the list
      const promptIds = selectedPrompts.map((checkbox) => checkbox.id.split('prompt-checkbox-')[1]);
      promptIds.forEach((promptId) => {
        const promptCard = document.querySelector(`#modal-manager #prompt-card-${promptId}`);
        if (promptCard) promptCard.remove();
      });
      const promptList = document.querySelector('#modal-manager #prompt-manager-prompt-list');
      if (promptList.children.length === 0) {
        promptList.appendChild(noPromptElement());
      }
      // delete the prompts
      if (curLastSelectedPromptFolder?.id === 'recent') {
        chrome.storage.local.get(['userInputValueHistory'], (res) => {
          const newHistory = res.userInputValueHistory.filter((item) => !promptIds.includes(item.id));
          chrome.storage.local.set({ userInputValueHistory: newHistory });
        });
        return;
      }
      updatePromptFolderCount(curLastSelectedPromptFolder?.id, null, promptIds.length);

      chrome.runtime.sendMessage({
        type: 'deletePrompts',
        detail: {
          promptIds,
        },
      }, async () => {
        initializeContinueButton(true);
      });
    });
  });
  selectionBar.appendChild(deleteButton);

  // fodler content
  const folderContentWrapper = document.createElement('div');
  folderContentWrapper.id = 'prompt-manager-folder-content-wrapper';
  folderContentWrapper.classList = 'bg-token-sidebar-surface-primary flex flex-wrap h-full overflow-y-auto p-4 pb-32 content-start';
  content.appendChild(folderContentWrapper);

  const moveButton = document.createElement('button');
  moveButton.id = 'prompt-manager-move-button';
  moveButton.classList = `flex items-center justify-center h-8 rounded-lg px-2 text-token-text-primary focus-visible:outline-0 bg-token-main-surface-secondary hover:bg-token-main-surface-tertiary focus-visible:bg-token-main-surface-tertiary me-2 border border-token-border-medium ${lastSelectedPromptFolder?.id === 'recent' ? 'hidden' : ''}`;
  moveButton.innerText = translate('Move');
  moveButton.addEventListener('click', () => {
    handleClickMovePromptsButton();
  });
  selectionBar.appendChild(moveButton);

  const promptManagerHeader = document.createElement('div');
  promptManagerHeader.id = 'prompt-manager-header';
  promptManagerHeader.classList = 'flex items-center justify-between mb-4 w-full';
  folderContentWrapper.appendChild(promptManagerHeader);
  // breadcrumb
  const breadcrumb = document.createElement('div');
  breadcrumb.id = 'prompt-manager-breadcrumb';
  breadcrumb.classList = `${isDefaultFolder ? 'hidden' : 'flex'} items-center justify-start bg-token-main-surface-secondary p-2 rounded-lg border border-token-border-medium overflow-x-auto`;
  breadcrumb.style.maxWidth = 'calc(100% - 48px)';
  breadcrumb.addEventListener('click', (event) => {
    // Check if the clicked element is a breadcrumb item.
    if (event.target && event.target.matches('[data-folder-id]')) {
      const folderId = event.target.getAttribute('data-folder-id');

      // Find the clicked folder in the breadcrumb list.
      const folderIndex = selectedPromptFolderBreadcrumb.findIndex((f) => f.id.toString() === folderId.toString());
      if (folderIndex !== -1 && (folderIndex < selectedPromptFolderBreadcrumb.length - 1 || event.shiftKey)) {
        resetPromptManagerSelection();
        selectedPromptFolderBreadcrumb = selectedPromptFolderBreadcrumb.slice(0, folderIndex + 1);
        chrome.storage.local.set({ selectedPromptFolderBreadcrumb });

        generatePromptFolderBreadcrumb(breadcrumb);

        throttleGetPromptSubFolders(folderId, event.shiftKey);
        fetchPrompts(1, event.shiftKey);
      }
    }
  });
  promptManagerHeader.appendChild(breadcrumb);
  // new folder button
  const newFolderButton = document.createElement('button');
  newFolderButton.id = 'prompt-manager-new-folder-button';
  newFolderButton.title = 'Add New Folder';
  newFolderButton.classList = `${isDefaultFolder ? 'hidden' : 'flex'} items-center justify-center h-full rounded-lg p-2 ms-2 text-token-text-tertiary focus-visible:outline-0 hover:bg-token-sidebar-surface-secondary focus-visible:bg-token-sidebar-surface-secondary`;
  newFolderButton.innerHTML = '<svg stroke="currentColor" fill="currentColor" class="icon-lg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M464 96h-192l-64-64h-160C21.5 32 0 53.5 0 80v352C0 458.5 21.5 480 48 480h416c26.5 0 48-21.5 48-48v-288C512 117.5 490.5 96 464 96zM336 311.1h-56v56C279.1 381.3 269.3 392 256 392c-13.27 0-23.1-10.74-23.1-23.1V311.1H175.1C162.7 311.1 152 301.3 152 288c0-13.26 10.74-23.1 23.1-23.1h56V207.1C232 194.7 242.7 184 256 184s23.1 10.74 23.1 23.1V264h56C349.3 264 360 274.7 360 288S349.3 311.1 336 311.1z"/></svg>';
  chrome.runtime.sendMessage({
    type: 'checkHasSubscription',
  }, (hasSubscription) => {
    newFolderButton.addEventListener('click', () => {
      const curlastSelectedPromptFolder = getLastSelectedPromptFolder();
      if (curlastSelectedPromptFolder) {
        const curIsDefaultFolder = isDefaultPromptFolder(curlastSelectedPromptFolder.id);
        if (curIsDefaultFolder) {
          toast('You cannot add a folder to this folder.', 'error');
          return;
        }
      }
      const userFolders = document.querySelectorAll('#modal-manager #prompt-manager-sidebar-folders > div[id^="prompt-folder-wrapper-"]');
      if (!hasSubscription && userFolders.length >= 5) {
        const error = { type: 'limit', title: 'You have reached the limit', message: 'You have reached the limits of Prompt Folders with free account. Upgrade to Pro to remove all limits.' };
        errorUpgradeConfirmation(error);
        return;
      }
      const noPromptFolders = document.querySelectorAll('#no-prompt-folders');
      noPromptFolders.forEach((el) => el.remove());

      const newFolder = {
        name: 'New Category',
        color: generateRandomDarkColor(),
      };
      if (curlastSelectedPromptFolder) {
        newFolder.color = curlastSelectedPromptFolder.color;
        newFolder.parent_folder = curlastSelectedPromptFolder.id;
        newFolder.image_url = curlastSelectedPromptFolder.image || curlastSelectedPromptFolder.image_url;
      }
      chrome.runtime.sendMessage({
        type: 'addPromptFolders',
        detail: {
          folders: [newFolder],
        },
      }, (newPromptFolders) => {
        if (newPromptFolders.error && newPromptFolders.error.type === 'limit') {
          errorUpgradeConfirmation(newPromptFolders.error);
          return;
        }
        if (!newPromptFolders || newPromptFolders.length === 0) return;
        const managerSubfolderLists = document.querySelector('#prompt-manager-subfolder-list');
        managerSubfolderLists?.prepend(promptFolderElement(newPromptFolders[0]));
        managerSubfolderLists?.scrollIntoView({ block: 'nearest', inline: 'nearest' });

        // update parent folder folder count
        const parentFolderCounts = document.querySelectorAll(`#folder-subfolder-count-${curlastSelectedPromptFolder?.id}`);
        parentFolderCounts.forEach((parentFolderCount) => {
          const count = parseInt(parentFolderCount.innerText.split(' ')[0], 10);
          parentFolderCount.innerText = `${count + 1} folder${count + 1 === 1 ? '' : 's'} -`;
        });
        // rename new folder
        handleRenamePromptFolderClick(newPromptFolders[0].id);
      });
    });
  });
  promptManagerHeader.appendChild(newFolderButton);

  // subfolder list
  const subfolderList = document.createElement('div');
  subfolderList.id = 'prompt-manager-subfolder-list';
  subfolderList.classList = 'grid grid-cols-4 gap-x-4 gap-y-2 content-start w-full mb-2';
  folderContentWrapper.appendChild(subfolderList);

  // prompt list
  const promptList = document.createElement('div');
  promptList.id = 'prompt-manager-prompt-list';
  folderContentWrapper.appendChild(promptList);

  promptList.classList = `grid ${cachedSettings.selectedPromptView === 'list' ? 'grid-cols-1 gap-3' : 'grid-cols-4 gap-4'} content-start w-full`;

  return content;
}

function handleClickMovePromptsButton() {
  const selectedPrompts = Array.from(document.querySelectorAll('#modal-manager input[id^="prompt-checkbox-"]:checked'));
  if (selectedPrompts.length === 0) return;
  const promptIds = selectedPrompts.map((c) => c.dataset.promptId);
  openMovePromptToFolderModal(promptIds);
}

function resetPromptManagerParams() {
  lastSelectedPromptCardId = '';
  lastSelectedPromptCheckboxId = '';
}
function resetPromptManagerSelection() {
  lastSelectedPromptCheckboxId = '';
  const lastSelectedPromptFolder = getLastSelectedPromptFolder();

  const searchInput = document.querySelector('#modal-manager input[placeholder="Search prompts"]');
  if (searchInput) searchInput.value = '';
  const rightSection = document.querySelector('#modal-manager #prompt-manager-filters-right-section');
  if (rightSection) {
    if (lastSelectedPromptFolder?.id === 'recent') {
      rightSection.classList.add('hidden');
    } else {
      rightSection.classList.remove('hidden');
    }
  }
  // hide/show public sortby options
  const sortBySelectorVoteOption = document.querySelector('#modal-manager #prompts-manager-sortby-selector-option-vote');
  const sortBySelectorUseOption = document.querySelector('#modal-manager #prompts-manager-sortby-selector-option-use');
  if (lastSelectedPromptFolder?.id !== 'public') {
    if (sortBySelectorVoteOption) sortBySelectorVoteOption.classList.add('hidden');
    if (sortBySelectorUseOption) sortBySelectorUseOption.classList.add('hidden');
  } else {
    if (sortBySelectorVoteOption) sortBySelectorVoteOption.classList.remove('hidden');
    if (sortBySelectorUseOption) sortBySelectorUseOption.classList.remove('hidden');
  }
  const promptCardMenu = document.querySelector('#modal-manager #prompt-card-menu');
  if (promptCardMenu) promptCardMenu.remove();
  const selectionBar = document.querySelector('#modal-manager div[id="prompt-manager-selection-bar"]');
  if (selectionBar) selectionBar.classList.add('hidden');
  const contentWrapper = document.querySelector('#modal-manager div[id="prompt-manager-content-wrapper"]');
  if (contentWrapper) {
    contentWrapper.style.paddingBottom = '59px';
  }
  const moveButton = document.querySelector('#modal-manager button[id="prompt-manager-move-button"]');
  if (moveButton) {
    if (defaultPromptFolders.map((folder) => folder.id).includes(lastSelectedPromptFolder?.id)) {
      moveButton.classList.add('hidden');
    } else {
      moveButton.classList.remove('hidden');
    }
  }
  const selectionCount = document.querySelector('#modal-manager span[id="prompt-manager-selection-count"]');
  if (selectionCount) selectionCount.innerText = '0 selected';
}
async function fetchPrompts(pageNumber = 1, forceRefresh = false) {
  const lastSelectedPromptFolder = getLastSelectedPromptFolder();
  if (!lastSelectedPromptFolder) return;
  const promptList = document.querySelector('#modal-manager #prompt-manager-prompt-list');
  if (!promptList) return;
  if (pageNumber === 1) {
    promptList.innerHTML = '';
    promptList.appendChild(loadingSpinner('prompt-manager-main-content'));
  }
  if (lastSelectedPromptFolder?.id === 'recent') {
    loadRecentPrompts();
    return;
  }

  const { selectedPromptsManagerSortBy, selectedPromptsManagerLanguage, selectedPromptsManagerTag } = cachedSettings;
  const sortBy = lastSelectedPromptFolder?.id !== 'public' && ['vote', 'use'].includes(selectedPromptsManagerSortBy?.code) ? 'created_at' : selectedPromptsManagerSortBy?.code;
  if (sortBy !== selectedPromptsManagerSortBy?.code) {
    const selectedOptionTitle = document.querySelector('#modal-manager #selected-prompts-manager-sortby-title');
    selectedOptionTitle.textContent = 'Create date';
    const createDateOption = document.querySelector('#modal-manager #prompts-manager-sortby-selector-option-created_at');
    const optionSelectorCheckmark = document.querySelector('#modal-manager #prompts-manager-sortby-selector-checkmark');
    if (optionSelectorCheckmark) {
      optionSelectorCheckmark.remove();
      createDateOption.appendChild(optionSelectorCheckmark);
    } else {
      createDateOption.insertAdjacentHTML('beforeend', `<span id="prompts-manager-sortby-selector-checkmark" class="absolute inset-y-0 end-0 flex items-center pe-4 text-token-text-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md"><path fill="currentColor" fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m14.076-4.068a1 1 0 0 1 .242 1.393l-4.75 6.75a1 1 0 0 1-1.558.098l-2.5-2.75a1 1 0 0 1 1.48-1.346l1.66 1.827 4.032-5.73a1 1 0 0 1 1.394-.242" clip-rule="evenodd"></path></svg>
        </span>`);
    }
    chrome.storage.local.set({
      settings: {
        ...cachedSettings, selectedPromptsManagerSortBy: { code: 'created_at', name: 'Create date' },
      },
    });
  }
  const promptManagerSearchTerm = document.querySelector('#modal-manager input[id="prompt-manager-search-input"]')?.value;
  chrome.runtime.sendMessage({
    type: 'getPrompts',
    forceRefresh,
    detail: {
      pageNumber,
      searchTerm: promptManagerSearchTerm,
      sortBy,
      language: selectedPromptsManagerLanguage?.code,
      tag: selectedPromptsManagerTag.id,
      folderId: typeof lastSelectedPromptFolder?.id === 'string' ? null : lastSelectedPromptFolder?.id,
      isPublic: lastSelectedPromptFolder?.id === 'public',
      isFavorite: lastSelectedPromptFolder?.id === 'favorites',
      deepSearch: true,
    },
  }, (data) => {
    const prompts = data?.results;
    if (!prompts) return;
    const loadMoreButton = document.querySelector('#modal-manager #load-more-prompts-button');
    if (loadMoreButton) loadMoreButton.remove();
    const loadingSpinnerElement = document.querySelector('#modal-manager #loading-spinner-prompt-manager-main-content');
    if (loadingSpinnerElement) loadingSpinnerElement.remove();
    if (prompts.length === 0 && pageNumber === 1) {
      promptList.appendChild(noPromptElement());
    } else {
      prompts.forEach((prompt) => {
        const promptCard = createPromptCard(prompt);
        promptList.appendChild(promptCard);
        addPromptCardEventListeners(promptCard, prompt);
      });
      if (data.next) {
        const loadMorePromptsButton = document.createElement('button');
        loadMorePromptsButton.id = 'load-more-prompts-button';
        loadMorePromptsButton.classList = `bg-token-main-surface-secondary p-4 pb-2 rounded-md cursor-pointer hover:bg-token-main-surface-tertiary ${cachedSettings.selectedPromptView === 'list' ? 'h-14' : 'h-auto aspect-1.5'} flex flex-col relative`;
        loadMorePromptsButton.appendChild(loadingSpinner('load-more-prompts-button'));
        promptList.appendChild(loadMorePromptsButton);
        // add an observer to click the load more button when it is visible
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              fetchPrompts(pageNumber + 1, forceRefresh);
            }
          });
        }, { threshold: 0.5 });
        if (loadMorePromptsButton) {
          observer.observe(loadMorePromptsButton);
        }
      }
    }
  });
}
function loadRecentPrompts() {
  const loadingSpinnerElement = document.querySelector('#modal-manager #loading-spinner-prompt-manager-main-content');
  if (loadingSpinnerElement) loadingSpinnerElement.remove();
  const promptList = document.querySelector('#modal-manager #prompt-manager-prompt-list');
  chrome.storage.local.get(['userInputValueHistory'], (result) => {
    const { userInputValueHistory = [] } = result;
    if (userInputValueHistory.length === 0) {
      promptList.innerHTML = 'No recent prompts found';
      return;
    }
    promptList.innerHTML = '';
    const promptManagerSearchTerm = document.querySelector('#modal-manager input[id="prompt-manager-search-input"]')?.value;
    userInputValueHistory.sort((a, b) => b.timestamp - a.timestamp).forEach((prompt) => {
      if (promptManagerSearchTerm && !prompt.inputValue.toLowerCase().includes(promptManagerSearchTerm.toLowerCase())) return;
      const newPrompt = {
        id: prompt.id || self.crypto.randomUUID(),
        // convert timestamp to date
        title: new Date(prompt.timestamp).toLocaleString(),
        steps: [prompt.inputValue],
        tags: [],
        is_favorite: false,
        folder: { id: 'recent' },
      };
      const promptCard = createPromptCard(newPrompt);
      promptList.appendChild(promptCard);
      addPromptCardEventListeners(promptCard, newPrompt);
    });
  });
}
function promptListView(prompt) {
  if (!prompt) return '';
  const lastSelectedPromptFolder = getLastSelectedPromptFolder();

  const promptManagerSearchTerm = document.querySelector('#modal-manager input[id="prompt-manager-search-input"]')?.value;
  return `<div class="flex items-center justify-between pb-1">
  ${(prompt.is_mine || lastSelectedPromptFolder?.id === 'recent') ? `<input id="prompt-checkbox-${prompt.id}" type="checkbox" data-prompt-id="${prompt.id}" id="checkbox" class="manager-modal border border-token-border-medium me-2" style="cursor: pointer; border-radius: 2px;">` : ''}
  <div class="${prompt.folder.id === 'recent' ? 'text-xs text-token-text-tertiary' : 'text-md text-token-text-primary'} truncate flex items-center w-full">${promptManagerSearchTerm && prompt.folder.id !== 'recent' ? `<div class="flex items-center border border-token-border-medium rounded-md px-1 text-xs font-normal overflow-hidden hover:w-fit-sp w-auto min-w-5 max-w-5"><svg stroke="currentColor" fill="currentColor" class="icon-xs me-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M147.8 192H480V144C480 117.5 458.5 96 432 96h-160l-64-64h-160C21.49 32 0 53.49 0 80v328.4l90.54-181.1C101.4 205.6 123.4 192 147.8 192zM543.1 224H147.8C135.7 224 124.6 230.8 119.2 241.7L0 480h447.1c12.12 0 23.2-6.852 28.62-17.69l96-192C583.2 249 567.7 224 543.1 224z"/></svg>${prompt.folder.name}</div> <svg aria-hidden="true" fill="none" focusable="false" height="1em" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" style="min-width:16px" viewBox="0 0 24 24" width="1em"><path d="m9 18 6-6-6-6"></path></svg>` : ''}${escapeHTML(prompt.title)}</div>
  
  </div>
  <div class="flex-1 self-center ms-3 ${prompt.folder.id === 'recent' ? 'text-token-text-primary' : 'text-token-text-tertiary'} text-sm truncate">${escapeHTML(prompt.steps[0].substring(0, 250))} <span class="self-center text-xs text-token-text-tertiary">${prompt.steps.length > 1 ? `(${prompt.steps.length} ${translate('steps')})` : ''}</span></div>
  <div class="flex overflow-hidden items-center">
    ${prompt.tags.map((tag) => `<span id="prompt-card-tag-${tag.id}" class="border border-token-border-medium hover:bg-token-main-surface-secondary text-token-text-tertiary text-xs py-1 px-2 rounded-full me-2 capitalize truncate">${tag.name}</span>`).join('')}
  </div>
  <div class="flex justify-between items-center">
    <div>
    
    </div>
    <div id="prompt-card-action-right-${prompt.id}" class="flex items-center">
      ${prompt.is_public ? `<svg id="prompt-card-public-icon-${prompt.id}" title="public prompt" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" stroke="currentColor" fill="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 me-2" height="1em" width="1em"><path d="M319.9 320c57.41 0 103.1-46.56 103.1-104c0-57.44-46.54-104-103.1-104c-57.41 0-103.1 46.56-103.1 104C215.9 273.4 262.5 320 319.9 320zM369.9 352H270.1C191.6 352 128 411.7 128 485.3C128 500.1 140.7 512 156.4 512h327.2C499.3 512 512 500.1 512 485.3C512 411.7 448.4 352 369.9 352zM512 160c44.18 0 80-35.82 80-80S556.2 0 512 0c-44.18 0-80 35.82-80 80S467.8 160 512 160zM183.9 216c0-5.449 .9824-10.63 1.609-15.91C174.6 194.1 162.6 192 149.9 192H88.08C39.44 192 0 233.8 0 285.3C0 295.6 7.887 304 17.62 304h199.5C196.7 280.2 183.9 249.7 183.9 216zM128 160c44.18 0 80-35.82 80-80S172.2 0 128 0C83.82 0 48 35.82 48 80S83.82 160 128 160zM551.9 192h-61.84c-12.8 0-24.88 3.037-35.86 8.24C454.8 205.5 455.8 210.6 455.8 216c0 33.71-12.78 64.21-33.16 88h199.7C632.1 304 640 295.6 640 285.3C640 233.8 600.6 192 551.9 192z"/></svg>` : ''}

      ${prompt.is_mine ? `${prompt.folder.id === 'recent' ? '' : `<div id="prompt-card-favorite" title="favorite prompt" class="me-2">
        ${prompt.is_favorite ? '<svg class="icon-md" fill="gold" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M381.2 150.3L524.9 171.5C536.8 173.2 546.8 181.6 550.6 193.1C554.4 204.7 551.3 217.3 542.7 225.9L438.5 328.1L463.1 474.7C465.1 486.7 460.2 498.9 450.2 506C440.3 513.1 427.2 514 416.5 508.3L288.1 439.8L159.8 508.3C149 514 135.9 513.1 126 506C116.1 498.9 111.1 486.7 113.2 474.7L137.8 328.1L33.58 225.9C24.97 217.3 21.91 204.7 25.69 193.1C29.46 181.6 39.43 173.2 51.42 171.5L195 150.3L259.4 17.97C264.7 6.954 275.9-.0391 288.1-.0391C300.4-.0391 311.6 6.954 316.9 17.97L381.2 150.3z"/></svg>' : '<svg class="icon-md" fill="#b4b4b4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M287.9 0C297.1 0 305.5 5.25 309.5 13.52L378.1 154.8L531.4 177.5C540.4 178.8 547.8 185.1 550.7 193.7C553.5 202.4 551.2 211.9 544.8 218.2L433.6 328.4L459.9 483.9C461.4 492.9 457.7 502.1 450.2 507.4C442.8 512.7 432.1 513.4 424.9 509.1L287.9 435.9L150.1 509.1C142.9 513.4 133.1 512.7 125.6 507.4C118.2 502.1 114.5 492.9 115.1 483.9L142.2 328.4L31.11 218.2C24.65 211.9 22.36 202.4 25.2 193.7C28.03 185.1 35.5 178.8 44.49 177.5L197.7 154.8L266.3 13.52C270.4 5.249 278.7 0 287.9 0L287.9 0zM287.9 78.95L235.4 187.2C231.9 194.3 225.1 199.3 217.3 200.5L98.98 217.9L184.9 303C190.4 308.5 192.9 316.4 191.6 324.1L171.4 443.7L276.6 387.5C283.7 383.7 292.2 383.7 299.2 387.5L404.4 443.7L384.2 324.1C382.9 316.4 385.5 308.5 391 303L476.9 217.9L358.6 200.5C350.7 199.3 343.9 194.3 340.5 187.2L287.9 78.95z"/></svg>'}
      </div>`}` : ''}

      <div id="prompt-card-settings-menu-${prompt.id}" class="relative flex items-center justify-center h-8 rounded-lg px-2 text-token-text-tertiary focus-visible:outline-0 hover:bg-token-sidebar-surface-tertiary focus-visible:bg-token-sidebar-surface-secondary"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md"><path fill-rule="evenodd" clip-rule="evenodd" d="M3 12C3 10.8954 3.89543 10 5 10C6.10457 10 7 10.8954 7 12C7 13.1046 6.10457 14 5 14C3.89543 14 3 13.1046 3 12ZM10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12ZM17 12C17 10.8954 17.8954 10 19 10C20.1046 10 21 10.8954 21 12C21 13.1046 20.1046 14 19 14C17.8954 14 17 13.1046 17 12Z" fill="currentColor"></path></svg>
      </div>
    </div>
  </div>`;
}
function promptGridView(prompt) {
  if (!prompt) return '';
  const lastSelectedPromptFolder = getLastSelectedPromptFolder();
  const promptManagerSearchTerm = document.querySelector('#modal-manager input[id="prompt-manager-search-input"]')?.value;

  return `<div class="flex items-center justify-between border-b border-token-border-medium pb-1"><div class="${prompt.folder.id === 'recent' ? 'text-xs text-token-text-tertiary' : 'text-md text-token-text-primary'} truncate flex items-center w-full">${promptManagerSearchTerm && prompt.folder.id !== 'recent' ? `<div class="flex items-center border border-token-border-medium rounded-md px-1 text-xs font-normal overflow-hidden hover:w-fit-sp w-auto min-w-5 max-w-5"><svg stroke="currentColor" fill="currentColor" class="icon-xs me-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M147.8 192H480V144C480 117.5 458.5 96 432 96h-160l-64-64h-160C21.49 32 0 53.49 0 80v328.4l90.54-181.1C101.4 205.6 123.4 192 147.8 192zM543.1 224H147.8C135.7 224 124.6 230.8 119.2 241.7L0 480h447.1c12.12 0 23.2-6.852 28.62-17.69l96-192C583.2 249 567.7 224 543.1 224z"/></svg>${prompt.folder.name}</div> <svg aria-hidden="true" fill="none" focusable="false" height="1em" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" style="min-width:16px" viewBox="0 0 24 24" width="1em"><path d="m9 18 6-6-6-6"></path></svg>` : ''}${escapeHTML(prompt.title)}</div>
  ${prompt.is_mine ? `${prompt.folder.id === 'recent' ? '' : `<div id="prompt-card-favorite" title="favorite prompt" class="ps-1">
    ${prompt.is_favorite ? '<svg class="icon-md" fill="gold" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M381.2 150.3L524.9 171.5C536.8 173.2 546.8 181.6 550.6 193.1C554.4 204.7 551.3 217.3 542.7 225.9L438.5 328.1L463.1 474.7C465.1 486.7 460.2 498.9 450.2 506C440.3 513.1 427.2 514 416.5 508.3L288.1 439.8L159.8 508.3C149 514 135.9 513.1 126 506C116.1 498.9 111.1 486.7 113.2 474.7L137.8 328.1L33.58 225.9C24.97 217.3 21.91 204.7 25.69 193.1C29.46 181.6 39.43 173.2 51.42 171.5L195 150.3L259.4 17.97C264.7 6.954 275.9-.0391 288.1-.0391C300.4-.0391 311.6 6.954 316.9 17.97L381.2 150.3z"/></svg>' : '<svg class="icon-md" fill="#b4b4b4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M287.9 0C297.1 0 305.5 5.25 309.5 13.52L378.1 154.8L531.4 177.5C540.4 178.8 547.8 185.1 550.7 193.7C553.5 202.4 551.2 211.9 544.8 218.2L433.6 328.4L459.9 483.9C461.4 492.9 457.7 502.1 450.2 507.4C442.8 512.7 432.1 513.4 424.9 509.1L287.9 435.9L150.1 509.1C142.9 513.4 133.1 512.7 125.6 507.4C118.2 502.1 114.5 492.9 115.1 483.9L142.2 328.4L31.11 218.2C24.65 211.9 22.36 202.4 25.2 193.7C28.03 185.1 35.5 178.8 44.49 177.5L197.7 154.8L266.3 13.52C270.4 5.249 278.7 0 287.9 0L287.9 0zM287.9 78.95L235.4 187.2C231.9 194.3 225.1 199.3 217.3 200.5L98.98 217.9L184.9 303C190.4 308.5 192.9 316.4 191.6 324.1L171.4 443.7L276.6 387.5C283.7 383.7 292.2 383.7 299.2 387.5L404.4 443.7L384.2 324.1C382.9 316.4 385.5 308.5 391 303L476.9 217.9L358.6 200.5C350.7 199.3 343.9 194.3 340.5 187.2L287.9 78.95z"/></svg>'}
  </div>`}` : ''}
  </div>
  <div class="flex-1 ${prompt.folder.id === 'recent' ? 'text-token-text-primary' : 'text-token-text-tertiary'} text-sm truncate">${escapeHTML(prompt.steps[0].substring(0, 250))}</div>
  <div class="flex overflow-hidden my-1">
    ${prompt.tags.map((tag) => `<span id="prompt-card-tag-${tag.id}" class="border border-token-border-medium hover:bg-token-main-surface-secondary text-token-text-tertiary text-xs px-2 rounded-full me-1 capitalize truncate">${tag.name}</span>`).join('')}
  </div>
  <div class="border-t border-token-border-medium flex justify-between items-center pt-1">
    <div>
    ${(prompt.is_mine || lastSelectedPromptFolder?.id === 'recent') ? `<input data-prompt-id="${prompt.id}" id="prompt-checkbox-${prompt.id}" type="checkbox" id="checkbox" class="manager-modal border border-token-border-medium me-2" style="cursor: pointer; border-radius: 2px;">` : ''}
    <span class="text-xs text-token-text-tertiary">${prompt.steps.length > 1 ? `${prompt.steps.length} ${translate('steps')}` : ''}</span>
    </div>
    <div id="prompt-card-action-right-${prompt.id}" class="flex items-center">
      ${prompt.is_public ? `<svg id="prompt-card-public-icon-${prompt.id}" title="public prompt" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" stroke="currentColor" fill="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 me-2" height="1em" width="1em"><path d="M319.9 320c57.41 0 103.1-46.56 103.1-104c0-57.44-46.54-104-103.1-104c-57.41 0-103.1 46.56-103.1 104C215.9 273.4 262.5 320 319.9 320zM369.9 352H270.1C191.6 352 128 411.7 128 485.3C128 500.1 140.7 512 156.4 512h327.2C499.3 512 512 500.1 512 485.3C512 411.7 448.4 352 369.9 352zM512 160c44.18 0 80-35.82 80-80S556.2 0 512 0c-44.18 0-80 35.82-80 80S467.8 160 512 160zM183.9 216c0-5.449 .9824-10.63 1.609-15.91C174.6 194.1 162.6 192 149.9 192H88.08C39.44 192 0 233.8 0 285.3C0 295.6 7.887 304 17.62 304h199.5C196.7 280.2 183.9 249.7 183.9 216zM128 160c44.18 0 80-35.82 80-80S172.2 0 128 0C83.82 0 48 35.82 48 80S83.82 160 128 160zM551.9 192h-61.84c-12.8 0-24.88 3.037-35.86 8.24C454.8 205.5 455.8 210.6 455.8 216c0 33.71-12.78 64.21-33.16 88h199.7C632.1 304 640 295.6 640 285.3C640 233.8 600.6 192 551.9 192z"/></svg>` : ''}
      <div id="prompt-card-settings-menu-${prompt.id}" class="relative flex items-center justify-center h-8 rounded-lg px-2 text-token-text-tertiary focus-visible:outline-0 hover:bg-token-sidebar-surface-tertiary focus-visible:bg-token-sidebar-surface-secondary"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md"><path fill-rule="evenodd" clip-rule="evenodd" d="M3 12C3 10.8954 3.89543 10 5 10C6.10457 10 7 10.8954 7 12C7 13.1046 6.10457 14 5 14C3.89543 14 3 13.1046 3 12ZM10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12ZM17 12C17 10.8954 17.8954 10 19 10C20.1046 10 21 10.8954 21 12C21 13.1046 20.1046 14 19 14C17.8954 14 17 13.1046 17 12Z" fill="currentColor"></path></svg>
      </div>
    </div>
  </div>`;
}
function createPromptCard(prompt) {
  const promptCard = document.createElement('div');
  promptCard.id = `prompt-card-${prompt.id}`;
  promptCard.dataset.promptId = prompt.id;
  promptCard.classList = `relative flex bg-token-main-surface-primary border border-token-border-medium rounded-md cursor-pointer hover:bg-token-main-surface-tertiary ${cachedSettings.selectedPromptView === 'list' ? 'w-full p-2 flex-row h-10' : 'aspect-1.5 p-4 pb-2 flex-col h-auto'}`;
  if (prompt.folder) {
    promptCard.dataset.folderId = prompt.folder.id;
  }
  promptCard.style = 'height: max-content;outline-offset: 4px; outline: none;';
  promptCard.innerHTML = cachedSettings.selectedPromptView === 'list' ? promptListView(prompt) : promptGridView(prompt);
  promptCard.addEventListener('click', (e) => {
    if (e.metaKey || (isWindows() && e.ctrlKey)) {
      document.querySelector('#modal-manager #modal-close-button-manager')?.click();
      runPromptChain(prompt, 0, true);
    } else {
      updateSelectedPromptCard(prompt.id);
      const newPrompt = { ...prompt };
      if (!prompt.is_mine) { // recent, public+notmine
        newPrompt.is_public = false;
        delete newPrompt.id;
        delete newPrompt.folder;
      }
      openPromptEditorModal(newPrompt);
    }
  });
  promptCard.addEventListener('mouseenter', () => {
    closeMenus();
  });
  return promptCard;
}
function updateSelectedPromptCard(promptId) {
  if (lastSelectedPromptCardId) {
    const prevSelectedCard = document.querySelector(`#modal-manager #prompt-card-${lastSelectedPromptCardId}`);
    if (prevSelectedCard) prevSelectedCard.style.outline = 'none';
  }
  if (!promptId) return;
  const promptCard = document.querySelector(`#modal-manager #prompt-card-${promptId}`);
  lastSelectedPromptCardId = promptId;
  promptCard.style.outline = `2px solid ${isDarkMode() ? '#fff' : '#000'}`;
}
// eslint-disable-next-line no-unused-vars
function addOrReplacePromptCard(prompt, origElement = null) {
  const lastSelectedPromptFolder = getLastSelectedPromptFolder();
  if (lastSelectedPromptFolder?.id && (
    lastSelectedPromptFolder?.id.toString() === prompt.folder?.id?.toString()
    || (lastSelectedPromptFolder?.id === 'favorites' && prompt.is_favorite)
    || (lastSelectedPromptFolder?.id === 'public' && prompt.is_public)
  )) {
    const existingPromptCard = document.querySelector(`#modal-manager #prompt-card-${prompt.id}`);
    if (existingPromptCard) {
      const newPromptCard = createPromptCard(prompt);
      existingPromptCard.replaceWith(newPromptCard);
      addPromptCardEventListeners(newPromptCard, prompt);
    } else {
      // add the prompt card to the beginning of the list
      const promptList = document.querySelector('#modal-manager #prompt-manager-prompt-list');
      const noPromptsFound = document.querySelector('#modal-manager #no-prompts-found');
      if (noPromptsFound) noPromptsFound.remove();
      const newPromptCard = createPromptCard(prompt);
      if (origElement) {
        // add the prompt card after the origElement
        origElement.after(newPromptCard);
      } else {
        promptList.prepend(newPromptCard);
      }
      addPromptCardEventListeners(newPromptCard, prompt);
    }
  }
}
function addPromptCardEventListeners(promptCard, prompt) {
  const checkbox = promptCard.querySelector(`#modal-manager #prompt-checkbox-${prompt.id}`);
  checkbox?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenus();
    // get all selected prompts not including the current prompt
    const selectedPrompts = Array.from(document.querySelectorAll('#modal-manager input[id^="prompt-checkbox-"]:checked'));

    if (selectedPrompts.length > 0) {
      if (e.shiftKey && selectedPrompts.filter((promptCheckbox) => promptCheckbox.id !== `prompt-checkbox-${prompt.id}`).length > 0) {
        const promptId = prompt.id.toString();
        const promptCards = document.querySelectorAll('#modal-manager div[id^="prompt-card-"]');
        let startAdding = false;
        let endAdding = false;
        promptCards.forEach((promptCardElement) => {
          const currentPromptId = promptCardElement.id.split('prompt-card-')[1];
          if (currentPromptId === lastSelectedPromptCheckboxId || currentPromptId === promptId) {
            if (startAdding) {
              endAdding = true;
            } else {
              startAdding = true;
            }
          }
          if (startAdding && !endAdding) {
            const currentPromptCheckbox = document.querySelector(`#modal-manager #prompt-checkbox-${currentPromptId}`);
            if (currentPromptCheckbox) {
              currentPromptCheckbox.checked = true;
            }
          }
        });
      }
      lastSelectedPromptCheckboxId = prompt.id.toString();
      const selectionCountElement = document.querySelector('#modal-manager span[id="prompt-manager-selection-count"]');
      const curSelectedPrompts = Array.from(document.querySelectorAll('#modal-manager input[id^="prompt-checkbox-"]:checked'));
      selectionCountElement.innerText = `${curSelectedPrompts.length} selected`;
      const selectionBar = document.querySelector('#modal-manager div[id="prompt-manager-selection-bar"]');
      selectionBar.classList.remove('hidden');
      const contentWrapper = document.querySelector('#modal-manager div[id="prompt-manager-content-wrapper"]');
      if (contentWrapper) {
        contentWrapper.style.paddingBottom = 'calc(59px + 56px)';
      }
    } else {
      resetPromptManagerSelection();
    }
  });
  const favoriteButton = promptCard.querySelector('#modal-manager #prompt-card-favorite');
  favoriteButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenus();
    const curLastSelectedPromptFolder = getLastSelectedPromptFolder();
    if (curLastSelectedPromptFolder?.id === 'favorites') {
      // remove promt card from the list
      promptCard.remove();
    }
    chrome.runtime.sendMessage({
      type: 'toggleFavoritePrompt',
      forceRefresh: true,
      detail: {
        promptId: prompt.id,
      },
    }, (data) => {
      const existingContinueButton = document.querySelector('#continue-prompt-button-wrapper');
      if (existingContinueButton) existingContinueButton.remove();
      initializeContinueButton(true);
      if (curLastSelectedPromptFolder?.id === 'favorites') return;
      if (data.is_favorite) {
        favoriteButton.innerHTML = '<svg class="icon-md" fill="gold" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M381.2 150.3L524.9 171.5C536.8 173.2 546.8 181.6 550.6 193.1C554.4 204.7 551.3 217.3 542.7 225.9L438.5 328.1L463.1 474.7C465.1 486.7 460.2 498.9 450.2 506C440.3 513.1 427.2 514 416.5 508.3L288.1 439.8L159.8 508.3C149 514 135.9 513.1 126 506C116.1 498.9 111.1 486.7 113.2 474.7L137.8 328.1L33.58 225.9C24.97 217.3 21.91 204.7 25.69 193.1C29.46 181.6 39.43 173.2 51.42 171.5L195 150.3L259.4 17.97C264.7 6.954 275.9-.0391 288.1-.0391C300.4-.0391 311.6 6.954 316.9 17.97L381.2 150.3z"/></svg>';
      } else {
        favoriteButton.innerHTML = '<svg class="icon-md" fill="#b4b4b4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M287.9 0C297.1 0 305.5 5.25 309.5 13.52L378.1 154.8L531.4 177.5C540.4 178.8 547.8 185.1 550.7 193.7C553.5 202.4 551.2 211.9 544.8 218.2L433.6 328.4L459.9 483.9C461.4 492.9 457.7 502.1 450.2 507.4C442.8 512.7 432.1 513.4 424.9 509.1L287.9 435.9L150.1 509.1C142.9 513.4 133.1 512.7 125.6 507.4C118.2 502.1 114.5 492.9 115.1 483.9L142.2 328.4L31.11 218.2C24.65 211.9 22.36 202.4 25.2 193.7C28.03 185.1 35.5 178.8 44.49 177.5L197.7 154.8L266.3 13.52C270.4 5.249 278.7 0 287.9 0L287.9 0zM287.9 78.95L235.4 187.2C231.9 194.3 225.1 199.3 217.3 200.5L98.98 217.9L184.9 303C190.4 308.5 192.9 316.4 191.6 324.1L171.4 443.7L276.6 387.5C283.7 383.7 292.2 383.7 299.2 387.5L404.4 443.7L384.2 324.1C382.9 316.4 385.5 308.5 391 303L476.9 217.9L358.6 200.5C350.7 199.3 343.9 194.3 340.5 187.2L287.9 78.95z"/></svg>';
      }
    });
  });
  const promptCardTags = promptCard.querySelectorAll('#modal-manager span[id^="prompt-card-tag-"]');
  promptCardTags?.forEach((tag) => {
    tag.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMenus();

      const tagId = tag.id.split('prompt-card-tag-')[1];
      const tagFiterOption = document.querySelector(`#modal-manager #prompts-manager-tag-selector-option-${tagId}`);
      if (tagFiterOption) {
        tagFiterOption.click();
      }
    });
  });
  const settingsButton = promptCard.querySelector(`#prompt-card-settings-menu-${prompt.id}`);
  settingsButton?.addEventListener('click', async (e) => {
    e.stopPropagation();
    closeMenus();
    const promptList = document.querySelector('#modal-manager #prompt-manager-prompt-list');
    // check if card in a 4n child of promptList
    const index = Array.from(promptList.children).indexOf(promptCard);

    const is4n = (index + 1) % 4 === 0;

    const leftMenu = is4n || cachedSettings.selectedPromptView === 'list';

    showPromptManagerCardMenu(settingsButton, prompt, leftMenu);
  });
}
function noPromptElement() {
  const noPrompts = document.createElement('p');
  noPrompts.classList = 'absolute text-center text-sm text-token-text-tertiary w-full p-4';
  noPrompts.id = 'no-prompts-found';
  noPrompts.innerText = translate('No prompts found');
  const promptList = document.querySelector('#modal-manager #prompt-manager-prompt-list');
  // #selected-prompts-manager-tag-title
  const selectedTagTitle = document.querySelector('#modal-manager #selected-prompts-manager-tag-title');
  // selected-prompts-manager-language-title
  const selectedLanguageTitle = document.querySelector('#modal-manager #selected-prompts-manager-language-title');
  if (promptList && selectedTagTitle && selectedLanguageTitle && (selectedTagTitle?.innerText !== 'All' || selectedLanguageTitle?.innerText !== 'All')) {
    noPrompts.innerHTML = `${translate('No prompts found')} <div>${translate('clear_filter')}</div>`;
  }

  return noPrompts;
}
function noPromptFolderElemet() {
  const noFolders = document.createElement('p');
  noFolders.id = 'no-prompt-folders';
  noFolders.classList = 'text-token-text-tertiary text-center text-sm py-4 w-full p-4';
  noFolders.innerText = translate('new_category_hint');
  return noFolders;
}
