/* eslint-disable no-unused-vars */
/* global getGizmosPinned, getGizmoDiscovery, runPromptChain, addRateLimitBanner, canUseGizmo, openPromptEditorModal, loadingSpinner, debounce, getSelectionOffsetRelativeToParent, setSelectionAtEnd, previousCharPosition, getCharAtPosition, getStringBetween, nextCharPosition, translate, closeMenus, sanitizeHtml, getSelectionPosition, insertTextAtPosition, updateInputCounter, canRunPrompts */
function addQuickAccessMenuEventListener() {
  document.addEventListener('selectionchange', (e) => {
    e.stopPropagation();
    // bsckspace does not trigger selectionchange
    if (document.activeElement.id !== 'prompt-textarea') return;
    const quickAccessMenuElement = document.querySelector('#quick-access-menu-wrapper');
    const cursorPosition = getSelectionPosition();
    if (!cursorPosition?.parentElement) return;

    const previousAtPosition = -1;// textAreaValue.lastIndexOf('@', cursorPosition.start - 1);
    const previousSlashPosition = previousCharPosition(cursorPosition.parentElement, '/', cursorPosition.start);
    const previousSpacePosition = previousCharPosition(cursorPosition.parentElement, ' ', cursorPosition.start);
    if (cursorPosition.start === 0 || (previousAtPosition === -1 && previousSlashPosition === -1)) {
      if (quickAccessMenuElement) quickAccessMenuElement.remove();
      return;
    }
    // whichever is closer to the cursor
    const previousTriggerPosition = Math.max(previousAtPosition, previousSlashPosition);
    const previousTrigger = getCharAtPosition(cursorPosition.parentElement, previousTriggerPosition);
    // get the previous character
    const charBeforeTrigger = getCharAtPosition(cursorPosition.parentElement, previousTriggerPosition - 1);
    const triggerIsValid = !charBeforeTrigger || charBeforeTrigger === ' ' || charBeforeTrigger === '\n' || charBeforeTrigger === '.' || charBeforeTrigger === '?' || charBeforeTrigger === '!' || previousTriggerPosition === -1;
    // get the word between the previous trigger and the cursor
    if (triggerIsValid && !quickAccessMenuElement && previousTriggerPosition !== -1 && cursorPosition.start > previousTriggerPosition && previousSpacePosition < previousTriggerPosition) {
      quickAccessMenu(previousTrigger);
    } else if (quickAccessMenuElement && (previousTriggerPosition === -1 || previousSpacePosition > previousTriggerPosition)) {
      quickAccessMenuElement.remove();
    }
  });
  document.body.addEventListener('click', (e) => {
    const quickAccessMenuElement = document.querySelector('#quick-access-menu-wrapper');
    const textAreaElement = document.querySelector('#prompt-textarea');
    if (!quickAccessMenuElement) return;

    if (!textAreaElement?.contains(e.target) && !quickAccessMenuElement.contains(e.target)) {
      quickAccessMenuElement.remove();
    }
  });
  document.body.addEventListener('keydown', (event) => {
    const menu = document.querySelector('#quick-access-menu-wrapper');
    if (!menu) return;
    const menuContent = menu.querySelector('#quick-access-menu-content');
    if (event.key === 'ArrowUp') {
      // rotate focus between quick-access-menu-item s where style.display:block
      const menuItems = menuContent.querySelectorAll('button[id^=quick-access-menu-item-]:not([style*="display: none"])');
      if (menuItems.length > 0) {
        if (!menu.contains(document.activeElement)) {
          event.preventDefault();
          menu.focus();
          menuItems[menuItems.length - 1].focus();
          menuItems[0]?.querySelector('span#item-arrow')?.classList?.add('invisible');
          menuItems[menuItems.length - 1]?.querySelector('span#item-arrow')?.classList?.remove('invisible');
        } else {
          const currentFocusIndex = Array.from(menuItems).indexOf(document.activeElement);
          menuItems[currentFocusIndex]?.querySelector('span#item-arrow')?.classList?.add('invisible');

          if (currentFocusIndex === 0) {
            setTimeout(() => {
              menuContent.scrollTop = menuContent.scrollHeight;
            }, 100);
            menuItems[menuItems.length - 1].focus({ preventScroll: true });
            menuItems[menuItems.length - 1]?.querySelector('span#item-arrow')?.classList?.remove('invisible');
          } else if (currentFocusIndex > 0) {
            menuItems[currentFocusIndex - 1].focus();
            menuItems[currentFocusIndex - 1]?.querySelector('span#item-arrow')?.classList?.remove('invisible');
          }
        }
      }
      return;
    }
    if (event.key === 'ArrowDown') {
      // rotate focus to between quick-access-menu-item s
      const menuItems = menuContent.querySelectorAll('button[id^=quick-access-menu-item-]:not([style*="display: none"])');
      if (menuItems.length > 0) {
        if (!menu.contains(document.activeElement)) {
          event.preventDefault();
          menu.focus();
          menuItems[0].focus();
          menuItems[0]?.querySelector('span#item-arrow')?.classList?.remove('invisible');
        } else {
          const currentFocusIndex = Array.from(menuItems).indexOf(document.activeElement);
          menuItems[currentFocusIndex]?.querySelector('span#item-arrow')?.classList?.add('invisible');
          if (currentFocusIndex === menuItems.length - 1) {
            setTimeout(() => {
              menuContent.scrollTop = 0;
            }, 100);
            menuItems[0].focus({ preventScroll: true });
            menuItems[0]?.querySelector('span#item-arrow')?.classList?.remove('invisible');
          } else if (currentFocusIndex < menuItems.length - 1) {
            menuItems[currentFocusIndex + 1].focus();
            menuItems[currentFocusIndex + 1]?.querySelector('span#item-arrow')?.classList?.remove('invisible');
          }
        }
      }
      return;
    }
    if (event.key === 'Backspace') {
      // backspace doesn't trigger selectionchange event
      if (document.activeElement.id !== 'prompt-textarea') {
        event.preventDefault();
      }
      const menuItems = menuContent.querySelectorAll('button[id^=quick-access-menu-item-]:not([style*="display: none"])');
      const currentFocusIndex = Array.from(menuItems).indexOf(document.activeElement);
      menuItems[currentFocusIndex]?.querySelector('span#item-arrow')?.classList?.add('invisible');
      menuItems[0]?.querySelector('span#item-arrow')?.classList?.remove('invisible');

      document.querySelector('#prompt-textarea').focus();
      return;
    }
    // if any key other than the above, focus on the text area
    if (event.key !== 'Enter') {
      const textAreaElement = document.querySelector('#prompt-textarea');
      if (textAreaElement) textAreaElement.focus();
    }
  });
}
const debounceUpdateQuickAccessMenuItems = debounce(() => {
  updateQuickAccessMenuItems();
}, 500);
function updateQuickAccessMenuItems() {
  const menu = document.querySelector('#quick-access-menu-wrapper');
  if (!menu) return;
  // find the closest trigger
  const textAreaElement = document.querySelector('#prompt-textarea');
  const quickAccessMenuContent = document.querySelector('#quick-access-menu-content');
  if (!textAreaElement || !quickAccessMenuContent) return;
  if (textAreaElement.innerText.length === 0) {
    menu.remove();
    return;
  }
  const cursorPosition = getSelectionPosition();
  if (!cursorPosition?.parentElement) return;

  const textAreaValue = textAreaElement.innerText;
  const previousAtPosition = -1; // textAreaValue.lastIndexOf('@', cursorPosition.start);
  const previousSlashPosition = previousCharPosition(cursorPosition.parentElement, '/', cursorPosition.start);
  if (cursorPosition.start === 0 || (previousAtPosition === -1 && previousSlashPosition === -1)) {
    menu.remove();
    return;
  }
  let nextSpacePos = nextCharPosition(cursorPosition.parentElement, ' ', cursorPosition.start);
  let nextNewLinePos = nextCharPosition(cursorPosition.parentElement, '\n', cursorPosition.start);
  if (nextSpacePos === -1) nextSpacePos = textAreaValue.length;
  if (nextNewLinePos === -1) nextNewLinePos = textAreaValue.length;
  const triggerEndPosition = Math.min(nextSpacePos, nextNewLinePos);
  const previousTriggerPosition = Math.max(previousAtPosition, previousSlashPosition);
  const previousTrigger = getCharAtPosition(cursorPosition.parentElement, previousTriggerPosition);
  const triggerWord = getStringBetween(cursorPosition.parentElement, previousTriggerPosition + 1, triggerEndPosition);
  // if (!triggerWord) return;
  if (previousTrigger === '@') {
    loadCustomGPTs(triggerWord);
  } else if (previousTrigger === '/') {
    loadPrompts(1, triggerWord);
  }
  // let foundFirstVisibleItem = false;
  // const menuItems = quickAccessMenuContent.querySelectorAll('button[id^=quick-access-menu-item-]');
  // menuItems.forEach((item) => {
  //   const itemText = item.textContent;

  //   if (itemText.toLowerCase().includes(triggerWord.toLowerCase())) {
  //     document.querySelector('#quick-access-menu-wrapper').style.display = 'flex';
  //     item.style.display = 'flex';
  //     if (!foundFirstVisibleItem) {
  //       foundFirstVisibleItem = true;
  //       item?.querySelector('span#item-arrow')?.classList?.remove('invisible');
  //     } else {
  //       item?.querySelector('span#item-arrow')?.classList?.add('invisible');
  //     }
  //   } else {
  //     item.style.display = 'none';
  //   }
  // });
  // if (!foundFirstVisibleItem && triggerWord.length > 0) {
  //   document.querySelector('#quick-access-menu-wrapper').style.display = 'none';
  // } else {
  //   document.querySelector('#quick-access-menu-wrapper').style.display = 'flex';
  // }
}
function quickAccessMenu(trigger) {
  // chrome.storage.local.get(['selectedModel'], (r) => {
  //   const isGPT4 = r.selectedModel?.tags?.includes('gpt4');
  //   const isGizmo = document.querySelector('#gizmo-menu-wrapper-navbar');
  //   if (trigger !== '@' || isGPT4 || isGizmo) {
  const existingMenu = document.querySelector('#quick-access-menu-wrapper');
  if (existingMenu) {
    existingMenu.remove();
    return;
  }
  const menu = document.createElement('div');
  menu.id = 'quick-access-menu-wrapper';
  menu.classList = 'absolute flex flex-col gap-2 rounded-2xl popover bg-token-main-surface-primary shadow-lg border border-token-border-medium px-1';
  menu.style = 'height: 300px; top:-304px; left:0; width:100%; z-index: 10000;';
  const menuHeader = document.createElement('div');
  menuHeader.classList = 'flex justify-between items-center py-2 px-3 border-b border-token-border-medium';
  const menuTitle = document.createElement('h3');
  menuTitle.classList = 'text-lg font-bold';
  menuHeader.appendChild(menuTitle);
  const menuHeaderButton = document.createElement('button');
  menuHeaderButton.classList = 'btn flex justify-center gap-2 btn-primary border';
  menuHeaderButton.type = 'button';
  menuHeader.appendChild(menuHeaderButton);
  menu.appendChild(menuHeader);

  const inputForm = document.querySelector('main form');
  if (!inputForm) {
    return;
  }
  inputForm.classList.add('relative');
  inputForm.appendChild(menu);

  // this will make the toolbox menu go away
  // menuHeaderButton.focus();

  // if (trigger === '@') {
  //   menuTitle.textContent = `${translate('Custom GPTs')} (@)`;
  //   menuHeaderButton.id = 'see-all-custom-gpts';
  //   menuHeaderButton.textContent = translate('plus Create a GPT');
  //   // open '/gpts/editor' in new tab
  //   menuHeaderButton.addEventListener('click', () => {
  //     menu.remove();
  //     window.open('/gpts/editor', '_blank');
  //   });
  //   if (canUseGizmo) {
  //     const menuContent = document.createElement('div');
  //     menuContent.id = 'quick-access-menu-content';
  //     menuContent.classList = 'flex flex-col gap-2';
  //     menuContent.style = 'overflow-y: auto;height: 100%; width: 100%;padding:1px;';
  //     menu.appendChild(menuContent);
  //     loadCustomGPTs();
  //   } else {
  //     addRateLimitBanner(true);
  //   }
  // }
  if (trigger === '/') {
    menuTitle.textContent = `${translate('All Prompts')} (${trigger})`;
    menuHeaderButton.id = 'see-all-custom-prompts';
    menuHeaderButton.textContent = translate('plus Add New Prompt');
    menuHeaderButton.addEventListener('click', () => {
      menu.remove();
      const newPromptChain = {
        title: '',
        steps: [''],
      };
      openPromptEditorModal(newPromptChain);
    });
    const menuContent = document.createElement('div');
    menuContent.id = 'quick-access-menu-content';
    menuContent.classList = 'flex flex-col gap-2';
    menuContent.style = 'overflow-y: auto;height: 100%; width: 100%;padding:1px;';
    menuContent.innerHTML = '';
    menuContent.appendChild(loadingSpinner('quick-access-menu-content'));
    menu.appendChild(menuContent);
    debounceUpdateQuickAccessMenuItems();
  }
  // }
  // });
}
function focusOnFirstItem() {
  const menu = document.querySelector('#quick-access-menu-wrapper');
  if (!menu) return;
  const menuContent = menu.querySelector('#quick-access-menu-content');
  if (!menuContent) return;
  const menuItems = menuContent.querySelectorAll('button[id^=quick-access-menu-item-]:not([style*="display: none"])');
  if (menuItems.length > 0) {
    if (!menu.contains(document.activeElement)) {
      menu.focus();
      menuItems[0].focus();
      menuItems[0]?.querySelector('span#item-arrow')?.classList?.remove('invisible');
    }
  }
}
function loadCustomGPTs(triggerWord = '') {
  const menuContent = document.querySelector('#quick-access-menu-content');
  menuContent.innerHTML = '';
  getGizmoDiscovery('recent', null, 24, 'global', false).then((gizmoDiscovery) => {
    getGizmosPinned(false).then((gizmosPinned) => {
      const recentGizmos = gizmoDiscovery.list.items.map((item) => ({ ...item.resource.gizmo, isRecent: true }));
      // add gizmo pinned to gizmos if not already present
      gizmosPinned.forEach((gizmoPinned) => {
        const gizmoPinnedId = gizmoPinned?.gizmo?.id;
        if (!recentGizmos.find((recentGizmo) => recentGizmo.id === gizmoPinnedId)) {
          recentGizmos.push(gizmoPinned.gizmo);
        }
      });
      for (let i = 0; i < recentGizmos.length; i += 1) {
        const gizmo = recentGizmos[i];
        if (triggerWord && !`${gizmo.display.name} ${gizmo?.display?.description}`.toLowerCase().includes(triggerWord.toLowerCase())) continue;
        const gizmoRow = document.createElement('button');
        gizmoRow.type = 'button';
        gizmoRow.id = `quick-access-menu-item-${i}`;
        gizmoRow.classList = 'btn w-full text-start focus-visible:outline-0 focus-visible:bg-token-main-surface-secondary hover:bg-token-main-surface-secondary flex justify-between items-center rounded-lg';
        const gizmoImage = gizmo?.display?.profile_picture_url ? `<img src="${gizmo?.display?.profile_picture_url}" class="h-full w-full bg-token-main-surface-secondary dark:bg-token-main-surface-tertiary" alt="GPT" width="80" height="80" />` : '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="text-token-text-tertiary h-full w-full" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>';

        gizmoRow.innerHTML = `<div class="w-full" tabindex="0"> <div class="group flex h-10 items-center gap-2 rounded-lg px-2 font-medium text-sm text-token-text-primary" > <div class="h-7 w-7 flex-shrink-0"> <div class="gizmo-shadow-stroke overflow-hidden rounded-full"> ${gizmoImage}</div></div><div class="flex h-fit grow flex-row justify-between space-x-2 overflow-hidden text-ellipsis whitespace-nowrap"> <div class="flex flex-row space-x-2"> <span class="shrink-0 truncate">${gizmo?.display?.name}</span ><span class="flex-grow truncate text-sm font-light text-token-text-tertiary max-w-sm">${gizmo?.display?.description}</span > </div> <span class="shrink-0 self-center flex items-center"><span id="item-arrow" class="flex items-center justify-between text-xl me-2 rounded-md px-2 bg-token-main-surface-secondary ${i === 0 ? '' : 'invisible'}"><span class="text-sm me-2">Enter</span> ➜</span>${gizmo?.isRecent ? '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="icon-sm" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" > <circle cx="12" cy="12" r="10"></circle> <polyline points="12 6 12 12 16 14"></polyline></svg>' : '<svg class="icon-sm" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path fill-rule="evenodd" clip-rule="evenodd" d="M17.4845 2.8798C16.1773 1.57258 14.0107 1.74534 12.9272 3.24318L9.79772 7.56923C9.60945 7.82948 9.30775 7.9836 8.98654 7.9836H6.44673C3.74061 7.9836 2.27414 11.6759 4.16948 13.5713L6.59116 15.993L2.29324 20.2909C1.90225 20.6819 1.90225 21.3158 2.29324 21.7068C2.68422 22.0977 3.31812 22.0977 3.70911 21.7068L8.00703 17.4088L10.4287 19.8305C12.3241 21.7259 16.0164 20.2594 16.0164 17.5533V15.0135C16.0164 14.6923 16.1705 14.3906 16.4308 14.2023L20.7568 11.0728C22.2547 9.98926 22.4274 7.8227 21.1202 6.51549L17.4845 2.8798ZM11.8446 18.4147C12.4994 19.0694 14.0141 18.4928 14.0141 17.5533V15.0135C14.0141 14.0499 14.4764 13.1447 15.2572 12.58L19.5832 9.45047C20.0825 9.08928 20.1401 8.3671 19.7043 7.93136L16.0686 4.29567C15.6329 3.85993 14.9107 3.91751 14.5495 4.4168L11.4201 8.74285C10.8553 9.52359 9.95016 9.98594 8.98654 9.98594H6.44673C5.5072 9.98594 4.93059 11.5006 5.58535 12.1554L11.8446 18.4147Z" fill="currentColor"></path></svg>'}</span></div></div></div>`;
        menuContent.appendChild(gizmoRow);
        gizmoRow.addEventListener('click', () => {
          const textAreaElement = document.querySelector('#prompt-textarea');
          if (!textAreaElement) return;
          document.querySelector('#quick-access-menu-wrapper').remove();
          // find the neeares previous @ position
          const textAreaValue = textAreaElement.innerText;
          const cursorPosition = getSelectionOffsetRelativeToParent(textAreaElement).start;
          const previousAtPosition = textAreaValue.lastIndexOf('@', cursorPosition);
          const newText = textAreaValue.substring(0, previousAtPosition) + textAreaValue.substring(cursorPosition);
          textAreaElement.innerText = newText;
          const replyToPreviewElement = document.querySelector('#reply-to-preview-wrapper');
          const imageEditSelectionPreviewElement = document.querySelector('#image-edit-selection-preview');

          const existingTaggedGizmoElement = document.querySelector('#tagged-gizmo-wrapper');
          if (existingTaggedGizmoElement) existingTaggedGizmoElement.remove();
          const taggedGizmoElement = `<div id="tagged-gizmo-wrapper" data-gizmoid="${gizmo.id}" class="flex w-full flex-row items-center rounded-b-lg ${replyToPreviewElement || imageEditSelectionPreviewElement ? '' : 'rounded-t-[20px]'} bg-token-main-surface-primary py-2.5 ps-3 pe-1.5 py-1 border border-token-border-medium"><div class="group flex flex-1 items-center gap-2 rounded-lg font-medium"><div class="h-6 w-6 flex-shrink-0"><div class="gizmo-shadow-stroke overflow-hidden rounded-full"><img src="${gizmo?.display?.profile_picture_url}" class="h-full w-full bg-token-main-surface-secondary dark:bg-token-main-surface-tertiary" alt="GPT" width="80" height="80"></div></div><div class="space-x-2 overflow-hidden text-ellipsis text-sm font-light text-token-text-tertiary">Talking to <span class="font-medium text-token-text-tertiary">${gizmo?.display?.name}</span></div></div><button id="tagged-gizmo-close-button" class="shrink-0"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-token-text-tertiary"><path d="M6.34315 6.34338L17.6569 17.6571M17.6569 6.34338L6.34315 17.6571" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg></button></div>`;

          if (replyToPreviewElement) {
            replyToPreviewElement.classList.remove('rounded-b-lg');
            // add tagged gizmo element after replyToPreviewElement
            replyToPreviewElement.insertAdjacentHTML('afterend', taggedGizmoElement);
          } else if (imageEditSelectionPreviewElement) {
            imageEditSelectionPreviewElement.classList.remove('rounded-b-lg');
            // add tagged gizmo element after imageEditSelectionPreviewElement
            imageEditSelectionPreviewElement.insertAdjacentHTML('afterend', taggedGizmoElement);
          } else {
            textAreaElement.parentElement.insertAdjacentHTML('afterbegin', taggedGizmoElement);
          }
          textAreaElement.focus();

          const closeButton = document.querySelector('#tagged-gizmo-close-button');
          if (!closeButton) return;
          closeButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeMenus();
            const curTaggedGizmoElement = document.querySelector('#tagged-gizmo-wrapper');
            if (curTaggedGizmoElement) curTaggedGizmoElement.remove();

            const curReplyToPreviewElement = document.querySelector('#reply-to-preview-wrapper');
            if (curReplyToPreviewElement) {
              curReplyToPreviewElement.classList.add('rounded-b-lg');
            }
            const curImageEditSelectionPreviewElement = document.querySelector('#image-edit-selection-preview');
            if (curImageEditSelectionPreviewElement) {
              curImageEditSelectionPreviewElement.classList.add('rounded-b-lg');
            }
          });
        });
      }
      const menuItems = menuContent.querySelectorAll('button[id^=quick-access-menu-item-]');
      if (menuItems.length === 0) {
        const noResultsElement = document.createElement('div');
        noResultsElement.classList = 'text-center text-token-text-tertiary';
        noResultsElement.textContent = 'No GPT found';
        menuContent.appendChild(noResultsElement);
      }
    });
  });
}
function loadPrompts(newPageNumber = 1, searchTerm = '') {
  const menuContent = document.querySelector('#quick-access-menu-content');
  if (newPageNumber === 1) {
    menuContent.innerHTML = '';
    menuContent.appendChild(loadingSpinner('quick-access-menu-content'));
  } else {
    // remove the load more button
    const loadMoreButton = document.querySelector('#load-more-prompts-button');
    if (loadMoreButton) loadMoreButton.remove();
  }
  chrome.runtime.sendMessage({
    type: 'getPrompts',
    detail: {
      pageNumber: newPageNumber,
      searchTerm,
      isPublic: false,
      orderBy: 'alphabetical',
      deepSearch: false,
    },
  }, (data) => {
    if (!data) return;
    if (data.error) {
      const loadingSpinnerElement = document.querySelector('#loading-spinner-quick-access-menu-content');
      if (loadingSpinnerElement) loadingSpinnerElement.remove();
      const errorElement = document.createElement('div');
      errorElement.classList = 'text-center text-token-text-tertiary';
      errorElement.textContent = 'Error loading prompts';
      menuContent.appendChild(errorElement);
      return;
    }
    const prompts = data?.results;
    if (!prompts) return;
    const loadingSpinnerElement = document.querySelector('#loading-spinner-quick-access-menu-content');
    if (loadingSpinnerElement) loadingSpinnerElement.remove();
    if (prompts.length === 0 && newPageNumber === 1) {
      // close the menu if no results
      const existingNoResultsElement = document.querySelector('#no-results-element');
      if (existingNoResultsElement) return;
      const noResultsElement = document.createElement('div');
      noResultsElement.id = 'no-results-element';
      noResultsElement.classList = 'text-center text-token-text-tertiary';
      noResultsElement.textContent = 'No prompts found';
      menuContent.appendChild(noResultsElement);
      return;
    }
    const sortedPrompts = prompts.sort((a, b) => a.title.localeCompare(b.title));
    for (let i = 0; i < sortedPrompts.length; i += 1) {
      const prompt = prompts[i];
      const promptElement = document.createElement('button');
      promptElement.type = 'button';
      promptElement.id = `quick-access-menu-item-${i}`;
      promptElement.classList = 'btn w-full text-start focus-visible:outline-0 focus-visible:bg-token-main-surface-secondary hover:bg-token-main-surface-secondary flex justify-between items-center rounded-lg';
      promptElement.innerHTML = `<span style="width:80%;"><span style="font-weight:bold; font-size:14px; margin-right:16px;white-space: nowrap; overflow: hidden; text-overflow: ellipsis;display:block;width:100%;">${prompt.title} <span class="font-normal text-xs text-token-text-tertiary">(${prompt.steps.length} ${prompt.steps.length > 1 ? 'steps' : 'step'})</span></span><span style="font-size:12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;display:block;width:100%;color:#888;">${translate('Step')} 1: ${sanitizeHtml(prompt.steps[0])}</span></span><span id="item-arrow" class="flex items-center justify-between text-xl me-2 rounded-md px-2 bg-token-sidebar-surface-secondary ${(newPageNumber === 1 && i === 0) ? '' : 'invisible'}"><span class="text-sm me-2">Enter</span> ➜</span>`;
      promptElement.addEventListener('click', async (e) => {
        if (e.shiftKey && prompt.steps.length === 1) {
          const canRun = await canRunPrompts(prompt);
          if (!canRun) return;
          insertPromptIntoTextArea(prompt);
        } else {
          runPromptChain(prompt, 0, false);
        }
      });
      menuContent.appendChild(promptElement);
    }
    focusOnFirstItem();
    if (data.next) {
      const loadMorePromptsButton = document.createElement('button');
      loadMorePromptsButton.id = 'load-more-prompts-button';
      loadMorePromptsButton.classList = 'p-2 cursor-pointer flex items-center justify-center h-auto relative';
      loadMorePromptsButton.appendChild(loadingSpinner('load-more-prompts-button'));
      menuContent.appendChild(loadMorePromptsButton);
      // add an observer to click the load more button when it is visible
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadPrompts(newPageNumber + 1, searchTerm);
          }
        });
      }, { threshold: 0 });
      if (loadMorePromptsButton) {
        observer.observe(loadMorePromptsButton);
      }
    }
  });
}
function insertPromptIntoTextArea(prompt, step = 0) {
  const { steps: promptChainSteps } = prompt;

  const textAreaElement = document.querySelector('#prompt-textarea');
  if (!textAreaElement) return;
  // find the closest previous / position
  const textAreaValue = textAreaElement.innerText;
  if (textAreaValue && prompt.mode !== 'splitter') {
    const cursorPos = getSelectionPosition();
    if (!cursorPos?.parentElement) return;
    const previousSlashPosition = previousCharPosition(cursorPos.parentElement, '/', cursorPos.start);
    if (cursorPos.start !== -1 && previousSlashPosition !== -1 && !getStringBetween(cursorPos.parentElement, previousSlashPosition, cursorPos.start).includes(' ')) {
      insertTextAtPosition(cursorPos.parentElement, prompt.steps[step], previousSlashPosition, cursorPos.end);
    } else {
      insertTextAtPosition(cursorPos.parentElement, prompt.steps[step], cursorPos.start, cursorPos.end);
    }
  } else {
    // override the text area value
    textAreaElement.innerHTML = '<p></p>';
    insertTextAtPosition(textAreaElement.firstChild, prompt.steps[step], 0, 1000000);
  }
  updateInputCounter();
}
