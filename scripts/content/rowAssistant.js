/* eslint-disable no-restricted-globals */
/* global markdown, katex, texmath, markdownitSup, hljs, getDownloadUrlFromFileId, formatTime, toast, downloadFileFromUrl, formatDateDalle, openDalleEditor, citationAttributions, closeMenus, cachedSettings */
// const diffdom = new diffDOM.DiffDOM({ valueDiffing: false, diffcap: 1 });

// eslint-disable-next-line no-unused-vars
function rowAssistant(conversation, nodes, childIndex, childCount, models, gizmoData, isLoading = false, streaming = false) {
  const {
    customConversationWidth, conversationWidth, showMessageTimestamp, showWordCount,
  } = cachedSettings;

  // overall info
  const { pinned, message: lastMessage } = nodes[nodes.length - 1];
  const {
    id, metadata,
  } = lastMessage;
  let createTime = lastMessage.create_time;
  if (!createTime) {
    createTime = new Date().toISOString();
  }

  const modelSlug = metadata.model_slug;
  const messageTimestamp = new Date(formatTime(createTime)).toLocaleString();
  const modelTitle = models?.find((m) => m.slug === modelSlug)?.title;
  const avatar = (gizmoData && gizmoData?.resource?.gizmo?.id === nodes[0]?.message?.metadata?.gizmo_id) ? gizmoData?.resource?.gizmo?.display?.profile_picture_url : 'https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png';
  const displayName = (gizmoData && gizmoData?.resource?.gizmo?.id === nodes[0]?.message?.metadata?.gizmo_id) ? gizmoData?.resource?.gizmo?.display?.name : '&nbsp;';
  let renderedNodes = '';
  let nodeWordCounts = 0;
  let nodeCharCounts = 0;
  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i];
    const role = node.message?.role || node.message?.author?.role;
    const recipient = node.message?.recipient;
    if (role === 'assistant') {
      if (node.message?.content?.content_type === 'model_editable_context') continue;
      if (recipient === 'all') { // assistant to all (user)
        const { renderedNode, wordCount, charCount } = assistantRenderer(node, streaming);
        renderedNodes += renderedNode;
        nodeWordCounts += wordCount;
        nodeCharCounts += charCount;
      } else { // assistant to plugin
        renderedNodes += pluginDropdownRenderer(node, isLoading, false);
      }
    } else { // role == 'tool'
      // tool to all
      if (recipient === 'all') {
        // check if metadata has a key = invoked_plugin. if key jit_plugin_data it's action response and will be skipped since it's already rendered in actionConfirmationRenderer
        const isPluginResponse = 'invoked_plugin' in node.message.metadata || node.message.author.name === 'python';
        const strawberryResponse = node.message.author.name === 'a8km123';
        const imageDisplayed = node?.message?.content?.text?.includes('<<ImageDisplayed>>');
        if (isPluginResponse) {
          if (imageDisplayed) {
            renderedNodes += pythonImageSkeleton(node);
          } else {
            // create an html element from rendered nodes
            const el = document.createElement('div');
            el.innerHTML = renderedNodes;
            const lastMessagePluginContent = [...el.querySelectorAll('[id^=message-plugin-content-]')].pop();
            lastMessagePluginContent?.insertAdjacentHTML('beforeend', pluginContentRenderer(node));
            renderedNodes = el.innerHTML;
          }
        } else if (strawberryResponse) {
          renderedNodes += strawberryDropdownRenderer(node);
        }
        // tool to assistant (Action Request)
      } else if (recipient === 'assistant') {
        const requestNode = node;
        const responseNode = conversation.mapping[requestNode.children[childIndex - 1]];
        renderedNodes += actionConfirmationRenderer(requestNode, responseNode, displayName);
      }
    }
  }

  return `<article id="message-wrapper-${id}" data-role="assistant"
  class="group w-full p-5 pb-0 text-token-text-primary ${pinned ? 'border-l-pinned bg-pinned dark:bg-pinned border-b scroll-margin-top-60' : 'bg-token-main-surface-primary'}">
  <div class="relative text-base gap-4 m-auto md:max-w-2xl lg:max-w-2xl xl:max-w-3xl flex" style="${customConversationWidth ? `max-width:${conversationWidth}%` : ''}">
    <div class="flex-shrink-0 flex flex-col relative items-end">
    ${(gizmoData || nodes[0]?.message?.metadata?.gizmo_id) ? `<div class="gizmo-shadow-stroke relative flex h-8 w-8"><img id="gizmo-avatar" data-gizmoid="${nodes[0]?.message?.metadata?.gizmo_id || gizmoData?.resource?.gizmo?.id}" src="${avatar}" class="h-full w-full bg-token-main-surface-tertiary rounded-full" alt="GPT" width="80" height="80">
        </div>` : `<div class="gizmo-bot-avatar flex h-8 w-8 items-center justify-center overflow-hidden rounded-full"><div style="width:24px;height:24px;" title="${modelTitle}"
        class="relative p-1 rounded-sm flex items-center justify-center bg-token-main-surface-primary text-token-text-primary h-8 w-8"><svg width="41" height="41" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md" role="img"><text x="-9999" y="-9999">ChatGPT</text><path d="M37.5324 16.8707C37.9808 15.5241 38.1363 14.0974 37.9886 12.6859C37.8409 11.2744 37.3934 9.91076 36.676 8.68622C35.6126 6.83404 33.9882 5.3676 32.0373 4.4985C30.0864 3.62941 27.9098 3.40259 25.8215 3.85078C24.8796 2.7893 23.7219 1.94125 22.4257 1.36341C21.1295 0.785575 19.7249 0.491269 18.3058 0.500197C16.1708 0.495044 14.0893 1.16803 12.3614 2.42214C10.6335 3.67624 9.34853 5.44666 8.6917 7.47815C7.30085 7.76286 5.98686 8.3414 4.8377 9.17505C3.68854 10.0087 2.73073 11.0782 2.02839 12.312C0.956464 14.1591 0.498905 16.2988 0.721698 18.4228C0.944492 20.5467 1.83612 22.5449 3.268 24.1293C2.81966 25.4759 2.66413 26.9026 2.81182 28.3141C2.95951 29.7256 3.40701 31.0892 4.12437 32.3138C5.18791 34.1659 6.8123 35.6322 8.76321 36.5013C10.7141 37.3704 12.8907 37.5973 14.9789 37.1492C15.9208 38.2107 17.0786 39.0587 18.3747 39.6366C19.6709 40.2144 21.0755 40.5087 22.4946 40.4998C24.6307 40.5054 26.7133 39.8321 28.4418 38.5772C30.1704 37.3223 31.4556 35.5506 32.1119 33.5179C33.5027 33.2332 34.8167 32.6547 35.9659 31.821C37.115 30.9874 38.0728 29.9178 38.7752 28.684C39.8458 26.8371 40.3023 24.6979 40.0789 22.5748C39.8556 20.4517 38.9639 18.4544 37.5324 16.8707ZM22.4978 37.8849C20.7443 37.8874 19.0459 37.2733 17.6994 36.1501C17.7601 36.117 17.8666 36.0586 17.936 36.0161L25.9004 31.4156C26.1003 31.3019 26.2663 31.137 26.3813 30.9378C26.4964 30.7386 26.5563 30.5124 26.5549 30.2825V19.0542L29.9213 20.998C29.9389 21.0068 29.9541 21.0198 29.9656 21.0359C29.977 21.052 29.9842 21.0707 29.9867 21.0902V30.3889C29.9842 32.375 29.1946 34.2791 27.7909 35.6841C26.3872 37.0892 24.4838 37.8806 22.4978 37.8849ZM6.39227 31.0064C5.51397 29.4888 5.19742 27.7107 5.49804 25.9832C5.55718 26.0187 5.66048 26.0818 5.73461 26.1244L13.699 30.7248C13.8975 30.8408 14.1233 30.902 14.3532 30.902C14.583 30.902 14.8088 30.8408 15.0073 30.7248L24.731 25.1103V28.9979C24.7321 29.0177 24.7283 29.0376 24.7199 29.0556C24.7115 29.0736 24.6988 29.0893 24.6829 29.1012L16.6317 33.7497C14.9096 34.7416 12.8643 35.0097 10.9447 34.4954C9.02506 33.9811 7.38785 32.7263 6.39227 31.0064ZM4.29707 13.6194C5.17156 12.0998 6.55279 10.9364 8.19885 10.3327C8.19885 10.4013 8.19491 10.5228 8.19491 10.6071V19.808C8.19351 20.0378 8.25334 20.2638 8.36823 20.4629C8.48312 20.6619 8.64893 20.8267 8.84863 20.9404L18.5723 26.5542L15.206 28.4979C15.1894 28.5089 15.1703 28.5155 15.1505 28.5173C15.1307 28.5191 15.1107 28.516 15.0924 28.5082L7.04046 23.8557C5.32135 22.8601 4.06716 21.2235 3.55289 19.3046C3.03862 17.3858 3.30624 15.3413 4.29707 13.6194ZM31.955 20.0556L22.2312 14.4411L25.5976 12.4981C25.6142 12.4872 25.6333 12.4805 25.6531 12.4787C25.6729 12.4769 25.6928 12.4801 25.7111 12.4879L33.7631 17.1364C34.9967 17.849 36.0017 18.8982 36.6606 20.1613C37.3194 21.4244 37.6047 22.849 37.4832 24.2684C37.3617 25.6878 36.8382 27.0432 35.9743 28.1759C35.1103 29.3086 33.9415 30.1717 32.6047 30.6641C32.6047 30.5947 32.6047 30.4733 32.6047 30.3889V21.188C32.6066 20.9586 32.5474 20.7328 32.4332 20.5338C32.319 20.3348 32.154 20.1698 31.955 20.0556ZM35.3055 15.0128C35.2464 14.9765 35.1431 14.9142 35.069 14.8717L27.1045 10.2712C26.906 10.1554 26.6803 10.0943 26.4504 10.0943C26.2206 10.0943 25.9948 10.1554 25.7963 10.2712L16.0726 15.8858V11.9982C16.0715 11.9783 16.0753 11.9585 16.0837 11.9405C16.0921 11.9225 16.1048 11.9068 16.1207 11.8949L24.1719 7.25025C25.4053 6.53903 26.8158 6.19376 28.2383 6.25482C29.6608 6.31589 31.0364 6.78077 32.2044 7.59508C33.3723 8.40939 34.2842 9.53945 34.8334 10.8531C35.3826 12.1667 35.5464 13.6095 35.3055 15.0128ZM14.2424 21.9419L10.8752 19.9981C10.8576 19.9893 10.8423 19.9763 10.8309 19.9602C10.8195 19.9441 10.8122 19.9254 10.8098 19.9058V10.6071C10.8107 9.18295 11.2173 7.78848 11.9819 6.58696C12.7466 5.38544 13.8377 4.42659 15.1275 3.82264C16.4173 3.21869 17.8524 2.99464 19.2649 3.1767C20.6775 3.35876 22.0089 3.93941 23.1034 4.85067C23.0427 4.88379 22.937 4.94215 22.8668 4.98473L14.9024 9.58517C14.7025 9.69878 14.5366 9.86356 14.4215 10.0626C14.3065 10.2616 14.2466 10.4877 14.2479 10.7175L14.2424 21.9419ZM16.071 17.9991L20.4018 15.4978L24.7325 17.9975V22.9985L20.4018 25.4983L16.071 22.9985V17.9991Z" fill="currentColor"></path></svg></div></div>`}
      
    </div>
    <div class="relative flex flex-col agent-turn" style="width:calc(100% - 80px);">
      <div class="flex flex-grow flex-col gap-1 max-w-full">
        ${renderedNodes}
        <div id="message-action-wrapper-${id}" class="flex justify-between empty:hidden lg:block">
        <div class="text-token-text-secondary flex self-end mt-2 visible gap-1">

        <div id="thread-buttons-wrapper-${id}" class="text-xs flex items-center justify-center gap-1 self-center ${childCount === 1 ? 'hidden' : ''}"><button id="thread-prev-button-${id}" class="flex h-[30px] w-[30px] items-center justify-center rounded-md hover:bg-token-main-surface-secondary disabled:opacity-50 disabled:hover:bg-transparent" rounded-lg hover:bg-token-main-surface-secondary ${childIndex === 1 ? 'disabled' : ''}><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md-heavy"><path fill-rule="evenodd" clip-rule="evenodd" d="M14.7071 5.29289C15.0976 5.68342 15.0976 6.31658 14.7071 6.70711L9.41421 12L14.7071 17.2929C15.0976 17.6834 15.0976 18.3166 14.7071 18.7071C14.3166 19.0976 13.6834 19.0976 13.2929 18.7071L7.29289 12.7071C7.10536 12.5196 7 12.2652 7 12C7 11.7348 7.10536 11.4804 7.29289 11.2929L13.2929 5.29289C13.6834 4.90237 14.3166 4.90237 14.7071 5.29289Z" fill="currentColor"></path></svg></button><span id="thread-count-wrapper-${id}" class="flex-grow flex-shrink-0">${childIndex} / ${childCount}</span><button id="thread-next-button-${id}" class="flex h-[30px] w-[30px] items-center justify-center rounded-md hover:bg-token-main-surface-secondary disabled:opacity-50 disabled:hover:bg-transparent" ${childIndex === childCount ? 'disabled' : ''}><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md-heavy"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.29289 18.7071C8.90237 18.3166 8.90237 17.6834 9.29289 17.2929L14.5858 12L9.29289 6.70711C8.90237 6.31658 8.90237 5.68342 9.29289 5.29289C9.68342 4.90237 10.3166 4.90237 10.7071 5.29289L16.7071 11.2929C16.8946 11.4804 17 11.7348 17 12C17 12.2652 16.8946 12.5196 16.7071 12.7071L10.7071 18.7071C10.3166 19.0976 9.68342 19.0976 9.29289 18.7071Z" fill="currentColor"></path></svg></button></div>

        <!--button id="copy-message-button-${id}" class="p-1 rounded-md text-token-text-tertiary hover:text-token-text-primary rounded-lg hover:bg-token-main-surface-secondary invisible group-hover:visible group-[.final-completion]:visibl"><div class="flex items-center gap-1.5 text-xs"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="icon-md-heavy"><path fill="currentColor" fill-rule="evenodd" d="M7 5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-2v2a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3h2zm2 2h5a3 3 0 0 1 3 3v5h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-9a1 1 0 0 0-1 1zM5 9a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1z" clip-rule="evenodd"></path></svg></div></button-->
        </div></div>

        <div id="message-info-wrapper-${id}"
          style="display: flex; justify-content: space-between; align-items: center; font-size: 0.7em; width: 100%; max-height: 40px;">
          ${showWordCount ? `<div id="message-counter-${id}" class="text-token-text-tertiary select-none">${nodeCharCounts} chars / ${nodeWordCounts} words</div>` : ''}
          ${showMessageTimestamp ? `<div class="text-token-text-tertiary select-none" style="position: absolute; bottom: 4px; right: 0px;">${messageTimestamp}</div>` : ''}
          </div>
        </div>
      </div>
    </div>
  </div>
</article>`;
}
function pythonImageSkeleton(node) {
  const messageId = node?.message?.id;
  const resultImages = node?.message?.metadata?.aggregate_result?.messages?.filter((m) => m?.message_type === 'image');
  return `${resultImages.map((image) => `<img style="border-radius:8px; aspect-ratio: ${image.width}/${image.height};" id="python-image-displayed-${messageId}" data-file-id="${image.image_url.split('://').pop()}" src="https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png" class="my-1" alt="Output image">`).join('')}`;
}
// eslint-disable-next-line no-unused-vars
async function renderAllPluginVisualizations(conversation, shouldScrollToBottom = false) {
  const allPluginVisualizations = document.querySelectorAll('[id^="message-plugin-visualization-"]');
  if (allPluginVisualizations.length === 0) return;

  const responsePromises = Array.from(allPluginVisualizations)?.map(async (visualizationElement) => {
    if (visualizationElement.innerHTML !== '') return;
    const nodeId = visualizationElement.id.split('message-plugin-visualization-').pop();
    const node = conversation.mapping[nodeId];
    if (!node) return;

    // when we added message-plugin-visualization- to the page, we still don't know the plugin response.
    // visualizationNodeId is the child node (plugin response)
    const visualizationNodeId = node.children[node.children.length - 1];
    // visualizationElement.id = `message-plugin-visualization-${visualizationNodeId}`;
    const visualizationNode = conversation.mapping[visualizationNodeId];
    await pluginVisualizationRenderer(conversation, visualizationNode);
    // scroll to the bottom since tables can take extra space after rendering
    if (shouldScrollToBottom) {
      const innerDiv = document.querySelector('#conversation-inner-div');
      innerDiv.style = 'scroll-behavior: auto;';
      innerDiv.scrollTop = innerDiv.scrollHeight;
      innerDiv.style = 'scroll-behavior: smooth;';
    }
  });

  await Promise.all(responsePromises);
}
// eslint-disable-next-line no-unused-vars
async function renderAllPythonImages(conversation) {
  const allPythonImages = document.querySelectorAll('[id^="python-image-displayed-"]');
  if (allPythonImages.length === 0) return;
  const galleryImages = [];
  const responsePromises = Array.from(allPythonImages)?.map(async (image) => {
    const node = conversation.mapping[image.id.split('python-image-displayed-').pop()];
    const { fileId } = image.dataset;
    const response = await getDownloadUrlFromFileId(conversation.conversation_id, fileId);
    image.src = response.download_url;
    const galleryImage = {
      image_id: fileId,
      width: image.style.aspectRatio.split('/')[0].trim(),
      height: image.style.aspectRatio.split('/')[1].trim(),
      download_url: response.download_url,
      prompt: node.message?.metadata?.aggregate_result?.code,
      is_public: false,
      category: 'chart',
      conversation_id: conversation.conversation_id,
      created_at: response.creation_time ? new Date(response.creation_time) : new Date(formatTime(node?.message?.create_time)),
    };
    galleryImages.push(galleryImage);
  });

  await Promise.all(responsePromises);

  // if (galleryImages.length === 0) return;
  // chrome.runtime.sendMessage({
  //   type: 'addGalleryImages',
  //   detail: {
  //     images: galleryImages,
  //   },
  // });
}

// eslint-disable-next-line no-unused-vars
function addFinalCompletionClassToLastMessageWrapper() {
  // remove all final-completion classes first
  const allMessageWrappers = document.querySelectorAll('[id^="message-wrapper-"]');
  allMessageWrappers.forEach((messageWrapper) => {
    messageWrapper.classList.remove('final-completion');
    // messageWrapper?.querySelector('[id^="message-regenerate-button-"]')?.classList.remove('group-hover:visible');
  });
  // add final-completion class to last message wrapper
  const lastMessageWrapper = [...document.querySelectorAll('[id^="message-wrapper-"]')].pop();
  lastMessageWrapper?.classList.add('final-completion');

  // lastMessageWrapper?.querySelector('[id^="message-regenerate-button-"]')?.classList.add('group-hover:visible');
}
function isImageGeneratorTool(recipient) {
  return recipient === 'dalle.text2im' || recipient === 't2uay3k.sj1i4kz';
}
function hiddenPluginDropdownRenderer(pluginRequestNode, isLoading) {
  const recipient = pluginRequestNode?.message?.recipient;
  const title = isImageGeneratorTool(recipient) ? 'Creating Images' : 'Browsing...';
  const messageId = pluginRequestNode?.message?.id;
  const existingHiddenPluginDropdown = document.querySelector('[id^=hidden-plugin-]');
  if (recipient === 'browser' && existingHiddenPluginDropdown) return '';
  return `<div class="flex flex-col items-start gap-2" id="hidden-plugin-${messageId}"><div class="max-w-full ${isLoading ? '' : 'hidden'}"><div class="flex items-center justify-between"><div class="min-w-0"><div class="flex items-center gap-2.5 py-2"><div class="flex h-4 w-4 shrink-0 items-center justify-center"><svg x="0" y="0" viewbox="0 0 40 40" class="spinner icon-xl text-brand-purple"><circle fill="transparent" class="stroke-brand-purple/25 dark:stroke-brand-purple/50" stroke-width="2" stroke-linecap="round" stroke-dasharray="125.6" cx="20" cy="20" r="18"></circle></svg></div><div class="flex min-w-0 flex-1 flex-col items-start leading-[18px]"> <div class="max-w-full truncate text-token-text-secondary">${title}</div></div></div></div></div></div></div>${isImageGeneratorTool(recipient) ? `<div id="message-dalle-content-${messageId}" class="grid gap-4 grid-cols-2 transition-opacity duration-300 opacity-100"></div>` : ''}`;
}
function dalleImageSkeleton(messageId, images) {
  const { width, height } = images[0];
  return `${images.map((p, index) => `<div class="flex"><div type="button" class="w-full cursor-pointer" aria-haspopup="dialog" aria-expanded="false" aria-controls="radix-:r1t:" data-state="closed" aria-label="Show Image"><div class="relative overflow-hidden rounded-2xl group/dalle-image ${width === height ? 'max-w-[400px]' : ''}" style="aspect-ratio: ${width}/${height};"><div style="width:${width}px; height:${height}px;" class="pointer-events-none absolute inset-0 bg-gray-100 animate-pulse w-full" style="animation-delay: 0ms;"></div><div class="relative h-full"><img id="dalle-image-${messageId}-${index}" alt="Generated by DALL·E" loading="lazy" width="${width}" height="${height}" decoding="async" data-nimg="1" class="w-full transition-opacity duration-300 opacity-100" src="https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png" style="color: transparent;"><div class="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_0.5px_rgba(0,0,0,0.5)]"></div>
  
  <div id="dalle-image-info-${messageId}-${index}" title="Click to copy Gen ID, Shift+Click to copy Seed" class="invisible absolute bg-gray-600 px-2 py-1 rounded text-xs group-hover/dalle-image:visible" style="left:12px; bottom:12px;"><div class="flex">Gen ID:&nbsp;<div class="font-bold" id="dalle-image-gen-id-${messageId}-${index}"></div></div><div class="flex">Seed:&nbsp;<div class="font-bold" id="dalle-image-seed-${messageId}-${index}"></div></div></div>
  
  <div id="dalle-image-download-button-${messageId}-${index}" class="invisible absolute group-hover/dalle-image:visible" style="left:12px; top:12px;"><button class="flex h-8 w-8 items-center justify-center rounded bg-black/50"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-sm text-white"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.70711 10.2929C7.31658 9.90237 6.68342 9.90237 6.29289 10.2929C5.90237 10.6834 5.90237 11.3166 6.29289 11.7071L11.2929 16.7071C11.6834 17.0976 12.3166 17.0976 12.7071 16.7071L17.7071 11.7071C18.0976 11.3166 18.0976 10.6834 17.7071 10.2929C17.3166 9.90237 16.6834 9.90237 16.2929 10.2929L13 13.5858L13 4C13 3.44771 12.5523 3 12 3C11.4477 3 11 3.44771 11 4L11 13.5858L7.70711 10.2929ZM5 19C4.44772 19 4 19.4477 4 20C4 20.5523 4.44772 21 5 21H19C19.5523 21 20 20.5523 20 20C20 19.4477 19.5523 19 19 19L5 19Z" fill="currentColor"></path></svg></button></div>

  <div id="dalle-image-enlarge-button-${messageId}-${index}" class="pointer-events-none invisible absolute end-3 top-3 text-white"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="24" height="24"><path fill-rule="evenodd" clip-rule="evenodd" d="M13 4C13 3.44772 13.4477 3 14 3H20C20.5523 3 21 3.44772 21 4V10C21 10.5523 20.5523 11 20 11C19.4477 11 19 10.5523 19 10V6.41421L15.2071 10.2071C14.8166 10.5976 14.1834 10.5976 13.7929 10.2071C13.4024 9.81658 13.4024 9.18342 13.7929 8.79289L17.5858 5H14C13.4477 5 13 4.55228 13 4ZM4 13C4.55228 13 5 13.4477 5 14V17.5858L8.79289 13.7929C9.18342 13.4024 9.81658 13.4024 10.2071 13.7929C10.5976 14.1834 10.5976 14.8166 10.2071 15.2071L6.41421 19H10C10.5523 19 11 19.4477 11 20C11 20.5523 10.5523 21 10 21H4C3.44772 21 3 20.5523 3 20V14C3 13.4477 3.44772 13 4 13Z" fill="currentColor"></path></svg></div>

  </div></div></div></div>`).join('')}`;
}
// render all images after conversation is loaded
// eslint-disable-next-line no-unused-vars
async function renderAllDalleImages(conversation) {
  // get all dalle content where innerHTML is empty
  const allMessageDalleContent = [...document.querySelectorAll('[id^="message-dalle-content-"]')].filter((dalleContent) => dalleContent.innerHTML === '');
  // get all message ids
  const allDalleMessageIds = allMessageDalleContent.map((dalleContent) => dalleContent.id.split('message-dalle-content-')[1]);
  // for each message id, run dalleImageRenderer
  if (allDalleMessageIds.length === 0) return;
  const galleryImages = [];
  const responsePromises = allDalleMessageIds?.map(async (messageId) => {
    const node = Object.values(conversation.mapping).find((n) => n?.parent === messageId);
    if (node) {
      const nodeGalleryImages = await dalleImageRenderer(node, conversation.conversation_id);
      galleryImages.push(...nodeGalleryImages);
    }
  });
  await Promise.all(responsePromises);
  // if (galleryImages.length === 0) return;
  // chrome.runtime.sendMessage({
  //   type: 'addGalleryImages',
  //   detail: {
  //     images: galleryImages,
  //   },
  // });
}
// render images for each node
async function dalleImageRenderer(node, conversationId, isNew = false) {
  const { content } = node.message;
  if (content.content_type !== 'multimodal_text') return [];

  let parentId = node?.parent;

  if (!parentId) {
    const lastMessageDalleContent = [...document.querySelectorAll('[id^="message-dalle-content-"]')].pop();
    parentId = lastMessageDalleContent?.id.split('message-dalle-content-')[1];
  }

  const images = content?.parts;

  const messageDalleContent = document.querySelector(`#message-dalle-content-${parentId}`);
  if (messageDalleContent) {
    if (images?.length <= 1) {
      messageDalleContent.classList?.replace('grid-cols-2', 'grid-cols-1');
    }
    if (messageDalleContent.innerHTML === '') {
      messageDalleContent.innerHTML = dalleImageSkeleton(parentId, images);
    }
  }
  if (!images || images.length === 0) return [];
  const nodeGalleryImages = [];
  const responsePromises = images?.map(async (image, index) => {
    const imageId = image.asset_pointer?.split('://')[1];
    const { width, height } = image;
    const response = await getDownloadUrlFromFileId(conversationId, imageId);
    // remove conic class from all hidden-plugin first childs
    const allHiddenPluginFirstChilds = [...document.querySelectorAll('[id^="hidden-plugin-"]')].map((hiddenPlugin) => hiddenPlugin.firstChild);
    allHiddenPluginFirstChilds.forEach((hiddenPluginFirstChild) => {
      hiddenPluginFirstChild.classList?.remove('conic');
      hiddenPluginFirstChild.classList?.add('hidden');
    });
    const dalleElementImage = document.querySelector(`img#dalle-image-${parentId}-${index}`);
    if (dalleElementImage) {
      dalleElementImage.setAttribute('width', width);
      dalleElementImage.setAttribute('height', height);
      // set alt
      // remove anything other than  alpha numeric and space from prompt
      dalleElementImage.alt = image?.metadata?.dalle?.prompt?.replace(/[^a-zA-Z0-9 ]/gi, '') || 'Generated by DALL·E';
      dalleElementImage.dataset.fileId = imageId;
      dalleElementImage.dataset.genId = image?.metadata?.dalle?.gen_id;
      dalleElementImage.src = response.download_url;
      const genIdElement = dalleElementImage.parentElement.querySelector(`#dalle-image-gen-id-${parentId}-${index}`);
      const seedElement = dalleElementImage.parentElement.querySelector(`#dalle-image-seed-${parentId}-${index}`);
      if (genIdElement) {
        genIdElement.innerText = image?.metadata?.dalle?.gen_id;
      }
      if (seedElement) {
        seedElement.innerText = image?.metadata?.dalle?.seed;
      }
      loadUserSelectedImages(imageId, response.download_url);
      // add download event listener
      dalleImageEventListener(images, dalleElementImage, parentId, index);
      if (isNew) {
        const dalleEditorCenterImage = document.querySelector('#dalle-editor-center-image');
        if (dalleEditorCenterImage) {
          dalleElementImage.click();
        }
      }
      const userUpload = !image?.metadata || !image?.metadata?.dalle;

      const galleryImage = {
        image_id: imageId,
        width,
        height,
        download_url: response.download_url,
        prompt: image?.metadata?.dalle?.prompt,
        gen_id: image?.metadata?.dalle?.gen_id,
        seed: image?.metadata?.dalle?.seed,
        is_public: false,
        category: userUpload ? 'upload' : 'dalle',
        conversation_id: conversationId,
        created_at: response.creation_time ? new Date(response.creation_time) : new Date(formatTime(node?.message?.create_time)),

      };
      nodeGalleryImages.push(galleryImage);
    }
  });
  await Promise.all(responsePromises);
  // if (isNew) {
  //   chrome.runtime.sendMessage({
  //     type: 'addGalleryImages',
  //     detail: {
  //       images: nodeGalleryImages,
  //     },
  //   });
  // }
  return nodeGalleryImages;
}
function loadUserSelectedImages(fileId, imgSrc) {
  // id starts with reply-to-image- and data-file-id = fileId
  const replyToImages = document.querySelectorAll(`img[id^=reply-to-image-][data-file-id="${fileId}"]`);
  replyToImages.forEach(((replyToImage) => {
    replyToImage.src = imgSrc;
  }));
}

function actionConfirmationRenderer(actionRequestNode, actionResponseNode, displayName) {
  const { id: messageId, recipient, metadata } = actionRequestNode.message;
  const domain = metadata?.jit_plugin_data?.from_server?.body?.domain;

  if (actionResponseNode) {
    // dont render request, jusr render response
    return actionResponseRenderer(actionResponseNode, domain);
  }
  const role = actionRequestNode.message?.role || actionRequestNode.message?.author?.role;
  if (role !== 'tool') return '';
  if (recipient !== 'assistant') return '';
  const actionType = metadata?.jit_plugin_data?.from_server?.type;

  if (actionType === 'confirm_action') {
    return `<div id="tool-action-request-wrapper-${messageId}" data-domain=${domain}>${actionDisclaimerRenderer(displayName, domain)}<div class="mb-2 flex gap-2"><button id="tool-action-request-allow-${messageId}" class="btn relative btn-primary btn-small"><div class="flex w-full gap-2 items-center justify-center">Allow</div></button><button id="tool-action-request-always-allow-${messageId}" class="btn relative btn-secondary btn-small"><div class="flex w-full gap-2 items-center justify-center">Always Allow</div></button><button id="tool-action-request-deny-${messageId}" class="btn relative btn-secondary btn-small"><div class="flex w-full gap-2 items-center justify-center">Decline</div></button></div></div>`;
  }
  if (actionType === 'oauth_required') {
    const action = metadata?.jit_plugin_data?.from_server?.body?.actions?.find((a) => a.type === 'oauth_redirect')?.oauth_redirect;
    const gizmoId = action?.gizmo_id;
    const actionId = action?.gizmo_action_id;
    return `<div id="tool-action-request-wrapper-${messageId}">${actionDisclaimerRenderer(displayName, domain)}<div class="mb-2 flex gap-2"><button id="tool-action-request-oauth-${messageId}" data-domain=${domain} data-gizmoId="${gizmoId}" data-actionId="${actionId}" class="btn btn-primary relative h-8"><div class="flex w-full gap-2 items-center justify-center">Sign in with ${domain}</div></button></div></div>`;
  }
  return '';
}
function actionResponseRenderer(actionNode, domain) {
  const { recipient, metadata } = actionNode.message;

  const role = actionNode.message?.role || actionNode.message?.author?.role;
  if (role === 'user') return '';
  if (role !== 'tool' && recipient !== 'all') return actionStoppedRenderer(domain);

  const clientActionType = metadata?.jit_plugin_data?.from_client?.type;
  const serverActionType = metadata?.jit_plugin_data?.from_server?.type;

  if (clientActionType === 'allow' || clientActionType === 'always_allow') {
    return actionAllowedRenderer(domain);
  }
  if (clientActionType === 'deny' || serverActionType === 'denied_by_user') {
    return actionDeniedRenderer();
  }
  return '';
}

function actionDisclaimerRenderer(displayName, domain) {
  return `<div class="my-2.5 flex items-center gap-2.5"><div class="relative h-5 w-full leading-5 -mt-[0.75px] text-token-text-secondary"><div class="absolute start-0 top-0 line-clamp-1" style="opacity: 1; transform: none;"><button type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="radix-:rij:" data-state="closed"><div class="inline-flex items-center gap-1">${displayName || 'This GPT'} wants to talk to ${domain}</div></button></div></div></div>`;
}
function actionAllowedRenderer(domain) {
  return `<div class="my-2.5 flex items-center gap-2.5"><div class="relative h-5 w-full leading-5 -mt-[0.75px] text-token-text-secondary"><div class="absolute start-0 top-0 line-clamp-1" style="opacity: 1; transform: none;"><button type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="radix-:rkd:" data-state="closed"><div class="inline-flex items-center gap-1">Talked to ${domain}</div></button></div></div></div>`;
}
function actionDeniedRenderer() {
  return '<div class="my-2.5 flex items-center gap-2.5"><div class="relative h-5 w-full leading-5 -mt-[0.75px] text-token-text-tertiary"><div class="absolute start-0 top-0 line-clamp-1" style="opacity: 1; transform: none;">You declined this action</div></div></div>';
}
function actionStoppedRenderer(domain) {
  return `<div class="my-2.5 flex items-center gap-2.5"><div class="relative h-5 w-full leading-5 -mt-[0.75px] text-token-text-tertiary"><div class="absolute start-0 top-0 line-clamp-1" style="opacity: 1; transform: none;">Stopped talking to ${domain}</div></div></div>`;
}

function dalleImageEventListener(images, dalleElementImage, messageId, index) {
  dalleElementImage.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenus();
    const dalleEditorEditModeCancelButton = document.querySelector('#dalle-editor-edit-mode-cancel-button');
    if (dalleEditorEditModeCancelButton) {
      dalleEditorEditModeCancelButton.click();
    }
    const dalleEditor = document.querySelector('#dalle-editor');
    if (!dalleEditor) {
      openDalleEditor(images, dalleElementImage, messageId, index);
      dalleElementImage.parentElement.insertAdjacentHTML('beforeend', '<div id="dalle-dark-image-overlay" class="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] bg-black/50 group-hover/dalle-image:bg-black/70"></div>');
    } else {
      const dalleEditorInfoMenu = document.querySelector('#dalle-editor-info-menu');
      if (dalleEditorInfoMenu) {
        dalleEditorInfoMenu.remove();
      }
      const dalleDarkImageOverlay = document.querySelector('#dalle-dark-image-overlay');
      if (dalleDarkImageOverlay) {
        dalleDarkImageOverlay.remove();
      }
      dalleElementImage.parentElement.insertAdjacentHTML('beforeend', '<div id="dalle-dark-image-overlay" class="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] bg-black/50 group-hover/dalle-image:bg-black/70"></div>');

      const dalleEditorCenterImage = dalleEditor.querySelector('#dalle-editor-center-image');
      if (dalleEditorCenterImage) {
        dalleEditorCenterImage.src = dalleElementImage.src;
        dalleEditorCenterImage.alt = dalleElementImage.alt;
        dalleEditorCenterImage.width = dalleElementImage.naturalWidth;
        dalleEditorCenterImage.height = dalleElementImage.naturalHeight;
        dalleEditorCenterImage.dataset.fileId = dalleElementImage.dataset.fileId;
        dalleEditorCenterImage.dataset.genId = dalleElementImage.dataset.genId;
      }
      const dalleEditorNavigation = dalleEditor.querySelector('#dalle-editor-navigation');
      dalleEditorNavigation.dataset.messageId = messageId;
      if (images.length === 1) {
        dalleEditorNavigation.classList.replace('visible', 'invisible');
      } else {
        dalleEditorNavigation.classList.replace('invisible', 'visible');
        const dalleEditorNavCurIndex = dalleEditor.querySelector('#dalle-editor-nav-cur-index');
        const dalleEditorNavTotal = dalleEditor.querySelector('#dalle-editor-nav-total');
        dalleEditorNavCurIndex.innerText = index + 1;
        dalleEditorNavTotal.innerText = images.length;
        const dalleEditorPrevImageButton = dalleEditor.querySelector('#dalle-editor-prev-image');
        const dalleEditorNextImageButton = dalleEditor.querySelector('#dalle-editor-next-image');
        if (index === 0) {
          dalleEditorPrevImageButton.disabled = true;
        } else {
          dalleEditorPrevImageButton.disabled = false;
        }
        if (index === images.length - 1) {
          dalleEditorNextImageButton.disabled = true;
        } else {
          dalleEditorNextImageButton.disabled = false;
        }
      }
    }
  });
  const downloadButton = dalleElementImage.parentElement.querySelector(`#dalle-image-download-button-${messageId}-${index}`);
  if (downloadButton) {
    downloadButton.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMenus();
      const url = decodeURIComponent(dalleElementImage.src);
      const fileName = url?.split('filename=')?.[1]?.split('&')?.[0];
      const format = fileName?.split('.')?.pop() || 'webp';
      // use local date and time
      const filename = `DALL·E ${formatDateDalle()} - ${dalleElementImage.alt}.${format}`;
      downloadFileFromUrl(dalleElementImage.src, filename);
    });
  }
  const imageInfo = dalleElementImage.parentElement.querySelector(`#dalle-image-info-${messageId}-${index}`);
  if (imageInfo) {
    // copy gen id to clipboard
    dalleElementImage.parentElement.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMenus();
      // if shift key is pressed, copy seed to clipboard
      if (e.shiftKey) {
        const seed = dalleElementImage.parentElement.querySelector(`#dalle-image-seed-${messageId}-${index}`);
        if (seed) {
          navigator.clipboard.writeText(seed.innerText);
          toast('Copied Seed to clipboard');
        }
      } else {
        const genId = dalleElementImage.parentElement.querySelector(`#dalle-image-gen-id-${messageId}-${index}`);
        if (genId) {
          navigator.clipboard.writeText(genId.innerText);
          toast('Copied Gen ID to clipboard');
        }
      }
    });
  }
}

function pluginDropdownRenderer(pluginRequestNode, isLoading, isOpen = false) {
  const recipient = pluginRequestNode?.message?.recipient;
  if (isImageGeneratorTool(recipient)) return hiddenPluginDropdownRenderer(pluginRequestNode, isLoading);
  if (recipient === 'browser') return hiddenPluginDropdownRenderer(pluginRequestNode, isLoading);

  const pluginName = pluginRequestNode?.message?.recipient?.split('.')[0]?.replace(/([A-Z])/g, ' $1')?.replace(/^./, (str) => str.toUpperCase());
  const messageId = pluginRequestNode?.message?.id;

  return `<div class="flex flex-col items-start"><div id="message-plugin-dropdown-${messageId}" class="flex items-center text-xs rounded p-3 text-token-text-secondary ${isLoading ? 'bg-green-100' : 'bg-token-main-surface-secondary'}"><div><div class="flex items-center gap-3"><div id="message-plugin-name-${messageId}">${pluginName.toLowerCase() === 'bio' ? 'Memory updated' : `Used <b>${pluginName}`}</b>${isLoading ? '...' : ''}</div></div></div>${isLoading ? `<svg id="message-plugin-loading-${messageId}" stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="animate-spin text-center shrink-0 ms-1" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>` : ''}<div id="message-plugin-toggle-${messageId}" class="ms-12 flex items-center gap-2" role="button"><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="icon-sm" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="${isOpen ? '18 15 12 9 6 15' : '6 9 12 15 18 9'}"></polyline></svg></div></div><div id="message-plugin-content-${messageId}" class="${isOpen ? '' : 'hidden'} my-3 flex w-full flex-col gap-3">${pluginContentRenderer(pluginRequestNode)}</div><div id="message-plugin-visualization-${messageId}" class="hidden my-3 flex w-full flex-col gap-3"></div></div>`;
}
function strawberryDropdownRenderer(strawberryNode) {
  const messageId = strawberryNode?.message?.id;
  const { initial_text: initialText, finished_text: finishedText } = strawberryNode.message.metadata;
  const finishedSuccessfully = strawberryNode.message.status === 'finished_successfully';
  const previewText = finishedSuccessfully ? finishedText : initialText;
  const thinkingText = strawberryNode?.message?.content?.parts[0] || '';

  return `<div id="strawberry-response-${messageId}">
            <div id="strawberry-dropdown-wrapper-${messageId}" class="first:mt-0 my-1.5 relative h-8 text-token-text-secondary ${thinkingText ? 'hover:text-token-text-primary' : ''}">
              <div class="group absolute start-0 top-0 me-1.5 h-8 overflow-hidden mt-1">
                <button class="${thinkingText ? '' : 'cursor-default'} ${finishedSuccessfully ? '' : 'loading-shimmer'}" style="opacity: 1;">
                  <div class="flex items-center justify-start gap-1">
                    <span id="strawberry-dropdown-preview-text-${messageId}" >${previewText}</span>
                    <svg id="strawberry-dropdown-toggle-${messageId}" width="24" height="24" viewBox="0 0 24 24" fill="none"
                      xmlns="http://www.w3.org/2000/svg" class="icon-md ${thinkingText ? '' : 'hidden'}">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M5.29289 9.29289C5.68342 8.90237 6.31658 8.90237 6.70711 9.29289L12 14.5858L17.2929 9.29289C17.6834 8.90237 18.3166 8.90237 18.7071 9.29289C19.0976 9.68342 19.0976 10.3166 18.7071 10.7071L12.7071 16.7071C12.5196 16.8946 12.2652 17 12 17C11.7348 17 11.4804 16.8946 11.2929 16.7071L5.29289 10.7071C4.90237 10.3166 4.90237 9.68342 5.29289 9.29289Z" fill="currentColor"></path>
                    </svg>
                  </div>
                </button>
              </div>
            </div>
            <div id="strawberry-content-${messageId}" class="overflow-hidden hidden" style="opacity: 1; height: auto; transform: none;">
              ${strawberryContentRenderer(strawberryNode)}
            </div>
          </div>`;
}

function strawberryContentRenderer(strawberryNode) {
  const messageId = strawberryNode?.message?.id;

  const regex = /\*\*(.*?)\*\*\n\n([\s\S]*?)(?=\*\*|$)/g;
  const thinkingText = strawberryNode?.message?.content?.parts[0] || '';
  // Initialize the array to hold the steps
  const thinkingSteps = [];
  // Variable to keep track of the step ID
  let id = 1;
  // Execute the regex and populate the array
  let match = regex.exec(thinkingText);
  while (match !== null) {
    const title = match[1].trim();
    const description = match[2].trim();

    thinkingSteps.push({
      id,
      title,
      description,
    });

    id += 1;

    match = regex.exec(thinkingText);
  }

  const strawberryDropdownWrapper = document.querySelector(`#strawberry-dropdown-wrapper-${messageId}`);
  if (thinkingSteps.length > 0) {
    if (strawberryDropdownWrapper) {
      strawberryDropdownWrapper.classList.add('hover:text-token-text-primary');
      strawberryDropdownWrapper.querySelector('button').classList.add('cursor-pointer', 'loading-shimmer');
      strawberryDropdownWrapper.addEventListener('click', () => {
        const strawberryContent = document.querySelector(`#strawberry-content-${messageId}`);
        const strawberryDropdownToggle = document.querySelector(`#strawberry-dropdown-toggle-${messageId}`);
        if (strawberryContent) {
          strawberryContent.classList.toggle('hidden');
          if (strawberryContent.classList.contains('hidden')) {
            strawberryDropdownToggle.classList.remove('rotate-180');
          } else {
            strawberryDropdownToggle.classList.add('rotate-180');
          }
        }
      });
    }
    // if steps.length > 0 unhide toggle
    const strawberryDropdownToggle = document.querySelector(`#strawberry-dropdown-toggle-${messageId}`);
    if (strawberryDropdownToggle) {
      strawberryDropdownToggle.classList.remove('hidden');
    }
  }
  const strawberryDropdownPreviewText = document.querySelector(`#strawberry-dropdown-preview-text-${messageId}`);

  // if strawberryNode.message.status === 'finished_successfully', update strawberry-dropdown-preview-text- with the finished text
  const finishedText = strawberryNode.message.metadata.finished_text;
  if (strawberryNode.message.status === 'finished_successfully') {
    strawberryDropdownWrapper?.querySelector('button')?.classList?.remove('loading-shimmer');
    if (strawberryDropdownPreviewText && finishedText) {
      strawberryDropdownPreviewText.innerText = finishedText;
    }
  } else {
    // update strawberry-dropdown-preview-text- with the last step title
    const lastStep = thinkingSteps[thinkingSteps.length - 1];
    const lastStepTitle = lastStep?.title;
    if (strawberryDropdownPreviewText) {
      strawberryDropdownPreviewText.innerText = lastStepTitle;
    }
  }
  return `<div class="my-4 border-s-2 ps-4">
            <div class="not-prose leading-6 markdown prose w-full break-words dark:prose-invert dark">
              ${thinkingSteps.map((step) => `
                ${step.title ? `<p class="text-base has-[strong]:mb-1 has-[strong]:mt-3 [&amp;:not(:has(strong))]:mb-3">
                  <strong class="font-semibold text-token-text-primary">${step.title}</strong>
                </p>` : ''}
                ${step.description ? `<p class="text-base has-[strong]:mb-1 has-[strong]:mt-3 [&amp;:not(:has(strong))]:mb-3">${step.description}</p>` : ''}
              `).join('')}
            </div>
          </div>`;
}
function pluginContentRenderer(pluginNode) {
  const messageId = pluginNode?.message?.id;
  if (!messageId) return '';
  const {
    content, recipient, author, metadata,
  } = pluginNode.message;
  const toolName = author?.name;
  if (isImageGeneratorTool(toolName)) return '';
  if (isImageGeneratorTool(recipient)) return '';
  if (toolName === 'browser') return '';

  const role = pluginNode.message?.role || pluginNode.message?.author?.role;
  const { content_type: contentType } = content;
  const pluginName = role === 'assistant'
    ? recipient?.split('.')[0]?.replace(/([A-Z])/g, ' $1')?.replace(/^./, (str) => str.toUpperCase())
    : author?.name?.split('.')[0]?.replace(/([A-Z])/g, ' $1')?.replace(/^./, (str) => str.toUpperCase());

  const pluginMessage = contentType === 'text'
    ? (content?.parts || [])?.filter((p) => typeof p === 'string')?.join('\n')
    : content?.text;
  if (!pluginMessage) return '';
  const { language, value } = hljs.highlightAuto(pluginMessage);
  let pluginHTML = value || '';
  try {
    pluginHTML = JSON.stringify(JSON.parse(pluginMessage), 0, 2);
  } catch (e) {
    pluginHTML = value || pluginMessage || '';
  }

  let resultLanguage = '';
  let resultHTML = '';
  if (contentType === 'execution_output' && role === 'tool' && metadata?.aggregate_result?.final_expression_output) {
    const { language: resLanguage, value: resValue } = hljs.highlightAuto(metadata?.aggregate_result?.final_expression_output);
    resultLanguage = resLanguage;
    resultHTML = resValue;
  }
  // eslint-disable-next-line no-nested-ternary
  const codeHeader = contentType === 'text'
    ? role === 'assistant' ? `Request to ${pluginName}` : `Response from ${pluginName}`
    : role === 'assistant' ? `Request to ${recipient}` : 'STDOUT/STDERR';
  return `<div class="dark bg-black rounded-md w-full text-xs text-token-text-secondary"><pre><div class="flex items-center relative text-token-text-secondary bg-token-main-surface-secondary px-4 py-2 text-xs font-sans justify-between rounded-t-md select-none"><span><span class="uppercase">${codeHeader}</span></span>${contentType === 'code' ? '<button id="copy-code" data-initialized="false" class="flex ms-auto gap-2 text-token-text-secondary hover:text-token-text-primary"><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>Copy code</button>' : pluginName === 'Bio' ? '<button id="manage-memories" data-initialized="false" class="flex ms-auto gap-2 text-token-text-secondary hover:text-token-text-primary">Manage memories</button>' : ''}</div><div class="p-4 overflow-y-auto"><code hljs language-${language}" id="message-plugin-${role === 'assistant' ? 'request' : 'response'}-html-${messageId}" class="!whitespace-pre-wrap">${pluginHTML}</code></div>${resultHTML && resultHTML !== pluginHTML ? `<div class="w-full px-4 py-2 text-token-text-secondary border border-gray-800">Execution Results</div><div class="p-4 overflow-y-auto"><code hljs language-${resultLanguage}" id="message-plugin-result-html-${messageId}" class="!whitespace-pre-wrap">${resultHTML}</code></div>` : ''}</pre></div>`;
}
async function pluginVisualizationRenderer(conversation, pluginNode) {
  const messageId = pluginNode?.message?.id;
  if (!messageId) return '';
  const {
    content, recipient, author, metadata,
  } = pluginNode.message;
  const toolName = author?.name;
  if (isImageGeneratorTool(toolName)) return '';
  if (isImageGeneratorTool(recipient)) return '';
  if (toolName === 'browser') return '';

  const role = pluginNode.message?.role || pluginNode.message?.author?.role;
  const { content_type: contentType } = content;

  if (contentType === 'execution_output' && role === 'tool' && metadata?.ada_visualizations?.length > 0) {
    const visualizations = metadata?.ada_visualizations;
    const responsePromises = Array.from(visualizations)?.map(async (visualization) => {
      const { title, file_id: fileId } = visualization;
      // get download url
      const response = await getDownloadUrlFromFileId(conversation.conversation_id, fileId);
      const downloadUrl = response.download_url;
      // download file
      const fileContent = await fetch(downloadUrl, { method: 'GET', headers: { origin: 'https://chatgpt.com' } }).then((res) => res.text());

      if (fileContent) {
        const pluginNodeId = metadata?.parent_id;
        const visualizationElement = document.querySelector(`#message-plugin-visualization-${pluginNodeId}`);
        if (!visualizationElement) return;
        visualizationElement.id = `message-plugin-visualization-${messageId}`;
        visualizationElement.classList.remove('hidden');
        // add csv to table
        visualizationElement.appendChild(csvToTable(title, fileContent, response.download_url));
      }
    });
    await Promise.all(responsePromises);
  }
  return '';
}
function csvToTable(title, csvContent, downloadUrl) {
  function parseCSV(csv) {
    const rows = [];
    const regex = /(?:"([^"]*(?:""[^"]*)*)"|([^",]+)|,)(?=\s*,|\s*$)/g;
    csv.trim().split('\n').forEach((line) => {
      const row = [];
      let match = regex.exec(line);
      while (match) {
        row.push(match[1] ? match[1].replace(/""/g, '"') : match[2] ? match[2] : '');
        match = regex.exec(line);
      }
      rows.push(row);
    });
    return rows;
  }

  const rows = parseCSV(csvContent);

  // Create a container div
  const container = document.createElement('div');
  container.classList = 'relative overflow-auto w-full rounded-2xl bg-token-main-surface-secondary border border-token-border-medium';
  container.style.maxHeight = '420px';
  const tableTitleWrapper = document.createElement('div');
  tableTitleWrapper.classList = 'flex items-center justify-between gap-2 bg-token-main-surface-primary px-4 py-3 border-b border-token-border-medium sticky top-0 start-0 z-30';

  const tableTitle = document.createElement('div');
  tableTitle.classList = 'flex-grow items-center truncate font-semibold capitalize bg-token-main-surface-primary';
  tableTitle.textContent = title;
  tableTitleWrapper.appendChild(tableTitle);

  const tableTitleActions = document.createElement('div');
  tableTitleActions.classList = 'flex items-center gap-3';
  tableTitleWrapper.appendChild(tableTitleActions);

  const downloadTableButton = document.createElement('button');
  downloadTableButton.classList = 'flex items-center text-xs';
  downloadTableButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="icon-md text-token-text-tertiary hover:text-token-text-primary"><path fill="currentColor" d="M7.707 10.293a1 1 0 1 0-1.414 1.414l5 5a1 1 0 0 0 1.414 0l5-5a1 1 0 0 0-1.414-1.414L13 13.586V4a1 1 0 1 0-2 0v9.586zM5 19a1 1 0 1 0 0 2h14a1 1 0 1 0 0-2z"></path></svg>';
  downloadTableButton.addEventListener('click', () => {
    downloadFileFromUrl(downloadUrl, `${title}.csv`);
  });
  tableTitleActions.appendChild(downloadTableButton);

  container.appendChild(tableTitleWrapper);

  // Create the table element
  const table = document.createElement('table');
  table.classList = 'w-full table';

  // Create table header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerRow.classList = 'sticky z-20';
  headerRow.style.top = '49px';
  headerRow.style.boxShadow = 'inset 0px -1px 0 #424242'; // Persistent left border using box-shadow

  ['', ...rows[0], ''].forEach((header, index) => {
    const th = document.createElement('th');
    th.classList = 'text-sm text-start text-token-text-primary font-bold bg-token-main-surface-secondary p-2 border-e border-token-border-medium sticky';
    if (index === 0) {
      th.classList.add('sticky', 'border-s', 'z-10', 'start-0');
      th.style.boxShadow = 'inset -1px 0px 0 #424242'; // Persistent left border using box-shadow
      th.style.borderLeft = '1px';
    }
    if (index > 0 && index < rows[0].length) {
      th.style.minWidth = '150px';
    } else {
      th.style.minWidth = '40px';
    }
    th.textContent = header;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Create table body
  const emptyRow = Array.from({ length: rows[0].length }, () => '');
  const tbody = document.createElement('tbody');
  [...rows, emptyRow].slice(1).forEach((row, rowIndex) => {
    const tr = document.createElement('tr');
    [rowIndex + 1, ...row, ''].forEach((cell, colIndex) => {
      const td = document.createElement('td');
      td.classList = 'relative text-sm text-token-text-secondary border border-token-border-medium bg-token-main-surface-primary p-2';
      if (colIndex === 0) {
        td.classList.add('text-center', 'font-bold', 'text-token-text-primary', 'bg-token-main-surface-secondary', 'sticky', 'z-10', 'start-0');
        td.style.boxShadow = 'inset -1px 0px 0 #424242'; // Persistent left border using box-shadow
        td.style.borderLeft = '1px';
      }
      if (rowIndex === rows.length - 1) {
        td.style.height = '40px';
      }
      td.textContent = rowIndex === rows.length - 1 ? '' : cell;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  // Add the table to the container
  container.appendChild(table);

  return container;
}

function assistantRenderer(assistantNode, streaming = false) {
  const { id } = assistantNode.message;

  const { assistantMessageHTML, wordCount, charCount } = assistantContentGenerator(assistantNode, true);
  if (!assistantMessageHTML) return { renderedNode: '', wordCount: 0, charCount: 0 };
  return {
    renderedNode: `<div dir="auto" class="min-h-[20px] overflow-x-auto flex flex-col items-start whitespace-pre-wrap gap-4 break-words">
  <div id="message-text-${id}" data-message-id="${id}" class="${streaming ? 'result-streaming' : ''} markdown prose w-full flex flex-col break-words dark:prose-invert">
    ${assistantMessageHTML}
    </div>
  </div>`,
    wordCount,
    charCount,
  };
}
function replaceCitations(messageContentParts, citations, format = 'html') {
  if (citations?.length > 0) {
    const reversedCitations = [...citations].reverse();
    for (let i = 0; i < reversedCitations.length; i += 1) {
      const citation = reversedCitations[i];
      const citationMetadata = citation.metadata;
      const citedMessageIndex = citationMetadata?.extra?.cited_message_idx;
      const evidenceText = citationMetadata?.extra?.evidence_text;
      if (citationMetadata) {
        let citationText = '';
        if (citationMetadata?.type === 'webpage') {
          const { url, title } = citationMetadata;
          if (!url || !title) continue;
          const citationOrigin = new URL(url).origin;
          const foundInAttribution = citationAttributions?.find((attribution) => attribution.url === citationOrigin);

          if (format === 'html') {
            if (foundInAttribution) {
              citationText = `<span id="citation"><span class="text-token-text-secondary"> (</span>[${foundInAttribution.attribution}](${url} "${title}")<span class="text-token-text-secondary">)</span></span>`;
            } else {
              citationText = `<span id="citation">[<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 15" fill="none" class="-mt-0.5 ms-0.5 inline-block text-link-base hover:text-link-hover" width="19" height="15"><path d="M4.42 0.75H2.8625H2.75C1.64543 0.75 0.75 1.64543 0.75 2.75V11.65C0.75 12.7546 1.64543 13.65 2.75 13.65H2.8625C2.8625 13.65 2.8625 13.65 2.8625 13.65C2.8625 13.65 4.00751 13.65 4.42 13.65M13.98 13.65H15.5375H15.65C16.7546 13.65 17.65 12.7546 17.65 11.65V2.75C17.65 1.64543 16.7546 0.75 15.65 0.75H15.5375H13.98" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M6.16045 7.41534C5.32257 7.228 4.69638 6.47988 4.69638 5.58551C4.69638 4.54998 5.53584 3.71051 6.57136 3.71051C7.60689 3.71051 8.44635 4.54998 8.44635 5.58551C8.44635 5.8965 8.37064 6.1898 8.23664 6.448C8.22998 6.48984 8.21889 6.53136 8.20311 6.57208L6.77017 10.2702C6.63182 10.6272 6.18568 10.7873 5.7737 10.6276C5.36172 10.468 5.13991 10.0491 5.27826 9.69206L6.16045 7.41534ZM11.4177 7.41534C10.5798 7.228 9.95362 6.47988 9.95362 5.58551C9.95362 4.54998 10.7931 3.71051 11.8286 3.71051C12.8641 3.71051 13.7036 4.54998 13.7036 5.58551C13.7036 5.8965 13.6279 6.1898 13.4939 6.448C13.4872 6.48984 13.4761 6.53136 13.4604 6.57208L12.0274 10.2702C11.8891 10.6272 11.4429 10.7873 11.0309 10.6276C10.619 10.468 10.3971 10.0491 10.5355 9.69206L11.4177 7.41534Z" fill="currentColor"></path></svg>](${url} "${title}")</span>`;
            }
          } else if (format === 'markdown') {
            citationText = ` [${title}](${url})`;
          } else if (format === 'text') {
            citationText = ` ${title} (${url})`;
          }
        }
        // replace all any start with [citedMessageIndex and end with evidenceText] with citationText
        messageContentParts = messageContentParts?.replace(new RegExp(`【${citedMessageIndex}.*?${evidenceText}】`, 'g'), citationText);
      }
    }
  }
  return messageContentParts;
}
function assistantContentGenerator(assistantNode, returnCounters = false) {
  const { message: assistantMessage } = assistantNode;
  const shouldShowContinueButton = assistantMessage?.status && (assistantMessage?.status === 'finished_partial_completion' || assistantMessage?.metadata?.finish_details?.type === 'max_tokens');

  if (shouldShowContinueButton) {
    const lastContinueButton = [...document.querySelectorAll('[id^="message-continue-button-"]')].pop();
    if (lastContinueButton) lastContinueButton.classList.add('group-[.final-completion]:visible');
  }
  let messageContentParts = (assistantMessage?.content?.parts || [])?.filter((p) => typeof p === 'string')?.join('\n');
  // if citations array is not mpty, replace text from start_ix to end_ix position with citation
  const { citations } = assistantMessage.metadata;
  messageContentParts = replaceCitations(messageContentParts, citations, 'html');
  // replace single \n\\ with \n\n\\
  // messageContentParts = messageContentParts?.replace(/[^n}]\n\\/g, '\n\n\\');
  // add newline before and afte brackets
  messageContentParts = messageContentParts?.replace(/\\{1}\[/g, '\n\\[');
  // messageContentParts = messageContentParts?.replace(/\\\]/g, '\\]\n');

  const assistantMessageHTML = markdown('assistant')
    .use(markdownitSup)
    .use(texmath, {
      engine: katex,
      delimiters: ['dollars', 'brackets'],
      katexOptions: { macros: { '\\RR': '\\mathbb{R}' } },
    }).render(messageContentParts);

  if (returnCounters) {
    // create fake element
    const el = document.createElement('div');
    // set innerHTML of fake element to assistantMessageHTML
    el.innerHTML = assistantMessageHTML;
    const wordCount = el.innerText.split(/\s+/).filter((word) => word !== '').length;
    const charCount = el.innerText.replace(/\n/g, '').length;
    return { assistantMessageHTML, wordCount, charCount };
  }
  return { assistantMessageHTML };
}
