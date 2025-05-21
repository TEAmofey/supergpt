/* global getGizmoDiscovery, dropdown, addDropdownEventListener, showConfirmDialog, openUpgradeModal, deleteGizmo, toast, debounce, gizmoSortByList, getGizmosBootstrap, updateGizmoSidebar, getGizmoAbout, showGizmoAboutDialog, loadingSpinner, translate, closeMenus */
let gizmoPageNumber = 1;
let gizmoCursor = null;
let noMoreGizmo = false;
let gizmoSortBy = gizmoSortByList[0].code;
let selectedGizmoCategoryId = 'all';

const gizmoCategories = [
  { id: 'all', title: 'All GPTs', description: 'Full list of all GPTs in the store. With the ability to search and sort by most popular.' },
  { id: 'featured_store', title: 'Top Picks', description: 'Curated top picks from this week' },
  { id: 'trending', title: 'Trending', description: 'Most popular GPTs by our community' },
  { id: 'featured', title: 'By ChatGPT', description: 'GPTs created by the ChatGPT team' },
  { id: 'pinned', title: 'Pinned', description: 'Pinned GPTs in your sidebar' },
  // { id: 'recent', title: 'Recent', description: 'Recently used GPTs' },
  { id: 'mine', title: 'My GPTs', description: 'My GPTs' },
  { id: 'more_categories', title: '. . .', description: 'More Categories' },
];
const gizmoMoreCategories = [
  { id: 'dalle', title: 'DALL·E', description: 'Transform your ideas into amazing images' },
  { id: 'writing', title: 'Writing', description: 'Enhance your writing with tools for creation, editing, and style refinement' },
  { id: 'productivity', title: 'Productivity', description: 'Increase your efficiency' },
  { id: 'research', title: 'Research', description: 'Find, evaluate, interpret, and visualize information' },
  { id: 'programming', title: 'Programming', description: 'Write code, debug, test, and learn' },
  { id: 'education', title: 'Education', description: 'Explore new ideas, revisit existing skills' },
  { id: 'lifestyle', title: 'Lifestyle', description: 'Get tips on travel, workouts, style, food, and more' },
];
// eslint-disable-next-line no-unused-vars
function renderGizmoDiscoveryPage(defaultCategory = 'all') {
  if (!defaultCategory) defaultCategory = 'all';
  const gizmoDiscoveryPage = document.createElement('div');
  gizmoDiscoveryPage.appendChild(loadingSpinner('gizmo-discovery-loading'));

  chrome.runtime.sendMessage({
    type: 'checkHasSubscription',
    forceRefresh: true,
  }, (hasSubscription) => {
    if (!hasSubscription && defaultCategory === 'all') {
      defaultCategory = 'featured_store';
    }
    selectedGizmoCategoryId = defaultCategory;

    chrome.storage.sync.get(['openai_id']).then((syncRes) => {
      const { openai_id: currentUserId } = syncRes;

      // a page with 4 buttons at the top: All GPTs, Recent, Featured, and Mine + a gri layout under it
      gizmoDiscoveryPage.classList = 'mx-auto w-full p-4 pt-0 h-full';
      const gizmoHeaderWrapper = document.createElement('div');
      gizmoHeaderWrapper.style = 'position: sticky; top: 0; z-index: 1000;';

      gizmoHeaderWrapper.classList = 'pb-1 pt-4';

      const gizmoFilterWrapper = document.createElement('div');
      gizmoFilterWrapper.classList = 'flex justify-between items-start';
      // add tabs
      const gizmoDiscoveryTabs = document.createElement('div');
      gizmoDiscoveryTabs.id = 'gizmo-discovery-tabs';
      gizmoDiscoveryTabs.classList = 'flex justify-start gap-2 mb-4';

      gizmoCategories.forEach((category) => {
        const categoryButton = document.createElement('button');
        categoryButton.id = `gizmo-discovery-${category.id}-tab`;
        categoryButton.classList = `btn relative ${category.id === defaultCategory ? 'btn-primary' : 'btn-secondary'}`;
        // add hidden and invisible class to the mine tab
        // if (category.id === 'mine') categoryButton.classList.add('hidden', 'invisible');
        categoryButton.title = category.description;
        categoryButton.style.fontSize = '12px';
        categoryButton.innerHTML = category.title;
        categoryButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          closeMenus();
          if (category.id === 'more_categories') {
            showMoreCategories(currentUserId, hasSubscription);
          } else {
            const moreCategoriesMenus = document.querySelector('#more-categories-menu');
            if (moreCategoriesMenus) moreCategoriesMenus.remove();
            selectedGizmoCategoryId = category.id;
            resetGizmoDiscoveryPage(category.id, hasSubscription);
            fetchGizmos(category.id, currentUserId, hasSubscription);
            setActiveTab(`gizmo-discovery-${category.id}-tab`);
          }
        });
        gizmoDiscoveryTabs.appendChild(categoryButton);
      });

      gizmoFilterWrapper.appendChild(gizmoDiscoveryTabs);
      const gizmoFilterWrapperRight = document.createElement('div');
      gizmoFilterWrapperRight.classList = 'flex justify-end items-start';

      // add sort by
      const sortBySelectorWrapper = document.createElement('div');
      sortBySelectorWrapper.id = 'gizmo-sort-by-selector-wrapper';
      sortBySelectorWrapper.style = 'position:relative;width:155px;z-index:1000;margin-right:12px;';
      sortBySelectorWrapper.innerHTML = dropdown('GPTs-SortBy', gizmoSortByList, gizmoSortByList[0], 'code', 'right');
      gizmoFilterWrapperRight.appendChild(sortBySelectorWrapper);
      // add search bar
      const gizmoSearchBar = document.createElement('div');
      gizmoSearchBar.classList = 'flex justify-start items-center gap-2 mb-4 pe-3';
      gizmoSearchBar.style = 'width: 200px;';
      gizmoSearchBar.innerHTML = '<input id="gizmo-search-bar" class="form-input w-full rounded-md shadow-sm bg-token-main-surface-secondary" type="search" placeholder="Name, author, desc..." />';
      gizmoFilterWrapperRight.appendChild(gizmoSearchBar);
      gizmoFilterWrapper.appendChild(gizmoFilterWrapperRight);
      gizmoHeaderWrapper.appendChild(gizmoFilterWrapper);
      // add description
      const gizmoCategoryDescription = document.createElement('div');
      gizmoCategoryDescription.id = 'gizmo-category-description';
      gizmoCategoryDescription.classList = 'mb-2 text-sm text-token-text-tertiary md:text-base';
      gizmoCategoryDescription.innerText = gizmoCategories.find((category) => category.id === defaultCategory).description;
      gizmoHeaderWrapper.appendChild(gizmoCategoryDescription);

      gizmoDiscoveryPage.innerHTML = '';
      gizmoDiscoveryPage.appendChild(gizmoHeaderWrapper);

      const gizmoGrid = document.createElement('div');
      gizmoGrid.id = 'gizmo-discovery-grid';
      gizmoGrid.style = 'position:relative;display:flex;flex-direction:row;flex-wrap:wrap;justify-content:start;align-items:stretch;height:100%; overflow-y: auto;padding-bottom: 120px;';
      gizmoDiscoveryPage.appendChild(gizmoGrid);

      const gizmoDiscoveryLoading = document.querySelector('#gizmo-discovery-loading');
      if (gizmoDiscoveryLoading) gizmoDiscoveryLoading.remove();

      resetGizmoDiscoveryPage(defaultCategory, hasSubscription);
      addDropdownEventListener('GPTs-SortBy', gizmoSortByList, 'code', (selectedOption) => toggleSortByDropdown(selectedOption, currentUserId, hasSubscription));

      fetchGizmos(defaultCategory, currentUserId, hasSubscription);
      const gizmoSearchBarElement = document.querySelector('#gizmo-search-bar');
      if (gizmoSearchBarElement) {
        gizmoSearchBarElement.addEventListener('input', debounce(() => {
          resetGizmoDiscoveryPage('all', hasSubscription);

          const selectedTab = document.querySelector('#gizmo-discovery-tabs button.btn-primary');
          if (selectedTab.id !== 'gizmo-discovery-all-tab') {
            selectedTab.classList.replace('btn-primary', 'btn-secondary');
            const allGPTsButton = document.querySelector('#gizmo-discovery-all-tab');
            allGPTsButton.classList.replace('btn-secondary', 'btn-primary');
          }
          const gizmoSearchBarValue = gizmoSearchBarElement.value;
          fetchGizmos('all', currentUserId, hasSubscription, true, 1, null, gizmoSearchBarValue);
        }, 500));
      }
    });
  });
  return gizmoDiscoveryPage;
}
// eslint-disable-next-line no-unused-vars
function gizmoManagerModalActions() {
  const actions = document.createElement('div');
  actions.classList = 'flex items-center justify-end w-full mt-2';
  const createGPTButton = document.createElement('button');
  createGPTButton.classList = 'btn btn-primary';
  createGPTButton.innerText = translate('plus Create a GPT');
  createGPTButton.addEventListener('click', () => {
    window.open(`https://${window.location.host}/gpts/editor`, '_self');
  });
  actions.appendChild(createGPTButton);
  return actions;
}
function showMoreCategories(currentUserId, hasSubscription = false) {
  const moreCategoriesButton = document.querySelector('#gizmo-discovery-more_categories-tab');
  if (!moreCategoriesButton) return;
  const { x, y } = moreCategoriesButton.getBoundingClientRect();
  const existingMoreCategoriesMenu = document.querySelector('#more-categories-menu');
  if (existingMoreCategoriesMenu) existingMoreCategoriesMenu.remove();

  const moreCategoriesMenu = document.createElement('div');
  moreCategoriesMenu.id = 'more-categories-menu';
  moreCategoriesMenu.style = `position: fixed; left: 0px; top: 0px; transform: translate3d(${x + 45}px, ${y - 60}px, 0px); min-width: max-content; z-index: 100001;`;
  moreCategoriesMenu.classList = 'bg-token-main-surface-primary shadow-lg rounded-md border border-gray-200 dark:border-gray-600';
  moreCategoriesMenu.innerHTML = '';
  gizmoMoreCategories.forEach((category, index) => {
    if (selectedGizmoCategoryId === category.id) return;
    const categoryButton = document.createElement('button');
    categoryButton.id = `gizmo-discovery-${category.id}-tab`;
    categoryButton.classList = 'block px-4 py-2 text-sm text-token-text-primary w-full text-start hover:bg-token-main-surface-secondary';
    if (index === 0) categoryButton.classList.add('rounded-t-md');
    if (index === gizmoMoreCategories.length - 1) categoryButton.classList.add('rounded-b-md');
    categoryButton.title = category.description;
    categoryButton.innerHTML = category.title;
    categoryButton.addEventListener('click', () => {
      selectedGizmoCategoryId = category.id;
      resetGizmoDiscoveryPage(category.id, hasSubscription);
      fetchGizmos(category.id, currentUserId, hasSubscription);
      setActiveMoreCategoryTab(`gizmo-discovery-${category.id}-tab`);
      closeMoreCategoriesMenu();
      // add type to the end of the url
      if (window.location.pathname !== '/gpts') {
        window.history.pushState({}, '', '/gpts');
      }
    });
    moreCategoriesMenu.appendChild(categoryButton);
  });
  document.body.appendChild(moreCategoriesMenu);
}
function closeMoreCategoriesMenu() {
  const moreCategoriesMenu = document.querySelector('#more-categories-menu');
  if (moreCategoriesMenu) moreCategoriesMenu.remove();
}

function toggleSortByDropdown(selectedOption, currentUserId, hasSubscription = false) {
  gizmoSortBy = selectedOption.code;
  const gizmoSearchBarElement = document.querySelector('#gizmo-search-bar');
  const gizmoSearchBarValue = gizmoSearchBarElement.value;

  fetchGizmos(selectedGizmoCategoryId, currentUserId, hasSubscription, true, 1, null, gizmoSearchBarValue);
}
function resetGizmoDiscoveryPage(gizmoType, hasSubscription = false) {
  const gizmoSearchBarElement = document.querySelector('#gizmo-search-bar');

  const sortBySelectorWrapper = document.querySelector('#gizmo-sort-by-selector-wrapper');
  if (gizmoType === 'all' || (hasSubscription && !['pinned', 'recent', 'mine'].includes(gizmoType))) {
    if (sortBySelectorWrapper) sortBySelectorWrapper.style.display = 'block';
  } else {
    if (gizmoSearchBarElement) gizmoSearchBarElement.value = '';
    if (sortBySelectorWrapper) sortBySelectorWrapper.style.display = 'none';
  }
  gizmoPageNumber = 1;
  gizmoCursor = null;
  noMoreGizmo = false;
}
function setActiveTab(tabId) {
  const gizmoDiscoveryTabs = document.querySelector('#gizmo-discovery-tabs');
  if (!gizmoDiscoveryTabs) return;
  const tabButtons = gizmoDiscoveryTabs.querySelectorAll('button');
  tabButtons.forEach((tabButton) => {
    if (tabButton.id === tabId) {
      tabButton.classList.replace('btn-secondary', 'btn-primary');
    } else {
      tabButton.classList.replace('btn-primary', 'btn-secondary');
    }
  });
  // if button before more categories button is not in gizmoCategories, remove it
  const moreCategoriesButton = document.querySelector('#gizmo-discovery-more_categories-tab');
  if (!moreCategoriesButton) return;
  const buttonBeforeMoreCategoriesButton = moreCategoriesButton.previousElementSibling;
  if (!buttonBeforeMoreCategoriesButton) return;
  if (!gizmoCategories.find((category) => category.id === buttonBeforeMoreCategoriesButton.id.replace('gizmo-discovery-', '').replace('-tab', ''))) {
    buttonBeforeMoreCategoriesButton.remove();
  }
  // update description
  const gizmoCategoryDescription = document.querySelector('#gizmo-category-description');
  if (!gizmoCategoryDescription) return;
  gizmoCategoryDescription.innerText = gizmoCategories.find((category) => category.id === tabId.replace('gizmo-discovery-', '').replace('-tab', '')).description;
}
function setActiveMoreCategoryTab(tabId) {
  const gizmoDiscoveryTabs = document.querySelector('#gizmo-discovery-tabs');
  const tabButtons = gizmoDiscoveryTabs.querySelectorAll('button');
  tabButtons.forEach((tabButton) => {
    tabButton.classList.replace('btn-primary', 'btn-secondary');
  });
  const category = gizmoMoreCategories.find((gc) => gc.id === tabId.replace('gizmo-discovery-', '').replace('-tab', ''));
  const categoryButton = document.createElement('button');
  categoryButton.id = `gizmo-discovery-${category.id}-tab`;
  categoryButton.classList = 'btn relative btn-primary';
  categoryButton.title = category.description;
  categoryButton.style.fontSize = '12px';
  categoryButton.innerHTML = category.title;
  // if button before more categories button is not in gizmoCategories, remove it
  const moreCategoriesButton = document.querySelector('#gizmo-discovery-more_categories-tab');
  if (!moreCategoriesButton) return;
  const buttonBeforeMoreCategoriesButton = moreCategoriesButton.previousElementSibling;
  if (!buttonBeforeMoreCategoriesButton) return;
  if (!gizmoCategories.find((gc) => gc.id === buttonBeforeMoreCategoriesButton.id.replace('gizmo-discovery-', '').replace('-tab', ''))) {
    buttonBeforeMoreCategoriesButton.remove();
  }
  // add right before the more categories button
  if (!moreCategoriesButton) return;
  moreCategoriesButton.insertAdjacentElement('beforebegin', categoryButton);
  // update description
  const gizmoCategoryDescription = document.querySelector('#gizmo-category-description');
  if (!gizmoCategoryDescription) return;
  gizmoCategoryDescription.innerText = category.description;
}

function fetchGizmosFromSuperpower(gizmoType, currentUserId, hasSubscription = false, newPage = true, pageNumber = null, searchTerm = null) {
  const detail = {
    sortBy: gizmoSortBy,
    category: gizmoType,
  };
  if (pageNumber) detail.pageNumber = pageNumber;
  if (searchTerm) detail.searchTerm = searchTerm;
  chrome.runtime.sendMessage({
    type: 'getSuperpowerGizmos',
    detail,
  }, (superpowerGizmos) => {
    if (superpowerGizmos.next) {
      gizmoPageNumber += 1;
      noMoreGizmo = false;
    } else {
      noMoreGizmo = true;
    }
    // check if the selected tab id is still the same after fetch is done
    const selectedTabId = document.querySelector('#gizmo-discovery-tabs button.btn-primary')?.id;
    if (selectedTabId !== `gizmo-discovery-${gizmoType}-tab`) return;
    renderGizmoGrid(superpowerGizmos.results, gizmoType, currentUserId, hasSubscription, newPage);
  });
}
function fetchGizmosFromChatGPT(gizmoType, currentUserId, hasSubscription = false, newPage = true, cursor = null) {
  const gizmoGrid = document.querySelector('#gizmo-discovery-grid');
  if (!gizmoGrid) return;
  getGizmoDiscovery(gizmoType, cursor).then((gizmoDiscovery) => {
    // render gizmo Discovery section
    if (gizmoDiscovery.list.cursor) {
      noMoreGizmo = false;
      gizmoCursor = gizmoDiscovery.list.cursor;
    } else {
      noMoreGizmo = true;
    }
    const discoveryGizmos = gizmoDiscovery.list.items.map((item) => item.resource.gizmo);
    if (selectedGizmoCategoryId !== gizmoType) return;
    renderGizmoGrid(discoveryGizmos, gizmoType, currentUserId, hasSubscription, newPage);
  }, () => {
    if (newPage) {
      gizmoGrid.innerHTML = '<div class="w-full h-full inset-0 flex items-center justify-center text-white">Something went wrong. Please try again!</div>';
    } else {
      const loadMoreButton = document.querySelector('#load-more-button');
      if (loadMoreButton) {
        loadMoreButton.innerHTML = '<div class="w-full h-full inset-0 flex items-center justify-center text-white">Something went wrong. Please try again!</div>';
        loadMoreButton.style.pointerEvents = 'default';
      }
    }
  });
}
function fetchGizmoPinned(currentUserId, hasSubscription, newPage = true) {
  const gizmoGrid = document.querySelector('#gizmo-discovery-grid');
  if (!gizmoGrid) return;
  getGizmosBootstrap(false).then((gizmosBootstrap) => {
    noMoreGizmo = true;
    const pinnedGizmos = gizmosBootstrap?.gizmos?.map((item) => item.resource.gizmo) || [];
    renderGizmoGrid(pinnedGizmos, 'pinned', currentUserId, hasSubscription, newPage);
  }, () => {
    if (newPage) {
      gizmoGrid.innerHTML = '<div class="w-full h-full inset-0 flex items-center justify-center text-white">Something went wrong. Please try again!</div>';
    } else {
      const loadMoreButton = document.querySelector('#load-more-button');
      if (loadMoreButton) {
        loadMoreButton.innerHTML = '<div class="w-full h-full inset-0 flex items-center justify-center text-white">Something went wrong. Please try again!</div>';
        loadMoreButton.style.pointerEvents = 'default';
      }
    }
  });
}
function fetchGizmos(gizmoType, currentUserId, hasSubscription = false, newPage = true, pageNumber = null, cursor = null, searchTerm = null) {
  if (!pageNumber) {
    gizmoPageNumber = 1;
    noMoreGizmo = false;
  }
  if (!cursor) {
    gizmoCursor = null;
    noMoreGizmo = false;
  }

  const searchbar = document.querySelector('#gizmo-search-bar');
  if (searchbar) searchbar.value = searchTerm || '';
  const gizmoGrid = document.querySelector('#gizmo-discovery-grid');
  if (!gizmoGrid) return;
  // add loading spinner
  if (newPage) {
    gizmoGrid.innerHTML = '<div id="gizmo-discovery-loading" class="w-full h-full inset-0 flex items-center justify-center text-white"><svg x="0" y="0" viewbox="0 0 40 40" class="spinner icon-xl"><circle fill="transparent" stroke="#ffffff50" stroke-width="2" stroke-linecap="round" stroke-dasharray="125.6" cx="20" cy="20" r="18"></circle></svg></div>';
  }

  if (hasSubscription) {
    if (['recent', 'mine'].includes(gizmoType)) {
      fetchGizmosFromChatGPT(gizmoType, currentUserId, hasSubscription, newPage, cursor);
    } else if (gizmoType === 'pinned') {
      fetchGizmoPinned(currentUserId, hasSubscription, newPage);
    } else {
      fetchGizmosFromSuperpower(gizmoType, currentUserId, hasSubscription, newPage, pageNumber, searchTerm);
    }
  } else {
    if (gizmoType === 'all') {
      gizmoGrid.innerHTML = `<div class="absolute z-10 w-full h-full inset-0 flex items-center flex-wrap justify-center text-token-text-primary m-auto mt-4 mb-4" style="max-width:400px; max-height:200px;"><div>Get access to the full list of more than 100,000 Custom GPTs with the ability to search and sort right from inside ChatGPT. <a href="https://www.youtube.com/watch?v=q1VUONah6fE&ab_channel=Superpower" target="_blank" class="underline text-gold" rel="noreferrer">Learn more</a></div> <button id="upgrade-to-pro-button-gpt-store" class="flex flex-wrap p-1 items-center rounded-md bg-gold hover:bg-gold-dark transition-colors duration-200 text-black cursor-pointer text-sm m-4 font-bold" style="width: 230px;"><div class="flex w-full"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" style="width:20px; height:20px; margin-right:6px;position:relative; top:10px;" stroke="purple" fill="purple"><path d="M240.5 224H352C365.3 224 377.3 232.3 381.1 244.7C386.6 257.2 383.1 271.3 373.1 280.1L117.1 504.1C105.8 513.9 89.27 514.7 77.19 505.9C65.1 497.1 60.7 481.1 66.59 467.4L143.5 288H31.1C18.67 288 6.733 279.7 2.044 267.3C-2.645 254.8 .8944 240.7 10.93 231.9L266.9 7.918C278.2-1.92 294.7-2.669 306.8 6.114C318.9 14.9 323.3 30.87 317.4 44.61L240.5 224z"></path></svg> Upgrade to Pro</div><div style="font-size:10px;font-weight:400;margin-left:28px;" class="flex w-full">GPT Store, Image Gallery, Voice & more</div></button></div>${blurredList()}`;
      const upgradeToProButton = document.querySelector('#upgrade-to-pro-button-gpt-store');
      if (upgradeToProButton) {
        upgradeToProButton.addEventListener('click', () => {
          openUpgradeModal(hasSubscription);
        });
      }
    } else {
      fetchGizmosFromChatGPT(gizmoType, currentUserId, hasSubscription, newPage, cursor);
    }
  }
}

function renderGizmoGrid(gizmos, gizmoType, currentUserId, hasSubscription = false, newPage = true) {
  const gizmoGrid = document.querySelector('#gizmo-discovery-grid');
  if (!gizmoGrid) return;
  if (newPage) {
    gizmoGrid.innerHTML = '';
  } else {
    const loadMoreButton = document.querySelector('#load-more-button');
    if (loadMoreButton) {
      loadMoreButton.parentElement.remove();
    }
  }
  if (newPage && (!gizmos || gizmos.length === 0)) {
    gizmoGrid.innerHTML = `<div class="w-full h-full inset-0 flex items-center justify-center text-token-text-primary text-center">${gizmoType === 'mine' ? 'You have not created a GPT yet. <br/>Customize a version of ChatGPT for a specific purpose' : 'No GPT found.'}</div>`;
    return;
  }
  const existingGizmoCards = document.querySelectorAll('[id^="gizmo-card-"]');
  const existingGizmoIds = [];
  existingGizmoCards.forEach((gizmoCard) => {
    existingGizmoIds.push(gizmoCard.id.replace('gizmo-card-', ''));
  });
  const newGizmoIds = gizmos?.map((gizmo) => gizmo.id).filter((gizmoId) => !existingGizmoIds.includes(gizmoId)) || [];
  gizmos?.forEach((gizmo) => {
    if (existingGizmoIds.includes(gizmo.id)) return;
    const isDraft = gizmo?.live_version === 0;

    const gizmoCardWrapper = document.createElement('div');
    // a grid of gizmo cards, max 4 per row, each card has a left aligned square picture with rounded corner, name, and description, author name wrapped in a link if exist. Each card has id = gizmo_id.
    gizmoCardWrapper.classList = 'flex flex-col w-full justify-start items-start gap-2 pe-3 pb-3 h-max';
    gizmoCardWrapper.style = 'max-width:25%;height: max-content;';
    const creatorElement = gizmo.author.link_to ? `<a class="break-all hover:text-green-500 hover:underline" href="${gizmo.author.link_to}" target="_blank" class="underline">${gizmo.author.display_name}</a>` : gizmo.author.display_name;
    const numConversationsStr = gizmo?.vanity_metrics?.num_conversations_str || '';
    const categories = selectedGizmoCategoryId === 'all' || (hasSubscription && !['mine'].includes(selectedGizmoCategoryId))
      ? gizmo?.display?.categories?.map((cid) => [...gizmoCategories, ...gizmoMoreCategories].find((gc) => gc.id === cid)).filter((cat) => cat && cat.id !== selectedGizmoCategoryId) || []
      : [];

    gizmoCardWrapper.innerHTML = `
      <div id="gizmo-card-${gizmo.id}" class="relative flex flex-col w-full h-full justify-start items-start gap-2 p-4 cursor-pointer bg-token-main-surface-primary border border-token-border-medium hover:bg-token-main-surface-secondary hover:shadow-xl rounded-xl">
        <button id="gizmo-card-menu-${gizmo.id}" class="absolute top-0 end-0 flex w-9 h-9 items-center justify-center rounded-lg text-token-text-tertiary transition hover:text-token-text-tertiary radix-state-open:text-token-text-tertiary hover:bg-token-sidebar-surface-tertiary" type="button" aria-haspopup="menu" aria-expanded="false" data-state="closed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md relative"><path fill-rule="evenodd" clip-rule="evenodd" d="M3 12C3 10.8954 3.89543 10 5 10C6.10457 10 7 10.8954 7 12C7 13.1046 6.10457 14 5 14C3.89543 14 3 13.1046 3 12ZM10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12ZM17 12C17 10.8954 17.8954 10 19 10C20.1046 10 21 10.8954 21 12C21 13.1046 20.1046 14 19 14C17.8954 14 17 13.1046 17 12Z" fill="currentColor"></path></svg></button>

        <div class="flex items-start">

          <div class="flex justify-center items-center w-24 h-24 rounded-md bg-gray-200" style="min-width:96px;">
          ${gizmo.display.profile_picture_url ? `<img src="${gizmo.display.profile_picture_url}" class="w-24 h-24 rounded-md border border-gray-300" />` : '<div class="gizmo-shadow-stroke relative flex w-full h-full items-center justify-center rounded-md bg-white text-black"><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="text-token-secondary h-full w-full" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg></div>'}
          </div>

          <div class="flex flex-col h-full justify-between">
            <div class="ms-2 flex w-full items-center gap-1 text-token-text-tertiary text-xs">${gizmo.vanity_metrics.created_ago_str ? `Created<br/>${gizmo.vanity_metrics.created_ago_str}` : ''}</div>

            <div class="ms-2 w-full flex items-center gap-1 text-token-text-tertiary">${(gizmo.author.user_id.split('__')?.[0] === currentUserId.split('__')?.[0]) && isDraft ? 'Draft' : numConversationsStr ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-sm me-1"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.52242 6.53608C9.7871 4.41979 12.1019 3 14.75 3C18.7541 3 22 6.24594 22 10.25C22 11.9007 21.4474 13.4239 20.5183 14.6425L21.348 15.97C21.5407 16.2783 21.5509 16.6668 21.3746 16.9848C21.1984 17.3027 20.8635 17.5 20.5 17.5H15.4559C14.1865 19.5963 11.883 21 9.25 21C9.18896 21 9.12807 20.9992 9.06735 20.9977C9.04504 20.9992 9.02258 21 9 21H3.5C3.13647 21 2.80158 20.8027 2.62536 20.4848C2.44913 20.1668 2.45933 19.7783 2.652 19.47L3.48171 18.1425C2.55263 16.9239 2 15.4007 2 13.75C2 9.99151 4.85982 6.90116 8.52242 6.53608ZM10.8938 6.68714C14.106 7.43177 16.5 10.3113 16.5 13.75C16.5 14.3527 16.4262 14.939 16.2871 15.5H18.6958L18.435 15.0828C18.1933 14.6961 18.2439 14.1949 18.5579 13.8643C19.4525 12.922 20 11.651 20 10.25C20 7.35051 17.6495 5 14.75 5C13.2265 5 11.8535 5.64888 10.8938 6.68714ZM8.89548 19C8.94178 18.9953 8.98875 18.9938 9.03611 18.9957C9.107 18.9986 9.17831 19 9.25 19C11.3195 19 13.1112 17.8027 13.9668 16.0586C14.3079 15.363 14.5 14.5804 14.5 13.75C14.5 10.8505 12.1495 8.5 9.25 8.5C9.21772 8.5 9.18553 8.50029 9.15341 8.50087C6.2987 8.55218 4 10.8828 4 13.75C4 15.151 4.54746 16.422 5.44215 17.3643C5.75613 17.6949 5.80666 18.1961 5.56498 18.5828L5.30425 19H8.89548Z" fill="currentColor"></path></svg><div title="Number of conversations" class="text-sm flex">${numConversationsStr}</div>` : ''}</div>              
          </div>
        </div>
        
        <div class="text-lg"><div style="white-space: break-spaces; overflow-wrap: break-word;display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;word-break:break-word;">${gizmo.display.name || 'Untitled'}</div></div>
        
        <div class="text-sm text-token-text-tertiary" style="min-height:80px; white-space: break-spaces; overflow-wrap: break-word;display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;word-break:break-word;">${gizmo.display.description || '...'}</div>
        
        <div style="min-height:22px;" class="mt-1 flex items-center gap-1 text-token-text-tertiary">${categories.slice(0, 2).map((category) => `<div id="category-tag-${category.id}" style='font-size:11px;' class="border rounded-full border-token-border-medium hover:border-green-500 hover:cursor-pointer hover:text-green-500 px-2">${category.title}</div>`).join('')}</div>

        <div class="flex items-center gap-1 text-token-text-tertiary h-5"><div class="text-sm text-token-text-tertiary" style="white-space: break-spaces; overflow-wrap: break-word;display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;">${gizmo.author.display_name ? `By ${creatorElement}` : ''}</div></div>
        ${gizmoType === 'mine' ? `
        
          ${gizmo.share_recipient === 'private' ? '<div style="position:absolute;bottom:20px;right:8px;" title="Private GPT - Only you can see this GPT"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" stroke="#ef4146cc" fill="#ef4146cc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3" height="1em" width="1em"><path d="M80 192V144C80 64.47 144.5 0 224 0C303.5 0 368 64.47 368 144V192H384C419.3 192 448 220.7 448 256V448C448 483.3 419.3 512 384 512H64C28.65 512 0 483.3 0 448V256C0 220.7 28.65 192 64 192H80zM144 192H304V144C304 99.82 268.2 64 224 64C179.8 64 144 99.82 144 144V192z"/></svg></div>' : ''}
          ${gizmo.share_recipient === 'link' ? '<div style="position:absolute;bottom:16px;right:8px;" title="Anyone with the link can use this GPT"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" stroke="#e06c2b" fill="#e06c2b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em"><path d="M172.5 131.1C228.1 75.51 320.5 75.51 376.1 131.1C426.1 181.1 433.5 260.8 392.4 318.3L391.3 319.9C381 334.2 361 337.6 346.7 327.3C332.3 317 328.9 297 339.2 282.7L340.3 281.1C363.2 249 359.6 205.1 331.7 177.2C300.3 145.8 249.2 145.8 217.7 177.2L105.5 289.5C73.99 320.1 73.99 372 105.5 403.5C133.3 431.4 177.3 435 209.3 412.1L210.9 410.1C225.3 400.7 245.3 404 255.5 418.4C265.8 432.8 262.5 452.8 248.1 463.1L246.5 464.2C188.1 505.3 110.2 498.7 60.21 448.8C3.741 392.3 3.741 300.7 60.21 244.3L172.5 131.1zM467.5 380C411 436.5 319.5 436.5 263 380C213 330 206.5 251.2 247.6 193.7L248.7 192.1C258.1 177.8 278.1 174.4 293.3 184.7C307.7 194.1 311.1 214.1 300.8 229.3L299.7 230.9C276.8 262.1 280.4 306.9 308.3 334.8C339.7 366.2 390.8 366.2 422.3 334.8L534.5 222.5C566 191 566 139.1 534.5 108.5C506.7 80.63 462.7 76.99 430.7 99.9L429.1 101C414.7 111.3 394.7 107.1 384.5 93.58C374.2 79.2 377.5 59.21 391.9 48.94L393.5 47.82C451 6.731 529.8 13.25 579.8 63.24C636.3 119.7 636.3 211.3 579.8 267.7L467.5 380z"/></svg></div>' : ''}
          ${gizmo.share_recipient === 'marketplace' ? '<div style="position:absolute;bottom:16px;right:8px;" title="Public GPT - Your GPT will appear in the GPT Store"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" stroke="#19c37d" fill="#19c37d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em"><path d="M319.9 320c57.41 0 103.1-46.56 103.1-104c0-57.44-46.54-104-103.1-104c-57.41 0-103.1 46.56-103.1 104C215.9 273.4 262.5 320 319.9 320zM369.9 352H270.1C191.6 352 128 411.7 128 485.3C128 500.1 140.7 512 156.4 512h327.2C499.3 512 512 500.1 512 485.3C512 411.7 448.4 352 369.9 352zM512 160c44.18 0 80-35.82 80-80S556.2 0 512 0c-44.18 0-80 35.82-80 80S467.8 160 512 160zM183.9 216c0-5.449 .9824-10.63 1.609-15.91C174.6 194.1 162.6 192 149.9 192H88.08C39.44 192 0 233.8 0 285.3C0 295.6 7.887 304 17.62 304h199.5C196.7 280.2 183.9 249.7 183.9 216zM128 160c44.18 0 80-35.82 80-80S172.2 0 128 0C83.82 0 48 35.82 48 80S83.82 160 128 160zM551.9 192h-61.84c-12.8 0-24.88 3.037-35.86 8.24C454.8 205.5 455.8 210.6 455.8 216c0 33.71-12.78 64.21-33.16 88h199.7C632.1 304 640 295.6 640 285.3C640 233.8 600.6 192 551.9 192z"/></svg></div>' : ''}
        ` : ''}
      </div>
    `;
    gizmoGrid.appendChild(gizmoCardWrapper);
  });
  // add a card at the end that says load more
  if (!noMoreGizmo) {
    const loadMoreCard = document.createElement('div');
    loadMoreCard.classList = 'flex flex-col w-full justify-start items-start gap-2 pe-3 pb-3';
    loadMoreCard.style = 'max-width:25%;height: 314px;';
    loadMoreCard.innerHTML = '<div id="load-more-button" class="relative flex flex-col w-full h-full justify-center items-center gap-2 p-4 text-token-text-tertiary text-3xl font-bold cursor-pointer bg-token-main-surface-secondary hover:bg-token-main-surface-tertiary hover:shadow-xl rounded-xl">Load more...</div>';
    gizmoGrid.appendChild(loadMoreCard);
  }
  // add event listeners
  const gizmoCards = gizmoGrid.querySelectorAll('div[id^=gizmo-card-]');
  gizmoCards?.forEach((gizmoCard) => {
    const gizmoId = gizmoCard.id.split('gizmo-card-')[1];
    if (!newGizmoIds?.includes(gizmoId)) return;
    const gizmoData = gizmos.find((gizmo) => gizmo.id === gizmoId);
    // const gizmoResource = { gizmo: gizmoData };
    const isDraft = gizmoData.live_version === 0;
    const gizmoCardMenuButton = gizmoCard.querySelector(`#gizmo-card-menu-${gizmoId}`);
    if (gizmoCardMenuButton) {
      gizmoCardMenuButton.addEventListener('click', async (e) => {
        e.stopPropagation();
        const existingGizmoCardMenuElement = document.querySelector('#gizmo-card-menu');
        if (existingGizmoCardMenuElement) {
          existingGizmoCardMenuElement.remove();
        } else {
          // add menuto gizmo card
          const gizmoCardMenuElement = await gizmoCardMenu(gizmoData, currentUserId);
          gizmoCard.insertAdjacentHTML('beforeend', gizmoCardMenuElement);
          gizmoCardMenuEventListener(gizmoId);
          const curGizmoCardMenuElement = document.querySelector('#gizmo-card-menu');
          if (curGizmoCardMenuElement) {
            curGizmoCardMenuElement.addEventListener('click', (event) => {
              event.stopPropagation();
              closeMenus();
            });
            curGizmoCardMenuElement.addEventListener('mouseleave', () => {
              curGizmoCardMenuElement.remove();
            });
          }
        }
      });
    }
    const categoryTags = gizmoCard.querySelectorAll('[id^=category-tag-]');
    categoryTags?.forEach((categoryTag) => {
      categoryTag.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeMenus();
        const categoryId = categoryTag.id.replace('category-tag-', '');
        selectedGizmoCategoryId = categoryId;
        resetGizmoDiscoveryPage(categoryId, hasSubscription);
        fetchGizmos(categoryId, currentUserId, hasSubscription);
        if (gizmoCategories.find((gc) => gc.id === categoryId)) {
          setActiveTab(`gizmo-discovery-${categoryId}-tab`);
        } else {
          setActiveTab('gizmo-discovery-more_categories-tab');
          setActiveMoreCategoryTab(`gizmo-discovery-${categoryId}-tab`);
        }
      });
    });
    gizmoCard.addEventListener('click', (e) => {
      // if target is link or button, return
      if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;
      if (e.target.id.startsWith('category-tag-')) return;
      // if (e.metaKey || (isWindows() && e.ctrlKey)) {
      //   window.open(`https://${window.location.host}/g/${gizmoResource.gizmo?.short_url}`, '_blank');
      //   return;
      // }
      if (isDraft) {
        window.open(`https://${window.location.host}/gpts/editor/${gizmoId}`, '_blank');
      } else {
        // window.older: selectedPromptEditorCategory.idpen(`https://${window.location.host}/g/${gizmoResource.gizmo?.short_url}`, '_blank');
        getGizmoAbout(gizmoId).then((gizmoAbout) => {
          showGizmoAboutDialog(gizmoAbout, true);
        });
      }
      chrome.runtime.sendMessage({
        type: 'updateGizmoMetrics',
        detail: {
          gizmoId: gizmoData?.id,
          metricName: 'num_users_interacted_with',
        },
      });
    });
  });
  const loadMoreButton = document.querySelector('#load-more-button');
  if (loadMoreButton) {
    loadMoreButton.addEventListener('click', () => {
      loadMoreButton.innerHTML = '<div class="w-full h-full inset-0 flex items-center justify-center text-white"><svg x="0" y="0" viewbox="0 0 40 40" class="spinner icon-xl"><circle fill="transparent" stroke="#ffffff50" stroke-width="2" stroke-linecap="round" stroke-dasharray="125.6" cx="20" cy="20" r="18"></circle></svg></div>';
      loadMoreButton.style.pointerEvents = 'none';
      const gizmoDiscoveryTabs = document.querySelector('#gizmo-discovery-tabs');
      if (!gizmoDiscoveryTabs) return;
      const searthTerm = document.querySelector('#gizmo-search-bar')?.value;
      fetchGizmos(gizmoType, currentUserId, hasSubscription, false, gizmoPageNumber, gizmoCursor, searthTerm);
    });
    // add an observer to click the load more button when it is visible
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMoreButton.click();
      }
    }, { threshold: 0.5 });
    observer.observe(loadMoreButton);
  }
}
function gizmoCardMenu(gizmo, currentUserId) {
  return getGizmosBootstrap(false).then((gizmosBootstrap) => {
    const isDraft = gizmo.live_version === 0;

    const gizmoExistInSidebar = [...gizmosBootstrap.gizmos].find((g) => g?.resource?.gizmo?.id === gizmo.id);

    return `<div id="gizmo-card-menu" class="absolute top-0 end-0 mt-2 me-2 w-40 rounded-md shadow-lg p-1 border border-token-border-medium ring-opacity-5 bg-token-main-surface-primary text-token-text-primary"> 
    
    ${gizmo.author.user_id.split('__')?.[0] === currentUserId.split('__')?.[0] ? `<a href="/gpts/editor/${gizmo.id}" target="_self" class="block px-4 py-2 text-sm hover:bg-token-main-surface-secondary" role="menuitem">Edit</a><button id="delete-gizmo-button" class="block w-full flex items-start px-4 py-2 text-sm hover:bg-token-main-surface-secondary" role="menuitem">Delete</button>` : ''} 
    
    ${isDraft ? '' : `<button id="gizmo-card-${gizmoExistInSidebar ? 'hide-from' : 'add-to'}-sidebar" class="block w-full flex items-start px-4 py-2 text-sm hover:bg-token-main-surface-secondary" role="menuitem">${gizmoExistInSidebar ? 'Hide from sidebar' : 'Add to sidebar'}</button>`} 
    
    ${isDraft ? '' : '<button id="gizmo-card-about" class="block w-full flex items-start px-4 py-2 text-sm hover:bg-token-main-surface-secondary" role="menuitem">About</button>'}
 
    </div>`;
  });
}
function gizmoCardMenuEventListener(gizmoId) {
  const gizmoCardMenuElement = document.querySelector('#gizmo-card-menu');
  if (gizmoCardMenuElement) {
    // delete gizmo
    const deleteButton = gizmoCardMenuElement.querySelector('#delete-gizmo-button');
    if (deleteButton) {
      deleteButton.addEventListener('click', () => {
        showConfirmDialog('Delete GPT', 'Are you sure you want to delete this GPT? This cannot be undone.', 'Cancel', 'Delete GPT', null, () => {
          // delete gizmo
          deleteGizmo(gizmoId);
          toast('GPT deleted successfully!', 'success');
          // remove gizmoe card
          const gizmoCard = document.querySelector(`#gizmo-card-${gizmoId}`);
          if (gizmoCard) gizmoCard.parentElement.remove();
          // remove from sidebar if it exists
          const gptList = document.querySelector('#gpt-list');
          const gizmoItem = gptList?.querySelector(`a[href*="${gizmoId}"]`)?.parentElement;
          if (!gizmoItem) return;
          // const gptListRecentBorder = document.querySelector('#gpt-list-recent-border');
          gizmoItem.remove();
          // if (gptListRecentBorder?.nextElementSibling?.id === 'gpt-list-explore-button') {
          //   gptListRecentBorder?.remove();
          // }
        });
      });
    }
    // add to sidebar
    const addToSidebarButton = gizmoCardMenuElement.querySelector('#gizmo-card-add-to-sidebar');
    if (addToSidebarButton) {
      addToSidebarButton.addEventListener('click', () => {
        gizmoCardMenuElement.remove();
        updateGizmoSidebar(gizmoId, 'keep');
        chrome.runtime.sendMessage({
          type: 'updateGizmoMetrics',
          detail: {
            gizmoId,
            metricName: 'num_pins',
            direction: 'up',
          },
        });
      });
    }
    // hide from sidebar
    const hideFromSidebarButton = gizmoCardMenuElement.querySelector('#gizmo-card-hide-from-sidebar');
    if (hideFromSidebarButton) {
      hideFromSidebarButton.addEventListener('click', () => {
        gizmoCardMenuElement.remove();

        updateGizmoSidebar(gizmoId, 'hide');
        chrome.runtime.sendMessage({
          type: 'updateGizmoMetrics',
          detail: {
            gizmoId,
            metricName: 'num_pins',
            direction: 'down',
          },
        });
      });
    }
    // about
    const aboutButton = gizmoCardMenuElement.querySelector('#gizmo-card-about');
    if (aboutButton) {
      aboutButton.addEventListener('click', () => {
        gizmoCardMenuElement.remove();
        getGizmoAbout(gizmoId).then((gizmoAbout) => {
          showGizmoAboutDialog(gizmoAbout, true);
        });
      });
    }
  }
}
function blurredList() {
  return '<div style="display: flex;flex-flow: wrap;justify-content: start;align-items: stretch;filter: blur(12px); pointer-events: none;"><div class="flex flex-col w-full justify-start items-start gap-2 pe-3 pb-3" style="max-width: 25%;"> <div class="flex flex-col w-full h-full justify-start items-start gap-2 p-4 cursor-pointer bg-black/50 hover:bg-black hover:shadow-xl rounded-xl"> <div class="flex justify-center items-center w-24 h-24 rounded-md bg-gray-200"> <img src="https://files.oaiusercontent.com/file-SxYQO0Fq1ZkPagkFtg67DRVb?se=2123-10-12T23%3A57%3A32Z&amp;sp=r&amp;sv=2021-08-06&amp;sr=b&amp;rscc=max-age%3D31536000%2C%20immutable&amp;rscd=attachment%3B%20filename%3Dagent_3.webp&amp;sig=pLlQh8oUktqQzhM09SDDxn5aakqFuM2FAPptuA0mbqc%3D" class="w-24 h-24 rounded-md border border-gray-300"> </div> <div class="text-lg font-bold">DALL·E</div> <div class="text-sm" style="min-height:80px; white-space: break-spaces; overflow-wrap: break-word;display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;word-break:break-word;">Let me turn your imagination into imagery</div> <div class="mt-1 flex items-center gap-1 text-token-text-tertiary"><div class="text-sm text-token-text-tertiary" style="white-space: break-spaces; overflow-wrap: break-word;display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;word-break:break-word;">By ChatGPT</div></div> </div> </div><div class="flex flex-col w-full justify-start items-start gap-2 pe-3 pb-3" style="max-width: 25%;"> <div class="flex flex-col w-full h-full justify-start items-start gap-2 p-4 cursor-pointer bg-black/50 hover:bg-black hover:shadow-xl rounded-xl"> <div class="flex justify-center items-center w-24 h-24 rounded-md bg-gray-200"> <img src="https://files.oaiusercontent.com/file-id374Jq85g2WfDgpuOdAMTEk?se=2123-10-13T00%3A31%3A06Z&amp;sp=r&amp;sv=2021-08-06&amp;sr=b&amp;rscc=max-age%3D31536000%2C%20immutable&amp;rscd=attachment%3B%20filename%3Dagent_2.png&amp;sig=qFnFnFDVevdJL3xvtDE8vysDpTQmkSlF1zhYLAMiqmM%3D" class="w-24 h-24 rounded-md border border-gray-300"> </div> <div class="text-lg font-bold">Data Analysis</div> <div class="text-sm" style="min-height:80px; white-space: break-spaces; overflow-wrap: break-word;display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;word-break:break-word;">Drop in any files and I can help analyze and visualize your data</div> <div class="mt-1 flex items-center gap-1 text-token-text-tertiary"><div class="text-sm text-token-text-tertiary" style="white-space: break-spaces; overflow-wrap: break-word;display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;word-break:break-word;">By ChatGPT</div></div> </div> </div><div class="flex flex-col w-full justify-start items-start gap-2 pe-3 pb-3" style="max-width: 25%;"> <div class="flex flex-col w-full h-full justify-start items-start gap-2 p-4 cursor-pointer bg-black/50 hover:bg-black hover:shadow-xl rounded-xl"> <div class="flex justify-center items-center w-24 h-24 rounded-md bg-gray-200"> <img src="https://files.oaiusercontent.com/file-i9IUxiJyRubSIOooY5XyfcmP?se=2123-10-13T01%3A11%3A31Z&amp;sp=r&amp;sv=2021-08-06&amp;sr=b&amp;rscc=max-age%3D31536000%2C%20immutable&amp;rscd=attachment%3B%20filename%3Dgpt-4.jpg&amp;sig=ZZP%2B7IWlgVpHrIdhD1C9wZqIvEPkTLfMIjx4PFezhfE%3D" class="w-24 h-24 rounded-md border border-gray-300"> </div> <div class="text-lg font-bold">ChatGPT Classic</div> <div class="text-sm" style="min-height:80px; white-space: break-spaces; overflow-wrap: break-word;display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;word-break:break-word;">The latest version of GPT-4 with no additional capabilities</div> <div class="mt-1 flex items-center gap-1 text-token-text-tertiary"><div class="text-sm text-token-text-tertiary" style="white-space: break-spaces; overflow-wrap: break-word;display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;word-break:break-word;">By ChatGPT</div></div> </div> </div><div class="flex flex-col w-full justify-start items-start gap-2 pe-3 pb-3" style="max-width: 25%;"> <div class="flex flex-col w-full h-full justify-start items-start gap-2 p-4 cursor-pointer bg-black/50 hover:bg-black hover:shadow-xl rounded-xl"> <div class="flex justify-center items-center w-24 h-24 rounded-md bg-gray-200"> <img src="https://files.oaiusercontent.com/file-JxYoHzuJQ2TXHBYy6UGC4Xs8?se=2123-10-13T00%3A46%3A49Z&amp;sp=r&amp;sv=2021-08-06&amp;sr=b&amp;rscc=max-age%3D31536000%2C%20immutable&amp;rscd=attachment%3B%20filename%3Dc0bba883-a507-42dd-acfd-211509efd97c.png&amp;sig=jZeFDXgC4ZbNC8mVNuQK7zeKS7ssRCh5QTlqa81WJEM%3D" class="w-24 h-24 rounded-md border border-gray-300"> </div> <div class="text-lg font-bold">Game Time</div> <div class="text-sm" style="min-height:80px; white-space: break-spaces; overflow-wrap: break-word;display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;word-break:break-word;">I can quickly explain board games  or card games to players of any age. Let the games begin!</div> <div class="mt-1 flex items-center gap-1 text-token-text-tertiary"><div class="text-sm text-token-text-tertiary" style="white-space: break-spaces; overflow-wrap: break-word;display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;word-break:break-word;">By ChatGPT</div></div> </div> </div><div class="flex flex-col w-full justify-start items-start gap-2 pe-3 pb-3" style="max-width: 25%;"> <div class="flex flex-col w-full h-full justify-start items-start gap-2 p-4 cursor-pointer bg-black/50 hover:bg-black hover:shadow-xl rounded-xl"> <div class="flex justify-center items-center w-24 h-24 rounded-md bg-gray-200"> <img src="https://files.oaiusercontent.com/file-MjvVb8L9Se5PdSC1gMLopCHh?se=2123-10-13T00%3A50%3A51Z&amp;sp=r&amp;sv=2021-08-06&amp;sr=b&amp;rscc=max-age%3D31536000%2C%20immutable&amp;rscd=attachment%3B%20filename%3Dnegotiator.png&amp;sig=GDq28k4lIHIZbvXfm9PjQerwO1kGUnkNn6a5aQD/7/M%3D" class="w-24 h-24 rounded-md border border-gray-300"> </div> <div class="text-lg font-bold">The Negotiator</div> <div class="text-sm" style="min-height:80px; white-space: break-spaces; overflow-wrap: break-word;display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;word-break:break-word;">I’ll help you advocate for yourself  and get better outcomes. Become a great negotiator.</div> <div class="mt-1 flex items-center gap-1 text-token-text-tertiary"><div class="text-sm text-token-text-tertiary" style="white-space: break-spaces; overflow-wrap: break-word;display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;word-break:break-word;">By ChatGPT</div></div> </div> </div><div class="flex flex-col w-full justify-start items-start gap-2 pe-3 pb-3" style="max-width: 25%;"> <div class="flex flex-col w-full h-full justify-start items-start gap-2 p-4 cursor-pointer bg-black/50 hover:bg-black hover:shadow-xl rounded-xl"> <div class="flex justify-center items-center w-24 h-24 rounded-md bg-gray-200"> <img src="https://files.oaiusercontent.com/file-KSheuuQR8UjcxzFjjSfjfEOP?se=2123-10-13T00%3A52%3A56Z&amp;sp=r&amp;sv=2021-08-06&amp;sr=b&amp;rscc=max-age%3D31536000%2C%20immutable&amp;rscd=attachment%3B%20filename%3Dcreative-writing.png&amp;sig=MA3AFe4yhExdlgBje00y4%2BCLHpBkJ%2BUQKkiwknp46as%3D" class="w-24 h-24 rounded-md border border-gray-300"> </div> <div class="text-lg font-bold">Creative Writing Coach</div> <div class="text-sm" style="min-height:80px; white-space: break-spaces; overflow-wrap: break-word;display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;word-break:break-word;">I’m eager to read your work  and give you feedback to improve your skills.</div> <div class="mt-1 flex items-center gap-1 text-token-text-tertiary"><div class="text-sm text-token-text-tertiary" style="white-space: break-spaces; overflow-wrap: break-word;display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;word-break:break-word;">By ChatGPT</div></div> </div> </div><div class="flex flex-col w-full justify-start items-start gap-2 pe-3 pb-3" style="max-width: 25%;"> <div class="flex flex-col w-full h-full justify-start items-start gap-2 p-4 cursor-pointer bg-black/50 hover:bg-black hover:shadow-xl rounded-xl"> <div class="flex justify-center items-center w-24 h-24 rounded-md bg-gray-200"> <img src="https://files.oaiusercontent.com/file-M12eDkWHmobmgj5mhcWkMMVI?se=2123-10-13T07%3A48%3A21Z&amp;sp=r&amp;sv=2021-08-06&amp;sr=b&amp;rscc=max-age%3D31536000%2C%20immutable&amp;rscd=attachment%3B%20filename%3D28de0bdd-4c74-45a4-8d52-0fac85aea31a.png&amp;sig=KdG%2BVt6/480jvqtjdwa4DulLX7BRqVN6FQfuuS9QaVI%3D" class="w-24 h-24 rounded-md border border-gray-300"> </div> <div class="text-lg font-bold">Cosmic Dream</div><div class="text-sm" style="min-height:80px; white-space: break-spaces; overflow-wrap: break-word;display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;word-break:break-word;">Visionary painter of digital wonder</div> <div class="mt-1 flex items-center gap-1 text-token-text-tertiary"><div class="text-sm text-token-text-tertiary" style="white-space: break-spaces; overflow-wrap: break-word;display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;word-break:break-word;">By ChatGPT</div></div> </div> </div><div class="flex flex-col w-full justify-start items-start gap-2 pe-3 pb-3" style="max-width: 25%;"> <div class="flex flex-col w-full h-full justify-start items-start gap-2 p-4 cursor-pointer bg-black/50 hover:bg-black hover:shadow-xl rounded-xl"> <div class="flex justify-center items-center w-24 h-24 rounded-md bg-gray-200"> <img src="https://files.oaiusercontent.com/file-soqNFMszjoxK9d3BFD3rAGA5?se=2123-10-13T00%3A53%3A58Z&amp;sp=r&amp;sv=2021-08-06&amp;sr=b&amp;rscc=max-age%3D31536000%2C%20immutable&amp;rscd=attachment%3B%20filename%3DTechSupport.jpg&amp;sig=ztG5CVAIZeK5/C/wQkWdewTJVlXtRmmSRd5Z7XRsJ04%3D" class="w-24 h-24 rounded-md border border-gray-300"> </div> <div class="text-lg font-bold">Tech Support Advisor</div> <div class="text-sm" style="min-height:80px; white-space: break-spaces; overflow-wrap: break-word;display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;word-break:break-word;">From setting up a printer to troubleshooting a device, I’m here to help you step-by-step.</div> <div class="mt-1 flex items-center gap-1 text-token-text-tertiary"><div class="text-sm text-token-text-tertiary" style="white-space: break-spaces; overflow-wrap: break-word;display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;word-break:break-word;">By ChatGPT</div></div></div></div></div>';
}
