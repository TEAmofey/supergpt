/* global createTooltip, showConfirmDialog, setUserSystemMessage, errorUpgradeConfirmation, addOrReplaceProfileCard, translate, initializeCustomInstructionProfileSelector, isDescendant, getUserSystemMessageTraitPills */
let currentModelTraits = 'modelTraitsOne';
// eslint-disable-next-line no-unused-vars
async function createCustomInstructionProfileEditor(profile = {
  name: '', name_user_message: '', role_user_message: '', other_user_message: '', traits_model_message: '', disabled_tools: [], enabled: true,
}) {
  const {
    name, name_user_message: nameUserMessage, role_user_message: roleUserMessage, other_user_message: otherUserMessage, traits_model_message: traitsModelMessage, disabled_tools: disabledTools, enabled,
  } = profile;
  currentModelTraits = 'modelTraitsOne';
  const canSave = name.length > 0 && nameUserMessage?.length < 1500 && roleUserMessage?.length < 1500 && otherUserMessage?.length < 1500 && traitsModelMessage?.length < 1500;
  const allModelTraits = await getUserSystemMessageTraitPills();
  // first half of traits
  const modelTraitsOne = allModelTraits.slice(0, Math.ceil(allModelTraits.length / 2));
  // second half of traits
  const modelTraitsTwo = allModelTraits.slice(Math.ceil(allModelTraits.length / 2));
  const editor = `<div id="custom-instruction-editor-wrapper" class="absolute inset-0" style="z-index:100010">
<div data-state="open" class="fixed inset-0 z-50 bg-black/50 dark:bg-black/80" style="pointer-events: auto;">
  <div class="z-50 h-full w-full overflow-y-auto grid grid-cols-[10px_1fr_10px] grid-cols-[10px_1fr_10px] grid-rows-[minmax(10px,1fr)_auto_minmax(10px,1fr)] md:grid-rows-[minmax(20px,1fr)_auto_minmax(20px,1fr)]">
    <div role="dialog" id="custom-instruction-editor" aria-describedby="radix-:r7m:" aria-labelledby="radix-:r7l:" data-state="open" class="popover relative start-1/2 col-auto col-start-2 row-auto row-start-2 h-full w-full bg-token-main-surface-primary text-start ltr:-translate-x-1/2 rtl:translate-x-1/2 rounded-2xl shadow-xl flex flex-col overflow-hidden focus:outline-none max-w-xl" tabindex="-1" style="pointer-events: auto;">
      <div class="px-4 pb-4 pt-5 p-6 flex items-center justify-between border-b border-black/10 dark:border-white/10">
        <div class="flex">
          <div class="flex items-center">
            <div class="flex grow flex-col gap-1">
              <h2 class="text-lg font-semibold leading-6 text-token-text-primary">Customize ChatGPT</h2>
              <p class="text-sm text-token-text-tertiary">
                <span class="text-token-text-tertiary">Introduce yourself to get better, more personalized responses</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="flex-grow overflow-y-auto p-4 p-6">
        <div class="max-h-[60vh] overflow-y-auto md:max-h-[calc(100vh-300px)]">
          <p class="text-muted pb-3 pt-2 text-sm text-token-text-primary">${translate('profile_name')}</p>
            <input id="custom-instruction-editor-name-input" class="rounded p-2 mb-3 w-full resize-none rounded bg-token-main-surface-primary placeholder:text-gray-500 border border-token-border-medium focus-within:border-token-border-xheavy focus:ring-0 focus-visible:ring-0 outline-none focus-visible:outline-none" value="${name}">

          <p class="text-muted py-2 text-sm font-medium">${translate('what_should_chatgpt_call_you')}</p>
          <div class="mb-3">
            <textarea id="custom-instruction-editor-name-user-message" class="w-full resize-none bg-token-main-surface-primary rounded-lg border text-sm focus-token-border-heavy border-token-border-medium placeholder:text-gray-400 placeholder:text-gray-300" rows="1" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="radix-:r7n:" data-state="closed">${nameUserMessage || ''}</textarea>
            <div class="flex items-center justify-between px-1 text-xs tabular-nums text-token-text-tertiary"></div>
          </div>
          <p class="text-muted py-2 text-sm font-medium text-token-text-primary">${translate('what_do_you_do')}</p>
          <div class="mb-3">
            <textarea id="custom-instruction-editor-role-user-message" class="w-full resize-none bg-token-main-surface-primary rounded-lg border text-sm focus-token-border-heavy border-token-border-medium placeholder:text-gray-400 placeholder:text-gray-300" placeholder="Engineer, student, etc." rows="1" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="radix-:r7o:" data-state="closed">${roleUserMessage || ''}</textarea>
            <div class="flex items-center justify-between px-1 text-xs tabular-nums text-token-text-tertiary"></div>
          </div>
          <div class="flex items-center">
            <p class="text-muted me-2 py-2 text-sm font-medium text-token-text-primary">${translate('what_traits_should_chatgpt_have')}</p>
            <span id="custom-instruction-editor-traits-model-message-info-icon" class="relative" data-state="closed">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-token-text-tertiary">
                <path d="M13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12V16C11 16.5523 11.4477 17 12 17C12.5523 17 13 16.5523 13 16V12Z" fill="currentColor"></path>
                <path d="M12 9.5C12.6904 9.5 13.25 8.94036 13.25 8.25C13.25 7.55964 12.6904 7 12 7C11.3096 7 10.75 7.55964 10.75 8.25C10.75 8.94036 11.3096 9.5 12 9.5Z" fill="currentColor"></path>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12Z" fill="currentColor"></path>
              </svg>
            </span>
          </div>
          <div>
            <textarea id="custom-instruction-editor-traits-model-message" class="w-full resize-none bg-token-main-surface-primary rounded-lg border text-sm focus-token-border-heavy border-token-border-medium placeholder:text-gray-400" placeholder="Describe or select traits" rows="5" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="radix-:r7q:" data-state="closed">${traitsModelMessage || ''}</textarea>
            <div class="flex items-center justify-between px-1 text-xs tabular-nums text-token-text-tertiary"></div>
          </div>
          <div class="mb-4">
            <div>
              <div class="mt-2 flex flex-wrap gap-x-1 gap-y-2">
                ${modelTraitsOne.map((trait) => `                    
                <button id="custom-instruction-editor-trait-button-${trait.key}" class="btn relative btn-secondary btn-small py-2 ps-2 pe-3 text-xs font-normal text-token-text-tertiary">
                  <div class="flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                      xmlns="http://www.w3.org/2000/svg" class="me-[1px] h-4 w-4">
                      <path d="M12 6.00003C12.5523 6.00003 13 6.44775 13 7.00003L13 11L17 11C17.5523 11 18 11.4477 18 12C18 12.5523 17.5523 13 17 13L13 13L13 17C13 17.5523 12.5523 18 12 18C11.4477 18 11 17.5523 11 17L11 13L7 13C6.44771 13 6 12.5523 6 12C6 11.4477 6.44771 11 7 11L11 11L11 7.00003C11 6.44775 11.4477 6.00003 12 6.00003Z" fill="currentColor"></path>
                    </svg>${trait.label}
                  </div>
                </button>`).join('')}
                <button id="custom-instruction-editor-refresh-traits-button" class="btn relative btn-secondary btn-small text-token-text-tertiary">
                  <div class="flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                      xmlns="http://www.w3.org/2000/svg" class="-mx-1 h-4 w-4">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M4.47189 2.5C5.02418 2.5 5.47189 2.94772 5.47189 3.5V5.07196C7.17062 3.47759 9.45672 2.5 11.9719 2.5C17.2186 2.5 21.4719 6.75329 21.4719 12C21.4719 17.2467 17.2186 21.5 11.9719 21.5C7.10259 21.5 3.09017 17.8375 2.53689 13.1164C2.47261 12.5679 2.86517 12.0711 3.4137 12.0068C3.96223 11.9425 4.45901 12.3351 4.5233 12.8836C4.95988 16.6089 8.12898 19.5 11.9719 19.5C16.114 19.5 19.4719 16.1421 19.4719 12C19.4719 7.85786 16.114 4.5 11.9719 4.5C9.7515 4.5 7.75549 5.46469 6.38143 7H9C9.55228 7 10 7.44772 10 8C10 8.55228 9.55228 9 9 9H4.47189C3.93253 9 3.4929 8.57299 3.47262 8.03859C3.47172 8.01771 3.47147 7.99677 3.47189 7.9758V3.5C3.47189 2.94772 3.91961 2.5 4.47189 2.5Z" fill="currentColor"></path>
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
          <div class="flex items-center">
            <p class="text-muted me-2 py-2 text-sm font-medium text-token-text-primary">${translate('anything_else_chatgpt_should_know_about_you')}</p>
            <span id="custom-instruction-editor-other-user-message-info-icon" class="relative" data-state="closed">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-token-text-tertiary">
                <path d="M13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12V16C11 16.5523 11.4477 17 12 17C12.5523 17 13 16.5523 13 16V12Z" fill="currentColor"></path>
                <path d="M12 9.5C12.6904 9.5 13.25 8.94036 13.25 8.25C13.25 7.55964 12.6904 7 12 7C11.3096 7 10.75 7.55964 10.75 8.25C10.75 8.94036 11.3096 9.5 12 9.5Z" fill="currentColor"></path>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12Z" fill="currentColor"></path>
              </svg>
            </span>
          </div>
          <div>
            <textarea id="custom-instruction-editor-other-user-message" class="w-full resize-none bg-token-main-surface-primary rounded-lg border text-sm focus-token-border-heavy border-token-border-medium placeholder:text-gray-400" placeholder="Interests, values, or preferences to keep in mind" rows="5" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="radix-:r7s:" data-state="closed">${otherUserMessage || ''}</textarea>
            <div class="flex items-center justify-between px-1 text-xs tabular-nums text-token-text-tertiary"></div>
          </div>
          <div class="mt-3 pb-8">
            <button id="custom-instruction-editor-advanced-button" class="text-muted flex items-center justify-between py-2 text-sm font-medium text-token-text-primary">${translate('advanced')}
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                xmlns="http://www.w3.org/2000/svg" class="ms-1 h-5 w-5">
                <g>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M15.0337 7.74408C14.7082 7.41864 14.1806 7.41864 13.8552 7.74408L9.99998 11.5993L6.14479 7.74408C5.81935 7.41864 5.29171 7.41864 4.96628 7.74408C4.64084 8.06951 4.64084 8.59715 4.96628 8.92259L9.41072 13.367C9.73616 13.6925 10.2638 13.6925 10.5892 13.367L15.0337 8.92259C15.3591 8.59715 15.3591 8.06951 15.0337 7.74408Z" fill="currentColor"></path>
                </g>
              </svg>
            </button>
            <div id="custom-instruction-editor-advanced-settings" class="flex flex-col gap-2 mt-2 hidden">
              <div class="flex items-center gap-1">
                <div class="flex items-center gap-1"><div class="text-sm text-muted font-medium">${translate('gpt_4_capabilities')}</div><span id="custom-instruction-editor-capabilities-info-icon" class="relative" data-state="closed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-token-text-tertiary"><path d="M13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12V16C11 16.5523 11.4477 17 12 17C12.5523 17 13 16.5523 13 16V12Z" fill="currentColor"></path><path d="M12 9.5C12.6904 9.5 13.25 8.94036 13.25 8.25C13.25 7.55964 12.6904 7 12 7C11.3096 7 10.75 7.55964 10.75 8.25C10.75 8.94036 11.3096 9.5 12 9.5Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12Z" fill="currentColor"></path></svg></span></div>
              </div>
              <div class="mt-2 flex flex-col gap-3 md:flex-row flex-wrap">
                <span class="block flex-1" data-state="closed">
                  <button class="flex w-full items-center justify-between rounded border border-token-border-medium p-2">
                    <div class="flex items-center gap-2">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-token-text-tertiary">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM11.9851 4.00291C11.9744 4.00615 11.953 4.01416 11.921 4.03356C11.7908 4.11248 11.5742 4.32444 11.325 4.77696C11.0839 5.21453 10.8521 5.8046 10.6514 6.53263C10.3148 7.75315 10.0844 9.29169 10.019 11H13.981C13.9156 9.29169 13.6852 7.75315 13.3486 6.53263C13.1479 5.8046 12.9161 5.21453 12.675 4.77696C12.4258 4.32444 12.2092 4.11248 12.079 4.03356C12.047 4.01416 12.0256 4.00615 12.0149 4.00291C12.0067 4.00046 12.001 4.00006 11.9996 4C11.9982 4.00006 11.9933 4.00046 11.9851 4.00291ZM8.01766 11C8.08396 9.13314 8.33431 7.41167 8.72334 6.00094C8.87366 5.45584 9.04762 4.94639 9.24523 4.48694C6.48462 5.49946 4.43722 7.9901 4.06189 11H8.01766ZM4.06189 13H8.01766C8.09487 15.1737 8.42177 17.1555 8.93 18.6802C9.02641 18.9694 9.13134 19.2483 9.24522 19.5131C6.48461 18.5005 4.43722 16.0099 4.06189 13ZM10.019 13C10.0955 14.9972 10.3973 16.7574 10.8274 18.0477C11.0794 18.8038 11.3575 19.3436 11.6177 19.6737C11.7455 19.8359 11.8494 19.9225 11.9186 19.9649C11.9515 19.9852 11.9736 19.9935 11.9847 19.9969C11.9948 20 11.9999 20 11.9999 20C11.9999 20 12.0049 20.0001 12.0153 19.9969C12.0264 19.9935 12.0485 19.9852 12.0814 19.9649C12.1506 19.9225 12.2545 19.8359 12.3823 19.6737C12.6425 19.3436 12.9206 18.8038 13.1726 18.0477C13.6027 16.7574 13.9045 14.9972 13.981 13H10.019ZM15.9823 13C15.9051 15.1737 15.5782 17.1555 15.07 18.6802C14.9736 18.9694 14.8687 19.2483 14.7548 19.5131C17.5154 18.5005 19.5628 16.0099 19.9381 13H15.9823ZM19.9381 11C19.5628 7.99009 17.5154 5.49946 14.7548 4.48694C14.9524 4.94639 15.1263 5.45584 15.2767 6.00094C15.6657 7.41167 15.916 9.13314 15.9823 11H19.9381Z" fill="currentColor"></path>
                      </svg>
                      <div class="text-sm font-semibold">Browsing</div>
                    </div>
                    <div class="form-check flex items-center gap-2">
                      <input class="form-check-input float-left h-4 w-4 appearance-none rounded-sm border border-gray-300 bg-white bg-contain bg-center bg-no-repeat align-top transition duration-200 checked:border-blue-600 checked:bg-blue-600 focus:outline-none cursor-pointer" type="checkbox" id="browser" ${disabledTools.includes('browser') ? '' : 'checked=""'}>
                    </div>
                  </button>
                </span>
                <span class="block flex-1" data-state="closed">
                  <button class="flex w-full items-center justify-between rounded border border-token-border-medium p-2">
                    <div class="flex items-center gap-2">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-token-text-tertiary">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M9.83333 5C9.09695 5 8.5 5.59695 8.5 6.33333C8.5 7.06971 9.09695 7.66667 9.83333 7.66667C10.5697 7.66667 11.1667 7.06971 11.1667 6.33333C11.1667 5.59695 10.5697 5 9.83333 5ZM6.5 6.33333C6.5 4.49238 7.99238 3 9.83333 3C11.6743 3 13.1667 4.49238 13.1667 6.33333C13.1667 8.17428 11.6743 9.66667 9.83333 9.66667C7.99238 9.66667 6.5 8.17428 6.5 6.33333ZM13.3791 11.4215C14.3768 9.89157 16.625 9.91327 17.5931 11.4622L20.6855 16.41C21.9343 18.4081 20.4978 21 18.1415 21H5.78773C3.23977 21 1.85181 18.0244 3.48916 16.0722L6.21737 12.8193C7.13808 11.7215 8.79121 11.6206 9.83864 12.5982L11.3449 14.0041C11.4585 14.11 11.6401 14.0879 11.7249 13.9579L13.3791 11.4215ZM15.8971 12.5222C15.7035 12.2124 15.2538 12.208 15.0543 12.514L13.4001 15.0504C12.6367 16.221 11.002 16.4197 9.9803 15.4662L8.47401 14.0603C8.26452 13.8648 7.9339 13.885 7.74975 14.1045L5.02154 17.3574C4.47576 18.0081 4.93841 19 5.78773 19H18.1415C18.9269 19 19.4058 18.136 18.9895 17.47L15.8971 12.5222Z" fill="currentColor"></path>
                      </svg>
                      <div class="text-sm font-semibold">DALL·E</div>
                    </div>
                    <div class="form-check flex items-center gap-2">
                      <input class="form-check-input float-left h-4 w-4 appearance-none rounded-sm border border-gray-300 bg-white bg-contain bg-center bg-no-repeat align-top transition duration-200 checked:border-blue-600 checked:bg-blue-600 focus:outline-none cursor-pointer" type="checkbox" id="dalle" ${disabledTools.includes('dalle') ? '' : 'checked=""'}>
                    </div>
                  </button>
                </span>
                <span class="block flex-1" data-state="closed">
                  <button class="flex w-full items-center justify-between rounded border border-token-border-medium p-2">
                    <div class="flex items-center gap-2">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-token-text-tertiary">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M3 6C3 4.34315 4.34315 3 6 3H18C19.6569 3 21 4.34315 21 6V18C21 19.6569 19.6569 21 18 21H6C4.34315 21 3 19.6569 3 18V6ZM6 5C5.44772 5 5 5.44772 5 6V18C5 18.5523 5.44772 19 6 19H18C18.5523 19 19 18.5523 19 18V6C19 5.44772 18.5523 5 18 5H6ZM7.29289 9.29289C7.68342 8.90237 8.31658 8.90237 8.70711 9.29289L10.7071 11.2929C11.0976 11.6834 11.0976 12.3166 10.7071 12.7071L8.70711 14.7071C8.31658 15.0976 7.68342 15.0976 7.29289 14.7071C6.90237 14.3166 6.90237 13.6834 7.29289 13.2929L8.58579 12L7.29289 10.7071C6.90237 10.3166 6.90237 9.68342 7.29289 9.29289ZM12 14C12 13.4477 12.4477 13 13 13H16C16.5523 13 17 13.4477 17 14C17 14.5523 16.5523 15 16 15H13C12.4477 15 12 14.5523 12 14Z" fill="currentColor"></path>
                      </svg>
                      <div class="text-sm font-semibold">Code</div>
                    </div>
                    <div class="form-check flex items-center gap-2">
                      <input class="form-check-input float-left h-4 w-4 appearance-none rounded-sm border border-gray-300 bg-white bg-contain bg-center bg-no-repeat align-top transition duration-200 checked:border-blue-600 checked:bg-blue-600 focus:outline-none cursor-pointer" type="checkbox" id="python" ${disabledTools.includes('python') ? '' : 'checked=""'}>
                    </div>
                  </button>
                </span>
                <span class="block" data-state="closed">
                  <button class="flex w-full items-center justify-between gap-2 whitespace-nowrap rounded border border-token-border-medium p-2">
                    <div class="flex items-center gap-2">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-token-text-tertiary">
                        <path fill-rule="evenodd" clip-rule="evenodd"
                          d="M13.2929 4.29291C15.0641 2.52167 17.9359 2.52167 19.7071 4.2929C21.4784 6.06414 21.4784 8.93588 19.7071 10.7071L18.7073 11.7069L11.6135 18.8007C10.8766 19.5376 9.92793 20.0258 8.89999 20.1971L4.16441 20.9864C3.84585 21.0395 3.52127 20.9355 3.29291 20.7071C3.06454 20.4788 2.96053 20.1542 3.01362 19.8356L3.80288 15.1C3.9742 14.0721 4.46243 13.1234 5.19932 12.3865L13.2929 4.29291ZM13 7.41422L6.61353 13.8007C6.1714 14.2428 5.87846 14.8121 5.77567 15.4288L5.21656 18.7835L8.57119 18.2244C9.18795 18.1216 9.75719 17.8286 10.1993 17.3865L16.5858 11L13 7.41422ZM18 9.5858L14.4142 6.00001L14.7071 5.70712C15.6973 4.71693 17.3027 4.71693 18.2929 5.70712C19.2831 6.69731 19.2831 8.30272 18.2929 9.29291L18 9.5858Z"
                          fill="currentColor"></path>
                      </svg>
                      <div class="text-sm font-semibold">Canvas</div>
                    </div>
                    <div class="form-check flex items-center gap-2">
                      <input class="form-check-input float-left h-4 w-4 appearance-none rounded-sm border border-gray-300 bg-white bg-contain bg-center bg-no-repeat align-top transition duration-200 checked:border-blue-600 checked:bg-blue-600 focus:outline-none cursor-pointer" id="canmore" data-testid="canmore" type="checkbox" ${disabledTools.includes('canmore') ? '' : 'checked=""'}>
                    </div>
                  </button>
                </span>
                <span class="block" data-state="closed">
                  <button class="flex w-full items-center justify-between gap-2 whitespace-nowrap rounded border border-token-border-medium p-2">
                    <div class="flex items-center gap-2">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-token-text-tertiary">
                        <path d="M9.5 4C8.67157 4 8 4.67157 8 5.5V18.5C8 19.3284 8.67157 20 9.5 20C10.3284 20 11 19.3284 11 18.5V5.5C11 4.67157 10.3284 4 9.5 4Z" fill="currentColor"></path><path d="M13 8.5C13 7.67157 13.6716 7 14.5 7C15.3284 7 16 7.67157 16 8.5V15.5C16 16.3284 15.3284 17 14.5 17C13.6716 17 13 16.3284 13 15.5V8.5Z" fill="currentColor"></path><path d="M4.5 9C3.67157 9 3 9.67157 3 10.5V13.5C3 14.3284 3.67157 15 4.5 15C5.32843 15 6 14.3284 6 13.5V10.5C6 9.67157 5.32843 9 4.5 9Z" fill="currentColor"></path><path d="M19.5 9C18.6716 9 18 9.67157 18 10.5V13.5C18 14.3284 18.6716 15 19.5 15C20.3284 15 21 14.3284 21 13.5V10.5C21 9.67157 20.3284 9 19.5 9Z" fill="currentColor">
                        </path>
                      </svg>
                      <div class="text-sm font-semibold">Advanced Voice</div>
                    </div>
                    <div class="form-check flex items-center gap-2">
                      <input class="form-check-input float-left h-4 w-4 appearance-none rounded-sm border border-gray-300 bg-white bg-contain bg-center bg-no-repeat align-top transition duration-200 checked:border-blue-600 checked:bg-blue-600 focus:outline-none cursor-pointer" id="advanced_voice" data-testid="advanced_voice" type="checkbox" ${disabledTools.includes('advanced_voice') ? '' : 'checked=""'}>
                    </div>
                  </button>
                </span>
              </div>
            </div>

          </div>
        </div>
        <div class="-ms-6 -me-6 border-t">
          <div class="ms-6 me-6 flex flex-grow flex-col items-stretch justify-between gap-0 pb-1 pt-2 flex-row items-center gap-3">
            
            <div class="cursor-pointer text-sm flex items-center justify-start gap-2 mt-4">${translate('Enable for new chats')}<label class="sp-switch"><input id="custom-instruction-editor-status-switch" type="checkbox" ${enabled ? 'checked=""' : ''}><span class="sp-switch-slider round"></span></label></div>

            <div class="flex flex-col gap-3 flex-row-reverse mt-5 mt-4">
              <button id="custom-instruction-editor-save-button" class="disabled:opacity-50 hover:bg-inherit disabled:cursor-not-allowed btn relative btn-primary" ${canSave ? '' : 'disabled=""'} as="button">
                <div class="flex items-center justify-center">${translate('Save')}</div>
              </button>
              <button id="custom-instruction-editor-cancel-button" class="btn relative btn-secondary" as="button">
                <div class="flex items-center justify-center">${translate('Cancel')}</div>
              </button>
              ${profile.id ? `<button id="custom-instruction-editor-delete-button" class="btn relative btn-danger" as="button">
                <div class="flex items-center justify-center">${translate('Delete')}</div>
              </button>` : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</div>`;
  document.body.insertAdjacentHTML('beforeend', editor);
  addCustomInstructionProfileEditorEventListeners(profile, modelTraitsOne, modelTraitsTwo);
}
function addCustomInstructionProfileEditorEventListeners(profile, modelTraitsOne, modelTraitsTwo) {
  const editorWrapper = document.querySelector('#custom-instruction-editor-wrapper');
  const editor = document.querySelector('#custom-instruction-editor');
  const cancelButton = editor.querySelector('#custom-instruction-editor-cancel-button');
  const deleteButton = editor.querySelector('#custom-instruction-editor-delete-button');
  const saveButton = editor.querySelector('#custom-instruction-editor-save-button');
  const statuwSwitch = editor.querySelector('#custom-instruction-editor-status-switch');
  const profileNameInput = editor.querySelector('#custom-instruction-editor-name-input');
  const userNameInput = editor.querySelector('#custom-instruction-editor-name-user-message');
  const userRoleInput = editor.querySelector('#custom-instruction-editor-role-user-message');
  const modelTraitsInput = editor.querySelector('#custom-instruction-editor-traits-model-message');
  const modelTraitButtons = editor.querySelectorAll('[id^="custom-instruction-editor-trait-button-"]');
  const refreshTraitsButton = editor.querySelector('#custom-instruction-editor-refresh-traits-button');
  const otherUserInput = editor.querySelector('#custom-instruction-editor-other-user-message');
  const advancedButton = editor.querySelector('#custom-instruction-editor-advanced-button');
  const advancedSettings = editor.querySelector('#custom-instruction-editor-advanced-settings');
  const browserCheckbox = editor.querySelector('#browser');
  const dalleCheckbox = editor.querySelector('#dalle');
  const pythonCheckbox = editor.querySelector('#python');
  const canvasCheckbox = editor.querySelector('#canmore');
  const advancedVoiceCheckbox = editor.querySelector('#advanced_voice');
  const checkboxes = [browserCheckbox, dalleCheckbox, pythonCheckbox, canvasCheckbox, advancedVoiceCheckbox];

  const modelTraitsInfoIcon = editor.querySelector('#custom-instruction-editor-traits-model-message-info-icon');
  const otherUserInfoIcon = editor.querySelector('#custom-instruction-editor-other-user-message-info-icon');
  const capabilitiesInfoIcon = editor.querySelector('#custom-instruction-editor-capabilities-info-icon');

  const updateCounter = (textArea, text, counter = null) => {
    if (counter) {
      counter.textContent = `${text.length}/1500`;
    }
    // if (text.length > 1500) { make textbox border and counter red }
    if (text.length > 1500) {
      counter?.classList.add('text-red-500');
      textArea.classList.add('border-red-500');
      textArea.classList.add('focus:border-red-500');
      textArea.classList.remove('border-token-border-medium');
      textArea.classList.remove('focus:border-token-border-medium');
      saveButton.setAttribute('disabled', '');
    } else {
      counter?.classList.remove('text-red-500');
      textArea.classList.remove('border-red-500');
      textArea.classList.remove('focus:border-red-500');
      textArea.classList.add('border-token-border-medium');
      textArea.classList.add('focus:border-token-border-medium');
      if (profileNameInput.value.length > 0 && userNameInput.value.length <= 1500 && userRoleInput.value.length <= 1500 && modelTraitsInput.value.length <= 1500 && otherUserInput.value.length <= 1500) {
        saveButton.removeAttribute('disabled');
      } else {
        saveButton.setAttribute('disabled', '');
      }
    }
  };

  createTooltip(modelTraitsInfoIcon, '<div id="custom-instruction-editor-traits-model-message-tooltip" style="min-width: max-content;z-index: 50;"><div data-side="top" data-align="center" data-state="delayed-open" class="relative z-50 select-none shadow-xs transition-opacity p-2 rounded-lg bg-black max-w-xs" style="pointer-events: auto; --radix-tooltip-content-transform-origin: var(--radix-popper-transform-origin); --radix-tooltip-content-available-width: var(--radix-popper-available-width); --radix-tooltip-content-available-height: var(--radix-popper-available-height); --radix-tooltip-trigger-width: var(--radix-popper-anchor-width); --radix-tooltip-trigger-height: var(--radix-popper-anchor-height);"><span class="flex items-center whitespace-pre-wrap font-semibold normal-case text-start text-default-text-primary text-sm"><div><div class="text-muted mx-3 mb-[6px] mt-3 text-sm font-medium">You can tell ChatGPT to do things like...</div></div></span><span class="flex items-center whitespace-pre-wrap text-start text-gray-400 text-sm"><div><ul class="text-muted mx-2 mb-3 list-disc justify-start space-y-[6px] ps-5 text-sm text-token-text-primary"><li>Use a formal, professional tone.</li><li>Be casual and chatty.</li><li>Be opinionated. If a question could have multiple answers, try to give only the best one.</li></ul></div></span><span style="position: absolute; bottom: 0px; transform: translateY(100%); left: 155px;"><div class="relative top-[-4px] h-2 w-2 rotate-45 transform shadow-xs dark:border-e dark:border-b border-white/10 bg-black" width="10" height="5" viewbox="0 0 30 10" preserveaspectratio="none" style="display: block;"></div></span><span id="radix-:rb5:" role="tooltip" style="position: absolute; border: 0px; width: 1px; height: 1px; padding: 0px; margin: -1px; overflow: hidden; clip: rect(0px, 0px, 0px, 0px); white-space: nowrap; overflow-wrap: normal;"><span class="flex items-center whitespace-pre-wrap font-semibold normal-case text-start text-default-text-primary text-sm"><div><div class="text-muted mx-3 mb-[6px] mt-3 text-sm font-medium">You can tell ChatGPT to do things like...</div></div></span><span class="flex items-center whitespace-pre-wrap text-start text-gray-400 text-sm"><div><ul class="text-muted mx-2 mb-3 list-disc justify-start space-y-[6px] ps-5 text-sm text-token-text-primary"><li>Use a formal, professional tone.</li><li>Be casual and chatty.</li><li>Be opinionated. If a question could have multiple answers, try to give only the best one.</li></ul></div></span></span></div></div>', 'transform: translate(50%, -110%);');

  createTooltip(otherUserInfoIcon, '<div id="custom-instruction-editor-other-user-message-tooltip" style="min-width: max-content; z-index: 50;"><div data-side="top" data-align="center" data-state="delayed-open" class="relative z-50 select-none shadow-xs transition-opacity p-2 rounded-lg bg-black max-w-xs" style="pointer-events: auto; --radix-tooltip-content-transform-origin: var(--radix-popper-transform-origin); --radix-tooltip-content-available-width: var(--radix-popper-available-width); --radix-tooltip-content-available-height: var(--radix-popper-available-height); --radix-tooltip-trigger-width: var(--radix-popper-anchor-width); --radix-tooltip-trigger-height: var(--radix-popper-anchor-height);"><span class="flex items-center whitespace-pre-wrap font-semibold normal-case text-start text-default-text-primary text-sm"><div><div class="text-muted mx-3 mb-2 mt-3 text-sm font-medium">You can share things like...</div></div></span><span class="flex items-center whitespace-pre-wrap text-start text-gray-400 text-sm"><div><ul class="text-muted mx-2 mb-3 list-disc justify-start space-y-[6px] ps-5 text-sm text-token-text-primary"><li>I love hiking and jazz</li><li>I\'m vegetarian</li><li>I\'m trying to learn French</li></ul></div></span><span style="position: absolute; bottom: 0px; transform: translateY(100%); left: 104px;"><div class="relative top-[-4px] h-2 w-2 rotate-45 transform shadow-xs dark:border-e dark:border-b border-white/10 bg-black" width="10" height="5" viewbox="0 0 30 10" preserveaspectratio="none" style="display: block;"></div></span><span id="radix-:rb7:" role="tooltip" style="position: absolute; border: 0px; width: 1px; height: 1px; padding: 0px; margin: -1px; overflow: hidden; clip: rect(0px, 0px, 0px, 0px); white-space: nowrap; overflow-wrap: normal;"><span class="flex items-center whitespace-pre-wrap font-semibold normal-case text-start text-default-text-primary text-sm"><div><div class="text-muted mx-3 mb-2 mt-3 text-sm font-medium">You can share things like...</div></div></span><span class="flex items-center whitespace-pre-wrap text-start text-gray-400 text-sm"><div><ul class="text-muted mx-2 mb-3 list-disc justify-start space-y-[6px] ps-5 text-sm text-token-text-primary"><li>I love hiking and jazz</li><li>I\'m vegetarian</li><li>I\'m trying to learn French</li></ul></div></span></span></div></div>', 'transform: translate(50%, -110%);');

  createTooltip(capabilitiesInfoIcon, '<div id="custom-instruction-editor-capabilities-tooltip" style="min-width: max-content;z-index: 50;"><div data-side="top" data-align="center" data-state="delayed-open" class="relative z-50 select-none shadow-xs transition-opacity px-3 py-2 rounded-lg bg-black max-w-xs" style="pointer-events: auto; --radix-tooltip-content-transform-origin: var(--radix-popper-transform-origin); --radix-tooltip-content-available-width: var(--radix-popper-available-width); --radix-tooltip-content-available-height: var(--radix-popper-available-height); --radix-tooltip-trigger-width: var(--radix-popper-anchor-width); --radix-tooltip-trigger-height: var(--radix-popper-anchor-height);"><span class="flex items-center whitespace-pre-wrap font-semibold normal-case text-center text-gray-100 text-sm"><div>Choose which tools can be used with GPT-4</div></span><span style="position: absolute; bottom: 0px; transform: translateY(100%); left: 155px;"><div class="relative top-[-4px] h-2 w-2 rotate-45 transform shadow-xs bg-black" width="10" height="5" viewbox="0 0 30 10" preserveaspectratio="none" style="display: block;"></div></span><span id="radix-:rb9:" role="tooltip" style="position: absolute; border: 0px; width: 1px; height: 1px; padding: 0px; margin: -1px; overflow: hidden; clip: rect(0px, 0px, 0px, 0px); white-space: nowrap; overflow-wrap: normal;"><span class="flex items-center whitespace-pre-wrap font-semibold normal-case text-center text-gray-100 text-sm"><div>Choose which tools can be used with GPT-4</div></span></span></div></div>', 'transform: translate(60%, -120%);');

  editorWrapper?.addEventListener('click', (event) => {
    if (!isDescendant(editor, event.target)) {
      editorWrapper.remove();
    }
  });
  profileNameInput?.addEventListener('input', () => {
    if (profileNameInput.value.length > 0 && userNameInput.value.length <= 1500 && userRoleInput.value.length <= 1500 && modelTraitsInput.value.length <= 1500 && otherUserInput.value.length <= 1500) {
      saveButton.removeAttribute('disabled');
    } else {
      saveButton.setAttribute('disabled', '');
    }
  });

  userNameInput?.addEventListener('input', () => {
    updateCounter(userNameInput, userNameInput.value);
  });
  userRoleInput?.addEventListener('input', () => {
    updateCounter(userRoleInput, userRoleInput.value);
  });
  modelTraitsInput?.addEventListener('input', () => {
    updateCounter(modelTraitsInput, modelTraitsInput.value);
  });
  otherUserInput?.addEventListener('input', () => {
    updateCounter(otherUserInput, otherUserInput.value);
  });

  modelTraitButtons.forEach((traitElement) => {
    traitElement.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const traitKey = traitElement.id.replace('custom-instruction-editor-trait-button-', '');
      modelTraitsInput.value += ` ${[...modelTraitsOne, ...modelTraitsTwo].find((t) => t.key === traitKey).description}`;
      updateCounter(modelTraitsInput, modelTraitsInput.value);
      traitElement.classList.add('hidden');
    });
  });

  refreshTraitsButton?.addEventListener('click', () => {
    currentModelTraits = currentModelTraits === 'modelTraitsOne' ? 'modelTraitsTwo' : 'modelTraitsOne';
    const curModelTraitButtons = editor.querySelectorAll('[id^="custom-instruction-editor-trait-button-"]');
    curModelTraitButtons.forEach((trait) => {
      trait.remove();
    });
    const newTraits = currentModelTraits === 'modelTraitsOne' ? modelTraitsOne : modelTraitsTwo;
    const newTraitsList = newTraits.map((trait) => `                    
      <button id="custom-instruction-editor-trait-button-${trait.key}" class="btn relative btn-secondary btn-small py-2 ps-2 pe-3 text-xs font-normal text-token-text-tertiary">
        <div class="flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            xmlns="http://www.w3.org/2000/svg" class="me-[1px] h-4 w-4">
            <path d="M12 6.00003C12.5523 6.00003 13 6.44775 13 7.00003L13 11L17 11C17.5523 11 18 11.4477 18 12C18 12.5523 17.5523 13 17 13L13 13L13 17C13 17.5523 12.5523 18 12 18C11.4477 18 11 17.5523 11 17L11 13L7 13C6.44771 13 6 12.5523 6 12C6 11.4477 6.44771 11 7 11L11 11L11 7.00003C11 6.44775 11.4477 6.00003 12 6.00003Z" fill="currentColor"></path>
          </svg>${trait.label}
        </div>
      </button>`).join('');
    refreshTraitsButton.insertAdjacentHTML('beforebegin', newTraitsList);

    const newModelTraitButtons = editor.querySelectorAll('[id^="custom-instruction-editor-trait-button-"]');
    newModelTraitButtons.forEach((traitElement) => {
      traitElement.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const traitKey = traitElement.id.replace('custom-instruction-editor-trait-button-', '');
        modelTraitsInput.value += ` ${[...modelTraitsOne, ...modelTraitsTwo].find((t) => t.key === traitKey).description}`;
        updateCounter(modelTraitsInput, modelTraitsInput.value);
        traitElement.classList.add('hidden');
      });
    });
  });

  advancedButton?.addEventListener('click', () => {
    advancedSettings.classList.toggle('hidden');
  });

  cancelButton?.addEventListener('click', () => {
    editorWrapper.remove();
  });

  deleteButton?.addEventListener('click', () => {
    showConfirmDialog('Delete profile', 'Are you sure you want to delete this custom instruction profile?', 'Cancel', 'Delete', null, () => {
      chrome.runtime.sendMessage({
        type: 'deleteCustomInstructionProfile',
        detail: {
          profileId: profile.id,
        },
      }, () => {
        const existingProfileCard = document.querySelector(`#custom-instruction-profile-card-${profile.id}`);
        if (existingProfileCard) existingProfileCard.remove();
        const profileList = document.querySelector('#modal-manager #custom-instruction-profile-manager-profile-list');
        if (profileList && profileList.children.length === 0) {
          const noProfiles = document.createElement('p');
          noProfiles.id = 'no-conversations-found';
          noProfiles.innerText = 'No profiles found';
          profileList.appendChild(noProfiles);
        }
        if (profile.enabled) {
          setUserSystemMessage('', '', false, []);
        }
        initializeCustomInstructionProfileSelector(true);
      });
      editorWrapper.remove();
    });
  });
  saveButton?.addEventListener('click', () => {
    const disabledTools = checkboxes.filter((checkbox) => !checkbox.checked).map((checkbox) => checkbox.id);

    const newProfile = {
      name: profileNameInput.value,
      name_user_message: userNameInput.value,
      role_user_message: userRoleInput.value,
      traits_model_message: modelTraitsInput.value,
      other_user_message: otherUserInput.value,
      enabled: statuwSwitch.checked,
      disabled_tools: disabledTools,
    };
    if (profile.id) {
      newProfile.id = profile.id;
    }
    chrome.runtime.sendMessage({
      type: profile.id ? 'updateCustomInstructionProfile' : 'addCustomInstructionProfile',
      detail: {
        profileId: profile.id,
        profile: newProfile,
      },
    }, async (data) => {
      if (data.error && data.error.type === 'limit') {
        errorUpgradeConfirmation(data.error);
        return;
      }
      editorWrapper.remove();
      const noProfilesFound = document.querySelector('#modal-manager #no-profiles-found');
      if (noProfilesFound) noProfilesFound.remove();
      if (data.enabled) {
        const allProfileStatusSwitches = document.querySelectorAll('#modal-manager input[id^="profile-card-status-switch-"]');
        allProfileStatusSwitches.forEach((statusSwitch) => {
          statusSwitch.checked = false;
        });
      }
      initializeCustomInstructionProfileSelector(true);

      const existingProfileCard = document.querySelector(`#custom-instruction-profile-card-${profile.id}`);
      addOrReplaceProfileCard(data, existingProfileCard);
      if (data.enabled) {
        setUserSystemMessage(newProfile.name_user_message, newProfile.role_user_message, newProfile.traits_model_message, newProfile.other_user_message, newProfile.enabled, newProfile.disabled_tools);
      }
    });
  });
}
