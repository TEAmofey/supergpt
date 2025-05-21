/* global showConfirmDialog, runPromptChain, openPromptEditorModal, handleClickMovePromptsButton, addOrReplacePromptCard, getLastSelectedPromptFolder, buttonGenerator, reportReasonList, toast, dropdown, addDropdownEventListener, initializeContinueButton, errorUpgradeConfirmation, translate, closeMenus, noPromptElement, updatePromptFolderCount, isDefaultPromptFolder, adjustMenuPosition */
// eslint-disable-next-line no-unused-vars
function showPromptManagerCardMenu(promptSettingsElement, prompt, leftMenu) {
  const promptId = prompt.id;
  const isPublic = prompt.is_public;
  const lastSelectedPromptFolder = getLastSelectedPromptFolder();

  const { right, top } = promptSettingsElement.getBoundingClientRect();

  const translateX = leftMenu ? right - 234 : right - 2;
  const translateY = top + 22;

  const menu = `<div id="prompt-card-menu" dir="ltr" style="transform:translate3d(${translateX}px,${translateY}px,0);position:fixed;left:0;top:0;min-width:max-content;z-index:10001;--radix-popper-anchor-width:18px;--radix-popper-anchor-height:18px;--radix-popper-available-width:1167px;--radix-popper-available-height:604px;--radix-popper-transform-origin:0% 0px"><div data-side="bottom" data-align="start" role="menu" aria-orientation="vertical" data-state="open" data-radix-menu-content="" dir="ltr" aria-labelledby="radix-:r6g:" class="min-w-[200px] max-w-xs rounded-lg border text-token-text-primary border-token-border-medium bg-token-main-surface-primary shadow-lg" tabindex="-1" data-orientation="vertical" style="outline:0;--radix-dropdown-menu-content-transform-origin:var(--radix-popper-transform-origin);--radix-dropdown-menu-content-available-width:var(--radix-popper-available-width);--radix-dropdown-menu-content-available-height:var(--radix-popper-available-height);--radix-dropdown-menu-trigger-width:var(--radix-popper-anchor-width);--radix-dropdown-menu-trigger-height:var(--radix-popper-anchor-height);pointer-events:auto">
  
  <div role="menuitem" id="run-prompt-card-button-${promptId}" title="CMD/CTRL + Click on the card" class="flex gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item=""><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="icon-md" xmlns="http://www.w3.org/2000/svg"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>${translate('Run')} <span class='ms-auto'>${buttonGenerator(['⌘', 'Click'], 'xs')}</span></div>
  
  ${prompt.steps.length > 1 ? `<div role="menuitem" id="run-from-step-prompt-card-button-${promptId}" title="CMD/CTRL + Click on the card" class="flex gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative" tabindex="-1" data-orientation="vertical" data-radix-collection-item=""><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" class="icon-md"><path d="M55.1 56.04C55.1 42.78 66.74 32.04 79.1 32.04H111.1C125.3 32.04 135.1 42.78 135.1 56.04V176H151.1C165.3 176 175.1 186.8 175.1 200C175.1 213.3 165.3 224 151.1 224H71.1C58.74 224 47.1 213.3 47.1 200C47.1 186.8 58.74 176 71.1 176H87.1V80.04H79.1C66.74 80.04 55.1 69.29 55.1 56.04V56.04zM118.7 341.2C112.1 333.8 100.4 334.3 94.65 342.4L83.53 357.9C75.83 368.7 60.84 371.2 50.05 363.5C39.26 355.8 36.77 340.8 44.47 330.1L55.59 314.5C79.33 281.2 127.9 278.8 154.8 309.6C176.1 333.1 175.6 370.5 153.7 394.3L118.8 432H152C165.3 432 176 442.7 176 456C176 469.3 165.3 480 152 480H64C54.47 480 45.84 474.4 42.02 465.6C38.19 456.9 39.9 446.7 46.36 439.7L118.4 361.7C123.7 355.9 123.8 347.1 118.7 341.2L118.7 341.2zM520 72C533.3 72 544 82.75 544 96C544 109.3 533.3 120 520 120H248C234.7 120 224 109.3 224 96C224 82.75 234.7 72 248 72H520zM520 232C533.3 232 544 242.7 544 256C544 269.3 533.3 280 520 280H248C234.7 280 224 269.3 224 256C224 242.7 234.7 232 248 232H520zM520 392C533.3 392 544 402.7 544 416C544 429.3 533.3 440 520 440H248C234.7 440 224 429.3 224 416C224 402.7 234.7 392 248 392H520z"/></svg><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" stroke="currentColor" fill="currentColor" class="icon-xs absolute" style="top:6px;left:22px;"><path d="M361 215C375.3 223.8 384 239.3 384 256C384 272.7 375.3 288.2 361 296.1L73.03 472.1C58.21 482 39.66 482.4 24.52 473.9C9.377 465.4 0 449.4 0 432V80C0 62.64 9.377 46.63 24.52 38.13C39.66 29.64 58.21 29.99 73.03 39.04L361 215z"/></svg>${translate('Run from step')}</div>` : ''}

  <div role="menuitem" id="view-prompt-card-button-${promptId}" class="flex gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item=""><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" class="icon-md"><path d="M160 256C160 185.3 217.3 128 288 128C358.7 128 416 185.3 416 256C416 326.7 358.7 384 288 384C217.3 384 160 326.7 160 256zM288 336C332.2 336 368 300.2 368 256C368 211.8 332.2 176 288 176C287.3 176 286.7 176 285.1 176C287.3 181.1 288 186.5 288 192C288 227.3 259.3 256 224 256C218.5 256 213.1 255.3 208 253.1C208 254.7 208 255.3 208 255.1C208 300.2 243.8 336 288 336L288 336zM95.42 112.6C142.5 68.84 207.2 32 288 32C368.8 32 433.5 68.84 480.6 112.6C527.4 156 558.7 207.1 573.5 243.7C576.8 251.6 576.8 260.4 573.5 268.3C558.7 304 527.4 355.1 480.6 399.4C433.5 443.2 368.8 480 288 480C207.2 480 142.5 443.2 95.42 399.4C48.62 355.1 17.34 304 2.461 268.3C-.8205 260.4-.8205 251.6 2.461 243.7C17.34 207.1 48.62 156 95.42 112.6V112.6zM288 80C222.8 80 169.2 109.6 128.1 147.7C89.6 183.5 63.02 225.1 49.44 256C63.02 286 89.6 328.5 128.1 364.3C169.2 402.4 222.8 432 288 432C353.2 432 406.8 402.4 447.9 364.3C486.4 328.5 512.1 286 526.6 256C512.1 225.1 486.4 183.5 447.9 147.7C406.8 109.6 353.2 80 288 80V80z"/></svg>${translate('View')}</div>
  
  ${prompt.is_mine ? `<div role="menuitem" id="duplicate-prompt-card-button-${promptId}" class="flex gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item=""><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="icon-md" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>${translate('Duplicate')}</div>

        <div role="menuitem" id="public-prompt-card-button-${promptId}" class="flex gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item="">${isPublic ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" stroke="currentColor" fill="currentColor"  class="icon-md"><path d="M592 288H576V212.7c0-41.84-30.03-80.04-71.66-84.27C456.5 123.6 416 161.1 416 208V288h-16C373.6 288 352 309.6 352 336v128c0 26.4 21.6 48 48 48h192c26.4 0 48-21.6 48-48v-128C640 309.6 618.4 288 592 288zM496 432c-17.62 0-32-14.38-32-32s14.38-32 32-32s32 14.38 32 32S513.6 432 496 432zM528 288h-64V208c0-17.62 14.38-32 32-32s32 14.38 32 32V288zM224 256c70.7 0 128-57.31 128-128S294.7 0 224 0C153.3 0 96 57.31 96 128S153.3 256 224 256zM320 336c0-8.672 1.738-16.87 4.303-24.7C308.6 306.6 291.9 304 274.7 304H173.3C77.61 304 0 381.7 0 477.4C0 496.5 15.52 512 34.66 512h301.7C326.3 498.6 320 482.1 320 464V336z"/></svg> ${translate('Make private')}` : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" stroke="currentColor" fill="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-md" height="1em" width="1em"><path d="M319.9 320c57.41 0 103.1-46.56 103.1-104c0-57.44-46.54-104-103.1-104c-57.41 0-103.1 46.56-103.1 104C215.9 273.4 262.5 320 319.9 320zM369.9 352H270.1C191.6 352 128 411.7 128 485.3C128 500.1 140.7 512 156.4 512h327.2C499.3 512 512 500.1 512 485.3C512 411.7 448.4 352 369.9 352zM512 160c44.18 0 80-35.82 80-80S556.2 0 512 0c-44.18 0-80 35.82-80 80S467.8 160 512 160zM183.9 216c0-5.449 .9824-10.63 1.609-15.91C174.6 194.1 162.6 192 149.9 192H88.08C39.44 192 0 233.8 0 285.3C0 295.6 7.887 304 17.62 304h199.5C196.7 280.2 183.9 249.7 183.9 216zM128 160c44.18 0 80-35.82 80-80S172.2 0 128 0C83.82 0 48 35.82 48 80S83.82 160 128 160zM551.9 192h-61.84c-12.8 0-24.88 3.037-35.86 8.24C454.8 205.5 455.8 210.6 455.8 216c0 33.71-12.78 64.21-33.16 88h199.7C632.1 304 640 295.6 640 285.3C640 233.8 600.6 192 551.9 192z"/></svg> ${translate('Make public')}`}</div>
        ${isDefaultPromptFolder(lastSelectedPromptFolder?.id?.toString()) ? '' : `
        
        <div role="menuitem" id="move-prompt-card-button-${promptId}" class="flex gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item=""><svg xmlns="http://www.w3.org/2000/svg" stroke="currentColor" fill="currentColor" stroke-linecap="round" stroke-linejoin="round" class="icon-md" stroke-width="2" viewBox="0 0 512 512"><path d="M448 96h-172.1L226.7 50.75C214.7 38.74 198.5 32 181.5 32H64C28.66 32 0 60.66 0 96v320c0 35.34 28.66 64 64 64h384c35.34 0 64-28.66 64-64V160C512 124.7 483.3 96 448 96zM464 416c0 8.824-7.18 16-16 16H64c-8.82 0-16-7.176-16-16V96c0-8.824 7.18-16 16-16h117.5c4.273 0 8.289 1.664 11.31 4.688L256 144h192c8.82 0 16 7.176 16 16V416zM336 264h-56V207.1C279.1 194.7 269.3 184 256 184S232 194.7 232 207.1V264H175.1C162.7 264 152 274.7 152 288c0 13.26 10.73 23.1 23.1 23.1h56v56C232 381.3 242.7 392 256 392c13.26 0 23.1-10.74 23.1-23.1V311.1h56C349.3 311.1 360 301.3 360 288S349.3 264 336 264z"/></svg>${translate('Move')}</div>`}` : ''}
  ${(prompt.is_public && !prompt.is_mine) ? `<div role="menuitem" id="report-prompt-card-button-${promptId}" class="flex gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group text-orange-500" tabindex="-1" data-orientation="vertical" data-radix-collection-item=""><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-md" viewBox="0 0 512 512"><path d="M498.5 6.232c-19.76-11.99-38.92-3.226-41.61-1.1c-41.75 19.06-76.02 27.94-107.8 27.94c-28.92 0-51.74-7.321-75.9-15.09C247.5 8.844 220.1 .3094 185.2 .3055C159 .3055 121.3 2.641 32 38.84V16.01c0-8.836-7.164-15.1-16-15.1S0 7.172 0 16.01V496C0 504.8 7.164 512 16 512S32 504.8 32 496v-104.9c14.47-6.441 77.75-38.93 148.8-38.93c36.8 0 67.14 7.713 99.25 15.89c30.74 7.82 62.49 15.9 99.31 15.9c35.46 0 72.08-7.553 111.1-23.09c12.28-4.781 20.38-16.6 20.38-29.78L512 32.35C512 22.01 507.4 11.6 498.5 6.232zM479.7 331c-36.11 14.07-68.93 20.91-100.3 20.91c-32.81 0-61.26-7.238-91.39-14.9C255.4 328.7 221.7 320.2 180.8 320.2c-45.89 0-93.61 11.31-145.9 34.58L32 356.1V73.37l28.01-11.35c49.34-19.98 90.29-29.7 125.2-29.7c30.74 0 53.8 7.406 78.2 15.24c25.44 8.172 51.75 16.62 85.69 16.62c69.43 0 130.9-32.17 130.9-32.17L479.7 331z"/></svg>${translate('Report')}</div></div></div>` : ''}

  ${(prompt.is_mine || lastSelectedPromptFolder?.id === 'recent') ? `<div role="menuitem" id="delete-prompt-card-button-${promptId}" class="flex gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group text-red-500" tabindex="-1" data-orientation="vertical" data-radix-collection-item=""><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.5555 4C10.099 4 9.70052 4.30906 9.58693 4.75114L9.29382 5.8919H14.715L14.4219 4.75114C14.3083 4.30906 13.9098 4 13.4533 4H10.5555ZM16.7799 5.8919L16.3589 4.25342C16.0182 2.92719 14.8226 2 13.4533 2H10.5555C9.18616 2 7.99062 2.92719 7.64985 4.25342L7.22886 5.8919H4C3.44772 5.8919 3 6.33961 3 6.8919C3 7.44418 3.44772 7.8919 4 7.8919H4.10069L5.31544 19.3172C5.47763 20.8427 6.76455 22 8.29863 22H15.7014C17.2354 22 18.5224 20.8427 18.6846 19.3172L19.8993 7.8919H20C20.5523 7.8919 21 7.44418 21 6.8919C21 6.33961 20.5523 5.8919 20 5.8919H16.7799ZM17.888 7.8919H6.11196L7.30423 19.1057C7.3583 19.6142 7.78727 20 8.29863 20H15.7014C16.2127 20 16.6417 19.6142 16.6958 19.1057L17.888 7.8919ZM10 10C10.5523 10 11 10.4477 11 11V16C11 16.5523 10.5523 17 10 17C9.44772 17 9 16.5523 9 16V11C9 10.4477 9.44772 10 10 10ZM14 10C14.5523 10 15 10.4477 15 11V16C15 16.5523 14.5523 17 14 17C13.4477 17 13 16.5523 13 16V11C13 10.4477 13.4477 10 14 10Z" fill="currentColor"></path></svg>${translate('Delete')}</div></div></div>` : ''}`;

  document.body.insertAdjacentHTML('beforeend', menu);
  adjustMenuPosition(document.querySelector('#prompt-card-menu'));
  addPromptManagerCardMenuEventListeners(prompt);

  document.querySelector('#prompt-card-menu').addEventListener('mouseleave', () => {
    promptSettingsElement.querySelector('svg').classList.replace('flex', 'hidden');
    // document.querySelector('#prompt-card-menu').remove();
  });
}
function addPromptManagerCardMenuEventListeners(prompt) {
  const promptId = prompt.id;
  const runPromptCardButton = document.querySelector(`#run-prompt-card-button-${promptId}`);
  const runFromStepPromptCardButton = document.querySelector(`#run-from-step-prompt-card-button-${promptId}`);
  const duplicatePromptCardButton = document.querySelector(`#duplicate-prompt-card-button-${promptId}`);
  const publicPromptCardButton = document.querySelector(`#public-prompt-card-button-${promptId}`);
  const viewPromptCardButton = document.querySelector(`#view-prompt-card-button-${promptId}`);
  const movePromptCardButton = document.querySelector(`#move-prompt-card-button-${promptId}`);
  const reportPromptCardButton = document.querySelector(`#report-prompt-card-button-${promptId}`);
  const deletePromptCardButton = document.querySelector(`#delete-prompt-card-button-${promptId}`);

  runPromptCardButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    closeMenus();
    document.querySelector('#modal-manager #modal-close-button-manager')?.click();
    runPromptChain(prompt, 0, !e.shiftKey);
  });

  runFromStepPromptCardButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenus();

    toast('Click on the play button of the step you want to start from', 'info', 10000);
    openPromptEditorModal(prompt);
    const allRunFromHereIcons = document.querySelectorAll('#run-from-here-icon');
    allRunFromHereIcons.forEach((icon) => {
      // set icon fill and stroke to 19c37d
      icon.style.fill = '#19c37d';
      icon.style.stroke = '#19c37d';
    });
  });

  viewPromptCardButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenus();

    // this is for recent promtps
    const newPrompt = { ...prompt };
    if (!prompt.is_mine) { // recent, public+notmine
      newPrompt.is_public = false;
      delete newPrompt.id;
      delete newPrompt.folder;
    }
    openPromptEditorModal(newPrompt);
  });

  duplicatePromptCardButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenus();
    const lastSelectedPromptFolder = getLastSelectedPromptFolder();
    updatePromptFolderCount(null, lastSelectedPromptFolder?.id, 1);
    chrome.runtime.sendMessage({
      type: 'duplicatePrompt',
      forceRefresh: true,
      detail: {
        promptId,
      },
    }, (newPrompt) => {
      if (newPrompt.error && newPrompt.error.type === 'limit') {
        errorUpgradeConfirmation(newPrompt.error);
        return;
      }
      initializeContinueButton(true);
      // close card menu
      document.querySelector('#prompt-card-menu')?.remove();
      // add the new prompt card to the list
      const currentPromptCard = document.querySelector(`#prompt-card-${promptId}`);
      addOrReplacePromptCard(newPrompt, currentPromptCard);
    });
  });

  publicPromptCardButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenus();

    chrome.runtime.sendMessage({
      type: 'togglePromptPublic',
      forceRefresh: true,
      detail: {
        promptId,
      },
    }, (response) => {
      const lastSelectedPromptFolder = getLastSelectedPromptFolder();
      if (!response.prompt.is_public && lastSelectedPromptFolder?.id === 'public') {
        document.querySelector(`#prompt-card-${promptId}`).remove();
        return;
      }
      addOrReplacePromptCard(response.prompt);
    });
  });

  movePromptCardButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenus();

    const promptCardCheckbox = document.querySelector(`#prompt-checkbox-${promptId}`);
    if (promptCardCheckbox && !promptCardCheckbox.checked) {
      promptCardCheckbox.click();
    }
    setTimeout(() => handleClickMovePromptsButton(), 100);
  });

  reportPromptCardButton?.addEventListener('click', () => {
    openReportPromptModal(prompt);
  });
  deletePromptCardButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenus();

    showConfirmDialog('Delete prompt', 'Are you sure you want to delete this prompt?', 'Cancel', 'Delete', null, () => {
      document.querySelector(`#prompt-card-${promptId}`).remove();
      const promptList = document.querySelector('#modal-manager #prompt-manager-prompt-list');
      if (promptList.children.length === 0) {
        promptList.appendChild(noPromptElement());
      }
      const lastSelectedPromptFolder = getLastSelectedPromptFolder();
      if (lastSelectedPromptFolder?.id === 'recent') {
        chrome.storage.local.get(['userInputValueHistory'], (res) => {
          const newHistory = res.userInputValueHistory.filter((item) => item.inputValue !== prompt.steps[0]);
          chrome.storage.local.set({ userInputValueHistory: newHistory }, () => {
          });
        });
        return;
      }
      updatePromptFolderCount(lastSelectedPromptFolder?.id, null, 1);

      chrome.runtime.sendMessage({
        type: 'deletePrompts',
        detail: {
          promptIds: [promptId],
        },
      }, () => {
        initializeContinueButton(true);
      });
    });
  });
}

function toggleReportSubmitButton(selectedOption) {
  const reportModalSubmitButton = document.querySelector('#report-modal-submit-button');
  if (selectedOption.code === 'select') {
    reportModalSubmitButton.disabled = true;
  } else {
    reportModalSubmitButton.disabled = false;
  }
}
function openReportPromptModal(prompt) {
  const reportModal = document.createElement('div');
  document.body.appendChild(reportModal);

  reportModal.style = 'position:fixed;top:0px;left:0px;width:100%;height:100%;background-color:rgba(0,0,0,0.5);z-index:10010;display:flex;align-items:center;justify-content:center;color:lightslategray;';
  reportModal.id = 'report-modal';
  reportModal.addEventListener('click', (e) => {
    if (e.target.id === 'report-modal') {
      reportModal.remove();
    }
  });
  const reportModalContent = document.createElement('div');
  reportModalContent.style = 'width:400px;min-height:300px;background-color:#0b0d0e;border-radius:8px;padding:16px;display:flex;flex-direction:column;align-items:flex-start;justify-content:start;border:solid 1px lightslategray;';
  reportModal.appendChild(reportModalContent);
  const reportModalTitle = document.createElement('div');
  reportModalTitle.style = 'font-size:1.25rem;font-weight:500;';
  reportModalTitle.textContent = 'Report prompt';
  reportModalContent.appendChild(reportModalTitle);

  const reportModalResonTitle = document.createElement('div');
  reportModalResonTitle.style = 'font-size:0.875rem;font-weight:500;margin-top:32px;';
  reportModalResonTitle.textContent = 'Why are you reporting this prompt?';
  reportModalContent.appendChild(reportModalResonTitle);
  // add dropdown for reasons
  const reasonSelectorWrapper = document.createElement('div');
  reasonSelectorWrapper.style = 'position:relative;width:100%;z-index:1000;margin-top:16px;';
  reasonSelectorWrapper.innerHTML = dropdown('Report-Reason', reportReasonList, reportReasonList[0], 'code', 'left');
  reportModalContent.appendChild(reasonSelectorWrapper);
  addDropdownEventListener('Report-Reason', reportReasonList, 'code', (selectedOption) => toggleReportSubmitButton(selectedOption));
  // add cancel submit button
  const reportModalButtonWrapper = document.createElement('div');
  reportModalButtonWrapper.style = 'display:flex;justify-content:flex-end;align-items:center;width:100%;margin-top:32px;';
  reportModalContent.appendChild(reportModalButtonWrapper);
  const reportModalCancelButton = document.createElement('button');
  reportModalCancelButton.classList = 'btn btn-secondary border-0';
  reportModalCancelButton.style = 'font-size:0.875rem;font-weight:500;padding:8px 16px;margin-right:16px;';
  reportModalCancelButton.textContent = 'Cancel';
  reportModalCancelButton.addEventListener('click', () => {
    reportModal.remove();
  });
  reportModalButtonWrapper.appendChild(reportModalCancelButton);
  const reportModalSubmitButton = document.createElement('button');
  reportModalSubmitButton.classList = 'btn btn-primary border-0';
  reportModalSubmitButton.id = 'report-modal-submit-button';
  reportModalSubmitButton.disabled = true;
  reportModalSubmitButton.style = 'font-size:0.875rem;font-weight:500;padding:8px 16px;';
  reportModalSubmitButton.textContent = 'Submit';
  reportModalSubmitButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({
      type: 'reportPrompt',
      forceRefresh: true,
      detail: {
        promptId: prompt.id,
      },
    }, (data) => {
      if (data.status === 'success') {
        toast('Prompt reported');
      }
      if (data.status === 'same user') {
        toast('You have already reported this prompt');
      }
    });
    reportModal.remove();
    const curLibraryItemActionWrapper = document.querySelector(`#library-item-action-wrapper-${prompt.id}`);
    curLibraryItemActionWrapper.style.opacity = '0.3';
    curLibraryItemActionWrapper.style.pointerEvents = 'none';
  });
  reportModalButtonWrapper.appendChild(reportModalSubmitButton);
}
