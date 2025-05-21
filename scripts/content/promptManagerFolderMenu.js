/* global showConfirmDialog, errorUpgradeConfirmation, initializeContinueButton, noPromptFolderElemet, toast, selectedPromptFolderBreadcrumb, openMovePromptFolderModal, rgba2hex, translate, closeMenus, debounce, noPromptElement, promptFolderElement, adjustMenuPosition */
// eslint-disable-next-line no-unused-vars
async function showPromptManagerFolderMenu(folderSettingsElement, folder, leftMenu = false) {
  const folderId = folder.id;
  const folderElement = document.querySelector(`#prompt-folder-wrapper-${folderId}`);
  const hasImage = folder.image || folder.image_url;
  const hasSubscription = await chrome.runtime.sendMessage({
    type: 'checkHasSubscription',
  });
  const { right, top } = folderSettingsElement.getBoundingClientRect();
  const translateX = leftMenu ? right - 236 : right + 2;
  const translateY = top + 12;
  const menu = `<div id="prompt-manager-folder-menu" dir="ltr" style="position:fixed;left:0;top:0;transform:translate3d(${translateX}px,${translateY}px,0);min-width:max-content;z-index:10001;--radix-popper-anchor-width:18px;--radix-popper-anchor-height:18px;--radix-popper-available-width:1167px;--radix-popper-available-height:604px;--radix-popper-transform-origin:0% 0px"><div data-side="bottom" data-align="start" role="menu" aria-orientation="vertical" data-state="open" data-radix-menu-content="" dir="ltr" aria-labelledby="radix-:r6g:" class="text-token-text-primary mt-2 min-w-[200px] max-w-xs rounded-lg border border-token-border-medium bg-token-main-surface-primary shadow-lg" tabindex="-1" data-orientation="vertical" style="outline:0;--radix-dropdown-menu-content-transform-origin:var(--radix-popper-transform-origin);--radix-dropdown-menu-content-available-width:var(--radix-popper-available-width);--radix-dropdown-menu-content-available-height:var(--radix-popper-available-height);--radix-dropdown-menu-trigger-width:var(--radix-popper-anchor-width);--radix-dropdown-menu-trigger-height:var(--radix-popper-anchor-height);pointer-events:auto">
  ${['recent', 'favorites'].includes(folderId) ? `<div role="menuitem" id="clear-all-prompt-folder-button-${folderId}" class="flex gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group text-red-500" tabindex="-1" data-orientation="vertical" data-radix-collection-item=""><svg  viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.5555 4C10.099 4 9.70052 4.30906 9.58693 4.75114L9.29382 5.8919H14.715L14.4219 4.75114C14.3083 4.30906 13.9098 4 13.4533 4H10.5555ZM16.7799 5.8919L16.3589 4.25342C16.0182 2.92719 14.8226 2 13.4533 2H10.5555C9.18616 2 7.99062 2.92719 7.64985 4.25342L7.22886 5.8919H4C3.44772 5.8919 3 6.33961 3 6.8919C3 7.44418 3.44772 7.8919 4 7.8919H4.10069L5.31544 19.3172C5.47763 20.8427 6.76455 22 8.29863 22H15.7014C17.2354 22 18.5224 20.8427 18.6846 19.3172L19.8993 7.8919H20C20.5523 7.8919 21 7.44418 21 6.8919C21 6.33961 20.5523 5.8919 20 5.8919H16.7799ZM17.888 7.8919H6.11196L7.30423 19.1057C7.3583 19.6142 7.78727 20 8.29863 20H15.7014C16.2127 20 16.6417 19.6142 16.6958 19.1057L17.888 7.8919ZM10 10C10.5523 10 11 10.4477 11 11V16C11 16.5523 10.5523 17 10 17C9.44772 17 9 16.5523 9 16V11C9 10.4477 9.44772 10 10 10ZM14 10C14.5523 10 15 10.4477 15 11V16C15 16.5523 14.5523 17 14 17C13.4477 17 13 16.5523 13 16V11C13 10.4477 13.4477 10 14 10Z" fill="currentColor"></path></svg>${translate('Clear all')}</div></div></div>`
      : `<div role="menuitem" id="rename-prompt-folder-button-${folderId}" class="flex gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item=""><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" fill="none" class="icon-md"><path fill="currentColor" d="M184 160C193.5 160 202.1 165.6 205.9 174.3L269.9 318.3C275.3 330.4 269.9 344.5 257.7 349.9C245.6 355.3 231.5 349.9 226.1 337.7L221.7 328H146.3L141.9 337.7C136.5 349.9 122.4 355.3 110.3 349.9C98.14 344.5 92.69 330.4 98.07 318.3L162.1 174.3C165.9 165.6 174.5 160 184 160H184zM167.6 280H200.4L184 243.1L167.6 280zM304 184C304 170.7 314.7 160 328 160H380C413.1 160 440 186.9 440 220C440 229.2 437.9 237.9 434.2 245.7C447.5 256.7 456 273.4 456 292C456 325.1 429.1 352 396 352H328C314.7 352 304 341.3 304 328V184zM352 208V232H380C386.6 232 392 226.6 392 220C392 213.4 386.6 208 380 208H352zM352 304H396C402.6 304 408 298.6 408 292C408 285.4 402.6 280 396 280H352V304zM0 128C0 92.65 28.65 64 64 64H576C611.3 64 640 92.65 640 128V384C640 419.3 611.3 448 576 448H64C28.65 448 0 419.3 0 384V128zM48 128V384C48 392.8 55.16 400 64 400H576C584.8 400 592 392.8 592 384V128C592 119.2 584.8 112 576 112H64C55.16 112 48 119.2 48 128z"/></svg>${translate('Rename')}</div>

      <div role="menuitem" id="add-subfolder-prompt-folder-button-${folderId}" class="flex gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item=""><svg stroke="currentColor" fill="currentColor" class="icon-md" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M448 96h-172.1L226.7 50.75C214.7 38.74 198.5 32 181.5 32H64C28.66 32 0 60.66 0 96v320c0 35.34 28.66 64 64 64h384c35.34 0 64-28.66 64-64V160C512 124.7 483.3 96 448 96zM464 416c0 8.824-7.18 16-16 16H64c-8.82 0-16-7.176-16-16V96c0-8.824 7.18-16 16-16h117.5c4.273 0 8.289 1.664 11.31 4.688L256 144h192c8.82 0 16 7.176 16 16V416zM336 264h-56V207.1C279.1 194.7 269.3 184 256 184S232 194.7 232 207.1V264H175.1C162.7 264 152 274.7 152 288c0 13.26 10.73 23.1 23.1 23.1h56v56C232 381.3 242.7 392 256 392c13.26 0 23.1-10.74 23.1-23.1V311.1h56C349.3 311.1 360 301.3 360 288S349.3 264 336 264z"/></svg>${translate('Add subfolder')}</div>

      <div role="menuitem" id="move-folder-prompt-folder-button-${folderId}" class="flex gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item=""><svg xmlns="http://www.w3.org/2000/svg" stroke="currentColor" fill="currentColor" class="icon-md" viewBox="0 0 576 512"><path d="M544 320h-96l-44.16-27.23C398.8 289.6 392.1 288 387 288H320c-17.67 0-32 14.33-32 32v160c0 17.67 14.33 32 32 32h224c17.67 0 32-14.33 32-32v-128C576 334.3 561.7 320 544 320zM528 464h-192v-128h46.5l40.3 24.86C430.4 365.5 439.1 368 448 368h80V464zM232 160C245.3 160 256 149.3 256 136C256 122.7 245.3 112 232 112H48V24C48 10.74 37.25 0 24 0S0 10.74 0 24v368C0 422.9 25.07 448 56 448h176C245.3 448 256 437.3 256 424c0-13.26-10.75-24-24-24h-176c-4.4 0-8-3.602-8-8V160H232zM544 32h-96l-44.16-27.23C398.8 1.648 392.1 0 387 0H320c-17.67 0-32 14.33-32 32v160c0 17.67 14.33 32 32 32h224c17.67 0 32-14.33 32-32V64C576 46.33 561.7 32 544 32zM528 176h-192v-128h46.5l40.3 24.86C430.4 77.53 439.1 80 448 80h80V176z"/></svg>${translate('Move folder')}</div>

      <div role="menuitem" id="color-prompt-folder-button-${folderId}" class="flex items-center justify-between gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item=""><div class="flex gap-2"><svg stroke="currentColor" fill="currentColor" stroke-width="2" viewBox="0 0 512 512" stroke-linecap="round" stroke-linejoin="round" class="icon-md" xmlns="http://www.w3.org/2000/svg"><path d="M160 255.1C160 273.7 145.7 287.1 128 287.1C110.3 287.1 96 273.7 96 255.1C96 238.3 110.3 223.1 128 223.1C145.7 223.1 160 238.3 160 255.1zM128 159.1C128 142.3 142.3 127.1 160 127.1C177.7 127.1 192 142.3 192 159.1C192 177.7 177.7 191.1 160 191.1C142.3 191.1 128 177.7 128 159.1zM288 127.1C288 145.7 273.7 159.1 256 159.1C238.3 159.1 224 145.7 224 127.1C224 110.3 238.3 95.1 256 95.1C273.7 95.1 288 110.3 288 127.1zM320 159.1C320 142.3 334.3 127.1 352 127.1C369.7 127.1 384 142.3 384 159.1C384 177.7 369.7 191.1 352 191.1C334.3 191.1 320 177.7 320 159.1zM441.9 319.1H344C317.5 319.1 296 341.5 296 368C296 371.4 296.4 374.7 297 377.9C299.2 388.1 303.5 397.1 307.9 407.8C313.9 421.6 320 435.3 320 449.8C320 481.7 298.4 510.5 266.6 511.8C263.1 511.9 259.5 512 256 512C114.6 512 0 397.4 0 256C0 114.6 114.6 0 256 0C397.4 0 512 114.6 512 256C512 256.9 511.1 257.8 511.1 258.7C511.6 295.2 478.4 320 441.9 320V319.1zM463.1 258.2C463.1 257.4 464 256.7 464 255.1C464 141.1 370.9 47.1 256 47.1C141.1 47.1 48 141.1 48 255.1C48 370.9 141.1 464 256 464C258.9 464 261.8 463.9 264.6 463.8C265.4 463.8 265.9 463.6 266.2 463.5C266.6 463.2 267.3 462.8 268.2 461.7C270.1 459.4 272 455.2 272 449.8C272 448.1 271.4 444.3 266.4 432.7C265.8 431.5 265.2 430.1 264.5 428.5C260.2 418.9 253.4 403.5 250.1 387.8C248.7 381.4 248 374.8 248 368C248 314.1 290.1 271.1 344 271.1H441.9C449.6 271.1 455.1 269.3 459.7 266.2C463 263.4 463.1 260.9 463.1 258.2V258.2z"/></svg>${translate('Set color')}</div>
        <div id="color-picker-button-${folderId}" class="flex z-10 cursor-pointer flex items-center">
          <svg id="reset-color-picker" stroke="currentColor" fill="currentColor" stroke-width="2" viewBox="0 0 512 512" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 me-2" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M496 40v160C496 213.3 485.3 224 472 224h-160C298.8 224 288 213.3 288 200s10.75-24 24-24h100.5C382.8 118.3 322.5 80 256 80C158.1 80 80 158.1 80 256s78.97 176 176 176c41.09 0 81.09-14.47 112.6-40.75c10.16-8.5 25.31-7.156 33.81 3.062c8.5 10.19 7.125 25.31-3.062 33.81c-40.16 33.44-91.17 51.77-143.5 51.77C132.4 479.9 32 379.5 32 256s100.4-223.9 223.9-223.9c79.85 0 152.4 43.46 192.1 109.1V40c0-13.25 10.75-24 24-24S496 26.75 496 40z"/></svg><input type="color" class="w-8 h-6" id="color-picker-input-${folderId}" style="cursor:pointer" value="${rgba2hex(folderElement?.style?.backgroundColor) || '#2f2f2f'}" />
        </div>
      </div>

      <div role="menuitem" id="set-image-folder-prompts-button-${folderId}" class="flex items-center justify-between gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item=""><div class="flex gap-2"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" stroke="currentColor" fill="currentColor" stroke-width="2" stroke-linejoin="round" class="icon-md"><path d="M112 112c-17.67 0-32 14.33-32 32s14.33 32 32 32c17.68 0 32-14.33 32-32S129.7 112 112 112zM448 96c0-35.35-28.65-64-64-64H64C28.65 32 0 60.65 0 96v320c0 35.35 28.65 64 64 64h320c35.35 0 64-28.65 64-64V96zM400 416c0 8.822-7.178 16-16 16H64c-8.822 0-16-7.178-16-16v-48h352V416zM400 320h-28.76l-96.58-144.9C271.7 170.7 266.7 168 261.3 168c-5.352 0-10.35 2.672-13.31 7.125l-62.74 94.11L162.9 238.6C159.9 234.4 155.1 232 150 232c-5.109 0-9.914 2.441-12.93 6.574L77.7 320H48V96c0-8.822 7.178-16 16-16h320c8.822 0 16 7.178 16 16V320z"/></svg>${translate('Set image')}</div></div>

      ${hasImage ? `<div role="menuitem" id="remove-image-folder-prompts-button-${folderId}" class="flex items-center justify-between gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item=""><div class="flex gap-2"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" stroke="currentColor" fill="currentColor" stroke-width="2" stroke-linejoin="round" class="icon-md"><path d="M630.8 469.1l-55.95-43.85C575.3 422.2 575.1 419.2 575.1 416l.0034-320c0-35.35-28.65-64-64-64H127.1C113.6 32 100.4 36.98 89.78 45.06L38.81 5.113C28.34-3.058 13.31-1.246 5.109 9.192C-3.063 19.63-1.235 34.72 9.187 42.89L601.2 506.9C605.6 510.3 610.8 512 615.1 512c7.125 0 14.17-3.156 18.91-9.188C643.1 492.4 641.2 477.3 630.8 469.1zM527.1 388.5l-36.11-28.3l-100.7-136.8C387.8 218.8 382.1 216 376 216c-6.113 0-11.82 2.768-15.21 7.379L344.9 245L261.9 180C262.1 176.1 264 172.2 264 168c0-26.51-21.49-48-48-48c-8.336 0-16.05 2.316-22.88 6.057L134.4 80h377.6c8.822 0 16 7.178 16 16V388.5zM254.2 368.3l-37.09-46.1c-3.441-4.279-8.934-6.809-14.77-6.809c-5.842 0-11.33 2.529-14.78 6.809l-75.52 93.81c0-.0293 0 .0293 0 0L111.1 184.5l-48-37.62L63.99 416c0 35.35 28.65 64 64 64h361.1l-201.1-157.6L254.2 368.3z"/></svg>${translate('Remove image')}</div></div>` : ''}

      <div role="menuitem" id="export-folder-prompts-button-${folderId}" class="flex items-center justify-between gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item=""><div class="flex gap-2"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" stroke="currentColor" fill="currentColor" stroke-width="2" stroke-linejoin="round" class="icon-md"><path d="M568.1 303l-80-80c-9.375-9.375-24.56-9.375-33.94 0s-9.375 24.56 0 33.94L494.1 296H216C202.8 296 192 306.8 192 320s10.75 24 24 24h278.1l-39.03 39.03C450.3 387.7 448 393.8 448 400s2.344 12.28 7.031 16.97c9.375 9.375 24.56 9.375 33.94 0l80-80C578.3 327.6 578.3 312.4 568.1 303zM360 384c-13.25 0-24 10.74-24 24V448c0 8.836-7.164 16-16 16H64.02c-8.836 0-16-7.164-16-16L48 64.13c0-8.836 7.164-16 16-16h160L224 128c0 17.67 14.33 32 32 32h79.1v72c0 13.25 10.74 24 23.1 24S384 245.3 384 232V138.6c0-16.98-6.742-33.26-18.75-45.26l-74.63-74.64C278.6 6.742 262.3 0 245.4 0H63.1C28.65 0-.002 28.66 0 64l.0065 384c.002 35.34 28.65 64 64 64H320c35.2 0 64-28.8 64-64v-40C384 394.7 373.3 384 360 384z"></path></svg>${translate('Export')}</div>${hasSubscription ? '' : '<span class="text-white rounded-md bg-green-500 px-2 text-sm">Pro</span>'}</div>

    
      <div role="menuitem" id="delete-prompt-folder-button-${folderId}" class="flex gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group text-red-500" tabindex="-1" data-orientation="vertical" data-radix-collection-item=""><svg  viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.5555 4C10.099 4 9.70052 4.30906 9.58693 4.75114L9.29382 5.8919H14.715L14.4219 4.75114C14.3083 4.30906 13.9098 4 13.4533 4H10.5555ZM16.7799 5.8919L16.3589 4.25342C16.0182 2.92719 14.8226 2 13.4533 2H10.5555C9.18616 2 7.99062 2.92719 7.64985 4.25342L7.22886 5.8919H4C3.44772 5.8919 3 6.33961 3 6.8919C3 7.44418 3.44772 7.8919 4 7.8919H4.10069L5.31544 19.3172C5.47763 20.8427 6.76455 22 8.29863 22H15.7014C17.2354 22 18.5224 20.8427 18.6846 19.3172L19.8993 7.8919H20C20.5523 7.8919 21 7.44418 21 6.8919C21 6.33961 20.5523 5.8919 20 5.8919H16.7799ZM17.888 7.8919H6.11196L7.30423 19.1057C7.3583 19.6142 7.78727 20 8.29863 20H15.7014C16.2127 20 16.6417 19.6142 16.6958 19.1057L17.888 7.8919ZM10 10C10.5523 10 11 10.4477 11 11V16C11 16.5523 10.5523 17 10 17C9.44772 17 9 16.5523 9 16V11C9 10.4477 9.44772 10 10 10ZM14 10C14.5523 10 15 10.4477 15 11V16C15 16.5523 14.5523 17 14 17C13.4477 17 13 16.5523 13 16V11C13 10.4477 13.4477 10 14 10Z" fill="currentColor"></path></svg>${translate('Delete')}</div>`}
    
    </div ></div >`;
  document.body.insertAdjacentHTML('beforeend', menu);
  adjustMenuPosition(document.querySelector('#prompt-manager-folder-menu'));
  addPromptManagerFolderMenuEventListeners(folder);
  document.querySelector('#prompt-manager-folder-menu').addEventListener('mouseleave', () => {
    folderSettingsElement.classList.replace('flex', 'hidden');
  });
}
async function addPromptManagerFolderMenuEventListeners(folder) {
  const folderId = folder.id;

  const renamePromptFolderButton = document.querySelector(`#rename-prompt-folder-button-${folderId}`);
  const addSubfolderPromptFolderButton = document.querySelector(`#add-subfolder-prompt-folder-button-${folderId}`);
  const moveFolderPromptFolderButton = document.querySelector(`#move-folder-prompt-folder-button-${folderId}`);
  const colorPromptFolderButton = document.querySelector(`#color-prompt-folder-button-${folderId}`);
  const setFolderImagePromptsButton = document.querySelector(`#set-image-folder-prompts-button-${folderId}`);
  const removeFolderImagePromptsButton = document.querySelector(`#remove-image-folder-prompts-button-${folderId}`);
  const exportFolderPromptsButton = document.querySelector(`#export-folder-prompts-button-${folderId}`);
  const deletePromptFolderButton = document.querySelector(`#delete-prompt-folder-button-${folderId}`);
  const colorPickerButton = document.querySelector(`#color-picker-button-${folderId}`);
  const clearAllPromptFolderButton = document.querySelector(`#clear-all-prompt-folder-button-${folderId}`);

  const hasSubscription = await chrome.runtime.sendMessage({
    type: 'checkHasSubscription',
  });

  renamePromptFolderButton?.addEventListener('click', () => {
    handleRenamePromptFolderClick(folderId);
  });

  addSubfolderPromptFolderButton?.addEventListener('click', () => {
    closeMenus();
    const userFolders = document.querySelectorAll('#modal-manager #prompt-manager-sidebar-folders > div[id^="prompt-folder-wrapper-"]');
    if (!hasSubscription && userFolders.length >= 5) {
      const error = { type: 'limit', title: 'You have reached the limit', message: 'You have reached the limits of Prompt Folders with free account. Upgrade to Pro to remove all limits.' };
      errorUpgradeConfirmation(error);
      return;
    }
    // click on the folder to open it if not already open

    const curPromptFolderElement = document.querySelector(`#modal-manager #prompt-folder-wrapper-${folderId}`);
    curPromptFolderElement?.click();

    setTimeout(() => {
      chrome.runtime.sendMessage({
        type: 'addPromptFolders',
        forceRefresh: true,
        detail: {
          folders: [{
            name: 'New Category',
            color: folder.color,
            parent_folder: folderId,
            image_url: folder.image || folder.image_url,
          }],
        },
      }, (newPromptFolders) => {
        if (newPromptFolders.error && newPromptFolders.error.type === 'limit') {
          errorUpgradeConfirmation(newPromptFolders.error);
          return;
        }
        if (!newPromptFolders || newPromptFolders.length === 0) return;
        // prompt-manager-subfolder-list
        const managerSubfolderLists = document.querySelector('#prompt-manager-subfolder-list');
        managerSubfolderLists?.prepend(promptFolderElement(newPromptFolders[0]));
        managerSubfolderLists?.scrollIntoView({ block: 'nearest', inline: 'nearest' });

        // update parent folder folder count
        const parentFolderCounts = document.querySelectorAll(`#folder-subfolder-count-${folderId}`);
        parentFolderCounts.forEach((parentFolderCount) => {
          const count = parseInt(parentFolderCount.innerText.split(' ')[0], 10);
          parentFolderCount.innerText = `${count + 1} folder${count + 1 === 1 ? '' : 's'} -`;
        });
        handleRenamePromptFolderClick(newPromptFolders[0].id);
      });
    }, 100);
  });
  moveFolderPromptFolderButton?.addEventListener('click', () => {
    openMovePromptFolderModal(folder);
  });

  colorPromptFolderButton?.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  colorPickerButton?.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  const debouncedFolderColorUpdate = debounce((newData) => {
    // update folder name
    chrome.runtime.sendMessage({
      type: 'updatePromptFolder',
      detail: {
        folderId,
        newData,
      },
    });
  }, 200);
  colorPickerButton?.querySelector('input[id^=color-picker-input-]')?.addEventListener('input', (e) => {
    const newColor = e.target.value;
    const curFolderElement = document.querySelector(`#modal-manager #prompt-folder-wrapper-${folderId}`);
    curFolderElement.style.backgroundColor = newColor;
    // update folder name
    const newData = { color: newColor };
    debouncedFolderColorUpdate(newData);
  });
  // reset click
  colorPickerButton?.querySelector('#reset-color-picker')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeMenus();

    const curFolderElement = document.querySelector(`#modal-manager #prompt-folder-wrapper-${folderId}`);
    curFolderElement.style.backgroundColor = '#2f2f2f';
    // set input value to default color
    colorPickerButton.querySelector('input[id^=color-picker-input-]').value = '#2f2f2f';
    // update folder name
    chrome.runtime.sendMessage({
      type: 'updatePromptFolder',
      detail: {
        folderId,
        newData: { color: '#2f2f2f' },
      },
    });
  });

  setFolderImagePromptsButton?.addEventListener('click', () => {
    closeMenus();
    // open file dialog
    // Create a form element
    const form = document.createElement('form');
    form.method = 'POST';
    form.enctype = 'multipart/form-data';
    form.style.display = 'none'; // Keep form hidden from the UI
    // Create an input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    form.appendChild(fileInput);
    document.body.appendChild(form);

    fileInput.click();
    fileInput.onchange = async () => {
      const file = fileInput.files[0];
      if (!file) {
        return;
      }
      const reader = new FileReader();
      reader.onload = async (e) => {
        // Convert the file to an ArrayBuffer
        const base64String = reader.result.split(',')[1]; // Remove the data URL prefix
        const newData = {
          image: {
            base64: base64String,
            type: file.type,
            name: file.name,
          },
        };
        const imageSrc = e.target.result;
        const curFolderImages = document.querySelectorAll(`#prompt-folder-image-${folderId}`);
        curFolderImages.forEach((el) => {
          el.src = imageSrc;
          el.classList.remove('hidden');
        });

        // upload the image data to database
        // update folder name
        chrome.runtime.sendMessage({
          type: 'updatePromptFolder',
          detail: {
            folderId,
            newData,
          },
        });
      };
      reader.readAsDataURL(file);
    };
  });
  removeFolderImagePromptsButton?.addEventListener('click', () => {
    closeMenus();
    const curFolderImages = document.querySelectorAll(`#prompt-folder-image-${folderId}`);
    curFolderImages.forEach((el) => {
      el.src = chrome.runtime.getURL('icons/folder.png');
      el.classList = 'w-5 h-5 me-3 rounded-md object-cover';
    });
    // update folder name
    chrome.runtime.sendMessage({
      type: 'removePromptFolderImage',
      detail: {
        folderId,
      },
    });
  });
  exportFolderPromptsButton?.addEventListener('click', () => {
    if (!hasSubscription) {
      const error = { title: 'This is a Pro feature', message: 'Exporting prompts requires a Pro subscription. Upgrade to Pro to remove all limits.' };
      errorUpgradeConfirmation(error);
      return;
    }
    chrome.runtime.sendMessage({
      type: 'getAllPrompts',
      detail: {
        folderId,
      },
    }, (data) => {
      if (data.error && data.error.type === 'limit') {
        errorUpgradeConfirmation(data.error);
        return;
      }
      if (!data || Object.keys(data).length === 0) {
        toast('No prompts found', 'error');
        return;
      }
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const createDate = new Date();
      const exportDate = `${createDate.getFullYear()}-${createDate.getMonth() + 1}-${createDate.getDate()}__${createDate.getHours()}-${createDate.getMinutes()}-${createDate.getSeconds()}`;
      a.download = `Superpower ChatGPT Prompts - ${Object.keys(data)[0]} - ${exportDate}.json`;
      a.click();
    });
  });

  deletePromptFolderButton?.addEventListener('click', () => {
    document.querySelector('#prompt-manager-folder-menu').remove();
    showConfirmDialog('Delete prompt category', 'All the prompts in this category and sub categories will be deleted.', 'Cancel', 'Delete', null, () => {
      chrome.runtime.sendMessage({
        type: 'deletePromptFolder',
        detail: {
          folderId,
        },
      }, () => {
        initializeContinueButton(true);
        // remove the folder from the list
        document.querySelector(`#prompt-folder-wrapper-${folderId}`).remove();
        // see if any folder after default prompt folders exist
        const firstFolder = document.querySelector('#prompt-manager-sidebar-folders > div[id^="prompt-folder-wrapper-"]');
        if (firstFolder) {
          // if selectedFolder is deleted, select the first folder
          if (selectedPromptFolderBreadcrumb.map((f) => f.id).includes(folderId)) {
            firstFolder.click();
          }
        } else {
          const sidebarFolderList = document.querySelector('#prompt-manager-sidebar-folders');
          sidebarFolderList.appendChild(noPromptFolderElemet());

          const recentFolder = document.querySelector('#prompt-folder-wrapper-recent');
          if (recentFolder) {
            recentFolder.click();
          }
        }
      });
    });
  });

  clearAllPromptFolderButton?.addEventListener('click', () => {
    document.querySelector('#prompt-manager-folder-menu').remove();
    const dialogTitle = {
      recent: 'Clear prompt history',
      favorites: 'Reset favorite prompts',
    };
    const dialogSubtitle = {
      recent: 'Are you sure you want to clear your prompt history? Pther prompts will not be affected.',
      favorites: 'Are you sure you want to unfave all your favorite prompts?',
    };
    showConfirmDialog(dialogTitle[folderId], dialogSubtitle[folderId], 'Cancel', 'Confirm', null, () => {
      if (selectedPromptFolderBreadcrumb.map((f) => f.id).includes(folderId)) {
        const promptList = document.querySelector('#prompt-manager-prompt-list');
        promptList.innerHTML = '';
        promptList.appendChild(noPromptElement());
      }

      if (folderId === 'recent') {
        chrome.storage.local.set({ userInputValueHistory: [] });
        return;
      }
      if (folderId === 'favorites') {
        chrome.runtime.sendMessage({
          type: 'resetAllFavoritePrompts',
          forceRefresh: true,
        }, () => {
          initializeContinueButton(true);
        });
      }
    });
  });
}
function handleRenamePromptFolderClick(folderId) {
  let skipBlur = false;
  closeMenus();

  const textInput = document.createElement('input');
  const promptFolderNameElement = document.querySelector(`#prompt-folder-name-${folderId}`);
  const oldFolderName = promptFolderNameElement.innerText;
  textInput.id = `prompt-folder-rename-${folderId}`;
  textInput.classList = 'border-0 bg-transparent p-0 focus:ring-0 focus-visible:ring-0 w-full text-white text-sm';
  textInput.value = oldFolderName;
  promptFolderNameElement?.parentElement?.replaceChild(textInput, promptFolderNameElement);
  textInput.focus();
  setTimeout(() => {
    textInput.select();
  }, 50);
  textInput?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeMenus();

    textInput.focus();
  });
  // click out of input or press enter will save the new title
  textInput?.addEventListener('blur', () => {
    if (skipBlur) return;
    const newFolderName = textInput.value;
    if (newFolderName !== oldFolderName) {
      updatePromptFolderNameElement(promptFolderNameElement, folderId, newFolderName);
    }
    textInput.parentElement?.replaceChild(promptFolderNameElement, textInput);
  });
  textInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.which === 13) {
      skipBlur = true;
      const newFolderName = textInput.value;
      if (newFolderName !== oldFolderName) {
        updatePromptFolderNameElement(promptFolderNameElement, folderId, newFolderName);
      }
      textInput.parentElement?.replaceChild(promptFolderNameElement, textInput);
    }
    // esc key cancels the rename
    if (e.key === 'Escape') {
      skipBlur = true;
      promptFolderNameElement.innerText = oldFolderName;
      textInput.parentElement?.replaceChild(promptFolderNameElement, textInput);
    }
  });
}
function updatePromptFolderNameElement(promptFolderNameElement, folderId, newName) {
  if (!newName.trim()) return;
  promptFolderNameElement.innerText = newName;

  // update folder name
  chrome.runtime.sendMessage({
    type: 'updatePromptFolder',
    detail: {
      folderId,
      newData: { name: newName },
    },
  });
}
