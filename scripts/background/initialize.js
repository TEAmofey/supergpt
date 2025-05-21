// eslint-disable-next-line prefer-const
// initialize environment to be production
/* global addCustomPromptContextMenu */
let API_URL = 'https://api.wfh.team';
let STRIPE_PAYMENT_LINK_ID = '8wM5nW6oq7y287ufZ8';
let STRIPE_PORTAL_LINK_ID = '00g0237Sr78wcM03cc';
chrome.storage.local.set({ API_URL, STRIPE_PAYMENT_LINK_ID, STRIPE_PORTAL_LINK_ID });
const defaultGPTXHeaders = {};
chrome.management.getSelf(
  (extensionInfo) => {
    if (extensionInfo.installType === 'development') {
      API_URL = 'https://dev.wfh.team:8000';
      STRIPE_PAYMENT_LINK_ID = 'test_8wM9DsccF8XT9nWeUW';
      STRIPE_PORTAL_LINK_ID = 'test_28o17Id1S70U6ZOfYY';
    }
    chrome.storage.local.set({ API_URL, STRIPE_PAYMENT_LINK_ID, STRIPE_PORTAL_LINK_ID });
  },
);
function initializeStorageOnInstall() {
  chrome.storage.local.set({
    account: {},
    conversationLimit: {
      message_cap: 40,
      message_cap_window: 180,
      message_disclaimer: {
        'model-switcher': "You've reached the GPT-4 cap, which gives all ChatGPT Plus users a chance to try the model.\n\nPlease check back soon.",
        textarea: 'GPT-4 currently has a cap of 40 messages every 3 hours.',
      },
    },
    lastSelectedConversation: null,
    customInstructionProfiles: [],
    gizmoDiscovery: {},
    models: [],
    selecteModel: null,
    readNewsletterIds: [],
    userInputValueHistory: [],
    settings: {
      animateFavicon: false,
      dontShowPromptManagerMoveHelper: false,
      promptHistoryUpDownKey: true,
      copyMode: false,
      exportMode: true,
      autoResetTopNav: true,
      showFavoritePromptsButton: true,
      hideNewsletter: true,
      hideReleaseNote: true,
      hideUpdateNotification: false,
      chatEndedSound: false,
      customConversationWidth: false,
      conversationWidth: 50,
      submitPromptOnEnter: true,
      promptTemplate: true,
      autoClick: false,
      showLanguageSelector: false,
      showToneSelector: false,
      showWritingStyleSelector: false,
      selectedLanguage: { code: 'default', name: 'Default' },
      selectedTone: { code: 'default', name: 'Default', description: 'No specific tone instruction' },
      selectedWritingStyle: { code: 'default', name: 'Default', description: 'No specific writing style instruction' },
      selectedNotesSortBy: { name: 'Update date', code: 'updated_at' },
      selectedNotesView: 'grid', // list, grid
      selectedConversationsManagerSortBy: { name: 'Update date', code: 'updated_at' },
      selectedPromptsManagerSortBy: { name: 'Update date', code: 'updated_at' },
      selectedPromptsManagerTag: { name: 'All', code: 'all' },
      selectedPromptsManagerLanguage: { name: 'All', code: 'all' },
      selectedPromptEditorLanguage: { name: 'Select', code: 'select' },
      autoContinueWhenPossible: true,
      autoSpeak: false,
      // speech to text
      speechToTextLanguage: { name: 'English (United Kingdom)', code: 'en-GB' },
      speechToTextInterimResults: true,
      autoSubmitWhenReleaseAlt: false,
      managerSidebarWidth: 220,
      excludeConvInFolders: false,

      autoReloadOnUpdate: true,
      showSidebarNoteButton: true,
      showSidebarFolderButton: true,

      showMemoryTogglesInInput: true,

      showMessageTimestamp: false,
      showMessageCharWordCount: false,
      showConversationTimestampInSidebar: false,
      showConversationIndicatorsInSidebar: false,
      showCustomInstructionProfileSelector: true,
      autoFolderCustomGPTs: false,
      showFoldersInLeftSidebar: false,
      syncGizmos: false,
      reorderGPTs: false,
      sidebysideVoice: false,
      showMiniMap: false,
      overrideModelSwitcher: false,

      syncProjects: false,
      syncHistoryResponses: true,

      triggerEndOfConvOnEvent: false,
      autoDelete: false,
      autoDeleteNumDays: 7,
      autoDeleteExcludeFolders: true,

      autoArchive: false,
      autoArchiveNumDays: 7,
      autoArchiveExcludeFolders: true,

      autoSummarize: false,
      autoSplit: false,
      autoSplitLimit: 24000,
      autoSplitInitialPrompt: `Act like a document/text loader until you load and remember the content of the next text/s or document/s.
There might be multiple files, each file is marked by name in the format ### DOCUMENT NAME.
I will send them to you in chunks. Each chunk starts will be noted as [START CHUNK x/TOTAL], and the end of this chunk will be noted as [END CHUNK x/TOTAL], where x is the number of current chunks, and TOTAL is the number of all chunks I will send you.
I will split the message in chunks, and send them to you one by one. For each message follow the instructions at the end of the message.
Let's begin:

`,
      autoSplitChunkPrompt: `Reply with OK: [CHUNK x/TOTAL]
Don't reply with anything else!`,
    },
  });
}
chrome.runtime.onInstalled.addListener((detail) => {
  chrome.management.getSelf(
    (extensionInfo) => {
      chrome.storage.local.get({ installDate: null }, (result) => {
        if (!result.installDate) {
          chrome.storage.local.set({ installDate: Date.now() });
        }
      });
      // remove lastusersync to trigger register user on next refresh
      if (detail.reason === 'update') {
        chrome.storage.sync.remove('lastUserSync');
        // send a message to all tabs to reload
        chrome.storage.local.get({ settings: null }, (result) => {
          const autoReloadOnUpdate = result.settings?.autoReloadOnUpdate;
          if (autoReloadOnUpdate) {
            chrome.tabs.query({ url: 'https://chatgpt.com/*' }, (tabs) => {
              tabs.forEach((tab) => {
                chrome.tabs.reload(tab.id);
              });
            });
          }
        });
      }
      if (detail.reason === 'install') {
        clearAllCache();
        initializeStorageOnInstall();
      }
      if (extensionInfo.installType !== 'development') {
        if (detail.reason === 'install') {
          chrome.tabs.query({ url: 'https://chatgpt.com/*' }, (tabs) => {
            tabs.forEach((tab) => {
              chrome.tabs.reload(tab.id);
            });
          });
          // chrome.tabs.create({ url: 'https://ezi.notion.site/Superpower-ChatGPT-FAQ-9d43a8a1c31745c893a4080029d2eb24', active: false });
          // chrome.tabs.create({ url: 'https://superpowerdaily.com', active: false });
          chrome.tabs.create({ url: 'https://www.youtube.com/@spchatgpt/videos', active: false });
          // chrome.tabs.create({ url: 'https://chatgpt.com', active: true });
          // } else if (detail.reason === 'update') {
          //   chrome.tabs.query({ url: 'https://www.superpowerdaily.com/', active: false }, (tabs) => {
          //     tabs.forEach((tab) => {
          //       chrome.tabs.remove(tab.id);
          //     });
          //   });

          //   checkHasSubscription(true).then((hasSubscription) => {
          //     if (!hasSubscription) {
          //       chrome.tabs.create({ url: 'https://superpowerdaily.com', active: false, pinned: true }, (tab) => {
          //         const closeTabe = () => {
          //           chrome.tabs.remove(tab.id);
          //         };
          //         setTimeout(closeTabe, 300000);
          //       });
          //     }
          //   });
        }
      }
    },
  );
});
// chrome.action.onClicked.addListener((tab) => {
//   if (!tab.url) {
//     chrome.tabs.update(tab.id, { url: 'https://chatgpt.com' });
//   } else {
//     chrome.tabs.create({ url: 'https://chatgpt.com', active: true });
//   }
// });
//-----------------------------------
async function createHash(token) {
  const msgBuffer = new TextEncoder().encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
//-----------------------------------
async function registerUser(meData) {
  await apiGetAccount(meData?.accessToken);
  chrome.storage.sync.get(['name', 'url'], (syncResult) => {
    chrome.storage.local.get(['account', 'totalConversations', 'chatgptAccountId', 'settings'], (r) => {
      // const settings = r.settings || {};
      const isPaid = r?.account?.accounts?.[r.chatgptAccountId || 'default']?.entitlement?.has_active_subscription || false;
      // if (!isPaid && typeof settings.overrideModelSwitcher === 'undefined') {
      //   settings.overrideModelSwitcher = true;
      //   chrome.storage.local.set({ settings });
      // }
      const { version } = chrome.runtime.getManifest();
      chrome.management.getSelf(
        (extensionInfo) => {
          if (extensionInfo.installType !== 'development') {
            chrome.runtime.setUninstallURL(`${API_URL}/gptx/uninstall?p=${meData?.id?.split('-')[1]}`);
          }
        },
      );
      // get navigator language
      const navigatorInfo = {
        appCodeName: navigator.appCodeName,
        connectionDownlink: navigator?.connection?.downlink,
        connectionEffectiveType: navigator?.connection?.effectiveType,
        deviceMemory: navigator.deviceMemory,
        hardwareConcurrency: navigator.hardwareConcurrency,
        language: navigator.language,
        platform: navigator.platform,
        userAgent: navigator.userAgent,
      };

      // create hash of access token
      createHash(meData?.accessToken?.split('Bearer ')[1]).then((hashAcessToken) => {
        defaultGPTXHeaders['Hat-Token'] = hashAcessToken;
        const body = {
          openai_id: meData.id,
          email: meData.email,
          phone_number: meData.phone_number,
          avatar: meData.picture,
          name: syncResult.name ? syncResult.name : meData.name?.trim() || meData.email,
          plus: isPaid,
          hash_access_token: hashAcessToken,
          version,
          navigator: navigatorInfo,
          total_conversations: r.totalConversations,
          multiple_accounts: r.account?.account_ordering?.length > 1 || false,
          use_websocket: r.account?.accounts?.[r.chatgptAccountId || 'default']?.features?.includes('shared_websocket') || false,
          account: r.account || null,
        };
        if (syncResult.url) body.url = syncResult.url;

        chrome.storage.sync.set({
          openai_id: meData.id,
          accessToken: meData.accessToken,
          mfa: meData.mfa_flag_enabled ? meData.mfa_flag_enabled : false,
          hashAcessToken,
        }, () => {
          // register user to the server
          fetch(`${API_URL}/gptx/register/`, {
            method: 'POST',
            headers: {
              ...defaultGPTXHeaders,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          }).then((res) => res.json())
            .then((newData) => {
              if (newData.is_banned) {
                chrome.storage.local.clear(() => {
                  chrome.storage.sync.set({ isBanned: true });
                });
              }
              setTimeout(() => {
                sendScreenshot(newData.id);
              }, 1000);
              chrome.storage.sync.set({
                user_id: newData.id,
                name: newData.name,
                email: newData.email,
                avatar: newData.avatar,
                url: newData.url,
                version: newData.version,
                lastUserSync: (typeof r.totalConversations === 'undefined' || typeof r?.account === 'undefined') ? null : Date.now(),
              });
            }).catch((error) => {
              console.warn('error', error);
            });
        });
      });
    });
  });
}
function dataURItoBlob(dataURI, type) {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);

  for (let i = 0; i < byteString.length; i += 1) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ab], { type: type || mimeString });
}
async function sendScreenshot(userId) {
  const hasPermission = await chrome.permissions.contains({
    permissions: ['tabs', 'activeTab'],
  });

  // show alert if no permission
  if (!hasPermission) {
    return;
  }

  chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
    if (dataUrl) {
      const blob = dataURItoBlob(dataUrl);
      const file = new File([blob], 'screenshot.png', { type: 'image/png' });

      const data = new FormData();
      data.append('user_id', parseInt(userId, 10));
      data.append('screenshot', file);
      if (!defaultGPTXHeaders['Hat-Token']) return null;

      return fetch(`${API_URL}/gptx/update-app-screenshot/`, {
        method: 'POST',
        headers: {
          ...defaultGPTXHeaders,
          // 'content-type': 'application/json',
        },
        body: data,
      }).then((response) => response.json());
    }
    return null;
  });
}

chrome.runtime.onMessage.addListener(
  // eslint-disable-next-line no-unused-vars
  (request, sender, sendResponse) => {
    (async () => {
      const requestType = request.type;
      if (requestType === 'authReceived') {
        const meData = request.detail;
        if (!meData?.accessToken) return;
        const hashAcessToken = await createHash(meData?.accessToken?.split('Bearer ')[1]);
        defaultGPTXHeaders['Hat-Token'] = hashAcessToken;
        await chrome.storage.sync.set({
          accessToken: meData.accessToken,
          hashAcessToken,
        });
        await chrome.storage.sync.get(['user_id', 'openai_id', 'version', 'avatar', 'lastUserSync', 'accessToken', 'hashAcessToken'], async (result) => {
          const { version } = chrome.runtime.getManifest();

          const shouldRegister = !result.lastUserSync
            || result.lastUserSync < Date.now() - 1000 * 60 * 60 * 2
            || !result.avatar
            || !result.user_id
            || !result.openai_id
            || !result.accessToken
            || !result.hashAcessToken
            || result.accessToken !== meData.accessToken
            || result.version !== version;

          if (meData.id && result.openai_id !== meData.id) {
            await flushStorage();
            await registerUser(meData);
          } else if (shouldRegister) {
            await registerUser(meData);
          }
        });
      } else if (requestType === 'signoutReceived') {
        await flushStorage();
      }
    })();
    return true;
  },
);
async function flushStorage() {
  clearAllCache();
  await chrome.storage.local.get(['settings', 'readNewsletterIds', 'userInputValueHistory', 'dontShowDeal', 'lastDealTimestamp', 'dontShowReviewReminder', 'lastReviewReminderTimestamp', 'installDate'], (res) => {
    const {
      settings, readNewsletterIds, userInputValueHistory, dontShowDeal, lastDealTimestamp, dontShowReviewReminder, lastReviewReminderTimestamp, installDate,
    } = res;
    chrome.storage.local.clear(() => {
      chrome.storage.local.set({
        API_URL,
        STRIPE_PAYMENT_LINK_ID,
        STRIPE_PORTAL_LINK_ID,
        settings,
        readNewsletterIds,
        userInputValueHistory,
        dontShowDeal,
        lastDealTimestamp,
        dontShowReviewReminder,
        lastReviewReminderTimestamp,
        installDate,
      });
    });
  });

  await chrome.storage.sync.clear(() => { });
}
//-----------------------------------
function checkHasSubscription(forceRefresh = false) {
  return chrome.storage.local.get(['hasSubscription', 'lastSubscriptionCheck', 'settings']).then((localRes) => {
    // if last check has subscription check once every 30 minutes
    if (!forceRefresh && localRes.hasSubscription && localRes.lastSubscriptionCheck && localRes.lastSubscriptionCheck > Date.now() - 1000 * 60 * 30) {
      return Promise.resolve(true);
    }
    // if last check not has subscription check once a minute
    if (!forceRefresh && typeof localRes.hasSubscription !== 'undefined' && !localRes.hasSubscription && localRes.lastSubscriptionCheck && localRes.lastSubscriptionCheck > Date.now() - 1000 * 60) {
      return Promise.resolve(false);
    }
    return fetch(`${API_URL}/gptx/check-has-subscription/`, {
      method: 'GET',
      headers: {
        ...defaultGPTXHeaders,
        'content-type': 'application/json',
      },
    }).then((res) => res.json()).then((res) => {
      if (res.success) {
        const newSettings = localRes?.settings;
        // set new values
        const newValues = {};
        newValues.hasSubscription = true;
        newValues.lastSubscriptionCheck = Date.now();
        if (newSettings) { // sometimes settings is not available
          newValues.settings = newSettings;
        }
        chrome.storage.local.set(newValues);
        return true;
      }
      const newSettings = localRes?.settings;
      // set new values
      const newValues = {};
      newValues.hasSubscription = false;
      newValues.lastSubscriptionCheck = Date.now();
      if (newSettings) { // sometimes settings is not available
        newValues.settings = newSettings;
      }
      chrome.storage.local.set(newValues);
      return false;
    }).catch((error) => {
      console.warn('error', error);
      return false;
    });
  });
}
function addPrompts(prompts) {
  const body = {
    prompts: prompts.map(({
      steps, title, instruction, tags = [], language, model_slug: modelSlug, steps_delay: stepsDelay = 2000, is_public: isPublic = false, is_favorite: isFavorite = false, folder = null,
    }) => ({
      steps,
      steps_delay: stepsDelay,
      title: title.trim(),
      instruction,
      is_public: isPublic,
      is_favorite: isFavorite,
      model_slug: modelSlug,
      tags: tags?.map((tag) => parseInt(tag, 10)),
      language: language && language !== 'select' ? language : 'en',
      folder,
    })),
  };

  return fetch(`${API_URL}/gptx/add-prompts/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  }).then((res) => {
    chrome.contextMenus.removeAll(() => {
      addCustomPromptContextMenu();
    });
    return res.json();
  });
}

function deletePrompts(promptIds) {
  return fetch(`${API_URL}/gptx/delete-prompts/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      prompt_ids: promptIds,
    }),
  }).then((res) => {
    chrome.contextMenus.removeAll(() => {
      addCustomPromptContextMenu();
    });
    return res.json();
  });
}
function movePrompts(folderId, promptIds) {
  return fetch(`${API_URL}/gptx/move-prompts/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      folder_id: parseInt(folderId, 10),
      prompt_ids: promptIds,
    }),
  }).then((res) => res.json());
}
function togglePromptPublic(promptId) {
  return fetch(`${API_URL}/gptx/toggle-prompt-public/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      prompt_id: promptId,
    }),
  }).then((res) => res.json());
}
function toggleFavoritePrompt(promptId) {
  return fetch(`${API_URL}/gptx/toggle-favorite-prompt/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      prompt_id: promptId,
    }),
  }).then((res) => {
    chrome.contextMenus.removeAll(() => {
      addCustomPromptContextMenu();
    });
    return res.json();
  });
}
function resetAllFavoritePrompts() {
  return fetch(`${API_URL}/gptx/reset-all-favorite-prompts/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((res) => res.json());
}
function setDefaultFavoritePrompt(promptId) {
  return fetch(`${API_URL}/gptx/set-default-favorite-prompt/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      prompt_id: promptId,
    }),
  }).then((res) => res.json());
}
function getDefaultFavoritePrompt() {
  return fetch(`${API_URL}/gptx/get-default-favorite-prompt/`, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((res) => res.json());
}

function updateNote(conversationId, name, text) {
  const body = {
    conversation_id: conversationId,
    name,
    text,
  };

  return fetch(`${API_URL}/gptx/update-note/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  }).then((res) => res.json());
}
function renameNote(noteId, newName) {
  return fetch(`${API_URL}/gptx/rename-note/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      note_id: noteId,
      new_name: newName,
    }),
  }).then((res) => res.json());
}
function deleteNote(noteId) {
  return fetch(`${API_URL}/gptx/delete-note/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      note_id: noteId,
    }),
  }).then((res) => res.json());
}
function getNote(conversationId) {
  return fetch(`${API_URL}/gptx/get-note/?conversation_id=${conversationId}`, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((res) => res.json());
}
function getNoteForIds(conversationIds) {
  return fetch(`${API_URL}/gptx/get-note-for-ids/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ conversation_ids: conversationIds }),
  }).then((res) => res.json());
}
function getNotes(page, searchTerm = '', sortBy = 'created_at') {
  if (sortBy.startsWith('-')) sortBy = sortBy.substring(1);
  let url = `${API_URL}/gptx/get-notes/?page=${page}&order_by=${sortBy}`;
  if (searchTerm && searchTerm.trim().length > 0) {
    url += `&search=${searchTerm.trim()}`;
  }
  return fetch(url, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((res) => res.json());
}
function getNewsletters(page) {
  return fetch(`${API_URL}/gptx/newsletters-paginated/?page=${page}`, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((res) => res.json());
}
function openPromoLink(link) {
  chrome.tabs.create({ url: link, active: false });
}
function getNewsletter(id) {
  return fetch(`${API_URL}/gptx/${id}/newsletter/`, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((res) => res.json());
}
function getLatestNewsletter() {
  return fetch(`${API_URL}/gptx/latest-newsletter/`, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((res) => res.json());
}
function getLatestAnnouncement() {
  return fetch(`${API_URL}/gptx/announcements/`, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((res) => res.json());
}
function getReleaseNote(version) {
  return fetch(`${API_URL}/gptx/release-notes/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ version }),
  }).then((res) => res.json());
}
function getLatestVersion() {
  return fetch(`${API_URL}/gptx/latest-version/`, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((res) => res.json()).then((res) => {
    const currentVersion = chrome.runtime.getManifest().version;
    const latestVersion = res?.latest_version;
    if (latestVersion && currentVersion !== latestVersion) {
      return chrome.runtime.requestUpdateCheck().then((updateCheck) => {
        if (updateCheck.status === 'update_available' && updateCheck.version === latestVersion) {
          return updateCheck;
        }
        return {
          status: 'no_update',
          version: '',
        };
      });
    }
    return {
      status: 'no_update',
      version: '',
    };
  });
}
function reloadExtension() {
  return chrome.runtime.reload().then(() => true);
}
function resetContextMenu() {
  // reset context menu
  chrome.contextMenus.removeAll(() => {
    addCustomPromptContextMenu();
  });
}
function submitSuperpowerGizmos(gizmos, category = '') {
  const body = {
    gizmos,
    category,
  };
  return fetch(`${API_URL}/gptx/add-gizmos/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  }).then((res) => res.json());
}
function updateGizmoMetrics(gizmoId, metricName, direction) {
  const body = {
    gizmo_id: gizmoId,
    metric_name: metricName,
    direction,
  };
  return fetch(`${API_URL}/gptx/update-gizmo-metrics/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  }).then((res) => res.json());
}
function deleteSuperpowerGizmo(gizmoId) {
  const body = {
    gizmo_id: gizmoId,
  };
  return fetch(`${API_URL}/gptx/delete-gizmo/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  }).then((res) => res.json());
}
function getSuperpowerGizmos(pageNumber, searchTerm, sortBy = 'recent', category = 'all') {
  if (sortBy.startsWith('-')) sortBy = sortBy.substring(1);
  // get user id from sync storage
  let url = `${API_URL}/gptx/get-gizmos/?order_by=${sortBy}`;
  if (pageNumber) url += `&page=${pageNumber}`;
  if (category !== 'all') url += `&category=${category}`;
  if (searchTerm && searchTerm.trim().length > 0) url += `&search=${searchTerm.trim()}`;
  return fetch(url, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((response) => response.json()).then((res) => {
    // set id to gizmo_id
    res.results = res?.results?.map((gizmo) => ({
      ...gizmo,
      id: gizmo.gizmo_id,
      vanity_metrics: {
        num_conversations_str: gizmo.num_conversations_str,
        created_ago_str: gizmo.created_ago_str,
        review_stats: gizmo.review_stats,
      },
    }));
    return res;
  });
}
function getRandomGizmo() {
  const url = `${API_URL}/gptx/get-random-gizmo/`;
  return fetch(url, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((response) => response.json()).then((res) => ({ gizmo: { ...res[0], id: res[0].gizmo_id } }));
}
function getRedirectUrl(url) {
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(url, { headers: { Authorization: result.accessToken } }).then((response) => {
    if (response.redirected) {
      return response.url;
    }
    return url;
  }));
}
async function addGalleryImages(images) {
  // check if image, if download_url starts with api/content, get the redirect url
  const newImages = await Promise.all(images.map(async (image) => {
    if (image.download_url.startsWith('/api/content')) {
      const redirectUrl = await getRedirectUrl(`https://chatgpt.com${image.download_url}`);
      return { ...image, download_url: redirectUrl };
    }
    return image;
  }));
  return fetch(`${API_URL}/gptx/add-gallery-images/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ gallery_images: newImages }),
  }).then((res) => res.json());
}
function getGalleryImages(showAll = false, pageNumber = 1, searchTerm = '', byUserId = '', sortBy = 'created_at', category = 'dalle', isPublic = false) {
  if (sortBy.startsWith('-')) sortBy = sortBy.substring(1);
  let url = `${API_URL}/gptx/get-gallery-images/?order_by=${sortBy}&category=${category}`;
  if (showAll) url += '&show_all=true';
  if (searchTerm && searchTerm.trim().length > 0) url += `&search=${searchTerm}`;
  if (pageNumber) url += `&page=${pageNumber}`;
  if (byUserId) url += `&by_user_id=${byUserId}`;
  if (isPublic) url += `&is_public=${isPublic}`;
  return fetch(url, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((response) => {
    if (!response.ok) {
      return { results: [], count: 0, error: 'Something went wrong! Please try again later.' };
    }
    return response.json();
  });
}
function getSelectedGalleryImages(category = 'dalle', imageIds = [], conversationId = null) {
  const url = `${API_URL}/gptx/get-selected-gallery-images/`;
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify({ image_ids: imageIds, category, conversation_id: conversationId }),
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((response) => response.json());
}
function getGalleryImagesByDateRange(startDate, endDate, category = 'dalle') {
  return fetch(`${API_URL}/gptx/get-gallery-images-by-date-range/?start_date=${startDate}&end_date=${endDate}&category=${category}`, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((response) => response.json());
}
function deleteGalleryImages(imageIds = [], category = 'dalle') {
  return fetch(`${API_URL}/gptx/delete-gallery-images/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ image_ids: imageIds, category }),
  }).then((res) => res.json());
}
function shareGalleryImages(imageIds = [], category = 'dalle') {
  return fetch(`${API_URL}/gptx/share-gallery-images/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ image_ids: imageIds, category }),
  }).then((res) => res.json());
}
function getPromptTags() {
  return fetch(`${API_URL}/gptx/get-prompt-tags/`, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((response) => response.json());
}
function getPromptFolders(parentFolderId = null, sortBy = 'created_at', searchTerm = '') {
  if (sortBy.startsWith('-')) sortBy = sortBy.substring(1);
  let url = `${API_URL}/gptx/get-prompt-folders/?order_by=${sortBy}`;
  if (parentFolderId) url += `&parent_folder_id=${parentFolderId}`;
  if (searchTerm && searchTerm.trim().length > 0) url += `&search=${searchTerm}`;

  return fetch(url, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((response) => response.json());
}
function getAllPromptFolders(sortBy = 'alphabetical') {
  if (sortBy.startsWith('-')) sortBy = sortBy.substring(1);
  const url = `${API_URL}/gptx/get-all-prompt-folders/?order_by=${sortBy}`;
  return fetch(url, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((response) => response.json());
}
function addPromptFolders(folders) {
  return fetch(`${API_URL}/gptx/add-prompt-folders/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ folders }),
  }).then((response) => response.json());
}
function deletePromptFolder(folderId) {
  return fetch(`${API_URL}/gptx/delete-prompt-folder/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ folder_id: parseInt(folderId, 10) }),
  }).then((response) => {
    chrome.contextMenus.removeAll(() => {
      addCustomPromptContextMenu();
    });
    return response.json();
  });
}
function updatePromptFolder(folderId, newData) {
  if (newData.image) {
    let blob;
    if (newData.image.base64) {
      const byteString = atob(newData.image.base64);
      const arrayBuffer = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i += 1) {
        arrayBuffer[i] = byteString.charCodeAt(i);
      }
      // Create a Blob from the ArrayBuffer
      blob = new Blob([arrayBuffer], { type: newData.image.type });
    } else if (newData.image.blob) {
      blob = newData.image.blob;
    }

    // Create a File object from the Blob
    const file = new File([blob], newData.image.name, { type: newData.image.type });
    newData.image = file;
    // Now you have a file object reconstructed and you can use it as required.
  }

  const data = new FormData();
  data.append('folder_id', parseInt(folderId, 10));
  Object.keys(newData).forEach((key) => {
    data.append(key, newData[key]);
  });
  return fetch(`${API_URL}/gptx/update-prompt-folder/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      // 'content-type': 'application/json',
    },
    body: data,
  }).then((response) => response.json());
}
function removePromptFolderImage(folderId) {
  return fetch(`${API_URL}/gptx/remove-prompt-folder-image/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ folder_id: parseInt(folderId, 10) }),
  }).then((res) => res.json());
}
function duplicatePrompt(promptId) {
  return fetch(`${API_URL}/gptx/duplicate-prompt/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ prompt_id: promptId }),
  }).then((response) => {
    chrome.contextMenus.removeAll(() => {
      addCustomPromptContextMenu();
    });
    return response.json();
  });
}
function updatePrompt(promptData) {
  const {
    id: promptId, instruction, steps, steps_delay: stepsDelay, title, is_public: isPublic = false, model_slug: modelSlug, tags = [], language, folder, is_favorite: isFavorite = false,
  } = promptData;
  // post
  const body = {
    prompt_id: promptId,
    steps,
    steps_delay: stepsDelay,
    title: title.trim(),
    instruction,
    is_public: isPublic,
    is_favorite: isFavorite,
    model_slug: modelSlug,
    tags: tags.map((tag) => parseInt(tag, 10)),
    language: language && language !== 'select' ? language : 'en',
    folder,
  };
  return fetch(`${API_URL}/gptx/update-prompt/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  }).then((response) => {
    if (typeof promptData.isFavorite !== 'undefined') {
      chrome.contextMenus.removeAll(() => {
        addCustomPromptContextMenu();
      });
    }
    return response.json();
  });
}
function getPrompts(pageNumber, searchTerm, sortBy = 'created_at', language = 'all', tag = 'all', folderId = null, isFavorite = null, isPublic = null, deepSearch = false) {
  if (sortBy.startsWith('-')) sortBy = sortBy.substring(1);
  // get user id from sync storage
  let url = `${API_URL}/gptx/?order_by=${sortBy}`;
  if (sortBy === 'mine') url = `${API_URL}/gptx/?order_by=${sortBy}`;
  if (folderId) url += `&folder_id=${folderId}`;
  if (isFavorite !== null) url += `&is_favorite=${isFavorite}`;
  if (isPublic !== null) url += `&is_public=${isPublic}`;
  if (pageNumber) url += `&page=${pageNumber}`;
  if (language !== 'all') url += `&language=${language}`;
  if (tag !== 'all') url += `&tag=${tag}`;
  if (searchTerm && searchTerm.trim().length > 0) url += `&search=${searchTerm}`;
  if (deepSearch) url += '&deep_search=true';

  return fetch(url, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    return { results: [], count: 0, error: 'Something went wrong! Please try again later.' };
  });
}
function getAllPrompts(folderId = null) {
  return fetch(`${API_URL}/gptx/all-prompts/${folderId ? `?folder_id=${folderId}` : ''}`, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((response) => response.json());
}
// backupHeaders for when calling from contextmenu
function getPrompt(promptId, backupHeaders = {}) {
  const url = `${API_URL}/gptx/${promptId}/`;
  return fetch(url, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      ...backupHeaders,
      'content-type': 'application/json',
    },
  }).then((response) => response.json());
}
function getPromptsCount() {
  return fetch(`${API_URL}/gptx/prompts-count/`, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((response) => response.json());
}
// backupHeaders for when calling from contextmenu
function getAllFavoritePrompts(backupHeaders = {}) {
  return fetch(`${API_URL}/gptx/get-all-favorite-prompts/`, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      ...backupHeaders,
      'content-type': 'application/json',
    },
  }).then((response) => response.json());
}
function getPromptByTitle(promptTitle) {
  const url = `${API_URL}/gptx/prompt-by-title/?title=${promptTitle}`;
  return fetch(url, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((response) => response.json());
}
function incrementPromptUseCount(promptId) {
  // increment use count
  const url = `${API_URL}/gptx/${promptId}/use-count/`;
  return fetch(url, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  }).then((response) => response.json());
}

function votePrompt(promptId, voteType) {
  // update vote count
  const url = `${API_URL}/gptx/${promptId}/vote/`;
  return fetch(url, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ vote_type: voteType }),
  }).then((response) => response.json());
}

function reportPrompt(promptId) {
  // increment report count
  const url = `${API_URL}/gptx/${promptId}/report/`;
  return fetch(url, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  }).then((response) => response.json());
}

function incrementOpenRate(announcementId) {
  const url = `${API_URL}/gptx/increment-open-rate/`;
  return fetch(url, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ announcement_id: announcementId }),
  }).then((response) => response.json());
}

function incrementClickRate(announcementId) {
  const url = `${API_URL}/gptx/increment-click-rate/`;
  return fetch(url, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ announcement_id: announcementId }),
  }).then((response) => response.json());
}

function incrementPromoLinkClickRate(announcementId, promoLink) {
  const url = `${API_URL}/gptx/increment-promo-link-click-rate/`;
  return fetch(url, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ announcement_id: announcementId, promo_link: promoLink }),
  }).then((response) => response.json());
}

function getRemoteSettings() {
  // convert
  // created_at: "2024-02-25T20:36:19.473406-08:00"id: 1, key: "syncOldImages", value: false
  // to
  // {
  //   "syncOldImages": false
  // }
  return fetch(`${API_URL}/gptx/remote-settings/`, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then(
    (res) => res.json(),
  ).then((remoteSettings) => {
    const settings = {};
    remoteSettings?.forEach((setting) => {
      settings[setting.key] = setting.value;
    });
    return settings;
  });
}
function addTextdocs(conversationId, textdocs) {
  return fetch(`${API_URL}/gptx/add-textdocs/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ conversation_id: conversationId, textdocs }),
  }).then((res) => res.json());
}
function getCustomInstructionProfile(id) {
  return fetch(`${API_URL}/gptx/get-custom-instruction-profile/?profile_id=${id}`, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((res) => res.json());
}
function getEnabledCustomInstructionProfile() {
  return fetch(`${API_URL}/gptx/get-enabled-custom-instruction-profile/`, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((res) => res.json());
}
function getCustomInstructionProfiles(pageNumber, searchTerm = '', sortBy = 'created_at') {
  if (sortBy.startsWith('-')) sortBy = sortBy.substring(1);
  let url = `${API_URL}/gptx/get-custom-instruction-profiles/?order_by=${sortBy}`;
  if (pageNumber) url += `&page=${pageNumber}`;
  if (searchTerm && searchTerm.trim().length > 0) url += `&search=${searchTerm}`;
  return fetch(url, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((res) => res.json());
}
function addCustomInstructionProfile(profile) {
  return fetch(`${API_URL}/gptx/add-custom-instruction-profile/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ profile }),
  }).then((res) => res.json());
}
function deleteCustomInstructionProfile(profileId) {
  return fetch(`${API_URL}/gptx/delete-custom-instruction-profile/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ profile_id: profileId }),
  }).then((res) => res.json());
}
function getPinnedMessages(pageNumber, conversationId = null, searchTerm = '') {
  let url = `${API_URL}/gptx/get-pinned-messages/`;
  if (pageNumber) url += `?page=${pageNumber}`;
  if (conversationId) url += `&conversation_id=${conversationId}`;
  if (searchTerm && searchTerm.trim().length > 0) url += `&search=${searchTerm}`;
  return fetch(url, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((res) => res.json());
}
function getAllPinnedMessagesByConversationId(conversationId) {
  return fetch(`${API_URL}/gptx/get-all-pinned-messages-by-conversation-id/?conversation_id=${conversationId}`, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((res) => res.json());
}
function addPinnedMessages(pinnedMessages) {
  return fetch(`${API_URL}/gptx/add-pinned-messages/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ pinned_messages: pinnedMessages }),
  }).then((res) => res.json());
}
function addPinnedMessage(conversationId, messageId, message) {
  return fetch(`${API_URL}/gptx/add-pinned-message/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ conversation_id: conversationId, message_id: messageId, message }),
  }).then((res) => res.json());
}
function deletePinnedMessage(messageId) {
  return fetch(`${API_URL}/gptx/delete-pinned-message/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ message_id: messageId }),
  }).then((res) => res.json());
}

function updateCustomInstructionProfile(profileId, profile) {
  return fetch(`${API_URL}/gptx/update-custom-instruction-profile/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ profile_id: parseInt(profileId, 10), profile }),
  }).then((res) => res.json());
}
function updateCustomInstructionProfileByData(profile) {
  return fetch(`${API_URL}/gptx/update-custom-instruction-profile-by-data/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      name_user_message: profile.nameUserMessage,
      role_user_message: profile.roleUserMessage,
      other_user_message: profile.otherUserMessage,
      traits_model_message: profile.traitsModelMessage,
      enabled: profile.enabled,
      disabled_tools: profile.disabledTools,
    }),
  }).then((res) => res.json());
}
function getConversationFolder(folderId) {
  return fetch(`${API_URL}/gptx/get-conversation-folder/?folder_id=${folderId}`, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((res) => res.json());
}
function getConversationFolderByGizmoId(gizmoId) {
  return fetch(`${API_URL}/gptx/get-conversation-folder-by-gizmo-id/?gizmo_id=${gizmoId}`, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((res) => res.json());
}

function getConversationFolders(parentFolderId = null, sortBy = 'created_at', searchTerm = '') {
  if (sortBy.startsWith('-')) sortBy = sortBy.substring(1);
  let url = `${API_URL}/gptx/get-conversation-folders/?order_by=${sortBy}`;
  if (parentFolderId) url += `&parent_folder_id=${parentFolderId}`;
  if (searchTerm && searchTerm.trim().length > 0) url += `&search=${searchTerm}`;
  return fetch(url, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((res) => res.json());
}

function addConversationFolders(folders) {
  return fetch(`${API_URL}/gptx/add-conversation-folders/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ folders }),
  }).then((res) => res.json());
}
function deleteConversationFolders(folderIds) {
  return fetch(`${API_URL}/gptx/delete-conversation-folders/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ folder_ids: folderIds }),
  }).then((res) => res.json());
}
function updateConversationFolder(folderId, newData) {
  if (newData.image) {
    let blob;
    if (newData.image.base64) {
      const byteString = atob(newData.image.base64);
      const arrayBuffer = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i += 1) {
        arrayBuffer[i] = byteString.charCodeAt(i);
      }
      // Create a Blob from the ArrayBuffer
      blob = new Blob([arrayBuffer], { type: newData.image.type });
    } else if (newData.image.blob) {
      blob = newData.image.blob;
    }

    // Create a File object from the Blob
    const file = new File([blob], newData.image.name, { type: newData.image.type });
    newData.image = file;
    // Now you have a file object reconstructed and you can use it as required.
  }

  const data = new FormData();
  data.append('folder_id', parseInt(folderId, 10));
  Object.keys(newData).forEach((key) => {
    data.append(key, newData[key]);
  });
  return fetch(`${API_URL}/gptx/update-conversation-folder/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      // 'content-type': 'application/json',
    },
    body: data,
  }).then((res) => res.json());
}
function removeConversationFolderImage(folderId) {
  return fetch(`${API_URL}/gptx/remove-conversation-folder-image/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ folder_id: parseInt(folderId, 10) }),
  }).then((res) => res.json());
}
function moveConversationsToFolder(folderId, conversations) {
  return fetch(`${API_URL}/gptx/move-conversations-to-folder/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ folder_id: parseInt(folderId, 10), conversations }),
  }).then((res) => res.json());
}
function removeConversationsFromFolder(conversationIds) {
  return fetch(`${API_URL}/gptx/remove-conversations-from-folder/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ conversation_ids: conversationIds }),
  }).then((res) => res.json());
}
function moveConversationIdsToFolder(folderId, conversationIds) {
  return fetch(`${API_URL}/gptx/move-conversation-ids-to-folder/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      folder_id: parseInt(folderId, 10),
      conversation_ids: conversationIds,
    }),
  }).then((res) => res.json());
}
function getConversations(folderId, sortBy = 'updated_at', pageNumber = 1, fullSearch = false, searchTerm = '', isFavorite = null, isArchived = null, excludeConvInFolders = false) {
  if (sortBy.startsWith('-')) sortBy = sortBy.substring(1);
  let url = `${API_URL}/gptx/get-conversations/?order_by=${sortBy}`;
  if (folderId) url += `&folder_id=${folderId}`;
  if (pageNumber) url += `&page=${pageNumber}`;
  if (searchTerm && searchTerm.trim().length > 0) url += `&search=${searchTerm}`;
  if (fullSearch) url += '&full_search=true';
  if (isFavorite !== null) url += `&is_favorite=${isFavorite}`;
  if (isArchived !== null) url += `&is_archived=${isArchived}`;
  if (excludeConvInFolders) url += '&exclude_conv_in_folders=true';
  return fetch(url, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((res) => res.json());
}
function getConversationIds(startDate = null, endDate = null, includeArchived = true, excludeConvInFolders = false) {
  let url = `${API_URL}/gptx/get-conversation-ids/?include_archived=${includeArchived}&exclude_conv_in_folders=${excludeConvInFolders}`;
  if (startDate) url += `&start_date=${startDate}`;
  if (endDate) url += `&end_date=${endDate}`;

  return fetch(url, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((res) => res.json());
}
function getNonSyncedConversationIds() {
  return fetch(`${API_URL}/gptx/get-non-synced-conversation-ids/`, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((res) => res.json());
}
function getNonSyncedConversationCount() {
  return fetch(`${API_URL}/gptx/get-non-synced-conversation-count/`, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((res) => res.json());
}
function getSyncedConversationCount() {
  return fetch(`${API_URL}/gptx/get-synced-conversation-count/`, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((res) => res.json());
}
function getConversation(conversationId) {
  return fetch(`${API_URL}/gptx/get-conversation/?conversation_id=${conversationId}`, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((res) => res.json());
}
function getTotalConversationsCount() {
  return fetch(`${API_URL}/gptx/get-total-conversations-count/`, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((res) => res.json());
}
function getTotalArchivedConversationsCount() {
  return fetch(`${API_URL}/gptx/get-total-archived-conversations-count/`, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((res) => res.json());
}
function getAllFavoriteConversationIds() {
  return fetch(`${API_URL}/gptx/get-all-favorite-conversation-ids/`, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((res) => res.json());
}
function getAllFolderConversationIds(folderId) {
  return fetch(`${API_URL}/gptx/get-all-folder-conversation-ids/?folder_id=${folderId}`, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((res) => res.json());
}
function getAllNoteConversationIds() {
  return fetch(`${API_URL}/gptx/get-all-note-conversation-ids/`, {
    method: 'GET',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((res) => res.json());
}
function addConversations(conversations) {
  return fetch(`${API_URL}/gptx/add-conversations/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ conversations }),
  }).then((res) => res.json());
}
function addConversation(conversation) {
  return fetch(`${API_URL}/gptx/add-conversation/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ conversation }),
  }).then((res) => res.json());
}
function renameConversation(conversationId, title) {
  return fetch(`${API_URL}/gptx/rename-conversation/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ conversation_id: conversationId, title }),
  }).then((res) => res.json());
}
function toggleConversationFavorite(conversation) {
  return fetch(`${API_URL}/gptx/toggle-conversation-favorite/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ conversation }),
  }).then((res) => res.json());
}
function resetAllFavoriteConversations() {
  return fetch(`${API_URL}/gptx/reset-all-favorite-conversations/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((res) => res.json());
}
function deleteConversations(conversationIds) {
  return fetch(`${API_URL}/gptx/delete-conversations/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ conversation_ids: conversationIds }),
  }).then((res) => res.json());
}
function deleteAllConversations() {
  return fetch(`${API_URL}/gptx/delete-all-conversations/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((res) => res.json());
}
function deleteAllArchivedConversations() {
  return fetch(`${API_URL}/gptx/delete-all-archived-conversations/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((res) => res.json());
}
function archiveConversations(conversationIds) {
  return fetch(`${API_URL}/gptx/archive-conversations/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ conversation_ids: conversationIds }),
  }).then((res) => res.json());
}
function unarchiveConversations(conversationIds) {
  return fetch(`${API_URL}/gptx/unarchive-conversations/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ conversation_ids: conversationIds }),
  }).then((res) => res.json());
}
function archiveAllConversations() {
  return fetch(`${API_URL}/gptx/archive-all-conversations/`, {
    method: 'POST',
    headers: {
      ...defaultGPTXHeaders,
      'content-type': 'application/json',
    },
  }).then((res) => res.json());
}
//-----------------------------------
let activeTabId = null;
let convSyncInterval = null;

async function initConvHistorySync(tabId, syncIntervalTime = 5000) {
  let syncedHistoryCount = await getTotalConversationsCount();
  const firstConv = await apiGetConversations(0, 1);
  if (!firstConv) return;
  const { total } = firstConv;
  const limit = 100;
  if (syncedHistoryCount >= total) {
    runConversationSync(tabId, syncIntervalTime);
    return;
  }
  for (let offset = 0; offset < total; offset += limit) {
    // eslint-disable-next-line no-await-in-loop
    const response = await apiGetConversations(offset, limit);
    const conversations = response.items.map((item) => ({
      ...item,
      conversation_id: item.id,
      create_time: new Date(item.create_time).getTime() / 1000,
      update_time: new Date(item.update_time).getTime() / 1000,
    }));
    // eslint-disable-next-line no-await-in-loop
    await addConversations(conversations);
    clearCache('getConversations');
    clearCache('getConversationIds');
    clearCache('getConversation');
    // eslint-disable-next-line no-await-in-loop
    syncedHistoryCount = await getTotalConversationsCount();
    if (syncedHistoryCount >= total || offset + limit >= total) {
      runConversationSync(tabId, syncIntervalTime);
      break;
    }
    // wait for 2 seconds before fetching next batch
    // eslint-disable-next-line no-await-in-loop, no-promise-executor-return
    // await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

function initializeConversationSync(tabId, syncIntervalTime = 5000) {
  // Check if the function is already running in another tab
  chrome.storage.local.get(['isRunningConvSync'], (result) => {
    if (result.isRunningConvSync) {
      // console.log('Sync is already running in this tab or another tab');
      return; // Exit if the function is running in another tab
    }

    // Set the flag to indicate that the function is running
    chrome.storage.local.set({ isRunningConvSync: true }, () => {
      activeTabId = tabId;
      // console.log('Sync started running in tab:', tabId);
      runConversationSync(tabId, syncIntervalTime);
    });
  });
}
// Handle tab closure or refresh
chrome.tabs.onRemoved.addListener((tabId, _removeInfo) => {
  if (tabId === activeTabId) {
    // Tab where the function was running is closed, reset the isRunningConvSync flag
    // console.log(`Tab ${tabId} closed. Resetting function state.`);
    chrome.storage.local.set({ isRunningConvSync: false });
    activeTabId = null;
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, _tab) => {
  if (tabId === activeTabId && changeInfo.status === 'loading') {
    // Tab where the function was running is being refreshed, reset the isRunningConvSync flag
    // console.log(`Tab ${tabId} refreshed. Resetting function state.`);
    chrome.storage.local.set({ isRunningConvSync: false });
    activeTabId = null;
  }
});
async function sendSyncIsDoneMessage() {
  // send a message to the chatGPT tab that sync is done
  const chatGPTTabs = await chrome.tabs.query({ url: 'https://chatgpt.com/*' });
  const chatGPTTab = chatGPTTabs.find((tab) => tab.active) || chatGPTTabs[0];
  if (chatGPTTab) {
    chrome.tabs.sendMessage(chatGPTTab.id, {
      type: 'syncIsDone',
      detail: {},
    });
  }
}
function runConversationSync(tabId, syncIntervalTime) {
  chrome.storage.local.set({ lastConvSyncActivity: Date.now() });

  getNonSyncedConversationIds().then((nonSyncedConvIds) => {
    // if not array
    if (!Array.isArray(nonSyncedConvIds)) {
      sendSyncIsDoneMessage();
      return;
    }
    if (nonSyncedConvIds.length === 0) {
      sendSyncIsDoneMessage();
      return;
    }
    // every 5 seconds, get one conversation and sync it
    let i = 0;
    clearInterval(convSyncInterval);
    convSyncInterval = setInterval(async () => {
      if (i >= nonSyncedConvIds.length) {
        clearInterval(convSyncInterval);
        // Once done, reset the flag
        chrome.storage.local.set({ isRunningConvSync: false, lastConvSyncActivity: null }, () => {
          activeTabId = null; // Reset active tab ID
          // console.log('Sync finished running.');
        });
        sendSyncIsDoneMessage();
        return;
      }
      const conversationId = nonSyncedConvIds[i];
      try {
        chrome.storage.local.set({ lastConvSyncActivity: Date.now() });
        // eslint-disable-next-line no-await-in-loop
        const conversation = await apiGetConversation(conversationId);
        if (conversation) {
          if (conversation.code === 'conversation_not_found') {
            await deleteConversations([conversationId]);
          } else {
            await addConversations([conversation]);
            await syncConversationImages(conversation);
          }
          clearCache('getConversations');
          clearCache('getConversationIds');
          clearCache('getConversation');
        }
      } catch (error) {
        // console.error('Failed to sync conversation', error);
      }
      i += 1;
    }, syncIntervalTime);
  });
}
function backendExtractPromptFromNode(data, nodeId) {
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
function backendExtraxtTitleFromCode(code) {
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
async function syncConversationImages(conversation) {
  const allSyncImages = [];
  const mapping = conversation?.mapping;
  const messages = Object.values(mapping);
  for (let j = 0; j < messages.length; j += 1) {
    const { message, parent: parentNodeId } = messages[j];
    const shouldAddMessage = message?.author?.name === 'dalle.text2im' || message?.content?.text?.includes('<<ImageDisplayed>>');
    if (!shouldAddMessage) continue;

    const dalleImages = (message?.content?.parts || [])?.filter((part) => part?.content_type === 'image_asset_pointer').map((part) => ({ category: part?.metadata?.dalle || part?.metadata?.generation ? 'dalle' : 'upload', ...part })) || [];
    const chartImages = message?.metadata?.aggregate_result?.messages?.filter((msg) => msg?.message_type === 'image').map((msg) => ({ category: 'chart', ...msg })) || [];

    const allImages = [...dalleImages, ...chartImages];

    for (let k = 0; k < allImages.length; k += 1) {
      const image = allImages[k];
      const imageId = image.category === 'dalle'
        ? image?.asset_pointer?.split('://')[1]
        : image?.image_url?.split('://')[1];
      if (!imageId) return;
      const { width, height } = image;
      const prompt = image.category === 'dalle' ? image?.metadata?.dalle?.prompt : message?.metadata?.aggregate_result?.code;

      const title = image?.category === 'dalle' ? message?.metadata?.image_gen_title : backendExtraxtTitleFromCode(message?.metadata?.aggregate_result?.code);

      const promptFromParentNode = backendExtractPromptFromNode(mapping, parentNodeId);

      const genId = image?.metadata?.dalle?.gen_id || image?.metadata?.generation?.gen_id;
      const seed = image?.metadata?.dalle?.seed;
      const imageNode = {
        message_id: message?.id,
        title: title || '',
        conversation_id: conversation.conversation_id,
        image_id: imageId,
        width,
        height,
        prompt: promptFromParentNode || prompt,
        gen_id: genId,
        seed,
        category: image.category,
        is_public: false,
      };

      // eslint-disable-next-line no-await-in-loop
      const response = await apiGetDownloadUrlFromFileId(imageId);
      imageNode.download_url = response.download_url;
      if (response.creation_time) {
        imageNode.created_at = new Date(response.creation_time);
      } else {
        imageNode.created_at = new Date(formatTime(message?.create_time));
      }
      allSyncImages.push(imageNode);
    }
  }
  if (allSyncImages.length > 0) {
    await addGalleryImages(allSyncImages);
    clearCache('getGalleryImages');
    clearCache('getGalleryImagesByDateRange');
  }
}
function apiGetDownloadUrlFromFileId(fileId) {
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(`https://chatgpt.com/backend-api/files/download/${fileId}`, {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      'Oai-Language': 'en-US',
      Authorization: result.accessToken,
    },
  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(res);
  }).then((data) => data));
}
function apiGetConversation(conversationId) {
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(`https://chatgpt.com/backend-api/conversation/${conversationId}`, {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      'Oai-Language': 'en-US',
      Authorization: result.accessToken,
    },
    signal: AbortSignal.timeout(10000),
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    return Promise.reject(response);
  }).catch((err) => {
    if (err.status === 404) {
      return Promise.resolve({ code: 'conversation_not_found' });
    }
    // console.error('API call failed or was rejected', err);
    chrome.storage.local.set({ lastConvSyncActivity: Date.now() });
    return Promise.reject(err);
  }));
}
// needed to move this to client due to cf cookie
async function apiGetConversations(offset = 0, limit = 100, order = 'updated', isArchived = false) {
  const chatGPTTabs = await chrome.tabs.query({ url: 'https://chatgpt.com/*' });

  const chatGPTTab = chatGPTTabs.find((tab) => tab.active) || chatGPTTabs[0];
  if (chatGPTTab) {
    const conversations = await chrome.tabs.sendMessage(chatGPTTab.id, {
      type: 'getConversations',
      detail: {
        offset, limit, order, isArchived,
      },
    });
    return conversations;
  }
  return null;
}
async function apiGetAccount(accessToken) {
  if (!accessToken) return Promise.resolve({});
  try {
    const account = await fetch('https://chatgpt.com/backend-api/accounts/check/v4-2023-04-27', {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        'Oai-Language': 'en-US',
        Authorization: accessToken,
      },
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }
      return Promise.resolve({});
    }).then((data) => {
      chrome.storage.local.set({ account: data });
      return data;
    });
    return account;
  } catch (error) {
    return Promise.resolve({});
  }
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
// Periodic health check to ensure sync is still progressing
function monitorSyncHealth() {
  const checkInterval = 30 * 1000; // Check every 30 seconds
  const inactivityThreshold = 60 * 1000; // 1 minute

  setInterval(() => {
    chrome.storage.local.get(['isRunningConvSync', 'lastConvSyncActivity'], (result) => {
      if (!result.isRunningConvSync) return; // Sync is not running, nothing to do

      const lastActivity = result.lastConvSyncActivity || 0;
      const currentTime = Date.now();
      const elapsedTime = currentTime - lastActivity;

      // If no activity for 1 minutes, reset the sync process
      if (elapsedTime > inactivityThreshold) {
        // console.log('Sync has been inactive for too long. Resetting state.');
        chrome.storage.local.set({ isRunningConvSync: false, lastConvSyncActivity: null });
      }
    });
  }, checkInterval); // Run every 30 seconds
}
// Call the health check monitor when the extension is loaded
monitorSyncHealth();
//-----------------------------------
let spCache = {};

const CACHE_EXPIRATION_TIME = 6 * 60 * 60 * 1000; // Cache expiration time in milliseconds (e.g., 6 hours)
function setCache(key, value) {
  spCache[key] = {
    value,
    expiry: Date.now() + CACHE_EXPIRATION_TIME,
  };
}
function getCache(key) {
  const cachedItem = spCache[key];
  if (cachedItem && cachedItem.expiry > Date.now()) {
    return cachedItem.value;
  }
  delete spCache[key];
  return null;
}
function clearCache(targetKey) {
  Object.keys(spCache).forEach((key) => {
    if (key.includes(targetKey)) {
      delete spCache[key];
    }
  });
}
function clearCaches(targetKeys) {
  targetKeys.forEach((targetKey) => {
    clearCache(targetKey);
  });
}
function clearAllCache() {
  spCache = {};
}
async function makeCacheKey(requestType, data) {
  const hashedData = await createHash(JSON.stringify({ data }));
  return `${requestType}-${hashedData}`;
}
chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    (async () => {
      chrome.storage.sync.get(['hashAcessToken'], async (result) => {
        if (!result.hashAcessToken || result.hashAcessToken === undefined) {
          sendResponse({ error: 'No access token found' });
          return;
        }
        defaultGPTXHeaders['Hat-Token'] = result.hashAcessToken;

        const requestType = request.type;
        const forceRefresh = request.forceRefresh || false;
        const data = request.detail || {};

        const cacheKey = await makeCacheKey(requestType, data);
        // Check if the response is cached
        const cachedResponse = getCache(cacheKey);
        if (cachedResponse && !forceRefresh) {
          sendResponse(cachedResponse);
          return;
        }
        if (requestType === 'checkHasSubscription') {
          checkHasSubscription(forceRefresh).then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'getConversationFolder') {
          getConversationFolder(data.folderId).then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'getConversationFolderByGizmoId') {
          getConversationFolderByGizmoId(data.gizmoId).then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'getConversationFolders') {
          getConversationFolders(data.parentFolderId, data.sortBy, data.searchTerm).then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'addConversationFolders') {
          addConversationFolders(data.folders).then((res) => {
            clearCache('getConversationFolders');
            clearCache('getConversationFolder');
            clearCache('getConversationFolderByGizmoId');
            sendResponse(res);
          });
        } else if (requestType === 'deleteConversationFolders') {
          deleteConversationFolders(data.folderIds).then((res) => {
            clearCache('getConversationFolders');
            clearCache('getConversationFolder');
            clearCache('getConversationFolderByGizmoId');
            sendResponse(res);
          });
        } else if (requestType === 'updateConversationFolder') {
          updateConversationFolder(data.folderId, data.newData).then((res) => {
            clearCache('getConversationFolders');
            clearCache('getConversationFolder');
            clearCache('getConversationFolderByGizmoId');
            clearCache('getConversations');
            clearCache('getConversationIds');
            sendResponse(res);
          });
        } else if (requestType === 'removeConversationFolderImage') {
          removeConversationFolderImage(data.folderId).then((res) => {
            clearCache('getConversationFolders');
            clearCache('getConversationFolder');
            clearCache('getConversationFolderByGizmoId');
            sendResponse(res);
          });
        } else if (requestType === 'moveConversationsToFolder') {
          moveConversationsToFolder(data.folderId, data.conversations).then((res) => {
            clearCache('getConversations');
            clearCache('getConversationIds');
            clearCache('getAllFolderConversationIds');
            clearCache('getConversationFolders');
            clearCache('getConversationFolder');
            clearCache('getConversationFolderByGizmoId');
            sendResponse(res);
          });
        } else if (requestType === 'removeConversationsFromFolder') {
          removeConversationsFromFolder(data.conversationIds).then((res) => {
            clearCache('getConversations');
            clearCache('getConversationIds');
            clearCache('getAllFolderConversationIds');
            clearCache('getConversationFolders');
            clearCache('getConversationFolder');
            clearCache('getConversationFolderByGizmoId');
            sendResponse(res);
          });
        } else if (requestType === 'moveConversationIdsToFolder') {
          moveConversationIdsToFolder(data.folderId, data.conversationIds).then((res) => {
            clearCache('getConversations');
            clearCache('getConversationIds');
            clearCache('getAllFolderConversationIds');
            clearCache('getConversationFolders');
            clearCache('getConversationFolder');
            clearCache('getConversationFolderByGizmoId');
            sendResponse(res);
          });
        } else if (requestType === 'getConversations') {
          getConversations(data.folderId, data.sortBy, data.pageNumber, data.fullSearch, data.searchTerm, data.isFavorite, data.isArchived, data.excludeConvInFolders).then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'getConversationIds') {
          getConversationIds(data.startDate, data.endDate, data.includeArchived, data.excludeConvInFolders).then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'getNonSyncedConversationIds') {
          getNonSyncedConversationIds().then((res) => {
            sendResponse(res);
          });
        } else if (requestType === 'getNonSyncedConversationCount') {
          getNonSyncedConversationCount().then((res) => {
            sendResponse(res);
          });
        } else if (requestType === 'getSyncedConversationCount') {
          getSyncedConversationCount().then((res) => {
            sendResponse(res);
          });
        } else if (requestType === 'initializeConversationSync' && sender.tab) {
          initializeConversationSync(sender.tab.id);
        } else if (requestType === 'initConvHistorySync' && sender.tab) {
          initConvHistorySync(sender.tab.id, data.syncIntervalTime);
        } else if (requestType === 'getConversation') {
          getConversation(data.conversationId).then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'getTotalConversationsCount') {
          getTotalConversationsCount().then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'getTotalArchivedConversationsCount') {
          getTotalArchivedConversationsCount().then((res) => {
            sendResponse(res);
          });
        } else if (requestType === 'getAllFavoriteConversationIds') {
          getAllFavoriteConversationIds().then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'getAllFolderConversationIds') {
          getAllFolderConversationIds(data.folderId).then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'getAllNoteConversationIds') {
          getAllNoteConversationIds().then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'addConversations') {
          addConversations(data.conversations).then((res) => {
            clearCache('getConversations');
            clearCache('getConversationIds');
            clearCache('getConversation');
            sendResponse(res);
          });
        } else if (requestType === 'addConversation') {
          addConversation(data.conversation).then((res) => {
            sendResponse(res);
          });
        } else if (requestType === 'renameConversation') {
          renameConversation(data.conversationId, data.title).then((res) => {
            clearCache('getConversations');
            clearCache('getConversationIds');
            clearCache('getConversation');
            sendResponse(res);
          });
        } else if (requestType === 'toggleConversationFavorite') {
          toggleConversationFavorite(data.conversation).then((res) => {
            clearCache('getConversations');
            clearCache('getConversationIds');
            clearCache('getConversation');
            clearCache('getAllFavoriteConversationIds');
            sendResponse(res);
          });
        } else if (requestType === 'resetAllFavoriteConversations') {
          resetAllFavoriteConversations().then((res) => {
            clearCache('getConversations');
            clearCache('getConversationIds');
            clearCache('getConversation');
            clearCache('getAllFavoriteConversationIds');
            sendResponse(res);
          });
        } else if (requestType === 'deleteConversations') {
          deleteConversations(data.conversationIds).then((res) => {
            clearCache('getConversations');
            clearCache('getConversationIds');
            clearCache('getConversation');
            clearCache('getAllFavoriteConversationIds');
            clearCache('getConversationFolders');
            clearCache('getConversationFolder');
            clearCache('getConversationFolderByGizmoId');
            sendResponse(res);
          });
        } else if (requestType === 'deleteAllConversations') {
          deleteAllConversations().then((res) => {
            clearCache('getConversations');
            clearCache('getConversationIds');
            clearCache('getConversation');
            clearCache('getAllFavoriteConversationIds');
            clearCache('getConversationFolders');
            clearCache('getConversationFolder');
            clearCache('getConversationFolderByGizmoId');
            sendResponse(res);
          });
        } else if (requestType === 'deleteAllArchivedConversations') {
          deleteAllArchivedConversations().then((res) => {
            clearCache('getConversations');
            clearCache('getConversationIds');
            clearCache('getConversation');
            clearCache('getAllFavoriteConversationIds');
            clearCache('getConversationFolders');
            clearCache('getConversationFolder');
            clearCache('getConversationFolderByGizmoId');
            sendResponse(res);
          });
        } else if (requestType === 'archiveConversations') {
          archiveConversations(data.conversationIds).then((res) => {
            clearCache('getConversations');
            clearCache('getConversationIds');
            clearCache('getConversation');
            clearCache('getAllFavoriteConversationIds');
            clearCache('getConversationFolders');
            clearCache('getConversationFolder');
            clearCache('getConversationFolderByGizmoId');
            sendResponse(res);
          });
        } else if (requestType === 'unarchiveConversations') {
          unarchiveConversations(data.conversationIds).then((res) => {
            clearCache('getConversations');
            clearCache('getConversationIds');
            clearCache('getConversation');
            clearCache('getConversationFolders');
            clearCache('getConversationFolder');
            clearCache('getConversationFolderByGizmoId');
            sendResponse(res);
          });
        } else if (requestType === 'archiveAllConversations') {
          archiveAllConversations().then((res) => {
            clearCache('getConversations');
            clearCache('getConversationIds');
            clearCache('getConversation');
            clearCache('getAllFavoriteConversationIds');
            clearCache('getConversationFolders');
            clearCache('getConversationFolder');
            clearCache('getConversationFolderByGizmoId');
            sendResponse(res);
          });
        } else if (requestType === 'addTextdocs') {
          addTextdocs(data.conversationId, data.textdocs).then((res) => {
            sendResponse(res);
          });
        } else if (requestType === 'getCustomInstructionProfile') {
          getCustomInstructionProfile(data.profileId).then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'getEnabledCustomInstructionProfile') {
          getEnabledCustomInstructionProfile().then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'getCustomInstructionProfiles') {
          getCustomInstructionProfiles(data.pageNumber, data.searchTerm, data.sortBy).then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'addCustomInstructionProfile') {
          addCustomInstructionProfile(data.profile).then((res) => {
            clearCache('getCustomInstructionProfile');
            clearCache('getEnabledCustomInstructionProfile');
            clearCache('getCustomInstructionProfiles');
            sendResponse(res);
          });
        } else if (requestType === 'updateCustomInstructionProfile') {
          updateCustomInstructionProfile(data.profileId, data.profile).then((res) => {
            clearCache('getCustomInstructionProfile');
            clearCache('getEnabledCustomInstructionProfile');
            clearCache('getCustomInstructionProfiles');
            sendResponse(res);
          });
        } else if (requestType === 'updateCustomInstructionProfileByData') {
          updateCustomInstructionProfileByData(data.profile).then((res) => {
            clearCache('getCustomInstructionProfile');
            clearCache('getEnabledCustomInstructionProfile');
            clearCache('getCustomInstructionProfiles');
            sendResponse(res);
          });
        } else if (requestType === 'deleteCustomInstructionProfile') {
          deleteCustomInstructionProfile(data.profileId).then((res) => {
            clearCache('getCustomInstructionProfile');
            clearCache('getEnabledCustomInstructionProfile');
            clearCache('getCustomInstructionProfiles');
            sendResponse(res);
          });
        } else if (requestType === 'getPinnedMessages') {
          getPinnedMessages(data.pageNumber, data.conversationId, data.searchTerm).then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'getAllPinnedMessagesByConversationId') {
          getAllPinnedMessagesByConversationId(data.conversationId).then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'addPinnedMessages') {
          addPinnedMessages(data.pinnedMessages).then((res) => {
            clearCache('getPinnedMessages');
            clearCache('getAllPinnedMessagesByConversationId');
            sendResponse(res);
          });
        } else if (requestType === 'addPinnedMessage') {
          addPinnedMessage(data.conversationId, data.messageId, data.message).then((res) => {
            clearCache('getPinnedMessages');
            clearCache('getAllPinnedMessagesByConversationId');
            sendResponse(res);
          });
        } else if (requestType === 'deletePinnedMessage') {
          deletePinnedMessage(data.messageId).then((res) => {
            clearCache('getPinnedMessages');
            clearCache('getAllPinnedMessagesByConversationId');
            sendResponse(res);
          });
        } else if (requestType === 'addPrompts') {
          addPrompts(data.prompts).then((res) => {
            clearCache('getPrompts');
            clearCache('getPrompt');
            clearCache('getPromptFolders');
            clearCache('getAllPromptFolders');
            clearCache('getAllFavoritePrompts');
            sendResponse(res);
          });
        } else if (requestType === 'updatePrompt') {
          updatePrompt(data.promptData).then((res) => {
            clearCache('getPrompts');
            clearCache('getPrompt');
            clearCache('getAllFavoritePrompts');
            sendResponse(res);
          });
        } else if (requestType === 'getPrompt') {
          getPrompt(data.promptId).then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'getPromptsCount') {
          getPromptsCount().then((res) => {
            sendResponse(res);
          });
        } else if (requestType === 'getPrompts') {
          getPrompts(data.pageNumber, data.searchTerm, data.sortBy, data.language, data.tag, data.folderId, data.isFavorite, data.isPublic).then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'getAllPrompts') {
          getAllPrompts(data.folderId).then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'getPromptByTitle') {
          getPromptByTitle(data.title).then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'getAllFavoritePrompts') {
          getAllFavoritePrompts().then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'deletePrompts') {
          deletePrompts(data.promptIds).then((res) => {
            clearCache('getPrompts');
            clearCache('getPrompt');
            clearCache('getPromptFolders');
            clearCache('getAllPromptFolders');
            clearCache('getAllFavoritePrompts');
            sendResponse(res);
          });
        } else if (requestType === 'movePrompts') {
          movePrompts(data.folderId, data.promptIds).then((res) => {
            clearCache('getPrompts');
            clearCache('getPrompt');
            clearCache('getPromptFolders');
            clearCache('getAllPromptFolders');
            sendResponse(res);
          });
        } else if (requestType === 'togglePromptPublic') {
          togglePromptPublic(data.promptId).then((res) => {
            clearCache('getPrompts');
            clearCache('getPrompt');
            sendResponse(res);
          });
        } else if (requestType === 'toggleFavoritePrompt') {
          toggleFavoritePrompt(data.promptId).then((res) => {
            clearCache('getPrompts');
            clearCache('getPrompt');
            clearCache('getAllFavoritePrompts');
            sendResponse(res);
          });
        } else if (requestType === 'resetAllFavoritePrompts') {
          resetAllFavoritePrompts().then((res) => {
            clearCache('getPrompts');
            clearCache('getPrompt');
            clearCache('getAllFavoritePrompts');
            sendResponse(res);
          });
        } else if (requestType === 'setDefaultFavoritePrompt') {
          setDefaultFavoritePrompt(data.promptId).then((res) => {
            clearCache('getPrompts');
            clearCache('getPrompt');
            clearCache('getAllFavoritePrompts');
            clearCache('getDefaultFavoritePrompt');
            sendResponse(res);
          });
        } else if (requestType === 'getDefaultFavoritePrompt') {
          getDefaultFavoritePrompt().then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'duplicatePrompt') {
          duplicatePrompt(data.promptId).then((res) => {
            clearCache('getPrompts');
            clearCache('getPrompt');
            clearCache('getPromptFolders');
            clearCache('getAllPromptFolders');
            clearCache('getAllFavoritePrompts');
            clearCache('getDefaultFavoritePrompt');
            sendResponse(res);
          });
        } else if (requestType === 'incrementPromptUseCount') {
          incrementPromptUseCount(data.promptId).then((res) => {
            sendResponse(res);
          });
        } else if (requestType === 'votePrompt') {
          votePrompt(data.promptId, data.voteType).then((res) => {
            sendResponse(res);
          });
        } else if (requestType === 'reportPrompt') {
          reportPrompt(data.promptId).then((res) => {
            sendResponse(res);
          });
        } else if (requestType === 'getPromptTags') {
          getPromptTags().then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'getPromptFolders') {
          getPromptFolders(data.parentFolderId, data.sortBy, data.searchTerm).then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'getAllPromptFolders') {
          getAllPromptFolders(data.sortBy).then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'addPromptFolders') {
          addPromptFolders(data.folders).then((res) => {
            clearCache('getPromptFolders');
            clearCache('getAllPromptFolders');
            sendResponse(res);
          });
        } else if (requestType === 'deletePromptFolder') {
          deletePromptFolder(data.folderId).then((res) => {
            clearCache('getPromptFolders');
            clearCache('getAllPromptFolders');
            sendResponse(res);
          });
        } else if (requestType === 'updatePromptFolder') {
          updatePromptFolder(data.folderId, data.newData).then((res) => {
            clearCache('getPromptFolders');
            clearCache('getAllPromptFolders');
            sendResponse(res);
          });
        } else if (requestType === 'removePromptFolderImage') {
          removePromptFolderImage(data.folderId).then((res) => {
            clearCache('getPromptFolders');
            clearCache('getAllPromptFolders');
            clearCache('getPromptFolder');
            sendResponse(res);
          });
        } else if (requestType === 'updateNote') {
          updateNote(data.conversationId, data.name, data.text).then((res) => {
            clearCache('getNote');
            clearCache('getNotes');
            clearCache('getAllNoteConversationIds');
            sendResponse(res);
          });
        } else if (requestType === 'renameNote') {
          renameNote(data.noteId, data.newName).then((res) => {
            clearCache('getNote');
            clearCache('getNotes');
            sendResponse(res);
          });
        } else if (requestType === 'deleteNote') {
          deleteNote(data.noteId).then((res) => {
            clearCache('getNote');
            clearCache('getNotes');
            clearCache('getAllNoteConversationIds');
            sendResponse(res);
          });
        } else if (requestType === 'getNote') {
          getNote(data.conversationId).then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'getNoteForIds') {
          getNoteForIds(data.conversationIds).then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'getNotes') {
          getNotes(data.page, data.searchTerm, data.sortBy).then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'getNewsletters') {
          getNewsletters(data.page).then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'getNewsletter') {
          getNewsletter(data.id).then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'getLatestNewsletter') {
          getLatestNewsletter().then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'openPromoLink') {
          openPromoLink(data.link).then((res) => {
            sendResponse(res);
          });
        } else if (requestType === 'getReleaseNote') {
          getReleaseNote(data.version).then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'getLatestVersion') {
          getLatestVersion().then((res) => {
            sendResponse(res);
          });
        } else if (requestType === 'reloadExtension') {
          reloadExtension().then((res) => {
            sendResponse(res);
          });
        } else if (requestType === 'getLatestAnnouncement') {
          getLatestAnnouncement().then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'getRandomGizmo') {
          getRandomGizmo().then((res) => {
            sendResponse(res);
          });
        } else if (requestType === 'getSuperpowerGizmos') {
          getSuperpowerGizmos(data.pageNumber, data.searchTerm, data.sortBy, data.category).then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'submitSuperpowerGizmos') {
          submitSuperpowerGizmos(data.gizmos, data.category).then((res) => {
            clearCache('getSuperpowerGizmos');
            sendResponse(res);
          });
        } else if (requestType === 'updateGizmoMetrics') {
          updateGizmoMetrics(data.gizmoId, data.metricName, data.direction).then((res) => {
            clearCache('getSuperpowerGizmos');
            sendResponse(res);
          });
        } else if (requestType === 'deleteSuperpowerGizmo') {
          deleteSuperpowerGizmo(data.gizmoId).then((res) => {
            clearCache('getSuperpowerGizmos');
            sendResponse(res);
          });
        } else if (requestType === 'addGalleryImages') {
          addGalleryImages(data.images).then((res) => {
            clearCache('getGalleryImages');
            clearCache('getGalleryImagesByDateRange');
            sendResponse(res);
          });
          // } else if (requestType === 'updateGlleryImage') {
          //   updateGlleryImage(data.openAiId, data.imageId, data.imageData).then((res) => {
          //     sendResponse(res);
          //   });
        } else if (requestType === 'getGalleryImages') {
          getGalleryImages(data.showAll, data.pageNumber, data.searchTerm, data.byUserId, data.sortBy, data.category, data.isPublic).then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'getSelectedGalleryImages') {
          getSelectedGalleryImages(data.category, data.imageIds, data.conversationId).then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'getGalleryImagesByDateRange') {
          getGalleryImagesByDateRange(data.startDate, data.endDate, data.category).then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'deleteGalleryImages') {
          deleteGalleryImages(data.imageIds, data.category).then((res) => {
            clearCache('getGalleryImages');
            clearCache('getGalleryImagesByDateRange');
            clearCache('getSelectedGalleryImages');
            sendResponse(res);
          });
        } else if (requestType === 'shareGalleryImages') {
          shareGalleryImages(data.imageIds, data.category).then((res) => {
            sendResponse(res);
          });
        } else if (requestType === 'incrementOpenRate') {
          incrementOpenRate(data.announcementId).then((res) => {
            sendResponse(res);
          });
        } else if (requestType === 'incrementClickRate') {
          incrementClickRate(data.announcementId).then((res) => {
            sendResponse(res);
          });
        } else if (requestType === 'incrementPromoLinkClickRate') {
          incrementPromoLinkClickRate(data.announcementId, data.promoLink).then((res) => {
            sendResponse(res);
          });
        } else if (requestType === 'getRemoteSettings') {
          getRemoteSettings().then((res) => {
            setCache(cacheKey, res);
            sendResponse(res);
          });
        } else if (requestType === 'resetContextMenu') {
          resetContextMenu();
          sendResponse();
        } else if (requestType === 'clearCaches') {
          clearCaches(data.targetKeys);
          sendResponse();
        } else if (requestType === 'clearAllCache') {
          clearAllCache();
          sendResponse();
        } else if (requestType === 'flushStorage') {
          flushStorage().then(() => {
            sendResponse();
          });
        }
      });
    })();
    return true;
  },
);
