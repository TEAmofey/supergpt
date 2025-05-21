/* eslint-disable no-restricted-globals */
/* global toast, Sortable, startNewChat, languageList, dropdown, addDropdownEventListener, createManager, addOrReplacePromptCard, initializeContinueButton, showConfirmDialog, errorUpgradeConfirmation, insertPromptIntoTextArea, getConversationName, managerModalCurrentTab, createTemplateWordsModal, stopAnimateFavicon, faviconTimeout, isDarkMode, translate, closeMenus, getConversationIdFromUrl, convertToParagraphs, updatePromptFolderCount, addConversationToSidebarAndSync, updateInputCounter, cachedSettings */
let runningPromptChain;
let runningPromptChainStepIndex = 0;
let templateWordsMap = {};
// eslint-disable-next-line no-unused-vars
function openPromptEditorModal(newPromptChain) {
  const {
    id: promptChainId, title: promptChainTitle, instruction: promptChainInstruction = '', steps: promptChainSteps, language: promptChainLanguage = 'en', tags: promptChainTags = [], folder: promptChainFolder, steps_delay: promptChainStepsDelay, is_public: promptChainIsPublic, is_favorite: promptChainIsFavorite = false,
  } = newPromptChain;

  // const promptChainIsPublic = newPromptChain.isPublic || newPromptChain.is_public || false;
  // const promptChainStepsDelay = newPromptChain.stepsDelay || newPromptChain.steps_delay || newPromptChain.delay || 2000;

  const isNew = promptChainId === undefined;
  const promptEditorModal = document.createElement('div');
  promptEditorModal.style = 'position:fixed;top:0px;left:0px;width:100%;height:100%;;display:flex;align-items:center;justify-content:center;z-index:10001;overflow-y: auto; max-height: 100vh;';
  promptEditorModal.classList = 'bg-black/50 dark:bg-black/80';
  promptEditorModal.id = 'prompt-editor-modal';
  promptEditorModal.addEventListener('click', (e) => {
    if (e.target.id === 'prompt-editor-modal') {
      // if found icon with data-expandtype="collapse", click on it
      const collapseEditorButton = document.querySelector('[data-expandtype="collapse"]');
      if (collapseEditorButton) {
        collapseEditorButton.parentElement.click();
        return;
      }
      // if made changes, show confirm dialog
      const promptFolder = document.querySelector('#selected-prompt-editor-category-title')?.textContent || '';
      const promptTitle = document.querySelector('#prompt-editor-name-input').value;
      const promptDelay = document.querySelector('#prompt-editor-delay-input').value;
      const promptTags = Array.from(document.querySelectorAll('#tag-selector-container > div[data-selected="true"]')).map((tag) => tag.textContent.toLocaleLowerCase()).sort().join('');
      const promptInstruction = document.querySelector('#prompt-editor-instruction-textarea').value;
      const promptSteps = Array.from(document.querySelectorAll('[id^="prompt-editor-input-"]')).map((step) => step.value);
      const promptIsPublic = document.querySelector('#public-prompt-checkbox').checked;
      const promptIsFavorite = document.querySelector('#favorite-prompt-checkbox').checked;

      const newUnsavedPromptChain = isNew && ((promptChainTitle === '' && promptTitle !== '') || (promptChainSteps.join('') === '' && promptSteps.join('') !== ''));
      const updatedUnsavedPromptChain = !isNew && (promptFolder !== promptChainFolder.name || promptTitle !== promptChainTitle || promptDelay !== promptChainStepsDelay.toString() || promptTags !== promptChainTags.map((t) => t.name).sort().join('') || promptInstruction !== (promptChainInstruction || '') || promptSteps.join('') !== promptChainSteps.join('') || promptIsPublic !== promptChainIsPublic || promptIsFavorite !== promptChainIsFavorite);
      const shouldShowConfirmDialog = newUnsavedPromptChain || updatedUnsavedPromptChain;
      if (shouldShowConfirmDialog) {
        showConfirmDialog('Discard changes', 'You have unsaved changes. Are you sure you want to discard them?', 'Keep editing', 'Discard changes', null, () => { promptEditorModal.remove(); }, 'red');
        return;
      }
      // if no changes, remove modal
      promptEditorModal.remove();
    }
  });
  const promptEditorModalContent = document.createElement('div');
  promptEditorModalContent.style = 'max-width:100%;width:840px;height:90vh;max-height:90vh;';
  promptEditorModalContent.classList = 'bg-token-main-surface-primary rounded-xl flex flex-col items-start justify-start border border-token-border-medium relative py-4 shadow-md';
  promptEditorModalContent.id = 'prompt-editor-modal-content';
  promptEditorModalContent.dataset.id = promptChainId;
  const modalTitle = document.createElement('div');
  modalTitle.classList = 'flex items-center justify-between w-full font-bold mb-9 px-4 text-token-text-primary text-lg';
  modalTitle.innerHTML = `<span class="flex items-center">${isNew ? translate('Create a new prompt') : translate('Edit prompt')} <a href="https://www.youtube.com/watch?v=ha2AiwOglt4&ab_channel=Superpower" target="_blank" rel="noreferrer"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md ps-0.5 text-token-text-tertiary h-5 w-5 ms-2"><path fill="currentColor" d="M13 12a1 1 0 1 0-2 0v4a1 1 0 1 0 2 0zM12 9.5A1.25 1.25 0 1 0 12 7a1.25 1.25 0 0 0 0 2.5"></path><path fill="currentColor" fill-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2M4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0" clip-rule="evenodd"></path></svg></a> </span> <button class="btn flex justify-center gap-2 btn-primary border" id="see-all-prompt-chains">${translate('See all prompts')}</button>`;
  promptEditorModalContent.appendChild(modalTitle);

  const promptEditorFolderLanguageWrapper = document.createElement('div');
  promptEditorFolderLanguageWrapper.style = 'display:flex;align-items:center;justify-content:space-between;width:100%;margin-bottom:8px;position:relative;padding: 0 16px 16px 16px;';
  promptEditorModalContent.appendChild(promptEditorFolderLanguageWrapper);

  const folderSelectorWrapper = document.createElement('div');
  folderSelectorWrapper.style = 'position:relative;min-width:170px;width:170px;z-index:1000;';
  promptEditorFolderLanguageWrapper.appendChild(folderSelectorWrapper);

  const languageSelectorWrapper = document.createElement('div');
  languageSelectorWrapper.style = 'position:relative;min-width:170px;width:170px;z-index:1000;';
  promptEditorFolderLanguageWrapper.appendChild(languageSelectorWrapper);

  let { selectedPromptEditorLanguage } = cachedSettings;
  // add folder dropdown
  chrome.runtime.sendMessage({
    type: 'getAllPromptFolders',
    forceRefresh: true,
    detail: {
      sortBy: 'alphabetical',
    },
  }, (promptFolders) => {
    // only show add folder dialog if trying to add a new prompt. don't show when looking at a public prompt. instead show for pulic prompts when trying to add to my prompts
    if (promptFolders.length === 0 && !newPromptChain.title) {
      addFolderConfirmDialog();
    }
    // checking f.name for backward compatibility (Custom Prompts and Prompt Chains)
    const newSelectedPromptEditorCategory = promptChainFolder && typeof promptChainFolder.id === 'number' ? promptFolders.find((f) => f.id.toString() === promptChainFolder.id.toString()) : promptFolders[0];
    chrome.storage.local.set({ settings: { ...cachedSettings, selectedPromptEditorCategory: newSelectedPromptEditorCategory } });
    folderSelectorWrapper.innerHTML = dropdown('Prompt-Editor-Category', promptFolders, newSelectedPromptEditorCategory, 'id', 'left');
    addDropdownEventListener('Prompt-Editor-Category', promptFolders, 'id');
  });

  // add language dropdown
  if (promptChainLanguage) {
    selectedPromptEditorLanguage = languageList.find((l) => l.code === promptChainLanguage);
  }
  const promptLanguageList = [{ code: 'select', name: 'Select' }, ...languageList.slice(1)];
  languageSelectorWrapper.innerHTML = dropdown('Prompt-Editor-Language', promptLanguageList, selectedPromptEditorLanguage, 'code', 'right');

  const promptEditorNameDelayWrapper = document.createElement('div');
  promptEditorNameDelayWrapper.style = 'display:flex;align-items:center;justify-content:space-between;width:100%;margin-bottom:8px;position:relative;padding: 0 16px 16px 16px;';
  promptEditorModalContent.appendChild(promptEditorNameDelayWrapper);

  const promptName = document.createElement('div');
  promptName.style = 'width:100%;margin-right: 16px;';

  const promptInputNameLabel = document.createElement('label');
  promptInputNameLabel.classList = 'w-full text-sm text-token-text-tertiary';
  promptInputNameLabel.textContent = translate('Prompt Name');
  promptName.appendChild(promptInputNameLabel);

  const promptInputNameInput = document.createElement('input');
  promptInputNameInput.id = 'prompt-editor-name-input';
  promptInputNameInput.className = 'w-full text-sm text-token-text-primary border border-token-border-medium rounded-md bg-token-main-surface-secondary px-2 py-1 text-sm h-10';
  promptInputNameInput.placeholder = 'Prompt name';
  promptInputNameInput.value = promptChainTitle;
  promptInputNameInput.addEventListener('input', () => {
    promptInputNameInput.style.border = '1px solid #565869';
  });

  promptName.appendChild(promptInputNameInput);
  promptEditorNameDelayWrapper.appendChild(promptName);

  const promptDelay = document.createElement('div');
  promptDelay.style = 'min-width: 200px;';

  const promptEditorDelayLabel = document.createElement('label');
  promptEditorDelayLabel.classList = 'w-full text-sm text-token-text-tertiary';
  promptEditorDelayLabel.textContent = translate('Delay between steps');
  promptDelay.appendChild(promptEditorDelayLabel);

  const promptEditorDelayInput = document.createElement('input');
  promptEditorDelayInput.id = 'prompt-editor-delay-input';
  promptEditorDelayInput.className = 'w-full text-sm text-token-text-primary border border-token-border-medium rounded-md bg-token-main-surface-secondary px-2 py-1 text-sm h-10';
  promptEditorDelayInput.placeholder = 'Delay b/w steps';
  promptEditorDelayInput.value = promptChainStepsDelay || '2000';
  promptEditorDelayInput.addEventListener('input', () => {
    promptEditorDelayInput.style.border = '1px solid #565869';
  });
  promptDelay.appendChild(promptEditorDelayInput);
  promptEditorNameDelayWrapper.appendChild(promptDelay);

  const millisecondsLabel = document.createElement('span');
  millisecondsLabel.style = 'right: 24px; z-index: 999; bottom: 24px;';
  millisecondsLabel.classList = 'text-sm text-token-text-tertiary absolute ';

  millisecondsLabel.textContent = 'ms';
  promptEditorNameDelayWrapper.appendChild(millisecondsLabel);

  const tagInstructionWrapper = document.createElement('div');
  tagInstructionWrapper.classList = 'flex items-center justify-start w-full px-4';
  promptEditorModalContent.appendChild(tagInstructionWrapper);

  // tag selector
  const addTagsButton = document.createElement('button');
  addTagsButton.id = 'tag-selector-button';
  addTagsButton.classList = 'btn flex justify-center gap-2 btn-secondary me-2';
  addTagsButton.innerHTML = `<span id="tag-selector-button-text">${translate('Show tags')}</span><span id="tag-selector-button-count">(${promptChainTags.length})</span>`;
  addTagsButton.addEventListener('click', () => {
    // hide instruction section
    const curAddInstructionButton = document.querySelector('#instruction-selector-button');
    curAddInstructionButton.textContent = translate('Show instructions');
    document.querySelector('#instruction-section')?.classList.add('hidden');
    if (addTagsButton.querySelector('#tag-selector-button-text').textContent === translate('Hide tags')) {
      addTagsButton.querySelector('#tag-selector-button-text').textContent = translate('Show tags');
      document.querySelector('#tag-selector-section')?.classList.add('hidden');
      return;
    }
    addTagsButton.querySelector('#tag-selector-button-text').textContent = translate('Hide tags');
    document.querySelector('#tag-selector-section')?.classList.remove('hidden');
  });
  tagInstructionWrapper.appendChild(addTagsButton);

  // instruction button
  const addInstructionButton = document.createElement('button');
  addInstructionButton.id = 'instruction-selector-button';
  addInstructionButton.classList = 'btn flex justify-center gap-2 btn-secondary me-2';
  addInstructionButton.textContent = translate('Show instructions');
  addInstructionButton.addEventListener('click', () => {
    // hide tag selector
    const curAddTagsButton = document.querySelector('#tag-selector-button');
    curAddTagsButton.querySelector('#tag-selector-button-text').textContent = translate('Show tags');
    document.querySelector('#tag-selector-section')?.classList.add('hidden');
    if (addInstructionButton.textContent === translate('Hide instructions')) {
      addInstructionButton.textContent = translate('Show instructions');
      document.querySelector('#instruction-section')?.classList.add('hidden');
      return;
    }
    addInstructionButton.textContent = translate('Hide instructions');
    document.querySelector('#instruction-section')?.classList.remove('hidden');
  });
  tagInstructionWrapper.appendChild(addInstructionButton);

  // tag selector
  const tagSelectorWrapper = document.createElement('div');
  tagSelectorWrapper.classList = 'w-full ps-8 pe-4 pt-2';
  tagSelectorWrapper.appendChild(createTagSelector(promptChainTags));
  promptEditorModalContent.appendChild(tagSelectorWrapper);

  // instruction section
  const instructionSectionWrapper = document.createElement('div');
  instructionSectionWrapper.id = 'instruction-section';
  instructionSectionWrapper.classList = 'hidden w-full ps-8 pe-4 pt-2';

  // add a full with textarea for instructions
  const instructionTextArea = document.createElement('textarea');
  instructionTextArea.id = 'prompt-editor-instruction-textarea';
  instructionTextArea.classList = 'w-full h-full bg-token-main-surface-secondary text-token-text-primary border border-token-border-medium rounded-xl px-2 py-1 text-sm placeholder:text-gray-500';
  instructionTextArea.placeholder = 'Add instructions on how to use this prompt, what are the expected variable and responses, etc.';
  instructionTextArea.style = 'height: 100px;';
  instructionTextArea.value = promptChainInstruction;
  instructionTextArea.addEventListener('input', () => { });
  instructionSectionWrapper.appendChild(instructionTextArea);

  promptEditorModalContent.appendChild(instructionSectionWrapper);

  const promptStepsHeader = document.createElement('div');
  promptStepsHeader.style = 'display:flex; align-items:end; justify-content:between;width:100%;padding: 16px;';

  const promptStepsLabel = document.createElement('label');
  promptStepsLabel.classList = 'w-full text-sm text-token-text-tertiary';
  promptStepsLabel.textContent = translate('Steps');
  promptStepsHeader.appendChild(promptStepsLabel);

  const promptEditorStepsWrapper = document.createElement('div');
  promptEditorStepsWrapper.id = 'prompt-editor-steps-wrapper';
  promptEditorStepsWrapper.style = 'width:100%;display:flex;flex-direction:column;align-items:start;justify-content:start;overflow: auto;padding: 0 16px;scroll-behavior: smooth;';

  if (isNew) {
    const promptStepsAutoGenerateButton = document.createElement('button');
    promptStepsAutoGenerateButton.classList = 'btn flex justify-center gap-2 btn-secondary';
    promptStepsAutoGenerateButton.textContent = translate('Auto generate steps from current conversation');
    promptStepsHeader.appendChild(promptStepsAutoGenerateButton);
    chrome.runtime.sendMessage({
      type: 'checkHasSubscription',
    }, (hasSubscription) => {
      promptStepsAutoGenerateButton.addEventListener('click', () => {
        const allUserMessageWrappers = document.querySelectorAll('main article div[data-message-author-role="user"]');

        const allUserMessages = [];
        allUserMessageWrappers.forEach((userMessageWrapper) => {
          const userMessage = userMessageWrapper.querySelector('div.whitespace-pre-wrap');
          if (userMessage) allUserMessages.push(userMessage.innerText);
        });
        if (allUserMessages.length === 0) {
          toast('No user messages found in the conversation', 'error');
          return;
        }
        if (!hasSubscription && allUserMessages.length >= 2) {
          const error = { type: 'limit', title: 'You have reached the limit', message: 'Prompts with free account cannot have more than 2 steps. Upgrade to Pro to remove all limits.' };
          errorUpgradeConfirmation(error);
          return;
        }
        promptEditorStepsWrapper.innerHTML = '';
        const tmpPromptChain = newPromptChain;
        tmpPromptChain.steps = allUserMessages;
        allUserMessages.forEach((message, index) => {
          const promptRow = createPromptEditorStep(tmpPromptChain, index, isNew);
          promptEditorStepsWrapper.appendChild(promptRow);
        });
      });
    });
  }
  promptEditorModalContent.appendChild(promptStepsHeader);

  promptChainSteps.forEach((_prompt, stepIndex) => {
    const promptRow = createPromptEditorStep(newPromptChain, stepIndex, isNew);
    promptEditorStepsWrapper.appendChild(promptRow);
  });
  // modal action wrapper
  Sortable.create(promptEditorStepsWrapper, {
    handle: '#prompt-editor-drag-handle',
    multiDrag: true,
    direction: 'vertical',
    selectedClass: 'multi-drag-selected',
  });
  promptEditorModalContent.appendChild(promptEditorStepsWrapper);

  const promptEditorModalActionWrapper = document.createElement('div');
  promptEditorModalActionWrapper.classList = 'flex items-end justify-between w-full mt-auto px-4 flex-wrap';
  promptEditorModalContent.appendChild(promptEditorModalActionWrapper);

  const checkboxWrapper = document.createElement('div');
  checkboxWrapper.classList = 'flex items-center justify-end mt-3 w-full';
  promptEditorModalActionWrapper.appendChild(checkboxWrapper);

  const favoriteCheckBoxWrapper = document.createElement('div');
  favoriteCheckBoxWrapper.classList = 'flex items-center justify-end me-6';

  const favoriteCheckboxLabel = document.createElement('label');
  favoriteCheckboxLabel.htmlFor = 'favorite-prompt-checkbox';
  favoriteCheckboxLabel.textContent = translate('Favorite');
  favoriteCheckboxLabel.classList = 'text-token-text-tertiary';
  favoriteCheckBoxWrapper.appendChild(favoriteCheckboxLabel);

  const favoriteCheckbox = document.createElement('input');
  favoriteCheckbox.type = 'checkbox';
  favoriteCheckbox.id = 'favorite-prompt-checkbox';
  favoriteCheckbox.classList = 'ms-2';
  favoriteCheckbox.checked = promptChainIsFavorite;
  favoriteCheckBoxWrapper.appendChild(favoriteCheckbox);

  checkboxWrapper.appendChild(favoriteCheckBoxWrapper);

  const publicCheckBoxWrapper = document.createElement('div');
  publicCheckBoxWrapper.classList = 'flex items-center justify-end';

  const publicCheckboxLabel = document.createElement('label');
  publicCheckboxLabel.htmlFor = 'public-prompt-checkbox';
  publicCheckboxLabel.textContent = translate('public');
  publicCheckboxLabel.classList = 'text-token-text-tertiary';
  publicCheckBoxWrapper.appendChild(publicCheckboxLabel);

  const publicCheckbox = document.createElement('input');
  publicCheckbox.type = 'checkbox';
  publicCheckbox.id = 'public-prompt-checkbox';
  publicCheckbox.classList = 'ms-2';
  publicCheckbox.checked = promptChainIsPublic;
  publicCheckBoxWrapper.appendChild(publicCheckbox);

  checkboxWrapper.appendChild(publicCheckBoxWrapper);

  // left section
  const leftSection = document.createElement('div');
  leftSection.classList = 'flex items-center justify-start flex-wrap';
  promptEditorModalActionWrapper.appendChild(leftSection);

  const addStepButton = document.createElement('button');
  addStepButton.classList = 'btn flex justify-center gap-2 btn-primary border';
  addStepButton.style = 'margin-top:16px;';
  addStepButton.id = 'prompt-editor-add-step-button';
  addStepButton.textContent = translate('plus Add New Step');
  chrome.runtime.sendMessage({
    type: 'checkHasSubscription',
  }, (hasSubscription) => {
    addStepButton.addEventListener('click', () => {
      const curPromptSteps = document.querySelectorAll('[id^="prompt-editor-input-"]');
      if (!hasSubscription && curPromptSteps.length >= 2) {
        const error = { type: 'limit', title: 'You have reached the limit', message: 'Prompts with free account cannot have more than 2 steps. Upgrade to Pro to remove all limits.' };
        errorUpgradeConfirmation(error);
        return;
      }

      const promptRow = createPromptEditorStep(newPromptChain, curPromptSteps.length, isNew);
      const curPromptEditorStepsWrapper = document.querySelector('#prompt-editor-steps-wrapper');
      curPromptEditorStepsWrapper.appendChild(promptRow);
      promptRow.scrollIntoView({ behavior: 'smooth', block: 'end' });
      setTimeout(() => {
        promptRow.querySelector('textarea').focus();
      }, 500);
    });
  });
  leftSection.appendChild(addStepButton);
  // right section
  const rightSection = document.createElement('div');
  rightSection.classList = 'flex items-center justify-end flex-wrap';
  promptEditorModalActionWrapper.appendChild(rightSection);

  // add cancel button
  const cancelButton = document.createElement('button');
  cancelButton.classList = 'btn flex justify-center gap-2 btn-secondary border me-2';
  cancelButton.style = 'margin-top:16px;margin-left:8px;';
  cancelButton.textContent = translate('Cancel');
  cancelButton.id = 'prompt-editor-cancel-button';
  cancelButton.addEventListener('click', () => {
    promptEditorModal.remove();
  });
  rightSection.appendChild(cancelButton);

  // add submit button
  const submitButton = document.createElement('button');
  submitButton.classList = 'btn flex justify-center gap-2 btn-primary border';
  submitButton.style = 'margin-top:16px;margin-left:8px;';
  submitButton.id = 'prompt-editor-submit-button';
  submitButton.textContent = isNew ? translate('Save to my Prompts') : translate('Update Prompt');
  submitButton.addEventListener('click', () => {
    submitButton.disabled = true;
    const curSelectedFolder = document.querySelector('#selected-prompt-editor-category-title');
    if (!curSelectedFolder) {
      submitButton.disabled = false;
      addFolderConfirmDialog();
      return;
    }
    const curPromptInputNameInput = document.querySelector('#prompt-editor-name-input');
    const curPromptChainTitle = curPromptInputNameInput.value;
    if (!curPromptChainTitle) {
      submitButton.disabled = false;
      curPromptInputNameInput.focus();
      curPromptInputNameInput.style.border = '1px solid #ff4a4a';
      toast('Please enter a prompt name', 'error');
      return;
    }
    const curpromptEditorDelayInput = document.querySelector('#prompt-editor-delay-input');
    const curPromptChainDelay = parseInt(curpromptEditorDelayInput.value, 10);
    if (!curPromptChainDelay) {
      submitButton.disabled = false;
      curpromptEditorDelayInput.focus();
      curpromptEditorDelayInput.style.border = '1px solid #ff4a4a';
      toast('Please enter a valid delay in milliseconds', 'error');
      return;
    }

    const nonEmptySteps = [];
    document.querySelectorAll('[id^=prompt-editor-input-]').forEach((step) => {
      if (step.value) nonEmptySteps.push(step.value);
    });
    if (nonEmptySteps.length === 0) {
      submitButton.disabled = false;
      toast('Please add at least one step to the prompt chain', 'error');
      return;
    }
    const isPublic = document.querySelector('#public-prompt-checkbox').checked;
    const isFavorite = document.querySelector('#favorite-prompt-checkbox').checked;
    const curSelectedTags = document.querySelectorAll('#tag-selector-container > div[data-selected="true"]');
    const curPromptInstruction = document.querySelector('#prompt-editor-instruction-textarea').value;

    const { selectedPromptEditorCategory } = cachedSettings;
    const promptData = {
      title: curPromptChainTitle,
      instruction: curPromptInstruction,
      steps: nonEmptySteps,
      steps_delay: curPromptChainDelay,
      is_public: isPublic,
      is_favorite: isFavorite,
      folder: selectedPromptEditorCategory.id,
      language: selectedPromptEditorLanguage.code,
      tags: Array.from(curSelectedTags).map((tag) => tag.id.split('tag-')[1]),
    };
    if (!isNew) {
      promptData.id = promptChainId;
    }
    if (isNew) {
      updatePromptFolderCount(null, selectedPromptEditorCategory.id, 1);
    }
    chrome.runtime.sendMessage({
      type: isNew ? 'addPrompts' : 'updatePrompt',
      detail: {
        prompts: [promptData],
        promptData,
      },
    }, (response) => {
      if (response.error && response.error.type === 'limit') {
        submitButton.disabled = false;
        errorUpgradeConfirmation(response.error);
        return;
      }
      const newPrompt = isNew ? response[0] : response;
      if (typeof promptChainIsFavorite !== 'undefined') {
        initializeContinueButton(true);
      }
      promptEditorModal.remove();
      //  update manager if it exists
      const managerModal = document.querySelector('#modal-manager');
      if (managerModal && managerModalCurrentTab === 'prompts') {
        addOrReplacePromptCard(newPrompt);
      }
      toast(`Prompt is ${isNew ? 'added to your prompts' : 'updated'}!`);
    });
  });
  rightSection.appendChild(submitButton);

  promptEditorModal.appendChild(promptEditorModalContent);
  document.body.appendChild(promptEditorModal);

  addPromptEditorEventListener();
  addDropdownEventListener('Prompt-Editor-Language', promptLanguageList, 'code');

  // observe promptEditorStepsWrapper for changes and add step count/total to each prompt
  const curPromptEditorStepsWrapper = document.querySelector('#prompt-editor-steps-wrapper');
  const observer = new MutationObserver(() => {
    const promptRows = curPromptEditorStepsWrapper.childNodes;
    promptRows.forEach((row, i) => {
      const stepCount = i + 1;
      const promptCount = promptRows.length;
      const promptCountElement = row.querySelector('#prompt-chain-step-count');
      if (promptCountElement) promptCountElement.innerHTML = `${stepCount} / ${promptCount}`;
    });
  });
  observer.observe(curPromptEditorStepsWrapper, { childList: true });
}

function addPromptEditorEventListener() {
  const seeAllPromptsButton = document.querySelector('#see-all-prompt-chains');
  seeAllPromptsButton.addEventListener('click', () => {
    const promptEditorModal = document.querySelector('#prompt-editor-modal');
    promptEditorModal.remove();
    const existingManagerModal = document.querySelector('#modal-manager');
    if (!existingManagerModal || managerModalCurrentTab !== 'prompts') {
      createManager('prompts');
    }
  });
}

function addFolderConfirmDialog() {
  showConfirmDialog('You don\'t have any prompt categories', 'To create prompts, you need to have at least one category.', 'Cancel', 'Create New Prompt Category ', () => {
    // close prompt editor
    document.querySelector('#prompt-editor-modal').remove();
  }, () => {
    // close prompt editor
    document.querySelector('#prompt-editor-modal').remove();
    // if modal-manager not open, open it otherwise switch to prompts tab
    const existingManagerModal = document.querySelector('#modal-manager');
    if (!existingManagerModal || managerModalCurrentTab !== 'prompts') {
      createManager('prompts');
    }
    setTimeout(() => {
      // click on addPromptCategoryButton
      document.querySelector('#add-prompt-folder-button')?.click();
    }, 500);
  }, 'green');
}
function createPromptEditorStep(promptChain, stepIndex, isNew = false) {
  const stepText = promptChain.steps[stepIndex] || '';
  const promptRow = document.createElement('div');
  promptRow.style = 'align-self:stretch;overflow:auto;min-height:144px;z-index:999;';
  promptRow.classList = 'w-full flex items-center justify-between mb-4 rounded-xl relative h-full';
  // create a textinput for each prompt and insert the prompt text in it
  const promptInputActionWrapper = document.createElement('div');
  promptInputActionWrapper.style = 'width:70px;';
  promptInputActionWrapper.classList = 'flex flex-col items-center justify-between h-full border-t border-s border-b border-token-border-medium rounded-s-xl';
  if (!isNew) {
    const runFromHereButton = document.createElement('button');
    runFromHereButton.style = 'height: 33.33%;';
    runFromHereButton.classList = 'w-full flex items-center justify-center bg-token-main-surface-secondary text-token-text-primary border-b border-token-border-medium rounded-ts-xl';
    runFromHereButton.innerHTML = '<svg id="run-from-here-icon" stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
    runFromHereButton.title = 'Save and run from this step';
    promptInputActionWrapper.appendChild(runFromHereButton);
    runFromHereButton.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMenus();
      // save first
      document.querySelector('#prompt-editor-submit-button')?.click();
      document.querySelector('#modal-close-button-manager')?.click();
      const curPromptChain = {
        id: document.querySelector('#prompt-editor-modal-content').dataset.id,
        title: document.querySelector('#prompt-editor-name-input').value,
        steps: Array.from(document.querySelectorAll('[id^="prompt-editor-input-"]')).map((step) => step.value).filter((step) => step),
        steps_delay: parseInt(document.querySelector('#prompt-editor-delay-input').value, 10),
        is_public: document.querySelector('#public-prompt-checkbox').checked,
        is_favorite: document.querySelector('#favorite-prompt-checkbox').checked,
      };
      runPromptChain(curPromptChain, stepIndex, false);
    });
  }
  const deletePromptButton = document.createElement('button');
  deletePromptButton.style = `height: ${isNew ? '50%' : '33.33%'};`;
  deletePromptButton.classList = `w-full flex items-center justify-center bg-token-main-surface-secondary text-token-text-primary border-b border-token-border-medium ${isNew ? 'rounded-ts-xl' : ''}`;

  deletePromptButton.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
  deletePromptButton.title = 'Delete';
  deletePromptButton.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenus();
    if (deletePromptButton.title === 'Confirm delete') {
      promptRow.remove();
    } else {
      deletePromptButton.title = 'Confirm delete';
      deletePromptButton.style.backgroundColor = '#864e6140';
      deletePromptButton.style.color = '#ff4a4a';
      deletePromptButton.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      setTimeout(() => {
        deletePromptButton.title = 'Delete';
        deletePromptButton.style.backgroundColor = '#2d2d3a';
        deletePromptButton.style.color = '#eee';
        deletePromptButton.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
      }, 3000);
    }
  });
  promptInputActionWrapper.appendChild(deletePromptButton);
  const dragPromptButton = document.createElement('div');
  dragPromptButton.style = `height: ${isNew ? '50%' : '33.33%'};cursor:grab;`;
  dragPromptButton.classList = 'w-full flex items-center justify-center bg-token-main-surface-secondary text-token-text-primary rounded-bs-xl';

  dragPromptButton.title = 'Drag to reorder';
  dragPromptButton.id = 'prompt-editor-drag-handle';
  dragPromptButton.innerHTML = '<svg stroke="currentColor" fill="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="2em" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M32 288c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 288zm0-128c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 160z"/></svg>';
  promptInputActionWrapper.appendChild(dragPromptButton);
  promptRow.appendChild(promptInputActionWrapper);

  const promptInput = document.createElement('textarea');
  promptInput.placeholder = 'Enter prompt text. Tip: Use {{variable name}} to ask user for input. To ask user to upload file insert {{files}} in your prompt (GPT-4 only)';
  promptInput.id = `prompt-editor-input-${stepIndex}`;
  promptInput.style = 'resize: none;top:0;left:0;';
  promptInput.classList = 'w-full h-full bg-token-main-surface-secondary text-token-text-primary border border-token-border-medium rounded-e-xl px-2 py-1 text-sm placeholder:text-gray-500';
  promptInput.dir = 'auto';
  promptInput.value = stepText;
  promptRow.appendChild(promptInput);

  const promptChainStepExpand = document.createElement('div');
  promptChainStepExpand.id = 'prompt-chain-step-expand';
  promptChainStepExpand.title = 'Expand';
  promptChainStepExpand.dataset.expanded = 'false';
  promptChainStepExpand.classList = 'absolute cursor-pointer text-token-text-primary p-1 rounded-full bg-token-main-surface-primary opacity-60 hover:opacity-100';
  promptChainStepExpand.style = 'top:6px;right:6px;';
  promptChainStepExpand.innerHTML = '<svg data-expandtype="expand" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="icon-sm" viewBox="0 0 512 512"><path d="M183 295l-81.38 81.38l-47.03-47.03c-6.127-6.117-14.29-9.367-22.63-9.367c-4.117 0-8.279 .8086-12.25 2.43c-11.97 4.953-19.75 16.63-19.75 29.56v135.1C.0013 501.3 10.75 512 24 512h136c12.94 0 24.63-7.797 29.56-19.75c4.969-11.97 2.219-25.72-6.938-34.87l-47.03-47.03l81.38-81.38c9.375-9.375 9.375-24.56 0-33.94S192.4 285.7 183 295zM487.1 0h-136c-12.94 0-24.63 7.797-29.56 19.75c-4.969 11.97-2.219 25.72 6.938 34.87l47.04 47.03l-81.38 81.38c-9.375 9.375-9.375 24.56 0 33.94s24.56 9.375 33.94 0l81.38-81.38l47.03 47.03c6.127 6.117 14.3 9.35 22.63 9.35c4.117 0 8.275-.7918 12.24-2.413C504.2 184.6 512 172.9 512 159.1V23.1C512 10.75 501.3 0 487.1 0z"></path></svg>';
  promptChainStepExpand.addEventListener('click', () => {
    promptChainStepExpand.dataset.expanded = promptChainStepExpand.dataset.expanded === 'true' ? 'false' : 'true';
    const promptEditorInput = promptRow.querySelector('textarea');
    if (promptChainStepExpand.dataset.expanded === 'false') {
      promptChainStepExpand.innerHTML = '<svg data-expandtype="expand" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="icon-sm" viewBox="0 0 512 512"><path d="M183 295l-81.38 81.38l-47.03-47.03c-6.127-6.117-14.29-9.367-22.63-9.367c-4.117 0-8.279 .8086-12.25 2.43c-11.97 4.953-19.75 16.63-19.75 29.56v135.1C.0013 501.3 10.75 512 24 512h136c12.94 0 24.63-7.797 29.56-19.75c4.969-11.97 2.219-25.72-6.938-34.87l-47.03-47.03l81.38-81.38c9.375-9.375 9.375-24.56 0-33.94S192.4 285.7 183 295zM487.1 0h-136c-12.94 0-24.63 7.797-29.56 19.75c-4.969 11.97-2.219 25.72 6.938 34.87l47.04 47.03l-81.38 81.38c-9.375 9.375-9.375 24.56 0 33.94s24.56 9.375 33.94 0l81.38-81.38l47.03 47.03c6.127 6.117 14.3 9.35 22.63 9.35c4.117 0 8.275-.7918 12.24-2.413C504.2 184.6 512 172.9 512 159.1V23.1C512 10.75 501.3 0 487.1 0z"></path></svg>';
      promptEditorInput.parentElement.style.position = 'relative';
      promptEditorInput.parentElement.style.zIndex = '999';
      promptEditorInput.style.position = 'unset';
      promptEditorInput.style.padding = '4px 8px';
      const curNextButton = promptRow.querySelector('#prompt-chain-step-next-button');
      if (curNextButton) curNextButton.classList.add('hidden');
      const curPreviousButton = promptRow.querySelector('#prompt-chain-step-previous-button');
      if (curPreviousButton) curPreviousButton.classList.add('hidden');
    } else {
      promptChainStepExpand.innerHTML = '<svg data-expandtype="collapse" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="icon-sm" viewBox="0 0 512 512"><path d="M215.1 272h-136c-12.94 0-24.63 7.797-29.56 19.75C45.47 303.7 48.22 317.5 57.37 326.6l30.06 30.06l-78.06 78.07c-12.5 12.5-12.5 32.75-.0012 45.25l22.62 22.62c12.5 12.5 32.76 12.5 45.26 .0013l78.06-78.07l30.06 30.06c6.125 6.125 14.31 9.367 22.63 9.367c4.125 0 8.279-.7891 12.25-2.43c11.97-4.953 19.75-16.62 19.75-29.56V296C239.1 282.7 229.3 272 215.1 272zM296 240h136c12.94 0 24.63-7.797 29.56-19.75c4.969-11.97 2.219-25.72-6.938-34.87l-30.06-30.06l78.06-78.07c12.5-12.5 12.5-32.76 .0002-45.26l-22.62-22.62c-12.5-12.5-32.76-12.5-45.26-.0003l-78.06 78.07l-30.06-30.06c-9.156-9.141-22.87-11.84-34.87-6.937c-11.97 4.953-19.75 16.62-19.75 29.56v135.1C272 229.3 282.7 240 296 240z"/></svg>';
      promptEditorInput.parentElement.style.position = 'unset';
      promptEditorInput.parentElement.style.zIndex = '1001';
      promptEditorInput.style.position = 'absolute';
      promptEditorInput.style.padding = '20px';
      promptEditorInput.focus();
      const curNextButton = promptRow.querySelector('#prompt-chain-step-next-button');
      if (curNextButton) curNextButton.classList.remove('hidden');
      const curPreviousButton = promptRow.querySelector('#prompt-chain-step-previous-button');
      if (curPreviousButton) curPreviousButton.classList.remove('hidden');
    }
  });
  promptRow.appendChild(promptChainStepExpand);

  const promptChainStepCount = document.createElement('div');
  promptChainStepCount.id = 'prompt-chain-step-count';
  promptChainStepCount.style = 'bottom:4px;right:10px;';
  promptChainStepCount.classList = 'text-token-text-tertiary absolute text-xs';
  promptChainStepCount.innerHTML = `${stepIndex + 1} / ${Math.max(promptChain.steps.length, 1)}`;
  promptRow.appendChild(promptChainStepCount);

  const nextButton = document.createElement('button');
  nextButton.id = 'prompt-chain-step-next-button';
  nextButton.classList = 'absolute top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-token-main-surface-secondary text-token-text-primary focus-visible:outline-0 hover:bg-token-sidebar-surface-secondary focus-visible:bg-token-sidebar-surface-secondary border border-token-border-medium hidden';
  nextButton.style = 'right: -20px;';
  nextButton.innerHTML = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md-heavy"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.29289 18.7071C8.90237 18.3166 8.90237 17.6834 9.29289 17.2929L14.5858 12L9.29289 6.70711C8.90237 6.31658 8.90237 5.68342 9.29289 5.29289C9.68342 4.90237 10.3166 4.90237 10.7071 5.29289L16.7071 11.2929C16.8946 11.4804 17 11.7348 17 12C17 12.2652 16.8946 12.5196 16.7071 12.7071L10.7071 18.7071C10.3166 19.0976 9.68342 19.0976 9.29289 18.7071Z" fill="currentColor"></path></svg>';
  promptRow.appendChild(nextButton);
  nextButton.addEventListener('click', () => {
    // close the current step
    promptChainStepExpand.click();
    // load the next step in the expand mode
    const nextStepIndex = stepIndex + 1;
    const nextStep = document.querySelector(`#prompt-editor-input-${nextStepIndex}`);
    if (nextStep) {
      nextStep.parentElement.querySelector('#prompt-chain-step-expand').click();
    }
  });

  const previousButton = document.createElement('button');
  previousButton.id = 'prompt-chain-step-previous-button';
  previousButton.classList = 'absolute top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-token-main-surface-secondary text-token-text-primary focus-visible:outline-0 hover:bg-token-sidebar-surface-secondary focus-visible:bg-token-sidebar-surface-secondary border border-token-border-medium hidden';
  previousButton.style = 'left: -20px;';
  previousButton.innerHTML = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md-heavy"><path fill-rule="evenodd" clip-rule="evenodd" d="M14.7071 5.29289C15.0976 5.68342 15.0976 6.31658 14.7071 6.70711L9.41421 12L14.7071 17.2929C15.0976 17.6834 15.0976 18.3166 14.7071 18.7071C14.3166 19.0976 13.6834 19.0976 13.2929 18.7071L7.29289 12.7071C7.10536 12.5196 7 12.2652 7 12C7 11.7348 7.10536 11.4804 7.29289 11.2929L13.2929 5.29289C13.6834 4.90237 14.3166 4.90237 14.7071 5.29289Z" fill="currentColor"></path></svg>';
  promptRow.appendChild(previousButton);
  previousButton.addEventListener('click', () => {
    // close the current step
    promptChainStepExpand.click();
    // load the previous step in the expand mode
    const previousStepIndex = stepIndex - 1;
    const previousStep = document.querySelector(`#prompt-editor-input-${previousStepIndex}`);
    if (previousStep) {
      previousStep.parentElement.querySelector('#prompt-chain-step-expand').click();
    }
  });

  return promptRow;
}
function createTagSelector(initialSelectedTags = [], alwaysShow = false) {
  const tagSelectorSection = document.createElement('div');
  tagSelectorSection.id = 'tag-selector-section';
  tagSelectorSection.classList = `flex flex-col w-full items-start justify-start ${alwaysShow ? '' : 'hidden'}`;
  const title = document.createElement('div');
  title.classList = 'text-token-text-tertiary text-sm my-2';
  title.id = 'tag-selector-title';
  title.textContent = translate('Select up to 3');
  tagSelectorSection.appendChild(title);

  const tagContainer = document.createElement('div');
  chrome.runtime.sendMessage({
    type: 'getPromptTags',
  }, (tagList) => {
    // sort tags by name
    tagList.sort((a, b) => a.name.localeCompare(b.name));
    for (let i = 0; i < tagList.length; i += 1) {
      const tagIsSelected = initialSelectedTags.map((t) => t.id.toString()).includes(tagList[i].id.toString());
      tagContainer.classList = 'flex flex-wrap w-full items-center justify-start mt-2';
      tagContainer.id = 'tag-selector-container';
      const tagBox = document.createElement('div');
      tagBox.id = `tag-${tagList[i].id.toString().replace(/ /g, '-')}`;
      tagBox.classList = `text-xs ${tagIsSelected ? `${isDarkMode() ? 'text-black bg-white' : 'text-white bg-black'}` : 'text-token-text-tertiary bg-transparent hover:bg-token-main-surface-secondary'} border border-token-border-medium rounded-md px-2 py-1 cursor-pointer me-2 mb-2 capitalize`;
      tagBox.dataset.selected = tagIsSelected;

      tagBox.textContent = tagList[i].name;
      tagBox.title = tagList[i].name;
      // eslint-disable-next-line no-loop-func
      tagBox.addEventListener('click', () => {
        title.classList.replace('text-red-500', 'text-token-text-tertiary');
        const curSelectedTags = document.querySelectorAll('#tag-selector-container > div[data-selected="true"]');
        if (curSelectedTags.length >= 3 && tagBox.dataset.selected === 'false') {
          toast('You can only select up to 3 tags');
          return;
        }
        if (tagBox.dataset.selected === 'false') {
          tagBox.classList.replace('text-token-text-tertiary', `${isDarkMode() ? 'text-black' : 'text-white'}`);
          tagBox.classList.replace('bg-transparent', `${isDarkMode() ? 'bg-white' : 'bg-black'}`);
          tagBox.classList.remove('hover:bg-token-main-surface-secondary');
          tagBox.dataset.selected = true;
        } else {
          tagBox.classList.replace(`${isDarkMode() ? 'text-black' : 'text-white'}`, 'text-token-text-tertiary');
          tagBox.classList.replace(`${isDarkMode() ? 'bg-white' : 'bg-black'}`, 'bg-transparent');
          tagBox.classList.add('hover:bg-token-main-surface-secondary');
          tagBox.dataset.selected = false;
        }
        // update number in button
        document.querySelector('#prompt-editor-modal #tag-selector-button-count').textContent = `(${document.querySelectorAll('#tag-selector-container > div[data-selected="true"]').length})`;
      });
      tagContainer.appendChild(tagBox);
    }
  });
  tagSelectorSection.appendChild(tagContainer);
  return tagSelectorSection;
}
// eslint-disable-next-line no-unused-vars
function resetPromptChain() {
  const runningPromptChainStepCount = document.querySelector('#running-prompt-chain-step-count');
  if (runningPromptChainStepCount) {
    runningPromptChainStepCount.remove();
    if (runningPromptChain || runningPromptChainStepIndex > 0) {
      setTimeout(() => {
        document.title = getConversationName();
      }, 500);
    }
  }
  runningPromptChain = undefined;
  runningPromptChainStepIndex = 0;
  templateWordsMap = {};
}
async function canRunPrompts(promptChain) {
  const hasSubscription = await chrome.runtime.sendMessage({
    type: 'checkHasSubscription',
  });
  if (!hasSubscription) {
    if (promptChain?.steps?.length > 2) {
      const error = { type: 'limit', title: 'You have reached the limit', message: 'Running prompts with more than 2 steps requires a Pro account. Upgrade to Pro to remove all limits.' };
      errorUpgradeConfirmation(error);
      return false;
    }
    const promptsCount = await chrome.runtime.sendMessage({
      type: 'getPromptsCount',
      forceRefresh: true,
    });
    if (promptsCount.count > 5) {
      const error = { type: 'limit', title: 'You have reached the limit', message: 'You have more than 5 prompts in your account. Remove some prompts or upgrade to Pro to remove all limits.' };
      errorUpgradeConfirmation(error);
      return false;
    }
  }
  return true;
}
async function runPromptChain(promptChain, initialStep = 0, newChat = true) {
  // insertPromptIntoTextArea(promptChain, initialStep);
  if (promptChain?.mode !== 'splitter') {
    const canRun = await canRunPrompts(promptChain);
    if (!canRun) return;
  }
  initiateRunPrompChain(promptChain, initialStep, newChat);
}
async function initiateRunPrompChain(promptChain, initialStep, newChat = true) {
  if (newChat) {
    startNewChat();
    // wait for new chat to open
    setTimeout(() => {
      // clear the input
      const textAreaElement = document.querySelector('#prompt-textarea');
      if (!textAreaElement) return;
      textAreaElement.innerHTML = '<p></p>';
      runPromptChain(promptChain, initialStep, false);
    }, 1000);
    return;
  }
  const inputForm = document.querySelector('main form');
  if (!inputForm) return;
  const textAreaElement = document.querySelector('#prompt-textarea');
  if (!textAreaElement) return;

  insertPromptIntoTextArea(promptChain, initialStep);

  runningPromptChain = promptChain;
  runningPromptChainStepIndex = initialStep;
  // add prompt chain step counter
  const existingRunningPromptChainStepCount = document.querySelector('#running-prompt-chain-step-count');
  if (existingRunningPromptChainStepCount) existingRunningPromptChainStepCount.remove();
  if (runningPromptChain.steps.length > 1) {
    const runningPromptChainStepCount = createPromptChainStepCounter();
    document.title = `${runningPromptChainStepIndex + 1} / ${runningPromptChain.steps.length}`;
    inputForm.appendChild(runningPromptChainStepCount);
  }

  if (promptChain.is_public && initialStep === 0) {
    chrome.runtime.sendMessage({
      type: 'incrementPromptUseCount',
      forceRefresh: true,
      detail: {
        promptId: promptChain.id,
      },
    });
  }
  await promptTemplateHandler(promptChain.steps[initialStep]);
  textAreaElement.innerHTML = convertToParagraphs(textAreaElement);
  setTimeout(() => {
    const submitButtonElement = document.querySelector('[data-testid*="send-button"]');
    submitButtonElement?.click();
    updateInputCounter();
  }, 300);
}
// eslint-disable-next-line no-unused-vars
function addPromptChainCounterElement() {
  // used when starting a new chat and going from input middle page to input bottom
  const inputForm = document.querySelector('main form');
  if (!inputForm) return;
  let runningPromptChainStepCount = document.querySelector('#running-prompt-chain-step-count');
  if (!runningPromptChainStepCount) {
    runningPromptChainStepCount = createPromptChainStepCounter();
    inputForm.appendChild(runningPromptChainStepCount);
  }
}
function createPromptChainStepCounter() {
  const splitterMode = runningPromptChain?.mode === 'splitter';
  const runningPromptChainStepCount = document.createElement('div');
  runningPromptChainStepCount.id = 'running-prompt-chain-step-count';
  runningPromptChainStepCount.classList = 'cursor-pointer text-xs absolute text-token-text-tertiary flex items-center justify-center z-10';
  const conversationIdFromUrl = getConversationIdFromUrl();

  runningPromptChainStepCount.style = 'top:-20px;right:16px;';
  if (runningPromptChain && runningPromptChain.steps.length > 1) {
    runningPromptChainStepCount.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" stroke="currentColor"  class='icon-xs me-1' viewBox="0 0 512 512"><path d="M328 160h-144C170.8 160 160 170.8 160 184v144C160 341.2 170.8 352 184 352h144c13.2 0 24-10.8 24-24v-144C352 170.8 341.2 160 328 160zM256 0C114.6 0 0 114.6 0 256s114.6 256 256 256s256-114.6 256-256S397.4 0 256 0zM256 464c-114.7 0-208-93.31-208-208S141.3 48 256 48s208 93.31 208 208S370.7 464 256 464z"/></svg> Running ${splitterMode ? 'splitter' : 'prompt chain'}: ${runningPromptChainStepIndex + 1} / ${runningPromptChain?.steps?.length || '1'} <span class='animate-flicker inline-block ms-1 inli w-2 h-2 rounded-full bg-gold'></span>`;
  }
  runningPromptChainStepCount.title = `Click to stop the running ${splitterMode ? 'splitter' : 'prompt chain'}`;

  runningPromptChainStepCount.addEventListener('click', () => {
    stopAnimateFavicon(faviconTimeout);
    resetPromptChain();
    const conversationTitle = getConversationName();
    addConversationToSidebarAndSync(conversationTitle, conversationIdFromUrl);
  });
  return runningPromptChainStepCount;
}
// eslint-disable-next-line no-unused-vars
async function insertNextChain(promptChain, promptChainStepIndex) {
  if (!promptChain) return;
  if (!promptChainStepIndex) return;
  const splitterMode = promptChain?.mode === 'splitter';
  const { steps: promptChainSteps } = promptChain;
  runningPromptChain = promptChain;
  runningPromptChainStepIndex = promptChainStepIndex;
  const inputForm = document.querySelector('main form');
  if (!inputForm) return;
  const textAreaElement = document.querySelector('#prompt-textarea');
  if (!textAreaElement) return;
  // if multiple response, select the first one: no need. if you submit, it will automatically select the last response
  // const paragenButton = document.querySelector('[data-testid="paragen-prefer-response-button"]');
  // if (paragenButton) {
  //   paragenButton.click();
  //   // wait for 2 seconds for the response to be selected
  //   // eslint-disable-next-line no-promise-executor-return
  //   await new Promise((resolve) => setTimeout(resolve, 2000));
  // }
  textAreaElement.innerText = promptChainSteps[promptChainStepIndex];
  // update prompt chain step counter
  let runningPromptChainStepCount = document.querySelector('#running-prompt-chain-step-count');
  if (!runningPromptChainStepCount) {
    runningPromptChainStepCount = createPromptChainStepCounter();
    inputForm.appendChild(runningPromptChainStepCount);
  }
  runningPromptChainStepCount.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" stroke="currentColor"  class='icon-xs me-1' viewBox="0 0 512 512"><path d="M328 160h-144C170.8 160 160 170.8 160 184v144C160 341.2 170.8 352 184 352h144c13.2 0 24-10.8 24-24v-144C352 170.8 341.2 160 328 160zM256 0C114.6 0 0 114.6 0 256s114.6 256 256 256s256-114.6 256-256S397.4 0 256 0zM256 464c-114.7 0-208-93.31-208-208S141.3 48 256 48s208 93.31 208 208S370.7 464 256 464z"/></svg> Running ${splitterMode ? 'splitter' : 'prompt chain'}: ${promptChainStepIndex + 1} / ${promptChainSteps.length} <span class='animate-flicker inline-block ms-1 inli w-2 h-2 rounded-full bg-gold'></span>`;
  document.title = `${promptChainStepIndex + 1} / ${promptChainSteps.length}`;
  await promptTemplateHandler(promptChainSteps[promptChainStepIndex]);
  textAreaElement.innerHTML = convertToParagraphs(textAreaElement);
  setTimeout(() => {
    const submitButtonElement = document.querySelector('[data-testid*="send-button"]');
    submitButtonElement?.click();
    updateInputCounter();
  }, 300);
}

async function promptTemplateHandler(prompt) {
  if (!cachedSettings.promptTemplate) {
    if (!window.localStorage.getItem('seenPromptTemplateToast')) {
      toast('Did you mean to use {{prompt templates}}? If yes, first turn it on in the Settings menu', 'success', 6000);
      window.localStorage.setItem('seenPromptTemplateToast', 'true');
    }
    return;
  }
  // all template words except {{files}}
  const templateWords = prompt.match(/{{(?!files).*?}}/g);
  if (templateWords?.length > 0) {
    // remove {{ and }} from the word
    templateWords.forEach((word, index) => {
      templateWords[index] = word.replace(/{{|}}/g, '');
    });
    // if templateWordsMap keys includes all the template words, replace {{word}} with the value from the map and return the prompt
    const allTemplateWords = Object.keys(templateWordsMap);
    const allTemplateWordsIncluded = templateWords.every((word) => allTemplateWords.includes(word));
    if (allTemplateWordsIncluded) {
      templateWords.forEach((word) => {
        prompt = prompt.replace(`{{${word}}}`, templateWordsMap[word]);
      });
      const textAreaElement = document.querySelector('#prompt-textarea');
      textAreaElement.innerText = prompt;
    } else { // if not all template words are included, show the modal to ask for the missing words
      prompt = await createTemplateWordsModal(templateWords);
    }
  }
  const fileTemplate = prompt.includes('{{files}}');
  if (fileTemplate) {
    const uploadFileButton = document.querySelector('main form svg path[d="M12 3C12.5523 3 13 3.44772 13 4L13 11H20C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13L13 13L13 20C13 20.5523 12.5523 21 12 21C11.4477 21 11 20.5523 11 20L11 13L4 13C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11L11 11L11 4C11 3.44772 11.4477 3 12 3Z"]')?.parentElement?.parentElement;
    if (uploadFileButton) {
      const fileInput = document.querySelector('main form input[type="file"]');
      // wait for user to upload file
      if (fileInput) {
        // Add event listener to file input before triggering the click
        // Return a Promise to wait for the user to upload the file
        // eslint-disable-next-line consistent-return
        return new Promise((resolve) => {
          const fileChangeHandler = () => {
            // Remove all {{files}} from the prompt
            const newPrompt = prompt.replace(/{{files}}/g, '');
            const textAreaElement = document.querySelector('#prompt-textarea');
            if (textAreaElement) {
              textAreaElement.innerText = newPrompt; // Use value instead of innerText for textareas
            }
            const submitButton = document.querySelector('[data-testid*="send-button"]');
            // keep checking for the submit button every 200ms and resolve once it is not disabled
            const interval = setInterval(() => {
              if (!submitButton?.disabled) {
                clearInterval(interval);
                // Resolve the promise once the file is selected and the prompt updated and the submit button is enabled
                resolve();
              }
            }, 200);
          };

          // Make sure the event listener is attached before clicking the upload button
          fileInput.addEventListener('change', fileChangeHandler, { once: true });

          // Use a small delay to ensure the input is clicked before awaiting
          setTimeout(() => {
            fileInput.click(); // This opens the file dialog
          }, 100);
        });
      }
      console.error('File input element not found');
    }
    console.error('Upload file button not found');
  }
}
