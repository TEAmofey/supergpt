/* global getConversationIdFromUrl, addInstructionDropdowns, throttle, getConversationsByIds, showConversationManagerCardMenu */

// eslint-disable-next-line no-unused-vars
function initializeNavbar() {
  const existingNavWrapper = document.querySelector('#gptx-nav-wrapper');
  if (existingNavWrapper) return;

  let navRightSection = document.querySelector('main div[role="presentation"] div[class*="sticky top-0"] div[class*="leading-[0]"]');

  // main button data-testid="model-switcher-dropdown-button" or data-testid="undefined-button" (for gizmo menu)

  if (!navRightSection) {
    const profileButton = document.querySelector('main button[data-testid="profile-button"]');
    if (profileButton && !profileButton.parentElement.classList.value.includes('_profileInContent_')) {
      navRightSection = profileButton.parentElement;
    }
  }
  if (!navRightSection) return;
  const nav = document.querySelector('nav');
  if (nav?.contains(navRightSection)) return;

  // remove the class that makes top nav bg transparent: @thread-xl/thread:bg-transparent and @thread-xl/thread:!shadow-none
  navRightSection.parentElement.style.backgroundColor = 'var(--main-surface-primary) !important';
  navRightSection.parentElement.style.boxShadow = 'var(--sharp-edge-top-shadow) !important';
  navRightSection.parentElement.style.position = 'unset !important';

  const conversationIdFromUrl = getConversationIdFromUrl();
  const path = window.location.pathname;
  const onProjectPage = window.location.pathname.startsWith('/g/g-p-') && window.location.pathname.endsWith('/project');

  if (!conversationIdFromUrl && path !== '/' && !onProjectPage) return;

  const navWrapper = document.createElement('div');
  navWrapper.id = 'gptx-nav-wrapper';
  navWrapper.classList = 'bg-transparent flex items-center justify-end px-3 gap-2 ';
  // add navwrapper to the beginning of the right section
  navRightSection.prepend(navWrapper);

  addInstructionDropdowns(navWrapper);
}
// eslint-disable-next-line no-unused-vars
const throttleReplaceShareButtonWithConversationMenu = throttle(() => {
  replaceShareButtonWithConversationMenu();
});
function newShareButton() {
  return '<button class="btn relative btn-secondary text-token-text-primary" aria-label="Share" data-testid="share-chat-button" id="navbar-conversation-menu-button" style="view-transition-name: var(--vt_share_chat_wide_button);"><div class="flex w-full items-center justify-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" stroke="currentColor" fill="currentColor" stroke-linecap="round" stroke-linejoin="round" class="icon-md" viewBox="0 0 448 512"><path d="M0 88C0 74.75 10.75 64 24 64H424C437.3 64 448 74.75 448 88C448 101.3 437.3 112 424 112H24C10.75 112 0 101.3 0 88zM0 248C0 234.7 10.75 224 24 224H424C437.3 224 448 234.7 448 248C448 261.3 437.3 272 424 272H24C10.75 272 0 261.3 0 248zM424 432H24C10.75 432 0 421.3 0 408C0 394.7 10.75 384 24 384H424C437.3 384 448 394.7 448 408C448 421.3 437.3 432 424 432z"></path></svg></div></button>';
}
function replaceShareButtonWithConversationMenu() {
  let shareButton = document.querySelector('[data-testid="share-chat-button"]');
  if (!shareButton) {
    const profileButton = document.querySelector('main button[data-testid="profile-button"]');
    if (!profileButton) return;
    // add new share button right before profile button
    profileButton.insertAdjacentHTML('beforebegin', newShareButton());
    shareButton = document.querySelector('[data-testid="share-chat-button"]');
  }
  shareButton.classList.remove('hidden');
  if (shareButton.id === 'navbar-conversation-menu-button') return;
  shareButton.id = 'navbar-conversation-menu-button';
  shareButton.querySelector('div').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" stroke="currentColor" fill="currentColor" stroke-linecap="round" stroke-linejoin="round" class="icon-md" viewBox="0 0 448 512"><path d="M0 88C0 74.75 10.75 64 24 64H424C437.3 64 448 74.75 448 88C448 101.3 437.3 112 424 112H24C10.75 112 0 101.3 0 88zM0 248C0 234.7 10.75 224 24 224H424C437.3 224 448 234.7 448 248C448 261.3 437.3 272 424 272H24C10.75 272 0 261.3 0 248zM424 432H24C10.75 432 0 421.3 0 408C0 394.7 10.75 384 24 384H424C437.3 384 448 394.7 448 408C448 421.3 437.3 432 424 432z"></path></svg>';
}
// eslint-disable-next-line no-unused-vars
function addConversationMenuButtonEventListener() {
  document.body.addEventListener('click', async (e) => {
    const button = e.target.closest('button');
    if (!button) return;
    if (button.id !== 'navbar-conversation-menu-button') return;
    e.preventDefault();
    e.stopPropagation();
    const conversationId = getConversationIdFromUrl();
    const conversations = await getConversationsByIds([conversationId]);
    const response = await chrome.runtime.sendMessage({
      type: 'getConversation',
      // forceRefresh: true,
      detail: {
        conversationId,
      },
    });

    showConversationManagerCardMenu(button, { ...response, ...conversations[0] }, true, true);
  });
}
