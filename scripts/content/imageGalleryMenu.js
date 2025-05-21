/* eslint-disable no-restricted-globals */
/* global isDescendant, selectedImageGalleryImageIds:true, imageGalleryCurrentTab, JSZip, saveAs, showConfirmDialog, toast, openUpgradeModal, resetGallerySelection, formatTime, showDateSelectorDialog, translate, resetSidebar, isWindows, allImageNodes:true */
/* eslint-disable no-unused-vars */
function imageGalleryMenu() {
  return `<div id="image-gallery-menu-wrapper" class="me-2" style="min-width:48px;z-index:100;margin-left:56px;"><button id="image-gallery-menu-button" class="${imageGalleryCurrentTab === 'public' ? 'invisible' : ''} relative w-full flex items-center justify-center cursor-pointer rounded-md border bg-token-main-surface-primary border-token-border-medium p-2 text-center focus:border-green-600 focus:outline-none  sm:text-sm" type="button">
  <span class="flex items-center justify-center w-full truncate font-semibold text-token-text-primary">
<svg xmlns="http://www.w3.org/2000/svg" stroke="currentColor" fill="currentColor" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" viewBox="0 0 448 512"><path d="M0 88C0 74.75 10.75 64 24 64H424C437.3 64 448 74.75 448 88C448 101.3 437.3 112 424 112H24C10.75 112 0 101.3 0 88zM0 248C0 234.7 10.75 224 24 224H424C437.3 224 448 234.7 448 248C448 261.3 437.3 272 424 272H24C10.75 272 0 261.3 0 248zM424 432H24C10.75 432 0 421.3 0 408C0 394.7 10.75 384 24 384H424C437.3 384 448 394.7 448 408C448 421.3 437.3 432 424 432z"/></svg></span>
</button>
  </div>`;
}
function imageGalleryMenuOptions() {
  return `<ul id="image-gallery-menu-options" style="max-height:400px;width:300px;" class="block transition-all absolute z-10 end-4 mt-1 overflow-auto rounded-md p-1 text-base border border-token-border-medium focus:outline-none bg-token-main-surface-primary dark:ring-white/20 dark:last:border-b-0 sm:text-sm -translate-x-1/4" role="menu" aria-orientation="vertical" tabindex="-1">
  ${imageGalleryCurrentTab !== 'public' ? `

  <li class="relative cursor-pointer select-none border-b py-2 ps-3 pe-9 last:border-b-0 border-token-border-medium hover:bg-token-main-surface-secondary" id="image-gallery-menu-option-download" role="option" tabindex="-1">
  <div class="flex items-center text-token-text-primary">
  <svg stroke="currentColor" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md me-2"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.70711 10.2929C7.31658 9.90237 6.68342 9.90237 6.29289 10.2929C5.90237 10.6834 5.90237 11.3166 6.29289 11.7071L11.2929 16.7071C11.6834 17.0976 12.3166 17.0976 12.7071 16.7071L17.7071 11.7071C18.0976 11.3166 18.0976 10.6834 17.7071 10.2929C17.3166 9.90237 16.6834 9.90237 16.2929 10.2929L13 13.5858L13 4C13 3.44771 12.5523 3 12 3C11.4477 3 11 3.44771 11 4L11 13.5858L7.70711 10.2929ZM5 19C4.44772 19 4 19.4477 4 20C4 20.5523 4.44772 21 5 21H19C19.5523 21 20 20.5523 20 20C20 19.4477 19.5523 19 19 19L5 19Z" fill="currentColor"></path></svg>
    <span class="font-semibold flex h-6 items-center gap-1 truncate text-token-text-primary">${translate(`Download ${selectedImageGalleryImageIds.length > 0 ? 'selected' : 'all'} images`)}</span>
  </div>
  </li>

  <li class="relative cursor-pointer select-none border-b py-2 ps-3 pe-9 last:border-b-0 border-token-border-medium hover:bg-token-main-surface-secondary" id="image-gallery-menu-option-date-range-download" role="option" tabindex="-1">
  <div class="flex items-center text-token-text-primary">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" class="icon-md me-2"><path d="M96 288C96 270.3 110.3 256 128 256C145.7 256 160 270.3 160 288C160 305.7 145.7 320 128 320C110.3 320 96 305.7 96 288zM320 352C337.7 352 352 366.3 352 384C352 401.7 337.7 416 320 416C302.3 416 288 401.7 288 384C288 366.3 302.3 352 320 352zM192 288C192 274.7 202.7 264 216 264H328C341.3 264 352 274.7 352 288C352 301.3 341.3 312 328 312H216C202.7 312 192 301.3 192 288zM232 360C245.3 360 256 370.7 256 384C256 397.3 245.3 408 232 408H120C106.7 408 96 397.3 96 384C96 370.7 106.7 360 120 360H232zM152 64H296V24C296 10.75 306.7 0 320 0C333.3 0 344 10.75 344 24V64H384C419.3 64 448 92.65 448 128V448C448 483.3 419.3 512 384 512H64C28.65 512 0 483.3 0 448V128C0 92.65 28.65 64 64 64H104V24C104 10.75 114.7 0 128 0C141.3 0 152 10.75 152 24V64zM48 448C48 456.8 55.16 464 64 464H384C392.8 464 400 456.8 400 448V192H48V448z"/></svg>
    <span class="font-semibold flex h-6 items-center gap-1 truncate text-token-text-primary">${translate('Download images by date range')}</span>
  </div>
  </li>

  ${imageGalleryCurrentTab === 'dalle' ? `
  <li class="relative cursor-pointer select-none border-b py-2 ps-3 pe-9 last:border-b-0 border-token-border-medium hover:bg-token-main-surface-secondary" id="image-gallery-menu-option-public" role="option" tabindex="-1">
  <div class="flex items-center text-token-text-primary">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" stroke="currentColor" fill="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-md me-2" height="1em" width="1em"><path d="M319.9 320c57.41 0 103.1-46.56 103.1-104c0-57.44-46.54-104-103.1-104c-57.41 0-103.1 46.56-103.1 104C215.9 273.4 262.5 320 319.9 320zM369.9 352H270.1C191.6 352 128 411.7 128 485.3C128 500.1 140.7 512 156.4 512h327.2C499.3 512 512 500.1 512 485.3C512 411.7 448.4 352 369.9 352zM512 160c44.18 0 80-35.82 80-80S556.2 0 512 0c-44.18 0-80 35.82-80 80S467.8 160 512 160zM183.9 216c0-5.449 .9824-10.63 1.609-15.91C174.6 194.1 162.6 192 149.9 192H88.08C39.44 192 0 233.8 0 285.3C0 295.6 7.887 304 17.62 304h199.5C196.7 280.2 183.9 249.7 183.9 216zM128 160c44.18 0 80-35.82 80-80S172.2 0 128 0C83.82 0 48 35.82 48 80S83.82 160 128 160zM551.9 192h-61.84c-12.8 0-24.88 3.037-35.86 8.24C454.8 205.5 455.8 210.6 455.8 216c0 33.71-12.78 64.21-33.16 88h199.7C632.1 304 640 295.6 640 285.3C640 233.8 600.6 192 551.9 192z"/></svg>
    <span class="font-semibold flex h-6 items-center gap-1 truncate text-token-text-primary">${translate(`Make ${selectedImageGalleryImageIds.length > 0 ? 'selected' : 'all'} images public`)}</span>
  </div>
  </li>
  ` : ''}

  <li class="relative text-red-500 cursor-pointer select-none border-b py-2 ps-3 pe-9 last:border-b-0 border-token-border-medium hover:bg-token-main-surface-secondary" id="image-gallery-menu-option-delete" role="option" tabindex="-1">
  <div class="flex items-center">
    <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="icon-md me-2" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
    <span class="font-semibold flex h-6 items-center gap-1 truncate text-red-500">${translate(`Delete ${selectedImageGalleryImageIds.length > 0 ? 'selected' : 'all'} images`)}</span>
    </div>
  </li>
    ` : ''}
  </ul>`;
}
function addImageGalleryMenuEventListener(callback = null) {
  chrome.runtime.sendMessage({
    type: 'checkHasSubscription',
    forceRefresh: true,
  }, (hasSubscription) => {
    const menuButton = document.querySelector('#image-gallery-menu-button');

    // close optionListDropdown when clicked outside
    document.body.addEventListener('click', (e) => {
      const optionListDropdown = document.querySelector('#image-gallery-menu-options');

      if (optionListDropdown && !isDescendant(optionListDropdown, e.target)) {
        optionListDropdown.remove();
      }
    });
    const optionSelectorOptions = document.querySelectorAll('[id^=image-gallery-menu-option-]');
    optionSelectorOptions.forEach((option) => {
      option.addEventListener('click', async (e) => {
        // close menu
        const optionListDropdown = document.querySelector('#image-gallery-menu-options');
        optionListDropdown.classList.replace('block', 'hidden');

        const optionId = option.id.split('image-gallery-menu-option-')[1];
        if (!hasSubscription) {
          openUpgradeModal();
          return;
        }
        if (optionId === 'download') {
          await downloadSelectedImages(menuButton, selectedImageGalleryImageIds, null, !e.shiftKey);
        }
        if (optionId === 'date-range-download') {
          showDateSelectorDialog('Download Images', 'Select date range', 'Cancel', 'Download', null, async (startDate, endDate) => {
            const origMenuButton = menuButton.cloneNode(true);

            menuButton.disabled = true;
            menuButton.innerHTML = '<svg x="0" y="0" viewbox="0 0 40 40" class="spinner icon-xl" style="height:24px;"><circle fill="transparent" stroke="#ffffff50" stroke-width="2" stroke-linecap="round" stroke-dasharray="125.6" cx="20" cy="20" r="18"></circle></svg>';
            menuButton.disabled = true;
            await chrome.runtime.sendMessage({
              type: 'getGalleryImagesByDateRange',
              detail: {
                category: imageGalleryCurrentTab,
                startDate,
                endDate,
              },
            }, async (selectedGalleryImages) => {
              zipImages(selectedGalleryImages, menuButton, origMenuButton, !e.shiftKey);
            });
          }, 'green', true);
        }
        if (optionId === 'public') {
          makeGalleryImagesPublic();
        }
        if (optionId === 'delete') {
          deleteGalleryimages();
        }
      });
    });
  });
}
function makeGalleryImagesPublic() {
  showConfirmDialog('Share Images', `Are you sure you want to make ${selectedImageGalleryImageIds.length > 0 ? 'selected' : 'all'} images public?`, 'Cancel', 'Confirm', null, async () => {
    await chrome.runtime.sendMessage({
      type: 'shareGalleryImages',
      detail: {
        imageIds: selectedImageGalleryImageIds,
        category: imageGalleryCurrentTab,
      },
    }, async (res) => {
      if (res?.success) {
        if (selectedImageGalleryImageIds.length === 0) {
          toast('All images are now public');
          return;
        }
        toast('Selected images are now public');
        // resetGallerySelection();
      }
    });
  }, 'green');
}
function deleteGalleryimages() {
  showConfirmDialog('Delete Images', `Are you sure you want to delete ${selectedImageGalleryImageIds.length > 0 ? 'selected' : 'all'} images?`, 'Cancel', 'Confirm', null, async () => {
    await chrome.runtime.sendMessage({
      type: 'deleteGalleryImages',
      detail: {
        imageIds: selectedImageGalleryImageIds,
        category: imageGalleryCurrentTab,
      },
    }, async (res) => {
      if (res?.success) {
        if (selectedImageGalleryImageIds.length === 0) { // delete all images
          const galleryImageList = document.querySelector('#gallery-image-list');
          if (galleryImageList) {
            galleryImageList.innerHTML = '';
          }
          resetSidebar();
          toast('All images are deleted');
          return;
        }
        // remove from allImageNodes
        allImageNodes = allImageNodes.filter((imageNode) => !selectedImageGalleryImageIds.includes(imageNode.image_id));
        // remove all selected images
        selectedImageGalleryImageIds.forEach((imageId) => {
          const imageNode = document.querySelector(`#gallery-image-card-${imageId}`);
          if (imageNode) {
            imageNode.parentElement?.remove();
          }
        });
        toast('Selected images are deleted');
        // select the first image
        const firstImage = document.querySelector('img[id^="gallery-image-card-"]');
        if (firstImage) {
          firstImage.click();
        }
        resetGallerySelection();
      }
    });
  }, 'red');
}
async function downloadSelectedImages(menuButton = null, imageIds = [], conversationId = null, defaultFormat = true) {
  let origMenuButton;
  if (menuButton) {
    origMenuButton = menuButton.cloneNode(true);
    menuButton.disabled = true;
    menuButton.innerHTML = '<svg x="0" y="0" viewbox="0 0 40 40" class="spinner icon-xl" style="height:24px;"><circle fill="transparent" stroke="#ffffff50" stroke-width="2" stroke-linecap="round" stroke-dasharray="125.6" cx="20" cy="20" r="18"></circle></svg>';
  }
  await chrome.runtime.sendMessage({
    type: 'getSelectedGalleryImages',
    detail: {
      category: imageGalleryCurrentTab,
      imageIds,
      conversationId,
    },
  }, async (selectedGalleryImages) => {
    zipImages(selectedGalleryImages, menuButton, origMenuButton, defaultFormat);
  });
}

async function zipImages(selectedGalleryImages, menuButton = null, origMenuButton = null, originalFormat = true) {
  if (selectedGalleryImages.length === 0) {
    toast('No images to download');
    resetMenuButton(menuButton, origMenuButton);
    return;
  }
  if (menuButton) {
    menuButton.style.width = '100px';
  }
  const zip = new JSZip();
  const folder = zip.folder('Superpower-ChatGPT-Gallery');
  for (let i = 0; i < selectedGalleryImages.length; i += 1) {
    if (menuButton) menuButton.innerHTML = `${i + 1}/${selectedGalleryImages.length}`;
    const imageNode = selectedGalleryImages[i];
    const createDate = new Date(formatTime(imageNode.created_at));
    const filePrefix = `${createDate.getFullYear()}-${createDate.getMonth() + 1}-${createDate.getDate()}__${createDate.getHours()}-${createDate.getMinutes()}-${createDate.getSeconds()}`;

    const url = decodeURIComponent(imageNode.image);
    const format = originalFormat
      ? url.split('.').pop() || 'webp'
      : isWindows() ? 'jpg' : 'png';
    // const filename = imageGalleryCurrentTab === 'dalle' ? `DALL·E ${formatDateDalle()} - ${imageNode?.prompt.replaceAll('.', '_')}.${format}` : `Data Analytic Image ${formatDateDalle()}.${format}`;
    const imageFilename = `${imageNode.conversation_id}/${filePrefix}__${imageNode.image_id}${imageNode.title ? `__${imageNode.title}` : ''}.${format}`;

    // save the image to zip
    // eslint-disable-next-line no-await-in-loop
    const blob = await fetch(`${url}?cache=false`, { method: 'GET', headers: { origin: 'https://chatgpt.com' } }).then((response) => response.blob());
    folder.file(imageFilename, blob, { binary: true });
    // write the prompt to a text file
    const promptFilename = `${imageNode.conversation_id}/${filePrefix}__${imageNode.image_id}${imageNode.title ? `__${imageNode.title}` : ''}.txt`;
    folder.file(promptFilename, imageNode.prompt);
  }
  if (menuButton) {
    menuButton.innerHTML = 'Zipping...';
  }
  zip.generateAsync({ type: 'blob', compression: 'DEFLATE' }).then((content) => {
    saveAs(content, `${new Date().toISOString().slice(0, 10)}-superpower-chatgpt-gallery.zip`);
    resetMenuButton(menuButton, origMenuButton);
  });
}
function resetMenuButton(menuButton = null, origMenuButton = null) {
  if (!menuButton) return;
  if (!origMenuButton) return;
  menuButton.disabled = false;
  menuButton.style.width = origMenuButton.style.width;
  menuButton.innerHTML = origMenuButton.innerHTML;
}
