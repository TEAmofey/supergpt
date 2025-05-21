/* global loadingSpinner, escapeHTML, createCustomInstructionProfileEditor, debounce, dropdown, profilesSortByList, setUserSystemMessage, errorUpgradeConfirmation, isOnNewChatPage, translate, toast, closeMenus, createManager, isDarkMode, folderForNewChat, conversationFolderElement, isDescendant, cachedSettings */

// eslint-disable-next-line no-unused-vars
function customInstructionProfileManagerModalContent() {
  const content = document.createElement('div');
  content.id = 'modal-content-custom-instruction-profile-manager';
  content.classList = 'markdown prose-invert relative h-full overflow-hidden';
  content.style.paddingBottom = '59px';

  const filterBar = document.createElement('div');
  filterBar.classList = 'flex items-center justify-between p-2 bg-token-main-surface-primary border-b border-token-border-medium sticky top-0 z-10';

  content.appendChild(filterBar);

  const searchInput = document.createElement('input');
  searchInput.id = 'custom-instruction-profile-manager-search-input';
  searchInput.type = 'search';
  searchInput.placeholder = translate('Search profiles');
  searchInput.classList = 'text-token-text-primary bg-token-main-surface-secondary border border-token-border-medium text-sm rounded-md w-full h-10';
  searchInput.autocomplete = 'off';

  const delayedSearch = debounce(() => {
    fetchCustomInstructionProfiles();
  });
  searchInput.addEventListener('input', (e) => {
    if (e.target.value.trim().length > 2) {
      delayedSearch(e);
    } else if (e.target.value.length === 0) {
      fetchCustomInstructionProfiles();
    }
  });
  filterBar.appendChild(searchInput);

  const { selectedProfilesManagerSortBy } = cachedSettings;
  // add sort button
  const sortBySelectorWrapper = document.createElement('div');
  sortBySelectorWrapper.id = 'custom-instruction-profile-manager-sort-by-wrapper';
  sortBySelectorWrapper.style = 'position:relative;width:150px;z-index:1000;margin-left:8px;';
  sortBySelectorWrapper.innerHTML = dropdown('Profiles-Manager-SortBy', profilesSortByList, selectedProfilesManagerSortBy, 'code', 'right');
  filterBar.appendChild(sortBySelectorWrapper);
  // add compact view button
  const compactViewButton = profileCardCompactViewButton();
  filterBar.appendChild(compactViewButton);

  const profileList = document.createElement('div');
  profileList.id = 'custom-instruction-profile-manager-profile-list';
  profileList.classList = 'grid grid-cols-4 gap-4 p-4 pb-32 overflow-y-auto h-full content-start';
  content.appendChild(profileList);

  return content;
}
// eslint-disable-next-line no-unused-vars
function customInstructionProfileManagerModalActions() {
  const actions = document.createElement('div');
  actions.classList = 'flex items-center justify-end w-full mt-2';
  const addNewProfileButton = document.createElement('button');
  addNewProfileButton.classList = 'btn btn-primary';
  addNewProfileButton.innerText = translate('plus Add New Profile');
  addNewProfileButton.addEventListener('click', async (e) => {
    // if shift+click
    if (e.shiftKey) {
      chrome.storage.local.get(['customInstructionProfiles']).then((result) => {
        // copy to clipboard
        const copyText = JSON.stringify(result.customInstructionProfiles);
        const el = document.createElement('textarea');
        el.value = copyText;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        toast('Copied to clipboard');
      });
      return;
    }
    const hasSubscription = await chrome.runtime.sendMessage({
      type: 'checkHasSubscription',
    });
    const profileCards = document.querySelectorAll('#modal-manager div[id^="custom-instruction-profile-card-"]');
    if (!hasSubscription && profileCards.length >= 2) {
      const error = { type: 'limit', title: 'You have reached the limit', message: 'You have reached the limits of Custom Instruction Profiles with free account. Upgrade to Pro to remove all limits.' };
      errorUpgradeConfirmation(error);
      return;
    }
    createCustomInstructionProfileEditor();
  });
  actions.appendChild(addNewProfileButton);
  return actions;
}

function profileCardCompactViewButton() {
  const { selectedProfileView } = cachedSettings;

  const compactViewButton = document.createElement('button');
  compactViewButton.classList = 'h-10 aspect-1 flex items-center justify-center rounded-lg px-2 ms-2 text-token-text-tertiary focus-visible:outline-0 bg-token-sidebar-surface-primary hover:bg-token-sidebar-surface-secondary focus-visible:bg-token-sidebar-surface-secondary border border-token-border-medium';
  compactViewButton.innerHTML = selectedProfileView === 'list' ? '<svg fill="currentColor" class="icon-md" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M320 192h96c17.6 0 32-14.4 32-32V64c0-17.6-14.4-32-32-32h-96c-17.6 0-32 14.4-32 32v96C288 177.6 302.4 192 320 192zM336 80h64v64h-64V80zM480 256h-160c-17.67 0-32 14.33-32 32v160c0 17.67 14.33 32 32 32h160c17.67 0 32-14.33 32-32V288C512 270.3 497.7 256 480 256zM464 432h-128v-128h128V432zM206.4 335.1L152 394.9V56.02C152 42.76 141.3 32 128 32S104 42.76 104 56.02v338.9l-54.37-58.95c-4.719-5.125-11.16-7.719-17.62-7.719c-5.812 0-11.66 2.094-16.28 6.375c-9.75 8.977-10.34 24.18-1.344 33.94l95.1 104.1c9.062 9.82 26.19 9.82 35.25 0l95.1-104.1c9-9.758 8.406-24.96-1.344-33.94C230.5 325.5 215.3 326.2 206.4 335.1z"/></svg>' : '<svg fill="currentColor" class="icon-md" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M480 256h-160c-17.67 0-32 14.33-32 32v160c0 17.67 14.33 32 32 32h160c17.67 0 32-14.33 32-32V288C512 270.3 497.7 256 480 256zM464 432h-128v-128h128V432zM320 192h96c17.6 0 32-14.4 32-32V64c0-17.6-14.4-32-32-32h-96c-17.6 0-32 14.4-32 32v96C288 177.6 302.4 192 320 192zM336 80h64v64h-64V80zM145.6 39.37c-9.062-9.82-26.19-9.82-35.25 0L14.38 143.4c-9 9.758-8.406 24.96 1.344 33.94C20.35 181.7 26.19 183.8 32 183.8c6.469 0 12.91-2.594 17.62-7.719L104 117.1v338.9C104 469.2 114.8 480 128 480s24-10.76 24-24.02V117.1l54.37 58.95C215.3 185.8 230.5 186.5 240.3 177.4C250 168.4 250.6 153.2 241.6 143.4L145.6 39.37z"/></svg>';
  compactViewButton.addEventListener('click', () => {
    // switch between aspect-2 to aspect-1.5 for all profileCard
    const profileCards = document.querySelectorAll('#modal-manager div[id^="custom-instruction-profile-card-"]');
    profileCards.forEach((profileCard) => {
      if (cachedSettings.selectedProfileView === 'list') {
        profileCard.classList.remove('aspect-2');
        profileCard.classList.add('aspect-1.5');
      } else {
        profileCard.classList.remove('aspect-1.5');
        profileCard.classList.add('aspect-2');
      }
    });
    if (cachedSettings.selectedProfileView === 'list') {
      compactViewButton.innerHTML = '<svg fill="currentColor" class="icon-md" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M480 256h-160c-17.67 0-32 14.33-32 32v160c0 17.67 14.33 32 32 32h160c17.67 0 32-14.33 32-32V288C512 270.3 497.7 256 480 256zM464 432h-128v-128h128V432zM320 192h96c17.6 0 32-14.4 32-32V64c0-17.6-14.4-32-32-32h-96c-17.6 0-32 14.4-32 32v96C288 177.6 302.4 192 320 192zM336 80h64v64h-64V80zM145.6 39.37c-9.062-9.82-26.19-9.82-35.25 0L14.38 143.4c-9 9.758-8.406 24.96 1.344 33.94C20.35 181.7 26.19 183.8 32 183.8c6.469 0 12.91-2.594 17.62-7.719L104 117.1v338.9C104 469.2 114.8 480 128 480s24-10.76 24-24.02V117.1l54.37 58.95C215.3 185.8 230.5 186.5 240.3 177.4C250 168.4 250.6 153.2 241.6 143.4L145.6 39.37z"/></svg>';
    } else {
      compactViewButton.innerHTML = '<svg fill="currentColor" class="icon-md" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M320 192h96c17.6 0 32-14.4 32-32V64c0-17.6-14.4-32-32-32h-96c-17.6 0-32 14.4-32 32v96C288 177.6 302.4 192 320 192zM336 80h64v64h-64V80zM480 256h-160c-17.67 0-32 14.33-32 32v160c0 17.67 14.33 32 32 32h160c17.67 0 32-14.33 32-32V288C512 270.3 497.7 256 480 256zM464 432h-128v-128h128V432zM206.4 335.1L152 394.9V56.02C152 42.76 141.3 32 128 32S104 42.76 104 56.02v338.9l-54.37-58.95c-4.719-5.125-11.16-7.719-17.62-7.719c-5.812 0-11.66 2.094-16.28 6.375c-9.75 8.977-10.34 24.18-1.344 33.94l95.1 104.1c9.062 9.82 26.19 9.82 35.25 0l95.1-104.1c9-9.758 8.406-24.96-1.344-33.94C230.5 325.5 215.3 326.2 206.4 335.1z"/></svg>';
    }
    chrome.storage.local.set({
      settings: {
        ...cachedSettings,
        selectedProfileView: cachedSettings.selectedProfileView === 'list' ? 'grid' : 'list',
      },
    });
  });
  return compactViewButton;
}

function createCustomInstructionProfileCard(profile) {
  const profileCard = document.createElement('div');
  profileCard.id = `custom-instruction-profile-card-${profile.id}`;
  profileCard.classList = `bg-token-main-surface-primary border border-token-border-medium p-4 pb-2 rounded-md cursor-pointer hover:bg-token-main-surface-tertiary ${cachedSettings.selectedProfileView === 'list' ? 'aspect-2' : 'aspect-1.5'} flex flex-col h-auto`;
  profileCard.style = 'height: max-content;outline-offset: 4px; outline: none;';

  profileCard.innerHTML = `<div class="flex items-center justify-between border-b border-token-border-medium pb-1"><div class="text-md text-token-text-primary whitespace-nowrap overflow-hidden text-ellipsis flex items-center w-full">${escapeHTML(profile.name)}</div>
  </div>
  <div class="text-token-text-tertiary text-sm whitespace-wrap overflow-hidden text-ellipsis  break-all">${escapeHTML(`${profile.name_user_message || ''} ${profile.name_user_message || '' ? ' - ' : ''} ${profile.role_user_message || ''}`.substring(0, 250))}</div>

  <div class="flex-1 text-token-text-tertiary text-sm whitespace-wrap overflow-hidden text-ellipsis  break-all">${escapeHTML(`${profile.traits_model_message || ''} ${profile.other_user_message || ''}`.substring(0, 250))}</div>

  <div class="flex overflow-hidden my-1">
    ${['browsing', 'dalle', 'python', 'canmore', 'advanced_voice'].filter((tool) => !profile.disabled_tools.includes(tool)).map((tool) => `<span title="${tool === 'canmore' ? 'Canvas' : tool.replaceAll('_', ' ')}" id="prompt-card-tag-${tool}" class="border border-token-border-medium hover:bg-token-main-surface-secondary text-token-text-tertiary text-xs px-2 rounded-full me-1 capitalize whitespace-nowrap overflow-hidden text-ellipsis">${tool === 'canmore' ? 'Canvas' : tool.replaceAll('_', ' ')}</span>`).join('')}
  </div>
  
  <div class="border-t border-token-border-medium flex justify-between items-center pt-1">
   
    <div id="profile-card-action-${profile.id}" class="flex items-center w-full">
      <div class="cursor-pointer text-sm flex items-center justify-between gap-2 mt-1 w-full">${translate('Enable for new chats')}<label class="sp-switch me-0"><input id="profile-card-status-switch-${profile.id}" type="checkbox" ${profile.enabled ? 'checked=""' : ''}><span class="sp-switch-slider round"></span></label></div>
    </div>
  </div>`;
  profileCard.addEventListener('click', () => {
    createCustomInstructionProfileEditor(profile);
  });
  return profileCard;
}
function addCustomInstructionProfileCardEventListeners(profile) {
  const profileCard = document.querySelector(`#custom-instruction-profile-card-${profile.id}`);
  const profileCardAction = profileCard.querySelector(`#profile-card-action-${profile.id}`);
  const profileCardStatusSwitch = profileCard.querySelector(`#profile-card-status-switch-${profile.id}`);
  profileCardAction.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenus();
  });
  profileCardStatusSwitch.addEventListener('input', (e) => {
    e.stopPropagation();
    closeMenus();
  });
  profileCardStatusSwitch.addEventListener('change', (e) => {
    e.stopPropagation();
    closeMenus();
    // only one profile can be enabled at a time
    if (e.target.checked) {
      const allProfileStatusSwitches = document.querySelectorAll('#modal-manager input[id^="profile-card-status-switch-"]');
      allProfileStatusSwitches.forEach((statusSwitch) => {
        if (statusSwitch.id !== e.target.id) {
          statusSwitch.checked = false;
        }
      });
    }
    chrome.runtime.sendMessage({
      type: 'updateCustomInstructionProfile',
      detail: {
        profileId: profile.id,
        profile: {
          enabled: e.target.checked,
        },
      },
    }, () => {
      setUserSystemMessage(profile.name_user_message, profile.role_user_message, profile.traits_model_message, profile.other_user_message, e.target.checked, profile.disabled_tools);
      initializeCustomInstructionProfileSelector(true);
    });
  });
}

// eslint-disable-next-line no-unused-vars
function addOrReplaceProfileCard(profile, origElement = null) {
  const existingProfileCard = document.querySelector(`#modal-manager #custom-instruction-profile-card-${profile.id}`);
  if (existingProfileCard) {
    const newProfileCard = createCustomInstructionProfileCard(profile);
    existingProfileCard.replaceWith(newProfileCard);
    addCustomInstructionProfileCardEventListeners(profile);
  } else {
    // add the profile card to the beginning of the list
    const profileList = document.querySelector('#modal-manager #custom-instruction-profile-manager-profile-list');
    const noProfilesFound = document.querySelector('#modal-manager #no-profiles-found');
    if (noProfilesFound) noProfilesFound.remove();
    const newProfileCard = createCustomInstructionProfileCard(profile);
    if (origElement) {
      // add the profile card after the origElement
      origElement.after(newProfileCard);
    } else {
      profileList.prepend(newProfileCard);
    }
    addCustomInstructionProfileCardEventListeners(profile);
  }
}
function fetchCustomInstructionProfiles(pageNumber = 1) {
  const profileList = document.querySelector('#modal-manager #custom-instruction-profile-manager-profile-list');
  if (!profileList) return;
  if (pageNumber === 1) {
    profileList.innerHTML = '';
    profileList.appendChild(loadingSpinner('custom-instruction-profile-manager-main-content'));
  }

  const { selectedProfilesManagerSortBy } = cachedSettings;
  const profileManagerSearchTerm = document.querySelector('#modal-manager [id=custom-instruction-profile-manager-search-input]')?.value;
  chrome.runtime.sendMessage({
    type: 'getCustomInstructionProfiles',
    detail: {
      pageNumber,
      searchTerm: profileManagerSearchTerm,
      sortBy: selectedProfilesManagerSortBy?.code,
    },
  }, (data) => {
    const profiles = data.results;
    if (!profiles) return;
    if (!Array.isArray(profiles)) return;
    const loadMoreButton = document.querySelector('#modal-manager #load-more-profiles-button');
    if (loadMoreButton) loadMoreButton.remove();
    const loadingSpinnerElement = document.querySelector('#modal-manager #loading-spinner-custom-instruction-profile-manager-main-content');
    if (loadingSpinnerElement) loadingSpinnerElement.remove();
    if (profiles?.length === 0 && pageNumber === 1) {
      const noProfiles = document.createElement('p');
      noProfiles.id = 'no-profiles-found';
      noProfiles.classList = 'absolute text-center text-sm text-token-text-tertiary w-full p-4';
      noProfiles.innerText = translate('No profiles found');
      profileList.appendChild(noProfiles);
    } else {
      profiles.forEach((profile) => {
        const profileCard = createCustomInstructionProfileCard(profile);
        profileList.appendChild(profileCard);
        addCustomInstructionProfileCardEventListeners(profile);
      });
      if (data.next) {
        const loadMoreProfilesButton = document.createElement('button');
        loadMoreProfilesButton.id = 'load-more-profiles-button';
        loadMoreProfilesButton.classList = 'bg-token-main-surface-secondary p-4 pb-2 rounded-md cursor-pointer hover:bg-token-main-surface-tertiary aspect-1.5 flex flex-col h-auto relative';
        loadMoreProfilesButton.appendChild(loadingSpinner('load-more-profiles-button'));
        profileList.appendChild(loadMoreProfilesButton);
        // add an observer to click the load more button when it is visible
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              fetchCustomInstructionProfiles(pageNumber + 1);
            }
          });
        }, { threshold: 0.5 });
        if (loadMoreProfilesButton) {
          observer.observe(loadMoreProfilesButton);
        }
      }
    }
  });
}
// new chat page profile selector
function profileDropdown() {
  const profileListDropdownWrapper = document.createElement('div');
  profileListDropdownWrapper.id = 'profile-list-dropdown-wrapper';
  profileListDropdownWrapper.style = 'max-height:300px;min-width:230px;max-width:fit-content;bottom:40px;z-index:200;';
  profileListDropdownWrapper.classList = 'hidden absolute z-10 end-0 overflow-auto rounded-md text-base border border-token-border-medium focus:outline-none dark:ring-white/20 dark:last:border-b-0 text-sm -translate-x-1/4 bg-token-main-surface-primary';
  const menuHeader = document.createElement('div');
  menuHeader.classList = 'flex items-center text-token-text-primary font-bold relative cursor-pointer select-none border-b p-2 py-3 last:border-b-0 border-token-border-medium bg-token-main-surface-secondary sticky top-0 z-10';
  menuHeader.innerHTML = `${translate('Custom Instruction Profiles')} <span class="flex items-center justify-center bg-white rounded-full h-4 w-4 ms-auto"><svg class="icon-xs" fill="#000" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M288 224H480C497.7 224 512 238.3 512 256C512 273.7 497.7 288 480 288H288V480C288 497.7 273.7 512 255.1 512C238.3 512 223.1 497.7 223.1 480V288H32C14.33 288 0 273.7 0 256C0 238.3 14.33 224 32 224H223.1V32C223.1 14.33 238.3 0 255.1 0C273.7 0 288 14.33 288 32V224z"/></svg></span>`;
  menuHeader.addEventListener('click', () => {
    createManager('custom-instruction-profiles');
  });
  profileListDropdownWrapper.appendChild(menuHeader);

  const profileList = document.createElement('ul');
  profileList.id = 'custom-instruction-profile-dropdown-list';
  profileList.classList = 'w-full h-full relative';
  profileList.setAttribute('role', 'menu');
  profileList.setAttribute('aria-orientation', 'vertical');
  profileList.setAttribute('aria-labelledby', 'profile-selector-dropdown-button');
  profileList.setAttribute('tabindex', '-1');
  profileListDropdownWrapper.appendChild(profileList);

  document.body.addEventListener('click', (e) => {
    const curProfileListDropdownWrapper = document.querySelector('#profile-list-dropdown-wrapper');
    const cl = curProfileListDropdownWrapper?.classList;
    if (cl?.contains('block') && !e.target.closest('#profile-selector-dropdown-button')) {
      curProfileListDropdownWrapper.classList.replace('block', 'hidden');
    }
  });
  return profileListDropdownWrapper;
}
function fetchDropdownProfiles(newPageNumber = 1) {
  const customInstructionProfileList = document.querySelector('#custom-instruction-profile-dropdown-list');
  if (!customInstructionProfileList) return;
  if (newPageNumber === 1) {
    customInstructionProfileList.innerHTML = '';
    customInstructionProfileList.appendChild(loadingSpinner('custom-instruction-profile-dropdown-list'));
  } else {
    // remove the load more button
    const loadMoreButton = document.querySelector('#load-more-profiles-dropdown-button');
    if (loadMoreButton) loadMoreButton.remove();
  }

  chrome.runtime.sendMessage({
    type: 'getCustomInstructionProfiles',
    detail: {
      pageNumber: newPageNumber,
      sortBy: 'alphabetical',
    },
  }, (data) => {
    const profiles = data.results;
    if (!profiles) return;
    if (!Array.isArray(profiles)) return;
    const loadingSpinnerElement = document.querySelector('#loading-spinner-custom-instruction-profile-dropdown-list');
    if (loadingSpinnerElement) loadingSpinnerElement.remove();
    if (profiles.length === 0 && newPageNumber === 1) {
      const noProfiles = document.createElement('p');
      noProfiles.classList = 'text-token-text-tertiary p-4';
      noProfiles.innerText = translate('No profiles found');
      customInstructionProfileList.appendChild(noProfiles);
    } else {
      const darkMode = isDarkMode();
      profiles.forEach((profile) => {
        const profileName = profile.name;
        const isEnabled = profile.enabled;
        const profileText = `name:\n${profile.name_user_message}\n\nrole:\n${profile.role_user_message}\n\nmodel traits:\n${profile.traits_model_message}\n\nother user message:\n${profile.other_user_message}`;
        const dropdownItem = document.createElement('li');
        dropdownItem.id = `custom-instruction-profile-dropdown-item-${profileName}`;
        dropdownItem.dir = 'auto';
        dropdownItem.classList = 'text-token-text-primary relative cursor-pointer select-none border-b p-2 last:border-b-0 border-token-border-medium hover:bg-token-main-surface-secondary';
        const dropdownOption = document.createElement('span');
        dropdownOption.classList = 'flex h-6 items-center justify-between text-token-text-primary';
        const titleElement = document.createElement('span');
        titleElement.style = 'text-transform: capitalize; max-width: 200px;';
        titleElement.classList = 'truncate';
        titleElement.innerText = profileName;
        dropdownOption.appendChild(titleElement);
        const enabledButton = document.createElement('button');
        enabledButton.id = `enable-profile-button-${profile.id}`;
        enabledButton.classList = `text-xs px-1 ms-1 flex items-center justify-center ${darkMode ? 'bg-white text-black' : 'text-white bg-black'} ${isEnabled ? '' : 'hidden'} rounded-full border border-token-border-medium hover:border-token-border-medium`;
        enabledButton.dataset.enabled = isEnabled;
        enabledButton.innerText = translate('enabled');

        dropdownOption.appendChild(enabledButton);
        dropdownOption.title = `${profileName}\n\n${profileText}`;
        dropdownItem.appendChild(dropdownOption);
        dropdownItem.setAttribute('role', 'option');
        dropdownItem.setAttribute('tabindex', '-1');

        // eslint-disable-next-line no-loop-func
        dropdownItem.addEventListener('click', () => {
          const curIsEnabled = enabledButton.dataset.enabled === 'true';
          updateCustomInstructionProfileSelector(profile, !curIsEnabled);
        });
        customInstructionProfileList.appendChild(dropdownItem);
      });
      if (data.next) {
        const loadMoreProfilesButton = document.createElement('button');
        loadMoreProfilesButton.id = 'load-more-profiles-dropdown-button';
        loadMoreProfilesButton.classList = 'p-2 cursor-pointer flex items-center justify-center h-auto relative';
        loadMoreProfilesButton.appendChild(loadingSpinner('load-more-profiles-dropdown-button'));
        customInstructionProfileList.appendChild(loadMoreProfilesButton);
        // add an observer to click the load more button when it is visible
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              fetchDropdownProfiles(newPageNumber + 1);
            }
          });
        }, { threshold: 0 });
        if (loadMoreProfilesButton) {
          observer.observe(loadMoreProfilesButton);
        }
      }
    }
  });
}
function updateCustomInstructionProfileSelector(profile, isEnabled) {
  chrome.runtime.sendMessage({
    type: 'updateCustomInstructionProfile',
    detail: {
      profileId: profile.id,
      profile: {
        enabled: isEnabled,
      },
    },
  }, () => {
    setUserSystemMessage(profile.name_user_message, profile.role_user_message, profile.traits_model_message, profile.other_user_message, isEnabled, profile.disabled_tools);

    // change the default button styles
    const allEnabledButtons = document.querySelectorAll('#profile-list-dropdown-wrapper [id^="enable-profile-button-"]');
    allEnabledButtons.forEach((button) => {
      button.classList.add('hidden');
      button.dataset.enabled = 'false';
    });
    if (isEnabled) {
      const curButtonEnabledTag = document.querySelector(`#custom-instruction-profile-selector-wrapper button[id^="enable-profile-button-${profile.id}"]`);
      if (curButtonEnabledTag) {
        curButtonEnabledTag.classList.remove('hidden');
        curButtonEnabledTag.dataset.enabled = 'true';
      }
    }
    // change selector button text
    const profileSelectorDropdownButton = document.querySelector('#profile-selector-dropdown-button');
    profileSelectorDropdownButton.innerHTML = `<span class="me-4 truncate" style="min-width:100px; max-width:200px;">${isEnabled ? profile.name : 'Select a profile'}</span><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md text-token-text-tertiary absolute" style="right:10px;transform: rotate(180deg);"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.29289 9.29289C5.68342 8.90237 6.31658 8.90237 6.70711 9.29289L12 14.5858L17.2929 9.29289C17.6834 8.90237 18.3166 8.90237 18.7071 9.29289C19.0976 9.68342 19.0976 10.3166 18.7071 10.7071L12.7071 16.7071C12.5196 16.8946 12.2652 17 12 17C11.7348 17 11.4804 16.8946 11.2929 16.7071L5.29289 10.7071C4.90237 10.3166 4.90237 9.68342 5.29289 9.29289Z" fill="currentColor"></path></svg>`;
  });
}
// eslint-disable-next-line no-unused-vars
const debounceInitializeCustomInstructionProfileSelector = debounce(() => {
  initializeCustomInstructionProfileSelector();
}, 100);
async function initializeCustomInstructionProfileSelector(forceRefresh = false) {
  const onNewChatPage = isOnNewChatPage();
  const onProjectPage = window.location.pathname.startsWith('/g/g-p-') && window.location.pathname.endsWith('/project');
  const onCustomGPT = window.location.pathname.startsWith('/g/g-');

  const existingProfileSelectorButton = document.querySelector('#custom-instruction-profile-selector-wrapper');
  if (existingProfileSelectorButton) {
    if (!onNewChatPage) {
      existingProfileSelectorButton.remove();
      return;
    }
    if (!forceRefresh) return;
    existingProfileSelectorButton?.remove();
  }

  if (!onNewChatPage) return;
  if (onProjectPage) return;
  if (onCustomGPT) return;

  const profileSelectorWrapper = document.createElement('div');
  profileSelectorWrapper.style = 'z-index:20;display:flex;right:0;position:absolute;top:-44px;';
  // wait till cond id is loaded when starting a new chat

  profileSelectorWrapper.id = 'custom-instruction-profile-selector-wrapper';
  const profileSelectorDropdownButton = document.createElement('button');
  profileSelectorDropdownButton.id = 'profile-selector-dropdown-button';
  profileSelectorDropdownButton.type = 'button';
  profileSelectorDropdownButton.style = 'z-index:2;';
  profileSelectorDropdownButton.classList = 'btn flex justify-center gap-2 btn-secondary border ';
  profileSelectorDropdownButton.appendChild(loadingSpinner('profile-selector-dropdown-button'));

  profileSelectorDropdownButton.addEventListener('click', () => {
    const dropdown = document.querySelector('#profile-list-dropdown-wrapper');
    if (!dropdown) return;
    if (dropdown.classList.contains('block')) {
      dropdown.classList.replace('block', 'hidden');
    } else {
      dropdown.classList.replace('hidden', 'block');
    }
  });
  chrome.runtime.sendMessage({
    type: 'getEnabledCustomInstructionProfile',
  }, (enabledCustomInstructionProfile) => {
    profileSelectorDropdownButton.title = enabledCustomInstructionProfile?.name || 'Select a profile';
    profileSelectorDropdownButton.innerHTML = `<span class="me-4 truncate" style="min-width:100px; max-width:200px;">${enabledCustomInstructionProfile?.name || 'Select a profile'}</span><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md text-token-text-tertiary absolute" style="right:10px;transform: rotate(180deg);"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.29289 9.29289C5.68342 8.90237 6.31658 8.90237 6.70711 9.29289L12 14.5858L17.2929 9.29289C17.6834 8.90237 18.3166 8.90237 18.7071 9.29289C19.0976 9.68342 19.0976 10.3166 18.7071 10.7071L12.7071 16.7071C12.5196 16.8946 12.2652 17 12 17C11.7348 17 11.4804 16.8946 11.2929 16.7071L5.29289 10.7071C4.90237 10.3166 4.90237 9.68342 5.29289 9.29289Z" fill="currentColor"></path></svg>`;
  });

  profileSelectorWrapper.appendChild(profileSelectorDropdownButton);
  profileSelectorWrapper.appendChild(profileDropdown());

  const inputForm = document.querySelector('main form');
  if (inputForm) {
    inputForm.style.marginTop = '20px';
    inputForm.appendChild(profileSelectorWrapper);
    fetchDropdownProfiles();
  }
}

// folder profile selector
/* eslint-disable no-unused-vars */
async function openFolderProfileSelectorModal(folder) {
  const folderProfileSelectorModal = `
  <div id="folder-profile-selector-modal" class="absolute inset-0" style="z-index: 10000;">
    <div data-state="open" class="fixed inset-0 bg-black/50 dark:bg-black/80" style="pointer-events: auto;">
      <div class="h-full w-full grid grid-cols-[10px_1fr_10px] grid-rows-[minmax(10px,1fr)_auto_minmax(10px,1fr)] md:grid-rows-[minmax(20px,1fr)_auto_minmax(20px,1fr)] overflow-y-auto">
        <div id="folder-profile-selector-content" role="dialog" aria-describedby="radix-:r3o:" aria-labelledby="radix-:r3n:" data-state="open" class="popover bg-token-main-surface-primary relative start-1/2 col-auto col-start-2 row-auto row-start-2 h-full w-full text-start ltr:-translate-x-1/2 rtl:translate-x-1/2 rounded-2xl shadow-xl flex flex-col focus:outline-hidden overflow-hidden max-w-lg" tabindex="-1" style="pointer-events: auto;">
          <div class="px-4 pb-4 pt-5 flex flex-wrap items-center justify-between border-b border-token-border-medium">
            <div class="flex">
              <div class="flex items-center">
                <div class="flex grow flex-col gap-1">
                  <h2 as="h3" class="text-lg font-medium leading-6 text-token-text-primary">${translate('Select a profile')}</h2>
                </div>
              </div>
            </div>
            <div class="flex items-center">
              <button id="folder-profile-selector-new-profile" class="btn flex justify-center gap-2 btn-primary me-2 border" data-default="true" style="min-width: 72px; height: 34px;">${translate('plus Create new profile')}</button>
              <button id="folder-profile-selector-close-button" class="text-token-text-tertiary hover:text-token-text-primary transition">
                <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="20" width="20"
                  xmlns="http://www.w3.org/2000/svg">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            </div>
          <div class="flex text-sm text-token-text-tertiary p-4 w-full">
            Enable the profile you want to be used for all new conversations created in this folder.
          </div>
          <div id="folder-profile-selector-folder-wrapper" class="px-4 overflow-y-auto">
          </div>
          <div id="folder-profile-selector-profile-list" class="p-4 overflow-y-auto" style="height:500px;">
            <!-- profile list here -->
          </div>
        </div>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', folderProfileSelectorModal);
  // add folder to the top
  const folderProfileSelectorFolderWrapper = document.querySelector('#folder-profile-selector-folder-wrapper');
  folderProfileSelectorFolderWrapper?.prepend(conversationFolderElement(folder, false, false, false, false, true));
  await folderProfileSelectorLoadProfileList(folder.id, 1);
  addFolderProfileSelectorModalEventListener(folder);
}

async function folderProfileSelectorLoadProfileList(folderId, newPageNumber = 1) {
  const profileList = document.querySelector('#folder-profile-selector-profile-list');
  if (!profileList) return;
  if (newPageNumber === 1) {
    profileList.innerHTML = '';
    profileList.appendChild(loadingSpinner('folder-profile-selector-profile-list'));
  } else {
    // remove the load more button
    const loadMoreButton = document.querySelector('#load-more-folder-profile-selector');
    if (loadMoreButton) loadMoreButton.remove();
  }
  const folder = await chrome.runtime.sendMessage({
    type: 'getConversationFolder',
    forceRefresh: newPageNumber === 1,
    detail: {
      folderId,
    },
  });

  chrome.runtime.sendMessage({
    type: 'getCustomInstructionProfiles',
    detail: {
      pageNumber: newPageNumber,
      sortBy: 'alphabetical',
    },
  }, (data) => {
    const profiles = data.results;
    if (!profiles) return;
    if (!Array.isArray(profiles)) return;
    const loadingSpinnerElement = document.querySelector('#loading-spinner-folder-profile-selector-profile-list');
    if (loadingSpinnerElement) loadingSpinnerElement.remove();
    if (profiles.length === 0 && newPageNumber === 1) {
      const noProfiles = document.createElement('p');
      noProfiles.classList = 'text-token-text-tertiary p-4';
      noProfiles.innerText = translate('No profiles found');
      profileList.appendChild(noProfiles);
    } else {
      const darkMode = isDarkMode();
      profiles.forEach((profile) => {
        const profileName = profile.name;
        const isEnabled = profile.id === folder.profile?.id;
        const profileText = `about user message:\n${profile.about_user_message}\n\nabout model message:\n${profile.about_model_message}`;
        const profileItem = document.createElement('div');
        profileItem.id = `folder-profile-selector-item-${profileName}`;
        profileItem.dir = 'auto';
        profileItem.classList = 'text-token-text-primary relative cursor-pointer select-none p-2 py-3 rounded-md hover:bg-token-main-surface-secondary';
        const profileItemContent = document.createElement('span');
        profileItemContent.classList = 'flex h-6 items-center justify-between text-token-text-primary';
        const titleElement = document.createElement('span');
        titleElement.style = 'text-transform: capitalize; max-width: 380px;';
        titleElement.classList = 'truncate';
        titleElement.innerText = profileName;
        profileItemContent.appendChild(titleElement);

        const enabledButton = document.createElement('div');
        enabledButton.id = `enable-profile-button-${profile.id}`;
        enabledButton.classList = 'cursor-pointer text-sm flex items-center justify-between gap-2 ms-auto';
        enabledButton.innerHTML = `<label class="sp-switch me-0"><input id="folder-profile-selector-switch-${profile.id}" type="checkbox" ${isEnabled ? 'checked=""' : ''}><span class="sp-switch-slider round"></span></label>`;

        profileItemContent.appendChild(enabledButton);
        profileItemContent.title = `${profileName}\n\n${profileText}`;
        profileItem.appendChild(profileItemContent);
        profileItem.setAttribute('role', 'option');
        profileItem.setAttribute('tabindex', '-1');

        // eslint-disable-next-line no-loop-func
        profileItem.addEventListener('click', () => {
          const curIsEnabled = enabledButton.querySelector('input').checked;

          const newData = { profile_id: curIsEnabled ? 0 : profile.id };
          // update folder name
          chrome.runtime.sendMessage({
            type: 'updateConversationFolder',
            detail: {
              folderId: folder.id,
              newData,
            },
          });
          // update the toggles
          // change the default button styles
          const allEnabledToggles = document.querySelectorAll('#folder-profile-selector-profile-list [id^="enable-profile-button-"]');
          allEnabledToggles.forEach((button) => {
            button.querySelector('input').checked = false;
          });
          if (!curIsEnabled) {
            const curButtonEnabledToggleWrapper = profileItem.querySelector('[id^="enable-profile-button-"]');
            curButtonEnabledToggleWrapper.querySelector('input').checked = true;
          }
          // update the profile and new page profile selector if needed
          const shouldUpdateCurrentProfile = folderForNewChat && folderForNewChat.id === folder.id;
          if (shouldUpdateCurrentProfile) {
            updateCustomInstructionProfileSelector(profile, !curIsEnabled);
          }
        });

        profileList.appendChild(profileItem);
      });
      if (data.next) {
        const loadMoreProfilesButton = document.createElement('button');
        loadMoreProfilesButton.id = 'load-more-folder-profile-selector';
        loadMoreProfilesButton.classList = 'p-2 cursor-pointer flex items-center justify-center h-auto relative';
        loadMoreProfilesButton.appendChild(loadingSpinner('load-more-folder-profile-selector'));
        profileList.appendChild(loadMoreProfilesButton);
        // add an observer to click the load more button when it is visible
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              folderProfileSelectorLoadProfileList(newPageNumber + 1);
            }
          });
        }, { threshold: 0 });
        if (loadMoreProfilesButton) {
          observer.observe(loadMoreProfilesButton);
        }
      }
    }
  });
}
function addFolderProfileSelectorModalEventListener(folder) {
  const folderProfileSelectorCloseButton = document.querySelector('#folder-profile-selector-close-button');
  folderProfileSelectorCloseButton.addEventListener('click', () => {
    const folderProfileSelectorModal = document.querySelector('#folder-profile-selector-modal');
    folderProfileSelectorModal.remove();
  });

  // close modal when clicked outside
  document.body.addEventListener('click', (e) => {
    const folderProfileSelectorModal = document.querySelector('#folder-profile-selector-modal');
    const folderProfileSelectorContent = document.querySelector('#folder-profile-selector-content');
    if (folderProfileSelectorContent && isDescendant(folderProfileSelectorModal, e.target) && !isDescendant(folderProfileSelectorContent, e.target)) {
      folderProfileSelectorModal?.remove();
    }
  });

  const folderProfileSelectorNewProfileButton = document.querySelector('#folder-profile-selector-new-profile');
  folderProfileSelectorNewProfileButton.addEventListener('click', () => {
    createManager('custom-instruction-profiles');
  });
}
