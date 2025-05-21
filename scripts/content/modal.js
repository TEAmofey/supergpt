/* global closeMenus, translate */
/* eslint-disable no-unused-vars */
function createModal(title, subtitle, modalBodyContent, modalActionBarContent, allowFullscreen = false, size = 'small', sideTab = null, defaultFullScreen = false) {
  const modal = document.createElement('div');
  modal.id = `modal-${title.toLowerCase().replaceAll(' ', '-')}`;
  modal.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;display:flex;justify-content:center;align-items:center;z-index:10000;';
  modal.classList = 'bg-black/50 dark:bg-black/80';
  // modal wrapper
  const modalWrapper = document.createElement('div');
  modalWrapper.style = 'border-radius: 8px; display: flex; flex-direction: row; box-shadow: rgb(0 0 0 / 72%) 0px 0px 20px 0px';
  modalWrapper.classList = 'bg-white dark:bg-black text-token-text-primary';
  if (defaultFullScreen) {
    modalWrapper.style.maxWidth = 'none';
    modalWrapper.style.width = '100vw';
    modalWrapper.style.height = '100vh';
  } else {
    modalWrapper.style.maxWidth = '1400px';
    modalWrapper.style.width = window.innerWidth > 780 ? (size === 'small' ? '65vw' : '90vw') : '100vw';
    modalWrapper.style.height = window.innerWidth > 780 ? (size === 'small' ? '80vh' : '90vh') : '80vh';
  }
  modalWrapper.id = `modal-wrapper-${title.toLowerCase().replaceAll(' ', '-')}`;
  modal.appendChild(modalWrapper);

  modal.addEventListener('mousedown', (event) => {
    const curModalWrapper = document.querySelector(`[id="modal-wrapper-${title.toLowerCase().replaceAll(' ', '-')}"]`);
    if (curModalWrapper.contains(event.target)) return;
    closeMenus();
    window.location.hash = '';
    modal.remove();
  });

  window.addEventListener('resize', () => {
    // eslint-disable-next-line no-nested-ternary
    modalWrapper.style.width = window.innerWidth > 780 ? (size === 'small' ? '60vw' : '90vw') : '100vw';
    // eslint-disable-next-line no-nested-ternary
    modalWrapper.style.height = window.innerWidth > 780 ? (size === 'small' ? '80vh' : '90vh') : '80vh';
  });
  // sidetab
  const modalSidetab = document.createElement('div');
  modalSidetab.id = 'modal-sidetab';
  modalSidetab.classList = 'bg-token-sidebar-surface-secondary rounded-s-md';
  modalSidetab.style = 'width: 64px; border-radius: 8px 0 0 8px; display: flex; flex-direction: column; justify-content: start; align-items: start; align-items: start;';
  if (sideTab) {
    modalSidetab.appendChild(sideTab);
    modalWrapper.appendChild(modalSidetab);
  }
  // main
  const modalMain = document.createElement('div');
  modalMain.id = 'modal-main';
  modalMain.classList = `bg-token-sidebar-surface-primary ${sideTab ? 'rounded-e-md' : 'rounded-md'}`;
  modalMain.style = `display: flex; flex-direction: column; justify-content: space-between; padding: 16px; width: calc(100% - ${sideTab ? '64px' : '0px'}); height: 100%;`;
  modalWrapper.appendChild(modalMain);

  // header
  const modalHeader = document.createElement('div');
  modalHeader.style = 'display: flex; justify-content: space-between; align-items: center;';

  const modalHeaderLeft = document.createElement('div');
  modalHeaderLeft.style = 'display: flex; align-items: start; flex-direction: column;';
  modalHeader.appendChild(modalHeaderLeft);

  const modalTitle = document.createElement('div');
  modalTitle.id = 'modal-title';
  modalTitle.style = 'font-size: 1.5em;';
  modalTitle.classList = 'text-token-text-primary';
  modalTitle.innerHTML = translate(title);
  modalHeaderLeft.appendChild(modalTitle);

  const modalSubtitle = document.createElement('div');
  modalSubtitle.id = 'modal-subtitle';
  modalSubtitle.classList = 'text-xs text-token-text-tertiary my-1';
  modalSubtitle.innerHTML = subtitle;
  modalHeaderLeft.appendChild(modalSubtitle);

  const modalHeaderRight = document.createElement('div');
  modalHeaderRight.style = 'display: flex; align-items: center;';
  modalHeader.appendChild(modalHeaderRight);

  const modalFullScreenButton = document.createElement('button');
  modalFullScreenButton.id = `modal-fullscreen-button-${title.toLowerCase().replaceAll(' ', '-')}`;
  modalFullScreenButton.classList = 'me-2 p-2 rounded-lg text-token-text-tertiary focus-visible:outline-0 hover:bg-token-sidebar-surface-secondary focus-visible:bg-token-sidebar-surface-secondary';
  modalFullScreenButton.innerHTML = defaultFullScreen
    ? '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="icon-md" viewBox="0 0 512 512"><path d="M488.1 23.03c-9.375-9.375-24.56-9.375-33.94 0l-81.38 81.38l-47.03-47.03c-6.127-6.117-14.3-9.35-22.63-9.35c-4.117 0-8.275 .7918-12.24 2.413c-11.97 4.953-19.75 16.63-19.75 29.56v135.1c0 13.25 10.74 23.1 24 23.1h136c12.94 0 24.63-7.797 29.56-19.75c4.969-11.97 2.219-25.72-6.938-34.87l-47.04-47.03l81.38-81.38C498.3 47.59 498.3 32.41 488.1 23.03zM215.1 272h-136c-12.94 0-24.63 7.797-29.56 19.75C45.47 303.7 48.22 317.5 57.37 326.6l47.04 47.03l-81.38 81.38c-9.375 9.375-9.375 24.56 0 33.94s24.56 9.375 33.94 0l81.38-81.38l47.03 47.03c6.127 6.117 14.29 9.367 22.63 9.367c4.117 0 8.279-.8086 12.25-2.43c11.97-4.953 19.75-16.63 19.75-29.56V296C239.1 282.7 229.3 272 215.1 272z"/></svg>'
    : '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="icon-md" viewBox="0 0 512 512"><path d="M183 295l-81.38 81.38l-47.03-47.03c-6.127-6.117-14.29-9.367-22.63-9.367c-4.117 0-8.279 .8086-12.25 2.43c-11.97 4.953-19.75 16.63-19.75 29.56v135.1C.0013 501.3 10.75 512 24 512h136c12.94 0 24.63-7.797 29.56-19.75c4.969-11.97 2.219-25.72-6.938-34.87l-47.03-47.03l81.38-81.38c9.375-9.375 9.375-24.56 0-33.94S192.4 285.7 183 295zM487.1 0h-136c-12.94 0-24.63 7.797-29.56 19.75c-4.969 11.97-2.219 25.72 6.938 34.87l47.04 47.03l-81.38 81.38c-9.375 9.375-9.375 24.56 0 33.94s24.56 9.375 33.94 0l81.38-81.38l47.03 47.03c6.127 6.117 14.3 9.35 22.63 9.35c4.117 0 8.275-.7918 12.24-2.413C504.2 184.6 512 172.9 512 159.1V23.1C512 10.75 501.3 0 487.1 0z"/></svg>';
  modalFullScreenButton.addEventListener('click', () => {
    // const modalContent = document.querySelector('[id^="modal-content-"]');
    const modalBody = document.querySelector('[id="modal-body"]');
    const curModalWrapper = document.querySelector(`[id="modal-wrapper-${title.toLowerCase().replaceAll(' ', '-')}"]`);
    if (curModalWrapper.style.width === '100vw' && curModalWrapper.style.height === '100vh') {
      modalFullScreenButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="icon-md" viewBox="0 0 512 512"><path d="M183 295l-81.38 81.38l-47.03-47.03c-6.127-6.117-14.29-9.367-22.63-9.367c-4.117 0-8.279 .8086-12.25 2.43c-11.97 4.953-19.75 16.63-19.75 29.56v135.1C.0013 501.3 10.75 512 24 512h136c12.94 0 24.63-7.797 29.56-19.75c4.969-11.97 2.219-25.72-6.938-34.87l-47.03-47.03l81.38-81.38c9.375-9.375 9.375-24.56 0-33.94S192.4 285.7 183 295zM487.1 0h-136c-12.94 0-24.63 7.797-29.56 19.75c-4.969 11.97-2.219 25.72 6.938 34.87l47.04 47.03l-81.38 81.38c-9.375 9.375-9.375 24.56 0 33.94s24.56 9.375 33.94 0l81.38-81.38l47.03 47.03c6.127 6.117 14.3 9.35 22.63 9.35c4.117 0 8.275-.7918 12.24-2.413C504.2 184.6 512 172.9 512 159.1V23.1C512 10.75 501.3 0 487.1 0z"/></svg>';
      curModalWrapper.style.maxWidth = '1400px';
      curModalWrapper.style.width = window.innerWidth > 780 ? (size === 'small' ? '60vw' : '90vw') : '100vw';
      curModalWrapper.style.height = window.innerWidth > 780 ? (size === 'small' ? '80vh' : '90vh') : '80vh';
      return;
    }
    modalFullScreenButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="icon-md" viewBox="0 0 512 512"><path d="M488.1 23.03c-9.375-9.375-24.56-9.375-33.94 0l-81.38 81.38l-47.03-47.03c-6.127-6.117-14.3-9.35-22.63-9.35c-4.117 0-8.275 .7918-12.24 2.413c-11.97 4.953-19.75 16.63-19.75 29.56v135.1c0 13.25 10.74 23.1 24 23.1h136c12.94 0 24.63-7.797 29.56-19.75c4.969-11.97 2.219-25.72-6.938-34.87l-47.04-47.03l81.38-81.38C498.3 47.59 498.3 32.41 488.1 23.03zM215.1 272h-136c-12.94 0-24.63 7.797-29.56 19.75C45.47 303.7 48.22 317.5 57.37 326.6l47.04 47.03l-81.38 81.38c-9.375 9.375-9.375 24.56 0 33.94s24.56 9.375 33.94 0l81.38-81.38l47.03 47.03c6.127 6.117 14.29 9.367 22.63 9.367c4.117 0 8.279-.8086 12.25-2.43c11.97-4.953 19.75-16.63 19.75-29.56V296C239.1 282.7 229.3 272 215.1 272z"/></svg>';

    curModalWrapper.style.maxWidth = 'none';
    curModalWrapper.style.width = '100vw';
    curModalWrapper.style.height = '100vh';
  });
  if (allowFullscreen) modalHeaderRight.appendChild(modalFullScreenButton);

  const modalCloseButton = document.createElement('button');
  modalCloseButton.id = `modal-close-button-${title.toLowerCase().replaceAll(' ', '-')}`;
  modalCloseButton.classList = 'text-xs text-token-text-tertiary border border-token-border-medium rounded-md px-3 py-2 hover:bg-token-main-surface-secondary cursor-pointer hover:text-token-text-primary';
  modalCloseButton.textContent = translate('Close');
  modalCloseButton.addEventListener('click', () => {
    closeMenus();
    window.location.hash = '';
    modal.remove();
  });
  modalHeaderRight.appendChild(modalCloseButton);
  modalMain.appendChild(modalHeader);

  const modalBody = document.createElement('div');
  modalBody.id = 'modal-body';
  modalBody.classList = ' text-token-text-primary flex flex-col justify-between rounded-md h-full relative border border-token-border-medium';
  modalBody.style = 'overflow-y: hidden;';
  modalBody.appendChild(modalBodyContent);
  modalMain.appendChild(modalBody);

  const modalActionBar = document.createElement('div');
  modalActionBar.id = 'modal-action-bar';
  modalActionBar.style = 'display: flex; justify-content: start; 8px; ';
  modalActionBar.appendChild(modalActionBarContent);
  modalMain.appendChild(modalActionBar);

  document.body.appendChild(modal);
}
