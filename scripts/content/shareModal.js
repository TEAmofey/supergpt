/* global shareConv, toast, createShare, getConversation, closeMenus */

// eslint-disable-next-line no-unused-vars
async function shareConversation(conversationId) {
  // make API call
  const conversation = await getConversation(conversationId);
  const currentNodeId = conversation.current_node;
  const shareModalWrapper = document.createElement('div');
  shareModalWrapper.id = 'share-modal-wrapper';
  shareModalWrapper.classList = 'absolute inset-0';
  shareModalWrapper.style.zIndex = '999999';
  shareModalWrapper.innerHTML = '<div data-state="open" class="fixed inset-0 bg-black/50 dark:bg-black/80" style="pointer-events: auto;"><div class="grid h-full w-full grid-cols-[10px_1fr_10px] overflow-y-auto grid-cols-[10px_1fr_10px] grid-rows-[minmax(10px,1fr)_auto_minmax(10px,1fr)] md:grid-rows-[minmax(20px,1fr)_auto_minmax(20px,1fr)]"><div role="dialog" data-state="open" class="popover relative start-1/2 col-auto col-start-2 row-auto row-start-2 w-full rounded-2xl bg-token-main-surface-primary text-start shadow-xl ltr:-translate-x-1/2 rtl:translate-x-1/2 flex flex-col focus:outline-none max-w-[550px]" tabindex="-1" style="pointer-events: auto;"><div class="flex-grow overflow-y-auto p-4 sm:p-6"><div class="flex h-full items-center justify-center py-4"><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="animate-spin text-center icon-md text-token-text-tertiary" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg></div></div></div></div></div>';
  document.body.appendChild(shareModalWrapper);
  createShare(conversationId, currentNodeId).then(async (res) => {
    if (res.share_id) {
      shareModalWrapper.innerHTML = await shareModal(conversation, res);
      addShareModalEventListener(res);
    } else {
      const errorMessage = res?.detail?.description || 'Failed to copy link to clipboard - could not create link';
      shareModalWrapper.remove();
      toast(errorMessage, 'error');
    }
  });
}
async function shareModal(conversation, shareData) {
  //  shareData: {
  //     "share_id": "e74549d7-fe08-44ea-bbb4-5e4f68bc4377",
  //     "share_url": "https://chatgpt.com/share/e74549d7-fe08-44ea-bbb4-5e4f68bc4377",
  //     "title": "User Request: Summarize Above\nModel Response: Title Creation",
  //     "is_public": false,
  //     "is_visible": true,
  //     "is_anonymous": true,
  //     "is_discoverable": false,
  //     "can_disable_discoverability": true,
  //     "highlighted_message_id": null,
  //     "current_node_id": "1021a8d6-98a5-4473-a39b-6daca3306ef1",
  //     "already_exists": false,
  //     "moderation_state": {
  //         "has_been_moderated": false,
  //         "has_been_blocked": false,
  //         "has_been_accepted": false,
  //         "has_been_auto_blocked": false,
  //         "has_been_auto_moderated": false
  //     }
  // }

  return `<div data-state="open" class="fixed inset-0 bg-black/50 dark:bg-black/80" style="pointer-events: auto;">
    <div class="grid h-full w-full grid-cols-[10px_1fr_10px] overflow-y-auto grid-cols-[10px_1fr_10px] grid-rows-[minmax(10px,1fr)_auto_minmax(10px,1fr)] md:grid-rows-[minmax(20px,1fr)_auto_minmax(20px,1fr)]">
      <div role="dialog" id="share-modal-dialog" aria-describedby="radix-:r53:" aria-labelledby="radix-:r52:" data-state="open" class="popover relative start-1/2 col-auto col-start-2 row-auto row-start-2 w-full rounded-2xl bg-token-main-surface-primary text-start shadow-xl ltr:-translate-x-1/2 rtl:translate-x-1/2 flex flex-col focus:outline-none max-w-[550px]" tabindex="-1" style="pointer-events: auto;">
        <div class="px-4 pb-4 pt-5 sm:p-6 flex items-center justify-between border-b border-token-border-medium">
          <div class="flex">
            <div class="flex items-center">
              <div class="flex grow flex-col gap-1">
                <h2 class="text-lg font-semibold leading-6 text-token-text-primary">${shareData.already_exists ? 'Update' : 'Share'} public link to chat</h2>
              </div>
            </div>
          </div>
          <button id="share-modal-close-button" class="text-token-text-tertiary hover:text-token-text-tertiary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path d="M6.34315 6.34338L17.6569 17.6571M17.6569 6.34338L6.34315 17.6571" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </button>
        </div>
        <div class="flex-grow overflow-y-auto p-4 sm:p-6">
          <div class="w-full">
            <p class="mb-6 text-token-text-tertiary">
              <span>Your name, custom instructions, and any messages you add after sharing stay private. 
                <a href="https://help.openai.com/en/articles/7925741-chatgpt-shared-links-faq" class="inline-flex items-center gap-2 text-token-text-tertiary underline hover:text-token-text-tertiary" target="_blank" rel="noreferrer">Learn more</a>
              </span>
            </p>
          </div>
          <div class="mb-2 flex items-center justify-between rounded-2xl border border-token-border-medium bg-token-main-surface-primary p-2 text-token-text-tertiary last:mb-2 juice:rounded-full">
            <div class="relative ms-1 flex-grow">
              <input type="text" readonly="" class="w-full rounded-xl border-0 bg-token-main-surface-primary px-2 py-2.5 text-lg text-token-text-tertiary" value="https://chatgpt.com/share/...">
                <div class="pointer-events-none absolute bottom-0 end-0 top-0 w-12 bg-gradient-to-l from-token-main-surface-primary"></div>
              </div>
              <button id='create-update-share-button' class="btn relative btn-primary ms-4 me-0 mt-0 rounded-xl px-4 py-3 text-base font-bold" as="button">
                <div class="flex w-full gap-2 items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md">
                    <path fill="currentColor" fill-rule="evenodd" d="M18.293 5.707a4.657 4.657 0 0 0-6.586 0l-1 1a1 1 0 0 1-1.414-1.414l1-1a6.657 6.657 0 1 1 9.414 9.414l-1 1a1 1 0 0 1-1.414-1.414l1-1a4.657 4.657 0 0 0 0-6.586m-2.586 2.586a1 1 0 0 1 0 1.414l-6 6a1 1 0 0 1-1.414-1.414l6-6a1 1 0 0 1 1.414 0m-9 1a1 1 0 0 1 0 1.414l-1 1a4.657 4.657 0 0 0 6.586 6.586l1-1a1 1 0 0 1 1.414 1.414l-1 1a6.657 6.657 0 1 1-9.414-9.414l1-1a1 1 0 0 1 1.414 0" clip-rule="evenodd"></path>
                  </svg>${shareData.already_exists ? 'Update' : 'Create'} link
                </div>
              </button>
            </div>
            ${shareData.already_exists ? `<div class="w-full">
              <p class="mb-3 text-sm text-token-text-tertiary">A past version of this chat has already been shared. Manage previously shared chats via 
                <a href="#settings/DataControls" target="_blank" rel="noreferrer" class="underline hover:text-token-text-quaternary">Settings</a>.
              </p>
            </div>` : ''}
          </div>
        </div>
      </div>
    </div>`;
}
// eslint-disable-next-line no-unused-vars
function addShareModalEventListener(shareData) {
  const shareModalWrapper = document.querySelector('#share-modal-wrapper');

  shareModalWrapper.addEventListener('click', (event) => {
    const shareModalDialog = document.querySelector('#share-modal-dialog');
    if (shareModalDialog && !shareModalDialog?.contains(event.target)) {
      shareModalWrapper.remove();
    }
  });
  const shareModalCloseButton = document.querySelector('#share-modal-close-button');
  shareModalCloseButton.addEventListener('click', () => {
    shareModalWrapper.remove();
  });

  const createUpdateShareButton = document.querySelector('#create-update-share-button');
  createUpdateShareButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeMenus();
    createUpdateShareButton.disabled = true;
    createUpdateShareButton.innerHTML = '<div class="flex w-full gap-2 items-center justify-center"><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="animate-spin text-center" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>Copying...</div>';
    // inside button loading
    shareConv({ ...shareData, is_public: true }).then(() => {
      shareModalPostShareContent(shareData);
    });
  });
}
function shareModalPostShareContent(shareData) {
  const shareModalDialog = document.querySelector('#share-modal-dialog');

  shareModalDialog.innerHTML = `<div class="px-4 pb-4 pt-5 sm:p-6 flex items-center justify-between border-b border-token-border-medium">
  <div class="flex">
    <div class="flex items-center">
      <div class="flex grow flex-col gap-1">
        <h2 class="text-lg font-semibold leading-6 text-token-text-primary">Public link ${shareData.already_exists ? 'updated' : 'created'}</h2>
      </div>
    </div>
  </div>
  <button id="share-modal-close-button" class="text-token-text-tertiary hover:text-token-text-tertiary">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path d="M6.34315 6.34338L17.6569 17.6571M17.6569 6.34338L6.34315 17.6571" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
  </button>
</div>
<div class="flex-grow overflow-y-auto p-4 sm:p-6">
  <div class="w-full">
    <p class="mb-6 text-token-text-tertiary">
      <span>A public link to your chat has been created. Manage previously shared chats at any time via 
        <a href="#settings/DataControls" target="_blank" rel="noreferrer" class="underline">Settings</a>. 
      </span>
    </p>
  </div>
  ${shareData.can_disable_discoverability ? `<div id="make-chat-discoverable-button" data-checked="${shareData.is_discoverable}" class="mb-7" role="checkbox" aria-checked="false" aria-disabled="false" tabindex="0">
    <label class="flex items-start cursor-pointer">
      <div id="make-chat-discoverable-icon" class="flex h-5 w-5 items-center justify-center">
      ${shareData.is_discoverable ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="text-token-text-primary"><path fill="currentColor" d="M8.759 3h6.482c.805 0 1.47 0 2.01.044.563.046 1.08.145 1.565.392a4 4 0 0 1 1.748 1.748c.247.485.346 1.002.392 1.564C21 7.29 21 7.954 21 8.758v6.483c0 .805 0 1.47-.044 2.01-.046.563-.145 1.08-.392 1.565a4 4 0 0 1-1.748 1.748c-.485.247-1.002.346-1.564.392-.541.044-1.206.044-2.01.044H8.758c-.805 0-1.47 0-2.01-.044-.563-.046-1.08-.145-1.565-.392a4 4 0 0 1-1.748-1.748c-.247-.485-.346-1.002-.392-1.564C3 16.71 3 16.046 3 15.242V8.758c0-.805 0-1.47.044-2.01.046-.563.145-1.08.392-1.565a4 4 0 0 1 1.748-1.748c.485-.247 1.002-.346 1.564-.392C7.29 3 7.954 3 8.758 3m7.809 6.325a1 1 0 1 0-1.636-1.15L10.9 13.904l-1.66-1.827a1 1 0 0 0-1.48 1.346l2.5 2.75a1 1 0 0 0 1.558-.097z"></path></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M8.759 3h6.482c.805 0 1.47 0 2.01.044.563.046 1.08.145 1.565.392a4 4 0 0 1 1.748 1.748c.247.485.346 1.002.392 1.564C21 7.29 21 7.954 21 8.758v6.483c0 .805 0 1.47-.044 2.01-.046.563-.145 1.08-.392 1.565a4 4 0 0 1-1.748 1.748c-.485.247-1.002.346-1.564.392-.541.044-1.206.044-2.01.044H8.758c-.805 0-1.47 0-2.01-.044-.563-.046-1.08-.145-1.565-.392a4 4 0 0 1-1.748-1.748c-.247-.485-.346-1.002-.392-1.564C3 16.71 3 16.046 3 15.242V8.758c0-.805 0-1.47.044-2.01.046-.563.145-1.08.392-1.565a4 4 0 0 1 1.748-1.748c.485-.247 1.002-.346 1.564-.392C7.29 3 7.954 3 8.758 3M6.91 5.038c-.438.035-.663.1-.819.18a2 2 0 0 0-.874.874c-.08.156-.145.38-.18.819C5 7.361 5 7.943 5 8.8v6.4c0 .857 0 1.439.038 1.889.035.438.1.663.18.819a2 2 0 0 0 .874.874c.156.08.38.145.819.18C7.361 19 7.943 19 8.8 19h6.4c.857 0 1.439 0 1.889-.038.438-.035.663-.1.819-.18a2 2 0 0 0 .874-.874c.08-.156.145-.38.18-.819.037-.45.038-1.032.038-1.889V8.8c0-.857 0-1.439-.038-1.889-.035-.438-.1-.663-.18-.819a2 2 0 0 0-.874-.874c-.156-.08-.38-.145-.819-.18C16.639 5 16.057 5 15.2 5H8.8c-.857 0-1.439 0-1.889.038"></path></svg>'}
      </div>
      <div class="ms-2 leading-tight">
        <div class="text-token-text-primary">Make this chat discoverable</div>
        <div class="text-xs text-token-text-tertiary">Allows it to be shown in web searches</div>
      </div>
    </label>
  </div>` : ''}
  <div class="mb-2 flex items-center justify-between rounded-2xl border border-token-border-medium bg-token-main-surface-primary p-2 text-token-text-tertiary last:mb-2 juice:rounded-full">
    <div class="relative ms-1 flex-grow">
      <input type="text" readonly="" class="w-full rounded-xl border-0 bg-token-main-surface-primary px-2 py-2.5 text-lg text-token-text-primary" value="https://chatgpt.com/share/${shareData.share_id}">
        <div class="pointer-events-none absolute bottom-0 end-0 top-0 w-12 bg-gradient-to-l from-token-main-surface-primary"></div>
      </div>
      <button id="copy-share-button" class="btn relative btn-primary ms-4 me-0 mt-0 rounded-xl px-4 py-3 text-base font-bold" as="button">
        <div class="flex w-full gap-2 items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-sm">
            <path fill="currentColor" fill-rule="evenodd" d="M7 5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-2v2a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3h2zm2 2h5a3 3 0 0 1 3 3v5h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-9a1 1 0 0 0-1 1zM5 9a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1z" clip-rule="evenodd"></path>
          </svg>Copy link
        </div>
      </button>
    </div>
    <div class="mt-6 flex justify-center space-x-14">
      <div class="flex flex-col items-center">
        <a href="https://www.linkedin.com/shareArticle?url=https%3A%2F%2Fchatgpt.com%2Fshare%2F${shareData.share_id}" target="_blank" rel="noopener noreferrer">
          <div>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="20" fill="var(--main-surface-secondary)"></rect>
              <path d="M27.65 11H12.35C11.992 11 11.6486 11.1422 11.3954 11.3954C11.1422 11.6486 11 11.992 11 12.35V27.65C11 28.008 11.1422 28.3514 11.3954 28.6046C11.6486 28.8578 11.992 29 12.35 29H27.65C28.008 29 28.3514 28.8578 28.6046 28.6046C28.8578 28.3514 29 28.008 29 27.65V12.35C29 11.992 28.8578 11.6486 28.6046 11.3954C28.3514 11.1422 28.008 11 27.65 11ZM16.4 26.3H13.7V18.2H16.4V26.3ZM15.05 16.625C14.7406 16.6162 14.4406 16.5163 14.1876 16.338C13.9346 16.1596 13.7397 15.9107 13.6274 15.6222C13.515 15.3337 13.4902 15.0186 13.5559 14.7161C13.6217 14.4136 13.7751 14.1372 13.9971 13.9214C14.2191 13.7056 14.4997 13.56 14.8039 13.5028C15.1081 13.4456 15.4225 13.4793 15.7077 13.5997C15.9928 13.7201 16.2362 13.9219 16.4074 14.1798C16.5785 14.4378 16.6699 14.7404 16.67 15.05C16.6629 15.4733 16.4885 15.8766 16.1849 16.1717C15.8814 16.4669 15.4733 16.6298 15.05 16.625ZM26.3 26.3H23.6V22.034C23.6 20.756 23.06 20.297 22.358 20.297C22.1522 20.3107 21.9511 20.3649 21.7663 20.4566C21.5815 20.5482 21.4166 20.6755 21.2811 20.831C21.1457 20.9866 21.0422 21.1674 20.9768 21.363C20.9114 21.5586 20.8853 21.7652 20.9 21.971C20.8955 22.0129 20.8955 22.0551 20.9 22.097V26.3H18.2V18.2H20.81V19.37C21.0733 18.9695 21.435 18.6433 21.8605 18.4227C22.286 18.2021 22.761 18.0944 23.24 18.11C24.635 18.11 26.264 18.884 26.264 21.404L26.3 26.3Z" fill="var(--text-secondary)"></path>
            </svg>
          </div>
        </a>
        <span class="mt-1 text-xs font-semibold text-token-text-tertiary">LinkedIn</span>
      </div>
      <div class="flex flex-col items-center">
        <a href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fchatgpt.com%2Fshare%2F${shareData.share_id}" target="_blank" rel="noopener noreferrer">
          <div>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="20" fill="var(--main-surface-secondary)"></rect>
              <path d="M29.375 20.0349C29.375 14.8374 25.1782 10.625 20 10.625C14.8218 10.625 10.625 14.8374 10.625 20.0349C10.625 24.4458 13.6536 28.151 17.7368 29.1692V22.9094H15.8032V20.0349H17.7368V18.7962C17.7368 15.5946 19.1797 14.1096 22.3145 14.1096C22.9077 14.1096 23.9331 14.2272 24.3542 14.3449V16.9473C24.1345 16.9252 23.75 16.9105 23.2703 16.9105C21.7322 16.9105 21.1389 17.495 21.1389 19.0131V20.0349H24.2004L23.6731 22.9094H21.1353V29.375C25.7788 28.8126 29.375 24.8465 29.375 20.0349Z" fill="var(--text-secondary)"></path>
            </svg>
          </div>
        </a>
        <span class="mt-1 text-xs font-semibold text-token-text-tertiary">Facebook</span>
      </div>
      <div class="flex flex-col items-center">
        <a href="https://www.reddit.com/submit?url=https%3A%2F%2Fchatgpt.com%2Fshare%2F${shareData.share_id}&amp;title=User%20Request%3A%20Summarize%20Above%0AModel%20Response%3A%20Title%20Creation" target="_blank" rel="noopener noreferrer">
          <div>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="20" fill="var(--main-surface-secondary)"></rect>
              <path d="M24.5703 15.1641C23.5859 15.1641 22.7617 14.4805 22.543 13.5625C21.3477 13.7305 20.4258 14.7617 20.4258 16V16.0078C22.2773 16.0781 23.9648 16.5977 25.3047 17.4258C25.7969 17.0469 26.4141 16.8203 27.082 16.8203C28.6953 16.8203 30 18.125 30 19.7383C30 20.9023 29.3203 21.9062 28.332 22.375C28.2383 25.7656 24.543 28.4922 20.0039 28.4922C15.4648 28.4922 11.7773 25.7695 11.6797 22.3828C10.6875 21.918 10 20.9102 10 19.7383C10 18.125 11.3047 16.8203 12.918 16.8203C13.5898 16.8203 14.207 17.0469 14.7031 17.4297C16.0312 16.6055 17.7031 16.0859 19.5352 16.0078V15.9961C19.5352 14.2656 20.8516 12.8359 22.5352 12.6562C22.7266 11.7109 23.5625 11 24.5703 11C25.7188 11 26.6523 11.9336 26.6523 13.082C26.6523 14.2305 25.7188 15.1641 24.5703 15.1641ZM16.1523 19.7227C15.3359 19.7227 14.6328 20.5352 14.582 21.5938C14.5312 22.6523 15.25 23.082 16.0664 23.082C16.8828 23.082 17.4961 22.6992 17.543 21.6406C17.5898 20.582 16.9688 19.7227 16.1484 19.7227H16.1523ZM25.4297 21.5898C25.3828 20.5312 24.6797 19.7188 23.8594 19.7188C23.0391 19.7188 22.418 20.5781 22.4648 21.6367C22.5117 22.6953 23.125 23.0781 23.9414 23.0781C24.7578 23.0781 25.4766 22.6484 25.4258 21.5898H25.4297ZM23.082 24.3555C23.1406 24.2148 23.043 24.0547 22.8906 24.0391C21.9922 23.9492 21.0195 23.8984 20.0078 23.8984C18.9961 23.8984 18.0234 23.9492 17.125 24.0391C16.9727 24.0547 16.875 24.2148 16.9336 24.3555C17.4375 25.5586 18.625 26.4023 20.0078 26.4023C21.3906 26.4023 22.5781 25.5586 23.082 24.3555Z" fill="var(--text-secondary)"></path>
            </svg>
          </div>
        </a>
        <span class="mt-1 text-xs font-semibold text-token-text-tertiary">Reddit</span>
      </div>
      <div class="flex flex-col items-center">
        <a href="https://twitter.com/intent/tweet?url=https%3A%2F%2Fchatgpt.com%2Fshare%2F${shareData.share_id}" target="_blank" rel="noopener noreferrer">
          <div>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="20" fill="var(--main-surface-secondary)"></rect>
              <path d="M23.989 13.377H26.2902L21.2641 19.1201L27.1768 26.9363H22.5483L18.9206 22.197L14.7745 26.9363H12.4701L17.8449 20.7922L12.1768 13.377H16.9225L20.1983 17.7088L23.989 13.377ZM23.1807 25.5608H24.4551L16.2283 14.6807H14.8593L23.1807 25.5608Z" fill="var(--text-secondary)"></path>
            </svg>
          </div>
        </a>
        <span class="mt-1 text-xs font-semibold text-token-text-tertiary">X</span>
      </div>
    </div>
  </div>
</div>`;
  addShareModalPostShareContentEventListener(shareData);
}
function addShareModalPostShareContentEventListener(shareData) {
  const shareModalWrapper = document.querySelector('#share-modal-wrapper');
  const shareModalCloseButton = document.querySelector('#share-modal-close-button');
  shareModalCloseButton.addEventListener('click', () => {
    shareModalWrapper.remove();
  });
  const copyShareButton = document.querySelector('#copy-share-button');
  copyShareButton.addEventListener('click', () => {
    navigator.clipboard.writeText(shareData.share_url);
    toast('Copied shared conversation URL to clipboard!');
  });
  const makeChatDiscoverableButton = document.querySelector('#make-chat-discoverable-button');
  const makeChatDiscoverableIcon = document.querySelector('#make-chat-discoverable-icon');
  makeChatDiscoverableButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeMenus();
    const isDiscoverable = makeChatDiscoverableButton.getAttribute('data-checked') === 'true';
    makeChatDiscoverableButton.style.pointerEvents = 'none';
    makeChatDiscoverableButton.style.opacity = '0.5';
    makeChatDiscoverableIcon.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="animate-spin text-center icon-md text-token-text-tertiary" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>';
    shareConv({ ...shareData, is_discoverable: !isDiscoverable }).then((res) => {
      makeChatDiscoverableButton.style.pointerEvents = 'auto';
      makeChatDiscoverableButton.style.opacity = '1';
      makeChatDiscoverableButton.setAttribute('data-checked', res.is_discoverable);
      makeChatDiscoverableIcon.innerHTML = res.is_discoverable ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="text-token-text-primary"><path fill="currentColor" d="M8.759 3h6.482c.805 0 1.47 0 2.01.044.563.046 1.08.145 1.565.392a4 4 0 0 1 1.748 1.748c.247.485.346 1.002.392 1.564C21 7.29 21 7.954 21 8.758v6.483c0 .805 0 1.47-.044 2.01-.046.563-.145 1.08-.392 1.565a4 4 0 0 1-1.748 1.748c-.485.247-1.002.346-1.564.392-.541.044-1.206.044-2.01.044H8.758c-.805 0-1.47 0-2.01-.044-.563-.046-1.08-.145-1.565-.392a4 4 0 0 1-1.748-1.748c-.247-.485-.346-1.002-.392-1.564C3 16.71 3 16.046 3 15.242V8.758c0-.805 0-1.47.044-2.01.046-.563.145-1.08.392-1.565a4 4 0 0 1 1.748-1.748c.485-.247 1.002-.346 1.564-.392C7.29 3 7.954 3 8.758 3m7.809 6.325a1 1 0 1 0-1.636-1.15L10.9 13.904l-1.66-1.827a1 1 0 0 0-1.48 1.346l2.5 2.75a1 1 0 0 0 1.558-.097z"></path></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M8.759 3h6.482c.805 0 1.47 0 2.01.044.563.046 1.08.145 1.565.392a4 4 0 0 1 1.748 1.748c.247.485.346 1.002.392 1.564C21 7.29 21 7.954 21 8.758v6.483c0 .805 0 1.47-.044 2.01-.046.563-.145 1.08-.392 1.565a4 4 0 0 1-1.748 1.748c-.485.247-1.002.346-1.564.392-.541.044-1.206.044-2.01.044H8.758c-.805 0-1.47 0-2.01-.044-.563-.046-1.08-.145-1.565-.392a4 4 0 0 1-1.748-1.748c-.247-.485-.346-1.002-.392-1.564C3 16.71 3 16.046 3 15.242V8.758c0-.805 0-1.47.044-2.01.046-.563.145-1.08.392-1.565a4 4 0 0 1 1.748-1.748c.485-.247 1.002-.346 1.564-.392C7.29 3 7.954 3 8.758 3M6.91 5.038c-.438.035-.663.1-.819.18a2 2 0 0 0-.874.874c-.08.156-.145.38-.18.819C5 7.361 5 7.943 5 8.8v6.4c0 .857 0 1.439.038 1.889.035.438.1.663.18.819a2 2 0 0 0 .874.874c.156.08.38.145.819.18C7.361 19 7.943 19 8.8 19h6.4c.857 0 1.439 0 1.889-.038.438-.035.663-.1.819-.18a2 2 0 0 0 .874-.874c.08-.156.145-.38.18-.819.037-.45.038-1.032.038-1.889V8.8c0-.857 0-1.439-.038-1.889-.035-.438-.1-.663-.18-.819a2 2 0 0 0-.874-.874c-.156-.08-.38-.145-.819-.18C16.639 5 16.057 5 15.2 5H8.8c-.857 0-1.439 0-1.889.038"></path></svg>';
    });
  });
}
