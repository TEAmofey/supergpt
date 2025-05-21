/* global */

// eslint-disable-next-line no-unused-vars
function startNewChat(forceRefresh = false, gizmoId = null) {
  if (gizmoId) {
    if (isOnNewGizmoPage(gizmoId) && forceRefresh) {
      refreshPage();
      return;
    }
    const gizmoInNavElement = document.querySelector(`nav a[href^="/g/${gizmoId}"]`);
    if (gizmoInNavElement) {
      gizmoInNavElement.click();
      return;
    }
    window.location.href = `https://chatgpt.com/g/${gizmoId}`;
    return;
  }
  if (isOnNewChatPage() && forceRefresh) {
    refreshPage();
    return;
  }
  let newChatButton = document.querySelector('nav a[href="/"]');
  if (newChatButton) {
    newChatButton.click();
    return;
  }
  // data-testid="create-new-chat-button"
  newChatButton = document.querySelector('nav button[data-testid="create-new-chat-button"]');
  if (newChatButton) {
    newChatButton.click();
  }
}

// eslint-disable-next-line no-unused-vars
function isOnNewGizmoPage(gizmoId) {
  // https://chatgpt.com/g/g-2fkFE8rbu-dall-e
  return window.location.pathname.startsWith(`/g/${gizmoId}`) && !window.location.pathname.includes('/c/');
}
function isOnNewChatPage() {
  // https://chatgpt.com/
  // https://chatgpt.com/g/g-2fkFE8rbu-dall-e
  // https://chatgpt.com/g/g-p-675c9a5c52f48191b7b62068d1ba5d40
  return window.location.pathname === '/' || (window.location.pathname.startsWith('/g/g-') && !window.location.pathname.includes('/c/'));
}
function refreshPage() {
  window.location.reload();
}
