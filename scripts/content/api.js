/* global toast, processChatRequirements, updateRateLimitBanner, backupModels */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-unused-vars */
let cachedAudios = {};
let historyCache = {};
let textDocCache = {};
let conversationsCache = {};
let fileIdToDownloadUrlCache = {};
let conversationTextDocsCache = {};
let sharePostCache = {};

function flushCache() {
  historyCache = {};
  textDocCache = {};
  cachedAudios = {};
  conversationsCache = {};
  conversationTextDocsCache = {};
  fileIdToDownloadUrlCache = {};
  sharePostCache = {};
}

let API_URL = 'https://api.wfh.team';
chrome.storage.local.get({ API_URL: 'https://api.wfh.team' }, (r) => {
  API_URL = r.API_URL;
});
let lastPromptSuggestions = [];
const citationAttributions = [];

// get auth token from sync storage
const defaultHeaders = {
  'content-type': 'application/json',
  'Oai-Language': 'en-US',
};

const openAIDeviceId = window.localStorage.getItem('oai-did')?.replaceAll('"', '');
if (openAIDeviceId) {
  defaultHeaders['Oai-Device-Id'] = openAIDeviceId;
}
function getChatGPTAccountIdFromCookie() {
  const newChatgptAccountId = document?.cookie?.split('; ')?.find((row) => row?.startsWith('_account='))?.split('=')?.[1];
  if (newChatgptAccountId === 'personal') {
    return 'default';
  }
  return newChatgptAccountId || 'default';
}
const newChatgptAccountId = getChatGPTAccountIdFromCookie();
if (newChatgptAccountId !== 'default') {
  defaultHeaders['Chatgpt-Account-Id'] = newChatgptAccountId;
} else {
  delete defaultHeaders['Chatgpt-Account-Id'];
}

let loadingChatRequirements = false;
let lastChatRequirementsFetch = new Date();
function getChatRequirements() {
  const curChatRequirementsToken = window.localStorage.getItem('sp/chatRequirementsToken');
  const curProofOfWorkToken = window.localStorage.getItem('sp/proofOfWorkToken');
  const curTurnstileToken = window.localStorage.getItem('sp/turnstileToken');
  const curArkoseDX = window.localStorage.getItem('sp/arkoseDX');
  if (loadingChatRequirements) {
    return Promise.resolve({});
  }
  // lastChatRequirementsFetch not older than 5 minutes
  if (curChatRequirementsToken && curTurnstileToken && curProofOfWorkToken && curArkoseDX && (new Date() - lastChatRequirementsFetch < 1000 * 60 * 5)) {
    return Promise.resolve({
      arkoseDX: curArkoseDX,
    });
  }
  loadingChatRequirements = true;
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch('/backend-api/sentinel/chat-requirements', {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
    body: JSON.stringify({
      p: window.localStorage.getItem('sp/chatRequirementsPayload'),
    }),
  })
    .then((response) => response.json())
    .then(async (data) => {
      lastChatRequirementsFetch = new Date();
      loadingChatRequirements = false;
      await processChatRequirements(data);
      return {
        arkoseDX: data.arkose?.dx,
      };
    }));
}
function arkoseDX() {
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch('/backend-api/sentinel/arkose/dx', {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((response) => response.json()));
}
// /api/auth/session
function getSession() {
  return fetch('/api/auth/session', {
    method: 'GET',
    headers: {
      ...defaultHeaders,
    },
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    return Promise.reject(response);
  });
}

// /backend-api/me
function me() {
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch('/backend-api/me', {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    return Promise.reject(response);
  }));
}
function gizmoCreatorProfile() {
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch('/backend-api/gizmo_creator_profile', {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    return Promise.reject(response);
  }));
}

function checkout(payload) {
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch('/backend-api/payments/checkout', {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
    body: JSON.stringify(payload),
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    return Promise.reject(response);
  }).then((data) => {
    // go to data.url
    window.location.href = data.url;
  }));
}

function getExamplePrompts(offset = 0, limit = 4) {
  const url = new URL(`https://${window.location.host}/backend-api/prompt_library/`);
  const params = { offset, limit };
  url.search = new URLSearchParams(params).toString();
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(url, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((response) => response.json()))
    .then((data) => {
      lastPromptSuggestions = data?.items?.map((item) => item.prompt);
      return data;
    });
}

function generateSuggestions(conversationId, messageId, model, numSuggestions = 2) {
  const payload = {
    message_id: messageId,
    model,
    num_suggestions: numSuggestions,
  };
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(`/backend-api/conversation/${conversationId}/experimental/generate_suggestions`, {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
    body: JSON.stringify(payload),
  }).then((response) => response.json()))
    .then((data) => {
      lastPromptSuggestions = data.suggestions;
      return data;
    });
}
// /backend-api/synthesize?message_id=7319a945-3ce6-4597-ac86-3f5ff03348f3&conversation_id=71dab7a5-17eb-4e31-8bb4-720f8b35740f&voice=juniper
// eslint-disable-next-line prefer-const
let playingAudios = {};
function synthesize(conversationId, messageId, voice = 'juniper', format = 'aac') {
  if (cachedAudios[messageId]) {
    // play from the beginning
    cachedAudios[messageId].currentTime = 0;
    cachedAudios[messageId].play();
    playingAudios[messageId] = cachedAudios[messageId];
    return Promise.resolve(cachedAudios[messageId]);
  }
  const url = new URL(`https://${window.location.host}/backend-api/synthesize`);
  return chrome.storage.local.get(['openAIUserSettings']).then((res) => {
    const voiceName = res.openAIUserSettings.settings?.voice_name || voice;

    const params = {
      message_id: messageId, conversation_id: conversationId, voice: voiceName, format,
    };
    url.search = new URLSearchParams(params).toString();
    return chrome.storage.sync.get(['accessToken']).then((result) => fetch(url, {
      method: 'GET',
      headers: {
        ...defaultHeaders,
        Authorization: result.accessToken,
      },

    }).then((response) => {
      // check if response content-type is audio/aac
      if (response.headers.get('content-type') !== 'audio/aac') {
        toast('Failed to synthesize audio', 'error');
        return Promise.reject(response);
      }
      // start playing the audio using mediasource as soon as we get the response
      const mediaSource = new MediaSource();
      // createobjecturl
      const src = URL.createObjectURL(mediaSource);
      // set the audio src
      const audio = new Audio(src);
      let sourceBuffer;
      const queue = [];
      // append the source buffer
      mediaSource.addEventListener('sourceopen', () => {
        if (!sourceBuffer) { // Only create SourceBuffer if it doesn't already exist
          sourceBuffer = mediaSource.addSourceBuffer('audio/aac');
          sourceBuffer.addEventListener('updateend', () => {
            if (queue.length > 0 && !sourceBuffer.updating) {
              sourceBuffer.appendBuffer(queue.shift());
            } else if (queue.length === 0 && !sourceBuffer.updating) {
              // Set the duration here if you know the total duration
              // mediaSource.duration = <known_duration>;
              mediaSource.endOfStream(); // Indicates the end of the stream
            }
          });
        }
        if (!response.body.locked) {
          response.body.pipeTo(new WritableStream({
            write(chunk) {
              if (sourceBuffer.updating || queue.length > 0) {
                queue.push(chunk);
              } else {
                sourceBuffer.appendBuffer(chunk);
              }
            },
            close: () => {
              // This will be called when the stream is fully read
              // If all chunks are appended and processed, signal endOfStream
              if (!sourceBuffer.updating && mediaSource.readyState === 'open') {
                mediaSource.endOfStream();
              }
            },
          })).catch((error) => {
            console.error('Error piping the response body:', error);
          });
        }
      });
      audio.play();
      playingAudios[messageId] = audio;
      cachedAudios[messageId] = audio;
      if (Object.keys(cachedAudios).length > 20) {
        delete cachedAudios[Object.keys(cachedAudios)[0]];
      }
      return audio;
    }));
  });
}
function convertGizmoToPayload(gizmoResource) {
  return {
    id: gizmoResource.gizmo.id,
    name: gizmoResource.gizmo.display.name,
    author: gizmoResource.gizmo.author,
    config: {
      context_message: gizmoResource.gizmo.instructions,
      model_slug: null,
      assistant_welcome_message: gizmoResource.gizmo.display.welcome_message,
      prompt_starters: gizmoResource.gizmo.display.prompt_starters,
      enabled_tools: gizmoResource.tools.map((t) => ({ tool_id: t.type })),
      files: gizmoResource.files,
      tags: gizmoResource.gizmo.tags,
    },
    description: gizmoResource.gizmo.display.description,
    owner_id: gizmoResource.gizmo.author.user_id.split('__')?.[0],
    updated_at: gizmoResource.gizmo.updated_at,
    profile_pic_permalink: gizmoResource.gizmo.display.profile_picture_url,
    share_recipient: gizmoResource.gizmo.share_recipient,
    version: gizmoResource.gizmo.version,
    live_version: gizmoResource.gizmo.live_version,
    short_url: gizmoResource.gizmo.short_url,
    vanity_metrics: gizmoResource.gizmo.vanity_metrics,
    allowed_sharing_recipients: gizmoResource.gizmo.allowed_sharing_recipients,
    product_features: gizmoResource.product_features,
  };
}

function initConversation(conversationId = null) {
  return chrome.storage.sync.get(['accessToken']).then((result) => {
    const payload = {
      conversation_id: conversationId,
      gizmo_id: null,
      requested_default_model: null,
      timezone_offset_min: new Date().getTimezoneOffset(),
    };

    return fetch('/backend-api/conversation/init', {
      method: 'POST',
      headers: {
        ...defaultHeaders,
        Authorization: result.accessToken,
      },
      body: JSON.stringify(payload),
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }
      return Promise.reject(response);
    }).then((data) => {
      updateRateLimitBanner(data?.banner_info);
    });
  });
}

function getConversation(conversationId, forceRefresh = false) {
  if (conversationsCache[conversationId] && !forceRefresh) {
    return Promise.resolve(conversationsCache[conversationId]);
  }

  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(`/backend-api/conversation/${conversationId}`, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
    signal: AbortSignal.timeout(10000),
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    if (response?.status === 404) {
      chrome.runtime.sendMessage({
        type: 'deleteConversations',
        detail: {
          conversationIds: [conversationId],
        },
      });
    }
    if (response?.status && response?.status?.toString()?.startsWith('5')) {
      return Promise.resolve(response);
    }
    return Promise.reject(response);
  }).then((data) => {
    conversationsCache[conversationId] = data;
    return data;
  })
    .catch((err) => Promise.reject(err)));
}
function getCitationAttributions(urls) {
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch('/backend-api/attributions', {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
    body: JSON.stringify({ urls }),
  }).then((response) => {
    if (response.ok) {
      // check if response type is in json or text
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      // convert text to json
      // {"url": "https://www.dallasobserver.com", "attribution": "Dallas Observer"}
      // {"url": "https://blog.resy.com", "attribution": "Resy | Right This Way"}
      // {"url": "https://mazeoflove.com", "attribution": "Maze of Love"}
      return response.text().then((text) => {
        const attributions = text.split('\n').map((line) => {
          try {
            return JSON.parse(line);
          } catch (e) {
            return null;
          }
        }).filter((line) => line);
        return attributions;
      });
    }
    return Promise.reject(response);
  }).then((data) => {
    // keep the last 200 attributions
    citationAttributions.push(...data);
    return data;
  }));
}
function getAccount() {
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch('/backend-api/accounts/check/v4-2023-04-27', {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    return Promise.reject(response);
  }).then((data) => {
    chrome.storage.local.set({ account: data });
    return data;
  }));
}
function getConversationTemplates(workspaceId, gizmoId) {
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(`/backend-api/workspaces/${workspaceId}/conversation_templates/${gizmoId}`, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    return Promise.reject(response);
  }));
}

function getMemories(includeMemoryEntries) {
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(`/backend-api/memories${includeMemoryEntries ? '' : '?include_memory_entries=false'}`, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    return Promise.reject(response);
  }));
}
function getGizmosBootstrap(forceRefresh = false, limit = 2) {
  return chrome.storage.local.get(['gizmosBootstrap']).then((res) => {
    const { gizmosBootstrap } = res;

    if (gizmosBootstrap && !forceRefresh) {
      return gizmosBootstrap;
    }
    return chrome.storage.sync.get(['accessToken']).then((result) => fetch('/backend-api/gizmos/bootstrap', {
      method: 'GET',
      headers: {
        ...defaultHeaders,
        Authorization: result.accessToken,
      },
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }
      return Promise.reject(response);
    }).then((data) => {
      chrome.storage.local.set({
        gizmosBootstrap: data,
      });
      return data;
    }));
  });
}
function getGizmosPinned(forceRefresh = false) {
  return chrome.storage.local.get(['gizmosPinned']).then((res) => {
    const { gizmosPinned } = res;

    if (gizmosPinned && !forceRefresh) {
      return gizmosPinned;
    }
    return chrome.storage.sync.get(['accessToken']).then((result) => fetch('/backend-api/gizmos/pinned', {
      method: 'GET',
      headers: {
        ...defaultHeaders,
        Authorization: result.accessToken,
      },
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }
      return Promise.reject(response);
    }).then((data) => {
      chrome.storage.local.set({
        gizmosPinned: data.items,
      });
      return data;
    }));
  });
}
function updateGizmoSidebar(gizmoId, action) {
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(`/backend-api/gizmos/${gizmoId}/sidebar`, {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
    body: JSON.stringify({ action }),
  }).then((response) => {
    getGizmosBootstrap(true);
  }));
}

// /backend-api/gizmo_creators/user-xNvKxI7DzdHAjr6LBbhCDWKi/gizmos
function getGizmosByUser(userId, cursor = null) {
  const url = new URL(`https://${window.location.host}/backend-api/gizmo_creators/${userId}/gizmos`);
  if (cursor) url.searchParams.append('cursor', cursor);
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(url, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    return Promise.reject(response);
  }));
}
function deleteGizmo(gizmoId) {
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(`/backend-api/gizmos/${gizmoId}`, {
    method: 'DELETE',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((response) => {
    if (response.ok) {
      chrome.runtime.sendMessage({
        type: 'deleteSuperpowerGizmo',
        detail: {
          gizmoId,
        },
      });
      return response.json();
    }
    return Promise.reject(response);
  }));
}
function getGizmoById(gizmoId, forceRefresh = false) {
  if (!gizmoId) {
    return Promise.resolve(null);
  }
  return chrome.storage.local.get(['gizmosBootstrap', 'gizmoPinned']).then((res) => {
    const {
      gizmosBootstrap, gizmoPinned,
    } = res;

    const gizmoData = gizmosBootstrap?.gizmos?.find((g) => g?.resource?.gizmo?.id === gizmoId) || gizmoPinned?.find((g) => g?.gizmo?.id === gizmoId);
    if (gizmoData && !forceRefresh) {
      return gizmoData;
    }
    return chrome.storage.sync.get(['accessToken']).then((result) => fetch(`/backend-api/gizmos/${gizmoId}`, {
      method: 'GET',
      headers: {
        ...defaultHeaders,
        Authorization: result.accessToken,
      },
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }
      if (response?.status === 404) {
        chrome.runtime.sendMessage({
          type: 'deleteSuperpowerGizmo',
          detail: {
            gizmoId,
          },
        });
        toast('GPT inaccessible or not found', 'warning');
        if (!window.location.pathname.includes('/c/')) {
          window.location.href = '/';
        }
      }
      return Promise.resolve({});
    }).then((data) => {
      // add gizmo to superpower
      if (data?.gizmo) {
        chrome.runtime.sendMessage({
          type: 'submitSuperpowerGizmos',
          detail: {
            gizmos: [data.gizmo],
          },
        });
      }
      return {
        flair: { kind: 'recent' },
        resource: data,
      };
    }));
  });
}
function getGizmoAbout(gizmoId) {
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(`/backend-api/gizmos/${gizmoId}/about`, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    return Promise.resolve({});
  }).then((data) => data));
}

function getGizmoDiscovery(category, cursor, limit = 24, locale = 'global', forceRefresh = true) {
  return chrome.storage.local.get(['gizmoDiscovery']).then((res) => {
    const { gizmoDiscovery } = res;
    if (!forceRefresh && gizmoDiscovery && gizmoDiscovery?.[category]) {
      return gizmoDiscovery[category];
    }

    let url = new URL(`https://${window.location.host}/public-api/gizmos/discovery`);
    if (category) url = new URL(`https://${window.location.host}/public-api/gizmos/discovery/${category}`);
    if (cursor) url.searchParams.append('cursor', cursor);
    if (limit) url.searchParams.append('limit', limit);
    if (locale) url.searchParams.append('locale', locale);

    return chrome.storage.sync.get(['accessToken']).then((result) => fetch(url, {
      method: 'GET',
      headers: {
        ...defaultHeaders,
        Authorization: result.accessToken,
      },
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }
      return Promise.reject(response);
    }).then((data) => {
      chrome.storage.local.get({ gizmoDiscovery: {} }, (r) => {
        chrome.storage.local.set({ gizmoDiscovery: { ...r.gizmoDiscovery, [category]: data } });
      });
      // uncomment this when gizmo discovery is fixed
      const gizmos = category ? data.list.items.map((item) => item.resource.gizmo) : data.cuts.map((cut) => cut.list.items.map((item) => item.resource.gizmo)).flat();
      // remove this when gizmo discovery is fixed
      // const gizmos = data.cuts.map((cut) => cut.list.items.map((item) => item.resource.gizmo)).flat();
      chrome.runtime.sendMessage({
        type: 'submitSuperpowerGizmos',
        detail: {
          gizmos,
          category,
        },
      });
      // remove this when gizmo discovery is fixed
      // if (category) return data.cuts.find((cut) => cut.info.id === category);
      return data;
    }));
  });
}
function updateActionSettings(gizmoId, domain, gizmoActionId, actionSettings) {
  const payload = {
    domain,
    gizmo_action_id: gizmoActionId,
    action_settings: actionSettings,
  };
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch('/backend-api/gizmos/action_settings', {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
    body: JSON.stringify(payload),
  }).then((response) => {
    if (response.ok) {
      getGizmoUserActionSettings(gizmoId, true);
      return response.json();
    }
    return Promise.reject(response);
  }));
}
function openOAuthDialog(gizmoId, domain, gizmoActionId, redirectTo) {
  const payload = {
    gizmo_id: gizmoId,
    domain,
    gizmo_action_id: gizmoActionId,
    redirect_to: redirectTo,
  };
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch('/backend-api/gizmos/oauth_redirect', {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
    body: JSON.stringify(payload),
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    return Promise.reject(response);
  }).then((data) => {
    // go to the response url
    window.location.href = data.redirect_uri;
  }));
}
// /backend-api/gizmos/user_action_settings?gizmo_id=g-TsiYOneyk
function getGizmoUserActionSettings(gizmoId, forceRefresh = false) {
  return chrome.storage.local.get(['gizmoUserActionSettings']).then((res) => {
    const gizmoUserActionSettings = res.gizmoUserActionSettings || {};

    if (gizmoUserActionSettings[gizmoId] && !forceRefresh) {
      return gizmoUserActionSettings[gizmoId];
    }
    return chrome.storage.sync.get(['accessToken']).then((result) => fetch(`/backend-api/gizmos/user_action_settings?gizmo_id=${gizmoId}`, {
      method: 'GET',
      headers: {
        ...defaultHeaders,
        Authorization: result.accessToken,
      },
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }
      return Promise.reject(response);
    }).then((data) => {
      gizmoUserActionSettings[gizmoId] = data;
      chrome.storage.local.set({
        gizmoUserActionSettings,
      });
      return data;
    }));
  });
}
// {
//   "account_plan": {
//     "is_paid_subscription_active": true,
//     "subscription_plan": "chatgptplusplan",
//     "account_user_role": "account-owner",
//     "was_paid_customer": true,
//     "has_customer_object": true
//   },
//   "user_country": "US",
//   "features": [
//     "model_switcher",
//     "system_message"
//   ]
// }
function accountTransfer(destinationWorkspaceId) {
  const payload = {
    workspace_id: destinationWorkspaceId,
  };
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch('/backend-api/accounts/transfer', {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
    body: JSON.stringify(payload),
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    return Promise.reject(response);
  }));
}
function getVoices() {
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch('/backend-api/settings/voices', {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    return Promise.reject(response);
  }));
}
function getUserSettings() {
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch('/backend-api/settings/user', {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    return Promise.reject(response);
  }).then((data) => {
    chrome.storage.local.set({ openAIUserSettings: data });
    return data;
  }));
}
function updateAccountUserSetting(feature, value) {
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(`/backend-api/settings/account_user_setting?feature=${feature}&value=${value}`, {
    method: 'PATCH',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    return Promise.reject(response);
  }).then((data) => {
    getUserSettings();
    chrome.storage.local.get(['openAIUserSettings'], (res) => {
      chrome.storage.local.set({
        openAIUserSettings: {
          ...res.openAIUserSettings,
          settings: {
            ...res.openAIUserSettings.settings,
            [feature]: value,
          },
        },
      });
    });
    return data;
  }));
}
function createFileInServer(file, useCase) {
  // get filesize
  const payload = {
    file_name: file.name,
    file_size: file.size,
    use_case: useCase,
  };
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch('/backend-api/files', {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
    body: JSON.stringify(payload),
  }).then((res) => {
    if (res.ok) {
      return res.json();
      // {
      //   "status": "success",
      //     "upload_url": "https://fileserviceuploadsperm.blob.core.windows.net/files/file-WY8iSpWv8dVG6Y32heI7Bx1E?se=2023-10-04T21%3A25%3A34Z&sp=c&sv=2021-08-06&sr=b&sig=RcCQ5Sk0BQOZ6KAMT0UIa9br5C5IVGtoWevk/E84Chw%3D",
      //       "file_id": "file-WY8iSpWv8dVG6Y32heI7Bx1E"
      // }
    }
    return Promise.reject(res);
  }));
}
// {
//   "id": "file-lHLuMEsIDvUV9Ue09nOm6PAT",
//   "name": "file.pdf",
//   "creation_time": "2023-12-03 19:14:12.392627+00:00",
//   "state": "ready",
//   "ready_time": "2023-12-03 19:14:13.158478+00:00",
//   "size": 124824,
//   "metadata": {
//       "retrieval": {
//           "status": "parsed"
//       }
//   },
//   "use_case": "my_files",
//   "retrieval_index_status": "parsed",
//   "file_size_tokens": 0
// }
// {
//   "id": "file-lHLuMEsIDvUV9Ue09nOm6PAT",
//   "name": "file.pdf",
//   "creation_time": "2023-12-03 19:14:12.392627+00:00",
//   "state": "ready",
//   "ready_time": "2023-12-03 19:14:13.158478+00:00",
//   "size": 124824,
//   "metadata": {
//       "retrieval": {
//           "status": "success"
//       }
//   },
//   "use_case": "my_files",
//   "retrieval_index_status": "success",
//   "file_size_tokens": 768
// }
function getFileStatus(fileId) {
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(`/backend-api/files/${fileId}`, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(res);
  }));
}
function uploadFileAPI(fileId, uploadUrl, file) {
  return fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'x-ms-blob-type': 'BlockBlob',
    },
    body: file,
  }).then((res) => {
    if (res.ok) {
      return Promise.resolve(res);
    }
    return Promise.reject(res);
  });
}
function uploadedAPI(fileId) {
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(`/backend-api/files/uploaded/${fileId}`, {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((res) => {
    if (res.ok) {
      return res.json();
      // {
      //   "status": "success",
      //     "download_url": "https://fileserviceuploadsperm.blob.core.windows.net/files/file-WY8iSpWv8dVG6Y32heI7Bx1E?se=2023-10-04T21%3A25%3A38Z&sp=r&sv=2021-08-06&sr=b&rscd=attachment%3B%20filename%3D6c2b35cf-4d72-42ad-a004-6becbdc6e799.png&sig=Lii1Uuy2QHFqZ0o0GKv3CtqXzOcdUDGHwX5/NhuMZ3k%3D",
      //       "metadata": null
      // }
    }
    return Promise.reject(res);
  }));
}
// https://chatgpt.com/backend-api/conversation/6801e794-cae4-800c-8356-eb4be1c69387/attachment/file_000000007bc861f7bc9fc00489f66b8d/download

function getDownloadUrlFromFileId(conversationId, fileId, forceRefresh = false) {
  if (fileIdToDownloadUrlCache[fileId]?.timestamp && (new Date().getTime() - fileIdToDownloadUrlCache[fileId].timestamp < 1000 * 60 * 3) && !forceRefresh) {
    return Promise.resolve({ ...fileIdToDownloadUrlCache[fileId].data });
  }
  const url = fileId.startsWith('file_') ? `/backend-api/conversation/${conversationId}/attachment/${fileId}/download` : `/backend-api/files/download/${fileId}`;
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(url, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(res);
  }).then((data) => {
    if (fileId) {
      fileIdToDownloadUrlCache[fileId] = {
        timestamp: new Date().getTime(),
        data,
      };
    }
    return data;
  }));
}
// /backend-api/conversation/f291cc96-96d7-4ac1-a6e9-491b3281b4fa/interpreter/download?message_id=b26793a5-0432-4eeb-9164-09ea13a3468c&sandbox_path=/mnt/data/subscribers_per_day_line_chart.png
function getDownloadUrlFromSandBoxPath(conversationId, messageId, sandboxPath) {
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(`/backend-api/conversation/${conversationId}/interpreter/download?message_id=${messageId}&sandbox_path=${sandboxPath}`, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(res);
  }));
}

async function setUserSystemMessage(nameUserMessage, roleUserMessage, traitsModelMessage, otherUserMessage, enabled, disabledTools = []) {
  const payload = {
    about_model_message: traitsModelMessage?.toString() || '',
    about_user_message: otherUserMessage?.toString() || '',
    name_user_message: nameUserMessage?.toString() || '',
    other_user_message: otherUserMessage?.toString() || '',
    role_user_message: roleUserMessage?.toString() || '',
    traits_model_message: traitsModelMessage?.toString() || '',
    enabled,
    disabled_tools: disabledTools,
  };
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch('/backend-api/user_system_messages', {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
    body: JSON.stringify(payload),
  }).then((res) => res.json()))
    .then((data) => {
      chrome.storage.local.set({ customInstructionProfileIsEnabled: data.enabled });
      // For some reason this is required to make the changes reflect in ChatGPT
      // setTimeout(() => {
      //   getUserSystemMessage();
      //   getUserSystemMessage();
      // }, 500);
    });
}
function getUserSystemMessage(updateExistingProfile = false) {
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch('/backend-api/user_system_messages', {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((res) => res.json()))
    .then((data) => {
      if (updateExistingProfile) {
        chrome.runtime.sendMessage({
          type: 'updateCustomInstructionProfileByData',
          detail: {
            profile: {
              aboutModelMessage: data.about_model_message?.toString() || '',
              aboutUserMessage: data.about_user_message?.toString() || '',
              nameUserMessage: data.name_user_message?.toString() || '',
              roleUserMessage: data.role_user_message?.toString() || '',
              otherUserMessage: data.other_user_message?.toString() || '',
              traitsModelMessage: data.traits_model_message?.toString() || '',
              enabled: data.enabled,
              disabledTools: data.disabled_tools,
            },
          },
        });
      }
      return data;
    });
}
// https://chatgpt.com/backend-api/user_system_message_trait_pills
let cachedTraitPills = [];
function getUserSystemMessageTraitPills() {
  if (cachedTraitPills.length > 0) {
    return Promise.resolve(cachedTraitPills);
  }
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch('/backend-api/user_system_message_trait_pills', {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((res) => res.json())
    .then((data) => {
      cachedTraitPills = data;
      return data;
    }));
}
function getModels() {
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch('/backend-api/models', {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((response) => response.json()))
    .then((data) => {
      if (data.models) {
        chrome.storage.local.get(['selectedModel', 'settings'], (res) => {
          const { selectedModel } = res;
          const newSelectedModel = selectedModel && data?.models?.find((model) => model.slug === selectedModel.slug) ? selectedModel : data.models?.[0];
          chrome.storage.local.set({
            models: data.models,
            selectedModel: newSelectedModel,
          });
          if (res.settings.overrideModelSwitcher) {
            window.sessionStorage.setItem('sp/selectedModel', newSelectedModel.slug);
          }
        });
      } else {
        chrome.storage.local.set({
          models: backupModels,
          selectedModel: null,
        });
      }
    })
    .catch((err) => {
      console.error('Error getting models', err, backupModels);
      chrome.storage.local.set({
        models: backupModels,
        selectedModel: null,
      });
    });
}
function getConversationLimit() {
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch('/public-api/conversation_limit', {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((response) => response.json())
    .then((data) => {
      if (data.message_cap) {
        chrome.storage.local.set({
          conversationLimit: data,
        });
      }
    }));
}
function openGraph(url) {
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(`/backend-api/opengraph/tags?url=${url}`, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((response) => response.json()));
}

function messageFeedback(conversationId, messageId, rating, text = '') {
  const data = {
    conversation_id: conversationId,
    message_id: messageId,
    rating,
    tags: [],
  };
  if (text) {
    data.text = text;
  }
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch('/backend-api/conversation/message_feedback', {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
    body: JSON.stringify(data),
  }).then((res) => res.json()));
}
function createShare(conversationId, currentNodeId, isAnnonymous = true) {
  const url = new URL(`https://${window.location.host}/backend-api/share/create`);
  // without passing limit it returns 50 by default
  // limit cannot be more than 20
  const data = {
    is_anonymous: isAnnonymous,
    conversation_id: conversationId,
    current_node_id: currentNodeId,
    // message_id: `aaa1${self.crypto.randomUUID().slice(4)}`,
  };
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(url, {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
    body: JSON.stringify(data),

  }).then((res) => {
    const jsonData = res.json();
    return jsonData;
  }));
}

function shareConv(shareData) {
  const url = new URL(`https://${window.location.host}/backend-api/share/${shareData.share_id}`);
  // without passing limit it returns 50 by default
  // limit cannot be more than 20
  const data = {
    current_node_id: shareData.current_node_id,
    highlighted_message_id: shareData.highlighted_message_id,
    is_anonymous: shareData.is_anonymous,
    is_discoverable: shareData.is_discoverable,
    is_public: shareData.is_public,
    is_visible: shareData.is_visible,
    share_id: shareData.share_id,
    title: shareData.title,
  };
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(url, {
    method: 'PATCH',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
    body: JSON.stringify(data),

  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(res);
  }));
}
function sharePost(shareData, forceRefresh = false) {
  // check sharePostCache
  if (sharePostCache[shareData.shareId] && !forceRefresh) {
    return Promise.resolve(sharePostCache[shareData.shareId]);
  }
  const url = new URL(`https://${window.location.host}/backend-api/share/post`);
  const data = {
    attachments_to_create: shareData.attachments_to_create,
    post_text: shareData.post_text,
  };
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(url, {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
    body: JSON.stringify(data),

  }).then((res) => {
    if (res.ok) {
      // cache the response
      sharePostCache[shareData.shareId] = res.json();
      return sharePostCache[shareData.shareId];
    }
    return Promise.reject(res);
  }));
}
function deleteShare(shareId) {
  const url = new URL(`https://${window.location.host}/backend-api/share/${shareId}`);
  // without passing limit it returns 50 by default
  // limit cannot be more than 20
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(url, {
    method: 'DELETE',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(res);
  }));
}
// https://chatgpt.com/backend-api/gizmos/g-p-67cf170b693c81919a56839e7cbb733d/conversations?cursor=0
async function getProjectConversations(projectId) {
  // recursive function to get all conversations
  async function getProjectConversationsPerCursor(cursor = null) {
    const url = new URL(`https://${window.location.host}/backend-api/gizmos/${projectId}/conversations`);
    if (cursor) url.searchParams.append('cursor', cursor);
    const response = await chrome.storage.sync.get(['accessToken']).then((result) => fetch(url, {
      method: 'GET',
      headers: {
        ...defaultHeaders,
        Authorization: result.accessToken,
      },
    }).then((res) => {
      if (res.ok) {
        return res.json();
      }
      return Promise.reject(res);
    }));
    if (response.cursor) {
      return response.items.concat(await getProjectConversationsPerCursor(response.cursor));
    }
    return response.items;
  }
  return getProjectConversationsPerCursor();
}
async function getConversationsByIds(conversationIds) {
  if (!conversationIds || conversationIds.length === 0) return [];

  const allConversations = [];
  for (let i = 0; i < conversationIds.length; i += 1) {
    const conversationId = conversationIds[i];
    if (!conversationId) continue;
    try {
      // eslint-disable-next-line no-await-in-loop
      const conversation = await getConversation(conversationId);

      // if failed to get conversation, skip it
      if (conversation && (conversation.conversation_id || conversation.id)) {
        allConversations.push({
          ...conversation,
          conversation_id: conversation.conversation_id || conversation.id,
        });
      }
    } catch (error) {
      // Log the error (optional) and continue with the next conversation
      console.error(`Failed to get conversation with ID: ${conversationId}`, error);
    }
  }
  return allConversations;
}
// returnsa thenable promise. If selectedConversations exist, return them, otherwise get all conversations
function getSelectedConversations(selectedConversationIds = [], includeArchived = true) {
  return new Promise((resolve) => {
    if (selectedConversationIds?.length > 0) {
      resolve(selectedConversationIds);
    } else {
      resolve(getConversationIds(null, null, includeArchived));
    }
  });
}
// https://chatgpt.com/backend-api/conversations/search?query=google&cursor=150
function searchConversations(query, cursor = null) {
  const url = new URL(`https://${window.location.host}/backend-api/conversations/search`);
  url.searchParams.append('query', query);
  if (cursor) url.searchParams.append('cursor', cursor);
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(url, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(res);
  }));
}
function getAllConversationsOld() {
  return new Promise((resolve) => {
    const allConversations = [];
    const initialOffset = 0;
    const initialLimit = 100;
    getConversations(initialOffset, initialLimit).then((convs) => {
      const {
        limit, offset, items, total,
      } = convs;
      if (typeof convs.total !== 'undefined') {
        chrome.storage.local.set({ totalConversations: convs.total });
      }
      // eslint-disable-next-line no-nested-ternary
      if (items.length === 0 || total === 0) {
        resolve([]);
        return;
      }
      allConversations.push(...items);
      if (offset + limit < total) {
        const promises = [];
        for (let i = 1; i < Math.ceil(total / limit); i += 1) {
          promises.push(getConversations(i * limit, limit));
        }
        Promise.all(promises).then((results) => {
          results.forEach((result) => {
            if (result.items) {
              allConversations.push(...result.items);
            }
          });
          resolve(allConversations.map((item) => ({ ...item, conversation_id: item.id })));
        }, (err) => {
          console.warn('error getting conversations promise', err);
          resolve(Promise.reject(err));
        });
      } else {
        resolve(allConversations.map((item) => ({ ...item, conversation_id: item.id })));
      }
    }, (err) => {
      console.warn('error getting conversations', err);
      resolve(Promise.reject(err));
    });
  });
}
// from ChatGPT
async function getAllConversations() {
  const allConversations = [];
  const firstConv = await getConversations(0, 1);
  const { total } = firstConv;
  const limit = 100;
  if (typeof total !== 'undefined') {
    chrome.storage.local.set({ totalConversations: total });
  }
  for (let offset = 0; offset < total; offset += limit) {
    // eslint-disable-next-line no-await-in-loop
    const response = await getConversations(offset, limit);
    if (!response || !response.items || response.items.length === 0) break;
    const conversations = response.items.map((item) => ({
      ...item,
      conversation_id: item.id,
    }));
    allConversations.push(...conversations);
    // wait for 5 seconds before fetching next batch
    // eslint-disable-next-line no-await-in-loop, no-promise-executor-return
    // await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  return allConversations;
}

async function getConversationIds(startDate = null, endDate = null, includeArchived = true, excludeConvInFolders = false) {
  const conversationIds = await chrome.runtime.sendMessage({
    type: 'getConversationIds',
    detail: {
      startDate,
      endDate,
      includeArchived,
      excludeConvInFolders,
    },
  });
  return conversationIds;
}
// from ChatGPT
async function getConversationIdsByDateRange(startDate, endDate) {
  let foundStart = false;
  const firstConv = await getConversations(0, 1);
  const { total } = firstConv;
  const limit = 100;
  const conversationIds = [];
  for (let i = 0; i < total && !foundStart; i += limit) {
    // eslint-disable-next-line no-await-in-loop
    const response = await getConversations(i, limit);
    if (!response || !response.items || response.items.length === 0) break;

    const { items } = response;
    // eslint-disable-next-line no-restricted-syntax
    for (const item of items) {
      const date = new Date(item.update_time.split('T')[0]).getTime();
      if (date >= startDate && date <= endDate) {
        conversationIds.push(item.id);
      } else if (date < startDate) {
        foundStart = true;
      } else if (foundStart) {
        break;
      }
    }
  }
  return conversationIds;
}
function getSharedConversations(offset = 0, limit = 100) {
  const url = new URL(`https://${window.location.host}/backend-api/shared_conversations`);
  // without passing limit it returns 50 by default
  // limit cannot be more than 20
  // const params = { offset, limit };
  // url.search = new URLSearchParams(params).toString();
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(url, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(res);
  }));
}
function getConversations(offset = 0, limit = 100, order = 'updated', isArchived = false, forceRefresh = false) {
  const cacheKey = `${offset}-${limit}-${order}-${isArchived}`;
  if (historyCache[cacheKey] && !forceRefresh) {
    return Promise.resolve(historyCache[cacheKey]);
  }
  const url = new URL(`https://${window.location.host}/backend-api/conversations`);
  // without passing limit it returns 50 by default
  // limit cannot be more than 20
  const params = { offset, limit, order };
  url.search = new URLSearchParams(params).toString();
  if (isArchived) {
    url.searchParams.append('is_archived', isArchived);
  }
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(url, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return { items: [], total: 0 };
  }).then((data) => {
    historyCache[cacheKey] = data;
    return data;
  }));
}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    const requestType = request.type;
    const data = request.detail;
    if (requestType === 'getConversations') {
      getConversations(data.offset, data.limit, data.order, data.isArchived, true).then((conversations) => {
        sendResponse(conversations);
      });
    }
  })();
  return true;
});
function getConversationsGraphql(first = 100, after = 'aWR4Oi0x', order = 'updated', expand = true, isArchived = false) {
  const url = new URL('https://chatgpt.com/graphql');
  const variables = {
    first,
    after,
    order,
    expand,
    isArchived,
  };
  const extensions = {
    persistedQuery: {
      sha256Hash: '5f5770417560c56ba8fa929b84900b53f40cdcc3906d5197003e9ecf7adf3bb7',
      version: 1,
    },
  };
  url.searchParams.append('variables', JSON.stringify(variables));
  url.searchParams.append('extensions', JSON.stringify(extensions));

  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(url, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(res);
  }).then((r) => ({
    items: r.data.conversationDisplayHistory.edges.map((edge) => edge.node),
    pageInfo: r.data.conversationDisplayHistory.pageInfo,
  })));
}
function updateConversation(id, data) {
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(`/backend-api/conversation/${id}`, {
    method: 'PATCH',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
    body: JSON.stringify(data),
  }).then((res) => res.json()));
}
function generateTitle(conversationId, messageId) {
  const data = {
    message_id: messageId,
  };
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(`/backend-api/conversation/gen_title/${conversationId}`, {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
    body: JSON.stringify(data),
  }).then((response) => response.json()));
}
function renameConversation(conversationId, title) {
  historyCache = {};
  delete conversationsCache[conversationId];
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(`/backend-api/conversation/${conversationId}`, {
    method: 'PATCH',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
    body: JSON.stringify({ title }),
  }).then((res) => res.json()));
}
function archiveAllConversations() {
  historyCache = {};
  conversationsCache = {};
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch('/backend-api/conversations', {
    method: 'PATCH',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
    body: JSON.stringify({ is_archived: true }),
  }).then((res) => {
    if (res.ok) {
      toast('All conversations are archived', 'success');
      document.querySelector('#conversation-list').querySelectorAll('[id^=conversation-button]').forEach((item) => {
        item.remove();
      });
      return res.json();
    }
    return Promise.reject(res);
  }));
}
function archiveConversation(conversationId) {
  historyCache = {};
  delete conversationsCache[conversationId];
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(`/backend-api/conversation/${conversationId}`, {
    method: 'PATCH',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
    body: JSON.stringify({ is_archived: true }),
  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(res);
  }));
}
function unarchiveConversation(conversationId) {
  historyCache = {};
  delete conversationsCache[conversationId];
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(`/backend-api/conversation/${conversationId}`, {
    method: 'PATCH',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
    body: JSON.stringify({ is_archived: false }),
  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(res);
  }));
}
function deleteConversation(conversationId) {
  historyCache = {};
  delete conversationsCache[conversationId];
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(`/backend-api/conversation/${conversationId}`, {
    method: 'PATCH',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
    body: JSON.stringify({ is_visible: false }),
  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(res);
  }));
}
function deleteAllConversations() {
  historyCache = {};
  conversationsCache = {};
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch('/backend-api/conversations', {
    method: 'PATCH',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
    body: JSON.stringify({ is_visible: false }),
  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(res);
  }));
}

function updateAsyncStatus(conversationId) {
  const asyncIndicatorElement = document.querySelector(`#conversation-button-${conversationId} #async-indicator-${conversationId}`);
  if (asyncIndicatorElement) {
    asyncIndicatorElement.remove();
  }
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(`/backend-api/conversation/${conversationId}/async-status`, {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then(async (res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(res);
  }));
}
// https://chatgpt.com/backend-api/conversation/67003a15-1fb8-800c-a04f-191dbf670f3b/textdocs
function getConversationTextDocs(conversationId, forceRefresh = false) {
  if (conversationTextDocsCache[conversationId] && !forceRefresh) {
    return Promise.resolve(conversationTextDocsCache[conversationId]);
  }
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(`/backend-api/conversation/${conversationId}/textdocs`, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(res);
  }));
}
// https://chatgpt.com/backend-api/textdoc/6700725713008191b0773cfae3564a1a
function getTextDoc(textDocId, forceRefresh = false) {
  if (textDocCache[textDocId] && !forceRefresh) {
    return Promise.resolve(textDocCache[textDocId]);
  }
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(`/backend-api/textdoc/${textDocId}`, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(res);
  }));
}
// https://chatgpt.com/backend-api/textdoc/6700725713008191b0773cfae3564a1a/history?before_version=2
function getTextDocHistory(textDocId, beforeVersion) {
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(`/backend-api/textdoc/${textDocId}/history?before_version=${beforeVersion}`, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(res);
  }));
}
// previous_doc_states: [
//   {
//     id: '6700725713008191b0773cfae3564a1a',
//     version: 2,
//     content: 'remote work insights',
//     title: 'remote_work_insights',
//     textdoc_type: 'document',
//     comments: [],
//     updated_at: '2024-10-04T23:00:12.502090Z',
//   },
//   {
//     id: '6700725713008191b0773cfae3564a1a',
//     version: 1,
//     content: 'remote work insights',
//     title: 'remote_work_insights',
//     textdoc_type: 'document',
//     comments: [],
//     updated_at: '2024-10-04T22:55:19.082876Z',
//   },
// ];
