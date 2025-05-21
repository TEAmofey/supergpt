/* global toast, createManager, errorUpgradeConfirmation, promptManagerSidebarContent, translate, cachedSettings */
// eslint-disable-next-line no-unused-vars
async function showPromptManagerSidebarSettingsMenu(sidebarSettingsElement) {
  const { right, top } = sidebarSettingsElement.getBoundingClientRect();
  const hasSubscription = await chrome.runtime.sendMessage({
    type: 'checkHasSubscription',
  });
  const translateX = right + 2;
  const translateY = top - 120;
  const menu = `<div id="prompt-manager-sidebar-settings-menu" dir="ltr" style="position:fixed;left:0;top:0;transform:translate3d(${translateX}px,${translateY}px,0);min-width:max-content;z-index:10001;--radix-popper-anchor-width:18px;--radix-popper-anchor-height:18px;--radix-popper-available-width:1167px;--radix-popper-available-height:604px;--radix-popper-transform-origin:0% 0px"><div data-side="bottom" data-align="start" role="menu" aria-orientation="vertical" data-state="open" data-radix-menu-content="" dir="ltr" aria-labelledby="radix-:r6g:" class="text-token-text-primary mt-2 min-w-[200px] max-w-xs rounded-lg border border-token-border-medium bg-token-main-surface-primary shadow-lg" tabindex="-1" data-orientation="vertical" style="outline:0;--radix-dropdown-menu-content-transform-origin:var(--radix-popper-transform-origin);--radix-dropdown-menu-content-available-width:var(--radix-popper-available-width);--radix-dropdown-menu-content-available-height:var(--radix-popper-available-height);--radix-dropdown-menu-trigger-width:var(--radix-popper-anchor-width);--radix-dropdown-menu-trigger-height:var(--radix-popper-anchor-height);pointer-events:auto">
  
  <div role="menuitem" id="sort-prompt-categories-button" class="flex items-center justify-between gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item="">${translate('Sort categories')} <svg aria-hidden="true" fill="none" focusable="false" height="1em" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" style="min-width:16px" viewBox="0 0 24 24" width="1em"><path d="m9 18 6-6-6-6"></path></svg></div>

  <div role="menuitem" id="export-prompts-button" class="flex items-center justify-between gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item="">${translate('Export prompts')} ${hasSubscription ? '' : '<span class="text-white rounded-md bg-green-500 px-2 text-sm">Pro</span>'}</div>
  
  <div role="menuitem" id="import-prompts-button" class="flex items-center justify-between gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item="">${translate('Import prompts')} ${hasSubscription ? '' : '<span class="text-white rounded-md bg-green-500 px-2 text-sm">Pro</span>'}</div></div></div>`;
  document.body.insertAdjacentHTML('beforeend', menu);
  addPromptManagerSidebarSettingsMenuEventListeners();
}
function addPromptManagerSidebarSettingsMenuEventListeners() {
  const sortPromptCategoriesButton = document.querySelector('#sort-prompt-categories-button');
  const exportPromptFolderButton = document.querySelector('#export-prompts-button');
  const importPromptFolderButton = document.querySelector('#import-prompts-button');

  sortPromptCategoriesButton.addEventListener('mouseenter', () => {
    showPromptCategorySortByMenu();
  });

  exportPromptFolderButton.addEventListener('mouseover', () => {
    document.querySelector('#prompt-manager-sidebar-settings-sort-menu')?.remove();
  });
  exportPromptFolderButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({
      type: 'checkHasSubscription',
    }, (hasSubscription) => {
      if (!hasSubscription) {
        const error = { title: 'This is a Pro feature', message: 'Exporting prompts requires a Pro subscription. Upgrade to Pro to remove all limits.' };
        errorUpgradeConfirmation(error);
        return;
      }
      const sidebarSettingsMenu = document.querySelector('#prompt-manager-sidebar-settings-menu');
      sidebarSettingsMenu?.remove();
      const sidebarSettingsButton = document.querySelector('#prompt-manager-sidebar-settings-button');
      sidebarSettingsButton.innerHTML = '<svg x="0" y="0" viewbox="0 0 40 40" class="spinner icon-md"><circle fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="125.6" cx="20" cy="20" r="12"></circle></svg>';
      chrome.runtime.sendMessage({
        type: 'getAllPrompts',
        detail: {},
      }, async (data) => {
        const { userInputValueHistory } = await chrome.storage.local.get(['userInputValueHistory']);
        resetPromptManagerSidebarSettingsButton();
        if (data.error && data.error.type === 'limit') {
          errorUpgradeConfirmation(data.error);
          return;
        }
        if (!data || Object.keys(data).length === 0) {
          toast('No prompts found', 'error');
          return;
        }
        data.Recent = userInputValueHistory;
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const createDate = new Date();
        const exportDate = `${createDate.getFullYear()}-${createDate.getMonth() + 1}-${createDate.getDate()}__${createDate.getHours()}-${createDate.getMinutes()}-${createDate.getSeconds()}`;
        a.download = `Superpower ChatGPT Prompts - ${exportDate}.json`;
        a.click();
      });
    });
  });

  importPromptFolderButton.addEventListener('mouseover', () => {
    document.querySelector('#prompt-manager-sidebar-settings-sort-menu')?.remove();
  });
  importPromptFolderButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({
      type: 'checkHasSubscription',
    }, (hasSubscription) => {
      if (!hasSubscription) {
        const error = { title: 'This is a Pro feature', message: 'Importing prompts requires a Pro subscription. Upgrade to Pro to remove all limits.' };
        errorUpgradeConfirmation(error);
        return;
      }
      const sidebarSettingsMenu = document.querySelector('#prompt-manager-sidebar-settings-menu');
      sidebarSettingsMenu?.remove();
      const sidebarSettingsButton = document.querySelector('#prompt-manager-sidebar-settings-button');
      sidebarSettingsButton.innerHTML = '<svg x="0" y="0" viewbox="0 0 40 40" class="spinner icon-md"><circle fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="125.6" cx="20" cy="20" r="12"></circle></svg>';
      // open file picker
      const filePicker = document.createElement('input');
      filePicker.type = 'file';
      filePicker.accept = '.json';
      filePicker.addEventListener('change', (event) => {
        if (!event.target.files.length) {
          resetPromptManagerSidebarSettingsButton();
          return;
        }
        const file = event.target.files[0];
        if (!file) {
          resetPromptManagerSidebarSettingsButton();
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          if (!e.target.result) {
            resetPromptManagerSidebarSettingsButton();
            return;
          }
          const dataFromFile = JSON.parse(e.target.result);
          // check format: it has to be an object with key: value pairs
          if (typeof dataFromFile !== 'object') {
            resetPromptManagerSidebarSettingsButton();

            toast('Invalid file format', 'error');
            return;
          }
          const recent = dataFromFile.Recent;
          delete dataFromFile.Recent;
          if (recent) {
            chrome.storage.local.set({ userInputValueHistory: recent });
          }
          // each value has to be and array of objects
          const values = Object.values(dataFromFile);
          if (!values.every((value) => Array.isArray(value) && value.every((item) => typeof item === 'object'))) {
            resetPromptManagerSidebarSettingsButton();
            toast('Invalid file format', 'error');
            return;
          }
          chrome.runtime.sendMessage({
            type: 'addPrompts',
            detail: {
              prompts: values.flat().map((prompt) => ({ ...prompt, tags: prompt.tags.map((tag) => tag.id) })),
            },
          }, (response) => {
            resetPromptManagerSidebarSettingsButton();

            if (response.error) {
              if (response.error.type === 'limit') {
                errorUpgradeConfirmation(response.error);
              } else {
                toast('Error importing prompts', 'error');
              }
              return;
            }
            createManager('prompts');
            // reset favorite prompts
            toast('Imported Prompts Successfully');
          });
        };
        // on cancle
        reader.onerror = () => {
          resetPromptManagerSidebarSettingsButton();
        };
        reader.readAsText(file);
      });
      // add on cancel event
      filePicker.oncancel = () => {
        resetPromptManagerSidebarSettingsButton();
      };
      filePicker.click();
    });
  });
}
function resetPromptManagerSidebarSettingsButton() {
  const sidebarSettingsButton = document.querySelector('#prompt-manager-sidebar-settings-button');
  if (sidebarSettingsButton) {
    sidebarSettingsButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="icon-md" fill="currentColor" viewBox="0 0 512 512"><path d="M495.9 166.6C499.2 175.2 496.4 184.9 489.6 191.2L446.3 230.6C447.4 238.9 448 247.4 448 256C448 264.6 447.4 273.1 446.3 281.4L489.6 320.8C496.4 327.1 499.2 336.8 495.9 345.4C491.5 357.3 486.2 368.8 480.2 379.7L475.5 387.8C468.9 398.8 461.5 409.2 453.4 419.1C447.4 426.2 437.7 428.7 428.9 425.9L373.2 408.1C359.8 418.4 344.1 427 329.2 433.6L316.7 490.7C314.7 499.7 307.7 506.1 298.5 508.5C284.7 510.8 270.5 512 255.1 512C241.5 512 227.3 510.8 213.5 508.5C204.3 506.1 197.3 499.7 195.3 490.7L182.8 433.6C167 427 152.2 418.4 138.8 408.1L83.14 425.9C74.3 428.7 64.55 426.2 58.63 419.1C50.52 409.2 43.12 398.8 36.52 387.8L31.84 379.7C25.77 368.8 20.49 357.3 16.06 345.4C12.82 336.8 15.55 327.1 22.41 320.8L65.67 281.4C64.57 273.1 64 264.6 64 256C64 247.4 64.57 238.9 65.67 230.6L22.41 191.2C15.55 184.9 12.82 175.3 16.06 166.6C20.49 154.7 25.78 143.2 31.84 132.3L36.51 124.2C43.12 113.2 50.52 102.8 58.63 92.95C64.55 85.8 74.3 83.32 83.14 86.14L138.8 103.9C152.2 93.56 167 84.96 182.8 78.43L195.3 21.33C197.3 12.25 204.3 5.04 213.5 3.51C227.3 1.201 241.5 0 256 0C270.5 0 284.7 1.201 298.5 3.51C307.7 5.04 314.7 12.25 316.7 21.33L329.2 78.43C344.1 84.96 359.8 93.56 373.2 103.9L428.9 86.14C437.7 83.32 447.4 85.8 453.4 92.95C461.5 102.8 468.9 113.2 475.5 124.2L480.2 132.3C486.2 143.2 491.5 154.7 495.9 166.6V166.6zM256 336C300.2 336 336 300.2 336 255.1C336 211.8 300.2 175.1 256 175.1C211.8 175.1 176 211.8 176 255.1C176 300.2 211.8 336 256 336z"/></svg>';
  }
}

function showPromptCategorySortByMenu() {
  const { selectedPromptsManagerFoldersSortBy = 'alphabetical' } = cachedSettings;
  const promptManagerSidebarSettingsMenu = document.querySelector('#prompt-manager-sidebar-settings-menu');
  const { right, top } = promptManagerSidebarSettingsMenu.getBoundingClientRect();

  const translateX = right + 2;
  const translateY = top - 50;
  const menu = `<div id="prompt-manager-sidebar-settings-sort-menu" dir="ltr" style="position:fixed;left:0;top:0;transform:translate3d(${translateX}px,${translateY}px,0);min-width:max-content;z-index:10001;--radix-popper-anchor-width:18px;--radix-popper-anchor-height:18px;--radix-popper-available-width:1167px;--radix-popper-available-height:604px;--radix-popper-transform-origin:0% 0px"><div data-side="bottom" data-align="start" role="menu" aria-orientation="vertical" data-state="open" data-radix-menu-content="" dir="ltr" aria-labelledby="radix-:r6g:" class="text-token-text-primary mt-2 min-w-[200px] max-w-xs rounded-lg border border-token-border-medium bg-token-main-surface-primary shadow-lg" tabindex="-1" data-orientation="vertical" style="outline:0;--radix-dropdown-menu-content-transform-origin:var(--radix-popper-transform-origin);--radix-dropdown-menu-content-available-width:var(--radix-popper-available-width);--radix-dropdown-menu-content-available-height:var(--radix-popper-available-height);--radix-dropdown-menu-trigger-width:var(--radix-popper-anchor-width);--radix-dropdown-menu-trigger-height:var(--radix-popper-anchor-height);pointer-events:auto">
  
    <div role="menuitem" id="alphabetical-sort-prompts-button" class="flex items-center justify-between gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item="">${translate('Alphabetical')} ${selectedPromptsManagerFoldersSortBy === 'alphabetical' ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md"><path fill="currentColor" fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m14.076-4.068a1 1 0 0 1 .242 1.393l-4.75 6.75a1 1 0 0 1-1.558.098l-2.5-2.75a1 1 0 0 1 1.48-1.346l1.66 1.827 4.032-5.73a1 1 0 0 1 1.394-.242" clip-rule="evenodd"></path></svg>' : ''}</div>

    <div role="menuitem" id="create-at-sort-prompts-button" class="flex gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item="">${translate('Create date')} ${selectedPromptsManagerFoldersSortBy === 'created_at' ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md"><path fill="currentColor" fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m14.076-4.068a1 1 0 0 1 .242 1.393l-4.75 6.75a1 1 0 0 1-1.558.098l-2.5-2.75a1 1 0 0 1 1.48-1.346l1.66 1.827 4.032-5.73a1 1 0 0 1 1.394-.242" clip-rule="evenodd"></path></svg>' : ''}</div>
    
    <div role="menuitem" id="update-at-sort-prompts-button" class="flex gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item="">${translate('Update date')} ${selectedPromptsManagerFoldersSortBy === 'updated_at' ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md"><path fill="currentColor" fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m14.076-4.068a1 1 0 0 1 .242 1.393l-4.75 6.75a1 1 0 0 1-1.558.098l-2.5-2.75a1 1 0 0 1 1.48-1.346l1.66 1.827 4.032-5.73a1 1 0 0 1 1.394-.242" clip-rule="evenodd"></path></svg>' : ''}</div></div></div>`;
  document.body.insertAdjacentHTML('beforeend', menu);
  addPromptCategorySortByMenuEventListeners();
}
function addPromptCategorySortByMenuEventListeners() {
  const alphabeticalSortPromptsButton = document.querySelector('#alphabetical-sort-prompts-button');
  const createAtSortPromptsButton = document.querySelector('#create-at-sort-prompts-button');
  const updateAtSortPromptsButton = document.querySelector('#update-at-sort-prompts-button');

  alphabeticalSortPromptsButton.addEventListener('click', () => {
    chrome.storage.local.set({ settings: { ...cachedSettings, selectedPromptsManagerFoldersSortBy: 'alphabetical' } }, () => {
      const promptManagerSidebar = document.querySelector('#prompt-manager-sidebar');
      promptManagerSidebar.innerHTML = '';
      promptManagerSidebar.insertAdjacentElement('beforeend', promptManagerSidebarContent());
    });
  });

  createAtSortPromptsButton.addEventListener('click', () => {
    chrome.storage.local.set({ settings: { ...cachedSettings, selectedPromptsManagerFoldersSortBy: 'created_at' } }, () => {
      const promptManagerSidebar = document.querySelector('#prompt-manager-sidebar');
      promptManagerSidebar.innerHTML = '';
      promptManagerSidebar.insertAdjacentElement('beforeend', promptManagerSidebarContent());
    });
  });

  updateAtSortPromptsButton.addEventListener('click', () => {
    chrome.storage.local.set({ settings: { ...cachedSettings, selectedPromptsManagerFoldersSortBy: 'updated_at' } }, () => {
      const promptManagerSidebar = document.querySelector('#prompt-manager-sidebar');
      promptManagerSidebar.innerHTML = '';
      promptManagerSidebar.insertAdjacentElement('beforeend', promptManagerSidebarContent());
    });
  });
}
