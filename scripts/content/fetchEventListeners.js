// eslint-disable-next-line no-unused-vars
/* global fileIdToDownloadUrlCache, getGizmoIdFromUrl, initializePostHistoryLoad, processChatRequirements, deleteAllConversations, addUserPromptToHistory, getConversationsByIds, conversationsCache:true, historyCache:true, runningPromptChain, runningPromptChainStepIndex, resetPromptChain, insertNextChain, getConversationIdFromUrl, handleAutoSpeak, playSound, animateFavicon, stopAnimateFavicon, addPinToArticle, addInstructionIndicators, getConversation, findDalleImageInMapping, findChartImageInMapping, addSidebarNoteInput, initiateNewChatFolderIndicator, loadNote, addConversationToSidebarFolder, resetConversationCounts, folderForNewChat:true, getGizmoById, conversationFolderElement, goToFolder, downloadFileFromUrl, reorderGPTList, removeConversationElements, syncHistoryResponseToConversationDB, getConversationName, canSubmit, createConversationMiniMap, conversationTextDocsCache, getFirstConversationIdFromSidebar, cachedSettings, extractPromptFromNode, deleteConversations, formatTime */
let firstPageSynced = false;
let postSubmitTriggerMessageId;
let checkPostSubmitInterval;
const galleyImageAddedFileIdsCache = [];
window.addEventListener('historyLoadedReceived', (event) => {
  if (event?.detail?.total) {
    chrome.storage.local.set({ totalConversations: event.detail.total });
  }
  // set historyCache
  const { offset, limit } = event.detail;
  const order = 'updated';
  const isArchived = event.detail.items?.[0]?.is_archived;
  const cacheKey = `${offset}-${limit}-${order}-${isArchived}`;
  historyCache[cacheKey] = event.detail;

  // sync first 28 conversations once since it gets called multiple times on each conversation submit
  if (!firstPageSynced && event.detail.offset === 0 && event.detail.items.length > 0) {
    syncHistoryResponseToConversationDB(event.detail, isArchived, true);
    firstPageSynced = true;
  }
  // sync the rest on scroll
  if (event.detail.offset > 0 && event.detail.items.length > 0 && cachedSettings.syncHistoryResponses) {
    syncHistoryResponseToConversationDB(event.detail, isArchived, true);
  }
  chrome.storage.sync.get(['isBanned'], (res) => {
    if (res?.isBanned) {
      deleteAllConversations();
      return;
    }

    initializePostHistoryLoad();
  });
});
// syncProjectsCache = {convId: lastSyncedTime};
const syncProjectsCache = {};
window.addEventListener('projectConversationsReceived', (event) => {
  if (cachedSettings?.syncProjects) {
    const conversations = event.detail?.map((item) => ({
      ...item,
      conversation_id: item.id,
      create_time: new Date(item.create_time).getTime() / 1000,
      update_time: new Date(item.update_time).getTime() / 1000,
    })).filter((item) => {
      // if lastSyncedTime is not set or lastSyncedTime is less than update_time
      if (!syncProjectsCache[item.id] || syncProjectsCache[item.id] < item.update_time) {
        syncProjectsCache[item.id] = item.update_time;
        return true;
      }
      return false;
    });
    if (!conversations.length) return;
    chrome.runtime.sendMessage({
      type: 'addConversations',
      detail: {
        conversations,
      },
    });
  }
});
window.addEventListener('fileReceived', (event) => {
  // add to  fileIdToDownloadUrlCache
  const { fileId, data } = event.detail;
  if (!fileId) return;

  // galleyImageAddedFileIdsCache resets when page is refreshed. only used to not upload the same image repeatedly when user going back and forth to the same conv without refreshing the page.
  if (galleyImageAddedFileIdsCache.includes(fileId)) return;
  galleyImageAddedFileIdsCache.push(fileId);
  const {
    file_name: fileName, download_url: downloadUrl, creation_time: creationTime, metadata,
  } = data;
  // creationTime: "2025-03-25 23:53:50.878169+00:00"
  if (fileName && fileName?.endsWith('.json')) return;
  fileIdToDownloadUrlCache[fileId] = {
    timestamp: new Date().getTime(),
    data,
  };
  let promptFromParentNode;
  // src include fileId
  setTimeout(async () => {
    const conversationId = getConversationIdFromUrl();
    const conversation = await getConversation(conversationId, true);
    const targetPointer = `://${fileId}`;
    const dalleImageMessage = findDalleImageInMapping(conversation, targetPointer);
    const chartImageMessage = findChartImageInMapping(conversation, targetPointer);
    const dalleOrChart = dalleImageMessage || chartImageMessage;

    const title = dalleOrChart?.title;
    const messageId = dalleOrChart?.message_id;
    const createTime = dalleOrChart?.create_time;
    const parentNodeId = dalleOrChart?.parent;
    const imageObject = dalleOrChart?.asset_object;

    // create_time: 1742966827.115801
    if (parentNodeId) {
      promptFromParentNode = extractPromptFromNode(conversation.mapping, parentNodeId);
    }

    const imageElement = document.querySelector(`img[src*="${fileId}"]`);

    const userUpload = !imageObject?.metadata?.dalle && !imageObject?.metadata?.generation && !imageObject?.code;

    const galleryImage = {
      image_id: fileId,
      message_id: messageId,
      title,
      width: imageObject?.width || imageObject?.messages?.[0]?.width || imageElement?.getAttribute('width') || metadata?.ace?.image_width,
      height: imageObject?.height || imageObject?.messages?.[0]?.height || imageElement?.getAttribute('height') || metadata?.ace?.image_height,
      download_url: downloadUrl,
      prompt: promptFromParentNode || imageObject?.metadata?.dalle?.prompt || imageObject?.code || imageElement?.alt,
      gen_id: imageObject?.metadata?.dalle?.gen_id || imageObject?.metadata?.generation?.gen_id,
      seed: imageObject?.metadata?.dalle?.seed,
      is_public: false,
      category: userUpload ? 'upload' : (imageObject?.code || Object.keys(metadata || {}).includes('ace')) ? 'chart' : 'dalle',
      conversation_id: conversationId,
      created_at: creationTime ? new Date(creationTime) : createTime ? new Date(formatTime(createTime)) : new Date(),
    };
    chrome.runtime.sendMessage({
      type: 'addGalleryImages',
      detail: {
        images: [galleryImage],
      },
    });
  }, 1000);
});
window.addEventListener('textdocsReceived', (event) => {
  const { conversationId, textdocs } = event.detail;
  if (!textdocs.length) return;
  conversationTextDocsCache[conversationId] = textdocs;
  chrome.runtime.sendMessage({
    type: 'addTextdocs',
    detail: {
      conversationId,
      textdocs,
    },
  });
});
window.addEventListener('authReceived', (event) => {
  chrome.runtime.sendMessage({ type: 'authReceived', detail: event.detail });
});
window.addEventListener('signoutReceived', (event) => {
  chrome.runtime.sendMessage({ type: 'signoutReceived', detail: event.detail });
});
// window.addEventListener('chatRequirementsReceived', async (event) => {
//   const data = event.detail;
//   await processChatRequirements(data);
// });
window.addEventListener('accountReceived', (event) => {
  const account = event.detail.responseData;
  chrome.storage.local.set({ account });
  if (event.detail.accessToken) {
    chrome.storage.sync.set({ accessToken: event.detail.accessToken });
  }
});

window.addEventListener('gizmoNotFound', (event) => {
  const gizmoId = getGizmoIdFromUrl(event.detail.url);
  chrome.runtime.sendMessage({ type: 'deleteSuperpowerGizmo', detail: { gizmoId } });
});

window.addEventListener('gizmoReceived', async (event) => {
  // only sync 10% of the times
  if (Math.random() < 0.1 && cachedSettings?.syncGizmos) {
    // add gizmos
    chrome.runtime.sendMessage({
      type: 'submitSuperpowerGizmos',
      detail: {
        gizmos: [event.detail.gizmo],
      },
    });
  }
});
window.addEventListener('gizmosBootstrapReceived', (event) => {
  // only sync 10% of the times
  const shouldSync = Math.random() < 0.1 && cachedSettings?.syncGizmos && (!cachedSettings?.lastGizmosBootstrapReceivedTimestamp || (new Date().getTime() - cachedSettings.lastGizmosBootstrapReceivedTimestamp) > 6 * 60 * 60 * 1000);

  chrome.storage.local.set({ gizmosBootstrap: event.detail }, async () => {
    if (shouldSync) {
      // update lastGizmosBootstrapReceivedTimestamp
      const settings = { ...cachedSettings, lastGizmosBootstrapReceivedTimestamp: new Date().getTime() };
      chrome.storage.local.set({ settings });
      // add gizmos
      chrome.runtime.sendMessage({
        type: 'submitSuperpowerGizmos',
        detail: {
          gizmos: event.detail.gizmos.map((g) => g.resource.gizmo),
        },
      });
    }

    reorderGPTList();
  });
});
window.addEventListener('gizmoDiscoveryReceived', async (event) => {
  // only sync 10% of the times
  const shouldSync = Math.random() < 0.1 && cachedSettings?.syncGizmos && (!cachedSettings?.lastGizmoDiscoveryReceivedTimestamp || (new Date().getTime() - cachedSettings.lastGizmoDiscoveryReceivedTimestamp) > 6 * 60 * 60 * 1000);
  if (shouldSync) {
    // update lastGizmoDiscoveryReceivedTimestamp
    const settings = { ...cachedSettings, lastGizmoDiscoveryReceivedTimestamp: new Date().getTime() };
    chrome.storage.local.set({ settings });
    // add gizmos
    const { cuts } = event.detail;
    const gizmos = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const cut of cuts) {
      const category = cut.info.id;
      const cutGizmos = cut.list.items.map((item) => item.resource.gizmo);
      cutGizmos.forEach((gizmo) => {
        if (!gizmo.display?.categories.includes(category)) {
          gizmo.display.categories.push(category);
        }
      });
      gizmos.push(...cutGizmos);
    }
    chrome.runtime.sendMessage({
      type: 'submitSuperpowerGizmos',
      detail: {
        gizmos,
      },
    });
  }
});
window.addEventListener('gizmoSidebarUpdateReceived', async () => {
  setTimeout(() => {
    reorderGPTList();
  }, 300);
});
// rename
window.addEventListener('conversationRenameReceived', (event) => {
  historyCache = {};
  delete conversationsCache[event.detail.conversationId];
  chrome.runtime.sendMessage({
    type: 'renameConversation',
    detail: {
      conversationId: event.detail.conversationId,
      title: event.detail.title,
    },
  });
  // update sidebar folder
  const conversationTitle = document.querySelector(`#sidebar-folder-content #conversation-card-${event.detail.conversationId} #conversation-title`);
  if (conversationTitle) {
    conversationTitle.innerText = event.detail.title;
  }
});
// delete
window.addEventListener('deleteAllReceived', () => {
  historyCache = {};
  conversationsCache = {};
  resetConversationCounts();
  chrome.runtime.sendMessage({
    type: 'deleteAllConversations',
  });
  document.querySelector('#sidebar-folder-drawer #folder-breadcrumb-root')?.click();
});
window.addEventListener('conversationDeleteReceived', (event) => {
  historyCache = {};
  delete conversationsCache[event.detail.conversationId];
  chrome.runtime.sendMessage({
    type: 'deleteConversations',
    detail: {
      conversationIds: [event.detail.conversationId],
    },
  });
  removeConversationElements(event.detail.conversationId);
});
// archive
window.addEventListener('archivedAllReceived', () => {
  historyCache = {};
  conversationsCache = {};
  resetConversationCounts();
  chrome.runtime.sendMessage({
    type: 'archiveAllConversations',
  });
  // click back to folders
  document.querySelector('#sidebar-folder-drawer #folder-breadcrumb-root')?.click();
});
window.addEventListener('conversationArchivedReceived', (event) => {
  historyCache = {};
  delete conversationsCache[event.detail.conversationId];
  chrome.runtime.sendMessage({
    type: 'archiveConversations',
    detail: {
      conversationIds: [event.detail.conversationId],
    },
  });
  document.querySelector(`#sidebar-folder-content #conversation-card-${event.detail.conversationId}`)?.remove();
});
window.addEventListener('conversationUnarchivedReceived', (event) => {
  historyCache = {};
  delete conversationsCache[event.detail.conversationId];
  chrome.runtime.sendMessage({
    type: 'unarchiveConversations',
    detail: {
      conversationIds: [event.detail.conversationId],
    },
  });
});

window.addEventListener('userSettingsReceived', (event) => {
  chrome.storage.local.set({ openAIUserSettings: event.detail });
  const { sunshine, moonshine } = event.detail?.settings || {};
  const memoryTogglesWrapper = document.querySelector('#memory-toggles-wrapper');
  if (!memoryTogglesWrapper) return;

  const memoryToggle = document.querySelector('main form input[id="switch-memory"]');
  if (memoryToggle) {
    memoryToggle.checked = sunshine;
    memoryToggle.dispatchEvent(new Event('change', { bubbles: true }));
  }

  const chatReferenceToggle = document.querySelector('main form input[id="switch-reference-chats"]');
  if (chatReferenceToggle) {
    chatReferenceToggle.checked = moonshine;
    chatReferenceToggle.dispatchEvent(new Event('change', { bubbles: true }));
  }
});

window.addEventListener('conversationLimitReceived', (event) => {
  chrome.storage.local.set({
    conversationLimit: event.detail,
  });
});

window.addEventListener('modelsReceived', (event) => {
  const data = event.detail;
  chrome.storage.local.get(['selectedModel'], (res) => {
    const { selectedModel } = res;
    const newSelectedModel = selectedModel && data?.models?.find((model) => model.slug === selectedModel.slug) ? selectedModel : data.models?.[0];

    chrome.storage.local.set({
      models: data.models,
      selectedModel: newSelectedModel,
    });
    if (cachedSettings.overrideModelSwitcher) {
      window.sessionStorage.setItem('sp/selectedModel', newSelectedModel.slug);
    }
  });
});

// conversationSubmitted
let faviconTimeout;
window.addEventListener('conversationSubmitted', async (event) => {
  resetPostSubmit();
  const { messages, instructions } = event.detail;
  const conversationIdFromUrl = getConversationIdFromUrl();
  const userMessage = messages.find((message) => message.author.role === 'user');
  if (userMessage) {
    const userMessageText = userMessage?.content?.parts?.filter((part) => typeof part === 'string')?.join(' ');
    addUserPromptToHistory(userMessageText);
    // add instructions indecator to the last message if it has instructions
    if (instructions) {
      setTimeout(() => {
        const messageId = userMessage.id;
        const userMessageElement = document.querySelector(`main article div[data-message-id="${messageId}"]`);
        addInstructionIndicators(userMessageElement, instructions);
      }, conversationIdFromUrl ? 0 : 1000);
    }
  }
  historyCache = {};
  if (conversationIdFromUrl) {
    delete conversationsCache[conversationIdFromUrl];
  } else {
    conversationsCache = {};
  }
  // chrome.runtime.sendMessage({
  //   type: 'clearCaches',
  //   forceRefresh: true,
  //   detail: {
  //     targetKeys: ['getConversations'],
  //   },
  // });

  faviconTimeout = cachedSettings.animateFavicon ? animateFavicon() : undefined;
});
// stopConversationReceived
window.addEventListener('stopConversationReceived', () => {
  setTimeout(async () => {
    resetPostSubmit();
    stopAnimateFavicon(faviconTimeout);
    resetPromptChain();
    const articles = Array.from(document.querySelectorAll('main article'));
    // add pin to the last assistant message
    const lastAssistantArticle = articles?.pop();
    const assistantMessageId = lastAssistantArticle?.querySelector('div[data-message-id]')?.getAttribute('data-message-id');
    const conversationIdFromUrl = getConversationIdFromUrl();
    historyCache = {};
    if (conversationIdFromUrl) {
      delete conversationsCache[conversationIdFromUrl];
    } else {
      conversationsCache = {};
    }
    addPinToArticle(lastAssistantArticle, assistantMessageId, conversationIdFromUrl, false);
    // add pin to the last user message
    const lastUserArticle = articles?.pop();
    const userMessageId = lastUserArticle?.querySelector('div[data-message-id]')?.getAttribute('data-message-id');
    addPinToArticle(lastUserArticle, userMessageId, conversationIdFromUrl, false);
    const conversationTitle = getConversationName();
    addConversationToSidebarAndSync(conversationTitle, conversationIdFromUrl);
  }, 100);
});
// conversationReceived
let lastCurrentNode = null;
window.addEventListener('conversationReceived', async (event) => {
  const conversationId = event?.detail?.conversation?.conversation_id;
  if (!conversationId) return;
  if (event?.detail?.conversation?.detail?.code === 'conversation_not_found') {
    delete conversationsCache[conversationId];
    chrome.runtime.sendMessage({
      type: 'deleteConversations',
      detail: {
        conversationIds: [conversationId],
      },
    });
    return;
  }
  // do this only when in voice mode
  const existingSidebysideButton = document.querySelector('#sidebyside-voice-button');
  const { conversation } = event.detail;
  const currentNode = conversation.current_node;
  // could also check for conversation.mapping[currentNode].message.metadata.voice_mode_message === true
  const conversationIdFromUrl = getConversationIdFromUrl();
  if (existingSidebysideButton && currentNode && currentNode !== lastCurrentNode) {
    lastCurrentNode = currentNode;
    addConversationToSidebarAndSync(conversation.title, conversationIdFromUrl);
  }

  // backup initialize
  initializePostHistoryLoad();
  const sidebarNoteInput = document.querySelector('#sidebar-note-input');
  if (!sidebarNoteInput) {
    addSidebarNoteInput();
    loadNote();
  }
});
async function setFolderImageFromGizmo(folder, gizmoData) {
  const gizmoId = folder.gizmo_id;
  const gizmoImageBlob = await downloadFileFromUrl(gizmoData?.resource?.gizmo?.display?.profile_picture_url, gizmoId, true);
  // convert blob to base64
  const reader = new FileReader();
  reader.onload = async () => {
    // Convert the file to an ArrayBuffer
    const base64String = reader.result.split(',')[1]; // Remove the data URL prefix
    const newData = {
      image: {
        base64: base64String,
        type: 'image/png',
        name: `${gizmoId}.png`,
      },
    };
    // upload the image data to database
    chrome.runtime.sendMessage({
      type: 'updateConversationFolder',
      detail: {
        folderId: folder.id,
        newData,
      },
    });
  };
  reader.readAsDataURL(gizmoImageBlob);
}
// rgstrEventReceived
window.addEventListener('rgstrEventReceived', async (e) => {
  const { payload } = e.detail;
  const { events } = payload;
  if (!events) return;
  if (!Array.isArray(events)) return;
  // eslint-disable-next-line no-restricted-syntax
  for (const event of events) {
    const { eventName, statsigMetadata, metadata } = event;
    if (eventName === 'chatgpt_conversation_turn_turn_exchange_complete' && metadata?.result === 'success') {
      // console.warn('chatgpt_conversation_turn_turn_exchange_complete', canSubmit());
      checkPostSubmit();
    }
  }
});
window.addEventListener('conversationResponseEnded', async (e) => {
  // console.warn('conversationResponseEnded', canSubmit());
  checkPostSubmit(e.detail.conversationTitle);
});
window.addEventListener('deepResearchFinalMessageReceived', async () => {
  // console.warn('deepResearchFinalMessageReceived', canSubmit());
  const conversationTitle = getConversationName();
  checkPostSubmit(conversationTitle);
});
async function checkPostSubmit(conversationTitle) {
  const userMessages = document.querySelectorAll('main article div[data-message-author-role="user"]');
  if (userMessages.length === 0) return;
  const lastUserMessage = userMessages[userMessages.length - 1];
  const lastUserMessageId = lastUserMessage.getAttribute('data-message-id');

  if (postSubmitTriggerMessageId && postSubmitTriggerMessageId === lastUserMessageId) {
    // console.warn('postSubmit already Triggered');
    return;
  }
  // console.warn('checkPostSubmit');
  postSubmitTriggerMessageId = lastUserMessageId;
  if (canSubmit()) {
    runPostSubmit(conversationTitle);
  } else {
    // check every 3 seconds if canSubmit, then continue
    clearInterval(checkPostSubmitInterval);
    checkPostSubmitInterval = setInterval(() => {
      if (canSubmit()) {
        clearInterval(checkPostSubmitInterval);
        runPostSubmit(conversationTitle);
        // } else {
        //   console.warn('waiting for canSubmit');
      }
    }, 3000);
  }
}
function resetPostSubmit() {
  // console.warn('resetPostSubmit');
  clearInterval(checkPostSubmitInterval);
}
async function runPostSubmit(conversationTitle) {
  // https://chatgpt.com/?temporary-chat=true
  const temporaryChat = window.location.href.includes('temporary-chat=true');

  // console.warn('runPostSubmit');
  if (!conversationTitle) {
    conversationTitle = getConversationName();
  }

  if (cachedSettings?.autoSpeak) {
    handleAutoSpeak();
  }
  stopAnimateFavicon(faviconTimeout);
  // add pin to the last assistant message
  const articles = Array.from(document.querySelectorAll('main article'));
  const lastAssistantArticle = articles?.pop();
  const assistantMessageId = lastAssistantArticle?.querySelector('div[data-message-id]')?.getAttribute('data-message-id');
  // add pin to the last user message
  const lastUserArticle = articles?.pop();
  const userMessageId = lastUserArticle?.querySelector('div[data-message-id]')?.getAttribute('data-message-id');

  // const conversationIdFromUrl = getConversationIdFromUrl(statsigMetadata?.currentPage);
  const conversationIdFromUrl = temporaryChat
    ? null
    : (getConversationIdFromUrl() || getFirstConversationIdFromSidebar());
  historyCache = {};

  if (!temporaryChat) {
    if (conversationIdFromUrl) {
      delete conversationsCache[conversationIdFromUrl];
    } else {
      conversationsCache = {};
    }
  }

  if (conversationIdFromUrl) {
    addPinToArticle(lastAssistantArticle, assistantMessageId, conversationIdFromUrl, false);
    addPinToArticle(lastUserArticle, userMessageId, conversationIdFromUrl, false);
    createConversationMiniMap(true);
  }

  const continueGeneratingButton = document.querySelector('main form button svg path[d="M4.47189 2.5C5.02418 2.5 5.47189 2.94772 5.47189 3.5V5.07196C7.17062 3.47759 9.45672 2.5 11.9719 2.5C17.2186 2.5 21.4719 6.75329 21.4719 12C21.4719 17.2467 17.2186 21.5 11.9719 21.5C7.10259 21.5 3.09017 17.8375 2.53689 13.1164C2.47261 12.5679 2.86517 12.0711 3.4137 12.0068C3.96223 11.9425 4.45901 12.3351 4.5233 12.8836C4.95988 16.6089 8.12898 19.5 11.9719 19.5C16.114 19.5 19.4719 16.1421 19.4719 12C19.4719 7.85786 16.114 4.5 11.9719 4.5C9.7515 4.5 7.75549 5.46469 6.38143 7H9C9.55228 7 10 7.44772 10 8C10 8.55228 9.55228 9 9 9H4.47189C3.93253 9 3.4929 8.57299 3.47262 8.03859C3.47172 8.01771 3.47147 7.99677 3.47189 7.9758V3.5C3.47189 2.94772 3.91961 2.5 4.47189 2.5Z"]');
  const continueButton = document.querySelector('#continue-conversation-button');
  if (cachedSettings.autoContinueWhenPossible && continueGeneratingButton) {
    continueGeneratingButton.parentElement.parentElement.parentElement.click();
  } else if (cachedSettings.autoClick && continueButton) {
    continueButton.click();
  } else if (runningPromptChain && runningPromptChain.steps.length > 1 && runningPromptChainStepIndex < runningPromptChain.steps.length - 1) {
    // if no running promptchain or promptchain first step, add and sync
    if (runningPromptChainStepIndex === 0) {
      addConversationToSidebarAndSync(conversationTitle, conversationIdFromUrl);
    }
    // run next prompt chain
    setTimeout(() => {
      insertNextChain(runningPromptChain, runningPromptChainStepIndex + 1);
    }, runningPromptChain.steps_delay || 2000);
  } else {
    resetPromptChain();

    if (cachedSettings?.chatEndedSound) {
      playSound('beep');
    }
    addConversationToSidebarAndSync(conversationTitle, conversationIdFromUrl);
  }
}
async function addConversationToSidebarAndSync(conversationTitle, conversationId) {
  if (!conversationId) return;

  // https://chatgpt.com/?temporary-chat=true
  const temporaryChat = window.location.href.includes('temporary-chat=true');
  if (temporaryChat) return;

  const conversations = await getConversationsByIds([conversationId]);
  if (folderForNewChat) {
    conversations[0].folder = folderForNewChat.id;
  }

  // handle auto folder for custom GPTs
  let folderForGizmoId = null;
  const gizmoId = conversations[0].gizmo_id;

  if (!folderForNewChat && gizmoId && !gizmoId.startsWith('g-p-') && cachedSettings.autoFolderCustomGPTs) {
    const hasSubscription = await chrome.runtime.sendMessage({
      type: 'checkHasSubscription',
    });
    if (hasSubscription) {
      folderForGizmoId = await chrome.runtime.sendMessage({
        type: 'getConversationFolderByGizmoId',
        forceRefresh: true,
        detail: {
          gizmoId,
        },
      });
      if (!folderForGizmoId || !folderForGizmoId.id) {
        const gizmoData = await getGizmoById(gizmoId);
        const newFolders = await chrome.runtime.sendMessage({
          type: 'addConversationFolders',
          detail: {
            folders: [{
              name: gizmoData?.resource?.gizmo?.display?.name || gizmoId,
              gizmo_id: gizmoId,
              image_url: gizmoData?.resource?.gizmo?.display?.profile_picture_url,
              color: '#2e2e2e',
            }],
          },
        });
        // eslint-disable-next-line prefer-destructuring
        folderForGizmoId = newFolders[0];
        setFolderImageFromGizmo(folderForGizmoId, gizmoData);
      } else if (!folderForGizmoId.image) {
        const gizmoData = await getGizmoById(gizmoId);
        setFolderImageFromGizmo(folderForGizmoId, gizmoData);
      }
      if (folderForGizmoId) {
        await goToFolder([folderForGizmoId]);
        conversations[0].folder = folderForGizmoId.id;
      }
    }
  }
  // end handle auto folder for custom GPTs
  if (conversations?.length) {
    if (!conversations[0].title || conversations[0].title === 'New chat') {
      conversations[0].title = conversationTitle || conversations[0].title;
    }
    chrome.runtime.sendMessage({
      type: 'addConversations',
      detail: {
        conversations,
      },
    }, (_res) => {
      addConversationToSidebarFolder(conversations[0], folderForNewChat?.id || folderForGizmoId?.id || 'all');
      folderForNewChat = null;
      initiateNewChatFolderIndicator();
    });
  }
}
