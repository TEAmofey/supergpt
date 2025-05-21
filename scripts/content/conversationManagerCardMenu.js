/* global handleDeleteConversation, shareConversation, buttonGenerator, errorUpgradeConfirmation, downloadSelectedImages, openNotePreviewModal, openExportModal, showConversationPreviewWrapper, translate, handleClickMoveConversationsButton, closeMenus, renameConversation, renameConversationElements, openMoveConvToFolderModal, getConversationsByIds, isDescendant, resetConversationManagerSelection, getLastSelectedConversationFolder, updateConversationFolderCount, toast, addConversationToSidebarFolder, replaceConversationInSidebarFolder, findValueByKey, adjustMenuPosition, updateSelectedConvCard, handleClickArchiveConversationsButton, handleClickUnarchiveConversationsButton, attachConversationToInput, cachedSettings */
// eslint-disable-next-line no-unused-vars
async function showConversationManagerCardMenu(conversationSettingsElement, conversation, sidebarFolder = false, leftMenu = false) {
  const { showFoldersInLeftSidebar } = cachedSettings;
  const hasSubscription = await chrome.runtime.sendMessage({
    type: 'checkHasSubscription',
  });

  const conversationId = conversation.conversation_id;
  const navbarMenu = conversationSettingsElement.id === 'navbar-conversation-menu-button';

  const { right, top } = conversationSettingsElement.getBoundingClientRect();

  let translateX = (!showFoldersInLeftSidebar && sidebarFolder) || leftMenu ? right - 244 : right - 6;
  let translateY = top + 20;
  if (navbarMenu) {
    translateX -= 16;
    translateY += 16;
  }
  const menu = `<div id="conversation-card-menu" dir="ltr" style="transform:translate3d(${translateX}px,${translateY}px,0);position:fixed;left:0;top:0;min-width:max-content;z-index:10001;--radix-popper-anchor-width:18px;--radix-popper-anchor-height:18px;--radix-popper-available-width:1167px;--radix-popper-available-height:604px;--radix-popper-transform-origin:0% 0px"><div data-side="bottom" data-align="start" role="menu" aria-orientation="vertical" data-state="open" data-radix-menu-content="" dir="ltr" aria-labelledby="radix-:r6g:" class="max-w-xs rounded-lg border text-token-text-primary border-token-border-medium bg-token-main-surface-primary shadow-lg" tabindex="-1" data-orientation="vertical" style="min-width:200px; outline:0;--radix-dropdown-menu-content-transform-origin:var(--radix-popper-transform-origin);--radix-dropdown-menu-content-available-width:var(--radix-popper-available-width);--radix-dropdown-menu-content-available-height:var(--radix-popper-available-height);--radix-dropdown-menu-trigger-width:var(--radix-popper-anchor-width);--radix-dropdown-menu-trigger-height:var(--radix-popper-anchor-height);pointer-events:auto">
  
  ${navbarMenu ? '' : `<div role="menuitem" id="preview-conversation-card-button-${conversationId}" title="SHIFT + Click on the card" class="flex gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item=""><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" class="icon-md"><path d="M160 256C160 185.3 217.3 128 288 128C358.7 128 416 185.3 416 256C416 326.7 358.7 384 288 384C217.3 384 160 326.7 160 256zM288 336C332.2 336 368 300.2 368 256C368 211.8 332.2 176 288 176C287.3 176 286.7 176 285.1 176C287.3 181.1 288 186.5 288 192C288 227.3 259.3 256 224 256C218.5 256 213.1 255.3 208 253.1C208 254.7 208 255.3 208 255.1C208 300.2 243.8 336 288 336L288 336zM95.42 112.6C142.5 68.84 207.2 32 288 32C368.8 32 433.5 68.84 480.6 112.6C527.4 156 558.7 207.1 573.5 243.7C576.8 251.6 576.8 260.4 573.5 268.3C558.7 304 527.4 355.1 480.6 399.4C433.5 443.2 368.8 480 288 480C207.2 480 142.5 443.2 95.42 399.4C48.62 355.1 17.34 304 2.461 268.3C-.8205 260.4-.8205 251.6 2.461 243.7C17.34 207.1 48.62 156 95.42 112.6V112.6zM288 80C222.8 80 169.2 109.6 128.1 147.7C89.6 183.5 63.02 225.1 49.44 256C63.02 286 89.6 328.5 128.1 364.3C169.2 402.4 222.8 432 288 432C353.2 432 406.8 402.4 447.9 364.3C486.4 328.5 512.1 286 526.6 256C512.1 225.1 486.4 183.5 447.9 147.7C406.8 109.6 353.2 80 288 80V80z"/></svg>${translate('Preview')}</div>
    
    <div role="menuitem" id="open-conversation-card-button-${conversationId}" title="CMD/CTRL + Click on the card" class="flex gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item=""><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" class="icon-md"><path d="M488 0h-135.3c-13.25 0-25.09 7.906-30.19 20.16c-5.062 12.28-2.281 26.25 7.094 35.63l40.69 40.69L177.4 289.4c-12.5 12.5-12.5 32.75 0 45.25C183.6 340.9 191.8 344 200 344s16.38-3.125 22.62-9.375l192.9-192.9l40.69 40.69C462.5 188.7 470.8 192 479.3 192c4.219 0 8.469-.8125 12.56-2.5C504.1 184.4 512 172.6 512 159.3V24C512 10.75 501.3 0 488 0zM392 320c-13.25 0-24 10.75-24 24v112c0 4.406-3.594 8-8 8h-304c-4.406 0-8-3.594-8-8v-304c0-4.406 3.594-8 8-8h112C181.3 144 192 133.3 192 120S181.3 96 168 96h-112C25.13 96 0 121.1 0 152v304C0 486.9 25.13 512 56 512h304c30.88 0 56-25.12 56-56v-112C416 330.8 405.3 320 392 320z"/></svg>${translate('Open')}<span class='ms-auto'>${buttonGenerator(['⌘', 'Click'], 'xs')}</span></div>
    
    <div role="menuitem" id="rename-conversation-card-button-${conversationId}" class="flex items-center justify-between gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item=""><div class="flex gap-2"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" fill="none" class="icon-md"><path fill="currentColor" d="M184 160C193.5 160 202.1 165.6 205.9 174.3L269.9 318.3C275.3 330.4 269.9 344.5 257.7 349.9C245.6 355.3 231.5 349.9 226.1 337.7L221.7 328H146.3L141.9 337.7C136.5 349.9 122.4 355.3 110.3 349.9C98.14 344.5 92.69 330.4 98.07 318.3L162.1 174.3C165.9 165.6 174.5 160 184 160H184zM167.6 280H200.4L184 243.1L167.6 280zM304 184C304 170.7 314.7 160 328 160H380C413.1 160 440 186.9 440 220C440 229.2 437.9 237.9 434.2 245.7C447.5 256.7 456 273.4 456 292C456 325.1 429.1 352 396 352H328C314.7 352 304 341.3 304 328V184zM352 208V232H380C386.6 232 392 226.6 392 220C392 213.4 386.6 208 380 208H352zM352 304H396C402.6 304 408 298.6 408 292C408 285.4 402.6 280 396 280H352V304zM0 128C0 92.65 28.65 64 64 64H576C611.3 64 640 92.65 640 128V384C640 419.3 611.3 448 576 448H64C28.65 448 0 419.3 0 384V128zM48 128V384C48 392.8 55.16 400 64 400H576C584.8 400 592 392.8 592 384V128C592 119.2 584.8 112 576 112H64C55.16 112 48 119.2 48 128z"/></svg>${translate('Rename')}</div> </div>
  `}


  <div role="menuitem" id="share-conversation-card-button-${conversationId}" class="flex gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item=""><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="icon-md" xmlns="http://www.w3.org/2000/svg"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>${translate('Share')}</div>

  ${navbarMenu ? `<div role="menuitem" id="custom-instruction-profile-conversation-card-button-${conversationId}" class="flex gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item=""><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md"><path d="M10.663 6.3872C10.8152 6.29068 11 6.40984 11 6.59007V8C11 8.55229 11.4477 9 12 9C12.5523 9 13 8.55229 13 8V6.59007C13 6.40984 13.1848 6.29068 13.337 6.3872C14.036 6.83047 14.5 7.61105 14.5 8.5C14.5 9.53284 13.8737 10.4194 12.9801 10.8006C12.9932 10.865 13 10.9317 13 11V13C13 13.5523 12.5523 14 12 14C11.4477 14 11 13.5523 11 13V11C11 10.9317 11.0068 10.865 11.0199 10.8006C10.1263 10.4194 9.5 9.53284 9.5 8.5C9.5 7.61105 9.96397 6.83047 10.663 6.3872Z" fill="currentColor"></path><path d="M17.9754 4.01031C17.8588 4.00078 17.6965 4.00001 17.4 4.00001H9.8C8.94342 4.00001 8.36113 4.00078 7.91104 4.03756C7.47262 4.07338 7.24842 4.1383 7.09202 4.21799C6.7157 4.40974 6.40973 4.7157 6.21799 5.09202C6.1383 5.24842 6.07337 5.47263 6.03755 5.91104C6.00078 6.36113 6 6.94343 6 7.80001V16.1707C6.31278 16.0602 6.64937 16 7 16H18L18 4.60001C18 4.30348 17.9992 4.14122 17.9897 4.02464C17.9893 4.02 17.9889 4.0156 17.9886 4.01145C17.9844 4.01107 17.98 4.01069 17.9754 4.01031ZM17.657 18H7C6.44772 18 6 18.4477 6 19C6 19.5523 6.44772 20 7 20H17.657C17.5343 19.3301 17.5343 18.6699 17.657 18ZM4 19L4 7.75871C3.99999 6.95374 3.99998 6.28937 4.04419 5.74818C4.09012 5.18608 4.18868 4.66938 4.43597 4.18404C4.81947 3.43139 5.43139 2.81947 6.18404 2.43598C6.66937 2.18869 7.18608 2.09012 7.74818 2.0442C8.28937 1.99998 8.95373 1.99999 9.7587 2L17.4319 2C17.6843 1.99997 17.9301 1.99994 18.1382 2.01695C18.3668 2.03563 18.6366 2.07969 18.908 2.21799C19.2843 2.40974 19.5903 2.7157 19.782 3.09203C19.9203 3.36345 19.9644 3.63318 19.9831 3.86178C20.0001 4.06994 20 4.31574 20 4.56812L20 17C20 17.1325 19.9736 17.2638 19.9225 17.386C19.4458 18.5253 19.4458 19.4747 19.9225 20.614C20.0517 20.9227 20.0179 21.2755 19.8325 21.5541C19.6471 21.8326 19.3346 22 19 22H7C5.34315 22 4 20.6569 4 19Z" fill="currentColor"></path></svg>${translate('Custom instruction profile')}</div>` : ''}

  <div role="menuitem" id="move-conversation-card-button-${conversationId}" class="flex gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item=""><svg xmlns="http://www.w3.org/2000/svg" stroke="currentColor" fill="currentColor" stroke-linecap="round" stroke-linejoin="round" class="icon-md" stroke-width="2" viewBox="0 0 512 512"><path d="M448 96h-172.1L226.7 50.75C214.7 38.74 198.5 32 181.5 32H64C28.66 32 0 60.66 0 96v320c0 35.34 28.66 64 64 64h384c35.34 0 64-28.66 64-64V160C512 124.7 483.3 96 448 96zM464 416c0 8.824-7.18 16-16 16H64c-8.82 0-16-7.176-16-16V96c0-8.824 7.18-16 16-16h117.5c4.273 0 8.289 1.664 11.31 4.688L256 144h192c8.82 0 16 7.176 16 16V416zM336 264h-56V207.1C279.1 194.7 269.3 184 256 184S232 194.7 232 207.1V264H175.1C162.7 264 152 274.7 152 288c0 13.26 10.73 23.1 23.1 23.1h56v56C232 381.3 242.7 392 256 392c13.26 0 23.1-10.74 23.1-23.1V311.1h56C349.3 311.1 360 301.3 360 288S349.3 264 336 264z"/></svg>${translate('Move')}</div>
  
  ${conversation?.folder?.id ? `<div role="menuitem" id="remove-conversation-card-button-${conversationId}" class="flex gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item=""><svg xmlns="http://www.w3.org/2000/svg" stroke="currentColor" fill="currentColor" stroke-linecap="round" stroke-linejoin="round" class="icon-md" stroke-width="2" viewBox="0 0 512 512"><path d="M448 96h-172.1L226.7 50.75C214.7 38.74 198.5 32 181.5 32H64C28.66 32 0 60.66 0 96v320c0 35.34 28.66 64 64 64h384c35.34 0 64-28.66 64-64V160C512 124.7 483.3 96 448 96zM464 416c0 8.824-7.18 16-16 16H64c-8.82 0-16-7.176-16-16V96c0-8.824 7.18-16 16-16h117.5c4.273 0 8.289 1.664 11.31 4.688L256 144h192c8.82 0 16 7.176 16 16V416zM336 264H175.1C162.7 264 152 274.7 152 288c0 13.26 10.73 23.1 23.1 23.1h160C349.3 311.1 360 301.3 360 288S349.3 264 336 264z"/></svg>${translate('Remove from folder')}</div>` : ''}


  <div role="menuitem" id="export-conversation-card-button-${conversationId}" class="flex gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item=""><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" stroke="currentColor" fill="currentColor" stroke-width="2" stroke-linejoin="round" class="icon-md"><path d="M568.1 303l-80-80c-9.375-9.375-24.56-9.375-33.94 0s-9.375 24.56 0 33.94L494.1 296H216C202.8 296 192 306.8 192 320s10.75 24 24 24h278.1l-39.03 39.03C450.3 387.7 448 393.8 448 400s2.344 12.28 7.031 16.97c9.375 9.375 24.56 9.375 33.94 0l80-80C578.3 327.6 578.3 312.4 568.1 303zM360 384c-13.25 0-24 10.74-24 24V448c0 8.836-7.164 16-16 16H64.02c-8.836 0-16-7.164-16-16L48 64.13c0-8.836 7.164-16 16-16h160L224 128c0 17.67 14.33 32 32 32h79.1v72c0 13.25 10.74 24 23.1 24S384 245.3 384 232V138.6c0-16.98-6.742-33.26-18.75-45.26l-74.63-74.64C278.6 6.742 262.3 0 245.4 0H63.1C28.65 0-.002 28.66 0 64l.0065 384c.002 35.34 28.65 64 64 64H320c35.2 0 64-28.8 64-64v-40C384 394.7 373.3 384 360 384z"/></svg>${translate('Export')}</div>

  <div role="menuitem" id="archive-conversation-card-button-${conversationId}" class="flex gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item=""><svg viewBox="0 0 18 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="icon-md"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.62188 3.07918C3.87597 2.571 4.39537 2.25 4.96353 2.25H13.0365C13.6046 2.25 14.124 2.571 14.3781 3.07918L15.75 5.82295V13.5C15.75 14.7426 14.7426 15.75 13.5 15.75H4.5C3.25736 15.75 2.25 14.7426 2.25 13.5V5.82295L3.62188 3.07918ZM13.0365 3.75H4.96353L4.21353 5.25H13.7865L13.0365 3.75ZM14.25 6.75H3.75V13.5C3.75 13.9142 4.08579 14.25 4.5 14.25H13.5C13.9142 14.25 14.25 13.9142 14.25 13.5V6.75ZM6.75 9C6.75 8.58579 7.08579 8.25 7.5 8.25H10.5C10.9142 8.25 11.25 8.58579 11.25 9C11.25 9.41421 10.9142 9.75 10.5 9.75H7.5C7.08579 9.75 6.75 9.41421 6.75 9Z" fill="currentColor"></path></svg>${translate(conversation.is_archived ? 'Unarchive' : 'Archive')}</div>

  ${(navbarMenu || sidebarFolder) ? `<div role="menuitem" id="favorite-conversation-card-button-${conversationId}" class="flex items-center justify-between gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item=""><div class="flex gap-2">${conversation.is_favorite ? `<svg class="icon-md" fill="gold" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M381.2 150.3L524.9 171.5C536.8 173.2 546.8 181.6 550.6 193.1C554.4 204.7 551.3 217.3 542.7 225.9L438.5 328.1L463.1 474.7C465.1 486.7 460.2 498.9 450.2 506C440.3 513.1 427.2 514 416.5 508.3L288.1 439.8L159.8 508.3C149 514 135.9 513.1 126 506C116.1 498.9 111.1 486.7 113.2 474.7L137.8 328.1L33.58 225.9C24.97 217.3 21.91 204.7 25.69 193.1C29.46 181.6 39.43 173.2 51.42 171.5L195 150.3L259.4 17.97C264.7 6.954 275.9-.0391 288.1-.0391C300.4-.0391 311.6 6.954 316.9 17.97L381.2 150.3z"/></svg>${translate('Remove from Favorites')}` : `<svg class="icon-md" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M287.9 0C297.1 0 305.5 5.25 309.5 13.52L378.1 154.8L531.4 177.5C540.4 178.8 547.8 185.1 550.7 193.7C553.5 202.4 551.2 211.9 544.8 218.2L433.6 328.4L459.9 483.9C461.4 492.9 457.7 502.1 450.2 507.4C442.8 512.7 432.1 513.4 424.9 509.1L287.9 435.9L150.1 509.1C142.9 513.4 133.1 512.7 125.6 507.4C118.2 502.1 114.5 492.9 115.1 483.9L142.2 328.4L31.11 218.2C24.65 211.9 22.36 202.4 25.2 193.7C28.03 185.1 35.5 178.8 44.49 177.5L197.7 154.8L266.3 13.52C270.4 5.249 278.7 0 287.9 0L287.9 0zM287.9 78.95L235.4 187.2C231.9 194.3 225.1 199.3 217.3 200.5L98.98 217.9L184.9 303C190.4 308.5 192.9 316.4 191.6 324.1L171.4 443.7L276.6 387.5C283.7 383.7 292.2 383.7 299.2 387.5L404.4 443.7L384.2 324.1C382.9 316.4 385.5 308.5 391 303L476.9 217.9L358.6 200.5C350.7 199.3 343.9 194.3 340.5 187.2L287.9 78.95z"/></svg>${translate('Add to Favorites')}`}</div></div>` : ''}


  <div role="menuitem" id="edit-note-conversation-card-button-${conversationId}" class="flex items-center justify-between gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item=""><div class="flex gap-2"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md"><path fill-rule="evenodd" clip-rule="evenodd" d="M13.2929 4.29291C15.0641 2.52167 17.9359 2.52167 19.7071 4.2929C21.4783 6.06414 21.4783 8.93588 19.7071 10.7071L18.7073 11.7069L11.1603 19.2539C10.7182 19.696 10.1489 19.989 9.53219 20.0918L4.1644 20.9864C3.84584 21.0395 3.52125 20.9355 3.29289 20.7071C3.06453 20.4788 2.96051 20.1542 3.0136 19.8356L3.90824 14.4678C4.01103 13.8511 4.30396 13.2818 4.7461 12.8397L13.2929 4.29291ZM13 7.41422L6.16031 14.2539C6.01293 14.4013 5.91529 14.591 5.88102 14.7966L5.21655 18.7835L9.20339 18.119C9.40898 18.0847 9.59872 17.9871 9.7461 17.8397L16.5858 11L13 7.41422ZM18 9.5858L14.4142 6.00001L14.7071 5.70712C15.6973 4.71693 17.3027 4.71693 18.2929 5.70712C19.2831 6.69731 19.2831 8.30272 18.2929 9.29291L18 9.5858Z" fill="currentColor"></path></svg>${translate('Edit note')}</div></div>
  
  <div role="menuitem" id="download-images-conversation-card-button-${conversationId}" class="flex items-center justify-between gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item=""><div class="flex gap-2"><svg stroke="currentColor" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.70711 10.2929C7.31658 9.90237 6.68342 9.90237 6.29289 10.2929C5.90237 10.6834 5.90237 11.3166 6.29289 11.7071L11.2929 16.7071C11.6834 17.0976 12.3166 17.0976 12.7071 16.7071L17.7071 11.7071C18.0976 11.3166 18.0976 10.6834 17.7071 10.2929C17.3166 9.90237 16.6834 9.90237 16.2929 10.2929L13 13.5858L13 4C13 3.44771 12.5523 3 12 3C11.4477 3 11 3.44771 11 4L11 13.5858L7.70711 10.2929ZM5 19C4.44772 19 4 19.4477 4 20C4 20.5523 4.44772 21 5 21H19C19.5523 21 20 20.5523 20 20C20 19.4477 19.5523 19 19 19L5 19Z" fill="currentColor"></path></svg>${translate('Download images')}</div> ${hasSubscription ? '' : '<span class="text-white rounded-md bg-green-500 px-2 text-sm">Pro</span>'}</div>

  ${navbarMenu ? '' : `<div role="menuitem" id="reference-conversation-card-button-${conversationId}" class="flex items-center justify-between gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group" tabindex="-1" data-orientation="vertical" data-radix-collection-item=""><div class="flex gap-2"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md"><path fill-rule="evenodd" clip-rule="evenodd" d="M18.0322 5.02393C17.7488 5.00078 17.3766 5 16.8 5H11.5002C11.3 6 11.0989 6.91141 10.8903 7.85409C10.7588 8.44955 10.6432 8.97304 10.3675 9.41399C10.1262 9.80009 9.80009 10.1262 9.41399 10.3675C8.97304 10.6432 8.44955 10.7588 7.85409 10.8903C7.81276 10.8994 7.77108 10.9086 7.72906 10.9179L5.21693 11.4762C5.1442 11.4924 5.07155 11.5001 5 11.5002V16.8C5 17.3766 5.00078 17.7488 5.02393 18.0322C5.04612 18.3038 5.0838 18.4045 5.109 18.454C5.20487 18.6422 5.35785 18.7951 5.54601 18.891C5.59546 18.9162 5.69617 18.9539 5.96784 18.9761C6.25118 18.9992 6.62345 19 7.2 19H10C10.5523 19 11 19.4477 11 20C11 20.5523 10.5523 21 10 21H7.16144C6.6343 21 6.17954 21 5.80497 20.9694C5.40963 20.9371 5.01641 20.8658 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3.13419 18.9836 3.06287 18.5904 3.03057 18.195C2.99997 17.8205 2.99998 17.3657 3 16.8385L3 11C3 8.92477 4.02755 6.93324 5.4804 5.4804C6.93324 4.02755 8.92477 3 11 3L16.8385 3C17.3657 2.99998 17.8205 2.99997 18.195 3.03057C18.5904 3.06287 18.9836 3.13419 19.362 3.32698C19.9265 3.6146 20.3854 4.07354 20.673 4.63803C20.8658 5.01641 20.9371 5.40963 20.9694 5.80497C21 6.17954 21 6.6343 21 7.16144V10C21 10.5523 20.5523 11 20 11C19.4477 11 19 10.5523 19 10V7.2C19 6.62345 18.9992 6.25118 18.9761 5.96784C18.9539 5.69617 18.9162 5.59546 18.891 5.54601C18.7951 5.35785 18.6422 5.20487 18.454 5.109C18.4045 5.0838 18.3038 5.04612 18.0322 5.02393ZM5.28014 9.41336L7.2952 8.96556C8.08861 8.78925 8.24308 8.74089 8.35381 8.67166C8.48251 8.59121 8.59121 8.48251 8.67166 8.35381C8.74089 8.24308 8.78925 8.08861 8.96556 7.2952L9.41336 5.28014C8.51014 5.59289 7.63524 6.15398 6.89461 6.89461C6.15398 7.63524 5.59289 8.51014 5.28014 9.41336ZM17 15C17 14.4477 17.4477 14 18 14C18.5523 14 19 14.4477 19 15V17H21C21.5523 17 22 17.4477 22 18C22 18.5523 21.5523 19 21 19H19V21C19 21.5523 18.5523 22 18 22C17.4477 22 17 21.5523 17 21V19H15C14.4477 19 14 18.5523 14 18C14 17.4477 14.4477 17 15 17H17V15Z" fill="currentColor"></path></svg>${translate('Reference this chat')}</div> ${hasSubscription ? '' : '<span class="text-white rounded-md bg-green-500 px-2 text-sm">Pro</span>'}</div>`}

  <div role="menuitem" id="delete-conversation-card-button-${conversationId}" class="flex gap-2 m-1.5 rounded p-2.5 text-sm cursor-pointer focus:ring-0 hover:bg-token-main-surface-secondary radix-disabled:pointer-events-none radix-disabled:opacity-50 group text-red-500" tabindex="-1" data-orientation="vertical" data-radix-collection-item=""><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.5555 4C10.099 4 9.70052 4.30906 9.58693 4.75114L9.29382 5.8919H14.715L14.4219 4.75114C14.3083 4.30906 13.9098 4 13.4533 4H10.5555ZM16.7799 5.8919L16.3589 4.25342C16.0182 2.92719 14.8226 2 13.4533 2H10.5555C9.18616 2 7.99062 2.92719 7.64985 4.25342L7.22886 5.8919H4C3.44772 5.8919 3 6.33961 3 6.8919C3 7.44418 3.44772 7.8919 4 7.8919H4.10069L5.31544 19.3172C5.47763 20.8427 6.76455 22 8.29863 22H15.7014C17.2354 22 18.5224 20.8427 18.6846 19.3172L19.8993 7.8919H20C20.5523 7.8919 21 7.44418 21 6.8919C21 6.33961 20.5523 5.8919 20 5.8919H16.7799ZM17.888 7.8919H6.11196L7.30423 19.1057C7.3583 19.6142 7.78727 20 8.29863 20H15.7014C16.2127 20 16.6417 19.6142 16.6958 19.1057L17.888 7.8919ZM10 10C10.5523 10 11 10.4477 11 11V16C11 16.5523 10.5523 17 10 17C9.44772 17 9 16.5523 9 16V11C9 10.4477 9.44772 10 10 10ZM14 10C14.5523 10 15 10.4477 15 11V16C15 16.5523 14.5523 17 14 17C13.4477 17 13 16.5523 13 16V11C13 10.4477 13.4477 10 14 10Z" fill="currentColor"></path></svg>${translate('Delete')}</div></div></div>`;
  document.body.insertAdjacentHTML('beforeend', menu);
  adjustMenuPosition(document.querySelector('#conversation-card-menu'));

  // conversationSettingsElement.insertAdjacentHTML('beforeend', menu);
  addConversationManagerCardMenuEventListeners(conversation, sidebarFolder, navbarMenu);
  document.querySelector('#conversation-card-menu').addEventListener('mouseleave', () => {
    conversationSettingsElement.querySelector('svg').classList.replace('flex', 'hidden');
    // document.querySelector('#conversation-card-menu').remove();
  });
}
function addConversationManagerCardMenuEventListeners(conversation, sidebarFolder = false, navbarMenu = false) {
  const conversationId = conversation.conversation_id;
  const previewConversationCardButton = document.querySelector(`#preview-conversation-card-button-${conversationId}`);
  const openConversationCardButton = document.querySelector(`#open-conversation-card-button-${conversationId}`);
  const renameConversationCardButton = document.querySelector(`#rename-conversation-card-button-${conversationId}`);
  const shareConversationCardButton = document.querySelector(`#share-conversation-card-button-${conversationId}`);
  const customInstructionProfileConversationCardButton = document.querySelector(`#custom-instruction-profile-conversation-card-button-${conversationId}`);
  const moveConversationCardButton = document.querySelector(`#move-conversation-card-button-${conversationId}`);
  const removeConversationCardButton = document.querySelector(`#remove-conversation-card-button-${conversationId}`);
  const exportConversationCardButton = document.querySelector(`#export-conversation-card-button-${conversationId}`);
  const archiveConversationCardButton = document.querySelector(`#archive-conversation-card-button-${conversationId}`);
  const favoriteConversationCardButton = document.querySelector(`#favorite-conversation-card-button-${conversationId}`);
  const editNoteConversationCardButton = document.querySelector(`#edit-note-conversation-card-button-${conversationId}`);
  const downloadImagesConversationCardButton = document.querySelector(`#download-images-conversation-card-button-${conversationId}`);
  const referenceConversationCardButton = document.querySelector(`#reference-conversation-card-button-${conversationId}`);
  const deleteConversationCardButton = document.querySelector(`#delete-conversation-card-button-${conversationId}`);

  previewConversationCardButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenus();
    updateSelectedConvCard(conversationId, sidebarFolder);
    showConversationPreviewWrapper(conversationId, null, sidebarFolder);
  });
  openConversationCardButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenus();
    window.open(`/c/${conversationId}`, '_blank');
  });
  renameConversationCardButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenus();
    handleRenameConversationClick(conversationId, sidebarFolder);
  });
  shareConversationCardButton?.addEventListener('click', async (e) => {
    e.stopPropagation();
    closeMenus();
    shareConversation(conversationId);
  });

  customInstructionProfileConversationCardButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenus();
    openConversationCustomInstructionProfile(conversationId);
  });

  moveConversationCardButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenus();
    if (sidebarFolder) {
      openMoveConvToFolderModal([conversationId]);
    } else {
      // click on card checkbox
      const conversationCardCheckbox = document.querySelector(`#conversation-checkbox-${conversationId}`);
      if (conversationCardCheckbox && !conversationCardCheckbox.checked) {
        conversationCardCheckbox.click();
      }
      setTimeout(() => handleClickMoveConversationsButton(), 100);
    }
  });
  removeConversationCardButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenus();

    resetConversationManagerSelection();
    // remove the conversations from the list
    const conversationCards = document.querySelectorAll(`#conversation-card-${conversationId}`);
    conversationCards.forEach((conversationCard) => {
      conversationCard.remove();
    });

    const lastSelectedConversationFolder = getLastSelectedConversationFolder();
    updateConversationFolderCount(lastSelectedConversationFolder?.id, null, 1);
    chrome.runtime.sendMessage({
      type: 'removeConversationsFromFolder',
      detail: {
        conversationIds: [conversationId],
      },
    }, () => {
      toast('Conversation removed from folder');
    });
  });
  exportConversationCardButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenus();
    openExportModal([conversationId], navbarMenu ? 'current' : 'selected');
  });
  archiveConversationCardButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenus();
    if (conversation.is_archived) {
      handleClickUnarchiveConversationsButton([conversationId]);
    } else {
      handleClickArchiveConversationsButton([conversationId]);
    }
  });
  favoriteConversationCardButton?.addEventListener('click', async (e) => {
    e.stopPropagation();
    closeMenus();
    const response = await chrome.runtime.sendMessage({
      type: 'toggleConversationFavorite',
      forceRefresh: true,
      detail: {
        conversation,
      },
    });
    const lastSelectedConversationFolder = getLastSelectedConversationFolder();
    if (lastSelectedConversationFolder?.id === 'favorites') {
      if (response.is_favorite) {
        addConversationToSidebarFolder({ ...conversation, is_favorite: response.is_favorite }, 'favorites');
      } else {
        // remove card from the list
        const conversationCards = document.querySelectorAll(`#conversation-card-${conversationId}`);
        conversationCards.forEach((conversationCard) => {
          conversationCard.remove();
        });
      }
    } else {
      replaceConversationInSidebarFolder({ ...conversation, is_favorite: response.is_favorite });
    }
  });
  editNoteConversationCardButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenus();

    chrome.runtime.sendMessage({
      type: 'getNote',
      detail: {
        conversationId,
      },
    }, async (data) => {
      let conversationTitle = document.querySelector(`#conversation-card-${conversationId} #conversation-title`)?.innerText;
      if (!conversationTitle) {
        const conversations = await getConversationsByIds([conversationId]);
        conversationTitle = conversations[0]?.title;
      }
      openNotePreviewModal({ ...data, conversation_id: conversationId, name: conversationTitle });
    });
  });
  downloadImagesConversationCardButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenus();
    chrome.runtime.sendMessage({
      type: 'checkHasSubscription',
    }, (hasSubscription) => {
      if (!hasSubscription) {
        const error = { title: 'This is a Pro feature', message: 'Downloading conversation images requires a Pro subscription. Upgrade to Pro to remove all limits.' };
        errorUpgradeConfirmation(error);
        return;
      }
      const menuButton = document.querySelector(`#conversation-card-settings-menu-${conversationId}`);
      downloadSelectedImages(menuButton, [], conversationId, !e.shiftKey);
    });
  });
  referenceConversationCardButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenus();
    chrome.runtime.sendMessage({
      type: 'checkHasSubscription',
    }, (hasSubscription) => {
      if (!hasSubscription) {
        const error = { title: 'This is a Pro feature', message: 'Referencing conversations in other conversations requires a Pro subscription. Upgrade to Pro to remove all limits.' };
        errorUpgradeConfirmation(error);
        return;
      }
      attachConversationToInput(conversationId);
    });
  });
  deleteConversationCardButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenus();
    handleDeleteConversation(conversationId);
  });
}

function handleRenameConversationClick(conversationId, sidebarFolder = false) {
  let skipBlur = false;
  closeMenus();

  const textInput = document.createElement('input');
  const conversationNameElement = document.querySelector(`${sidebarFolder ? '#sidebar-folder-drawer' : '#modal-manager'} #conversation-card-${conversationId} #conversation-title`);
  const oldConversationName = conversationNameElement.innerText;
  textInput.id = `conversation-rename-${conversationId}`;
  textInput.classList = 'border-0 bg-transparent p-0 focus:ring-0 focus-visible:ring-0 w-full';
  textInput.value = oldConversationName;
  conversationNameElement?.parentElement?.replaceChild(textInput, conversationNameElement);
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
    const newConversationName = textInput.value;
    if (newConversationName !== oldConversationName) {
      updateConversationNameElement(conversationNameElement, conversationId, newConversationName);
    }
    textInput.parentElement?.replaceChild(conversationNameElement, textInput);
  });
  textInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.which === 13) {
      skipBlur = true;
      const newConversationName = textInput.value;
      if (newConversationName !== oldConversationName) {
        updateConversationNameElement(conversationNameElement, conversationId, newConversationName);
      }
      textInput.parentElement?.replaceChild(conversationNameElement, textInput);
    }
    // esc key cancels the rename
    if (e.key === 'Escape') {
      skipBlur = true;
      conversationNameElement.innerText = oldConversationName;
      textInput.parentElement?.replaceChild(conversationNameElement, textInput);
    }
  });
}
function updateConversationNameElement(conversationNameElement, conversationId, newName) {
  if (!newName.trim()) return;
  conversationNameElement.innerText = newName;
  document.querySelectorAll(`#conversation-card-${conversationId} #conversation-title`).forEach((el) => {
    el.innerText = newName;
  });
  // update folder name
  renameConversation(conversationId, newName);
  renameConversationElements(conversationId, newName);
  chrome.runtime.sendMessage({
    type: 'renameConversation',
    detail: {
      conversationId,
      title: newName,
    },
  });
}
async function openConversationCustomInstructionProfile(conversationId) {
  const profileModal = `<div id="conversation-custom-instruction-profile-modal" class="absolute inset-0" style="z-index: 10000;">
    <div data-state="open" class="fixed inset-0 bg-black/50 dark:bg-black/80" style="pointer-events: auto;">
      <div class="h-full w-full grid grid-cols-[10px_1fr_10px] grid-rows-[minmax(10px,1fr)_auto_minmax(10px,1fr)] md:grid-rows-[minmax(20px,1fr)_auto_minmax(20px,1fr)] overflow-y-auto">
        <div id="conversation-custom-instruction-profile-content" role="dialog" aria-describedby="radix-:r3o:" aria-labelledby="radix-:r3n:" data-state="open" class="popover bg-token-main-surface-primary relative start-1/2 col-auto col-start-2 row-auto row-start-2 h-full w-full text-start ltr:-translate-x-1/2 rtl:translate-x-1/2 rounded-2xl shadow-xl flex flex-col focus:outline-hidden overflow-hidden max-w-lg" tabindex="-1" style="pointer-events: auto;">
          <div class="px-4 pb-4 pt-5 flex items-center justify-between border-b border-token-border-medium">
            <div class="flex">
              <div class="flex items-center">
                <div class="flex grow flex-col gap-1">
                  <h2 as="h3" class="text-lg font-medium leading-6 text-token-text-primary">${translate('Custom instruction profile')}</h2>
                  <div class="text-sm font-medium leading-6 text-token-text-tertiary">See the custom instruction profile used in this convesation</div>
                </div>
              </div>
            </div>
            <div class="flex items-center">
              <button id="conversation-custom-instruction-profile-close-button" class="text-token-text-tertiary hover:text-token-text-primary transition">
                <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="20" width="20"
                  xmlns="http://www.w3.org/2000/svg">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
          <div id="conversation-custom-instruction-profile-wrapper" class="p-4 overflow-y-auto" style="height:500px;">
            <p class="text-muted pb-3 pt-2 text-sm text-token-text-primary">What would you like ChatGPT to know about you to provide better responses?</p>
            <div class="mb-3">
              <textarea readonly id="conversation-custom-instruction-profile-about-user-input" class="w-full rounded bg-token-main-surface-primary p-4 placeholder:text-gray-500 focus-token-border-heavy border-token-border-medium" rows="5" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="radix-:rak:" data-state="closed"></textarea>    
            </div>
            
            <p class="text-muted py-3 text-sm text-token-text-primary">How would you like ChatGPT to respond?</p>
            <div>
              <textarea readonly id="conversation-custom-instruction-profile-about-model-input" class="w-full rounded bg-token-main-surface-primary p-4 placeholder:text-gray-500 focus-token-border-heavy border-token-border-medium" rows="5" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="radix-:rao:" data-state="closed"></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', profileModal);
  document.querySelector('#conversation-custom-instruction-profile-close-button')?.addEventListener('click', () => {
    document.querySelector('#conversation-custom-instruction-profile-modal')?.remove();
  });
  document.querySelector('#conversation-custom-instruction-profile-modal')?.addEventListener('click', (e) => {
    // conversation-custom-instruction-profile-content
    const conversationCustomInstructionProfilecontent = document.querySelector('#conversation-custom-instruction-profile-content');
    if (!isDescendant(conversationCustomInstructionProfilecontent, e.target)) {
      document.querySelector('#conversation-custom-instruction-profile-modal')?.remove();
    }
  });
  const conversations = await getConversationsByIds([conversationId]);
  if (!conversations || conversations.length === 0) return;
  const conversation = conversations[0];
  const customInstructionProfile = findValueByKey(conversation?.mapping, 'user_context_message_data');
  if (!customInstructionProfile) return;
  const aboutUser = customInstructionProfile?.about_user_message || '';
  const aboutModel = customInstructionProfile?.about_model_message || '';
  document.querySelector('#conversation-custom-instruction-profile-about-user-input').value = aboutUser;
  document.querySelector('#conversation-custom-instruction-profile-about-model-input').value = aboutModel;
}
