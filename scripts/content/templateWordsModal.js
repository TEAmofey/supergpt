/* global createModal, highlightBracket, templateWordsMap */
// eslint-disable-next-line no-unused-vars
async function createTemplateWordsModal(templateWords) {
  return new Promise((resolve, _reject) => {
    const existingModal = document.querySelector('#modal-template-words');
    if (existingModal) {
      existingModal.remove();
    }
    const uniqueTemplateWords = [...new Set(templateWords)];
    const bodyContent = templateWordsModalContent(uniqueTemplateWords);
    const actionsBarContent = templateWordsModalActions(templateWords, resolve);
    createModal('Template words', 'Please replace the template words', bodyContent, actionsBarContent, true);
    setTimeout(() => {
      // focus on the first empty template word input
      // if there is no empty input, focus on the first input
      const templateWordInputs = document.querySelectorAll('[id^=template-input-]');
      const emptyTemplateWordInputs = Array.from(templateWordInputs).filter((input) => input.value === '');
      const firstEmptyInput = emptyTemplateWordInputs[0];
      const firstInput = templateWordInputs[0];
      if (firstEmptyInput) {
        firstEmptyInput.focus();
      } else if (firstInput) {
        firstInput.focus();
      }
    }, 100);
  });
}

function templateWordsModalContent(templateWords) {
  // create releaseNote modal content
  const content = document.createElement('div');
  content.id = 'modal-content-template-words';
  content.style = 'position:relative;padding:16px;overflow-y:auto;';
  const textAreaElement = document.querySelector('#prompt-textarea');

  const promptPreviewTitle = document.createElement('div');
  promptPreviewTitle.classList = 'text-token-text-primary w-full text-md capitalize mb-2';
  promptPreviewTitle.innerHTML = 'Prompt preview';
  content.appendChild(promptPreviewTitle);

  const promptPreview = document.createElement('div');
  promptPreview.classList = 'w-full text-token-text-tertiary text-sm bg-token-sidebar-surface-secondary rounded-md border border-token-border-medium p-4 mb-8 italic';
  promptPreview.innerHTML = highlightBracket(textAreaElement.innerText);

  content.appendChild(promptPreview);

  templateWords.forEach((templateWord, index) => {
    const templateWordDiv = document.createElement('div');
    templateWordDiv.id = `template-word-row-${index}`;
    templateWordDiv.style = 'display: flex; flex-wrap:wrap;justify-content: space-between; align-items: center;width: 100%; margin-bottom: 12px;';
    const templateWordLabel = document.createElement('label');
    templateWordLabel.classList = 'text-token-text-primary w-full text-sm capitalize mb-2';

    templateWordLabel.innerHTML = templateWord;
    const templateWordInput = document.createElement('textarea');
    // templateWordInput.style = 'height: 100px;';
    templateWordInput.classList = 'w-full h-24 text-token-text-primary text-sm bg-token-main-surface-secondary rounded-md border border-token-border-medium px-2 py-1';
    templateWordInput.id = `template-input-${templateWord}`;
    templateWordInput.placeholder = `Enter ${templateWord}`;
    templateWordInput.value = templateWordsMap[templateWord] || '';
    templateWordDiv.appendChild(templateWordLabel);
    templateWordDiv.appendChild(templateWordInput);
    content.appendChild(templateWordDiv);
  });

  return content;
}

function templateWordsModalActions(templateWords, resolve) {
  // add actionbar at the bottom of the content
  const actionBar = document.createElement('div');
  actionBar.classList = 'flex items-center justify-end flex-wrap w-full mt-2';
  const submitButton = document.createElement('button');
  submitButton.classList = 'btn btn-primary';
  submitButton.innerHTML = 'Continue';
  submitButton.id = 'modal-submit-button';

  submitButton.addEventListener('click', () => {
    const textAreaElement = document.querySelector('#prompt-textarea');
    // replace template words in text area value with the input values associated with them
    let newValue = textAreaElement.innerText;
    const result = {}; // Create an object to store the replaced values

    templateWords.forEach((templateWord) => {
      // using getElementById instead of querySelector to solve the issue of special characters in templateWord like /, [, ], etc.
      const templateWordInput = document.getElementById(`template-input-${templateWord}`);
      const templateWordInputValue = templateWordInput.value;
      newValue = newValue.replace(`{{${templateWord}}}`, templateWordInputValue);
      result[templateWord] = templateWordInputValue; // Store replaced values
      // set the templateWordsMap value to the input value
      templateWordsMap[templateWord] = templateWordInputValue;
    });
    textAreaElement.innerText = newValue;
    const closeButton = document.querySelector('#modal-close-button-template-words');
    if (closeButton) {
      closeButton.click();
    }

    // Resolve the promise with the newValue
    resolve(newValue);

    // if (!e.shiftKey) {
    //   const chatSubmitButton = document.querySelector('[data-testid*="send-button"]');
    //   chatSubmitButton.click();
    // }
  });
  actionBar.appendChild(submitButton);
  return actionBar;
}
