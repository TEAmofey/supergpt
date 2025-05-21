/* global isDescendant, translate, showConfirmDialog, showReviewReminder */
// eslint-disable-next-line no-unused-vars
function openUpgradeModal(hasSubscription = false) {
  chrome.storage.local.get({ STRIPE_PAYMENT_LINK_ID: '8wM5nW6oq7y287ufZ8', STRIPE_PORTAL_LINK_ID: '00g0237Sr78wcM03cc' }, (r) => {
    // const beforeDate = new Date('2024-01-02');
    // const now = new Date();
    const limitedTimeOffer = !hasSubscription ? '<span class="text-xs self-end">Limited time offer</span>' : '';
    const proPrice = !hasSubscription ? 'USD <span class="line-through">$19.99</span> <span>$10/month <span class="text-xs">(billed yearly)</span></span>' : '';
    chrome.storage.sync.get(['email'], ({ email }) => {
      const upgradeModal = `<div id="upgrade-to-pro-modal" class="absolute inset-0 h-full w-full bg-token-main-surface-primary shadow-xl bg-payment-modal" style="z-index:100000;"><div data-state="open" class="fixed inset-0" style="pointer-events:auto;"><div class="h-full w-full grid grid-cols-[10px_1fr_10px] grid-rows-[minmax(10px,1fr)_auto_minmax(10px,1fr)] md:grid-rows-[minmax(20px,1fr)_auto_minmax(20px,1fr)] overflow-y-auto"><div role="dialog" data-state="open" class="relative col-auto col-start-2 row-auto row-start-2 w-full rounded-xl text-start shadow-xl transition-all start-1/2 ltr:-translate-x-1/2 rtl:translate-x-1/2 focus-none !bg-transparent !shadow-none outline-none" tabindex="-1" style="pointer-events:auto; max-width:fit-content;"><div class=""><div class="focus-none flex h-full flex-col items-center justify-start outline-none"><div class="relative"><div id="upgrade-to-pro-modal-content" class="flex grow justify-center rounded-md flex-col items-start overflow-hidden border shadow-md dark:border-gray-600"><div class="flex w-full flex-row items-center justify-between border-b border-token-border-medium bg-token-main-surface-primary px-8 py-6"><span class="text-xl font-medium">${hasSubscription ? 'Superpower ChatGPT Pro Plan' : 'Upgrade Superpower ChatGPT Plan'}</span><button id="upgrade-modal-close-button" class="text-token-text-primary opacity-50 transition hover:opacity-75"><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button></div><div class="flex flex-col md:flex-row">${hasSubscription ? '' : `
      <div class="text-sm relative flex-1 flex gap-5 flex-col border-t py-4 px-6 border-token-border-medium border-e last:border-e-0 border-t-0" style="max-width:550px;">
        <div class="relative flex flex-col">
          <div class="flex flex-col gap-1">
            <p class="flex items-center gap-2 text-xl font-medium">Free</p>
            <p class="text-base font-light text-token-text-tertiary">USD $0/month</p>
          </div>
        </div>
        <div class="relative flex flex-col">
          <button class="opacity-50 hover:bg-inherit cursor-not-allowed btn relative btn-disabled py-3 font-semibold bg-token-sidebar-surface-secondary" disabled="">
            <div class="flex w-full gap-2 items-center justify-center">Your current plan</div>
          </button>
        </div>
        <div class="flex flex-col flex-grow gap-2">
          <div class="relative flex flex-col">
            <p class="text-l font-medium">For people just getting started with Superpower ChatGPT</p>
          </div>
          <div class="relative">
            <div class="text-l flex justify-start gap-2">
              <div class=" flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md">
                  <path fill="currentColor" fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m14.076-4.068a1 1 0 0 1 .242 1.393l-4.75 6.75a1 1 0 0 1-1.558.098l-2.5-2.75a1 1 0 0 1 1.48-1.346l1.66 1.827 4.032-5.73a1 1 0 0 1 1.394-.242" clip-rule="evenodd"></path>
                </svg>
              </div>
              <span>Create Folders and Subfolders and Search Conversations*</span>
            </div>
          </div>
          <div class="relative">
            <div class="text-l flex justify-start gap-2">
              <div class=" flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md">
                  <path fill="currentColor" fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m14.076-4.068a1 1 0 0 1 .242 1.393l-4.75 6.75a1 1 0 0 1-1.558.098l-2.5-2.75a1 1 0 0 1 1.48-1.346l1.66 1.827 4.032-5.73a1 1 0 0 1 1.394-.242" clip-rule="evenodd"></path>
                </svg>
              </div>
              <span>Create Multiple Custom Instruction Profiles*</span>
            </div>
          </div>
          <div class="relative">
            <div class="text-l flex justify-start gap-2">
              <div class=" flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md">
                  <path fill="currentColor" fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m14.076-4.068a1 1 0 0 1 .242 1.393l-4.75 6.75a1 1 0 0 1-1.558.098l-2.5-2.75a1 1 0 0 1 1.48-1.346l1.66 1.827 4.032-5.73a1 1 0 0 1 1.394-.242" clip-rule="evenodd"></path>
                </svg>
              </div>
              <span>Prompt Chains, Prompt Templates, and Custom Prompts*</span>
            </div>
          </div>
          <div class="relative">
            <div class="text-l flex justify-start gap-2">
              <div class=" flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md">
                  <path fill="currentColor" fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m14.076-4.068a1 1 0 0 1 .242 1.393l-4.75 6.75a1 1 0 0 1-1.558.098l-2.5-2.75a1 1 0 0 1 1.48-1.346l1.66 1.827 4.032-5.73a1 1 0 0 1 1.394-.242" clip-rule="evenodd"></path>
                </svg>
              </div>
              <span>Prompt History, Favorite Prompts, and Public Prompts</span>
            </div>
          </div>
          <div class="relative">
            <div class="text-l flex justify-start gap-2">
              <div class=" flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md">
                  <path fill="currentColor" fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m14.076-4.068a1 1 0 0 1 .242 1.393l-4.75 6.75a1 1 0 0 1-1.558.098l-2.5-2.75a1 1 0 0 1 1.48-1.346l1.66 1.827 4.032-5.73a1 1 0 0 1 1.394-.242" clip-rule="evenodd"></path>
                </svg>
              </div>
              <span>Minimap to see an overview of the entire conversation withouth scrolling</span>
            </div>
          </div>
          <div class="relative">
            <div class="text-l flex justify-start gap-2">
              <div class=" flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md">
                  <path fill="currentColor" fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m14.076-4.068a1 1 0 0 1 .242 1.393l-4.75 6.75a1 1 0 0 1-1.558.098l-2.5-2.75a1 1 0 0 1 1.48-1.346l1.66 1.827 4.032-5.73a1 1 0 0 1 1.394-.242" clip-rule="evenodd"></path>
                </svg>
              </div>
              <span>Hide/show Custom GPT list and sort alphabetically</span>
            </div>
          </div>
          <div class="relative">
            <div class="text-l flex justify-start gap-2">
              <div class=" flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md">
                  <path fill="currentColor" fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m14.076-4.068a1 1 0 0 1 .242 1.393l-4.75 6.75a1 1 0 0 1-1.558.098l-2.5-2.75a1 1 0 0 1 1.48-1.346l1.66 1.827 4.032-5.73a1 1 0 0 1 1.394-.242" clip-rule="evenodd"></path>
                </svg>
              </div>
              <span>Override default model switcher to access all available models</span>
            </div>
          </div>
          <div class="relative">
            <div class="text-l flex justify-start gap-2">
              <div class=" flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md">
                  <path fill="currentColor" fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m14.076-4.068a1 1 0 0 1 .242 1.393l-4.75 6.75a1 1 0 0 1-1.558.098l-2.5-2.75a1 1 0 0 1 1.48-1.346l1.66 1.827 4.032-5.73a1 1 0 0 1 1.394-.242" clip-rule="evenodd"></path>
                </svg>
              </div>
              <span>Pinned Messages for Easy Access*</span>
            </div>
          </div>
          <div class="relative">
            <div class="text-l flex justify-start gap-2">
              <div class=" flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md">
                  <path fill="currentColor" fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m14.076-4.068a1 1 0 0 1 .242 1.393l-4.75 6.75a1 1 0 0 1-1.558.098l-2.5-2.75a1 1 0 0 1 1.48-1.346l1.66 1.827 4.032-5.73a1 1 0 0 1 1.394-.242" clip-rule="evenodd"></path>
                </svg>
              </div>
              <span>Export Chats in Multiple Formats(PDF, Text, Markdown, JSON)</span>
            </div>
          </div>
          <div class="relative">
            <div class="text-l flex justify-start gap-2">
              <div class=" flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md">
                  <path fill="currentColor" fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m14.076-4.068a1 1 0 0 1 .242 1.393l-4.75 6.75a1 1 0 0 1-1.558.098l-2.5-2.75a1 1 0 0 1 1.48-1.346l1.66 1.827 4.032-5.73a1 1 0 0 1 1.394-.242" clip-rule="evenodd"></path>
                </svg>
              </div>
              <span>Word and Character counters</span>
            </div>
          </div>
          <div class="relative">
            <div class="text-l flex justify-start gap-2">
              <div class=" flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md">
                  <path fill="currentColor" fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m14.076-4.068a1 1 0 0 1 .242 1.393l-4.75 6.75a1 1 0 0 1-1.558.098l-2.5-2.75a1 1 0 0 1 1.48-1.346l1.66 1.827 4.032-5.73a1 1 0 0 1 1.394-.242" clip-rule="evenodd"></path>
                </svg>
              </div>
              <span>Language, Tone, and Writing Style Selector</span>
            </div>
          </div>
          <div class="texs-xs text-token-text-tertiary">*Limits apply</div>
        </div>
      </div>`}
      
      <div class="text-sm relative flex-1 flex gap-5 flex-col border-t py-4 px-6 border-token-border-medium border-e last:border-e-0 border-t-0" style="max-width:550px;"><div class="relative flex flex-col"><div class="flex flex-col gap-1"><p class="flex items-center gap-2 text-xl font-medium"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" style="width:20px;height:20px;margin-right:6px" stroke="gold" fill="gold"><path d="M240.5 224H352C365.3 224 377.3 232.3 381.1 244.7C386.6 257.2 383.1 271.3 373.1 280.1L117.1 504.1C105.8 513.9 89.27 514.7 77.19 505.9C65.1 497.1 60.7 481.1 66.59 467.4L143.5 288H31.1C18.67 288 6.733 279.7 2.044 267.3C-2.645 254.8 .8944 240.7 10.93 231.9L266.9 7.918C278.2-1.92 294.7-2.669 306.8 6.114C318.9 14.9 323.3 30.87 317.4 44.61L240.5 224z"/></svg>Pro ${limitedTimeOffer}</p><p class="text-base font-light text-token-text-tertiary">${proPrice}</p></div></div><div class="relative flex flex-col"><div class="relative w-full"><span class="" data-state="closed"><button id="upgrade-modal-confirm-button" class="btn relative btn-primary w-full py-3 py-3 font-semibold ${hasSubscription ? 'opacity-50 hover:bg-inherit cursor-not-allowed btn-disabled bg-token-sidebar-surface-secondary' : ''}" data-testid="select-plan-button-plus-waitlist">${hasSubscription ? '<div class="flex w-full gap-2 items-center justify-center text-token-text-tertiary">Your current plan</div>' : `<a class="flex w-full items-center justify-center" target="_self" href="https://buy.stripe.com/${r.STRIPE_PAYMENT_LINK_ID || '8wM5nW6oq7y287ufZ8'}?prefilled_email=${encodeURIComponent(email)}">Upgrade to Pro</a>`}</button></span></div></div><div class="flex flex-col flex-grow gap-2"><div class="relative flex flex-col">${hasSubscription ? '' : '<p class="text-l font-medium">Everything in Free, and:</p>'}</div>
            
      <div class="relative"><div class="text-l flex justify-start gap-2"><div class=" flex-shrink-0"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md"><path fill="currentColor" fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m14.076-4.068a1 1 0 0 1 .242 1.393l-4.75 6.75a1 1 0 0 1-1.558.098l-2.5-2.75a1 1 0 0 1 1.48-1.346l1.66 1.827 4.032-5.73a1 1 0 0 1 1.394-.242" clip-rule="evenodd"></path></svg></div><span><b>Image gallery.</b> Search, See Prompt and Download all Images in One Place. <a class="text-token-link" style="text-decoration:underline;" href="https://www.youtube.com/watch?v=oU6_wgJLYEM&ab_channel=Superpower" target="blank">Watch Demo ➜</a></span></div></div>


      <div class="relative"><div class="text-l flex justify-start gap-2"><div class=" flex-shrink-0"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md"><path fill="currentColor" fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m14.076-4.068a1 1 0 0 1 .242 1.393l-4.75 6.75a1 1 0 0 1-1.558.098l-2.5-2.75a1 1 0 0 1 1.48-1.346l1.66 1.827 4.032-5.73a1 1 0 0 1 1.394-.242" clip-rule="evenodd"></path></svg></div><span><b>Advanced Prompt Managment.</b> Manage all your prompts in one place with <b>NO LIMIT</b>. <a class="text-token-link" style="text-decoration:underline;" href="https://youtu.be/owStC5nLIF4" target="blank">Watch Demo ➜</a></span></div></div>

      <div class="relative"><div class="text-l flex justify-start gap-2"><div class=" flex-shrink-0"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md"><path fill="currentColor" fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m14.076-4.068a1 1 0 0 1 .242 1.393l-4.75 6.75a1 1 0 0 1-1.558.098l-2.5-2.75a1 1 0 0 1 1.48-1.346l1.66 1.827 4.032-5.73a1 1 0 0 1 1.394-.242" clip-rule="evenodd"></path></svg></div><span><b>Notes.</b> Save notes for each conversation and automatically sync them across all your devices. <a class="text-token-link" style="text-decoration:underline;" href="https://www.youtube.com/watch?v=pYAzc8zCQM0" target="blank">Watch Demo ➜</a></span></div></div>

      <div class="relative"><div class="text-l flex justify-start gap-2"><div class=" flex-shrink-0"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md"><path fill="currentColor" fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m14.076-4.068a1 1 0 0 1 .242 1.393l-4.75 6.75a1 1 0 0 1-1.558.098l-2.5-2.75a1 1 0 0 1 1.48-1.346l1.66 1.827 4.032-5.73a1 1 0 0 1 1.394-.242" clip-rule="evenodd"></path></svg></div><span><span style="background-color: rgb(239, 65, 70); color: white; padding: 2px 8px; border-radius: 8px; font-size: 0.7em; margin-right: 8px;">New</span><b>Reference chats.</b> Reference older conversations in a new conversation with one click. <a class="text-token-link" style="text-decoration:underline;" href="https://youtu.be/MmktqRvo3E8" target="blank">Watch Demo ➜</a></span></div></div>

      <div class="relative"><div class="text-l flex justify-start gap-2"><div class=" flex-shrink-0"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md"><path fill="currentColor" fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m14.076-4.068a1 1 0 0 1 .242 1.393l-4.75 6.75a1 1 0 0 1-1.558.098l-2.5-2.75a1 1 0 0 1 1.48-1.346l1.66 1.827 4.032-5.73a1 1 0 0 1 1.394-.242" clip-rule="evenodd"></path></svg></div><span><span style="background-color: rgb(239, 65, 70); color: white; padding: 2px 8px; border-radius: 8px; font-size: 0.7em; margin-right: 8px;">New</span><b>Side-by-side Voice Mode.</b> Easily talk to ChatGPT and see the conversation at the same time. <a class="text-token-link" style="text-decoration:underline;" href="https://youtu.be/StONQDxnCM4" target="blank">Watch Demo ➜</a></span></div></div>
      
      <div class="relative"><div class="text-l flex justify-start gap-2"><div class=" flex-shrink-0"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md"><path fill="currentColor" fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m14.076-4.068a1 1 0 0 1 .242 1.393l-4.75 6.75a1 1 0 0 1-1.558.098l-2.5-2.75a1 1 0 0 1 1.48-1.346l1.66 1.827 4.032-5.73a1 1 0 0 1 1.394-.242" clip-rule="evenodd"></path></svg></div><span><b>Auto Folder.</b> Create folders for Custom GPT conversations automatically. <a class="text-token-link" style="text-decoration:underline;" href="https://youtu.be/f1B7Os_3Xg4" target="blank">Watch Demo ➜</a></span></div></div>

      <div class="relative"><div class="text-l flex justify-start gap-2"><div class=" flex-shrink-0"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md"><path fill="currentColor" fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m14.076-4.068a1 1 0 0 1 .242 1.393l-4.75 6.75a1 1 0 0 1-1.558.098l-2.5-2.75a1 1 0 0 1 1.48-1.346l1.66 1.827 4.032-5.73a1 1 0 0 1 1.394-.242" clip-rule="evenodd"></path></svg></div><span><span style="background-color: rgb(239, 65, 70); color: white; padding: 2px 8px; border-radius: 8px; font-size: 0.7em; margin-right: 8px;">New</span><b>Auto delete and auto archive.</b> Automatically delete or archive older conversations after a certain number of days. <a class="text-token-link" style="text-decoration:underline;" href="https://youtu.be/mMhOtMZwyOw" target="blank">Watch Demo ➜</a></span></div></div>

      <div class="relative"><div class="text-l flex justify-start gap-2"><div class=" flex-shrink-0"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md"><path fill="currentColor" fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m14.076-4.068a1 1 0 0 1 .242 1.393l-4.75 6.75a1 1 0 0 1-1.558.098l-2.5-2.75a1 1 0 0 1 1.48-1.346l1.66 1.827 4.032-5.73a1 1 0 0 1 1.394-.242" clip-rule="evenodd"></path></svg></div><span><span style="background-color: rgb(239, 65, 70); color: white; padding: 2px 8px; border-radius: 8px; font-size: 0.7em; margin-right: 8px;">New</span><b>Right click menu.</b> Send screenshots and run all your custom prompts, on any website, from the right click menu. <a class="text-token-link" style="text-decoration:underline;" href="https://youtu.be/dvPyNrDtwLo" target="blank">Watch Demo ➜</a></span></div></div>

      <div class="relative"><div class="text-l flex justify-start gap-2"><div class=" flex-shrink-0"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md"><path fill="currentColor" fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m14.076-4.068a1 1 0 0 1 .242 1.393l-4.75 6.75a1 1 0 0 1-1.558.098l-2.5-2.75a1 1 0 0 1 1.48-1.346l1.66 1.827 4.032-5.73a1 1 0 0 1 1.394-.242" clip-rule="evenodd"></path></svg></div><span><b>Enhanced GPT Store.</b> Access to full list of all GPTs in the store. With the ability to search and sort by most popular. <a class="text-token-link" style="text-decoration:underline;" href="https://www.youtube.com/watch?v=q1VUONah6fE&ab_channel=Superpower" target="blank">Watch Demo ➜</a></span></div></div>

      <div class="relative"><div class="text-l flex justify-start gap-2"><div class=" flex-shrink-0"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md"><path fill="currentColor" fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m14.076-4.068a1 1 0 0 1 .242 1.393l-4.75 6.75a1 1 0 0 1-1.558.098l-2.5-2.75a1 1 0 0 1 1.48-1.346l1.66 1.827 4.032-5.73a1 1 0 0 1 1.394-.242" clip-rule="evenodd"></path></svg></div><span><b>Unlimited</b> Folders, Prompt Categories, Pinned Messages, Notes, and Custom Instruction Profiles</span></div></div>

      <div class="relative"><div class="text-l flex justify-start gap-2"><div class=" flex-shrink-0"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md"><path fill="currentColor" fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m14.076-4.068a1 1 0 0 1 .242 1.393l-4.75 6.75a1 1 0 0 1-1.558.098l-2.5-2.75a1 1 0 0 1 1.48-1.346l1.66 1.827 4.032-5.73a1 1 0 0 1 1.394-.242" clip-rule="evenodd"></path></svg></div><span><b>Priority Support</b> and a Private Channel for Pro Members on Discord</span></div></div>
            
      <div class="relative"><div class="text-l flex justify-start gap-2"><div class=" flex-shrink-0"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md"><path fill="currentColor" fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m14.076-4.068a1 1 0 0 1 .242 1.393l-4.75 6.75a1 1 0 0 1-1.558.098l-2.5-2.75a1 1 0 0 1 1.48-1.346l1.66 1.827 4.032-5.73a1 1 0 0 1 1.394-.242" clip-rule="evenodd"></path></svg></div><span>More coming ...</span></div></div>
      
      </div>${hasSubscription ? `<div class="relative flex flex-col text-xs text-token-text-tertiary"><div><a class="px-2 underline" href="https://billing.stripe.com/p/login/${r.STRIPE_PORTAL_LINK_ID || '00g0237Sr78wcM03cc'}?prefilled_email=${encodeURIComponent(email)}">Manage my subscription</a></div></div>` : ''}</div></div>
      
      <div class="flex w-full items-center justify-center border-t border-token-border-medium bg-token-main-surface-primary px-8 py-6"><div class="text-sm text-token-text-primary sm:flex sm:items-center">Have any questions? <a target="_blank" class="mx-1 font-semibold underline" href="mailto:support@spchatgpt.com?subject=Superpower ChatGPT Pro Subscription">Email Us</a>${hasSubscription ? '' : ' or <a target="_blank" class="mx-1 font-semibold underline" href="https://calendly.com/ezii/20min">Book a call</a>'}</div></div></div></div></div></div></div></div></div></div>`;
      document.body.insertAdjacentHTML('beforeend', upgradeModal);
      const upgradeModalCloseButton = document.querySelector('#upgrade-modal-close-button');
      upgradeModalCloseButton.addEventListener('click', () => {
        document.querySelector('#upgrade-to-pro-modal').remove();
      });
      // if click anywhere outside the upgrade-to-pro-modal-content, but inside upgrade-to-pro-modal, close the modal
      const upgradeModalContent = document.querySelector('#upgrade-to-pro-modal-content');
      document.querySelector('#upgrade-to-pro-modal').addEventListener('click', (e) => {
        if (!isDescendant(upgradeModalContent, e.target)) {
          document.querySelector('#upgrade-to-pro-modal').remove();
        }
      });
    });
  });
}

// eslint-disable-next-line no-unused-vars
function addUpgradeOverlay(parentElement, hasSubscription) {
  const existingUpgradeToProOverlay = parentElement.querySelector('#upgrade-to-pro-overlay');
  if (existingUpgradeToProOverlay) return;
  const upgradeToProWrapper = document.createElement('div');
  upgradeToProWrapper.id = 'upgrade-to-pro-overlay';
  upgradeToProWrapper.classList = 'w-full absolute top-0 bg-black/50 dark:bg-black/80 rounded-bs-md flex justify-center items-center';
  upgradeToProWrapper.style = 'top: 56px; height: calc(100% - 56px);';
  parentElement.appendChild(upgradeToProWrapper);

  const upgradeToPro = document.createElement('button');
  upgradeToPro.id = 'upgrade-to-pro-button';
  upgradeToPro.classList = 'flex flex-wrap p-1 items-center rounded-md bg-gold hover:bg-gold-dark transition-colors duration-200 text-black cursor-pointer text-sm font-bold';
  upgradeToPro.style = 'width: 230px;';
  upgradeToPro.innerHTML = `<div class="flex w-full"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" style="width:20px; height:20px; margin-right:6px;position:relative; top:10px;" stroke="purple" fill="purple"><path d="M240.5 224H352C365.3 224 377.3 232.3 381.1 244.7C386.6 257.2 383.1 271.3 373.1 280.1L117.1 504.1C105.8 513.9 89.27 514.7 77.19 505.9C65.1 497.1 60.7 481.1 66.59 467.4L143.5 288H31.1C18.67 288 6.733 279.7 2.044 267.3C-2.645 254.8 .8944 240.7 10.93 231.9L266.9 7.918C278.2-1.92 294.7-2.669 306.8 6.114C318.9 14.9 323.3 30.87 317.4 44.61L240.5 224z"/></svg> ${translate('Upgrade to Pro')}</div><div style="font-size:10px;font-weight:400;margin-left:28px;" class="flex w-full">GPT Store, Image Gallery, Voice & more</div>`;
  upgradeToProWrapper.appendChild(upgradeToPro);
  upgradeToPro.addEventListener('click', () => {
    openUpgradeModal(hasSubscription);
  });
}

// eslint-disable-next-line no-unused-vars
function errorUpgradeConfirmation(error) {
  showConfirmDialog(`<div class="flex items-center">${translate(error.title)} <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="icon-sm ms-2" viewBox="0 0 512 512"><path d="M506.3 417l-213.3-364c-16.33-28-57.54-28-73.98 0l-213.2 364C-10.59 444.9 9.849 480 42.74 480h426.6C502.1 480 522.6 445 506.3 417zM232 168c0-13.25 10.75-24 24-24S280 154.8 280 168v128c0 13.25-10.75 24-23.1 24S232 309.3 232 296V168zM256 416c-17.36 0-31.44-14.08-31.44-31.44c0-17.36 14.07-31.44 31.44-31.44s31.44 14.08 31.44 31.44C287.4 401.9 273.4 416 256 416z"/></svg></div>`, error.message, translate('Maybe later'), translate('Upgrade to Pro'), null, () => openUpgradeModal(), 'green');
}

// eslint-disable-next-line no-unused-vars
function showDeal(deal, hasSubscription) {
  chrome.storage.local.get(['dontShowDeal', 'lastDealTimestamp', 'installDate'], ({ dontShowDeal, lastDealTimestamp, installDate }) => {
    if (dontShowDeal) {
      showReviewReminder(hasSubscription);
      return;
    }
    // only show deal after 1 hour of install
    if (installDate && Date.now() - installDate < 1000 * 60 * 60 * 1) return;

    // starting from the install date show deal for cycleInterval days, then not show for (30-cycleInterval) days, and repeat that forever
    const daysFromInstall = Math.floor((Date.now() - installDate) / (1000 * 60 * 60 * 24));
    // if daysFromInstall is inside any of those 3 weeks interval, show the review reminder
    if (daysFromInstall % 30 > deal.cycleInterval) {
      showReviewReminder(hasSubscription);
      return;
    }
    // only show review reminder every 8 hours
    if (lastDealTimestamp && Date.now() - lastDealTimestamp < 1000 * 60 * 60 * 8) {
      showReviewReminder(hasSubscription);
      return;
    }

    const daysLeftInCycle = deal.cycleInterval - (daysFromInstall % 30);

    if (daysLeftInCycle < 0) {
      showReviewReminder(hasSubscription);
      return;
    }
    // format: Jan 23
    const endDate = new Date(Date.now() + (1000 * 60 * 60 * 24 * daysLeftInCycle)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const footnote = daysLeftInCycle > 6
      ? `<span>Offer ends ${endDate}</span>`
      : daysLeftInCycle > 3
        ? `<span style="color:#e06c2b;">Only ${daysLeftInCycle} days left before deal ends</span>`
        : `<span style="color:#ef4146;">Last chance! Offer ends ${daysLeftInCycle > 0 ? `in ${daysLeftInCycle} day${daysLeftInCycle > 1 ? 's' : ''}` : 'today'}.</span>`;
    showConfirmDialog(
      `<div class="flex">${deal.icon ? deal.icon : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon-xl me-2" fill="#19c37d"><path d="M160 192C160 174.3 174.3 160 192 160C209.7 160 224 174.3 224 192C224 209.7 209.7 224 192 224C174.3 224 160 209.7 160 192zM352 320C352 337.7 337.7 352 320 352C302.3 352 288 337.7 288 320C288 302.3 302.3 288 320 288C337.7 288 352 302.3 352 320zM208.1 336.1C199.6 346.3 184.4 346.3 175 336.1C165.7 327.6 165.7 312.4 175 303L303 175C312.4 165.7 327.6 165.7 336.1 175C346.3 184.4 346.3 199.6 336.1 208.1L208.1 336.1zM344.1 43.41C377 39.1 411.6 49.59 437 74.98C462.4 100.4 472.9 134.1 468.6 167.9C494.1 188.2 512 220.1 512 256C512 291.9 494.1 323.8 468.6 344.1C472.9 377 462.4 411.6 437 437C411.6 462.4 377 472.9 344.1 468.6C323.8 494.1 291.9 512 256 512C220.1 512 188.2 494.1 167.9 468.6C134.1 472.9 100.4 462.4 74.98 437C49.6 411.6 39.1 377 43.41 344.1C17.04 323.8 0 291.9 0 256C0 220.1 17.04 188.2 43.42 167.9C39.1 134.1 49.6 100.4 74.98 74.98C100.4 49.6 134.1 39.1 167.9 43.41C188.2 17.04 220.1 0 256 0C291.9 0 323.8 17.04 344.1 43.41L344.1 43.41zM190.1 99.07L172 93.25C150.4 86.6 125.1 91.87 108.9 108.9C91.87 125.1 86.6 150.4 93.25 172L99.07 190.1L81.55 200.3C61.54 210.9 48 231.9 48 256C48 280.1 61.54 301.1 81.55 311.7L99.07 321L93.25 339.1C86.6 361.6 91.87 386 108.9 403.1C125.1 420.1 150.4 425.4 172 418.7L190.1 412.9L200.3 430.5C210.9 450.5 231.9 464 256 464C280.1 464 301.1 450.5 311.7 430.5L321 412.9L339.1 418.8C361.6 425.4 386 420.1 403.1 403.1C420.1 386 425.4 361.6 418.7 339.1L412.9 321L430.5 311.7C450.5 301.1 464 280.1 464 256C464 231.9 450.5 210.9 430.5 200.3L412.9 190.1L418.7 172C425.4 150.4 420.1 125.1 403.1 108.9C386 91.87 361.6 86.6 339.1 93.25L321 99.07L311.7 81.55C301.1 61.54 280.1 48 256 48C231.9 48 210.9 61.54 200.3 81.55L190.1 99.07z"/></svg>'} ${deal.title}${deal.title ? ':' : ''} ${deal.amount} off Superpower ChatGPT Pro</div>`,
      `Enter code <u><b>${deal.couponCode}</b></u> at checkout to get ${deal.amount} off your Superpower ChatGPT Pro Subscription.`,
      'Remind me later',
      'Claim Deal',
      () => {
        // cancel
        chrome.storage.local.set({ lastDealTimestamp: Date.now() });
      },
      () => {
        // confirm
        chrome.storage.local.set({ lastDealTimestamp: Date.now() });
        chrome.storage.local.get({ STRIPE_PAYMENT_LINK_ID: '8wM5nW6oq7y287ufZ8', STRIPE_PORTAL_LINK_ID: '00g0237Sr78wcM03cc' }, (r) => {
          chrome.storage.sync.get(['email'], ({ email }) => {
            window.open(`https://buy.stripe.com/${r.STRIPE_PAYMENT_LINK_ID || '8wM5nW6oq7y287ufZ8'}?prefilled_email=${encodeURIComponent(email)}`, '_blank');
            // &prefilled_promo_code=BLACKFRIDAY
          });
        });
      },
      'green',
      false,
      (checked) => {
        // don't show again callback
        chrome.storage.local.set({ dontShowDeal: checked, lastDealTimestamp: Date.now() });
      },
      'Don\'t show me deals again',
      footnote,
    );
  });
}
// eslint-disable-next-line no-unused-vars
const santa = '<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" id="Layer_1" x="0" y="0" style="enable-background:new 0 0 864 864" version="1.1" viewBox="0 0 864 864"><style>.st0{fill:#fff}</style><path d="M820.1 563.1c10.9-10.9 14.3-25.4 10.7-40.4-2.2-9.3-6.2-18.1-11.6-26-.2-.3-.4-.6-.6-.8-2.8-4.1-6-7.8-9.6-11.3-2.5-2.4-6.9-7.5-10.5-8 .7.1 1.5.2 2.2.4 2.6.4 6.1 1.6 8.8 1.1 3.1-.6 3.8-3.2 2.9-5.5-.9-13.2-17.1-25.9-26.8-32.9-6-4.3-18-10-28.2-10.6.6-.4 1.3-.8 1.9-1.3 1.6-1.1 1.6-3 .1-4.2-12.6-9.9-29.7-12.8-45.2-8.8-8.4 2.2-17.8 6.7-24.9 13.2l-.1-.1c1.2-1.6-.4-4.5-2.7-4-19.2 4.1-37.7 24.6-41 44-7.7-4.1-12.7-11.2-16.9-20-1.5-9.6-2-19.3-2.3-27.7-1-24.6.6-49.1-1.3-73.7-2.9-39.1-10-82.2-28.1-118-9-31-32.4-57.7-58-76.4-31.9-23.4-70.4-35.7-109-42-40.7-6.6-83.4-9.2-123.6 1.2-36.8 9.5-70.8 28.2-99.9 52.6-16.6 13.9-31.5 29.6-45 46.4-7 8.7-13.7 17.7-19.9 27-3.1 4.6-6.3 9.3-9.1 14.1-2.7 4.8-4.2 10-6.5 15-15.2-3.7-32.3 1.8-44.2 12.4-5.8 5.1-11 11.2-14.3 18.3-3.7 7.8-4.3 14.4-2 22.9 1.2 4.3 3.2 8.4 6.3 11.5-1.8 3.1-2.4 6.9-1.6 10.4-6.7 2.5-13.5 5-18.1 10.9-6.5 8.2-8.5 19.6-6.9 29.9 2.4 15.5 14.2 26.1 28.8 30.6 1.5.5 3.1.9 4.5 1.6 1.4.7 2.6 1.8 3.8 2.8 5.3 4.6 10.7 9.2 16.8 12.8 7.7 4.5 16.2 6.4 25.1 5.8 6.6-.5 13.2-2.2 19.2-5.2 1.6-.8 16.2-12.2 15.5-12.5 1.2.5 2.5.9 3.8 1.2 6.7 1.3 15.5-2.4 18.5-8.8 6.9 4.6 15.5 4 23.3 1.2 12.1-4.4 25.7-12.2 33.9-23.3 2.5 2.7 7.1 4.3 10.7 4.3 7.2 0 14.6-4.6 17.1-11.4 2 1.9 4.2 3.7 6.4 5.3 8.6 6 18.8 9.4 29.2 9.9 9.1.4 18.3-1.2 26.9-4.2 4.5-1.6 8.9-3.6 13-6.1 2.7-1.6 6.9-6.5 10.2-5.1 1.2.5 2.2 1.5 3.2 2.4 6.3 5.7 14.4 10.2 22.7 12.1 8.9 2 18 .6 26.5-2.2 4.3-1.4 6.9-2.9 11.4-1.8 3.9.9 8.1 2.5 11.4 4.9 2.8 2.1 4.6 5.2 7.3 7.4 3.3 2.7 8.3 5.4 12.3 7 10.6 4.3 23.7 5.7 34.3.5 8.6 8.7 19.7 14.8 31.7 17.4 4.4 28.9 17.8 53.5 36.4 75.9 8.9 10.7 18.8 20.8 30.6 28.1 12.5 7.7 25.3 10.6 39.7 12.4.3 0 .6.1.7.3.1.1.1.3.1.4 1.4 10.8 3.4 21.6 6.9 31.9 4.7 13.7 12.8 26.3 23.7 35.8 22.4 19.6 54.9 25.4 82.7 15.1.6-.2 1.1-.6 1.4-1.1 5.8 1.1 11.8.8 17.7-1.3 15.1-5.4 31.7-16.1 38.4-31.1v-.1c3-4.8-4.6-10.6-12.1-14 1-.1 1.9-.2 2.9-.3 14.5-2 28.4-8.2 38.4-18.2z"/><path d="M523.8 420.4c-8 2.8-16.4 2.1-23.5-2.6-4.2-2.8-7.3-6.5-8.9-11.4-.7-2-.9-3.7-1.7-5.4-.1-2.1-2.2-4.1-4.4-2.6-7.5 5-14.9 9-24.3 8.7-4.5-.2-22.8-4.4-25.1-11.6 2.9-.5 5.6-1.8 7.8-4 2.8-2.7-1.1-6.6-4.1-4.3-9 6.7-26.7-1.4-27.4-12.7 0-.5-.9-.8-1-.2-.8 3.8-.1 7.4 1.7 10.5-10.8 3.4-21.8 7.7-33.2 5.2-9.4-2.1-17-7.8-23-15-2.6-3.1 0-5.8 1.7-8.6.5-.9 1-2.1.4-2.9h-1.1c-.2 0-2.5 4.1-2.9 4.6-1.7 2-3.8 3.5-5.8 5.2-4.8 4.2-10.3 7.6-16.2 10.2-11.6 5.2-25.1 7.7-37.7 5.1-7.7-1.6-14.8-5-21.1-9.7-3.3-2.5-6.3-5.3-9.2-8.2-2.6-2.5-5.5-5.3-8.5-7.3-.2 1.8.8 3.4 1.8 5 1.9 2.9 4 5.4 3.4 9-.6 4.1-5.3 8.1-9 9.2-2.5.7-8.4.6-11.4-1.7 2.1-3.5 3.7-7.4 4.4-11.5.6-3.3-4.1-4.9-5.2-1.6-4.3 13-13.7 21.4-25.7 27.4-11.6 5.8-41 9.8-39.8-11.3 0-.8-1.2-1-1.4-.2-2.2 6.7-1.1 13.3 3.1 18.5-3.8 3.7-6.8 7.4-13 6.5-5.3-.7-10.2-5.7-12.4-10.4-.3-.6-1-.2-1.1.3-.6 4.6.9 8.8 3.7 11.9-10.1 9-22 15.6-36.1 14.3-12.8-1.2-23.6-7.8-31.4-17.6 2.7-.8 5.4-1.9 8.1-3.5 3.6-2.1 1.3-7.1-2.6-6.5-8.6 1.3-17.2 5.2-25.2-.3-6.7-4.6-10.4-12.5-11.3-20.3-1.5-12.5 4.4-30.3 16.9-35.1.9 2.4 2.3 4.7 4.6 6.6 1.1.9 2.7-.1 2.1-1.5-4.9-10-2.3-19.3 8.2-23.5 2.9-1.2.9-5.7-2-5-3.5.9-6.5 2.8-8.8 5.4-2.8-6.7-5.4-13.9-4.4-21.2 1.4-10.2 9.2-18.8 16.9-25 8.1-6.6 18.2-10.3 28.7-9.5 7.3.6 21.3 3.7 24.4 11.4 1.9 4.6 2.1 8.4 6 12 .8.7 1.9-.1 1.4-1.1-6.1-13.4 11.5-28.9 22.7-32 13.1-3.6 20.6 3.8 30.1 10.9 1.7 1.3 4.4-.7 3.8-2.8-1-3.3-2.8-6-5-8.3 11.5-17.1 40-15.1 56-5.8-.8 3.2-.9 6.4.2 9.3.4 1.1 1.8 1.4 2.5.4 2.2-3.2 2.5-6.8 3.9-10.3 2-4.9 5-9.5 8.7-13.4 7.2-7.5 16.9-11.9 27.1-13.6 18.4-2.9 44.1 3 49.6 23.5 0 .1.1.2.1.3-1.4 1.6-2.1 3.4-1.3 5.6 0 .1.1.2.2.2 3.7.1 7.1-3.4 10.7-4.2 6.2-1.5 11.1 1.8 15.2 6 2.4 2.4 6.4-.5 4.8-3.5-2.2-4.1-6.1-7.1-10.5-8.5 11.9-12.7 31.7-16.8 48.5-12.9 17.9 4.1 28 16.1 34.5 32.3-2.3.7-4.6 2-6.6 3.9-1.4 1.3.2 3.3 1.6 3 6-.7 10.9-2.3 16.9.1 5.4 2.2 8.7 6.3 11.2 11.4 1.4 2.9 6.5 1 5.4-2.1-.8-2.2-2-4.4-3.6-6.4l.3-.3c7.1-10 23-11.5 34.1-8.3 11.4 3.4 19.5 12.3 21.7 23.9 0 .2.1.4.2.5-1.8 1.2-3.2 3-3.8 5.5-.1.2.1.4.3.4 2.8-.5 5.4-2 8.2-2.6 4.7-1 9.4.3 13.3 3 7 4.9 9.5 12.8 5.6 20.6-1.1 2.1 1.6 4.8 3.5 2.8 2.7-2.7 4-6 4.3-9.3 8.5-.5 16.2.7 22.1 8 1.6 2 3 4.3 4 6.7 0 .1 0 .3.1.4 2.5 5.9 2.2 11.4-1.9 16.4-.1.1-.2.3-.2.4-2.9.7-2.7 5.1.6 5.5 18.2 2 25.9 16.7 21.1 33.8-3.7 13.2-13.7 19.3-25.2 24.7-.8-1.9-1.9-3.8-3.3-5.6-.9-1.2-2.7.3-2.1 1.5 7.9 16.1-4.1 32.8-20.2 36.1-12.5 2.6-29.7-4.4-31.2-16.9.4-.8.3-1.8-.1-2.7.2-2.5.9-5.2 2.5-8.1.4-.8-.6-1.8-1.3-1.1-2.4 2.5-3.8 5.1-4.7 7.9z" class="st0"/><path d="M598.3 533.5c9.4-1 18.3-7.2 24-14.7.1-.1-.1-.2-.1-.2-9.4 6.6-22.4 14.5-34.1 9.2-2.7-1.2-5.1-3-7.4-4.8-10-8-19.1-16.2-27.4-26.1-9.6-11.4-17.5-23.7-23.2-37.3 5.7 4.9 12.9 7.7 20.5 6 .2 0 .2-.3 0-.4-9.4-3.7-17.9-7.7-24.1-15.2-.2-.6-.4-1.2-.6-1.9-1-3.2-1.8-6.8-1.6-10.2 0-.3.1-.6.2-.9.6-.8 1.9 0 2.5.8 3.1 3.9 6.2 7.9 11.1 9.2 5.7 1.6 11.6 2.5 17.5 1.8 9.7-1.1 19.1-6.4 24.9-14.3 2.6-3.6 4.9-8.3 5.2-12.9.2-3.4.6-7.8 4.1-9.6 2.9-1.5 6.3-1.3 9.4-3.1 5.2-3.1 9-8 11.6-13.4 5.2-11 6-25.1.7-36.2-3.1-6.4-8.4-11.5-15.4-13.4 5.8-7.3-.3-22.7-5-28.7-3.3-4.1-8.1-4.9-9.9-10.3-1.2-3.7-2.3-11-1.6-14.7 2.3-12.3 2.1-25.9-.7-38.4-1-11.3-5.2-22.2-13.4-29.6-.3-.2-.7 0-.6.3 1.9 7.4 8.3 17.6 6.1 25.3-.1.3-.2.6-.4.8-.4.5-1.1.5-1.7.3-.6-.2-1-.7-1.4-1.2-3.1-3.7-4.5-9.7-6.8-14.1-2.5-4.9-5.2-9.6-8.2-14.2-5.9-9-12.9-17.3-20.9-24.5-.3-.3-.9.1-.6.5 1.3 1.9 2.6 3.8 3.8 5.7 8.7 15.5 17.3 31 22.5 48.1 1.6 5.2 2.7 10.3 1.5 15.7-.1.6-.3 1.2-.7 1.6-.5.5-1.4.6-2.1.4-.7-.2-1.3-.7-1.9-1.1-6.8-5.3-12.1-12-18.9-17.3-6.6-5.2-13.7-9.8-21.2-13.7-.9-.5-1.9-1-2.9-.7 0 .9.9 1.6 1.7 2.1 6.4 4.6 11 10.7 16.6 16 7.4 8 15.5 17.5 17.5 28.5.3 1.6.3 3.6-1 4.6-.4.3-.9.5-1.4.6-4.4 1-7.4-2.1-9.1-5.6-1.8-3.6-3.7-7-6.5-10-5.6-6-13.3-9.9-21.4-11.3-11-1.9-30.3-.2-35.3 12-4.5-3.9-10.2-6.6-15.8-6.7-2.4-19.4-21.3-34.5-39.6-38.1-16.9-3.4-44.6.1-51.8 18.8-1.7-.3-3.4-.3-5.2-.1-1.5.2-3.6.8-5.6 1.7-7-21.3-32.6-28.7-53.1-26.4-11.9 1.3-23.4 6.1-32 14.5-3.4 3.3-7.4 8.3-10 13.6-10.8-7-24.5-8.5-36.9-6-9.5 1.9-20.2 6.2-23.3 15.6-9.4-7.4-24.7-8.1-34.9-3.2-7.2 3.5-16 11.2-19.6 19.6-3.7-3.7-7.8-6.4-12.1-8.3.3-.6.6-1.5 1.1-2.4 5.6-9.3 10.3-19.5 17.5-27.5 7.4-8.3 18.3-13.7 28-19 19.7-10.8 40.6-18.2 62.2-24.5.1 0 0-.1 0-.1-23.2 3.7-45.9 12-66.9 22.6-5.5 2.8-11.2 5.8-16.5 9.4l1.5-2.1c11.2-15.3 23.8-29.7 37.5-42.9 13.7-13.1 28.6-25.6 45.4-34.5 18.9-10 39.8-17.9 61.1-19.2 15.7-1 30.9 1 46 5.2 1.1.3 1.6-1.3.5-1.7-15.3-5.4-31.7-8-47.9-7.6-7 .2-14 1.1-20.8 2.7 3.4-1.4 6.8-2.7 10.3-3.9 37.3-12.9 75.8-13.6 114.8-9.5 39.6 4.1 79.7 13.4 114.3 33.8 34.1 20.1 58.5 49.2 72.6 86 .2.4.4.8.7 1.1 5.5 17.2 11.4 34.2 15.5 51.8 6.1 25.7 9.5 52 10.3 78.4.3 9.7.1 19.4.1 29.1-.1 9.4-.9 19.4.4 28.7 1.9 13.2-4.3 26.8-15.3 34.2-.1 0 0 .2.1.2 6.9-2.5 13.1-7.9 16.8-14.5 1.7 13.9 4.4 27.5 13.8 38.5 3.1 3.6 6.9 6.7 11.4 8.1-.2-1.4-1.3-2.4-2.3-3.5-3.5-3.5-5.9-8-8.1-12.4-.5-.9-.9-1.9-.5-2.8.9-2.4 3.4 1.1 4.3 1.7 2.3 1.6 5.1 2.6 7.8 3.3 5.3 1.5 11 1.8 16.4 2.7 20.8 3.3 11.7 32.8 1.8 42.6-10.4 10.3-26.5 16-40.8 17.6-9.8 1.1-18.7-.6-27.1-4.1z" style="fill:#be1622"/><path d="M814.8 501.4c-3.5-5.5-7.6-10.5-12-15.4-2.2-2.5-4.6-5-6.9-7.4-.9-.9-5.1-6.5-6.1-6.5 2.5-.2 5.1-.2 7.6.1 2 .3 4.2.7 6.1-.1.3-.1.6-.3.7-.6.1-.2 0-.5-.1-.7-3.8-10.6-14.6-19.7-23.4-26-5.8-4.1-12.2-7.3-19.2-9-1.4-.3-17.4-1-13.1-5.1.4-.4 5.4-5.1 5.7-5-12-7.3-26-9.4-39.8-5.3-6.6 2-12.4 5.7-17.7 9.9-4.1 3.2-9.7 10.3-15 11.2-.4.1-1 0-1.2-.3-.1-.2-.1-.4-.1-.6.3-3.4 1.1-6.8 2.7-9.7-9.6 4.9-17.4 11.1-23.6 20.6-2.9 4.5-5.1 9.3-7.4 14.2-.4.9-.9 2.6-1.8 4 2.4.8 5 1.3 7.9 1.6 10.5.9 18.3 3.1 22.6 13.7 8.1 19.9-7.2 40.1-23.8 49.6-9.1 5.2-19.1 8.7-29.3 10 1.2 2.7.9 5.8 1.1 8.8.5 6.9 1.5 13.8 3.6 20.4 4 12.8 11.2 24.6 21 33.8 9.9 9.4 22.5 15.6 35.9 18.4 6.6 1.4 13.4 1.9 20.2 1.6 3.2-.1 9.6.3 12-2 .1-.1.3-.3.3-.5s-.2-.5-.3-.6c-3-3.1-7-5.1-9.2-8.9.2-.9 1.5-.8 2.4-.5 9.2 3.4 18.2 7.1 28.2 7.3 4.2.1 8.1-1.1 11.9-2.8 12.7-5.5 23-13.3 31.2-24.2-.1-.6.1-1.3.7-1.7 1.9-1.5-16.1-13.5-17.3-14.2-.5-.3-1.1-.9-.8-1.4 6.5 1.3 13-1.7 19.1-3.4 6.2-1.8 12.3-3.8 17.9-7.1.5-.3 1-.7 1.6-1 7.5-7.4 14.3-16.2 16.9-26.3 3.5-13-2.2-27.9-9.2-38.9zm-26 41.8c-1.9 4.2-4.4 7.6-7.7 10.6 5.6 3.6-.5 11.6-5 14.6-7.1 4.9-15.2 8.4-23.2 11.5-4 1.6-8.3 3.8-12.7 4.6 1.4 1.2 2.5 2.6 3.1 4.4.2.6-.1 1.2-.5 1.7-5.2 5.4-16 6.9-23.2 7.2-8.2.4-15.7-1.4-23.1-4.4.1 1.4-.2 2.8-1.6 3.8-2.7 2.1-6.3.4-8.9-.9-3.3-1.6-6.4-4.2-9.2-6.6-1.6-1.4-3.1-2.8-4.6-4.2-2.9-2.8-5.6-5.8-7.9-9.1-1-1.4-2-2.9-2.9-4.5-.4-.7-2.6-3.9-2-4.5.3-.3.8-.2 1.1.1 4.1 4.6 8.3 9.4 12.8 13.7 4.8 4.5 10.1 8.6 16.1 11.4.6.3 1.4.6 1.9.2.4-.3.5-.7.6-1.2.2-1 .2-2 .1-3 0-.3 0-.7.3-.8.1 0 .2 0 .3.1 3.9 1.5 7.6 3.4 11.6 4.5 4.1 1.1 8.4 1.7 12.6 1.7 4.2 0 8.4-.4 12.5-1.4 2.9-.7 15-3.6 5.1-8.1-1.5-.7-1.5-3.2.5-3.2 7.9.4 17.7-5 24.8-8.2 2.8-1.2 5.5-2.6 8.2-4 1.4-.8 18-11.3 9.4-13.4-1.6-.4-1.4-2.4-.3-3.2 4.1-3 6.8-6.5 9.3-10.8.7-1.1 3.1-.1 2.5 1.4z" class="st0"/></svg>';
