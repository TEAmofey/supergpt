/* global getConversationIdFromUrl, initializePresentation, getConversationsByIds, debounce, flashArticle, isDarkMode, getCharCount, getWordCount, formatDate, formatTime, cachedSettings */
const articleObservers = [];
// eslint-disable-next-line no-unused-vars
const debounceCreateConversationMiniMap = debounce(() => {
  createConversationMiniMap();
}, 1000);
function removeMiniMap() {
  const existingMinimapWrapper = document.querySelector('#minimap-wrapper');
  if (existingMinimapWrapper) {
    existingMinimapWrapper.remove();
  }
  articleObservers?.forEach((observer) => {
    observer.disconnect();
  });
}
async function createConversationMiniMap(forceRefresh = false) {
  const existingMinimapWrapper = document.querySelector('#minimap-wrapper');

  if (!cachedSettings?.showMiniMap) {
    removeMiniMap();
    return;
  }
  if (existingMinimapWrapper && !forceRefresh) return;

  const conversationIdFromUrl = getConversationIdFromUrl();
  if (!conversationIdFromUrl) return;
  const conversations = await getConversationsByIds([conversationIdFromUrl]);
  const minimapWrapper = document.createElement('div');
  const presentation = initializePresentation();
  if (!presentation) return;

  // add minimap to the right edge of the presentation
  minimapWrapper.id = 'minimap-wrapper';
  minimapWrapper.classList = 'absolute top-0 end-0 z-50 flex flex-col transition-all duration-300';
  minimapWrapper.style.padding = '60px 0 170px 0';
  minimapWrapper.style.height = '100%';

  minimapWrapper.addEventListener('mouseenter', () => {
    // hide sidebar-note-button
    const sidebarNoteButton = document.querySelector('#sidebar-note-button');
    if (sidebarNoteButton) sidebarNoteButton.style.visibility = 'hidden';
    // hide sidebar-folder-button
    const sidebarFolderButton = document.querySelector('#sidebar-folder-button');
    if (sidebarFolderButton) sidebarFolderButton.style.visibility = 'hidden';
    // opacity  floating-button-wrapper
    const floatingButtonWrapper = document.querySelector('#floating-button-wrapper');
    if (floatingButtonWrapper) floatingButtonWrapper.style.opacity = '0.1';
  });
  minimapWrapper.addEventListener('mouseleave', () => {
    // show sidebar-note-button
    const sidebarNoteButton = document.querySelector('#sidebar-note-button');
    if (sidebarNoteButton) sidebarNoteButton.style.visibility = 'visible';
    // show sidebar-folder-button
    const sidebarFolderButton = document.querySelector('#sidebar-folder-button');
    if (sidebarFolderButton) sidebarFolderButton.style.visibility = 'visible';
    // show  floating-button-wrapper
    const floatingButtonWrapper = document.querySelector('#floating-button-wrapper');
    if (floatingButtonWrapper) floatingButtonWrapper.style.opacity = '1';
  });
  const main = document.querySelector('main');
  const articles = main.querySelectorAll('article');
  const darkMode = isDarkMode();

  removeMiniMap(); // to make sure observera are disconnected

  articles.forEach((article) => {
    const messageWrapper = article.querySelector('div[data-message-author-role]');
    if (!messageWrapper) return;
    const messageId = messageWrapper?.dataset?.messageId;
    if (!messageId) return;
    // isAssistantMessage: data-message-author-role="assistant"
    const isUserMessage = messageWrapper?.dataset?.messageAuthorRole === 'user';
    const miniArticleWrapper = document.createElement('div');
    miniArticleWrapper.id = `mini-article-wrapper-${messageId}`;
    miniArticleWrapper.classList = `flex flex-col relative ${isUserMessage ? 'pt-1.5' : 'pt-0.5'}`;
    // the height of the miniArticle is proportional to the height of the article
    miniArticleWrapper.style.height = `${(article.lastChild.offsetHeight / (main.offsetHeight - 240)) * 100}%`;
    miniArticleWrapper.addEventListener('click', () => {
      article.scrollIntoView({ behavior: 'smooth', block: 'start' });
      flashArticle(article);
    });
    // when hover over the miniArticleWrapper, show a preview of the article inside a floating div next to miniArticleWrapper
    miniArticleWrapper.addEventListener('mouseenter', () => {
      const existingFloatingArticlePreview = miniArticleWrapper.querySelector('#floating-article-preview');
      if (existingFloatingArticlePreview) return;
      const floatingArticlePreview = document.createElement('div');
      floatingArticlePreview.id = 'floating-article-preview';
      floatingArticlePreview.classList = `absolute top-0 end-6 z-50 p-3 pb-8 bg-token-main-surface-secondary rounded-md shadow-md overflow-hidden text-xs border border-token-border-medium ${isUserMessage ? 'mt-1.5' : 'mt-0.5'}`;
      floatingArticlePreview.style.width = '500px';
      floatingArticlePreview.style.maxWidth = '90vw';
      floatingArticlePreview.style.minHeight = '100px';
      floatingArticlePreview.style.height = `${Math.min(messageWrapper?.parentElement.offsetHeight, 300)}px`;
      floatingArticlePreview.style.maxHeight = `${Math.max(miniArticleWrapper.offsetHeight, 300)}px`;

      const articlePreview = messageWrapper?.parentElement?.cloneNode(true);
      if (articlePreview) {
        articlePreview.style.width = '100%';
        articlePreview.style.height = '100%';
        articlePreview.style.overflow = 'scroll';

        floatingArticlePreview.appendChild(articlePreview);
      }

      floatingArticlePreview.querySelectorAll('.relative').forEach((el) => {
        el.classList.remove('max-w-[var(--user-chat-width,70%)]', 'px-5', 'py-2.5', 'bg-token-message-surface');
      });
      // remove unnecessary elements from the floatingArticlePreview
      floatingArticlePreview.querySelectorAll('#message-char-word-counter, #message-timestamp, #message-instructions, div[id^="message-actions-"]').forEach((el) => {
        el.remove();
      });

      miniArticleWrapper.appendChild(floatingArticlePreview);

      // add a fade effect to the bottom floatingArticlePreview
      const fade = document.createElement('div');
      fade.classList = 'absolute bottom-0 start-0 end-0 h-24';
      fade.style.maxHeight = '50%';
      if (darkMode) {
        fade.style.background = 'linear-gradient(180deg, rgba(0, 0, 0, 0), rgba(10, 10, 10, 1))';
      } else {
        fade.style.background = 'linear-gradient(180deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1))';
      }

      // add message preview info to fade
      const messagePreviewInfo = document.createElement('div');
      messagePreviewInfo.classList = 'flex items-end justify-end gap-2 text-xs text-token-text-tertiary w-full h-full p-2';
      fade.appendChild(messagePreviewInfo);

      // add timestamp
      const allMessageWrapper = article.querySelectorAll('div[data-message-author-role]');
      const lastMessageWrapper = allMessageWrapper[allMessageWrapper.length - 1];
      const lastMessageId = lastMessageWrapper?.dataset.messageId;
      const messageData = conversations[0]?.mapping[lastMessageId];
      const timestamp = messageData
        ? formatDate(new Date(formatTime(messageData?.message?.create_time)))
        : formatDate(new Date());
      const messagePreviewTimestamp = document.createElement('div');
      messagePreviewTimestamp.innerHTML = `${timestamp} <span style="margin: 0 8px;">·</span>`;
      messagePreviewInfo.appendChild(messagePreviewTimestamp);

      // add char and word counter
      const messagePreviewText = floatingArticlePreview?.firstChild?.innerText || '';
      const charCount = getCharCount(messagePreviewText);
      const wordCount = getWordCount(messagePreviewText);
      const counterText = `${charCount} chars / ${wordCount} words`;

      const messagePreviewCharWordCounterElement = document.createElement('div');
      messagePreviewCharWordCounterElement.textContent = counterText;
      messagePreviewInfo.appendChild(messagePreviewCharWordCounterElement);

      floatingArticlePreview.appendChild(fade);
    });
    miniArticleWrapper.addEventListener('mouseleave', () => {
      const floatingArticlePreviews = document.querySelectorAll('#floating-article-preview');
      floatingArticlePreviews.forEach((floatingArticlePreview) => {
        floatingArticlePreview.remove();
      });
    });

    const isPinned = article.classList.contains('bg-pinned');

    const miniArticle = document.createElement('div');
    miniArticle.id = `mini-article-${messageId}`;
    miniArticle.classList = `${isPinned ? 'bg-gold' : 'bg-token-main-surface-tertiary'} w-4 hover:w-6 ${isUserMessage ? 'rounded-ts-md' : 'rounded-bs-md'} cursor-pointer transition-all duration-300 ms-auto h-full`;

    miniArticleWrapper.appendChild(miniArticle);
    minimapWrapper.appendChild(miniArticleWrapper);
    // if less than 10 articles, observe all articles for performance reasons
    // if (articles.length < 10) {
    //   observeArticle(article);
    // }
  });

  presentation.appendChild(minimapWrapper);
}
// eslint-disable-next-line no-unused-vars
function highlightMiniMap(messageId) {
  const miniArticle = document.querySelector(`#minimap-wrapper #mini-article-${messageId}`);
  if (!miniArticle) return;
  miniArticle.classList.replace('bg-token-main-surface-tertiary', 'bg-gold');
}
// eslint-disable-next-line no-unused-vars
function unHighlightMiniMap(messageId) {
  const miniArticle = document.querySelector(`#minimap-wrapper #mini-article-${messageId}`);
  if (!miniArticle) return;
  miniArticle.classList.replace('bg-gold', 'bg-token-main-surface-tertiary');
}
// eslint-disable-next-line no-unused-vars
function observeArticle(article) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const messageId = article.querySelector('div[data-message-author-role]')?.dataset?.messageId;
      if (!messageId) return;
      const miniArticles = document.querySelectorAll('#minimap-wrapper div[id^="mini-article-"]');
      const miniArticle = document.querySelector(`#minimap-wrapper #mini-article-${messageId}`);
      if (miniArticle) {
        if (entry.isIntersecting) {
          miniArticles.forEach((el) => {
            el.classList.replace('w-6', 'w-4');
          });
          miniArticle.classList.replace('w-4', 'w-6');
        } else {
          miniArticle.classList.replace('w-6', 'w-4');
        }
      }
    });
  }, {
    // if article height is greater than window height, set threshold to 0.5 else 0.9
    threshold: article.offsetHeight > window.innerHeight ? 0.1 : 1,
  });
  articleObservers.push(observer);
  observer.observe(article);
}
