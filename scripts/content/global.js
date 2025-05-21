/* eslint-disable no-unused-vars */

/* global markdownit, hljs, gizmoCreatorProfile, isAltKeyDown, getChatGPTAccountIdFromCookie, createManager, createSettingsModal, translate, sidebarFolderIsOpen, sidebarFolderDrawerWidth, cachedSettings, conversationsCache */

// chrome.storage.onChanged.addListener((changes, namespace) => {
//   // eslint-disable-next-line no-restricted-syntax
//   for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
//     if (key !== 'conversations') {
//       console.warn({
//         key,
//         namespace,
//         oldValue,
//         newValue,
//       });
//     }
//   }
// });
// clear storage
// chrome.storage.local.clear();
// chrome.storage.sync.clear();
// print storage
// chrome.storage.sync.get(null, (items) => {
//   const allKeys = Object.keys(items);
//   console.log('sync', items);
// });
// chrome.storage.local.get(null, (items) => {
//   const allKeys = Object.keys(items);
//   console.log('local', items);
// });

function isWindows() {
  return navigator.platform.indexOf('Win') > -1;
}
function isDarkMode() {
  return document.querySelector('html').classList.contains('dark');
}
function refreshPage() {
  window.location.reload();
}
function getBrowser() {
  if (typeof chrome !== 'undefined') {
    if (typeof browser !== 'undefined') {
      return 'Firefox';
    }
    return 'Chrome';
  }
  return 'Edge';
}
function openLinksInNewTab() {
  const base = document.createElement('base');
  base.target = '_blank';
  document.head.appendChild(base);
}
function areSameArrays(array1, array2) {
  if (!Array.isArray(array1)) return true;
  if (!Array.isArray(array2)) return true;
  if (array1?.length !== array2?.length) return false;
  for (let i = 0; i < array1.length; i += 1) {
    if (!array2.includes(array1[i])) return false;
  }
  return true;
}
function setChatGPTAccountIdFromCookie() {
  const chatgptAccountId = getChatGPTAccountIdFromCookie();

  chrome.storage.local.set({
    chatgptAccountId,
  });
}
// unsafe langs are code languages that can include html tags
const unsafeLangs = ['vue', 'liquid', 'razor'];
// eslint-disable-next-line new-cap
const markdown = (role) => new markdownit({
  html: role === 'assistant',
  linkify: true,
  highlight(str, lang) {
    const { language, value } = lang && hljs.getLanguage(lang) ? hljs.highlight(str, { language: lang }) : { language: lang, value: unsafeLangs.includes(lang) || str.includes('</') ? sanitizeHtml(str) : str };
    return `<pre dir="ltr" class="w-full"><div class="dark bg-black mb-4 rounded-md"><div id='code-header' class="flex select-none items-center relative text-token-text-tertiary bg-token-sidebar-surface-primary px-4 py-2 text-xs font-sans rounded-t-md" style='border-top-left-radius:6px;border-top-right-radius:6px;'><span class="">${language}</span><button id='copy-code' data-initialized="false" class="flex ms-auto gap-2 text-token-text-tertiary hover:text-token-text-primary"><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>Copy code</button></div><div class="p-4 overflow-y-auto"><code id="code-content" class="!whitespace-pre hljs language-${language}">${value}</code></div></div></pre>`;
  },
});

function addSounds() {
  const audio = document.createElement('audio');
  audio.id = 'beep-sound';
  audio.src = chrome.runtime.getURL('sounds/beep.mp3');
  document.body.appendChild(audio);
}
function playSound(sound) {
  const audio = document.querySelector(`#${sound}-sound`);
  if (audio) audio.play();
}
function getProjectId(url) {
  const match = url.match(/g-(p-[a-f0-9]+)/);
  return match ? `g-${match[1]}` : null;
}
function showReviewReminder(hasSubscription) {
  if (hasSubscription) return;
  setTimeout(() => {
    chrome.storage.local.get(['dontShowReviewReminder', 'lastReviewReminderTimestamp', 'installDate'], ({ dontShowReviewReminder, lastReviewReminderTimestamp, installDate }) => {
      if (dontShowReviewReminder) return;
      // only show review reminder after 1 week of install
      if (installDate && Date.now() - installDate < 1000 * 60 * 60 * 24 * 7) return;
      // only show review reminder every 2 days
      if (lastReviewReminderTimestamp && Date.now() - lastReviewReminderTimestamp < 1000 * 60 * 60 * 24 * 3) return;
      showConfirmDialog('Are you enjoying Superpower ChatGPT?', 'Consider leaving us a review for a chance to win a <a style="text-decoration:underline;color:#3c80f5; font-weight:bold;" target="_blank" href="https://www.superpowerdaily.com/p/win-1-year-free-pro-subscription-to-superpower-chatgpt">One Year Free Pro Subscription</a>.', 'Remind me later', 'Leave a review', () => {
        chrome.storage.local.set({ lastReviewReminderTimestamp: Date.now() });
        // window.open('https://chrome.google.com/webstore/detail/superpower-chatgpt/amhmeenmapldpjdedekalnfifgnpfnkc/reviews', '_blank');
      }, () => {
        chrome.storage.local.set({ lastReviewReminderTimestamp: Date.now() });
        window.open('https://chrome.google.com/webstore/detail/superpower-chatgpt/amhmeenmapldpjdedekalnfifgnpfnkc/reviews', '_blank');
      }, 'green', true, (checked) => {
        chrome.storage.local.set({ dontShowReviewReminder: checked, lastReviewReminderTimestamp: Date.now() });
      });
    });
  }, 1000 * 60 * 1); // show review reminder after 1 minutes
}

const debounce = (func, wait = 1000) => {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    if (typeof wait === 'function') {
      const waitValue = wait();
      timeout = setTimeout(later, waitValue);
    } else {
      timeout = setTimeout(later, wait);
    }
  };
};
const throttle = (func, limit = 100) => {
  let inThrottle;
  // eslint-disable-next-line func-names
  return function (...args) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      // eslint-disable-next-line no-return-assign
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

const copyRichText = (element) => {
  let content = element.cloneNode(true);
  // for each pre tag, set the innerHTML to the last child's outerHTML
  content.querySelectorAll('pre').forEach((pre) => {
    pre.innerHTML = pre.firstChild.lastElementChild.outerHTML;
  });
  content = content.innerHTML.trim();
  const clipboardItem = new ClipboardItem({
    'text/html': new Blob(
      [content],
      { type: 'text/html' },
    ),
    'text/plain': new Blob(
      [content],
      { type: 'text/plain' },
    ),
  });
  navigator.clipboard.write([clipboardItem]);
};

function isVisible(element) {
  // Check if the element itself is hidden
  if (window.getComputedStyle(element).display === 'none'
    || window.getComputedStyle(element).visibility === 'hidden') {
    return false;
  }

  // Check if any parent element is hidden
  let parent = element.parentElement;
  while (parent) {
    if (window.getComputedStyle(parent).display === 'none') {
      return false;
    }
    parent = parent.parentElement;
  }

  return true;
}
function adjustMenuPosition(menu) {
  const menuRect = menu.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  if (menuRect.bottom > windowHeight) {
    const menuHeight = menu.offsetHeight;
    menu.style.top = `-${menuHeight + 8}px`;
    // check the top of the menu is above the top of the screen
    const newMenuRect = menu.getBoundingClientRect();
    if (newMenuRect.top < 0) {
      // find how much the menu is off the top of the screen
      const offTop = newMenuRect.top;
      menu.style.top = `-${menuHeight + offTop - 24}px`;
    }
  }
}
function convertNumberToHumanReadable(number) {
  if (!number) return 0;
  if (number === 0) return number;

  const SI_SYMBOL = ['', 'k', 'M', 'G', 'T', 'P', 'E'];
  // eslint-disable-next-line no-bitwise
  const tier = Math.log10(number) / 3 | 0;
  if (tier === 0) return number;
  const suffix = SI_SYMBOL[tier];
  const scale = 10 ** (tier * 3);
  const scaled = number / scale;
  return scaled.toFixed(1) + suffix;
}
function changeFavicon(src) {
  const link = document.createElement('link');
  // anything with rel=icon is removed by the browser
  const oldLinks = document.querySelectorAll('link[rel="icon"]');
  link.rel = 'icon';
  link.type = 'image/gif';
  link.href = src;
  if (oldLinks) {
    oldLinks.forEach((oldLink) => {
      if (oldLink.href.includes('favicon')) {
        document.head.removeChild(oldLink);
      }
    });
  }
  document.head.appendChild(link);
}
function getCharCount(text) {
  if (!text) return 0;
  return text.length || 0;
}
function getWordCount(text) {
  if (!text) return 0;
  return text.split(/[\s\n]+/).length || 0;
}
function switchFavicon() {
  if (typeof switchFavicon.i === 'undefined') {
    switchFavicon.i = 0;
  }
  switch (switchFavicon.i) {
    case 0:
      changeFavicon(chrome.runtime.getURL('icons/favicon-1.png'));
      break;
    case 1:
      changeFavicon(chrome.runtime.getURL('icons/favicon-0.png'));
      break;
    default:
      changeFavicon(chrome.runtime.getURL('icons/favicon-0.png'));
  }
  switchFavicon.i = switchFavicon.i === 1 ? 0 : 1;
}
function animateFavicon() {
  // if (faviconTimeout) return faviconTimeout;
  const newFaviconTimeout = setInterval(switchFavicon, 500);
  return newFaviconTimeout;
}
function stopAnimateFavicon(runningFaviconTimeout) {
  changeFavicon(chrome.runtime.getURL('icons/favicon-0.png'));
  clearTimeout(runningFaviconTimeout);
}
function flashArticle(article) {
  article.style.transition = 'background-color 0.5s ease';
  article.style.backgroundColor = '#ffd70030';
  setTimeout(() => {
    article.style.backgroundColor = '';
  }, 700);
}
function scrollUpOneArticle() {
  // find the closest article to the top of the window
  const articles = document.querySelectorAll('article[data-testid^=conversation-turn]');
  if (articles.length === 0) return;
  let closestArticle = articles[0];
  let closestArticleTopAbs = Math.abs(closestArticle.getBoundingClientRect().top);
  articles.forEach((article) => {
    if (article.querySelector('div[data-message-author-role="assistant"]')) return;
    const articleTop = article.getBoundingClientRect().top;
    if (articleTop > 0) return;
    const articleTopAbs = Math.abs(articleTop);
    if (articleTopAbs < closestArticleTopAbs) {
      closestArticle = article;
      closestArticleTopAbs = articleTopAbs;
    }
  });
  flashArticle(closestArticle);
  closestArticle.scrollIntoView({ behavior: 'smooth' });
}
function scrollDownOneArticle() {
  // find the closest article to the bottom of the window
  const articles = document.querySelectorAll('article[data-testid^=conversation-turn]');
  if (articles.length === 0) return;
  let closestArticle = articles[articles.length - 2];
  let closestArticleTopAbs = Math.abs(closestArticle.getBoundingClientRect().top);
  articles.forEach((article, index) => {
    if (article.querySelector('div[data-message-author-role="assistant"]')) return;
    const articleTop = article.getBoundingClientRect().top;
    if (articleTop > 60 && index < articles.length - 2) return;
    const articleTopAbs = Math.abs(articleTop);
    if (articleTopAbs < closestArticleTopAbs) {
      closestArticle = article;
      closestArticleTopAbs = articleTopAbs;
    }
  });
  const closestArticleNextUser = closestArticle?.nextElementSibling?.nextElementSibling;
  if (!closestArticleNextUser || closestArticleNextUser.tagName !== 'ARTICLE') {
    flashArticle(closestArticle);
    closestArticle.scrollIntoView({ behavior: 'smooth' });
    return;
  }
  closestArticleNextUser.style.transition = 'background-color 0.5s ease';
  closestArticleNextUser.style.backgroundColor = '#ffd70030';
  setTimeout(() => {
    closestArticleNextUser.style.backgroundColor = '';
  }, 700);
  closestArticleNextUser?.scrollIntoView({ behavior: 'smooth' });
}
function initializePresentation() {
  const onProjectPage = window.location.pathname.startsWith('/g/g-p-') && window.location.pathname.endsWith('/project');

  const main = document.querySelector('main');
  if (!main) return null;
  const presentation = main.querySelector('div[role=presentation]');
  if (!presentation) return null;
  // presentation.style.width = '100%';
  presentation.classList.remove('flex-1');
  presentation.classList.add('relative');

  if (onProjectPage && presentation?.parentElement.classList.contains('max-w-screen-md')) {
    presentation.parentElement.classList.remove('max-w-screen-md');
    presentation.firstChild.classList.add('md:max-w-3xl', 'lg:max-w-[40rem]', 'xl:max-w-[48rem]');
  }
  return presentation;
}
function addFloatingButtons() {
  const existingFloatingButtonWrapper = document.querySelector('#floating-button-wrapper');
  if (existingFloatingButtonWrapper) return;
  const onGPTs = window.location.pathname.includes('/gpts');
  const onAdmin = window.location.pathname.includes('/admin');
  const onProject = window.location.pathname.startsWith('/g/g-p-') && window.location.pathname.endsWith('/project');

  const floatingButtonWrapper = document.createElement('div');
  floatingButtonWrapper.id = 'floating-button-wrapper';
  floatingButtonWrapper.classList = 'absolute flex items-center justify-center text-xs font-sans cursor-pointer rounded-md z-10';
  floatingButtonWrapper.style = 'bottom: 8rem;right: 3rem;width: 2rem;flex-wrap:wrap;';
  const main = document.querySelector('main');
  if (sidebarFolderIsOpen() && !onGPTs && !onAdmin && !onProject) {
    floatingButtonWrapper.style.right = `calc(1rem + ${sidebarFolderDrawerWidth}px)`;
  } else {
    floatingButtonWrapper.style.right = '3rem';
  }
  const scrollUpButton = document.createElement('button');
  scrollUpButton.id = 'scroll-up-button';
  scrollUpButton.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="4" viewBox="0 0 48 48" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M24 44V4m20 20L24 4 4 24"></path></svg>';
  scrollUpButton.classList = 'flex items-center justify-center border border-token-border-medium text-token-text-tertiary hover:text-token-text-primary bg-token-main-surface-primary text-xs font-sans cursor-pointer rounded-t-md z-10';
  scrollUpButton.style = 'width: 2rem;height: 2rem;';
  scrollUpButton.addEventListener('click', (e) => {
    if (e.shiftKey) {
      scrollUpOneArticle();
      return;
    }
    const curConversationTop = document.querySelector('[id^=message-wrapper-]');
    if (curConversationTop) {
      curConversationTop.parentElement.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    // slot="content"
    const content = document.querySelector('main div[slot=content]');
    if (content) {
      content.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    // all article element with data-testid starting with conversation-turn
    const articles = document.querySelectorAll('article[data-testid^=conversation-turn]');
    // there is a header at the top that covers a part of the first conversation. so make sure to scroll into view + 60px
    if (articles.length > 0) {
      articles[articles.length - 1].parentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  const scrollDownButton = document.createElement('button');
  scrollDownButton.id = 'scroll-down-button';
  scrollDownButton.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="4" viewBox="0 0 48 48" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M24 4v40M4 24l20 20 20-20"></path></svg>';
  scrollDownButton.classList = 'flex items-center justify-center border border-token-border-medium text-token-text-tertiary hover:text-token-text-primary bg-token-main-surface-primary text-xs font-sans cursor-pointer rounded-b-md z-10';
  scrollDownButton.style = 'width: 2rem;height: 2rem; border-top: none;';
  scrollDownButton.addEventListener('click', (e) => {
    if (e.shiftKey) {
      scrollDownOneArticle();
      return;
    }
    const curConversationBottom = document.querySelector('#conversation-bottom');

    if (curConversationBottom) {
      curConversationBottom.scrollIntoView({ behavior: 'smooth', block: 'end' });
      return;
    }
    // slot="content"
    const content = document.querySelector('main div[slot=content]');
    if (content) {
      content.scrollIntoView({ behavior: 'smooth', block: 'end' });
      return;
    }
    // all article element with data-testid starting with conversation-turn
    const conversationTurns = document.querySelectorAll('article[data-testid^=conversation-turn]');
    if (conversationTurns.length > 0) {
      conversationTurns[conversationTurns.length - 1].parentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  });

  floatingButtonWrapper.appendChild(scrollUpButton);
  floatingButtonWrapper.appendChild(scrollDownButton);

  document.body.appendChild(floatingButtonWrapper);
}

// eslint-disable-next-line no-unused-vars
function showConfirmDialog(title, subtitle, cancelText, confirmText, cancelCallback, confirmCallback, confirmType = 'red', closeOnConfirm = true, doNotShowAgainCallback = false, doNotShowAgainMessage = 'Do not show again', footnote = '') { // confirmType: red, orange, green
  const existingConfirmActionDialog = document.querySelector('#confirm-action-dialog');
  if (existingConfirmActionDialog) existingConfirmActionDialog.remove();
  const bottonColors = {
    red: 'btn-danger',
    orange: 'btn-warning',
    green: 'btn-success',
  };
  const confirmActionDialog = `<div data-state="open" class="fixed inset-0 bg-black/50 dark:bg-black/80" style="pointer-events: auto;">
    <div class="h-full w-full grid grid-cols-[10px_1fr_10px] grid-rows-[minmax(10px,1fr)_auto_minmax(10px,1fr)] md:grid-rows-[minmax(20px,1fr)_auto_minmax(20px,1fr)] overflow-y-auto">
      <div id="confirm-action-dialog-content" role="dialog" data-state="open" class="relative col-auto col-start-2 row-auto row-start-2 w-full rounded-xl text-start shadow-xl transition-all start-1/2 ltr:-translate-x-1/2 rtl:translate-x-1/2 bg-token-sidebar-surface-primary max-w-xl border-token-border-medium border" tabindex="-1" style="pointer-events: auto;">
        <div class="px-4 pb-4 pt-5 flex items-center justify-between border-b border-token-border-medium">
          <div class="flex">
            <div class="flex items-center">
              <div class="flex grow flex-col gap-1">
                <h2 as="h3" class="text-lg font-medium leading-6 text-token-text-tertiary">${translate(title)}</h2>
              </div>
            </div>
          </div>
        </div>
        <div class="p-4">
          <div class="text-sm text-token-text-primary">${translate(subtitle)}</div>
          <div class="mt-5">
            <div class="mt-5 flex justify-between">${doNotShowAgainCallback ? `
              <div style="display: flex; justify-content: flex-start; align-items: center;">
                <input type="checkbox" id="do-not-show-checkbox" style="margin-right: 8px; width: 12px; height: 12px;" />
                <label for="do-not-show-checkbox" class="text-sm text-token-text-tertiary">${translate(doNotShowAgainMessage)}</label>
              </div>` : ''}
              <div class="flex flex-row-reverse gap-3 ms-auto">
                <button id="confirm-button" class="btn relative ${bottonColors[confirmType]} text-white" as="button">
                  <div class="flex w-full gap-2 items-center justify-center">${translate(confirmText)}</div>
                </button>
                <button id="cancel-button" class="btn relative btn-secondary" as="button">
                  <div class="flex w-full gap-2 items-center justify-center">${translate(cancelText)}</div>
                </button>
              </div>
            </div>
            <div class="w-full flex justify-end mt-2 text-token-text-primary text-xs">${footnote}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;
  const confirmActionDialogElement = document.createElement('div');
  confirmActionDialogElement.id = 'confirm-action-dialog';
  confirmActionDialogElement.classList = 'absolute inset-0';
  confirmActionDialogElement.style = 'z-index: 100101;';
  confirmActionDialogElement.innerHTML = confirmActionDialog;
  document.body.appendChild(confirmActionDialogElement);
  const confirmButton = document.querySelector('#confirm-action-dialog #confirm-button');
  const cancelButton = document.querySelector('#confirm-action-dialog #cancel-button');
  confirmButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeMenus();
    const curConfirmButton = document.querySelector('#confirm-action-dialog #confirm-button');
    if (curConfirmButton?.querySelector('#progress-spinner')) return;
    if (confirmCallback) confirmCallback();
    if (closeOnConfirm) {
      confirmActionDialogElement.remove();
    }
  });
  cancelButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeMenus();
    const curConfirmButton = document.querySelector('#confirm-action-dialog #confirm-button');
    if (curConfirmButton?.querySelector('#progress-spinner')) return;

    if (cancelCallback) cancelCallback();
    confirmActionDialogElement.remove();
  });
  // click outside to close
  confirmActionDialogElement.addEventListener('click', (e) => {
    const curConfirmButton = document.querySelector('#confirm-action-dialog #confirm-button');
    if (curConfirmButton.querySelector('#progress-spinner')) return;
    const confirmActionDialogContent = document.querySelector('#confirm-action-dialog-content');
    if (!isDescendant(confirmActionDialogContent, e.target)) {
      if (cancelCallback) cancelCallback();
      confirmActionDialogElement.remove();
    }
  });
  // do not show again
  const doNotShowAgainCheckbox = document.querySelector('#do-not-show-checkbox');
  if (doNotShowAgainCheckbox) {
    doNotShowAgainCheckbox.addEventListener('change', (e) => {
      const { checked } = doNotShowAgainCheckbox;
      if (doNotShowAgainCallback) doNotShowAgainCallback(checked);
    });
  }
}

function showDateSelectorDialog(title = '', subtitle = 'Select date range', cancelText = 'Cancel', confirmText = 'Confirm', cancelCallback = null, confirmCallback = null, confirmType = 'red', closeOnConfirm = true) {
  const existingDateSelectorDialog = document.querySelector('#date-selector-dialog');
  if (existingDateSelectorDialog) existingDateSelectorDialog.remove();
  const bottonColors = {
    red: 'btn-danger',
    orange: 'btn-warning',
    green: 'btn-success',
  };
  const dateSelectorDialog = `<div data-state="open" class="fixed inset-0 bg-black/50 dark:bg-black/80" style="pointer-events: auto;">
  <div class="h-full w-full grid grid-cols-[10px_1fr_10px] grid-rows-[minmax(10px,1fr)_auto_minmax(10px,1fr)] md:grid-rows-[minmax(20px,1fr)_auto_minmax(20px,1fr)] overflow-y-auto">
    <div id="date-selector-dialog-content" role="dialog" data-state="open" class="relative col-auto col-start-2 row-auto row-start-2 w-full rounded-xl text-start shadow-xl transition-all start-1/2 ltr:-translate-x-1/2 rtl:translate-x-1/2 bg-token-sidebar-surface-primary max-w-xl border-token-border-medium border" tabindex="-1" style="pointer-events: auto;">
      <div class="p-4 flex items-center justify-between border-b border-token-border-medium">
        <div class="flex">
          <div class="flex items-center">
            <div class="flex grow flex-col gap-1">
              <h2 as="h2" class="text-lg font-medium leading-6 text-token-text-tertiary">${translate(title)}</h2>
            </div>
          </div>
        </div>
      </div>
      <div class="p-4">
        <h4 as="h4" class="text-md mt-2 text-token-text-primary">${translate(subtitle)}</h2>
        <div class="flex items-center justify-center mt-4">
          <div class="flex flex-col flex-wrap mx-10">
            <label for="start-date" class="text-sm text-token-text-tertiary mb-1">Start Date</label>
            <input id="start-date" type="date" class="p-2 rounded-md border border-token-border-medium bg-token-main-surface-primary text-token-text-primary" placeholder="Select start date" />
          </div>
          <span class="text-xl text-token-text-tertiary relative top-3">→</span>
          <div class="flex flex-col flex-wrap mx-10">
            <label for="end-date" class="text-sm text-token-text-tertiary mb-1">End Date</label>
            <input id="end-date" type="date" class="p-2 rounded-md border border-token-border-medium bg-token-main-surface-primary text-token-text-primary" placeholder="Select end date" />
          </div>
        </div>
        <div class="mt-10">
          <div class="mt-5 flex justify-between">
            <div class="flex gap-3 ms-auto">
              <button id="cancel-button" class="btn relative btn-secondary" as="button">
                <div class="flex w-full gap-2 items-center justify-center">${translate(cancelText)}</div>
              </button>
              <button id="confirm-button" class="btn relative ${bottonColors[confirmType]} text-white w-32" as="button">
                <div class="flex w-full gap-2 items-center justify-center">${translate(confirmText)}</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`;
  const dateSelectorDialogElement = document.createElement('div');
  dateSelectorDialogElement.id = 'date-selector-dialog';
  dateSelectorDialogElement.classList = 'absolute inset-0';
  dateSelectorDialogElement.style = 'z-index: 100001;';
  dateSelectorDialogElement.innerHTML = dateSelectorDialog;
  document.body.appendChild(dateSelectorDialogElement);
  const confirmButton = document.querySelector('#date-selector-dialog #confirm-button');
  const cancelButton = document.querySelector('#date-selector-dialog #cancel-button');
  confirmButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeMenus();
    const curConfirmButton = document.querySelector('#date-selector-dialog #confirm-button');
    if (curConfirmButton?.querySelector('#progress-spinner')) return;

    const startDate = document.querySelector('#start-date').value;
    const endDate = document.querySelector('#end-date').value;
    if (!startDate || !endDate) {
      toast('Please select start and end date', 'error');
      return;
    }
    if (startDate > endDate) {
      toast('Start date cannot be greater than end date', 'error');
      return;
    }

    curConfirmButton.disabled = true;
    const curConfirmButtonContent = curConfirmButton.querySelector('div');
    curConfirmButtonContent.innerHTML = '<div class="w-full h-full inset-0 flex items-center justify-center text-white"><svg id="progress-spinner" x="0" y="0" viewbox="0 0 40 40" class="spinner icon-md"><circle fill="transparent" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-dasharray="125.6" cx="20" cy="20" r="18"></circle></svg></div>';

    if (confirmCallback) confirmCallback(new Date(startDate).getTime(), new Date(endDate).getTime());
    if (closeOnConfirm) {
      dateSelectorDialogElement.remove();
    }
  });
  cancelButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeMenus();
    const curConfirmButton = document.querySelector('#date-selector-dialog #confirm-button');
    if (curConfirmButton?.querySelector('#progress-spinner')) return;

    if (cancelCallback) cancelCallback();
    dateSelectorDialogElement.remove();
  });
  // click outside to close
  dateSelectorDialogElement.addEventListener('click', (e) => {
    const curConfirmButton = document.querySelector('#date-selector-dialog #confirm-button');
    if (curConfirmButton.querySelector('#progress-spinner')) return;
    const dateSelectorDialogContent = document.querySelector('#date-selector-dialog-content');
    if (!isDescendant(dateSelectorDialogContent, e.target)) {
      if (cancelCallback) cancelCallback();
      dateSelectorDialogElement.remove();
    }
  });
}
function closeMenusEventListener() {
  document.body.addEventListener('click', () => closeMenus());
}
function closeMenus() {
  // id ends with -menu
  const menus = document.querySelectorAll('[id$=-menu]');
  if (menus.length > 0) menus.forEach((menu) => menu.remove());
}
function closeModals() {
  const modals = document.querySelectorAll('[id^=modal-]');
  if (modals.length > 0) modals.forEach((modal) => modal.remove());
}
function getGizmoIdFromUrl(defaultURL = null) {
  const url = defaultURL || window.location.href;
  const pattern = /\/g\/(g-[A-Za-z0-9]+)/;

  const match = url.match(pattern);
  if (match) {
    const group = match[1];
    return group;
  }
  return null;
}

function generateRandomDarkColor() {
  // Generate random values for RGB, keeping them below 100 to ensure darkness
  const color1 = Math.floor(Math.random() * 180);
  const color2 = Math.floor(Math.random() * 180);
  const color3 = Math.floor(Math.random() * 180);
  // shuffle the colors and set r,g,b equal to them
  const colors = [color1, color2, color3];
  colors.sort(() => Math.random() - 0.5);
  const r = colors[0];
  const g = colors[1];
  const b = colors[2];
  // Convert the color to a hexadecimal format
  const color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

  return color;
}
function resetQueryParams() {
  const url = new URL(window.location.href);
  // remove all query params
  url.search = '';
  // reset hash
  url.hash = '';
  window.history.replaceState({}, '', url);
}
function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
// "parts": [
//   {
//     "content_type": "image_asset_pointer",
//     "asset_pointer": "file-service://file-jkoU0Eqlpq4zx6vimRHuruD8",
//     "size_bytes": 620516,
//     "width": 1024,
//     "height": 1024,
//     "fovea": 512,
//     "metadata": {
//       "dalle": {
//         "gen_id": "HPxmucnqwJG4Wv1K",
//         "prompt": "A vibrant pumpkin patch on a sunny autumn day. The scene is filled with a variety of large, round pumpkins scattered across the ground, surrounded by green vines and leaves. In the background, there are trees with colorful fall foliage in shades of orange, red, and yellow. Some hay bales are stacked nearby, and a few rustic wooden signs point toward different parts of the farm. A clear blue sky completes the serene, warm atmosphere.",
//         "seed": 4134082406,
//         "parent_gen_id": null,
//         "edit_op": null,
//         "serialization_title": "DALL-E generation metadata"
//       },
//       "gizmo": null,
//       "sanitized": false
//     }
//   }
// ]

function findValueByKey(obj, key) {
  let result = null;

  function search(object) {
    if (object && typeof object === 'object') {
      // eslint-disable-next-line no-restricted-syntax, guard-for-in
      for (const k in object) {
        if (k === key) {
          result = object[k];
          return;
        }
        if (typeof object[k] === 'object') {
          search(object[k]);
        }
      }
    }
  }

  search(obj);
  return result;
}
function extractPromptFromNode(data, nodeId) {
  const node = data[nodeId];
  if (!node || !node.message || !node.message.content || (!node.message.content.parts && !node.message.content.text)) {
    return null;
  }

  try {
    const { parts = [], text, content_type: contentType } = node.message.content;
    if (text) parts.push(text);
    // eslint-disable-next-line no-restricted-syntax
    for (const part of parts) {
      // Try parsing part as JSON
      try {
        const parsed = JSON.parse(part);
        if (parsed.prompt || contentType === 'code') {
          return parsed.prompt;
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
  } catch (e) {
    console.error('Failed to parse content parts as JSON:', e);
    return null;
  }

  return null;
}
function findDalleImageInMapping(obj, targetPointer) {
  if (typeof obj !== 'object' || obj === null) return null;

  // Check if the object has the desired asset_pointer
  // if (obj?.asset_pointer?.includes(targetPointer)) {
  //   return obj;
  // }
  if (obj?.message?.content?.parts) {
    // eslint-disable-next-line no-restricted-syntax
    for (const part of obj.message.content.parts) {
      if (part.asset_pointer && part.asset_pointer.includes(targetPointer)) {
        const currentTime = Date.now() / 1000;
        return {
          title: obj?.message?.metadata?.image_gen_title || '',
          create_time: obj?.message?.create_time || currentTime,
          message_id: obj?.id,
          parent: obj?.parent,
          asset_object: part,
        };
      }
    }
  }

  // Recursively search through each property
  // eslint-disable-next-line no-restricted-syntax
  for (const key in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(key)) {
      const found = findDalleImageInMapping(obj[key], targetPointer);
      if (found) return found;
    }
  }

  return null;
}
// "aggregate_result": {
//   "status": "success",
//   "run_id": "c58fde2b-0da0-48b8-b71c-1c67a080aec7",
//   "start_time": 1727153717.1469195,
//   "update_time": 1727153722.945663,
//   "code": "import matplotlib.pyplot as plt\nimport numpy as np\n\n# Generating random data\nx = np.linspace(0, 10, 100)\ny = np.sin(x) + np.random.normal(0, 0.5, 100)\n\n# Creating a random chart (line plot with random data)\nplt.figure(figsize=(8, 6))\nplt.plot(x, y, marker='o', linestyle='-', color='blue', label='Random Data')\nplt.title('Randomly Generated Chart')\nplt.xlabel('X Axis')\nplt.ylabel('Y Axis')\nplt.legend()\n\n# Displaying the chart\nplt.show()",
//   "end_time": 1727153722.945663,
//   "final_expression_output": null,
//   "in_kernel_exception": null,
//   "system_exception": null,
//   "messages": [
//     {
//       "message_type": "image",
//       "time": 1727153722.9052918,
//       "sender": "server",
//       "image_payload": null,
//       "image_url": "file-service://file-qqMSmhQMaH22X6mvqSbbRcjr",
//       "width": 1415,
//       "height": 1101
//     }
//   ],
function extraxtTitleFromCode(code) {
  let title = '';
  if (code && code.includes('title')) {
    const titleMatch = code.match(/plt\.title\(['"]([^'"]+)['"]\)/);
    if (titleMatch && titleMatch[1]) {
      // eslint-disable-next-line prefer-destructuring
      title = titleMatch[1];
    }
  }
  return title;
}
function findChartImageInMapping(obj, targetPointer) {
  if (typeof obj !== 'object' || obj === null) return null;

  // Check if the object has the desired asset_pointer

  const messages = obj?.message?.metadata?.aggregate_result?.messages;
  if (messages && messages?.some((msg) => msg?.image_url?.includes(targetPointer))) {
    const aggregateResult = obj?.message?.metadata?.aggregate_result;
    const currentTime = Date.now() / 1000;
    const code = aggregateResult?.code;
    const title = extraxtTitleFromCode(code);
    return {
      title,
      create_time: obj?.message?.create_time || currentTime,
      message_id: obj?.id,
      parent: obj?.parent,
      asset_object: aggregateResult,
    };
  }

  // Recursively search through each property
  // eslint-disable-next-line no-restricted-syntax
  for (const key in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(key)) {
      const found = findChartImageInMapping(obj[key], targetPointer);
      if (found) return found;
    }
  }

  return null;
}
function handleQueryParams() {
  const query = window.location.search.substring(1);
  const urlParams = new URLSearchParams(query);
  const initialText = urlParams.get('p');
  const promptId = urlParams.get('pid');
  const messageId = urlParams.get('mid');

  // if url has #manager then open manager
  // https://chatgpt.com/#manager
  // https://chatgpt.com/c/13123-123-123-213-13-123#manager
  // https://chatgpt.com/c/13123-123-123-213-13-123#manager/conversations
  if (window.location.hash.startsWith('#manager')) {
    const managerTab = window.location.hash.split('/')[1];
    createManager(managerTab);
  }
  if (window.location.hash.startsWith('#setting') && !window.location.hash.startsWith('#settings')) {
    const settingsTab = window.location.hash.split('/')[1];
    createSettingsModal(settingsTab);
  }
  const textAreaElement = document.querySelector('#prompt-textarea');

  if (initialText) {
    textAreaElement.innerText = initialText;
    textAreaElement.focus();
    const submitButton = document.querySelector('[data-testid*="send-button"]');
    if (submitButton) submitButton.click();
  } else if (promptId) {
    chrome.runtime.sendMessage({
      type: 'getPrompt',
      detail: {
        promptId,
      },
    }, (prompt) => {
      textAreaElement.innerText = prompt?.steps[0];
      textAreaElement.focus();
    });
  } else if (messageId) {
    // wait for the conv to load, then scroll to the message
    setTimeout(() => {
      const messageElement = document.querySelector(`main [data-message-id="${messageId}"]`);
      if (messageElement) {
        messageElement.closest('article')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
    }, 1500);
  }
}

function getMousePosition(event) {
  const x = event.clientX;
  const y = event.clientY;
  return { x, y };
}
function isDescendant(parent, child) {
  let node = child?.parentNode;
  while (node != null) {
    if (node === parent) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
}

function animatePing(color) {
  const ping = document.createElement('span');
  ping.classList = 'absolute flex h-3 w-3';
  ping.style = 'top: -6px; right: -6px;';
  ping.id = 'ping';
  const animatePingElement = document.createElement('span');
  animatePingElement.classList = 'animate-ping absolute inline-flex h-full w-full rounded-full';
  animatePingElement.style = `background-color: ${color}; opacity: 0.75;`;
  const relativePing = document.createElement('span');
  relativePing.classList = 'relative inline-flex rounded-full h-3 w-3';
  relativePing.style = `background-color: ${color};`;
  ping.appendChild(animatePingElement);
  ping.appendChild(relativePing);
  return ping;
}
function createTooltip(element, innerHtml, style = '') {
  const tooltip = document.createElement('div');
  tooltip.classList = 'dark hidden bg-black text-token-text-primary text-xs whitespace-nowrap font-bold p-2 rounded-md absolute end-0 z-10 border border-token-border-medium';
  tooltip.style = style;
  tooltip.innerHTML = `<div class="flex items-center justify-between">${innerHtml}</div>`;
  element.addEventListener('mouseenter', () => {
    tooltip.classList.remove('hidden');
  });
  element.addEventListener('mouseleave', () => {
    tooltip.classList.add('hidden');
  });
  element.appendChild(tooltip);
}

function getUserProfile() {
  gizmoCreatorProfile().then((profile) => {
    const profileName = profile?.name;
    const profileWebsiteUrl = profile?.website_url;
    const newData = {};
    if (profileName) {
      newData.name = profileName;
    }
    if (profileWebsiteUrl) newData.url = profileWebsiteUrl;
    chrome.storage.sync.set(newData);
  });
}
function checkForNewUpdate() {
  if (cachedSettings?.hideUpdateNotification) return;

  chrome.runtime.sendMessage({
    type: 'getLatestVersion',
  }, (updateCheck) => {
    if (updateCheck?.status === 'update_available') {
      showConfirmDialog('New update available', `A new version (v${updateCheck?.version}) of <b>Superpower ChatGPT</b> is available. Update now to get the latest features and bug fixes.`, 'Cancel', 'Update now', null, () => {
        chrome.runtime.sendMessage({ type: 'reloadExtension', forceRefresh: true }, () => {
          window.location.reload();
        });
      }, 'green', true);
    }
  });
}
function formatTime(time) {
  if (!time) return time;
  // if time in format "2023-11-11T21:37:10.479788+00:00"
  if (time.toString().indexOf('T') !== -1) {
    return new Date(time).getTime();
  }
  // if time in format 1699691863.236379 (10 digits before dot)
  if (time.toString().indexOf('.') !== -1 && time.toString().split('.')[0].length === 10) {
    return new Date(time * 1000).getTime();
  }
  // if time in format 1699691863236.379 (13 digits before dot)
  if (time.toString().indexOf('.') !== -1 && time.toString().split('.')[0].length === 13) {
    return new Date(time).getTime();
  }
  // if time in format 1699691863242 (13 digits)
  if (time.toString().length === 13) {
    return new Date(time).getTime();
  }
  // if time is 10 digit
  if (time.toString().length === 10) {
    return new Date(time * 1000).getTime();
  }

  return time;
}

function formatDate(date) {
  if (!date) return date;
  // if date is today show hh:mm. if older than today just show date yyyy-mm-dd
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const todayDate = today.getDate();
  const todayMonth = today.getMonth() + 1;
  const todayYear = today.getFullYear();
  const dateDate = date.getDate();
  const dateMonth = date.getMonth() + 1;
  const dateYear = date.getFullYear();
  if (todayDate === dateDate && todayMonth === dateMonth && todayYear === dateYear) {
    return `Today ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' })}`;
  }
  if (yesterday.getDate() === dateDate && yesterday.getMonth() + 1 === dateMonth && yesterday.getFullYear() === dateYear) {
    return `Yesterday ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' })}`;
  }
  return `${date.toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' })} ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' })}`;
}
function formatDateDalle() { // 2023-12-02 22.47.07
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // January is 0
  const day = String(currentDate.getDate()).padStart(2, '0');
  const hours = String(currentDate.getHours()).padStart(2, '0');
  const minutes = String(currentDate.getMinutes()).padStart(2, '0');
  const seconds = String(currentDate.getSeconds()).padStart(2, '0');

  const formattedDate = `${year}-${month}-${day} ${hours}.${minutes}.${seconds}`;
  return formattedDate;
}

function getFirstConversationIdFromSidebar() {
  const conversationElements = document.querySelectorAll('nav li a[href*="/c/"]');
  if (conversationElements.length > 0) {
    const conversationElement = conversationElements[0];
    const conversationId = getConversationIdFromUrl(conversationElement.href);
    return conversationId;
  }
  return null;
}
function getConversationIdFromUrl(url = null) {
  if (!url) url = window.location.href;
  const pattern = /\/c\/(.*?)(\/|\?|#|$)/;
  const match = url.match(pattern);
  if (match && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(match[1])) {
    return match[1];
  }
  return null;
}
function getConversationName(conversationId = null) {
  if (!conversationId) {
    const conversationIdFromUrl = getConversationIdFromUrl();
    if (!conversationIdFromUrl) return 'New chat';
    conversationId = conversationIdFromUrl;
  }
  // check if conversation is in sidebar
  const conversationElement = document.querySelector(`nav li a[href$="${conversationId}"]`);
  if (conversationElement) return conversationElement.textContent;
  // if not found in sidebar, check cache
  const conversation = conversationsCache[conversationId];
  if (conversation) return conversation.title;
  return 'New chat';
}

function sanitizeHtml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
function escapeHTML(html) {
  const text = document.createTextNode(html);
  const p = document.createElement('p');
  p.appendChild(text);
  return p.innerHTML;
}
function highlightSearch(elements, searchTerm) {
  debounce(highlightSearchDebounced, 100)(elements, searchTerm);
}
function highlightSearchDebounced(elements, searchTerm) {
  if (!elements) return;
  if (!searchTerm) {
    CSS.highlights.clear();
    return;
  }
  // Find all text nodes in the element. We'll search within
  // these text nodes.
  const allTextNodes = [];
  for (let i = 0; i < elements.length; i += 1) {
    if (!elements[i]) continue;
    const treeWalker = document.createTreeWalker(elements[i], NodeFilter.SHOW_TEXT);
    let currentNode = treeWalker.nextNode();
    while (currentNode) {
      allTextNodes.push(currentNode);
      currentNode = treeWalker.nextNode();
    }
  }
  // If the CSS Custom Highlight API is not supported,
  // display a message and bail-out.
  if (!CSS.highlights) {
    return;
  }

  // Clear the HighlightRegistry to remove the
  CSS.highlights.clear();

  // Clean-up the search query and bail-out if
  // if it's empty.
  const str = searchTerm.toLowerCase();
  if (!str.trim()) {
    return;
  }

  // Iterate over all text nodes and find matches.
  const ranges = allTextNodes
    .map((el) => ({ el, text: el.textContent.toLowerCase() }))
    .map(({ text, el }) => {
      const indices = [];
      let startPos = 0;
      while (startPos < text.length) {
        const index = text.indexOf(str, startPos);
        if (index === -1) break;
        indices.push(index);
        startPos = index + str.length;
      }

      // Create a range object for each instance of
      // str we found in the text node.
      return indices.map((index) => {
        const range = new Range();
        range.setStart(el, index);
        range.setEnd(el, index + str.length);
        return range;
      });
    });

  // Create a Highlight object for the ranges.
  // eslint-disable-next-line no-undef
  const searchResultsHighlight = new Highlight(...ranges.flat());
  // Register the Highlight object in the registry.
  CSS.highlights.set('search-results', searchResultsHighlight);
}
function createHighlightOverlay(inputElement, searchTerm) {
  const overlayElement = document.createElement('div');
  overlayElement.id = `${inputElement.id}-highlight-overlay`;
  // inputElement.classList + ' highlight-overlay'
  overlayElement.classList = `${inputElement.classList} highlight-overlay`;

  overlayElement.innerText = inputElement.value;
  inputElement.appendChild(overlayElement);
  // const get conversationList node
  highlightSearch([overlayElement], searchTerm);

  // update notePreviewOverlay with notePreviewText value
  inputElement.addEventListener('input', () => {
    const curOverlayElement = document.querySelector(`#${inputElement.id}-highlight-overlay`);
    if (!curOverlayElement) return;
    const curInputElement = document.querySelector(`#${inputElement.id}`);
    curOverlayElement.innerHTML = curInputElement.value.replace(/\n/g, '<br>');
    // highlight search
    if (searchTerm) {
      highlightSearch([curOverlayElement], searchTerm);
    }
  });
  // add scroll event to sync scroll between notePreviewOverlay and notePreviewText
  inputElement.addEventListener('scroll', () => {
    const curOverlayElement = document.querySelector(`#${inputElement.id}-highlight-overlay`);
    if (!curOverlayElement) return;
    const curInputElement = document.querySelector(`#${inputElement.id}`);
    curOverlayElement.scrollTop = curInputElement.scrollTop;
  });
  return overlayElement;
}
function highlightBracket(text) {
  if (!text) return text;
  if (text.trim().length === 0) return '';
  // replace brackets [] and text between them with <mark> tag and remove the brackets
  return text.replace(/\{\{.*?\}\}/g, (match) => `<strong class="rounded-md bg-token-main-surface-tertiary italic border border-token-border-medium" style="margin:0 2px; padding:1px 4px;">${match.replace(/[{}]/g, '')}</strong>`);
}
function getRedirectUrl(url) {
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(url, { headers: { Authorization: result.accessToken } }).then((response) => {
    if (response.redirected) {
      return response.url;
    }
    return url;
  }));
}
function makeElementDraggable(elmnt) {
  let pos1 = 0; let pos2 = 0; let pos3 = 0; let
    pos4 = 0;
  if (document.getElementById(`${elmnt.id}header`)) {
    // if present, the header is where you move the DIV from:
    document.getElementById(`${elmnt.id}header`).onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    elmnt.style.cursor = 'grabbing';
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = `${elmnt.offsetTop - pos2}px`;
    elmnt.style.left = `${elmnt.offsetLeft - pos1}px`;
  }

  function closeDragElement() {
    elmnt.style.cursor = 'grab';
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
function disableDraggable(elmnt) {
  if (document.getElementById(`${elmnt.id}header`)) {
    document.getElementById(`${elmnt.id}header`).onmousedown = null;
  } else {
    elmnt.onmousedown = null;
  }
}
function dataURItoBlob(dataURI) {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);

  for (let i = 0; i < byteString.length; i += 1) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ab], { type: mimeString });
}
async function downloadFileFromUrl(url, filename, skipDownload = false) {
  // if url starts with api/content, use getRedirectUrl
  if (url.startsWith('/api/content') || url.startsWith('/backend-api/content')) {
    const redirectUrl = await getRedirectUrl(`https://chatgpt.com${url}`);
    url = redirectUrl;
  }
  if (url.includes('a0.wfh.team')) {
    // add ?cache=false to bypass cache
    const urlObj = new URL(url);
    urlObj.searchParams.set('cache', 'false');
    url = urlObj.toString();
  }
  const image = await fetch(url, { method: 'GET', headers: { origin: 'https://chatgpt.com' } }).then((response) => response.blob()).then((blob) => {
    if (skipDownload) return blob;

    const blobURL = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobURL;
    a.style.display = 'none';
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return blob;
  });
  return image;
}
const rgba2hex = (rgba) => (rgba ? `#${rgba?.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+\.{0,1}\d*))?\)$/)?.slice(1)?.map((n, i) => (i === 3 ? Math.round(parseFloat(n) * 255) : parseFloat(n)).toString(16).padStart(2, '0').replace('NaN', ''))?.join('')}` : '');

// function downloadFilesAsZip(urls, filenames) {
//   const zip = new JSZip();
//   const folder = zip.folder('chatgpt-images');
//   urls.forEach((url, index) => {
//     fetch(url).then((response) => response.blob()).then((blob) => {
//       folder.file(filenames[index], blob);
//     });
//   });
//   zip.generateAsync({ type: 'blob' }).then((content) => {
//     const blobURL = URL.createObjectURL(content);
//     const a = document.createElement('a');
//     a.href = blobURL;
//     a.style.display = 'none';
//     a.download = 'chatgpt-images.zip';
//     document.body.appendChild(a);
//     a.click();
//     a.remove();
//   });
// }
function remoteFunction(remoteArgs) {
  // args: [ { "functionName": "functionName", "args": { "arg1": "arg1", "arg2": "arg2"} } ]
  for (let i = 0; i < remoteArgs.length; i += 1) {
    const args = remoteArgs[i];
    switch (args.functionName) {
      case 'removeElements':
        removeElements(args.args);
        break;
      case 'addCSS':
        addCSS(args.args);
        break;
      case 'toast':
        toast(args.args.html, args.args.type, args.args.duration);
        break;
      default:
        break;
    }
  }
}
function removeElements(args) {
  if (args?.selector) {
    const elements = document.querySelectorAll(args.selector);
    elements.forEach((element) => {
      element.remove();
    });
  }
}
// .end-8 {
//   right: 2rem;
// }
// [{"args": {"css": ".end-8 {right: 4rem;}"}, "functionName": "addCSS"}]
function addCSS(args) {
  if (args?.css) {
    const style = document.createElement('style');
    style.innerHTML = args.css;
    document.head.appendChild(style);
  }
}
function loadingSpinner(elementId) {
  const spinner = document.createElement('div');
  spinner.id = `loading-spinner-${elementId}`;
  spinner.classList = 'absolute top-0 start-0 flex items-center justify-center w-full h-full';
  spinner.innerHTML = `<svg x="0" y="0" viewbox="0 0 40 40" class="spinner icon-xl"><circle fill="transparent" stroke="${isDarkMode() ? '#fff' : '#000'}" stroke-width="2" stroke-linecap="round" stroke-dasharray="125.6" cx="20" cy="20" r="18"></circle></svg>`;
  return spinner;
}
function toast(html, type = 'info', duration = 4000) {
  // show toast that text is copied to clipboard
  const existingToast = document.querySelector('#gptx-toast');
  if (existingToast) existingToast.remove();
  const element = document.createElement('div');
  element.id = 'gptx-toast';
  element.style = 'position:fixed;right:24px;top:24px;border-radius:4px;background-color:#19c37d;padding:8px 16px;z-index:1000001;max-width:600px; color:white;';
  if (type === 'error') {
    element.style.backgroundColor = '#ef4146';
  }
  if (type === 'warning') {
    element.style.backgroundColor = '#e06c2b';
  }
  element.innerHTML = translate(html);
  document.body.appendChild(element);
  setTimeout(
    () => {
      if (!isAltKeyDown) {
        element.remove();
      }
    },
    duration,
  );
}
function createSlider(title, subtitle, settingsKey, defaultValue, min, max, step, callback = null, tags = [], disabled = false) {
  const sliderWrapper = document.createElement('div');
  sliderWrapper.style = 'display: flex; flex-direction:column; justify-content: flex-start; align-items: flex-start; width: 100%; margin: 8px 0;';
  const sliderLabel = document.createElement('div');
  sliderLabel.style = 'display:flex; align-items: center; width: 100%; margin: 8px 0;';
  const sliderTitle = document.createElement('div');
  sliderTitle.style = 'min-width: fit-content; font-size: 16px;';
  sliderTitle.innerHTML = translate(title);
  const sliderSubtitle = document.createElement('div');
  sliderSubtitle.style = 'font-size: 12px; color: #999;';
  sliderSubtitle.innerHTML = translate(subtitle);
  sliderLabel.appendChild(sliderTitle);
  const sliderElement = document.createElement('input');
  sliderElement.id = `sp-range-slider-${settingsKey}`;
  sliderElement.classList = 'sp-range-slider';
  sliderElement.style = 'width: 100%; margin: 8px';
  sliderElement.type = 'range';
  sliderElement.min = min;
  sliderElement.max = max;
  sliderElement.step = step;
  sliderElement.disabled = disabled;
  const sliderValue = document.createElement('span');
  sliderValue.id = `sp-range-slider-value-${settingsKey}`;
  sliderValue.style = 'min-width: fit-content;font-size: 14px; color: #999; margin: 0 16px;';
  sliderValue.textContent = defaultValue;

  if (settingsKey) {
    const settingValue = cachedSettings[settingsKey];
    if (settingValue === undefined && defaultValue !== undefined) {
      const newSettings = { ...cachedSettings };
      newSettings[settingsKey] = defaultValue;
      sliderValue.textContent = defaultValue;
      chrome.storage.local.set({ settings: newSettings });
    } else {
      sliderElement.value = settingValue;
      sliderValue.textContent = settingValue;
    }

    sliderElement.addEventListener('input', () => {
      sliderValue.textContent = sliderElement.value;
    });
    sliderElement.addEventListener('change', () => {
      const oldValue = cachedSettings[settingsKey];
      const newSettings = { ...cachedSettings };
      newSettings[settingsKey] = sliderElement.value;
      sliderValue.textContent = sliderElement.value;
      chrome.storage.local.set({ settings: newSettings }, () => {
        if (callback) {
          callback(oldValue, sliderElement.value);
        }
      });
    });
  } else {
    sliderElement.value = defaultValue;
    sliderValue.textContent = defaultValue;
    sliderElement.addEventListener('change', () => {
      if (callback) {
        callback(sliderElement.value);
      }
    });
  }
  sliderLabel.appendChild(sliderValue);
  sliderLabel.appendChild(sliderElement);

  sliderWrapper.appendChild(sliderLabel);
  sliderWrapper.appendChild(sliderSubtitle);
  return sliderWrapper;
}
function createSwitch(title, subtitle, settingsKey, defaultValue, callback = null, tags = [], disabled = false, compact = false) {
  const switchWrapper = document.createElement('div');
  switchWrapper.id = `sp-switch-wrapper-${title.toLowerCase().replaceAll(' ', '-')}`;
  switchWrapper.style = `display: flex; flex-direction: column; justify-content: start; align-items: start; width: 100%; ${compact ? '' : 'margin: 8px 0;'} transition: all 0.2s ease-in-out;`;
  const switchElement = document.createElement('div');
  switchElement.style = `display: flex; flex-direction: row; justify-content: start; align-items: center; width: 100%; ${compact ? '' : 'margin: 8px 0;'}`;
  switchElement.innerHTML = `<div style="white-space: nowrap;">${translate(title)}</div>`;
  const label = document.createElement('label');
  label.classList = 'sp-switch';
  if (compact) {
    label.style.transform = 'scale(0.75)';
    label.style.margin = 0;
  }
  label.style.opacity = disabled ? '0.5' : '1';
  const input = document.createElement('input');
  input.id = `switch-${title.toLowerCase().replaceAll(' ', '-')}`;
  input.type = 'checkbox';
  input.disabled = disabled;
  const betaTagWrapper = document.createElement('div');
  tags.forEach((tag) => {
    const betaTag = document.createElement('span');
    betaTag.style = `${tag === '⚡️ Requires Pro Account' ? 'background-color: #19c37d; color: black;' : tag === 'New' ? 'background-color: #ef4146; color: white;' : 'background-color: #ff9800; color: black;'}  padding: 2px 4px; border-radius: 8px; font-size: 0.7em;margin-right:8px;`;
    betaTag.textContent = tag;
    if (tag === '⚡️ Requires Pro Account') {
      betaTag.role = 'button';
      betaTag.addEventListener('click', () => {
        document.querySelector('#upgrade-to-pro-button-settings')?.click();
      });
    }
    betaTagWrapper.appendChild(betaTag);
  });
  const helper = document.createElement('div');
  helper.style = 'font-size: 12px; color: #999;';
  helper.innerHTML = translate(subtitle);
  if (settingsKey) {
    const settingValue = cachedSettings[settingsKey];
    if (settingValue === undefined && defaultValue !== undefined) {
      const newSettings = { ...cachedSettings };
      newSettings[settingsKey] = defaultValue;
      chrome.storage.local.set({ settings: newSettings });
      input.checked = defaultValue;
    } else {
      input.checked = settingValue;
    }

    input.addEventListener('change', (event) => {
      chrome.runtime.sendMessage({
        type: 'checkHasSubscription',
      }, (hasSubscription) => {
        if (!hasSubscription && tags.includes('⚡️ Requires Pro Account')) {
          toast('This feature is only available for Pro users. Please upgrade to Pro to use this feature.', 'error');
          input.checked = defaultValue;
        } else {
          const newSettings = { ...cachedSettings };
          newSettings[settingsKey] = input.checked;
          chrome.storage.local.set({ settings: newSettings }, () => {
            if (callback) {
              callback(input.checked, event);
            }
          });
        }
      });
    });
  } else {
    chrome.runtime.sendMessage({
      type: 'checkHasSubscription',
    }, (hasSubscription) => {
      if (!hasSubscription && tags.includes('⚡️ Requires Pro Account')) {
        toast('This feature is only available for Pro users. Please upgrade to Pro to use this feature.', 'error');
        input.checked = defaultValue;
      } else {
        input.checked = defaultValue;
        input.addEventListener('change', (event) => {
          if (callback) {
            callback(input.checked, event);
          }
        });
      }
    });
  }
  const slider = document.createElement('span');
  slider.classList = 'sp-switch-slider round';

  label.appendChild(input);
  label.appendChild(slider);
  switchElement.appendChild(label);
  if (tags.length > 0) switchElement.appendChild(betaTagWrapper);
  switchWrapper.appendChild(switchElement);
  switchWrapper.appendChild(helper);
  return switchWrapper;
}

function getFileType(fileName) {
  switch (fileName?.split('.').pop()) {
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
      return 'Image';
    case 'pdf':
      return 'PDF';
    case 'doc':
    case 'docx':
    case 'txt':
      return 'Document';
    case 'csv':
    case 'xls':
    case 'xlsx':
      return 'Spreadsheet';
    case 'js':
      return 'JavaScript';
    case 'py':
      return 'Python';
    default:
      return 'File';
  }
}
