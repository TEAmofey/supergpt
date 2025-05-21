/* global */
const originalFetch = window.fetch;

// eslint-disable-next-line func-names
window.fetch = async function (...args) {
  const input = args[0];
  let url;

  if (input instanceof Request) {
    url = input.url;
  } else if (input instanceof URL) {
    url = input.href;
  } else {
    url = input;
  }

  let bodyObj = {};
  if (args.length > 1 && args[1]?.body) {
    try {
      bodyObj = JSON.parse(args[1]?.body);
    } catch (e) {
      // do nothing
    }
  }
  const queryParams = new URLSearchParams(url.split('?')[1]);

  // before making the request
  if (url.endsWith('backend-api/conversation') && args[1]?.method === 'POST') {
    let shouldReplaceBodyObj = false;
    if (bodyObj.messages) {
      const selectedModel = window.sessionStorage.getItem('sp/selectedModel');
      if (selectedModel) {
        bodyObj = {
          ...bodyObj,
          model: selectedModel,
        };
        shouldReplaceBodyObj = true;
      }
      const lastInstruction = window.localStorage.getItem('sp/lastInstruction');
      if (lastInstruction && lastInstruction !== 'null') {
        // prepend instructions to the first message
        // instructionsCache: {message.id: instructions, message.id: instructions}
        const instructionsCache = JSON.parse(window.localStorage.getItem('sp/instructionsCache') || '{}');
        const firstMessageId = bodyObj.messages[0].id;
        instructionsCache[firstMessageId] = lastInstruction;
        window.localStorage.setItem('sp/instructionsCache', JSON.stringify(instructionsCache));
        window.localStorage.setItem('sp/lastInstruction', null);
        const userMessage = bodyObj.messages.find((message) => message.author.role === 'user');
        if (userMessage) {
          const messageText = userMessage?.content?.parts.find((part) => typeof part === 'string');
          if (messageText !== undefined) {
            // update body by replacing the messageText with `${lastInstruction}${messageText || ''}`
            const newMessageText = `${lastInstruction}${messageText || ''}`;
            // replace the messageText with newMessageText
            userMessage.content.parts = userMessage.content.parts.map((part) => (part === messageText ? newMessageText : part));
            // update the bodyObj
            bodyObj.messages = bodyObj.messages.map((message) => (message.id === userMessage.id ? userMessage : message));
          }
        }
        shouldReplaceBodyObj = true;
      }
      if (shouldReplaceBodyObj) {
        args[1].body = JSON.stringify(bodyObj);
      }
      const conversationSubmittedEvent = new CustomEvent('conversationSubmitted', {
        detail: {
          messages: bodyObj.messages,
          instructions: lastInstruction,
        },
      });
      window.dispatchEvent(conversationSubmittedEvent);
    }
  }

  // make the request
  const response = await originalFetch(...args);

  // after making the request
  // if (response && url.includes('backend-api/prompt_library')) {
  //   // do nothing
  //   if (window.localStorage.getItem('sp/autoSync' || 'true') === 'true') {
  //     // wait 10 seconds. this is to prevent the double "Hi, how can I help?" issue
  //     // eslint-disable-next-line no-promise-executor-return
  //     await new Promise((resolve) => setTimeout(resolve, 10000));
  //     return '';
  //   }
  // }
  if (response && url.endsWith('backend-anon/me')) {
    const responseData = await response.clone().json();

    if (!responseData?.email || responseData?.id?.startsWith('ua-')) {
      window.localStorage.setItem('sp/isLoggedIn', 'false');
      const signoutReceivedEvent = new CustomEvent('signoutReceived', {
        detail: responseData,
      });
      window.dispatchEvent(signoutReceivedEvent);
    }
  }

  if (response && url.endsWith('backend-api/me')) {
    let accessToken;
    if (args.length > 1 && args[1]?.headers) {
      accessToken = args[1].headers.Authorization;
    }

    const responseData = await response.clone().json();

    if (accessToken && responseData?.id && !responseData?.id?.startsWith('ua-')) {
      window.localStorage.setItem('sp/isLoggedIn', 'true');
      const authReceivedEvent = new CustomEvent('authReceived', {
        detail: { ...responseData, accessToken },
      });
      window.dispatchEvent(authReceivedEvent);
    }
  }

  if (response && url.endsWith('api/auth/signout')) {
    const responseData = await response.clone().json();
    if (responseData?.success) {
      window.localStorage.setItem('sp/isLoggedIn', 'false');
      const signoutReceivedEvent = new CustomEvent('signoutReceived', {
        detail: responseData,
      });
      window.dispatchEvent(signoutReceivedEvent);
    }
  }
  // https://chatgpt.com/backend-api/stop_conversation
  if (response && url.endsWith('backend-api/stop_conversation') && args[1]?.method === 'POST') {
    const responseData = await response.clone().json();
    const stopConversationReceivedEvent = new CustomEvent('stopConversationReceived', {
      detail: responseData,
    });
    window.dispatchEvent(stopConversationReceivedEvent);
  }

  // if (response && url.includes('backend-api/sentinel/chat-requirements')) {
  //   window.localStorage.setItem('sp/chatRequirementsPayload', bodyObj.p);
  //   const responseData = await response.clone().json();

  //   if (responseData.proofofwork) {
  //     const chatRequirementsReceivedEvent = new CustomEvent('chatRequirementsReceived', {
  //       detail: responseData,
  //     });
  //     window.dispatchEvent(chatRequirementsReceivedEvent);
  //   }
  // }

  // if (response && url.includes('discovery_anon')) {
  //   return '';
  // }
  if (response && url.includes('backend-api/gizmos/g-') && !url.includes('backend-api/gizmos/g-p-')) {
    const responseData = await response.clone().json();
    if (responseData?.detail?.toLowerCase().includes('not found')) {
      const gizmoNotFoundEvent = new CustomEvent('gizmoNotFound', {
        detail: url,
      });
      window.dispatchEvent(gizmoNotFoundEvent);
    } else if (responseData?.gizmo?.id) {
      const gizmoReceivedEvent = new CustomEvent('gizmoReceived', {
        detail: responseData,
      });
      window.dispatchEvent(gizmoReceivedEvent);
    }
  }

  if (response && url.includes('backend-api/gizmos/bootstrap')) {
    const responseData = await response.clone().json();
    const gizmosBootstrapReceivedEvent = new CustomEvent('gizmosBootstrapReceived', {
      detail: responseData,
    });
    window.dispatchEvent(gizmosBootstrapReceivedEvent);
    // return '';
  }
  if (response && url.includes('public-api/gizmos/discovery')) {
    const responseData = await response.clone().json();
    if (responseData?.cuts) {
      const gizmoDiscoveryReceivedEvent = new CustomEvent('gizmoDiscoveryReceived', {
        detail: responseData,
      });
      window.dispatchEvent(gizmoDiscoveryReceivedEvent);
    }
  }

  if (response && url.includes('backend-api/gizmos/g-') && url.endsWith('sidebar') && args[1]?.method === 'POST') {
    const responseData = await response.clone().json();
    const gizmoSidebarUpdateReceivedEvent = new CustomEvent('gizmoSidebarUpdateReceived', {
      detail: responseData,
    });
    window.dispatchEvent(gizmoSidebarUpdateReceivedEvent);
  }

  if (response && url.includes('backend-api/accounts/check')) {
    // get authorization header from request
    let accessToken;
    if (args.length > 1 && args[1]?.headers) {
      accessToken = args[1].headers.Authorization;
    }
    const responseData = await response.clone().json();
    if (accessToken && responseData.accounts) {
      const accountReceivedEvent = new CustomEvent('accountReceived', {
        detail: {
          responseData,
          accessToken,
        },
      });
      window.dispatchEvent(accountReceivedEvent);
    }
  }

  // old version: https://chatgpt.com/backend-api/files/file-fEqeMhveAvWu1DTbZlJZuXLt/download
  if (response && url.includes('backend-api/files/file') && url.endsWith('/download') && args[1]?.method === 'GET') {
    const fileId = url.split('/files/')[1].split('/download')[0];
    const responseData = await response.clone().json();
    if (responseData) {
      const fileReceivedEvent = new CustomEvent('fileReceived', {
        detail: {
          data: responseData,
          fileId,
        },
      });
      window.dispatchEvent(fileReceivedEvent);
    }
  }
  // new version: https://chatgpt.com/backend-api/files/download/file-fEqeMhveAvWu1DTbZlJZuXLt
  if (response && url.includes('backend-api/files/download/file') && args[1]?.method === 'GET') {
    const fileId = url.split('/files/download/')[1];
    const responseData = await response.clone().json();
    if (responseData) {
      const fileReceivedEvent = new CustomEvent('fileReceived', {
        detail: {
          data: responseData,
          fileId,
        },
      });
      window.dispatchEvent(fileReceivedEvent);
    }
  }
  // newer version https://chatgpt.com/backend-api/conversation/67c38cf8-5d3c-800c-95e6-d05fc251cd3b/attachment/file-GsPYyKBSXVNATi7gHqZvdR/download
  if (response && url.includes('backend-api/conversation/') && url.includes('/attachment/file') && url.endsWith('/download') && args[1]?.method === 'GET') {
    const fileId = url.split('/attachment/')[1].split('/download')[0];
    const responseData = await response.clone().json();
    if (responseData) {
      const fileReceivedEvent = new CustomEvent('fileReceived', {
        detail: {
          data: responseData,
          fileId,
        },
      });
      window.dispatchEvent(fileReceivedEvent);
    }
  }
  // https://chatgpt.com/backend-api/conversation/67007253-0c2c-800c-a6ac-e3ed7a76f1e9/textdocs
  if (response && url.includes('backend-api/conversation/') && url.endsWith('/textdocs') && args[1]?.method === 'GET') {
    const conversationId = url.split('/conversation/')[1].split('/textdocs')[0];
    const responseData = await response.clone().json();
    if (responseData) {
      const textdocsReceivedEvent = new CustomEvent('textdocsReceived', {
        detail: {
          textdocs: responseData,
          conversationId,
        },
      });
      window.dispatchEvent(textdocsReceivedEvent);
    }
  }
  if (response && url.includes('backend-api/settings/user')) {
    const responseData = await response.clone().json();
    if (responseData) {
      const userSettingsReceivedEvent = new CustomEvent('userSettingsReceived', {
        detail: responseData,
      });
      window.dispatchEvent(userSettingsReceivedEvent);
    }
  }

  // not including is_archived or is_archived=false
  if (response && url.includes('backend-api/conversations?') && parseInt(queryParams.get('limit'), 10) === 28 && parseInt(queryParams.get('offset'), 10) % 28 === 0 && (queryParams.get('is_archived') === 'false' || queryParams.get('is_archived') === null)) {
    const responseData = await response.clone().json();
    const historyLoadedReceivedEvent = new CustomEvent('historyLoadedReceived', {
      detail: responseData,
    });
    const delayMultiple = Math.floor(parseInt(queryParams.get('offset'), 10) / 28);

    setTimeout(() => {
      window.dispatchEvent(historyLoadedReceivedEvent);
    }, 1000 * delayMultiple);
  }

  // graphql support
  if (response && url.includes('graphql?')) {
    const variables = JSON.parse(queryParams.get('variables'));
    if (variables.first === 28 && variables.after === 'aWR4Oi0x' && variables?.isArchived === false) {
      const responseData = await response.clone().json();
      const historyLoadedReceivedEvent = new CustomEvent('historyLoadedReceived', {
        detail: responseData,
      });

      window.dispatchEvent(historyLoadedReceivedEvent);
    }
  }

  // project conversations
  // https://chatgpt.com/backend-api/gizmos/g-p-67bd23880da08191b5291459d778edd5/conversations?cursor=0
  // if (response && url.includes('backend-api/gizmos/') && url.includes('/conversations?cursor=') && !url.includes('/conversations?cursor=0')) {
  //   const responseData = await response.clone().json();
  //   const conversations = responseData.items || [];
  //   const projectConversationsReceivedEvent = new CustomEvent('projectConversationsReceived', {
  //     detail: conversations,
  //   });
  //   window.dispatchEvent(projectConversationsReceivedEvent);
  // }
  // // https://chatgpt.com/backend-api/gizmos/snorlax/sidebar?conversations_per_gizmo=5
  // if (response && url.includes('backend-api/gizmos/snorlax/sidebar')) {
  //   const responseData = await response.clone().json();
  //   const conversations = responseData.items.map((item) => item.conversations.items).flat() || [];
  //   const projectConversationsReceivedEvent = new CustomEvent('projectConversationsReceived', {
  //     detail: conversations,
  //   });
  //   window.dispatchEvent(projectConversationsReceivedEvent);
  // }

  if (response && url.includes('backend-api/conversations') && bodyObj.is_archived === true && args[1]?.method === 'PATCH') {
    const responseData = await response.clone().json();
    const archivedAllReceivedEvent = new CustomEvent('archivedAllReceived', {
      detail: responseData,
    });
    window.dispatchEvent(archivedAllReceivedEvent);
  }

  if (response && url.includes('backend-api/conversations') && bodyObj.is_visible === false && args[1]?.method === 'PATCH') {
    const responseData = await response.clone().json();
    const deleteAllReceivedEvent = new CustomEvent('deleteAllReceived', {
      detail: responseData,
    });
    window.dispatchEvent(deleteAllReceivedEvent);
  }

  if (response && url.includes('backend-api/conversation/') && bodyObj.is_archived === false && args[1]?.method === 'PATCH') {
    // const responseData = await response.clone().json();
    const conversationId = url.split('/').pop();
    const conversationUnarchivedReceivedEvent = new CustomEvent('conversationUnarchivedReceived', {
      detail: { conversationId },
    });
    window.dispatchEvent(conversationUnarchivedReceivedEvent);
  }

  if (response && url.includes('backend-api/conversation/') && bodyObj.is_archived === true && args[1]?.method === 'PATCH') {
    // const responseData = await response.clone().json();
    const conversationId = url.split('/').pop();
    const conversationUnarchivedReceivedEvent = new CustomEvent('conversationArchivedReceived', {
      detail: { conversationId },
    });
    window.dispatchEvent(conversationUnarchivedReceivedEvent);
  }

  if (response && url.includes('backend-api/conversation/') && bodyObj.is_visible === false && args[1]?.method === 'PATCH') {
    // const responseData = await response.clone().json();
    const conversationId = url.split('/').pop();
    const conversationDeleteReceivedEvent = new CustomEvent('conversationDeleteReceived', {
      detail: { conversationId },
    });
    window.dispatchEvent(conversationDeleteReceivedEvent);
  }

  if (response && url.includes('backend-api/conversation/') && Object.keys(bodyObj).includes('title') && args[1]?.method === 'PATCH') {
    // const responseData = await response.clone().json();
    const conversationId = url.split('/').pop();
    const conversationRenameReceivedEvent = new CustomEvent('conversationRenameReceived', {
      detail: {
        conversationId,
        title: bodyObj.title,
      },
    });
    window.dispatchEvent(conversationRenameReceivedEvent);
  }

  if (response && url.includes('backend-api/conversation/') && args[1]?.method === 'GET') {
    const convId = url.split('/').pop();
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(convId)) {
      const responseData = await response.clone().json();
      // deleye moderation_results = [] to prevent the "This conversation has been flagged for moderation" message
      const conversationId = responseData.conversation_id || responseData.id || convId;
      if (conversationId) {
        const conversationReceivedEvent = new CustomEvent('conversationReceived', {
          detail: {
            conversation: {
              ...responseData,
              conversation_id: conversationId,
            },
          },
        });
        window.dispatchEvent(conversationReceivedEvent);
      }
      // const newResponse = new Response(JSON.stringify(responseData), response);
      // return newResponse;
    }
  }
  if (response && url.includes('backend-api/tasks/deepresch_') && url.endsWith('/stream')) {
    // console.warn('deepResearch started');

    const responseData = await response.clone();
    const reader = responseData.body.getReader();
    const decoder = new TextDecoder('utf-8');

    let deepResearchStreamCompleteReceived = false;
    // Read each chunk from the stream
    reader.read().then(function processStream({ done, value }) {
      // Decode and append chunk to result
      const newData = decoder.decode(value, { stream: true });

      deepResearchStreamCompleteReceived = deepResearchStreamCompleteReceived || newData?.includes('final_message');

      if (deepResearchStreamCompleteReceived) {
        // console.warn('deepResearch stream complete');
        const deepResearchFinalMessageReceivedEvent = new CustomEvent('deepResearchFinalMessageReceived', {
          detail: {},
        });

        window.dispatchEvent(deepResearchFinalMessageReceivedEvent);
        return reader.cancel();
      }
      if (done) {
        // console.warn('deepResearch done');
        return reader.cancel();
      }

      // Continue reading the stream
      return reader.read().then(processStream);
    });
  }
  if (response && url.endsWith('backend-api/conversation') && args[1]?.method === 'POST') {
    const responseData = await response.clone();
    const reader = responseData.body.getReader();
    const decoder = new TextDecoder('utf-8');

    let messageStreamCompleteReceived = false;
    let doneReceived = false;
    let conversationTitle = 'New chat';
    let conversationId;
    // let deepResearch = false;
    // Read each chunk from the stream
    reader.read().then(function processStream({ done, value }) {
      // Decode and append chunk to result
      const newData = decoder.decode(value, { stream: true });

      messageStreamCompleteReceived = messageStreamCompleteReceived || newData?.includes('message_stream_complete');

      doneReceived = messageStreamCompleteReceived && (doneReceived || done || newData?.includes('DONE'));

      //  {"async_task_conversation_id": "67be777f-15b0-800c-a8c0-3073e62272e0", "async_task_created_at": "2025-02-26 02:07:59.656871+00:00", "async_task_id": "deepresch_67be777f02a081919fa76d700eaae1ab"}
      // deepResearch = deepResearch || (newData?.includes('async_task_id') && newData?.includes('deepresch_'));
      // if (deepResearch) {
      //   console.warn('deepResearch found');
      // }
      // date: {"type": "message_stream_complete", "conversation_id": "67a59a3c-8ae0-800c-9196-7045d756ca09"}
      if (messageStreamCompleteReceived && !conversationId) {
        try {
          const streamCompleteData = JSON.parse(newData.split('data: ')?.[1]);
          conversationId = streamCompleteData.conversation_id;
        } catch (e) {
          // do nothing
        }
      }
      // data: {"type": "title_generation", "title": "Hello conversation", "conversation_id": "67a59a3c-8ae0-800c-9196-7045d756ca09"}
      if (newData.includes('title_generation')) {
        try {
          const titleData = JSON.parse(newData.split('data: ')?.[1]);
          conversationTitle = titleData.title;
          if (!conversationId) {
            conversationId = titleData.conversation_id;
          }
        } catch (e) {
          // do nothing
        }
      }

      if (messageStreamCompleteReceived && doneReceived) {
        // if (!deepResearch) {
        // console.warn('Stream complete');
        const conversationResponseEndedEvent = new CustomEvent('conversationResponseEnded', {
          detail: {
            conversationId,
            conversationTitle,
          },
        });

        window.dispatchEvent(conversationResponseEndedEvent);
        // }
        return reader.cancel();
      }

      // Continue reading the stream
      return reader.read().then(processStream);
    });
  }

  if (response && url.includes('public-api/conversation_limit')) {
    const responseData = await response.clone().json();
    if (responseData.message_cap) {
      const conversationLimitReceivedEvent = new CustomEvent('conversationLimitReceived', {
        detail: responseData,
      });
      window.dispatchEvent(conversationLimitReceivedEvent);
    }
  }
  if (response && url.includes('backend-api/models')) {
    const responseData = await response.clone().json();
    if (responseData.models) {
      const modelsReceivedEvent = new CustomEvent('modelsReceived', {
        detail: responseData,
      });
      window.dispatchEvent(modelsReceivedEvent);
    }
  }

  // https://ab.chatgpt.com/v1/rgstr
  if (response && url.includes('ab.chatgpt.com/v1/rgstr')) {
    const responseData = await response.clone().json();
    if (responseData?.success) {
      const rgstrEvent = new CustomEvent('rgstrEventReceived', {
        detail: {
          payload: bodyObj,
        },
      });
      window.dispatchEvent(rgstrEvent);
    }
  }

  return response;
};
