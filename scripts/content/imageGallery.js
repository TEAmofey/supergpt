/* global sharePost, downloadFileFromUrl, openUpgradeModal, hljs, formatDate, toast, debounce, imageGalleryMenu, addImageGalleryMenuEventListener, imageGalleryMenuOptions, highlightSearch, downloadSelectedImages, makeGalleryImagesPublic, deleteGalleryimages, isDarkMode, translate, closeMenus, isDescendant, showConversationPreviewWrapper, attachImagesToInput, isWindows, createTooltip */
let selectedGalleryImage = null;
// eslint-disable-next-line prefer-const
let allImageNodes = [];
let selectedImageGalleryImageIds = [];
let selectedImagePickerImageIds = [];
let imageGalleryCurrentTab = 'dalle'; // dalle or chart or upload or public
let showAll = false;
// eslint-disable-next-line no-unused-vars
function createImageGallery() {
  selectedGalleryImage = null;
  const gallery = document.createElement('div');
  gallery.id = 'image-gallery';
  gallery.dataset.state = 'open';
  gallery.classList = 'h-full w-full flex items-center justify-center backdrop-blur-xl';
  gallery.style = 'pointer-events: auto;';

  gallery.innerHTML = `
<div role="dialog" data-state="open" class="relative flex h-full w-full justify-stretch divide-x divide-white/10 focus:outline-none" tabindex="-1" style="pointer-events: auto;">
  <div id="image-gallery-image-wrapper" class="flex flex-1 transition-[flex-basis]">
    <div class="flex flex-1 flex-col p-2">
      <div id="gallery-header" class="px-0 pb-4">
        <div class="flex items-center justify-between text-token-text-primary">
          <div class="flex items-center">
            <input type="search" id="gallery-search" tabindex="0" placeholder="${translate('Search gallery')}" class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-token-main-surface-secondary me-2">
            <a href="https://www.youtube.com/watch?v=oU6_wgJLYEM" target="_blank" rel="noreferrer">
              <svg
                xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md ps-0.5 text-token-text-tertiary h-6 w-6">
                <path fill="currentColor" d="M13 12a1 1 0 1 0-2 0v4a1 1 0 1 0 2 0zM12 9.5A1.25 1.25 0 1 0 12 7a1.25 1.25 0 0 0 0 2.5"></path>
                <path fill="currentColor" fill-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2M4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0" clip-rule="evenodd"></path>
              </svg>
            </a>
          </div>
          <div id="gallery-tabs-wrapper" role="radiogroup" aria-required="false" dir="ltr" class="flex w-full overflow-hidden rounded-xl bg-token-main-surface-tertiary p-1.5 dark:bg-token-main-surface-tertiary w-max gap-2 flex-shrink-0 self-center" tabindex="0" style="outline: none;">
            <button id="gallery-tab-dalle" type="button" role="radio" data-state="${imageGalleryCurrentTab === 'dalle' ? 'checked' : 'unchecked'}" value="dalle" class="text-md w-1/3 flex-grow rounded-lg border-token-border-medium p-1.5 font-medium text-token-text-tertiary transition hover:text-token-text-primary radix-state-checked:border radix-state-checked:bg-token-main-surface-primary radix-state-checked:text-token-text-primary radix-state-checked:shadow-[0_0_2px_rgba(0,0,0,.03)] radix-state-checked:dark:bg-token-main-surface-secondary md:w-1/3" tabindex="0" data-radix-collection-item="">Images</button>
            <button id="gallery-tab-chart" type="button" role="radio" data-state="${imageGalleryCurrentTab === 'chart' ? 'checked' : 'unchecked'}" value="chart" class="text-md w-1/3 flex-grow rounded-lg border-token-border-medium p-1.5 font-medium text-token-text-tertiary transition hover:text-token-text-primary radix-state-checked:border radix-state-checked:bg-token-main-surface-primary radix-state-checked:text-token-text-primary radix-state-checked:shadow-[0_0_2px_rgba(0,0,0,.03)] radix-state-checked:dark:bg-token-main-surface-secondary md:w-1/3" tabindex="-1" data-radix-collection-item="">Charts</button>
            <button id="gallery-tab-upload" type="button" role="radio" data-state="${imageGalleryCurrentTab === 'upload' ? 'checked' : 'unchecked'}" value="upload" class="text-md w-1/3 flex-grow rounded-lg border-token-border-medium p-1.5 font-medium text-token-text-tertiary transition hover:text-token-text-primary radix-state-checked:border radix-state-checked:bg-token-main-surface-primary radix-state-checked:text-token-text-primary radix-state-checked:shadow-[0_0_2px_rgba(0,0,0,.03)] radix-state-checked:dark:bg-token-main-surface-secondary md:w-1/3" tabindex="-1" data-radix-collection-item="">Uploads</button>
            <button id="gallery-tab-public" type="button" role="radio" data-state="${imageGalleryCurrentTab === 'public' ? 'checked' : 'unchecked'}" value="public" class="text-md w-1/3 flex-grow rounded-lg border-token-border-medium p-1.5 font-medium text-token-text-tertiary transition hover:text-token-text-primary radix-state-checked:border radix-state-checked:bg-token-main-surface-primary radix-state-checked:text-token-text-primary radix-state-checked:shadow-[0_0_2px_rgba(0,0,0,.03)] radix-state-checked:dark:bg-token-main-surface-secondary md:w-1/3" tabindex="-1" data-radix-collection-item="">Public</button>
          </div>
          <div class="flex relative">${imageGalleryMenu()}</div>
        </div>
        <div id="gallery-selection-bar" class="hidden flex items-center justify-end py-3 w-full z-10">
          <button id="gallery-selection-cancel-button" class="flex items-center justify-center h-8 rounded-lg px-2 text-token-text-primary focus-visible:outline-0 hover:bg-token-main-surface-tertiary focus-visible:bg-token-main-surface-tertiary me-auto border border-token-border-medium">${translate('Cancel')}</button>
          <span id="gallery-selection-count" class="text-token-text-tertiary text-xs me-4">0 selected</span>
          <button id="gallery-selection-delete-button" class="flex items-center justify-center h-8 rounded-lg px-2 text-token-text-primary focus-visible:outline-0 hover:bg-token-main-surface-tertiary focus-visible:bg-token-main-surface-tertiary me-2 border border-token-border-medium">${translate('Delete')}</button>
          <button id="gallery-selection-make-public-button" class="flex items-center justify-center h-8 rounded-lg px-2 text-token-text-primary focus-visible:outline-0 hover:bg-token-main-surface-tertiary focus-visible:bg-token-main-surface-tertiary me-2 border border-token-border-medium">${translate('Make public')}</button>
          <button id="gallery-selection-download-button" class="flex items-center justify-center h-8 rounded-lg px-2 text-token-text-primary focus-visible:outline-0 hover:bg-token-main-surface-tertiary focus-visible:bg-token-main-surface-tertiary me-2 border border-token-border-medium ">${translate('Download')}</button>
        </div>
      </div>
      <div id="gallery-image-list" style="display: flex;flex-flow: wrap;justify-content: start;align-items: stretch;overflow-y:auto;"></div>
    </div>
  </div>
  <div id="image-gallery-sidebar" class="flex overflow-y-auto hidden items-start justify-start overflow-hidden bg-token-sidebar-surface-secondary text-token-text-primary transition-[flex-basis] duration-500 md:flex md:basis-[25vw]">
    <div class="w-[25vw]">
      <div class="flex flex-col w-full justify-start items-start gap-2 p-4" draggable="false">
        <img id="gallery-selected-image" style="aspect-ratio:1;background-color: #111;" src="${chrome.runtime.getURL('images/loading.gif')}" class="row-span-4 mx-auto h-full rounded-md object-scale-down">
        <div id="gallery-selected-image-timestamp" class="w-full text-xs text-token-text-tertiary">${formatDate(new Date(selectedGalleryImage?.created_at)) || '...'}</div>
      </div>
      <div class="flex flex-col items-start gap-3 p-4">
        <span id="gallery-selected-image-title-wrapper" class="w-full flex flex-col items-start gap-3 ${selectedGalleryImage?.title ? '' : 'hidden'}">
          <div class="text-md text-token-text-primary" id="gallery-selected-image-title-title">Title</div>
          <div id="gallery-selected-image-title" class="w-full text-sm !whitespace-pre-wrap text-token-text-tertiary">${selectedGalleryImage?.title}</div>
        </span>

        <div class="flex flex-row space-between w-full items-center">
          <div class="text-md text-token-text-primary" id="gallery-selected-image-prompt-title">${imageGalleryCurrentTab === 'chart' ? 'Code' : 'Prompt'}<button>aa</button></div>
          
          <button id="gallery-selected-image-prompt-copy-button" class="ms-auto btn btn-small text-sm relative btn-secondary">
            <div class="flex w-full gap-2 items-center justify-center">
              <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" height="1em" width="1em"
                xmlns="http://www.w3.org/2000/svg">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>${translate('Copy')}
            </div>
          </button>
        </div>
        <div id="gallery-selected-image-prompt" class="w-full text-sm !whitespace-pre-wrap text-token-text-tertiary">${imageGalleryCurrentTab === 'chart' ? codeWrapper(selectedGalleryImage?.prompt) || '...' : selectedGalleryImage?.prompt || '...'}</div>
        <div>
          <div class="flex flex-wrap my-1 text-xs items-center ${selectedGalleryImage?.gen_id && ['dalle', 'chart'].includes(imageGalleryCurrentTab) ? 'visible' : 'invisible'}">Gen ID:&nbsp;
            <div class="text-token-text-tertiary flex items-center cursor-pointer" id="gallery-selected-image-gen-id-copy-button">
              <span id="gallery-selected-image-gen-id">${selectedGalleryImage?.gen_id}</span>
              <button class="flex ms-1 gap-2 items-center rounded-md p-1 text-xs text-token-text-primary hover:text-token-text-primary">
                <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="icon-sm" height="1em" width="1em"
                  xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
              </button>
            </div>
          </div>

        </div>
        <button id="gallery-preview-conversation-button" data-conversation-id="${selectedGalleryImage?.conversation_id}" class="${imageGalleryCurrentTab !== 'public' ? 'visible' : 'invisible'} btn relative btn-secondary gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" class="icon-md">
            <path d="M160 256C160 185.3 217.3 128 288 128C358.7 128 416 185.3 416 256C416 326.7 358.7 384 288 384C217.3 384 160 326.7 160 256zM288 336C332.2 336 368 300.2 368 256C368 211.8 332.2 176 288 176C287.3 176 286.7 176 285.1 176C287.3 181.1 288 186.5 288 192C288 227.3 259.3 256 224 256C218.5 256 213.1 255.3 208 253.1C208 254.7 208 255.3 208 255.1C208 300.2 243.8 336 288 336L288 336zM95.42 112.6C142.5 68.84 207.2 32 288 32C368.8 32 433.5 68.84 480.6 112.6C527.4 156 558.7 207.1 573.5 243.7C576.8 251.6 576.8 260.4 573.5 268.3C558.7 304 527.4 355.1 480.6 399.4C433.5 443.2 368.8 480 288 480C207.2 480 142.5 443.2 95.42 399.4C48.62 355.1 17.34 304 2.461 268.3C-.8205 260.4-.8205 251.6 2.461 243.7C17.34 207.1 48.62 156 95.42 112.6V112.6zM288 80C222.8 80 169.2 109.6 128.1 147.7C89.6 183.5 63.02 225.1 49.44 256C63.02 286 89.6 328.5 128.1 364.3C169.2 402.4 222.8 432 288 432C353.2 432 406.8 402.4 447.9 364.3C486.4 328.5 512.1 286 526.6 256C512.1 225.1 486.4 183.5 447.9 147.7C406.8 109.6 353.2 80 288 80V80z"/>
          </svg>${translate('Preview conversation')}
        </button>
        <div id="more-by" class="${imageGalleryCurrentTab === 'public' ? 'invisible' : 'invisible'} cursor-pointer no-underline hover:underline" style="color:#3c80f5;">More images by this user</div>
      </div>
    </div>
  </div>
</div>`;
  return gallery;
  // remove existing gallery
  // const existingGallery = document.querySelector('#image-gallery');
  // existingGallery?.remove();
  // add gallery to body
  // const body = document.querySelector('body');
  // body.insertAdjacentHTML('beforeend', gallery);
  // addImageGalleryEventListeners();
  // loadImageList();
}
function resetGallerySelection() {
  selectedImageGalleryImageIds = [];
  const galleryImages = document.querySelectorAll('[id^="gallery-image-card-"]');
  galleryImages.forEach((image) => {
    image.classList.remove('opacity-50');
  });
  const curImageGalleryCheckboxes = document.querySelectorAll('[id^="image-gallery-checkbox"]');
  curImageGalleryCheckboxes.forEach((cb) => {
    cb.checked = false;
    cb.classList.add('invisible');
  });
  const selectionBar = document.querySelector('div[id="gallery-selection-bar"]');
  if (selectionBar) selectionBar.classList.add('hidden');

  const selectionCount = document.querySelector('span[id="gallery-selection-count"]');
  if (selectionCount) selectionCount.innerText = '0 selected';
}

function loadImageList(pageNumber = 1, byUserId = '') {
  byUserId = byUserId || document.querySelector('#by-user-id')?.innerText || '';
  const searchTerm = document.querySelector('#gallery-search').value.toLowerCase();
  const galleryImageList = document.querySelector('#gallery-image-list');
  if (pageNumber === 1) galleryImageList.innerHTML = `<div class="flex flex-col w-full justify-start items-start gap-2 p-2" style="min-width:20%;max-width:20%;aspect-ratio:1;"><div id="load-more-images-button" class="relative flex flex-col w-full h-full justify-center items-center gap-2 text-token-text-primary text-2xl font-bold cursor-pointer hover:shadow-xl rounded-xl"><img style="object-fit:none;aspect-ratio:1;background-color: #111;" src="${chrome.runtime.getURL('images/loading.gif')}" class="row-span-4 mx-auto h-full rounded-md object-scale-down"></div></div>`;
  chrome.runtime.sendMessage({
    type: 'checkHasSubscription',
  }, (hasSubscription) => {
    if (searchTerm && !hasSubscription) {
      openUpgradeModal();
      return;
    }
    if (pageNumber === 1) {
      selectedImageGalleryImageIds = [];
      selectedGalleryImage = null;
    }

    // if (!byUserId) {
    //   const existingFilters = document.querySelectorAll('#gallery-filter');
    //   existingFilters.forEach((filter) => filter.remove());
    // }
    chrome.runtime.sendMessage({
      type: 'getGalleryImages',
      detail: {
        showAll,
        pageNumber,
        byUserId,
        category: imageGalleryCurrentTab === 'public' ? 'dalle' : imageGalleryCurrentTab,
        searchTerm,
        isPublic: imageGalleryCurrentTab === 'public',
      },
    }, (galleryImages) => {
      if (pageNumber === 1 && galleryImages.error) {
        galleryImageList.innerHTML = `<div class="flex flex-col w-full justify-start items-start"><div class="relative flex flex-col w-full h-full justify-center items-center gap-2 p-4 text-token-text-primary text-2xl font-bold cursor-pointer bg-token-main-surface-secondary hover:shadow-xl rounded-xl text-center">${galleryImages.error}</div></div>`;
        return;
      }
      if (pageNumber === 1) allImageNodes.length = 0;
      allImageNodes.push(...galleryImages?.results || []);
      if (pageNumber === 1 && galleryImages?.results?.length > 0) {
        // eslint-disable-next-line prefer-destructuring
        selectedGalleryImage = galleryImages?.results?.[0];
      }
      if (!galleryImageList) return;

      if (imageGalleryCurrentTab === 'public' && hasSubscription) {
        const existingPublicImagesTip = document.querySelector('#public-images-tip');
        if (!existingPublicImagesTip) {
          galleryImageList.insertAdjacentHTML('beforebegin', '<div id="public-images-tip" class="flex flex-col w-full justify-start items-start"><div class="relative flex flex-col w-full h-full justify-center items-center gap-2 p-4 text-token-text-primary text-sm cursor-pointer bg-token-main-surface-secondary hover:shadow-xl rounded-xl text-center">To see public images, first you need to share some of your images. The more images you share, the more public images you will see.<br/>To share, go to the Images tab, select the images you would like to share, then select Make Public from the menu.</div></div>');
        }
      } else {
        const existingPublicImagesTip = document.querySelector('#public-images-tip');
        existingPublicImagesTip?.remove();
        if (allImageNodes.length === 0) {
          galleryImageList.innerHTML = `<div class="flex flex-col w-full justify-start items-start"><div class="relative flex flex-col w-full h-full justify-center items-center gap-2 p-4 text-token-text-primary text-2xl font-bold cursor-pointer bg-token-main-surface-secondary hover:shadow-xl rounded-xl text-center">${translate('No images found')}!</div></div> ${hasSubscription ? '' : `<div class="flex w-full gap-2 p-2" style="min-width:20%;max-width:20%;aspect-ratio:1;flex-direction: column;"><div id="upgrade-to-pro-button-gallery" class="relative flex flex-col flex-wrap w-full h-full justify-center items-center gap-2 p-2 text-black cursor-pointer bg-gold hover:bg-gold-dark hover:shadow-xl rounded-xl"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" style="width:48px; height:48px;" stroke="purple" fill="purple"><path d="M240.5 224H352C365.3 224 377.3 232.3 381.1 244.7C386.6 257.2 383.1 271.3 373.1 280.1L117.1 504.1C105.8 513.9 89.27 514.7 77.19 505.9C65.1 497.1 60.7 481.1 66.59 467.4L143.5 288H31.1C18.67 288 6.733 279.7 2.044 267.3C-2.645 254.8 .8944 240.7 10.93 231.9L266.9 7.918C278.2-1.92 294.7-2.669 306.8 6.114C318.9 14.9 323.3 30.87 317.4 44.61L240.5 224z"></path></svg><div class="w-full text-xl font-bold flex justify-center">${translate('Upgrade to Pro')}</div><div class="text-sm w-full flex justify-center">to see public images</div></div></div>`}`;
          addSubscriptionModalEventListeners();
          return;
        }
      }

      const imageListHtml = `${[...(galleryImages?.results || [])]?.map((imageNode) => `<div class="group/dalle-image relative flex flex-col w-full justify-start items-start gap-2 p-2 cursor-pointer" style="font-size:12px;min-width:20%;max-width: 20%;" draggable="false"><img id="gallery-image-card-${imageNode.image_id}" src="${imageNode.image}" alt="${imageNode.prompt?.replace(/[^a-zA-Z0-9 ]/gi, '') || 'Generated by ChatGPT'}" style="aspect-ratio:1;" class="bg-token-main-surface-tertiary w-full row-span-4 mx-auto h-full rounded-md object-scale-down ${selectedGalleryImage?.image_id === imageNode?.image_id ? 'ring-2' : ''} ${isDarkMode() ? 'ring-white ring-offset-black' : 'ring-black ring-offset-white'} ring-offset-4">
      
      <div class="invisible absolute start-3 top-3 group-hover/dalle-image:visible"><button id="image-download-button-${imageNode.image_id}" class="flex h-6 w-6 items-center justify-center rounded bg-black/50"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-sm text-token-text-primary"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.70711 10.2929C7.31658 9.90237 6.68342 9.90237 6.29289 10.2929C5.90237 10.6834 5.90237 11.3166 6.29289 11.7071L11.2929 16.7071C11.6834 17.0976 12.3166 17.0976 12.7071 16.7071L17.7071 11.7071C18.0976 11.3166 18.0976 10.6834 17.7071 10.2929C17.3166 9.90237 16.6834 9.90237 16.2929 10.2929L13 13.5858L13 4C13 3.44771 12.5523 3 12 3C11.4477 3 11 3.44771 11 4L11 13.5858L7.70711 10.2929ZM5 19C4.44772 19 4 19.4477 4 20C4 20.5523 4.44772 21 5 21H19C19.5523 21 20 20.5523 20 20C20 19.4477 19.5523 19 19 19L5 19Z" fill="currentColor"></path></svg></button></div> 
      
      ${imageGalleryCurrentTab === 'dalle' && imageNode.image_id.startsWith('file_000') ? `<div class="invisible absolute start-3 bottom-3 group-hover/dalle-image:visible"><button id="image-share-button-${imageNode.image_id}" class="flex h-6 w-6 items-center justify-center rounded bg-black/50"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="" class="icon-sm"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.2929 3.29289C11.6834 2.90237 12.3166 2.90237 12.7071 3.29289L16.7071 7.29289C17.0976 7.68342 17.0976 8.31658 16.7071 8.70711C16.3166 9.09763 15.6834 9.09763 15.2929 8.70711L13 6.41421V15C13 15.5523 12.5523 16 12 16C11.4477 16 11 15.5523 11 15V6.41421L8.70711 8.70711C8.31658 9.09763 7.68342 9.09763 7.29289 8.70711C6.90237 8.31658 6.90237 7.68342 7.29289 7.29289L11.2929 3.29289ZM4 14C4.55228 14 5 14.4477 5 15V18C5 18.5523 5.44772 19 6 19H18C18.5523 19 19 18.5523 19 18V15C19 14.4477 19.4477 14 20 14C20.5523 14 21 14.4477 21 15V18C21 19.6569 19.6569 21 18 21H6C4.34315 21 3 19.6569 3 18V15C3 14.4477 3.44772 14 4 14Z" fill="currentColor"></path></svg></button></div>` : ''}
      
      <input type="checkbox" id="image-gallery-checkbox-${imageNode.image_id}" class="${selectedImageGalleryImageIds.length === 0 ? 'invisible' : ''} absolute end-3 top-3 ${imageGalleryCurrentTab !== 'public' ? 'group-hover/dalle-image:visible' : ''}" style="z-index: 11; cursor: pointer; border-radius: 2px;">
    
    </div>`).join('')}${galleryImages?.next && hasSubscription ? '<div class="flex flex-col w-full justify-start items-start gap-2 p-2" style="min-width:20%;max-width:20%;aspect-ratio:1;"><div id="load-more-images-button" class="relative flex flex-col w-full h-full justify-center items-center gap-2 text-token-text-primary text-2xl font-bold cursor-pointer bg-token-main-surface-secondary hover:shadow-xl rounded-xl">Load more...</div></div>' : hasSubscription ? '' : `<div class="flex w-full gap-2 p-2" style="min-width:20%;max-width:20%;aspect-ratio:1;flex-direction: column;"><div id="upgrade-to-pro-button-gallery" class="relative flex flex-col flex-wrap w-full h-full justify-center items-center gap-2 p-2 text-black cursor-pointer bg-gold hover:bg-gold-dark hover:shadow-xl rounded-xl"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" style="width:48px; height:48px;" stroke="purple" fill="purple"><path d="M240.5 224H352C365.3 224 377.3 232.3 381.1 244.7C386.6 257.2 383.1 271.3 373.1 280.1L117.1 504.1C105.8 513.9 89.27 514.7 77.19 505.9C65.1 497.1 60.7 481.1 66.59 467.4L143.5 288H31.1C18.67 288 6.733 279.7 2.044 267.3C-2.645 254.8 .8944 240.7 10.93 231.9L266.9 7.918C278.2-1.92 294.7-2.669 306.8 6.114C318.9 14.9 323.3 30.87 317.4 44.61L240.5 224z"></path></svg><div class="w-full text-xl font-bold flex justify-center">${translate('Upgrade to Pro')}</div><div class="text-sm w-full flex justify-center">to see ${imageGalleryCurrentTab === 'public' ? 'more' : 'all'} images</div></div></div>`}`;
      if (pageNumber === 1) {
        galleryImageList.innerHTML = imageListHtml || '';
      } else {
        // remove the load more button
        const loadMoreImagesButton = document.querySelector('#load-more-images-button');
        loadMoreImagesButton?.parentElement?.remove();
        galleryImageList.insertAdjacentHTML('beforeend', imageListHtml || '');
      }
      addGalleryImageCardEventListeners(galleryImages?.results);
      addLoadMoreImagesEventListener(pageNumber);
      addSubscriptionModalEventListeners();
      if (pageNumber === 1) {
        // click on first image
        const firstImage = document.querySelector(`#gallery-image-card-${allImageNodes[0]?.image_id}`);
        firstImage?.click();
      }
    });
  });
}

function addLoadMoreImagesEventListener(pageNumber) {
  const loadMoreImagesButton = document.querySelector('#load-more-images-button');
  loadMoreImagesButton?.addEventListener('click', () => {
    loadMoreImagesButton.innerHTML = `<img style="object-fit:none;aspect-ratio:1;background-color: #111;" src="${chrome.runtime.getURL('images/loading.gif')}" class="row-span-4 mx-auto h-full rounded-md object-scale-down">`;
    loadImageList(pageNumber + 1);
  });
  // add an observer to click the load more button when it is visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        loadMoreImagesButton?.click();
      }
    });
  }, { threshold: 0.5 });
  if (loadMoreImagesButton) {
    observer.observe(loadMoreImagesButton);
  }
}
// eslint-disable-next-line no-unused-vars
function addImageGalleryEventListeners() {
  // search
  const gallerySearch = document.querySelector('#gallery-search');
  gallerySearch?.addEventListener('input', debounce(() => {
    resetSidebar();
    loadImageList();
  }));
  // tab switch
  const dalleTab = document.querySelector('#gallery-tab-dalle');
  const chartsTab = document.querySelector('#gallery-tab-chart');
  const uploadTab = document.querySelector('#gallery-tab-upload');
  const publicTab = document.querySelector('#gallery-tab-public');

  dalleTab?.addEventListener('click', () => {
    showAll = false;
    if (imageGalleryCurrentTab === 'dalle') return;
    dalleTab.dataset.state = 'checked';
    chartsTab.dataset.state = 'unchecked';
    uploadTab.dataset.state = 'unchecked';
    publicTab.dataset.state = 'unchecked';
    imageGalleryCurrentTab = 'dalle';
    document.querySelector('#gallery-search').value = '';
    resetSidebar();
    resetGallerySelection();
    removeUserFilter();
    loadImageList();
  });
  chartsTab?.addEventListener('click', () => {
    showAll = false;
    if (imageGalleryCurrentTab === 'chart') return;
    dalleTab.dataset.state = 'unchecked';
    chartsTab.dataset.state = 'checked';
    uploadTab.dataset.state = 'unchecked';
    publicTab.dataset.state = 'unchecked';
    imageGalleryCurrentTab = 'chart';
    document.querySelector('#gallery-search').value = '';
    resetSidebar();
    resetGallerySelection();
    removeUserFilter();
    loadImageList();
  });
  uploadTab?.addEventListener('click', () => {
    showAll = false;
    if (imageGalleryCurrentTab === 'upload') return;
    dalleTab.dataset.state = 'unchecked';
    chartsTab.dataset.state = 'unchecked';
    uploadTab.dataset.state = 'checked';
    publicTab.dataset.state = 'unchecked';
    imageGalleryCurrentTab = 'upload';
    document.querySelector('#gallery-search').value = '';
    resetSidebar();
    resetGallerySelection();
    removeUserFilter();
    loadImageList();
  });
  publicTab?.addEventListener('click', (e) => {
    // check if shift clicked
    showAll = false;
    if (e.shiftKey) {
      showAll = true;
    }
    if (imageGalleryCurrentTab === 'public') return;
    dalleTab.dataset.state = 'unchecked';
    chartsTab.dataset.state = 'unchecked';
    uploadTab.dataset.state = 'unchecked';
    publicTab.dataset.state = 'checked';
    imageGalleryCurrentTab = 'public';
    document.querySelector('#gallery-search').value = '';
    resetSidebar();
    resetGallerySelection();
    removeUserFilter();
    loadImageList();
  });

  // selection bar
  const cancelSelectionButton = document.querySelector('#gallery-selection-cancel-button');
  cancelSelectionButton?.addEventListener('click', () => {
    resetGallerySelection();
  });
  const deleteSelectionButton = document.querySelector('#gallery-selection-delete-button');
  deleteSelectionButton?.addEventListener('click', () => {
    deleteGalleryimages();
  });
  const makePublicSelectionButton = document.querySelector('#gallery-selection-make-public-button');
  makePublicSelectionButton?.addEventListener('click', () => {
    makeGalleryImagesPublic();
  });
  const downloadSelectionButton = document.querySelector('#gallery-selection-download-button');
  downloadSelectionButton?.addEventListener('click', async (e) => {
    await downloadSelectedImages(downloadSelectionButton, selectedImageGalleryImageIds, null, !e.shiftKey);
  });
  // copy prompt
  const copyPromptButton = document.querySelector('#gallery-selected-image-prompt-copy-button');
  copyPromptButton?.addEventListener('click', (e) => {
    // if shift clicked
    if (e.shiftKey) {
      if (imageGalleryCurrentTab !== 'public') return;
      if (!selectedGalleryImage?.created_by?.id) return;
      addUserFilter(selectedGalleryImage?.created_by);
      loadImageList(1, selectedGalleryImage?.created_by?.id);
      return;
    }
    copyPromptButton.innerHTML = `<div class="flex w-full gap-2 items-center justify-center"><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>${translate('Copied')}!</div>`;
    copyPromptButton.classList = 'opacity-50 hover:bg-inherit cursor-not-allowed btn btn-small text-sm relative btn-secondary block ms-auto';
    setTimeout(() => {
      copyPromptButton.innerHTML = `<div class="flex w-full gap-2 items-center justify-center"><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>${translate('Copy')}</div>`;
      copyPromptButton.classList = 'btn btn-small text-sm relative btn-secondary block ms-auto';
    }, 2000);
    const prompt = document.querySelector('#gallery-selected-image-prompt');
    navigator.clipboard.writeText(prompt.textContent);
  });
  // copy gen id
  const copyGenIdButton = document.querySelector('#gallery-selected-image-gen-id-copy-button');
  copyGenIdButton?.addEventListener('click', () => {
    navigator.clipboard.writeText(copyGenIdButton.innerText);
    toast('Copied Gen ID to clipboard');
  });

  // preview conversation
  const galleryPreviewConversationButton = document.querySelector('#gallery-preview-conversation-button');
  galleryPreviewConversationButton.addEventListener('click', () => {
    const { conversationId } = galleryPreviewConversationButton.dataset;
    showConversationPreviewWrapper(conversationId, null, false, true);
  });
  // more by
  const moreBy = document.querySelector('#more-by');
  moreBy.addEventListener('click', () => {
    if (!selectedGalleryImage?.created_by?.id) return;
    addUserFilter(selectedGalleryImage?.created_by);
    loadImageList(1, selectedGalleryImage?.created_by?.id);
  });
  // menu button
  const menu = document.querySelector('#image-gallery-menu-wrapper');
  const menuButton = document.querySelector('#image-gallery-menu-button');
  menuButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    closeMenus();
    const optionListDropdown = document.querySelector('#image-gallery-menu-options');
    if (optionListDropdown) {
      optionListDropdown.remove();
    } else {
      const newOptionListDropdown = imageGalleryMenuOptions();
      menu.insertAdjacentHTML('beforeend', newOptionListDropdown);
      addImageGalleryMenuEventListener();
    }
  });
}
function addGalleryImageCardEventListeners(imageNodes) {
  // download center image
  // get last 24 image-download-button-*
  const imageDownloadButtons = [...document.querySelectorAll('[id^="image-download-button-"]')].slice(-24);

  const newImageNodeIds = imageNodes?.map((imageNode) => imageNode.image_id);
  imageDownloadButtons.forEach((imageDownloadButton) => {
    createTooltip(imageDownloadButton, 'Download', 'transform: translate(105%, 0%);');
    const imageId = imageDownloadButton.id.split('image-download-button-')[1];
    if (!imageId) return;
    if (!newImageNodeIds?.includes(imageId)) return;
    imageDownloadButton?.addEventListener('click', (e) => {
      const imageElement = document.querySelector(`#gallery-image-card-${imageId}`);
      const url = decodeURIComponent(imageElement.src);
      const format = e.shiftKey
        ? isWindows() ? 'jpg' : 'png'
        : url.split('.').pop() || 'webp';
      const filename = `${imageId}.${format}`;

      if (imageElement.src) {
        downloadFileFromUrl(imageElement.src, filename);
      }
    });
  });

  // share center image
  const imageShareButtons = [...document.querySelectorAll('[id^="image-share-button-"]')].slice(-24);
  imageShareButtons.forEach((imageShareButton) => {
    createTooltip(imageShareButton, 'Share', 'transform: translate(105%, 0%);');

    const imageId = imageShareButton.id.split('image-share-button-')[1];
    if (!imageId) return;
    if (!newImageNodeIds?.includes(imageId)) return;
    imageShareButton?.addEventListener('click', () => {
      const imageNode = imageNodes.find((img) => img.image_id === imageId);
      if (!imageNode) return;
      createShareImageModal(imageNode);
    });
  });
  // image-gallery-checkbox
  const imageGalleryCheckboxes = document.querySelectorAll('[id^="image-gallery-checkbox"]');
  imageGalleryCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener('click', (e) => {
      const imageId = checkbox.id.split('image-gallery-checkbox-')[1];
      if (!imageId) return;
      if (!newImageNodeIds) return;
      if (!newImageNodeIds?.includes(imageId)) return;

      if (checkbox.checked && !selectedImageGalleryImageIds.includes(imageId)) {
        // before adding the first checkbox
        if (selectedImageGalleryImageIds.length === 0) {
          // remove invisible class from all checkboxes
          const curImageGalleryCheckboxes = document.querySelectorAll('[id^="image-gallery-checkbox"]'); curImageGalleryCheckboxes.forEach((cb) => {
            cb.classList.remove('invisible');
          });
          const selectionBar = document.querySelector('div[id="gallery-selection-bar"]');
          if (selectionBar) selectionBar.classList.remove('hidden');
        }
        if (e.shiftKey) {
          if (selectedImageGalleryImageIds.length === 0) return;
          const galleryImages = document.querySelectorAll('[id^="gallery-image-card-"]');
          const lastSelectedImageIndex = allImageNodes.findIndex((imageNode) => imageNode.image_id === selectedImageGalleryImageIds[selectedImageGalleryImageIds.length - 1]);
          const curImageIndex = allImageNodes.findIndex((imageNode) => imageNode.image_id === imageId);
          const start = Math.min(lastSelectedImageIndex, curImageIndex);
          const end = Math.max(lastSelectedImageIndex, curImageIndex);
          for (let i = start; i <= end; i += 1) {
            const galleryImage = galleryImages[i];
            if (!galleryImage) return;
            galleryImage.classList.add('opacity-50');
            const curImageId = galleryImage.id.split('gallery-image-card-')[1];
            if (!curImageId) return;
            const curCheckbox = document.querySelector(`#image-gallery-checkbox-${curImageId}`);
            if (curCheckbox) {
              curCheckbox.checked = true;
              if (!selectedImageGalleryImageIds.includes(curImageId)) {
                selectedImageGalleryImageIds.push(curImageId);
              }
            }
          }
        } else {
          if (!selectedImageGalleryImageIds.includes(imageId)) {
            const galleryImage = document.querySelector(`#gallery-image-card-${imageId}`);
            if (!galleryImage) return;
            galleryImage.classList.add('opacity-50');
            selectedImageGalleryImageIds.push(imageId);
          }
        }
        const selectionCount = document.querySelector('span[id="gallery-selection-count"]');
        if (selectionCount) selectionCount.innerText = `${selectedImageGalleryImageIds.length} selected`;
      } else {
        selectedImageGalleryImageIds = selectedImageGalleryImageIds.filter((id) => id !== imageId);
        const selectionCount = document.querySelector('span[id="gallery-selection-count"]');
        if (selectionCount) selectionCount.innerText = `${selectedImageGalleryImageIds.length} selected`;
        const galleryImage = document.querySelector(`#gallery-image-card-${imageId}`);
        if (galleryImage) galleryImage.classList.remove('opacity-50');
        // if no selected checkbox, add invisible class to all checkboxes
        if (selectedImageGalleryImageIds.length === 0) {
          resetGallerySelection();
        }
      }
    });
  });
  // thumbnail image click
  const galleryImages = document.querySelectorAll('[id^="gallery-image-card-"]');
  galleryImages.forEach((image) => {
    const imageId = image.id.split('gallery-image-card-')[1];
    if (!imageId) return;
    if (!newImageNodeIds) return;
    if (!newImageNodeIds?.includes(imageId)) return;
    image.addEventListener('click', () => {
      selectedGalleryImage = imageNodes.find((imageNode) => imageNode.image_id === image.id.split('gallery-image-card-')[1]);
      document.querySelectorAll('[id^="gallery-image-card-"]').forEach((galleryImage) => {
        galleryImage.classList.remove('ring-2');
      });
      image.classList.add('ring-2');
      // open sidebar if closed
      const imageWrapper = document.querySelector('#image-gallery-image-wrapper');
      const sidebar = document.querySelector('#image-gallery-sidebar');
      sidebar.classList.replace('md:basis-0', 'md:basis-[25vw]');
      imageWrapper.classList.remove('md:basis-[75vw]');
      // update image info in sidebar
      const selectedImage = document.querySelector('#gallery-selected-image');
      selectedImage.src = image.src;
      selectedImage.style.aspectRatio = Math.min(1, (selectedGalleryImage?.width || 1) / (selectedGalleryImage?.height || 1));
      const selectedImageTime = document.querySelector('#gallery-selected-image-timestamp');
      selectedImageTime.textContent = formatDate(new Date(selectedGalleryImage.created_at));
      const selectedImageTitleWrapper = document.querySelector('#gallery-selected-image-title-wrapper');
      const selectedImageTitle = document.querySelector('#gallery-selected-image-title');
      selectedImageTitle.textContent = selectedGalleryImage.title;
      if (selectedGalleryImage.title) {
        selectedImageTitleWrapper.classList.remove('hidden');
      } else {
        selectedImageTitleWrapper.classList.add('hidden');
      }
      const selectedImagePromptTitle = document.querySelector('#gallery-selected-image-prompt-title');
      selectedImagePromptTitle.textContent = selectedGalleryImage.category === 'chart' ? 'Code' : 'Prompt';
      const selectedImagePrompt = document.querySelector('#gallery-selected-image-prompt');
      selectedImagePrompt.innerHTML = imageGalleryCurrentTab === 'chart' ? codeWrapper(selectedGalleryImage.prompt) : selectedGalleryImage.prompt;
      const copyPromptButton = document.querySelector('#gallery-selected-image-prompt-copy-button');
      if (imageGalleryCurrentTab === 'upload') {
        copyPromptButton.classList.add('hidden');
      } else {
        copyPromptButton.classList.remove('hidden');
      }
      const searchValue = document.querySelector('#gallery-search').value;
      if (searchValue) {
        highlightSearch([selectedImagePrompt], searchValue);
      }
      const genId = document.querySelector('#gallery-selected-image-gen-id');
      const galleryPreviewConversationButton = document.querySelector('#gallery-preview-conversation-button');
      galleryPreviewConversationButton.dataset.conversationId = selectedGalleryImage?.conversation_id || '';
      // const moreBy = document.querySelector('#more-by');
      if (['upload', 'public'].includes(imageGalleryCurrentTab)) {
        genId.parentElement.parentElement.classList.add('invisible');
      } else {
        genId.textContent = selectedGalleryImage.gen_id;
        genId.parentElement.parentElement.classList = `flex flex-wrap my-1 text-xs items-center  ${selectedGalleryImage.gen_id ? 'visible' : 'invisible'}`;
      }

      if (['public'].includes(imageGalleryCurrentTab)) {
        galleryPreviewConversationButton.classList.add('invisible');
        // moreBy.classList.remove('invisible');
      } else {
        galleryPreviewConversationButton.classList.remove('invisible');
        // moreBy.classList.add('invisible');
      }
    });
  });
}
function addUserFilter(user) {
  removeUserFilter();
  const galleryHeader = document.querySelector('#gallery-header');
  const galleryFilter = document.createElement('div');
  galleryFilter.id = 'gallery-filter';
  galleryFilter.classList = 'flex items-center justify-between py-2 text-token-text-primary';
  galleryFilter.innerHTML = `<div class="flex items-center gap-2 py-1 px-3 border border-token-border-medium rounded-full"><div class="text-xs">Images by user id: <span id="by-user-id">${user?.id}</span></div><button id="remove-filter-button" class="transition text-token-text-tertiary hover:text-token-text-primary" aria-label="remove filter" type="button"><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="icon-md" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button></div>`;
  // add filter after header
  galleryHeader.insertAdjacentElement('afterend', galleryFilter);
  // add filter event listener
  const removeFilterButton = document.querySelector('#remove-filter-button');
  removeFilterButton?.addEventListener('click', () => {
    removeUserFilter();
    loadImageList();
  });
}
const removeUserFilter = () => {
  const existingFilters = document.querySelectorAll('#gallery-filter');
  existingFilters.forEach((filter) => filter.remove());
};
function resetSidebar() {
  const selectedImage = document.querySelector('#gallery-selected-image');
  selectedImage.src = chrome.runtime.getURL('images/loading.gif');
  selectedImage.style.aspectRatio = 1;
  const selectedImageTime = document.querySelector('#gallery-selected-image-timestamp');
  selectedImageTime.textContent = '...';
  const selectedImagePromptTitle = document.querySelector('#gallery-selected-image-prompt-title');
  selectedImagePromptTitle.textContent = imageGalleryCurrentTab === 'chart' ? 'Code' : 'Prompt';
  const prompt = document.querySelector('#gallery-selected-image-prompt');
  prompt.innerHTML = '...';
  const genId = document.querySelector('#gallery-selected-image-gen-id');
  const galleryPreviewConversationButton = document.querySelector('#gallery-preview-conversation-button');
  // const moreBy = document.querySelector('#more-by');
  const menuButton = document.querySelector('#image-gallery-menu-button');
  if (imageGalleryCurrentTab === 'public') {
    menuButton?.classList?.add('invisible');
    genId.parentElement.parentElement.classList.add('invisible');
    galleryPreviewConversationButton.classList.add('invisible');
    // moreBy.classList.remove('invisible');
  } else if (imageGalleryCurrentTab === 'upload') {
    menuButton?.classList?.remove('invisible');
    genId.parentElement.parentElement.classList.add('invisible');
    galleryPreviewConversationButton.classList.remove('invisible');
    // moreBy.classList.remove
  } else {
    menuButton?.classList?.remove('invisible');
    genId.parentElement.parentElement.classList.remove('invisible');
    genId.textContent = '';
    galleryPreviewConversationButton.classList.remove('invisible');
    // moreBy.classList.add('invisible');
  }
}
function codeWrapper(code) {
  if (!code) return '';
  const { language } = hljs.highlightAuto(code);
  return `<div class="overflow-y-auto" style="background: #333; padding: 8px; border-radius: 8px;"><code hljs language-${language} id="message-plugin-request-html-36053455-5209-4236-901d-a179d861f092" class="!whitespace-pre-wrap" style="font-size:12px;">${code}</code></div>`;
}

function addSubscriptionModalEventListeners() {
  // upgrade to pro
  const upgradeToProButton = document.querySelector('#upgrade-to-pro-button-gallery');
  upgradeToProButton?.addEventListener('click', () => {
    openUpgradeModal(false);
  });
}

// eslint-disable-next-line no-unused-vars
function showImagePicker() {
  const pageNumber = 1;
  selectedImagePickerImageIds = [];
  const imagePickerDialogContent = `<div data-state="open" class="fixed inset-0 bg-black/50" style="pointer-events: auto;">
    <div class="h-full w-full grid grid-cols-[10px_1fr_10px] grid-rows-[minmax(10px,1fr)_auto_minmax(10px,1fr)] md:grid-rows-[minmax(20px,1fr)_auto_minmax(20px,1fr)] overflow-y-auto">
      <div id="image-picker-dialog-content" role="dialog" data-state="open" class="relative col-auto col-start-2 row-auto row-start-2 w-full rounded-xl text-start shadow-xl transition-all start-1/2 ltr:-translate-x-1/2 rtl:translate-x-1/2 bg-token-main-surface-secondary max-w-xl border-token-border-medium border" tabindex="-1" style="pointer-events: auto; width: 700px; max-width: 90vw;height: 500px; max-height: 90vh;">
        <div class="px-4 pb-4 pt-5 flex items-center justify-between border-b border-token-border-medium">
          <div class="flex">
            <div class="flex items-center">
              <div class="flex grow flex-col gap-1">
                <h2 as="h3" class="text-lg font-medium leading-6 text-token-text-primary">${translate('Select images')}</h2>
              </div>
            </div>
          </div>
        </div>
        <div class="p-4 flex flex-col overflow-hidden" style="height: calc(100% - 60px);">
          <div id="image-picker-image-list" class="grid grid-cols-5 content-start w-full h-full auto-rows-min text-xs text-token-text-primary overflow-y-auto rounded-md">
            ${Array.from({ length: 20 }).map((_) => '<div class="relative flex flex-col justify-start items-start gap-2 p-2 cursor-pointer" draggable="false"><div style="aspect-ratio:1;" class="bg-token-main-surface-primary w-full row-span-4 mx-auto h-full rounded-md object-scale-down"></div></div>').join('')}
          </div>
          <div class="mt-5 flex justify-between">
            <div style="display: flex; justify-content: flex-start; align-items: center;">
              <span id="image-picker-selection-count" class="text-sm text-token-text-tertiary">0 selected</span>
            </div>
            <div class="flex flex-row-reverse gap-3 ms-auto">
              <button disabled id="confirm-button" class="btn relative btn-success text-white" as="button">
                <div class="flex w-full gap-2 items-center justify-center">${translate('Attach')}</div>
              </button>
              <button id="cancel-button" class="btn relative btn-secondary" as="button">
                <div class="flex w-full gap-2 items-center justify-center">${translate('Cancel')}</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;
  const imagePickerDialog = document.createElement('div');
  imagePickerDialog.id = 'image-picker-dialog';
  imagePickerDialog.classList = 'absolute inset-0';
  imagePickerDialog.style = 'z-index: 100101;';
  imagePickerDialog.innerHTML = imagePickerDialogContent;
  document.body.appendChild(imagePickerDialog);

  const confirmButton = document.querySelector('#image-picker-dialog #confirm-button');
  const cancelButton = document.querySelector('#image-picker-dialog #cancel-button');
  confirmButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeMenus();
    const selectedImages = Array.from(document.querySelectorAll('[id^="image-picker-checkbox"]:checked')).map((checkbox) => ({
      imageId: checkbox.id.split('image-picker-checkbox-')[1],
      imageUrl: document.querySelector(`#image-picker-image-card-${checkbox.id.split('image-picker-checkbox-')[1]}`)?.src,
    }));
    if (selectedImages.length === 0) {
      toast('No images selected', 'error');
      return;
    }
    // attach images
    attachImagesToInput(selectedImages);

    imagePickerDialog.remove();
  });
  cancelButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeMenus();

    imagePickerDialog.remove();
  });
  // click outside to close
  imagePickerDialog.addEventListener('click', (e) => {
    const curConfirmButton = document.querySelector('#image-picker-dialog #confirm-button');
    if (curConfirmButton.querySelector('#progress-spinner')) return;
    const curImagePickerDialogContent = document.querySelector('#image-picker-dialog-content');
    if (!isDescendant(curImagePickerDialogContent, e.target)) {
      imagePickerDialog.remove();
    }
  });
  // load images
  getImagesForPage(pageNumber);
}
async function getImagesForPage(pageNumber) {
  // load images
  const imagePickerImageList = document.querySelector('#image-picker-image-list');

  const galleryImages = await chrome.runtime.sendMessage({
    type: 'getGalleryImages',
    detail: {
      pageNumber,
      category: 'all',
      searchTerm: '',
    },
  });
  if (!galleryImages || !galleryImages.results) return;
  if (galleryImages.results.length === 0) {
    return;
  }
  const hasMore = galleryImages?.next;
  const imageListHtml = `${galleryImages.results.map((imageNode) => `<div class="group/dalle-image relative flex flex-col justify-start items-start gap-2 p-2 cursor-pointer" draggable="false"><img id="image-picker-image-card-${imageNode.image_id}" src="${imageNode.image}" alt="${imageNode.prompt?.replace(/[^a-zA-Z0-9 ]/gi, '') || 'Generated by ChatGPT'}" style="aspect-ratio:1;" class="bg-token-main-surface-primary border border-token-border-medium w-full row-span-4 mx-auto h-full rounded-md object-scale-down">
    <input type="checkbox" id="image-picker-checkbox-${imageNode.image_id}" class="${selectedImagePickerImageIds.length === 0 ? 'invisible' : ''} absolute end-3 top-3 group-hover/dalle-image:visible" style="z-index: 11; cursor: pointer; border-radius: 2px;">
  </div>`).join('')}`;

  if (pageNumber === 1) {
    imagePickerImageList.innerHTML = imageListHtml;
  } else {
    // remove the load more button
    const loadMoreImagesButton = document.querySelector('#load-more-images-button');
    loadMoreImagesButton?.parentElement?.remove();
    imagePickerImageList.insertAdjacentHTML('beforeend', imageListHtml);
  }
  if (hasMore) {
    imagePickerImageList.insertAdjacentHTML('beforeend', '<div class="flex flex-col w-full justify-start items-start gap-2 p-2 w-full" style="aspect-ratio:1;"><div id="load-more-images-button" class="relative flex flex-col w-full h-full justify-center items-center text-token-text-primary text-2xl font-bold cursor-pointer bg-token-main-surface-secondary hover:shadow-xl rounded-xl">Load more...</div></div>');
  }
  addImagePickerEventListeners(galleryImages.results, pageNumber);
}
function addImagePickerEventListeners(imageNodes, pageNumber) {
  const newImageNodeIds = imageNodes?.map((imageNode) => imageNode.image_id);
  // when click on image, select checkbox
  const imagePickerImages = document.querySelectorAll('[id^="image-picker-image-card"]');
  imagePickerImages.forEach((image) => {
    const imageId = image.id.split('image-picker-image-card-')[1];
    if (!imageId) return;
    if (!newImageNodeIds?.includes(imageId)) return;
    image.addEventListener('click', () => {
      const checkbox = document.querySelector(`#image-picker-checkbox-${imageId}`);
      if (checkbox) {
        checkbox.click();
      }
    });
  });
  const imagePickerCheckboxes = document.querySelectorAll('[id^="image-picker-checkbox"]');
  imagePickerCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener('click', (e) => {
      // if 10 images selected, prevent further selection
      e.stopPropagation();
      if (selectedImagePickerImageIds.length >= 10 && checkbox.checked) {
        e.preventDefault();
        toast('Maximum 10 images can be selected', 'error');
        return;
      }
      const imageId = checkbox.id.split('image-picker-checkbox-')[1];
      if (!imageId) return;
      if (!newImageNodeIds) return;
      if (!newImageNodeIds?.includes(imageId)) return;

      if (checkbox.checked && !selectedImagePickerImageIds.includes(imageId)) {
        // enable attach button
        const confirmButton = document.querySelector('#image-picker-dialog #confirm-button');
        confirmButton.disabled = false;
        // before adding the first checkbox
        if (selectedImagePickerImageIds.length === 0) {
          // remove invisible class from all checkboxes
          const curImagePickerCheckboxes = document.querySelectorAll('[id^="image-picker-checkbox"]'); curImagePickerCheckboxes.forEach((cb) => {
            cb.classList.remove('invisible');
          });
        }

        if (!selectedImagePickerImageIds.includes(imageId)) {
          const imagePickerImage = document.querySelector(`#image-picker-image-card-${imageId}`);
          if (!imagePickerImage) return;
          imagePickerImage.classList.add('opacity-50');
          selectedImagePickerImageIds.push(imageId);
        }
        const selectionCount = document.querySelector('span[id="image-picker-selection-count"]');
        if (selectionCount) selectionCount.innerText = `${selectedImagePickerImageIds.length} selected`;
      } else {
        selectedImagePickerImageIds = selectedImagePickerImageIds.filter((id) => id !== imageId);
        const selectionCount = document.querySelector('span[id="image-picker-selection-count"]');
        if (selectionCount) selectionCount.innerText = `${selectedImagePickerImageIds.length} selected`;
        const imagePickerImage = document.querySelector(`#image-picker-image-card-${imageId}`);
        if (imagePickerImage) imagePickerImage.classList.remove('opacity-50');
        // if no selected checkbox, add invisible class to all checkboxes
        if (selectedImagePickerImageIds.length === 0) {
          resetImagePickerSelection();
        }
      }
    });
  });

  const loadMoreImagesButton = document.querySelector('#load-more-images-button');
  loadMoreImagesButton?.addEventListener('click', () => {
    loadMoreImagesButton.innerHTML = `<img style="object-fit:none;aspect-ratio:1;background-color: #111;" src="${chrome.runtime.getURL('images/loading.gif')}" class="row-span-4 mx-auto h-full rounded-md object-scale-down">`;
    getImagesForPage(pageNumber + 1);
  });
  // add an observer to click the load more button when it is visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        loadMoreImagesButton?.click();
      }
    });
  }, { threshold: 0.5 });
  if (loadMoreImagesButton) {
    observer.observe(loadMoreImagesButton);
  }
}
function resetImagePickerSelection() {
  const confirmButton = document.querySelector('#image-picker-dialog #confirm-button');
  confirmButton.disabled = true;
  const imagePickerImages = document.querySelectorAll('[id^="image-picker-image-card-"]');
  imagePickerImages.forEach((image) => {
    image.classList.remove('opacity-50');
  });
  const curImagePickerCheckboxes = document.querySelectorAll('[id^="image-picker-checkbox"]');
  curImagePickerCheckboxes.forEach((cb) => {
    cb.checked = false;
    cb.classList.add('invisible');
  });

  const selectionCount = document.querySelector('span[id="image-picker-selection-count"]');
  if (selectionCount) selectionCount.innerText = '0 selected';
}

function createShareImageModal(imageNode) {
  const shareModal = `<div id="share-image-modal" class="absolute inset-0 max-w-[664px] px-4">
    <div id="share-image-modal-content" class="fixed inset-0" data-state="open" style="pointer-events: auto; backdrop-filter: blur(4px); background-color: rgba(0, 0, 0, 0.8); z-index: 100000;">
      <div class="z-50 h-full w-full overflow-y-auto grid grid-cols-[10px_1fr_10px] grid-rows-[minmax(10px,1fr)_auto_minmax(10px,1fr)] md:grid-rows-[minmax(20px,1fr)_auto_minmax(20px,1fr)]" style="opacity: 1; transform: none;">
        <div id="share-image-modal-dialog" role="dialog" aria-describedby="" aria-labelledby="radix-«r46»" data-state="open" class="popover bg-token-sidebar-surface relative start-1/2 col-auto col-start-2 row-auto row-start-2 h-full w-full gap-4 p-4 text-start ltr:-translate-x-1/2 rtl:translate-x-1/2 dark:bg-[#171717] rounded-[36px] shadow-[0_32px_48px_rgba(0,0,0,0.175),_0_0_1px_rgba(0,0,0,0.2)] dark:shadow-[0_32px_48px_rgba(0,0,0,0.175),_0_0_1px_rgba(255,255,255,0.4)] flex flex-col pb-4 focus:outline-hidden max-w-[640px]" aria-description="Share sheet" tabindex="-1" style="pointer-events: auto;">
          <div class="px-4 pb-2 sm:p-6 flex items-center justify-between border-b border-black/10 dark:border-white/10">
            <div class="flex max-w-full">
              <div class="flex max-w-full min-w-0 items-center">
                <div class="flex max-w-full min-w-0 grow flex-col gap-1">
                  <h2 id="share-image-title" class="text-token-text-primary text-3xl leading-6 font-semibold tracking-tight max-sm:text-xl">${imageNode.title}</h2>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-5">
              <button id="share-image-close-button" data-testid="close-button" class="hover:bg-token-main-surface-secondary focus-visible:ring-token-text-quaternary dark:hover:bg-token-main-surface-tertiary flex h-8 w-8 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent focus-visible:outline-hidden bg-transparent sm:mt-0" aria-label="Close" type="button">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                  xmlns="http://www.w3.org/2000/svg" class="icon-md">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M5.63603 5.63604C6.02656 5.24552 6.65972 5.24552 7.05025 5.63604L12 10.5858L16.9497 5.63604C17.3403 5.24552 17.9734 5.24552 18.364 5.63604C18.7545 6.02657 18.7545 6.65973 18.364 7.05025L13.4142 12L18.364 16.9497C18.7545 17.3403 18.7545 17.9734 18.364 18.364C17.9734 18.7545 17.3403 18.7545 16.9497 18.364L12 13.4142L7.05025 18.364C6.65972 18.7545 6.02656 18.7545 5.63603 18.364C5.24551 17.9734 5.24551 17.3403 5.63603 16.9497L10.5858 12L5.63603 7.05025C5.24551 6.65973 5.24551 6.02657 5.63603 5.63604Z" fill="currentColor"></path>
                </svg>
              </button>
            </div>
          </div>
          <div>
            <div class="max-xs:max-h-[260px] flex h-[30vh] max-h-[550px] max-w-full justify-center rounded-xl max-sm:max-h-[300px]">
              <img class="rounded-xl" alt="${imageNode.title}" src="${imageNode.image}">
            </div>
            <div class="mt-12 flex flex-wrap justify-center space-y-4 space-x-12 max-sm:mt-6 max-sm:space-x-6">
              <button id="share-image-copy-link" class="relative flex flex-col gap-y-4 disabled:opacity-50 max-sm:gap-y-2">
                <div class="shadow-token-border-default flex h-16 w-16 items-center justify-center rounded-full shadow-md max-sm:h-12 max-sm:w-12">
                  <div class="pointer-events-none flex h-8 w-8 items-center justify-center max-sm:h-6 max-sm:w-6">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M18.2929 5.70711C16.4743 3.88849 13.5257 3.88849 11.7071 5.7071L10.7071 6.70711C10.3166 7.09763 9.68341 7.09763 9.29289 6.70711C8.90236 6.31658 8.90236 5.68342 9.29289 5.29289L10.2929 4.29289C12.8926 1.69323 17.1074 1.69323 19.7071 4.29289C22.3068 6.89256 22.3068 11.1074 19.7071 13.7071L18.7071 14.7071C18.3166 15.0976 17.6834 15.0976 17.2929 14.7071C16.9024 14.3166 16.9024 13.6834 17.2929 13.2929L18.2929 12.2929C20.1115 10.4743 20.1115 7.52572 18.2929 5.70711ZM15.7071 8.29289C16.0976 8.68342 16.0976 9.31658 15.7071 9.70711L9.7071 15.7071C9.31658 16.0976 8.68341 16.0976 8.29289 15.7071C7.90236 15.3166 7.90236 14.6834 8.29289 14.2929L14.2929 8.29289C14.6834 7.90237 15.3166 7.90237 15.7071 8.29289ZM6.7071 9.29289C7.09763 9.68342 7.09763 10.3166 6.7071 10.7071L5.7071 11.7071C3.88849 13.5257 3.88849 16.4743 5.7071 18.2929C7.52572 20.1115 10.4743 20.1115 12.2929 18.2929L13.2929 17.2929C13.6834 16.9024 14.3166 16.9024 14.7071 17.2929C15.0976 17.6834 15.0976 18.3166 14.7071 18.7071L13.7071 19.7071C11.1074 22.3068 6.89255 22.3068 4.29289 19.7071C1.69322 17.1074 1.69322 12.8926 4.29289 10.2929L5.29289 9.29289C5.68341 8.90237 6.31658 8.90237 6.7071 9.29289Z" fill="currentColor"></path>
                    </svg>
                  </div>
                </div>
                <div class="w-full text-center text-xs">Copy link</div>
              </button>
              <button id="share-image-twitter" class="relative flex flex-col gap-y-4 disabled:opacity-50 max-sm:gap-y-2">
                <div class="shadow-token-border-default flex h-16 w-16 items-center justify-center rounded-full shadow-md max-sm:h-12 max-sm:w-12">
                  <div class="pointer-events-none flex h-8 w-8 items-center justify-center max-sm:h-6 max-sm:w-6">
                    <div>
                      <svg width="40" height="40" viewBox="0 0 40 40" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <rect width="40" height="40" rx="20"></rect>
                        <path d="M23.989 13.377H26.2902L21.2641 19.1201L27.1768 26.9363H22.5483L18.9206 22.197L14.7745 26.9363H12.4701L17.8449 20.7922L12.1768 13.377H16.9225L20.1983 17.7088L23.989 13.377ZM23.1807 25.5608H24.4551L16.2283 14.6807H14.8593L23.1807 25.5608Z" fill="var(--text-primary)"></path>
                      </svg>
                    </div>
                  </div>
                </div>
                <div class="w-full text-center text-xs">X</div>
              </button>
              <button id="share-image-linkedin" class="relative flex flex-col gap-y-4 disabled:opacity-50 max-sm:gap-y-2">
                <div class="shadow-token-border-default flex h-16 w-16 items-center justify-center rounded-full shadow-md max-sm:h-12 max-sm:w-12">
                  <div class="pointer-events-none flex h-8 w-8 items-center justify-center max-sm:h-6 max-sm:w-6">
                    <div>
                      <svg width="40" height="40" viewBox="0 0 40 40" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <rect width="40" height="40" rx="20"></rect>
                        <path d="M27.65 11H12.35C11.992 11 11.6486 11.1422 11.3954 11.3954C11.1422 11.6486 11 11.992 11 12.35V27.65C11 28.008 11.1422 28.3514 11.3954 28.6046C11.6486 28.8578 11.992 29 12.35 29H27.65C28.008 29 28.3514 28.8578 28.6046 28.6046C28.8578 28.3514 29 28.008 29 27.65V12.35C29 11.992 28.8578 11.6486 28.6046 11.3954C28.3514 11.1422 28.008 11 27.65 11ZM16.4 26.3H13.7V18.2H16.4V26.3ZM15.05 16.625C14.7406 16.6162 14.4406 16.5163 14.1876 16.338C13.9346 16.1596 13.7397 15.9107 13.6274 15.6222C13.515 15.3337 13.4902 15.0186 13.5559 14.7161C13.6217 14.4136 13.7751 14.1372 13.9971 13.9214C14.2191 13.7056 14.4997 13.56 14.8039 13.5028C15.1081 13.4456 15.4225 13.4793 15.7077 13.5997C15.9928 13.7201 16.2362 13.9219 16.4074 14.1798C16.5785 14.4378 16.6699 14.7404 16.67 15.05C16.6629 15.4733 16.4885 15.8766 16.1849 16.1717C15.8814 16.4669 15.4733 16.6298 15.05 16.625ZM26.3 26.3H23.6V22.034C23.6 20.756 23.06 20.297 22.358 20.297C22.1522 20.3107 21.9511 20.3649 21.7663 20.4566C21.5815 20.5482 21.4166 20.6755 21.2811 20.831C21.1457 20.9866 21.0422 21.1674 20.9768 21.363C20.9114 21.5586 20.8853 21.7652 20.9 21.971C20.8955 22.0129 20.8955 22.0551 20.9 22.097V26.3H18.2V18.2H20.81V19.37C21.0733 18.9695 21.435 18.6433 21.8605 18.4227C22.286 18.2021 22.761 18.0944 23.24 18.11C24.635 18.11 26.264 18.884 26.264 21.404L26.3 26.3Z" fill="var(--text-primary)"></path>
                      </svg>
                    </div>
                  </div>
                </div>
                <div class="w-full text-center text-xs">LinkedIn</div>
              </button>
              <button id="share-image-reddit" class="relative flex flex-col gap-y-4 disabled:opacity-50 max-sm:gap-y-2">
                <div class="shadow-token-border-default flex h-16 w-16 items-center justify-center rounded-full shadow-md max-sm:h-12 max-sm:w-12">
                  <div class="pointer-events-none flex h-8 w-8 items-center justify-center max-sm:h-6 max-sm:w-6">
                    <div>
                      <svg width="40" height="40" viewBox="0 0 40 40" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <rect width="40" height="40" rx="20"></rect>
                        <path d="M24.5703 15.1641C23.5859 15.1641 22.7617 14.4805 22.543 13.5625C21.3477 13.7305 20.4258 14.7617 20.4258 16V16.0078C22.2773 16.0781 23.9648 16.5977 25.3047 17.4258C25.7969 17.0469 26.4141 16.8203 27.082 16.8203C28.6953 16.8203 30 18.125 30 19.7383C30 20.9023 29.3203 21.9062 28.332 22.375C28.2383 25.7656 24.543 28.4922 20.0039 28.4922C15.4648 28.4922 11.7773 25.7695 11.6797 22.3828C10.6875 21.918 10 20.9102 10 19.7383C10 18.125 11.3047 16.8203 12.918 16.8203C13.5898 16.8203 14.207 17.0469 14.7031 17.4297C16.0312 16.6055 17.7031 16.0859 19.5352 16.0078V15.9961C19.5352 14.2656 20.8516 12.8359 22.5352 12.6562C22.7266 11.7109 23.5625 11 24.5703 11C25.7188 11 26.6523 11.9336 26.6523 13.082C26.6523 14.2305 25.7188 15.1641 24.5703 15.1641ZM16.1523 19.7227C15.3359 19.7227 14.6328 20.5352 14.582 21.5938C14.5312 22.6523 15.25 23.082 16.0664 23.082C16.8828 23.082 17.4961 22.6992 17.543 21.6406C17.5898 20.582 16.9688 19.7227 16.1484 19.7227H16.1523ZM25.4297 21.5898C25.3828 20.5312 24.6797 19.7188 23.8594 19.7188C23.0391 19.7188 22.418 20.5781 22.4648 21.6367C22.5117 22.6953 23.125 23.0781 23.9414 23.0781C24.7578 23.0781 25.4766 22.6484 25.4258 21.5898H25.4297ZM23.082 24.3555C23.1406 24.2148 23.043 24.0547 22.8906 24.0391C21.9922 23.9492 21.0195 23.8984 20.0078 23.8984C18.9961 23.8984 18.0234 23.9492 17.125 24.0391C16.9727 24.0547 16.875 24.2148 16.9336 24.3555C17.4375 25.5586 18.625 26.4023 20.0078 26.4023C21.3906 26.4023 22.5781 25.5586 23.082 24.3555Z" fill="var(--text-primary)"></path>
                      </svg>
                    </div>
                  </div>
                </div>
                <div class="w-full text-center text-xs">Reddit</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', shareModal);
  addShareModalEventListeners(imageNode);
}
function addShareModalEventListeners(imageNode) {
  const shareImageModalContent = document.querySelector('#share-image-modal-content');
  const shareImageModalDialog = document.querySelector('#share-image-modal-dialog');
  shareImageModalContent.addEventListener('click', (e) => {
    if (!isDescendant(shareImageModalDialog, e.target)) {
      const shareImageModal = document.querySelector('#share-image-modal');
      shareImageModal.remove();
    }
  });
  const closeButton = document.querySelector('#share-image-close-button');
  const copyLinkButton = document.querySelector('#share-image-copy-link');
  const twitterButton = document.querySelector('#share-image-twitter');
  const linkedinButton = document.querySelector('#share-image-linkedin');
  const redditButton = document.querySelector('#share-image-reddit');
  const getPermalink = async () => {
    const shareData = {
      share_id: imageNode.image_id,
      attachments_to_create: [{
        conversation_id: imageNode.conversation_id,
        file_id: imageNode.image_id,
        height: imageNode.height,
        width: imageNode.width,
        kind: 'image_share',
      }],
      post_text: imageNode.title,
    };
    const postResponse = await sharePost(shareData);
    const permalink = postResponse?.post?.permalink;
    if (!permalink) {
      toast('Failed to copy link', 'error');
      return null;
    }
    return permalink;
  };
  closeButton.addEventListener('click', () => {
    const shareImageModal = document.querySelector('#share-image-modal');
    if (shareImageModal) {
      shareImageModal.remove();
    }
  });
  copyLinkButton.addEventListener('click', async () => {
    const permalink = await getPermalink();
    if (!permalink) return;
    await navigator.clipboard.writeText(permalink);
    toast('Link copied to clipboard', 'success');
  });
  twitterButton.addEventListener('click', async () => {
    const permalink = await getPermalink();
    if (!permalink) return;
    window.open(`https://twitter.com/intent/tweet?url=${permalink}&text=${imageNode.title}`, '_blank');
  });
  linkedinButton.addEventListener('click', async () => {
    const permalink = await getPermalink();
    if (!permalink) return;
    window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${permalink}&text=${imageNode.title}`, '_blank');
  });
  redditButton.addEventListener('click', async () => {
    const permalink = await getPermalink();
    if (!permalink) return;
    window.open(`https://www.reddit.com/submit?url=${permalink}&title=${imageNode.title}`, '_blank');
  });
}
