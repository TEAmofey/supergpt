/* global createPinButtons, createConversationMiniMap, showConfirmDialog, deleteConversation, startNewChat, getConversationIdFromUrl, sidebarNoteIsOpen, sidebarFolderIsOpen, noConversationElement, sidebarNoteInputWrapperWidth, sidebarFolderDrawerWidth, throttle, debounce, getCharCount, getWordCount, formatDate, getConversationsByIds, formatTime, initializePresentation */
// eslint-disable-next-line no-unused-vars
function addThreadEditButtonEventListener() {
  document.body.addEventListener('click', (e) => {
    // check if the clicked element is a button or a child of a button
    const button = e.target.closest('button');
    if (!button) return;
    // check if the button is a child of an article
    const article = button.closest('article');
    if (!article) return;
    // check if button includes <svg> element
    const left = button.querySelector('svg path[d="M14.7071 5.29289C15.0976 5.68342 15.0976 6.31658 14.7071 6.70711L9.41421 12L14.7071 17.2929C15.0976 17.6834 15.0976 18.3166 14.7071 18.7071C14.3166 19.0976 13.6834 19.0976 13.2929 18.7071L7.29289 12.7071C7.10536 12.5196 7 12.2652 7 12C7 11.7348 7.10536 11.4804 7.29289 11.2929L13.2929 5.29289C13.6834 4.90237 14.3166 4.90237 14.7071 5.29289Z"]');
    const right = button.querySelector('svg path[d="M9.29289 18.7071C8.90237 18.3166 8.90237 17.6834 9.29289 17.2929L14.5858 12L9.29289 6.70711C8.90237 6.31658 8.90237 5.68342 9.29289 5.29289C9.68342 4.90237 10.3166 4.90237 10.7071 5.29289L16.7071 11.2929C16.8946 11.4804 17 11.7348 17 12C17 12.2652 16.8946 12.5196 16.7071 12.7071L10.7071 18.7071C10.3166 19.0976 9.68342 19.0976 9.29289 18.7071Z"]');
    const submitButton = button?.classList?.contains('btn-primary') && button.innerText;
    if (left || right || submitButton) {
      setTimeout(async () => {
        await createPinButtons(true);
        createConversationMiniMap(true);
      }, submitButton ? 500 : 100);
    }
  });
}

// eslint-disable-next-line no-unused-vars
function handleDeleteConversation(conversationId) {
  if (!conversationId) return;
  showConfirmDialog('Delete conversation', 'Are you sure you want to delete this conversation?', 'Cancel', 'Delete', null, () => {
    // remove the conversation from sidebar
    chrome.runtime.sendMessage({
      type: 'deleteConversations',
      detail: {
        conversationIds: [conversationId],
      },
    }, () => {
      deleteConversation(conversationId);
      removeConversationElements(conversationId);
    });
  });
}

function removeConversationElements(conversationId) {
  const conversationElement = document.querySelector(`nav li a[href$="${conversationId}"]`);
  if (conversationElement) conversationElement.remove();
  // remove the card from the list
  const conversationCards = document.querySelectorAll(`#conversation-card-${conversationId}`);
  conversationCards.forEach((conversationCard) => {
    conversationCard.remove();
  });
  // add no conversation element to manager if there are no conversations
  const conversationList = document.querySelector('#modal-manager #conversation-manager-conversation-list');
  if (conversationList && conversationList.children.length === 0) {
    conversationList.appendChild(noConversationElement());
  }
  // add no conversation element to sidebar if there are no conversations

  const sidebarFolderContent = document.querySelector('#sidebar-folder-content');
  if (sidebarFolderContent && sidebarFolderContent.children.length === 0) {
    sidebarFolderContent.appendChild(noConversationElement());
  }
  const conversationIdFromUrl = getConversationIdFromUrl();
  if (conversationIdFromUrl === conversationId) {
    startNewChat();
  }
}
// eslint-disable-next-line no-unused-vars
function renameConversationElements(conversationId, newName) {
  const conversationElementTitleWrapper = document.querySelector(`nav li a[href$="${conversationId}"] div`);
  if (conversationElementTitleWrapper) {
    conversationElementTitleWrapper.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent = newName;
      }
    });
  }
}
// eslint-disable-next-line no-unused-vars
const debounceAddMessageTimestamps = debounce(() => {
  addMessageTimestamps();
}, 500);
// eslint-disable-next-line no-unused-vars
async function addMessageTimestamps() {
  const conversationIdFromUrl = getConversationIdFromUrl();

  const main = document.querySelector('main');
  if (!main) return;

  const articles = main.querySelectorAll('article');
  if (conversationIdFromUrl && articles.length === 0) return;

  const assistantMessages = main.querySelectorAll('article div[data-message-author-role="assistant"]');
  if (conversationIdFromUrl && assistantMessages.length === 0) return;
  const conversations = await getConversationsByIds([conversationIdFromUrl]);

  articles.forEach((article) => {
    addMessageTimestamp(conversations[0], article);
  });
}
function addMessageTimestamp(conversation, article) {
  if (!conversation || !article) return;
  const messages = article.querySelectorAll('div[data-message-author-role=assistant]');
  if (messages.length === 0) return;
  const message = messages[messages.length - 1];
  message.classList.add('relative');
  const messageId = message.getAttribute('data-message-id');
  const messageData = conversation?.mapping[messageId];
  const timestamp = messageData
    ? formatDate(new Date(formatTime(messageData?.message?.create_time)))
    : formatDate(new Date());
  const existingMessageTimestamp = message.querySelector('#message-timestamp');
  if (existingMessageTimestamp && existingMessageTimestamp?.innerText.includes(timestamp)) {
    return;
  }
  if (existingMessageTimestamp) existingMessageTimestamp.remove();
  const messageTimestampElement = document.createElement('div');
  messageTimestampElement.id = 'message-timestamp';
  messageTimestampElement.classList = 'text-xs text-token-text-tertiary absolute end-0';
  messageTimestampElement.style.bottom = '-32px';
  messageTimestampElement.style.userSelect = 'none';
  const existingMessageCharWordCounter = message.querySelector('#message-char-word-counter');
  messageTimestampElement.textContent = timestamp;
  if (existingMessageCharWordCounter) {
    messageTimestampElement.innerHTML = `${timestamp} <span style="margin-left: 8px;">·</span>`;
    messageTimestampElement.style.right = `${existingMessageCharWordCounter.offsetWidth + 8}px`;
  }
  message.appendChild(messageTimestampElement);
}

// eslint-disable-next-line no-unused-vars
const debounceAddMessageCharWordCounters = debounce(() => {
  addMessageCharWordCounters();
}, 500);
// eslint-disable-next-line no-unused-vars
function addMessageCharWordCounters() {
  const conversationIdFromUrl = getConversationIdFromUrl();

  const main = document.querySelector('main');
  if (!main) return;

  const articles = main.querySelectorAll('article');
  if (conversationIdFromUrl && articles.length === 0) return;

  const assistantMessages = main.querySelectorAll('article div[data-message-author-role="assistant"]');
  if (conversationIdFromUrl && assistantMessages.length === 0) return;

  articles.forEach((article) => {
    addMessageCharWordCounter(article);
  });
}
function addMessageCharWordCounter(article) {
  const messages = article.querySelectorAll('div[data-message-author-role=assistant]');
  if (messages.length === 0) return;
  const message = messages[messages.length - 1];
  if (!message) return;
  message.classList.add('relative');
  let messageText = 0;
  messages.forEach((msg) => {
    messageText += ` ${msg?.firstChild?.innerText || ''}`; // firstChild to avoid counting the timestamp
  });
  const charCount = getCharCount(messageText);
  const wordCount = getWordCount(messageText);
  const newCounterText = `${charCount} chars / ${wordCount} words`;

  const existingMessageCharWordCounter = message.querySelector('#message-char-word-counter');
  if (existingMessageCharWordCounter && existingMessageCharWordCounter?.innerText === newCounterText) {
    return;
  }

  if (existingMessageCharWordCounter) existingMessageCharWordCounter.remove();
  const messageCharWordCounterElement = document.createElement('div');
  messageCharWordCounterElement.id = 'message-char-word-counter';
  messageCharWordCounterElement.classList = 'text-xs text-token-text-tertiary absolute end-0';
  messageCharWordCounterElement.style.bottom = '-32px';
  messageCharWordCounterElement.style.userSelect = 'none';
  messageCharWordCounterElement.textContent = newCounterText;
  message.appendChild(messageCharWordCounterElement);
  // adjust the timestamp position after counter is updated
  const existingMessageTimestamp = message.querySelector('#message-timestamp');
  if (existingMessageTimestamp) {
    existingMessageTimestamp.style.right = `${messageCharWordCounterElement.offsetWidth + 8}px`;
  }
}

// eslint-disable-next-line no-unused-vars
const throttleSetPresentationsWidth = throttle(() => {
  setPresentationsWidth();
}, 300);
function setPresentationsWidth() {
  const presentation = initializePresentation();
  if (!presentation) return;

  if (presentation && sidebarNoteIsOpen) {
    presentation.style.width = `${100 - sidebarNoteInputWrapperWidth}%`;
  } else if (presentation && sidebarFolderIsOpen()) {
    presentation.style.width = `calc(100% - ${sidebarFolderDrawerWidth}px)`;
  }
}
