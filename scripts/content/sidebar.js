// eslint-disable-next-line no-unused-vars
/* global selectedConversationFolderBreadcrumb:true, createManager, createTooltip, openMoveConvToFolderModal, openExportModal, downloadSelectedImages, translate, defaultConversationFolders, isOnNewChatPage, folderForNewChat:true, debounce, conversationFolderElement, initializePresentation, updateCustomInstructionProfileSelector, elementResizeObserver, errorUpgradeConfirmation, closeMenus, attachConversationToInput, cachedSettings, createSidebarFolderButton */

// eslint-disable-next-line no-unused-vars
function makeSidebarResizable() {
  const existingLimitWidth = document.querySelector('#limit-width');
  if (existingLimitWidth) return;

  const appSidebarWidth = window.localStorage.getItem('sp/appSidebarWidth') || 260;
  const limitWidth = document.querySelector('div[class*="w-[260px]"]');
  if (!limitWidth) return;
  limitWidth.id = 'limit-width';
  limitWidth.style.width = '100%';
  limitWidth.parentElement.classList.add('resize-x');
  limitWidth.parentElement.style.minWidth = `${appSidebarWidth}px`;
  elementResizeObserver(limitWidth.parentElement, 'sp/appSidebarWidth');
}
// eslint-disable-next-line no-unused-vars
function removeUpdateButton() {
  const navs = document.querySelectorAll('nav');
  if (navs.length === 0) return;
  for (let i = 0; i < navs.length; i += 1) {
    const nav = navs[i];
    nav.parentElement.parentElement.style.zIndex = 100000;
    // remove update button
    const updateButton = nav.querySelector('div a svg path[d="M12.5001 3.44338C12.1907 3.26474 11.8095 3.26474 11.5001 3.44338L4.83984 7.28868C4.53044 7.46731 4.33984 7.79744 4.33984 8.1547V15.8453C4.33984 16.2026 4.53044 16.5327 4.83984 16.7113L11.5001 20.5566C11.8095 20.7353 12.1907 20.7353 12.5001 20.5566L19.1604 16.7113C19.4698 16.5327 19.6604 16.2026 19.6604 15.8453V8.1547C19.6604 7.79744 19.4698 7.46731 19.1604 7.28868L12.5001 3.44338ZM10.5001 1.71133C11.4283 1.17543 12.5719 1.17543 13.5001 1.71133L20.1604 5.55663C21.0886 6.09252 21.6604 7.0829 21.6604 8.1547V15.8453C21.6604 16.9171 21.0886 17.9075 20.1604 18.4434L13.5001 22.2887C12.5719 22.8246 11.4283 22.8246 10.5001 22.2887L3.83984 18.4434C2.91164 17.9075 2.33984 16.9171 2.33984 15.8453V8.1547C2.33984 7.0829 2.91164 6.09252 3.83984 5.55663L10.5001 1.71133Z"]');
    if (updateButton) {
      updateButton.closest('a').parentElement.remove();
    }
  }
}
// eslint-disable-next-line no-unused-vars
function makeProjectsCollapsible() {
  const existingProjectListCollapseIcon = document.querySelector('#project-list-expand-collapse-icon');
  if (existingProjectListCollapseIcon) return;
  const projectsHeader = document.querySelector('nav h2[id="snorlax-heading"]');
  if (!projectsHeader) {
    setTimeout(() => {
      makeProjectsCollapsible();
    }, 2000);
    return;
  }
  projectsHeader?.parentElement?.classList?.replace('pt-7', 'pt-2');
  projectsHeader?.classList?.add('cursor-pointer');
  if (projectsHeader?.childNodes?.length > 1) {
    projectsHeader?.lastChild?.classList?.add('ms-auto');
  }
  const projectListState = window.localStorage.getItem('sp/projectListState') || 'show';
  const projectList = projectsHeader?.parentElement?.nextElementSibling;
  if (!projectList) {
    setTimeout(() => {
      makeProjectsCollapsible();
    }, 2000);
    return;
  }
  projectList?.classList?.add('ps-2');
  if (projectListState === 'hide') projectList.classList.add('hidden');
  // replace firstChild
  projectsHeader?.firstChild?.remove();
  projectsHeader?.insertAdjacentHTML('afterbegin', `<button id="project-list-expand-collapse-button" class="flex flex-grow"><svg id="project-list-expand-collapse-icon" style="${projectListState === 'show' ? '' : 'transform: rotate(-90deg);'}" stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="me-2 h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="6 9 12 15 18 9"></polyline></svg> Projects</button>`);
  const projectListCollapseButton = projectsHeader?.querySelector('#project-list-expand-collapse-button');
  projectListCollapseButton?.addEventListener('click', () => {
    // if clicked on the lastchild, return
    const curProjectList = projectsHeader.parentElement.nextElementSibling;
    const curProjectListState = window.localStorage.getItem('sp/projectListState');
    if (!curProjectListState) window.localStorage.setItem('sp/projectListState', 'hide');
    const nextProjectListState = curProjectListState === 'hide' ? 'show' : 'hide';
    window.localStorage.setItem('sp/projectListState', nextProjectListState);
    if (curProjectListState === 'hide') {
      curProjectList.classList.remove('hidden');
    } else {
      curProjectList.classList.add('hidden');
    }
    const curExpandCollapseIcon = projectsHeader.querySelector('#project-list-expand-collapse-icon');
    curExpandCollapseIcon.style = nextProjectListState === 'show' ? '' : 'transform: rotate(-90deg);';
  });
  setTimeout(() => {
    makeProjectsCollapsible();
  }, 2000);
}
// eslint-disable-next-line no-unused-vars
async function reorderGPTList() {
  const existingGPTList = document.querySelector('#gpt-list');
  if (existingGPTList) return;

  // a tag starting with /g/g- but not /g/g-p-
  const firstGPT = document.querySelector('nav div > a[href*="/g/g-"]:not([href*="/g/g-p-"])')?.parentElement;
  if (!firstGPT) {
    setTimeout(() => {
      reorderGPTList();
    }, 2000);
    return;
  }
  const exploreGPTs = document.querySelector('nav a[href="/gpts"]');
  if (!exploreGPTs) {
    setTimeout(() => {
      reorderGPTList();
    }, 2000);
    return;
  }
  const gptList = document.createElement('div');
  gptList.id = 'gpt-list';
  gptList.classList.add('ps-2');

  // add gpt list above first gpt
  firstGPT.insertAdjacentElement('beforebegin', gptList);
  // move everything from firstGPT to exploreGPTs to gptList
  let currentElement = firstGPT;
  while (currentElement && currentElement !== exploreGPTs) {
    gptList.appendChild(currentElement);
    currentElement = gptList.nextElementSibling;
  }
  // move exploreGPTs to gptList
  gptList.appendChild(exploreGPTs);
  // reorder GPTs
  if (cachedSettings?.reorderGPTs) {
    // Get all direct child elements of the container
    const children = Array.from(gptList.children);

    // Sort children based on the 'title' attribute of the <a> tag within each child
    // if no a tag in div, hide it
    children.sort((a, b) => {
      // hide border
      if (a.classList.contains('h-px')) {
        a.classList.add('hidden');
        return 1;
      }
      if (b.classList.contains('h-px')) {
        b.classList.add('hidden');
        return 1;
      }
      // sort by href
      const hrefA = a.querySelector('a')?.href || '';
      const hrefB = b.querySelector('a')?.href || '';
      // if no href, add hidden to the div class and move to bottom
      if (!hrefA) {
        return 1;
      }
      if (!hrefB) {
        return 1;
      }

      //  if the href=/gpts move to last
      // if (hrefA.includes('/gpts')) return 1;
      // if (hrefB.includes('/gpts')) return -1;

      const titleA = a.querySelector('a')?.title.toLowerCase() || '';
      const titleB = b.querySelector('a')?.title.toLowerCase() || '';

      return titleA.localeCompare(titleB);
    });

    // Append the sorted elements back to the container
    children.forEach((child) => gptList.appendChild(child));
  }
  // add expand/collapse button
  const gptListState = window.localStorage.getItem('sp/gptListState');
  if (!gptListState) window.localStorage.setItem('sp/gptListState', 'hide');
  if (gptListState === 'hide') gptList.classList.add('hidden');

  const existingExpandCollapseButton = document.querySelector('#gpt-list-expand-collapse-button');
  if (existingExpandCollapseButton) existingExpandCollapseButton.remove();
  const expandCollapseButton = document.createElement('button');
  expandCollapseButton.id = 'gpt-list-expand-collapse-button';
  expandCollapseButton.classList = 'flex w-full items-center justify-start h-8 px-2 text-xs text-token-text-primary font-semibold cursor-pointer';
  expandCollapseButton.innerHTML = `<svg id="gpt-list-expand-collapse-icon" style="${gptListState === 'show' ? '' : 'transform: rotate(-90deg);'}" stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="me-2 h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="6 9 12 15 18 9"></polyline></svg><span id="gpt-list-expand-collapse-text">GPTs</span>`;
  expandCollapseButton.addEventListener('click', () => {
    const curGPTList = document.querySelector('#gpt-list');
    if (!curGPTList) return;

    const curGPTListState = curGPTList.classList.contains('hidden') ? 'hide' : 'show';
    const nextGPTListState = curGPTListState === 'hide' ? 'show' : 'hide';
    window.localStorage.setItem('sp/gptListState', nextGPTListState);

    curGPTList.classList.toggle('hidden');
    const curExpandCollapseIcon = document.querySelector('#gpt-list-expand-collapse-icon');
    curExpandCollapseIcon.style = nextGPTListState === 'show' ? '' : 'transform: rotate(-90deg);';
  });
  // add expandCollapseButton right before the gpt list
  gptList.parentElement.insertBefore(expandCollapseButton, gptList);
  setTimeout(() => {
    reorderGPTList();
  }, 2000);
}
// eslint-disable-next-line no-unused-vars
function addSearchConversationsButton() {
  const chatgptSearchButton = document.querySelector('button svg path[d="M10.75 4.25C7.16015 4.25 4.25 7.16015 4.25 10.75C4.25 14.3399 7.16015 17.25 10.75 17.25C14.3399 17.25 17.25 14.3399 17.25 10.75C17.25 7.16015 14.3399 4.25 10.75 4.25ZM2.25 10.75C2.25 6.05558 6.05558 2.25 10.75 2.25C15.4444 2.25 19.25 6.05558 19.25 10.75C19.25 12.7369 18.5683 14.5645 17.426 16.0118L21.4571 20.0429C21.8476 20.4334 21.8476 21.0666 21.4571 21.4571C21.0666 21.8476 20.4334 21.8476 20.0429 21.4571L16.0118 17.426C14.5645 18.5683 12.7369 19.25 10.75 19.25C6.05558 19.25 2.25 15.4444 2.25 10.75Z"]');
  if (chatgptSearchButton) return;
  const existingSearchConversationsButton = document.querySelector('#search-conversations-button');
  if (existingSearchConversationsButton) return;
  // data-testid="close-sidebar-button"
  const closeSidebarButton = document.querySelector('button[data-testid="close-sidebar-button"]');
  if (!closeSidebarButton) return;
  // clone the close sidebar button
  const searchConversationsButton = closeSidebarButton.cloneNode(true);
  searchConversationsButton.id = 'search-conversations-button';
  searchConversationsButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="24" height="24" fill="currentColor" class="icon-lg-heavy max-md:hidden"><path d="M504.1 471l-134-134C399.1 301.5 415.1 256.8 415.1 208c0-114.9-93.13-208-208-208S-.0002 93.13-.0002 208S93.12 416 207.1 416c48.79 0 93.55-16.91 129-45.04l134 134C475.7 509.7 481.9 512 488 512s12.28-2.344 16.97-7.031C514.3 495.6 514.3 480.4 504.1 471zM48 208c0-88.22 71.78-160 160-160s160 71.78 160 160s-71.78 160-160 160S48 296.2 48 208z"/></svg>';
  searchConversationsButton.addEventListener('click', () => {
    selectedConversationFolderBreadcrumb = [defaultConversationFolders.find((folder) => folder.id === 'all')];
    createManager('conversations');
    setTimeout(() => {
      const searchInput = document.querySelector('input[id="conversation-manager-search-input"]');
      searchInput.focus();
    }, 100);
  });
  // show tooltip on hover right below the button. center align
  createTooltip(searchConversationsButton, translate('Search conversations'), 'transform: translate(-40%, 50%);');

  // add search conversation button after close sidebar button parent.parentElement
  closeSidebarButton.parentElement.insertAdjacentElement('afterend', searchConversationsButton);
  // add search conversation button to all date headers
  // const dateHeaders = document.querySelectorAll('nav h3');
  // dateHeaders.forEach((dateHeader) => {
  //   dateHeader.parentElement.classList.add('mb-2');
  //   dateHeader.parentElement.appendChild(searchConversationsButton.cloneNode(true));
  // });
}
// eslint-disable-next-line no-unused-vars
function addNavClickEventListener() {
  document.body.addEventListener('click', (e) => {
    if (!e.isTrusted) return;
    const nav = document.querySelector('nav');
    if (!nav) return;
    const sidebarFolderDrawer = document.querySelector('#sidebar-folder-drawer');
    // if clicked inside nav, return
    if (nav.contains(e.target)) {
      if (!sidebarFolderDrawer?.contains(e.target)) {
        folderForNewChat = null;
        initiateNewChatFolderIndicator();
      }
    }
  });
}
// eslint-disable-next-line no-unused-vars
function addSidebarOpenButtonEventListener() {
  document.body.addEventListener('click', (e) => {
    if (!e.isTrusted) return;
    const sidebarOpenButton = document.querySelector('button svg path[d="M8.85719 3L13.5 3C14.0523 3 14.5 3.44772 14.5 4C14.5 4.55229 14.0523 5 13.5 5H11.5V19H15.1C16.2366 19 17.0289 18.9992 17.6458 18.9488C18.2509 18.8994 18.5986 18.8072 18.862 18.673C19.4265 18.3854 19.8854 17.9265 20.173 17.362C20.3072 17.0986 20.3994 16.7509 20.4488 16.1458C20.4992 15.5289 20.5 14.7366 20.5 13.6V11.5C20.5 10.9477 20.9477 10.5 21.5 10.5C22.0523 10.5 22.5 10.9477 22.5 11.5V13.6428C22.5 14.7266 22.5 15.6008 22.4422 16.3086C22.3826 17.0375 22.2568 17.6777 21.955 18.27C21.4757 19.2108 20.7108 19.9757 19.77 20.455C19.1777 20.7568 18.5375 20.8826 17.8086 20.9422C17.1008 21 16.2266 21 15.1428 21H8.85717C7.77339 21 6.89925 21 6.19138 20.9422C5.46253 20.8826 4.82234 20.7568 4.23005 20.455C3.28924 19.9757 2.52433 19.2108 2.04497 18.27C1.74318 17.6777 1.61737 17.0375 1.55782 16.3086C1.49998 15.6007 1.49999 14.7266 1.5 13.6428V10.3572C1.49999 9.27341 1.49998 8.39926 1.55782 7.69138C1.61737 6.96253 1.74318 6.32234 2.04497 5.73005C2.52433 4.78924 3.28924 4.02433 4.23005 3.54497C4.82234 3.24318 5.46253 3.11737 6.19138 3.05782C6.89926 2.99998 7.77341 2.99999 8.85719 3ZM9.5 19V5H8.9C7.76339 5 6.97108 5.00078 6.35424 5.05118C5.74907 5.10062 5.40138 5.19279 5.13803 5.32698C4.57354 5.6146 4.1146 6.07354 3.82698 6.63803C3.69279 6.90138 3.60062 7.24907 3.55118 7.85424C3.50078 8.47108 3.5 9.26339 3.5 10.4V13.6C3.5 14.7366 3.50078 15.5289 3.55118 16.1458C3.60062 16.7509 3.69279 17.0986 3.82698 17.362C4.1146 17.9265 4.57354 18.3854 5.13803 18.673C5.40138 18.8072 5.74907 18.8994 6.35424 18.9488C6.97108 18.9992 7.76339 19 8.9 19H9.5ZM5 8.5C5 7.94772 5.44772 7.5 6 7.5H7C7.55229 7.5 8 7.94772 8 8.5C8 9.05229 7.55229 9.5 7 9.5H6C5.44772 9.5 5 9.05229 5 8.5ZM5 12C5 11.4477 5.44772 11 6 11H7C7.55229 11 8 11.4477 8 12C8 12.5523 7.55229 13 7 13H6C5.44772 13 5 12.5523 5 12Z"]')?.closest('button') || document.querySelector('button svg path[d="M8.85719 3H15.1428C16.2266 2.99999 17.1007 2.99998 17.8086 3.05782C18.5375 3.11737 19.1777 3.24318 19.77 3.54497C20.7108 4.02433 21.4757 4.78924 21.955 5.73005C22.2568 6.32234 22.3826 6.96253 22.4422 7.69138C22.5 8.39925 22.5 9.27339 22.5 10.3572V13.6428C22.5 14.7266 22.5 15.6008 22.4422 16.3086C22.3826 17.0375 22.2568 17.6777 21.955 18.27C21.4757 19.2108 20.7108 19.9757 19.77 20.455C19.1777 20.7568 18.5375 20.8826 17.8086 20.9422C17.1008 21 16.2266 21 15.1428 21H8.85717C7.77339 21 6.89925 21 6.19138 20.9422C5.46253 20.8826 4.82234 20.7568 4.23005 20.455C3.28924 19.9757 2.52433 19.2108 2.04497 18.27C1.74318 17.6777 1.61737 17.0375 1.55782 16.3086C1.49998 15.6007 1.49999 14.7266 1.5 13.6428V10.3572C1.49999 9.27341 1.49998 8.39926 1.55782 7.69138C1.61737 6.96253 1.74318 6.32234 2.04497 5.73005C2.52433 4.78924 3.28924 4.02433 4.23005 3.54497C4.82234 3.24318 5.46253 3.11737 6.19138 3.05782C6.89926 2.99998 7.77341 2.99999 8.85719 3ZM6.35424 5.05118C5.74907 5.10062 5.40138 5.19279 5.13803 5.32698C4.57354 5.6146 4.1146 6.07354 3.82698 6.63803C3.69279 6.90138 3.60062 7.24907 3.55118 7.85424C3.50078 8.47108 3.5 9.26339 3.5 10.4V13.6C3.5 14.7366 3.50078 15.5289 3.55118 16.1458C3.60062 16.7509 3.69279 17.0986 3.82698 17.362C4.1146 17.9265 4.57354 18.3854 5.13803 18.673C5.40138 18.8072 5.74907 18.8994 6.35424 18.9488C6.97108 18.9992 7.76339 19 8.9 19H9.5V5H8.9C7.76339 5 6.97108 5.00078 6.35424 5.05118ZM11.5 5V19H15.1C16.2366 19 17.0289 18.9992 17.6458 18.9488C18.2509 18.8994 18.5986 18.8072 18.862 18.673C19.4265 18.3854 19.8854 17.9265 20.173 17.362C20.3072 17.0986 20.3994 16.7509 20.4488 16.1458C20.4992 15.5289 20.5 14.7366 20.5 13.6V10.4C20.5 9.26339 20.4992 8.47108 20.4488 7.85424C20.3994 7.24907 20.3072 6.90138 20.173 6.63803C19.8854 6.07354 19.4265 5.6146 18.862 5.32698C18.5986 5.19279 18.2509 5.10062 17.6458 5.05118C17.0289 5.00078 16.2366 5 15.1 5H11.5ZM5 8.5C5 7.94772 5.44772 7.5 6 7.5H7C7.55229 7.5 8 7.94772 8 8.5C8 9.05229 7.55229 9.5 7 9.5H6C5.44772 9.5 5 9.05229 5 8.5ZM5 12C5 11.4477 5.44772 11 6 11H7C7.55229 11 8 11.4477 8 12C8 12.5523 7.55229 13 7 13H6C5.44772 13 5 12.5523 5 12Z"]')?.closest('button');
    if (!sidebarOpenButton) return;
    if (!sidebarOpenButton.contains(e.target)) return;
    setTimeout(() => {
      createSidebarFolderButton();
      reorderGPTList();
      makeProjectsCollapsible();
      // makeSidebarResizable();
    }, 500);
  });
}
// eslint-disable-next-line no-unused-vars
async function initiateNewChatFolderIndicator() {
  const existingNewChatFolderIndicator = document.querySelector('#new-chat-folder-indicator-wrapper');
  if (existingNewChatFolderIndicator) {
    existingNewChatFolderIndicator.remove();
  }

  let onNewChatPage = isOnNewChatPage();
  let articles = Array.from(document.querySelectorAll('main article'));
  if (!onNewChatPage || articles.length > 0) {
    // before continue, check every 100ms for 5 sec if on new chat page
    let counter = 0;
    const interval = setInterval(() => {
      onNewChatPage = isOnNewChatPage();
      articles = Array.from(document.querySelectorAll('main article'));
      if ((onNewChatPage && articles.length === 0) || counter >= 50) {
        clearInterval(interval);
        initiateNewChatFolderIndicator();
      }
      counter += 1;
    }, 100);
  }

  if (!onNewChatPage) return;
  if (!folderForNewChat) return;
  if (folderForNewChat.gizmo_id) return;
  const newChatFolderIndicator = document.createElement('div');
  newChatFolderIndicator.id = 'new-chat-folder-indicator-wrapper';
  newChatFolderIndicator.classList = 'w-full flex flex-wrap items-center justify-start';
  newChatFolderIndicator.innerHTML = '<div class="w-full flex items-center justify-start text-xs mb-2 text-token-text-tertiary">Starting new chat in</div>';
  newChatFolderIndicator.appendChild(conversationFolderElement(folderForNewChat, true, false, true, true, true));
  const presentation = initializePresentation();
  if (!presentation) return;
  const inputForm = presentation.querySelector('main form');
  if (!inputForm) return;
  inputForm.parentElement.parentElement.classList.add('flex-wrap');
  inputForm.parentElement.parentElement.prepend(newChatFolderIndicator);
  if (folderForNewChat.profile?.id) {
    const folder = await chrome.runtime.sendMessage({
      type: 'getConversationFolder',
      forceRefresh: true,
      detail: {
        folderId: folderForNewChat.id,
      },
    });
    updateCustomInstructionProfileSelector(folder.profile, true);
  }
}
// eslint-disable-next-line no-unused-vars
function addConversationMenuEventListener() {
  document.body.addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (!button) return;
    const li = button.closest('li');
    if (!li) return;
    const nav = li.closest('nav');
    if (!nav) return;
    const conversationLink = li.querySelector('a[href*="/c/"]');
    if (!conversationLink) return;

    const conversationId = conversationLink.href.split('/').pop();
    // setTimeout(() => {
    addExtraConversationMenuItems(conversationId);
    // }, 1000);
  });
}
async function addExtraConversationMenuItems(conversationId) {
  const menu = document.body.querySelector('div[role="menu"]');
  if (!menu) return;
  const menuItems = menu.querySelectorAll('div[role="menuitem"]');
  if (!menuItems) return;
  const hasSubscription = await chrome.runtime.sendMessage({
    type: 'checkHasSubscription',
  });
  const newMenuItems = [
    {
      text: 'Export',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" stroke="currentColor" fill="currentColor" stroke-width="2" stroke-linejoin="round" width="24" height="24" class="h-4 w-4 shrink-0" height="1em" width="1em"><path d="M568.1 303l-80-80c-9.375-9.375-24.56-9.375-33.94 0s-9.375 24.56 0 33.94L494.1 296H216C202.8 296 192 306.8 192 320s10.75 24 24 24h278.1l-39.03 39.03C450.3 387.7 448 393.8 448 400s2.344 12.28 7.031 16.97c9.375 9.375 24.56 9.375 33.94 0l80-80C578.3 327.6 578.3 312.4 568.1 303zM360 384c-13.25 0-24 10.74-24 24V448c0 8.836-7.164 16-16 16H64.02c-8.836 0-16-7.164-16-16L48 64.13c0-8.836 7.164-16 16-16h160L224 128c0 17.67 14.33 32 32 32h79.1v72c0 13.25 10.74 24 23.1 24S384 245.3 384 232V138.6c0-16.98-6.742-33.26-18.75-45.26l-74.63-74.64C278.6 6.742 262.3 0 245.4 0H63.1C28.65 0-.002 28.66 0 64l.0065 384c.002 35.34 28.65 64 64 64H320c35.2 0 64-28.8 64-64v-40C384 394.7 373.3 384 360 384z"/></svg>',
      click: (args) => {
        openExportModal([args.convId], 'selected');
      },
    },
    {
      text: 'Move',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" stroke="currentColor" fill="currentColor" stroke-linecap="round" stroke-linejoin="round" width="24" height="24" class="h-4 w-4 shrink-0" stroke-width="2" viewBox="0 0 512 512"><path d="M448 96h-172.1L226.7 50.75C214.7 38.74 198.5 32 181.5 32H64C28.66 32 0 60.66 0 96v320c0 35.34 28.66 64 64 64h384c35.34 0 64-28.66 64-64V160C512 124.7 483.3 96 448 96zM464 416c0 8.824-7.18 16-16 16H64c-8.82 0-16-7.176-16-16V96c0-8.824 7.18-16 16-16h117.5c4.273 0 8.289 1.664 11.31 4.688L256 144h192c8.82 0 16 7.176 16 16V416zM336 264h-56V207.1C279.1 194.7 269.3 184 256 184S232 194.7 232 207.1V264H175.1C162.7 264 152 274.7 152 288c0 13.26 10.73 23.1 23.1 23.1h56v56C232 381.3 242.7 392 256 392c13.26 0 23.1-10.74 23.1-23.1V311.1h56C349.3 311.1 360 301.3 360 288S349.3 264 336 264z"/></svg>',
      click: (args) => {
        openMoveConvToFolderModal([args.convId]);
      },
    },
    {
      text: `Download images ${hasSubscription ? '' : '<span class="text-white rounded-md bg-green-500 px-2 text-sm ms-auto">Pro</span>'}`,
      icon: '<svg stroke="currentColor" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" class="h-4 w-4 shrink-0"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.70711 10.2929C7.31658 9.90237 6.68342 9.90237 6.29289 10.2929C5.90237 10.6834 5.90237 11.3166 6.29289 11.7071L11.2929 16.7071C11.6834 17.0976 12.3166 17.0976 12.7071 16.7071L17.7071 11.7071C18.0976 11.3166 18.0976 10.6834 17.7071 10.2929C17.3166 9.90237 16.6834 9.90237 16.2929 10.2929L13 13.5858L13 4C13 3.44771 12.5523 3 12 3C11.4477 3 11 3.44771 11 4L11 13.5858L7.70711 10.2929ZM5 19C4.44772 19 4 19.4477 4 20C4 20.5523 4.44772 21 5 21H19C19.5523 21 20 20.5523 20 20C20 19.4477 19.5523 19 19 19L5 19Z" fill="currentColor"></path></svg>',
      click: (args) => {
        if (!args.hasSubscription) {
          const error = { title: 'This is a Pro feature', message: 'Downloading conversation images requires a Pro subscription. Upgrade to Pro to remove all limits.' };
          errorUpgradeConfirmation(error);
          return;
        }
        downloadSelectedImages(args.menuButton, [], args.convId, !args.event.shiftKey);
      },
    },
    {
      text: `Reference this chat ${hasSubscription ? '' : '<span class="text-white rounded-md bg-green-500 px-2 text-sm ms-auto">Pro</span>'}`,
      icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md"><path fill-rule="evenodd" clip-rule="evenodd" d="M18.0322 5.02393C17.7488 5.00078 17.3766 5 16.8 5H11.5002C11.3 6 11.0989 6.91141 10.8903 7.85409C10.7588 8.44955 10.6432 8.97304 10.3675 9.41399C10.1262 9.80009 9.80009 10.1262 9.41399 10.3675C8.97304 10.6432 8.44955 10.7588 7.85409 10.8903C7.81276 10.8994 7.77108 10.9086 7.72906 10.9179L5.21693 11.4762C5.1442 11.4924 5.07155 11.5001 5 11.5002V16.8C5 17.3766 5.00078 17.7488 5.02393 18.0322C5.04612 18.3038 5.0838 18.4045 5.109 18.454C5.20487 18.6422 5.35785 18.7951 5.54601 18.891C5.59546 18.9162 5.69617 18.9539 5.96784 18.9761C6.25118 18.9992 6.62345 19 7.2 19H10C10.5523 19 11 19.4477 11 20C11 20.5523 10.5523 21 10 21H7.16144C6.6343 21 6.17954 21 5.80497 20.9694C5.40963 20.9371 5.01641 20.8658 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3.13419 18.9836 3.06287 18.5904 3.03057 18.195C2.99997 17.8205 2.99998 17.3657 3 16.8385L3 11C3 8.92477 4.02755 6.93324 5.4804 5.4804C6.93324 4.02755 8.92477 3 11 3L16.8385 3C17.3657 2.99998 17.8205 2.99997 18.195 3.03057C18.5904 3.06287 18.9836 3.13419 19.362 3.32698C19.9265 3.6146 20.3854 4.07354 20.673 4.63803C20.8658 5.01641 20.9371 5.40963 20.9694 5.80497C21 6.17954 21 6.6343 21 7.16144V10C21 10.5523 20.5523 11 20 11C19.4477 11 19 10.5523 19 10V7.2C19 6.62345 18.9992 6.25118 18.9761 5.96784C18.9539 5.69617 18.9162 5.59546 18.891 5.54601C18.7951 5.35785 18.6422 5.20487 18.454 5.109C18.4045 5.0838 18.3038 5.04612 18.0322 5.02393ZM5.28014 9.41336L7.2952 8.96556C8.08861 8.78925 8.24308 8.74089 8.35381 8.67166C8.48251 8.59121 8.59121 8.48251 8.67166 8.35381C8.74089 8.24308 8.78925 8.08861 8.96556 7.2952L9.41336 5.28014C8.51014 5.59289 7.63524 6.15398 6.89461 6.89461C6.15398 7.63524 5.59289 8.51014 5.28014 9.41336ZM17 15C17 14.4477 17.4477 14 18 14C18.5523 14 19 14.4477 19 15V17H21C21.5523 17 22 17.4477 22 18C22 18.5523 21.5523 19 21 19H19V21C19 21.5523 18.5523 22 18 22C17.4477 22 17 21.5523 17 21V19H15C14.4477 19 14 18.5523 14 18C14 17.4477 14.4477 17 15 17H17V15Z" fill="currentColor"></path></svg>',
      click: (args) => {
        if (!args.hasSubscription) {
          const error = { title: 'This is a Pro feature', message: 'Downloading conversation images requires a Pro subscription. Upgrade to Pro to remove all limits.' };
          errorUpgradeConfirmation(error);
          return;
        }
        attachConversationToInput(args.convId);
      },
    },
  ];
  const firstMenuItem = menuItems[0];
  const lastMenuItem = menuItems[menuItems.length - 1];
  newMenuItems.forEach((newMenuItem) => {
    // clone the first menu item
    const menuItem = firstMenuItem.cloneNode(true);
    // add new menu before the last menu item
    lastMenuItem.parentElement.insertBefore(menuItem, lastMenuItem);
    menuItem.innerHTML = `<div class="flex items-center justify-center text-token-text-tertiary h-5 w-5">${newMenuItem.icon}</div>${translate(newMenuItem.text)}`;
    menuItem.addEventListener('click', (e) => {
      newMenuItem.click({
        menuButton: menuItem, convId: conversationId, hasSubscription, event: e,
      });
    });
  });
}
