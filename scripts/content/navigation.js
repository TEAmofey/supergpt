/* global navigation, resetPromptChain, getConversationIdFromUrl, resetInstructions, stopAnimateFavicon, faviconTimeout, setSelectionAtEnd, resetPostSubmit, initializeInput, createSidebarNotesButton, addProjectExportButton, createSidebarFolderButton, reorderGPTList, makeProjectsCollapsible, setPresentationsWidth, updateSelectedConvCard */

function navigationObserver(event) {
  const observer = new MutationObserver((mutations, observerInstance) => {
    const nextUrl = new URL(event.destination.url);

    createSidebarNotesButton(nextUrl);
    createSidebarFolderButton(nextUrl);
    initializeInput();
    setPresentationsWidth();
    // makeSidebarResizable();
    addProjectExportButton(nextUrl);
    reorderGPTList();
    makeProjectsCollapsible();
    setTimeout(() => {
      reorderGPTList();
      makeProjectsCollapsible();
      createSidebarFolderButton(nextUrl);
    }, 2000);
    observerInstance.disconnect(); // Stop observing after render is complete
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
// eslint-disable-next-line no-unused-vars
function initializeNavigation() {
  if ('navigation' in window) {
    let inputValue = '';
    // Listen for navigation events
    navigation.addEventListener('navigate', (event) => {
      const currentUrl = window.location.href;
      const nextUrl = event.destination.url;
      // if nextUrl is not a chatgpt.com url, return
      if (new URL(nextUrl).hostname !== 'chatgpt.com') return;

      inputValue = document.querySelector('#prompt-textarea')?.innerHTML;
      if (newConversationStarted(currentUrl, nextUrl)) {
        resetPostSubmit();
        resetInstructions();
        resetPromptChain();
        updateSelectedConvCard(null, true);
      }
      if (conversationIdHasChanged(currentUrl, nextUrl)) {
        resetPostSubmit();
        resetInstructions();
        stopAnimateFavicon(faviconTimeout);
        resetPromptChain();
      }
      if (pathHasChanged(currentUrl, nextUrl)) {
        resetPostSubmit();
        resetInstructions();
        // Use transitionWhile to wait until the navigation transition completes
        // Use a loop to wait for the URL to change
        const checkUrlChange = () => {
          if (window.location.href === nextUrl) {
            setTimeout(() => {
              navigationObserver(event);
              updateTextArea(inputValue);
            }, 500);
          } else {
            requestAnimationFrame(checkUrlChange);
          }
        };
        requestAnimationFrame(checkUrlChange);
      }
    });
  } else {
    console.log('Navigation API is not supported in this browser.');
  }
}

function updateTextArea(inputValue) {
  if (!inputValue) return;

  const textAreaElement = document.querySelector('#prompt-textarea');
  if (textAreaElement) {
    textAreaElement.innerHTML = inputValue;
    setSelectionAtEnd(textAreaElement);
    return;
  }

  const observer = new MutationObserver((mutations, obs) => {
    const curTextAreaElement = document.querySelector('#prompt-textarea');
    if (curTextAreaElement) {
      curTextAreaElement.innerHTML = inputValue;
      setSelectionAtEnd(textAreaElement);
      obs.disconnect();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
function conversationIdHasChanged(curUrl, nextUrl) {
  const curConversationIdFromUrl = getConversationIdFromUrl(curUrl);
  const nextConversationIdFromUrl = getConversationIdFromUrl(nextUrl);
  if (!curConversationIdFromUrl || !nextConversationIdFromUrl) return false;
  return curConversationIdFromUrl !== nextConversationIdFromUrl;
}
function pathHasChanged(curUrl, nextUrl) {
  const curPath = new URL(curUrl).pathname;
  const nextPath = new URL(nextUrl).pathname;
  return curPath !== nextPath;
}
function newConversationStarted(curUrl, nextUrl) {
  const curConversationIdFromUrl = getConversationIdFromUrl(curUrl);
  const nextConversationIdFromUrl = getConversationIdFromUrl(nextUrl);
  return curConversationIdFromUrl && !nextConversationIdFromUrl;
}
