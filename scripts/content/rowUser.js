/* global languageList,toneList, writingStyleList, sanitizeHtml, getDownloadUrlFromFileId, getFileType, cachedSettings */
// eslint-disable-next-line no-unused-vars
function rowUser(conversation, node, childIndex, childCount, name, avatar) {
  const { customConversationWidth, conversationWidth } = cachedSettings;
  const { pinned, message } = node;
  const { id, content, metadata } = message;

  const messageText = (content?.parts || []).filter((p) => typeof p === 'string').join('\n');
  const assets = metadata?.attachments || [];
  const replyToText = metadata?.targeted_reply;
  const replyToImageId = metadata?.dalle?.from_client?.operation?.original_file_id;

  // download all assets
  assets?.forEach((asset) => {
    const assetId = asset.id;
    getDownloadUrlFromFileId(conversation.conversation_id, assetId).then((response) => {
      const assetElementImage = document.querySelector(`#asset-${assetId}`);
      if (assetElementImage) {
        if (getFileType(asset.name) === 'Image') {
          assetElementImage.src = response.download_url;
        } else {
          assetElementImage.style.backgroundImage = `url(${response.download_url})`;
        }
      }
    });
  });

  // remove any text between ## Instructions and ## End Instructions\n\n including the instructions
  const messageContent = messageText.replace(/^## Instructions[\s\S]*?## End Instructions\n\n/m, '');
  const highlightedMessageContent = sanitizeHtml(messageContent);
  const languageCode = messageText.match(/\(languageCode: (.*)\)/)?.[1];
  const toneCode = messageText.match(/\(toneCode: (.*)\)/)?.[1];
  const writingStyleCode = messageText.match(/\(writingStyleCode: (.*)\)/)?.[1];
  const languageName = languageList.find((lang) => lang.code === languageCode)?.name;
  const toneName = toneList.find((tone) => tone.code === toneCode)?.name;
  const writingStyleName = writingStyleList.find((writingStyle) => writingStyle.code === writingStyleCode)?.name;
  return `<article id="message-wrapper-${id}" data-role="user"
  class="group w-full p-5 pb-0 text-token-text-primary ${pinned ? 'border-l-pinned bg-pinned dark:bg-pinned border-b scroll-margin-top-60' : 'bg-token-main-surface-primary'}">
  <div class="relative text-base gap-4 m-auto md:max-w-2xl lg:max-w-2xl xl:max-w-3xl flex justify-end" style="${customConversationWidth ? `max-width:${conversationWidth}%` : ''}">
    <div class="relative flex flex-col w-full max-w-[90%]">
      <div id="user-message-text-wrapper-${id}" class="flex flex-grow flex-col gap-1">
        ${replyToText ? `<div id="message-reply-to-preview-${id}" class="flex text-sm text-token-text-tertiary mb-1 mt-1 items-start gap-1.5 font-normal self-end"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md shrink-0 juice:mt-1"><path fill="currentColor" fill-rule="evenodd" d="M5 6a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h9.586l-2.293-2.293a1 1 0 0 1 1.414-1.414l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414-1.414L16.586 14H7a3 3 0 0 1-3-3V7a1 1 0 0 1 1-1" clip-rule="evenodd"></path></svg><p class="line-clamp-3">${replyToText}</p></div>` : ''}
        ${replyToImageId ? `<div class="mt-2 flex items-center gap-1 text-token-text-tertiary"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md shrink-0"><path d="M4 5.25V7.75C4 8.85457 4.89543 9.75 6 9.75H14M14 9.75L11 12.75M14 9.75L11 6.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg><img id="reply-to-image-${replyToImageId}" data-file-id="${replyToImageId}" src="https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png" alt="Edited image" class="h-7 w-auto rounded opacity-50"><span class="ms-1 text-sm font-medium">Selection</span></div>` : ''}
        <div id="message-text-${id}" data-message-id="${id}" dir="auto" class="min-h-[20px] flex flex-col items-start gap-4 whitespace-pre-wrap rounded-3xl bg-[#f4f4f4] px-5 py-2.5 dark:bg-token-main-surface-secondary self-end" style="overflow-wrap:anywhere;align-self:ed;">${assetElements(assets)}${highlightedMessageContent}</div>
        
        <div id="message-edit-wrapper-${id}" class="flex empty:hidden mt-1 justify-end gap-3 lg:flex"><div class="text-token-text-secondary flex self-end justify-start mt-2 mt-0 visible gap-1">

        <div id="thread-buttons-wrapper-${id}" class="text-xs flex items-center justify-center gap-1 self-center ${childCount === 1 ? 'hidden' : ''}"><button id="thread-prev-button-${id}" class="flex h-[30px] w-[30px] items-center justify-center rounded-md hover:bg-token-main-surface-secondary disabled:opacity-50 disabled:hover:bg-transparent" ${childIndex === 1 ? 'disabled' : ''}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md-heavy"><path fill-rule="evenodd" clip-rule="evenodd" d="M14.7071 5.29289C15.0976 5.68342 15.0976 6.31658 14.7071 6.70711L9.41421 12L14.7071 17.2929C15.0976 17.6834 15.0976 18.3166 14.7071 18.7071C14.3166 19.0976 13.6834 19.0976 13.2929 18.7071L7.29289 12.7071C7.10536 12.5196 7 12.2652 7 12C7 11.7348 7.10536 11.4804 7.29289 11.2929L13.2929 5.29289C13.6834 4.90237 14.3166 4.90237 14.7071 5.29289Z" fill="currentColor"></path></svg></button><span id="thread-count-wrapper-${id}" class="flex-grow flex-shrink-0">${childIndex} / ${childCount}</span><button id="thread-next-button-${id}" ${childIndex === childCount ? 'disabled' : ''} class="flex h-[30px] w-[30px] items-center justify-center rounded-md hover:bg-token-main-surface-secondary disabled:opacity-50 disabled:hover:bg-transparent"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md-heavy"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.29289 18.7071C8.90237 18.3166 8.90237 17.6834 9.29289 17.2929L14.5858 12L9.29289 6.70711C8.90237 6.31658 8.90237 5.68342 9.29289 5.29289C9.68342 4.90237 10.3166 4.90237 10.7071 5.29289L16.7071 11.2929C16.8946 11.4804 17 11.7348 17 12C17 12.2652 16.8946 12.5196 16.7071 12.7071L10.7071 18.7071C10.3166 19.0976 9.68342 19.0976 9.29289 18.7071Z" fill="currentColor"></path></svg></button></div>

        </div></div>
      </div>
    </div>
    <div class="absolute start-0 flex" style="bottom:-10px;">
      ${languageName ? `<div id="language-code-${id}" title="You changed the response language here. This prompt includes a hidden language instructions" class="h-6 p-2 me-1 flex items-center justify-center rounded-md border text-xs text-token-text-tertiary border-token-border-medium bg-token-main-surface-secondary">Language: &nbsp<b>${languageName}</b></div>` : ''}
      ${toneName ? `<div id="tone-code-${id}" title="You changed the response tone here. This prompt includes a hidden tone instructions" class="h-6 p-2 me-1 flex items-center justify-center rounded-md border text-xs text-token-text-tertiary border-token-border-medium bg-token-main-surface-secondary">Tone: &nbsp<b>${toneName}</b></div>` : ''}
      ${writingStyleName ? `<div id="writing-style-code-${id}" title="You changed the response writing style here. This prompt includes a hidden writing style instructions" class="h-6 p-2 me-1 flex items-center justify-center rounded-md border text-xs text-token-text-tertiary border-token-border-medium bg-token-main-surface-secondary">Writing Style: &nbsp<b>${writingStyleName}</b></div>` : ''}
    </div>
  </div>
</article>
`;
}
function assetElements(assets) {
  if (assets?.length === 0) return '';
  const nonImageAssets = assets.filter((asset) => getFileType(asset.name) !== 'Image');
  const imageAssets = assets.filter((asset) => getFileType(asset.name) === 'Image');
  // eslint-disable-next-line no-nested-ternary
  return `${nonImageAssets.length > 0 ? `<div class="flex gap-2 flex-wrap">
  ${nonImageAssets.map((asset) => assetElement(nonImageAssets, imageAssets, asset)).join('')}
  </div>` : ''}${imageAssets.length > 0 ? `<div class="${imageAssets.length === 1 ? 'grid' : 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'}">
  ${imageAssets.map((asset) => assetElement(nonImageAssets, imageAssets, asset)).join('')}
  </div>` : ''}`;
}
function assetElement(nonImageAssets, imageAssets, asset) {
  const isImage = getFileType(asset.name) === 'Image';
  return isImage
    ? `<div class="relative mt-1 flex h-auto w-full max-w-lg items-center justify-center overflow-hidden bg-token-main-surface-tertiary text-token-text-primary ${imageAssets.length === 1 ? '' : 'aspect-square'}"><button type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="radix-:r7p:" data-state="closed"><img id="asset-${asset.id}" alt="Uploaded image" loading="lazy" width="${asset.width}" height="${asset.height}" decoding="async" data-nimg="1" class="max-w-full transition-opacity duration-300 opacity-100" src="" style="color: transparent;"></button></div>`
    : `<div class="group relative inline-block text-sm text-token-text-primary"><div class="relative overflow-hidden bg-token-main-surface-tertiary rounded-xl"><div class="p-2 w-80"><div class="flex flex-row items-center gap-2"><div class="relative h-10 w-10 shrink-0 overflow-hidden rounded-md">${getThumbnail(getFileType(asset.name), asset.id)}</div><div class="overflow-hidden"><div class="truncate font-medium">${asset.name}</div><div class="truncate text-token-text-tertiary">${getFileType(asset.name)}</div></div></div></div></div></div>`;
}
function getThumbnail(fileType, assetId = '') {
  switch (fileType) {
    case 'Image':
      return `<button type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="radix-:r58:" data-state="closed" class="h-full w-full"><span  id="asset-${assetId}" class="flex items-center h-full w-full justify-center bg-gray-500 dark:bg-gray-700 bg-cover bg-center text-white" style="background-image: url(&quot;&quot;);"></span></button>`;
    case 'Spreadsheet':
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" fill="none" class="h-10 w-10 flex-shrink-0" width="36" height="36"><rect width="36" height="36" rx="6" fill="#10A37F"></rect><path d="M15.5 10.5H12.1667C11.2462 10.5 10.5 11.2462 10.5 12.1667V13.5V18M15.5 10.5H23.8333C24.7538 10.5 25.5 11.2462 25.5 12.1667V13.5V18M15.5 10.5V25.5M15.5 25.5H18H23.8333C24.7538 25.5 25.5 24.7538 25.5 23.8333V18M15.5 25.5H12.1667C11.2462 25.5 10.5 24.7538 10.5 23.8333V18M10.5 18H25.5" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
    case 'PDF':
    case 'Document':
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" fill="none" class="h-10 w-10 flex-shrink-0" width="36" height="36"><rect width="36" height="36" rx="6" fill="#FF5588"></rect><path d="M19.6663 9.66663H12.9997C12.5576 9.66663 12.1337 9.84222 11.8212 10.1548C11.5086 10.4673 11.333 10.8913 11.333 11.3333V24.6666C11.333 25.1087 11.5086 25.5326 11.8212 25.8451C12.1337 26.1577 12.5576 26.3333 12.9997 26.3333H22.9997C23.4417 26.3333 23.8656 26.1577 24.1782 25.8451C24.4907 25.5326 24.6663 25.1087 24.6663 24.6666V14.6666L19.6663 9.66663Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"></path><path d="M19.667 9.66663V14.6666H24.667" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"></path><path d="M21.3337 18.8334H14.667" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"></path><path d="M21.3337 22.1666H14.667" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"></path><path d="M16.3337 15.5H15.5003H14.667" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
    case 'File':
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" fill="none" class="h-10 w-10 flex-shrink-0" width="36" height="36"><rect width="36" height="36" rx="6" fill="#0000FF"></rect><path d="M18.833 9.66663H12.9997C12.5576 9.66663 12.1337 9.84222 11.8212 10.1548C11.5086 10.4673 11.333 10.8913 11.333 11.3333V24.6666C11.333 25.1087 11.5086 25.5326 11.8212 25.8451C12.1337 26.1577 12.5576 26.3333 12.9997 26.3333H22.9997C23.4417 26.3333 23.8656 26.1577 24.1782 25.8451C24.4907 25.5326 24.6663 25.1087 24.6663 24.6666V15.5L18.833 9.66663Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"></path><path d="M18.833 9.66663V15.5H24.6663" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
    case 'JavaScript':
    case 'Python':
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" fill="none" class="h-10 w-10 flex-shrink-0" width="36" height="36"><rect width="36" height="36" rx="6" fill="#FF6E3C"></rect><path d="M21.333 23L26.333 18L21.333 13" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"></path><path d="M14.667 13L9.66699 18L14.667 23" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
    default:
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" fill="none" class="h-10 w-10 flex-shrink-0" width="36" height="36"><rect width="36" height="36" rx="6" fill="#0000FF"></rect><path d="M18.833 9.66663H12.9997C12.5576 9.66663 12.1337 9.84222 11.8212 10.1548C11.5086 10.4673 11.333 10.8913 11.333 11.3333V24.6666C11.333 25.1087 11.5086 25.5326 11.8212 25.8451C12.1337 26.1577 12.5576 26.3333 12.9997 26.3333H22.9997C23.4417 26.3333 23.8656 26.1577 24.1782 25.8451C24.4907 25.5326 24.6663 25.1087 24.6663 24.6666V15.5L18.833 9.66663Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"></path><path d="M18.833 9.66663V15.5H24.6663" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
  }
}
