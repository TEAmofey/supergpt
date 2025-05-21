/* eslint-disable no-unused-vars */
/* global addUploadFileButton, addGpt4Counter, addRateLimitBanner, curImageAssets:true, curFileAttachments:true, showNewChatPage, checkout, debounce, startNewChat, getConversationIdFromUrl, cachedSettings */
// eslint-disable-next-line no-unused-vars

const modelSwitcherMap = {
  'text-davinci-002-render-sha': {
    title: 'ChatGPT 3.5',
    description: 'Great for everyday tasks',
  },
  'gpt-4': {
    title: 'ChatGPT 4',
    description: 'Legacy model',
  },
  'gpt-4-5': {
    title: 'ChatGPT 4.5',
    description: 'Good for writing and exploring',
  },
  'gpt-4o': {
    title: 'ChatGPT 4o',
    description: 'Great for most questions',
  },
  'gpt-4o-mini': {
    title: 'ChatGPT 4o mini',
    description: 'Faster for most questions',
  },
  o1: {
    title: 'ChatGPT o1',
    description: 'Uses advanced reasoning',
  },
  'o1-mini': {
    title: 'ChatGPT o1-mini',
    description: 'Faster at reasoning',
  },
  'o1-preview': {
    title: 'ChatGPT o1-preview',
    description: 'Uses advanced reasoning',
  },
  o3: {
    title: 'ChatGPT o3',
    description: 'Uses advanced reasoning',
  },
  'o3-mini': {
    title: 'ChatGPT o3-mini',
    description: 'Fast at advanced reasoning',
  },
  'o3-mini-high': {
    title: 'ChatGPT o3-mini-high',
    description: 'Great at coding and logic',
  },
  'o4-mini': {
    title: 'ChatGPT o4-mini',
    description: 'Fastest at advanced reasoning',
  },
  'o4-mini-high': {
    title: 'ChatGPT o4-mini-high',
    description: 'Great at coding and visual reasoning',
  },
  'gpt-4o-canmore': {
    title: 'ChatGPT 4o Canvas',
    description: 'Collaborate on writing and code',
  },
  'gpt-4o-jawbone': {
    title: 'ChatGPT Tasks',
    description: 'Ask ChatGPT to follow up later',
  },
  auto: {
    title: 'Dynamic',
    description: 'Use the right model from my requests',
  },
};
async function overrideModelSwitcher() {
  const originalModelSwitcherButton = document.querySelector('main button[data-testid="model-switcher-dropdown-button"]');
  if (!originalModelSwitcherButton) return;
  if (originalModelSwitcherButton?.classList?.contains('hidden')) return;
  originalModelSwitcherButton?.classList?.add('hidden');

  const { models } = await chrome.storage.local.get(['models']);
  if (!cachedSettings.overrideModelSwitcher || !models || models.length === 0) {
    window.sessionStorage.removeItem('sp/selectedModel');
    originalModelSwitcherButton?.classList?.remove('hidden');
    return;
  }
  const selectedModel = await getSelectedModel();
  // replace model switcher with custom model switcher
  if (originalModelSwitcherButton.parentElement) {
    const conversationIdFromUrl = getConversationIdFromUrl();
    const modelSwitcherElement = modelSwitcher(selectedModel, models);
    originalModelSwitcherButton.parentElement.parentElement.style.zIndex = '10000';
    originalModelSwitcherButton.parentElement.classList = 'flex flex-row-reverse';
    originalModelSwitcherButton.parentElement.insertAdjacentHTML('afterbegin', modelSwitcherElement);
    addModelSwitcherEventListener();
  }
}
function modelSwitcher(selectedModel, models = []) {
  if (!selectedModel) return '';
  return `<div style="width: min-content;"><button id="model-switcher-button" class="relative w-full cursor-pointer rounded-md border border-token-border-medium bg-token-main-surface-primary ps-3 pe-10 text-start focus:outline-none  sm:text-sm" type="button">
  <label class="relative text-xs text-token-text-tertiary" style="top:-2px;">Model</label>
  <span class="inline-flex w-full truncate font-semibold text-token-text-primary">
    <span class="flex h-5 items-center gap-1 truncate relative" style="top:-2px;"><span id="selected-model-title">${modelSwitcherMap[selectedModel.slug]?.title || selectedModel.title}</span>
    </span>
  </span>
  <span class="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-2">
    <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 text-gray-400" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  </span>
</button>

<ul id="model-list-dropdown" style="width:300px;max-height:400px" class="hidden absolute z-10 mt-1 overflow-auto rounded-md text-base border border-token-border-medium focus:outline-none bg-token-main-surface-secondary sm:text-sm -translate-x-1/4" role="menu" aria-orientation="vertical" aria-labelledby="model-switcher-button" tabindex="-1">

  <div class="flex items-center justify-between pb-0 mx-2 ps-4 pe-4 pt-4 juice:mb-1 juice:px-5 juice:pt-2"><span class="text-sm text-token-text-tertiary">Model</span><a href="https://help.openai.com/en/articles/7102672-how-can-i-access-gpt-4" target="_blank" rel="noreferrer"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md ps-0.5 text-token-text-tertiary h-5 w-5"><path fill="currentColor" d="M13 12a1 1 0 1 0-2 0v4a1 1 0 1 0 2 0zM12 9.5A1.25 1.25 0 1 0 12 7a1.25 1.25 0 0 0 0 2.5"></path><path fill="currentColor" fill-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2M4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0" clip-rule="evenodd"></path></svg></a></div>

  ${createModelListDropDown(models, selectedModel)}
  <div role="separator" aria-orientation="horizontal" style="bottom:44px;" class="sticky h-[1px] border-token-border-medium"></div>
</ul></div>`;
}
function createModelListDropDown(models, selectedModel) {
  return `${models.filter((m) => !m.slug.includes('plugins')).sort(
    (a, b) => a.title.localeCompare(b.title),
  ).map((model) => `<li class="group relative cursor-pointer select-none mx-2 py-2 ps-4 pe-12 rounded-md hover:bg-token-main-surface-tertiary" id="model-switcher-option-${model.slug}" role="option" tabindex="-1">
 <div class="flex flex-col">
   <span class="font-semibold flex h-6 items-center gap-1 truncate text-token-text-primary">${model.title || modelSwitcherMap[model.slug]?.title}</span>
   <span class="text-token-text-tertiary text-xs">${modelSwitcherMap[model.slug]?.description || model.description}</span>
 </div>
 ${model.slug === selectedModel.slug ? `<span id="model-switcher-checkmark" style="right:36px;" class="absolute inset-y-0 flex items-center text-token-text-primary">
 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md"><path fill="currentColor" fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m14.076-4.068a1 1 0 0 1 .242 1.393l-4.75 6.75a1 1 0 0 1-1.558.098l-2.5-2.75a1 1 0 0 1 1.48-1.346l1.66 1.827 4.032-5.73a1 1 0 0 1 1.394-.242" clip-rule="evenodd"></path></svg>
 </span>` : ''}
</li>`).join('')}`;
}

function addModelSwitcherEventListener() {
  const modelSwitcherButton = document.querySelector('main #model-switcher-button');
  modelSwitcherButton?.addEventListener('click', () => {
    const modelListDropdown = document.querySelector('main #model-list-dropdown');
    const cl = modelListDropdown.classList;
    if (cl.contains('block')) {
      modelListDropdown.classList.replace('block', 'hidden');
    } else {
      modelListDropdown.classList.replace('hidden', 'block');
    }
  });
  // close modelListDropdown when clicked outside
  document.addEventListener('click', (e) => {
    const modelListDropdown = document.querySelector('main #model-list-dropdown');
    const cl = modelListDropdown?.classList;
    if (cl && cl.contains('block') && !e.target.closest('#model-switcher-button')) {
      modelListDropdown.classList.replace('block', 'hidden');
    }
  });

  const modelSwitcherOptions = document.querySelectorAll('main [id^=model-switcher-option-]');

  modelSwitcherOptions.forEach((option) => {
    option.addEventListener('click', () => {
      chrome.storage.local.get(['models'], ({
        models,
      }) => {
        const allModels = models || [];
        const modelSlug = option.id.split('model-switcher-option-')[1];
        const newSelectedModel = allModels.find((m) => m.slug === modelSlug);
        if (!newSelectedModel) return;
        window.sessionStorage.setItem('sp/selectedModel', newSelectedModel.slug);
        // update model switcher
        const modelListDropdown = document.querySelector('main #model-list-dropdown');
        if (!modelListDropdown) return;
        modelListDropdown.classList.replace('block', 'hidden');
        const modelSwitcherCheckmark = document.querySelector('main #model-switcher-checkmark');
        if (modelSwitcherCheckmark) modelSwitcherCheckmark.remove();
        const selectedModelTitle = document.querySelector('main #selected-model-title');
        selectedModelTitle.innerHTML = `${modelSwitcherMap[newSelectedModel.slug]?.title || newSelectedModel.title}`;
        const selectedModelOption = document.querySelector(`main #model-switcher-option-${newSelectedModel.slug?.replaceAll('.', '\\.')}`);
        if (!selectedModelOption) return;
        if (!modelSwitcherCheckmark) return;
        selectedModelOption.appendChild(modelSwitcherCheckmark);
        // save selected model
        chrome.storage.local.set({ selectedModel: newSelectedModel }, () => {
          const textInput = document.querySelector('main #prompt-textarea');
          if (textInput) {
            textInput.focus();
          }
        });
      });
    });
  });
  // chrome.storage.onChanged.addListener((e) => {
  //   if (e.selectedModel && e.selectedModel?.newValue?.slug !== e.selectedModel?.oldValue?.slug) {
  //     const modelListDropdown = document.querySelector('main #model-list-dropdown');
  //     if (!modelListDropdown) return;
  //     modelListDropdown.classList.replace('block', 'hidden');
  //     const modelSwitcherCheckmark = document.querySelector('main #model-switcher-checkmark');
  //     if (modelSwitcherCheckmark) modelSwitcherCheckmark.remove();
  //     const selectedModelTitle = document.querySelector('main #selected-model-title');
  //     selectedModelTitle.innerHTML = `${modelSwitcherMap[e.selectedModel.newValue?.slug]?.title || e.selectedModel.newValue?.title}`;
  //     const selectedModelOption = document.querySelector(`main #model-switcher-option-${e.selectedModel?.newValue?.slug?.replaceAll('.', '\\.')}`);
  //     if (!selectedModelOption) return;
  //     if (!modelSwitcherCheckmark) return;
  //     selectedModelOption.appendChild(modelSwitcherCheckmark);
  //   }
  // });
}
async function getSelectedModel() {
  const { models, selectedModel } = await chrome.storage.local.get(['models', 'selectedModel']);
  if (!models || models.length === 0) return null;
  const curSelectedModel = window.sessionStorage.getItem('sp/selectedModel');
  if (curSelectedModel && models.find((m) => m.slug === curSelectedModel)) {
    return models.find((m) => m.slug === curSelectedModel);
  }
  return selectedModel || models[0] || null;
}
function setSelectedModel() {
  chrome.storage.local.get(['selectedModel', 'models'], ({ selectedModel, models }) => {
    if (cachedSettings.overrideModelSwitcher) {
      if (selectedModel) {
        window.sessionStorage.setItem('sp/selectedModel', selectedModel.slug);
      } else {
        window.sessionStorage.setItem('sp/selectedModel', models[0]?.slug);
      }
    } else {
      window.sessionStorage.removeItem('sp/selectedModel');
    }
  });
}
