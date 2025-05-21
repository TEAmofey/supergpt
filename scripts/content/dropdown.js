/* global translate, cachedSettings */
/* eslint-disable no-unused-vars */
function dropdown(title, options, selectedOption, code = 'code', side = 'right') {
  // eslint-disable-next-line prefer-destructuring
  if (!selectedOption) selectedOption = options[0];
  if (!selectedOption) return '';
  const menuTitle = title.replaceAll('-', ' ').split(' ').pop();
  return `<button id="${title.toLowerCase()}-selector-button" class="relative w-full cursor-pointer rounded-md border bg-token-main-surface-primary border-token-border-medium ps-3 pe-6 text-start focus:border-green-600 focus:outline-none  text-sm" type="button">
  <label class="relative text-xs text-token-text-tertiary" style="top:-2px;">${translate(menuTitle)}</label>
  <span class="inline-flex w-full truncate text-token-text-primary">
    <span class="flex h-5 items-center gap-1 truncate relative" style="top:-2px;"><span id="selected-${title.toLowerCase()}-title" data-option="${selectedOption[code]}">${translate(selectedOption.name)}</span>
    </span>
  </span>
  <span class="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-2">
    <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4  text-gray-400" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  </span>
</button>
<ul id="${title.toLowerCase()}-list-dropdown" style="max-height:400px;overflow-y:auto;width:250px;" class="hidden transition-all absolute z-10 ${side === 'right' ? 'end-0' : 'start-0'} mt-1 overflow-auto rounded-md py-1 text-base border border-token-border-medium focus:outline-none bg-token-main-surface-primary dark:ring-white/20 dark:last:border-b text-sm -translate-x-1/4" role="menu" aria-orientation="vertical" aria-labelledby="${title.toLowerCase()}-selector-button" tabindex="-1">
  ${options.map((option) => `<li title="${option.description || ''}" class="text-token-text-primary relative cursor-pointer select-none border-b py-1 ps-3 pe-9 last:border-b-0 border-token-border-medium hover:bg-token-main-surface-secondary" id="${title.toLowerCase()}-selector-option-${option[code]}" role="option" tabindex="-1">
    <div class="flex flex-col">
      <span class="flex h-6 items-center gap-1 truncate text-token-text-primary">${translate(option.name)}</span>
    </div>
    ${option[code] === selectedOption[code] ? `<span id="${title.toLowerCase()}-selector-checkmark" class="absolute inset-y-0 end-0 flex items-center pe-4 text-token-text-primary">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md"><path fill="currentColor" fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m14.076-4.068a1 1 0 0 1 .242 1.393l-4.75 6.75a1 1 0 0 1-1.558.098l-2.5-2.75a1 1 0 0 1 1.48-1.346l1.66 1.827 4.032-5.73a1 1 0 0 1 1.394-.242" clip-rule="evenodd"></path></svg>
    </span>` : ''}
  </li>`).join('')}
  </ul>`;
}

function addDropdownEventListener(title, options, code = 'code', callback = null) {
  const optionSelectorButton = document.querySelector(`#${title.toLowerCase()}-selector-button`);
  optionSelectorButton?.addEventListener('click', () => {
    const optionListDropdown = document.querySelector(`#${title.toLowerCase()}-list-dropdown`);
    const cl = optionListDropdown.classList;
    if (cl.contains('block')) {
      optionListDropdown.classList.replace('block', 'hidden');
    } else {
      optionListDropdown.classList.replace('hidden', 'block');
    }
  });
  // close optionListDropdown when clicked outside
  document.body.addEventListener('click', (e) => {
    const optionListDropdown = document.querySelector(`#${title.toLowerCase()}-list-dropdown`);
    const cl = optionListDropdown?.classList;
    if (cl?.contains('block') && !e.target.closest(`#${title.toLowerCase()}-selector-button`)) {
      optionListDropdown.classList.replace('block', 'hidden');
    }
  });
  const optionSelectorOptions = document.querySelectorAll(`[id^=${title.toLowerCase()}-selector-option-]`);
  optionSelectorOptions.forEach((option) => {
    option.addEventListener('click', () => {
      const optionListDropdown = document.querySelector(`#${title.toLowerCase()}-list-dropdown`);
      optionListDropdown.classList.replace('block', 'hidden');
      const optionSelectorCheckmark = document.querySelector(`#${title.toLowerCase()}-selector-checkmark`);
      if (optionSelectorCheckmark) {
        optionSelectorCheckmark.remove();
        option.appendChild(optionSelectorCheckmark);
      } else {
        option.insertAdjacentHTML('beforeend', `<span id="${title.toLowerCase()}-selector-checkmark" class="absolute inset-y-0 end-0 flex items-center pe-4 text-token-text-primary">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md"><path fill="currentColor" fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m14.076-4.068a1 1 0 0 1 .242 1.393l-4.75 6.75a1 1 0 0 1-1.558.098l-2.5-2.75a1 1 0 0 1 1.48-1.346l1.66 1.827 4.032-5.73a1 1 0 0 1 1.394-.242" clip-rule="evenodd"></path></svg>
    </span>`);
      }
      const optionCode = option.id.split(`${title.toLowerCase()}-selector-option-`)[1];
      const selectedOption = options.find((l) => l[code].toString() === optionCode.toString());
      const selectedOptionTitle = document.querySelector(`#selected-${title.toLowerCase()}-title`);
      selectedOptionTitle.textContent = translate(selectedOption.name);
      selectedOptionTitle.setAttribute('data-option', selectedOption[code]);
      chrome.storage.local.set({ settings: { ...cachedSettings, [`selected${title.replaceAll('-', '')}`]: selectedOption } }, () => {
        if (callback) callback(selectedOption);
      });
    });
  });
}
