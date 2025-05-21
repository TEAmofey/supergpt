/* global promptManagerModalContent, promptManagerModalActions, conversationManagerModalContent, conversationManagerModalActions, createModal, selectedPromptFolderBreadcrumb, noteListModalContent, fetchNotes, showManagerSidebarSettingsMenu, closeMenus, createReleaseNoteModal, newsletterListModalContent, loadNewsletterList, animatePing, addImageGalleryEventListeners, loadImageList, createImageGallery, buttonGenerator, createSettingsModal, openUpgradeModal, renderGizmoDiscoveryPage, gizmoManagerModalActions, createTooltip, customInstructionProfileManagerModalContent, customInstructionProfileManagerModalActions, pinnedMessageManagerModalContent, fetchPinnedMessages, fetchCustomInstructionProfiles, selectedConversationFolderBreadcrumb, closeModals, translate, addDropdownEventListener, conversationsSortByList, fetchConversations, profilesSortByList, notesSortByList, promptsSortByList, fetchPrompts, languageList */
let managerModalCurrentTab = 'prompts';
chrome.storage.local.get(['managerModalCurrentTab'], (result) => {
  managerModalCurrentTab = result.managerModalCurrentTab || 'prompts';
});
const managerTabList = [
  {
    code: 'conversations', name: 'Conversations manager', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="icon-lg" viewBox="0 0 512 512" fill="currentColor"><path d="M360 144h-208C138.8 144 128 154.8 128 168S138.8 192 152 192h208C373.3 192 384 181.3 384 168S373.3 144 360 144zM264 240h-112C138.8 240 128 250.8 128 264S138.8 288 152 288h112C277.3 288 288 277.3 288 264S277.3 240 264 240zM447.1 0h-384c-35.25 0-64 28.75-64 63.1v287.1c0 35.25 28.75 63.1 64 63.1h96v83.1c0 9.836 11.02 15.55 19.12 9.7l124.9-93.7h144c35.25 0 64-28.75 64-63.1V63.1C511.1 28.75 483.2 0 447.1 0zM464 352c0 8.75-7.25 16-16 16h-160l-80 60v-60H64c-8.75 0-16-7.25-16-16V64c0-8.75 7.25-16 16-16h384c8.75 0 16 7.25 16 16V352z"/></svg>', keyboard: ['⌘', 'Shift', 'X'],
  },

  {
    code: 'prompts', name: 'Prompts manager', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="icon-lg" viewBox="0 0 512 512" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="0" fill="currentColor"><path d="M72 48C85.25 48 96 58.75 96 72V120C96 133.3 85.25 144 72 144V232H128C128 218.7 138.7 208 152 208H200C213.3 208 224 218.7 224 232V280C224 293.3 213.3 304 200 304H152C138.7 304 128 293.3 128 280H72V384C72 388.4 75.58 392 80 392H128C128 378.7 138.7 368 152 368H200C213.3 368 224 378.7 224 392V440C224 453.3 213.3 464 200 464H152C138.7 464 128 453.3 128 440H80C49.07 440 24 414.9 24 384V144C10.75 144 0 133.3 0 120V72C0 58.75 10.75 48 24 48H72zM160 96C160 82.75 170.7 72 184 72H488C501.3 72 512 82.75 512 96C512 109.3 501.3 120 488 120H184C170.7 120 160 109.3 160 96zM288 256C288 242.7 298.7 232 312 232H488C501.3 232 512 242.7 512 256C512 269.3 501.3 280 488 280H312C298.7 280 288 269.3 288 256zM288 416C288 402.7 298.7 392 312 392H488C501.3 392 512 402.7 512 416C512 429.3 501.3 440 488 440H312C298.7 440 288 429.3 288 416z"/></svg>', keyboard: ['⌘', 'Shift', 'P'],
  },

  {
    code: 'gallery', name: 'Image gallery', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon-lg" fill="currentColor"><path d="M152 120c-26.51 0-48 21.49-48 48s21.49 48 48 48s48-21.49 48-48S178.5 120 152 120zM447.1 32h-384C28.65 32-.0091 60.65-.0091 96v320c0 35.35 28.65 64 63.1 64h384c35.35 0 64-28.65 64-64V96C511.1 60.65 483.3 32 447.1 32zM463.1 409.3l-136.8-185.9C323.8 218.8 318.1 216 312 216c-6.113 0-11.82 2.768-15.21 7.379l-106.6 144.1l-37.09-46.1c-3.441-4.279-8.934-6.809-14.77-6.809c-5.842 0-11.33 2.529-14.78 6.809l-75.52 93.81c0-.0293 0 .0293 0 0L47.99 96c0-8.822 7.178-16 16-16h384c8.822 0 16 7.178 16 16V409.3z"/></svg>', keyboard: ['⌘', 'Shift', 'Y'],
  },

  {
    code: 'gpts', name: 'GPT Store', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-lg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.75 4.5C5.50736 4.5 4.5 5.50736 4.5 6.75C4.5 7.99264 5.50736 9 6.75 9C7.99264 9 9 7.99264 9 6.75C9 5.50736 7.99264 4.5 6.75 4.5ZM2.5 6.75C2.5 4.40279 4.40279 2.5 6.75 2.5C9.09721 2.5 11 4.40279 11 6.75C11 9.09721 9.09721 11 6.75 11C4.40279 11 2.5 9.09721 2.5 6.75Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M17.25 4.5C16.0074 4.5 15 5.50736 15 6.75C15 7.99264 16.0074 9 17.25 9C18.4926 9 19.5 7.99264 19.5 6.75C19.5 5.50736 18.4926 4.5 17.25 4.5ZM13 6.75C13 4.40279 14.9028 2.5 17.25 2.5C19.5972 2.5 21.5 4.40279 21.5 6.75C21.5 9.09721 19.5972 11 17.25 11C14.9028 11 13 9.09721 13 6.75Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M6.75 15C5.50736 15 4.5 16.0074 4.5 17.25C4.5 18.4926 5.50736 19.5 6.75 19.5C7.99264 19.5 9 18.4926 9 17.25C9 16.0074 7.99264 15 6.75 15ZM2.5 17.25C2.5 14.9028 4.40279 13 6.75 13C9.09721 13 11 14.9028 11 17.25C11 19.5972 9.09721 21.5 6.75 21.5C4.40279 21.5 2.5 19.5972 2.5 17.25Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M17.25 15C16.0074 15 15 16.0074 15 17.25C15 18.4926 16.0074 19.5 17.25 19.5C18.4926 19.5 19.5 18.4926 19.5 17.25C19.5 16.0074 18.4926 15 17.25 15ZM13 17.25C13 14.9028 14.9028 13 17.25 13C19.5972 13 21.5 14.9028 21.5 17.25C21.5 19.5972 19.5972 21.5 17.25 21.5C14.9028 21.5 13 19.5972 13 17.25Z" fill="currentColor"></path></svg>', keyboard: ['⌘', 'Shift', 'F'],
  },

  {
    code: 'notes', name: 'Notes', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="icon-lg" fill="currentColor"><path d="M320 480l128-128h-128V480zM400 31.1h-352c-26.51 0-48 21.49-48 48v352C0 458.5 21.49 480 48 480H288l.0039-128c0-17.67 14.33-32 32-32H448v-240C448 53.49 426.5 31.1 400 31.1z"/></svg>', keyboard: ['⌘', 'Shift', 'E'],
  },

  {
    code: 'custom-instruction-profiles', name: 'Custom instruction profiles', icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="icon-xl" style="position:relative;left:-2px;"><path d="M10.663 6.3872C10.8152 6.29068 11 6.40984 11 6.59007V8C11 8.55229 11.4477 9 12 9C12.5523 9 13 8.55229 13 8V6.59007C13 6.40984 13.1848 6.29068 13.337 6.3872C14.036 6.83047 14.5 7.61105 14.5 8.5C14.5 9.53284 13.8737 10.4194 12.9801 10.8006C12.9932 10.865 13 10.9317 13 11V13C13 13.5523 12.5523 14 12 14C11.4477 14 11 13.5523 11 13V11C11 10.9317 11.0068 10.865 11.0199 10.8006C10.1263 10.4194 9.5 9.53284 9.5 8.5C9.5 7.61105 9.96397 6.83047 10.663 6.3872Z" fill="currentColor"></path><path d="M17.9754 4.01031C17.8588 4.00078 17.6965 4.00001 17.4 4.00001H9.8C8.94342 4.00001 8.36113 4.00078 7.91104 4.03756C7.47262 4.07338 7.24842 4.1383 7.09202 4.21799C6.7157 4.40974 6.40973 4.7157 6.21799 5.09202C6.1383 5.24842 6.07337 5.47263 6.03755 5.91104C6.00078 6.36113 6 6.94343 6 7.80001V16.1707C6.31278 16.0602 6.64937 16 7 16H18L18 4.60001C18 4.30348 17.9992 4.14122 17.9897 4.02464C17.9893 4.02 17.9889 4.0156 17.9886 4.01145C17.9844 4.01107 17.98 4.01069 17.9754 4.01031ZM17.657 18H7C6.44772 18 6 18.4477 6 19C6 19.5523 6.44772 20 7 20H17.657C17.5343 19.3301 17.5343 18.6699 17.657 18ZM4 19L4 7.75871C3.99999 6.95374 3.99998 6.28937 4.04419 5.74818C4.09012 5.18608 4.18868 4.66938 4.43597 4.18404C4.81947 3.43139 5.43139 2.81947 6.18404 2.43598C6.66937 2.18869 7.18608 2.09012 7.74818 2.0442C8.28937 1.99998 8.95373 1.99999 9.7587 2L17.4319 2C17.6843 1.99997 17.9301 1.99994 18.1382 2.01695C18.3668 2.03563 18.6366 2.07969 18.908 2.21799C19.2843 2.40974 19.5903 2.7157 19.782 3.09203C19.9203 3.36345 19.9644 3.63318 19.9831 3.86178C20.0001 4.06994 20 4.31574 20 4.56812L20 17C20 17.1325 19.9736 17.2638 19.9225 17.386C19.4458 18.5253 19.4458 19.4747 19.9225 20.614C20.0517 20.9227 20.0179 21.2755 19.8325 21.5541C19.6471 21.8326 19.3346 22 19 22H7C5.34315 22 4 20.6569 4 19Z" fill="currentColor"></path></svg>', keyboard: ['⌘', 'Shift', 'I'],
  },

  {
    code: 'pinned-messages', name: 'Pinned messages', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor" class="icon-lg"><path d="M336 0h-288C21.49 0 0 21.49 0 48v431.9c0 24.7 26.79 40.08 48.12 27.64L192 423.6l143.9 83.93C357.2 519.1 384 504.6 384 479.9V48C384 21.49 362.5 0 336 0zM336 452L192 368l-144 84V54C48 50.63 50.63 48 53.1 48h276C333.4 48 336 50.63 336 54V452z"/></svg>', keyboard: ['⌘', 'Shift', 'M'],
  },

  // {
  //   code: 'analytics', name: 'Analytics', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" class="icon-lg"><path d="M339.1 216.1C328.6 226.1 312.5 226.4 300.8 217.6L192.6 136.5L51.99 248.1C38.19 260 18.05 257.8 7.013 243.1C-4.028 230.2-1.79 210.1 12.01 199L172 71.01C183.4 61.9 199.5 61.65 211.2 70.4L319.4 151.5L460 39.01C473.8 27.97 493.9 30.21 504.1 44.01C516 57.81 513.8 77.95 499.1 88.99L339.1 216.1zM160 256C160 238.3 174.3 224 192 224C209.7 224 224 238.3 224 256V448C224 465.7 209.7 480 192 480C174.3 480 160 465.7 160 448V256zM32 352C32 334.3 46.33 320 64 320C81.67 320 96 334.3 96 352V448C96 465.7 81.67 480 64 480C46.33 480 32 465.7 32 448V352zM352 320V448C352 465.7 337.7 480 320 480C302.3 480 288 465.7 288 448V320C288 302.3 302.3 288 320 288C337.7 288 352 302.3 352 320zM416 256C416 238.3 430.3 224 448 224C465.7 224 480 238.3 480 256V448C480 465.7 465.7 480 448 480C430.3 480 416 465.7 416 448V256z"/></svg>', keyboard: ['⌘', 'Shift', ','],
  // },

  {
    code: 'newsletters', name: 'Newsletters', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon-lg" fill="currentColor"><path d="M456 32h-304C121.1 32 96 57.13 96 88v320c0 13.22-10.77 24-24 24S48 421.2 48 408V112c0-13.25-10.75-24-24-24S0 98.75 0 112v296C0 447.7 32.3 480 72 480h352c48.53 0 88-39.47 88-88v-304C512 57.13 486.9 32 456 32zM464 392c0 22.06-17.94 40-40 40H139.9C142.5 424.5 144 416.4 144 408v-320c0-4.406 3.594-8 8-8h304c4.406 0 8 3.594 8 8V392zM264 272h-64C186.8 272 176 282.8 176 296S186.8 320 200 320h64C277.3 320 288 309.3 288 296S277.3 272 264 272zM408 272h-64C330.8 272 320 282.8 320 296S330.8 320 344 320h64c13.25 0 24-10.75 24-24S421.3 272 408 272zM264 352h-64c-13.25 0-24 10.75-24 24s10.75 24 24 24h64c13.25 0 24-10.75 24-24S277.3 352 264 352zM408 352h-64C330.8 352 320 362.8 320 376s10.75 24 24 24h64c13.25 0 24-10.75 24-24S421.3 352 408 352zM400 112h-192c-17.67 0-32 14.33-32 32v64c0 17.67 14.33 32 32 32h192c17.67 0 32-14.33 32-32v-64C432 126.3 417.7 112 400 112z"/></svg>', keyboard: ['⌘', 'Shift', 'L'],
  },
  {
    code: 'settings', name: 'Settings', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="icon-lg" fill="currentColor" viewBox="0 0 512 512"><path d="M495.9 166.6C499.2 175.2 496.4 184.9 489.6 191.2L446.3 230.6C447.4 238.9 448 247.4 448 256C448 264.6 447.4 273.1 446.3 281.4L489.6 320.8C496.4 327.1 499.2 336.8 495.9 345.4C491.5 357.3 486.2 368.8 480.2 379.7L475.5 387.8C468.9 398.8 461.5 409.2 453.4 419.1C447.4 426.2 437.7 428.7 428.9 425.9L373.2 408.1C359.8 418.4 344.1 427 329.2 433.6L316.7 490.7C314.7 499.7 307.7 506.1 298.5 508.5C284.7 510.8 270.5 512 255.1 512C241.5 512 227.3 510.8 213.5 508.5C204.3 506.1 197.3 499.7 195.3 490.7L182.8 433.6C167 427 152.2 418.4 138.8 408.1L83.14 425.9C74.3 428.7 64.55 426.2 58.63 419.1C50.52 409.2 43.12 398.8 36.52 387.8L31.84 379.7C25.77 368.8 20.49 357.3 16.06 345.4C12.82 336.8 15.55 327.1 22.41 320.8L65.67 281.4C64.57 273.1 64 264.6 64 256C64 247.4 64.57 238.9 65.67 230.6L22.41 191.2C15.55 184.9 12.82 175.3 16.06 166.6C20.49 154.7 25.78 143.2 31.84 132.3L36.51 124.2C43.12 113.2 50.52 102.8 58.63 92.95C64.55 85.8 74.3 83.32 83.14 86.14L138.8 103.9C152.2 93.56 167 84.96 182.8 78.43L195.3 21.33C197.3 12.25 204.3 5.04 213.5 3.51C227.3 1.201 241.5 0 256 0C270.5 0 284.7 1.201 298.5 3.51C307.7 5.04 314.7 12.25 316.7 21.33L329.2 78.43C344.1 84.96 359.8 93.56 373.2 103.9L428.9 86.14C437.7 83.32 447.4 85.8 453.4 92.95C461.5 102.8 468.9 113.2 475.5 124.2L480.2 132.3C486.2 143.2 491.5 154.7 495.9 166.6V166.6zM256 336C300.2 336 336 300.2 336 255.1C336 211.8 300.2 175.1 256 175.1C211.8 175.1 176 211.8 176 255.1C176 300.2 211.8 336 256 336z"/></svg>', keyboard: ['⌘', 'Shift', '.'],
  },
];
const upgradeButton = {
  code: 'upgrade',
  name: 'Upgrade',
  icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="icon-lg" fill="#ef4146"><path d="M80 192V144C80 64.47 144.5 0 224 0C303.5 0 368 64.47 368 144V192H384C419.3 192 448 220.7 448 256V448C448 483.3 419.3 512 384 512H64C28.65 512 0 483.3 0 448V256C0 220.7 28.65 192 64 192H80zM144 192H304V144C304 99.82 268.2 64 224 64C179.8 64 144 99.82 144 144V192z"/></svg>',
};
function selectedManagerTabTitle(selectedTab) {
  switch (selectedTab) {
    case 'conversations':
      return 'Conversations manager';
    case 'prompts':
      return 'Prompts manager';
    case 'gallery':
      return 'Image gallery';
    case 'notes':
      return 'Notes';
    case 'custom-instruction-profiles':
      return 'Custom instruction profiles';
    case 'gpts':
      return 'GPT Store';
    case 'pinned-messages':
      return 'Pinned messages';
    case 'newsletters':
      return 'What\'s happening in the world of AI';
    default:
      return 'Prompts manager';
  }
}
function selectedManagerTabSubtitle(selectedTab) {
  switch (selectedTab) {
    case 'conversations':
      return 'Organize all your conversations in one place  <a href="https://www.youtube.com/watch?v=cfp0df9gSJcT" target="_blank" class="underline" rel="noreferrer">Learn more</a>';
    case 'prompts':
      return 'Create and manage all your prompts in one place  <a href="https://www.youtube.com/watch?v=cfp0df9gSJcT" target="_blank" class="underline" rel="noreferrer">Learn more</a>';
    case 'gallery':
      return 'Manage all your images in one place  <a href="https://www.youtube.com/watch?v=cfp0df9gSJcT" target="_blank" class="underline" rel="noreferrer">Learn more</a>';
    case 'notes':
      return 'All of your notes in one place  <a href="https://www.youtube.com/watch?v=JjBuaNtvTv4" target="_blank" class="underline" rel="noreferrer">Learn more</a>';
    case 'custom-instruction-profiles':
      return 'Create and manage all your custom instruction profiles in one place  <a href="https://help.openai.com/en/articles/8096356-custom-instructions-for-chatgpt" target="_blank" class="underline" rel="noreferrer">Learn more</a>';
    case 'gpts':
      return 'Enhanced GPT Store with full list of GPTs  <a href="https://youtu.be/vrC0FAeUi1E?si=zDDUNL2UVPCxcUbd" target="_blank" class="underline" rel="noreferrer">Learn more</a>';
    case 'pinned-messages':
      return 'Manage all your pinned messages in one place  <a href="https://www.youtube.com/watch?v=cfp0df9gSJcT" target="_blank" class="underline" rel="noreferrer">Learn more</a>';
    case 'newsletters':
      return 'You can find all of our previous newsletters here (<a href="https://superpowerdaily.com" target="_blank" rel="noopener noreferrer" class="underline">Read Online</a>)';
    default:
      return 'Create and manage all your prompts in one place  <a href="https://www.youtube.com/watch?v=ha2AiwOglt4&ab_channel=Superpower" target="_blank" class="underline" rel="noreferrer">Learn more</a>';
  }
}
function selectedManagerTabContent(selectedTab) {
  switch (selectedTab) {
    case 'conversations':
      return conversationManagerModalContent();
    case 'prompts':
      return promptManagerModalContent();
    case 'newsletters':
      return newsletterListModalContent();
    case 'notes':
      return noteListModalContent();
    case 'custom-instruction-profiles':
      return customInstructionProfileManagerModalContent();
    case 'gpts':
      return renderGizmoDiscoveryPage();
    case 'pinned-messages':
      return pinnedMessageManagerModalContent();
    case 'gallery':
      return createImageGallery();
    default:
      return promptManagerModalContent();
  }
}
function selectedManagerTabAction(selectedTab) {
  switch (selectedTab) {
    case 'prompts':
      return promptManagerModalActions();
    case 'conversations':
      return conversationManagerModalActions();
    case 'custom-instruction-profiles':
      return customInstructionProfileManagerModalActions();
    case 'gpts':
      return gizmoManagerModalActions();
    default:
      return noTabActions();
  }
}
function noTabActions() {
  const actionsBar = document.createElement('div');
  return actionsBar;
}
function createManagerSideTab(selectedTab) {
  const tabContainer = document.createElement('div');
  tabContainer.id = 'modal-manager-side-tab';
  tabContainer.classList = 'flex flex-col items-start justify-start h-full pt-4';
  tabContainer.style = 'z-index: 100000;';
  // add upgrade button bfore settings in managertablist array
  const managerTabListWithUpgrade = [...managerTabList];
  managerTabListWithUpgrade.splice(managerTabList.length - 1, 0, upgradeButton);

  managerTabListWithUpgrade.forEach((tab) => {
    const tabElement = document.createElement('div');
    tabElement.id = `modal-manager-side-tab-${tab.code}`;
    tabElement.classList = 'flex items-start gap-1.5 relative mb-2';
    if (tab.code === 'upgrade') {
      tabElement.classList.add('hidden');
      tabElement.classList.add('mt-auto');
    }
    if (tab.code === 'settings') {
      tabElement.classList.add('mt-auto');
    }
    const tabIndicator = document.createElement('div');
    tabIndicator.classList = `w-1.5 h-11 rounded-e-xl ${selectedTab === tab.code ? 'bg-black dark:bg-white' : ''}`;
    tabElement.appendChild(tabIndicator);
    const tabButton = document.createElement('button');
    tabButton.classList = `flex items-center gap-1.5 rounded-md p-2 m-auto text-token-text-${selectedTab === tab.code ? 'primary' : 'tertiary'} hover:text-token-text-primary rounded-lg bg-token-sidebar-surface-secondary cursor-pointer`;
    tabButton.innerHTML = tab.icon;
    tabButton.addEventListener('click', async (e) => {
      if (tab.code === 'settings') {
        e.stopPropagation();
        e.preventDefault();
        closeMenus();
        const hasSubscription = await chrome.runtime.sendMessage({
          type: 'checkHasSubscription',
        });
        const showSyncStatus = e.shiftKey && e.altKey;
        if (showSyncStatus) {
          chrome.runtime.sendMessage({
            type: 'clearAllCache',
            forceRefresh: true,
          });
        }
        showManagerSidebarSettingsMenu(tabButton, hasSubscription, showSyncStatus);
        return;
      }
      if (tab.code === 'upgrade') {
        e.stopPropagation();
        e.preventDefault();
        openUpgradeModal();
        return;
      }
      const curModalWrapper = document.querySelector('[id="modal-wrapper-manager"]');
      const defaultFullscreen = curModalWrapper.style.width === '100vw' && curModalWrapper.style.height === '100vh';
      createManager(tab.code, defaultFullscreen);
    });
    tabElement.appendChild(tabButton);
    // add a tooltip on hover on the right side of the tab
    createTooltip(tabElement, `<div class="me-2">${translate(tab.code)}</div><div claass="text-token-text-tertiary ms-2">${buttonGenerator(tab?.keyboard || [], 'xs')}</div>`, 'transform: translate(105%, 10%);');

    tabContainer.appendChild(tabElement);
  });
  const versionNumber = document.createElement('div');
  versionNumber.classList = 'w-full flex items-center justify-center cursor-pointer';
  chrome.runtime.sendMessage({
    type: 'checkHasSubscription',
  }, (hasSubscription) => {
    if (!hasSubscription) {
      // remove hidden class from upgrade button
      const upgradeTab = document.querySelector('#modal-manager-side-tab-upgrade');
      upgradeTab?.classList.remove('hidden');
      // remove mt-auto from settings button
      const settingsTab = document.querySelector('#modal-manager-side-tab-settings');
      settingsTab?.classList.remove('mt-auto');
    }
    versionNumber.innerHTML = `<span class="flex items-center text-xs text-token-text-tertiary mb-1 ms-1">v${chrome.runtime.getManifest().version} <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="ms-1 icon-xs" stroke="currentColor" fill="${hasSubscription ? 'gold' : 'currentColor'}"><path d="M240.5 224H352C365.3 224 377.3 232.3 381.1 244.7C386.6 257.2 383.1 271.3 373.1 280.1L117.1 504.1C105.8 513.9 89.27 514.7 77.19 505.9C65.1 497.1 60.7 481.1 66.59 467.4L143.5 288H31.1C18.67 288 6.733 279.7 2.044 267.3C-2.645 254.8 .8944 240.7 10.93 231.9L266.9 7.918C278.2-1.92 294.7-2.669 306.8 6.114C318.9 14.9 323.3 30.87 317.4 44.61L240.5 224z"/></svg></span>`;
  });
  versionNumber.addEventListener('click', () => {
    const { version } = chrome.runtime.getManifest();
    createReleaseNoteModal(version);
  });
  tabContainer.appendChild(versionNumber);
  return tabContainer;
}
function postModalCreate(title, selectedTab) {
  // set window location hash to manager/selectedTab
  window.location.hash = `manager/${selectedTab}`;
  const modalTitle = document.querySelector('#modal-title');
  modalTitle.innerHTML = title;

  const closeButton = document.querySelector('#modal-close-button-manager');
  closeButton?.addEventListener('click', () => {
    chrome.storage.local.set({ selectedPromptFolderBreadcrumb, selectedConversationFolderBreadcrumb, managerModalCurrentTab });
  });
  const modal = document.querySelector('#modal-manager');
  const modalWrapper = document.querySelector('#modal-wrapper-manager');
  modal.addEventListener('mousedown', (event) => {
    if (modalWrapper.contains(event.target)) return;
    chrome.storage.local.set({ selectedPromptFolderBreadcrumb, selectedConversationFolderBreadcrumb, managerModalCurrentTab });
  });

  // add newletter indicator
  addNewsletterIndicator();

  const promptLanguageList = [{ code: 'all', name: 'All' }, ...languageList.slice(1)];
  switch (selectedTab) {
    case 'conversations':
      addDropdownEventListener('Conversations-Manager-SortBy', conversationsSortByList, 'code', () => fetchConversations());
      break;
    case 'prompts':
      addDropdownEventListener('Prompts-Manager-SortBy', promptsSortByList, 'code', () => fetchPrompts());
      addDropdownEventListener('Prompts-Manager-Language', promptLanguageList, 'code', () => fetchPrompts());
      break;
    case 'notes':
      fetchNotes();
      addDropdownEventListener('Notes-SortBy', notesSortByList, 'code', () => fetchNotes());
      break;
    case 'newsletters':
      loadNewsletterList();
      break;
    case 'gallery':
      addImageGalleryEventListeners();
      loadImageList();
      break;
    case 'custom-instruction-profiles':
      fetchCustomInstructionProfiles();
      addDropdownEventListener('Profiles-Manager-SortBy', profilesSortByList, 'code', () => fetchCustomInstructionProfiles());
      break;
    case 'pinned-messages':
      fetchPinnedMessages();
      break;
    default:
      break;
  }
}
function addNewsletterIndicator() {
  chrome.storage.local.get(['readNewsletterIds'], (res) => {
    const readNewsletterIds = res.readNewsletterIds || [];
    chrome.runtime.sendMessage({
      type: 'getLatestNewsletter',
    }, (newsletter) => {
      if (!newsletter || !newsletter.id) return;
      if (!readNewsletterIds.includes(newsletter.id)) {
        const newsletterTab = document.querySelector('#modal-manager-side-tab-newsletters');
        newsletterTab?.insertAdjacentElement('beforeend', animatePing('#ef4146'));
      }
    });
  });
}
async function createManager(defaultTab = 'prompts', defaultFullscreen = false) {
  closeMenus();
  closeModals();
  if (managerTabList.map((tab) => tab.code).indexOf(defaultTab) === -1) {
    window.location.hash = '';
    return;
  }
  managerModalCurrentTab = defaultTab;
  chrome.storage.local.set({ selectedPromptFolderBreadcrumb, selectedConversationFolderBreadcrumb, managerModalCurrentTab });
  const existingManager = document.querySelector('#modal-manager');
  if (existingManager) existingManager.remove();
  const modalSideTab = createManagerSideTab(managerModalCurrentTab);
  const title = translate(selectedManagerTabTitle(managerModalCurrentTab));
  const subtitle = selectedManagerTabSubtitle(managerModalCurrentTab);
  const bodyContent = selectedManagerTabContent(managerModalCurrentTab);
  const actionsBarContent = selectedManagerTabAction(managerModalCurrentTab);
  createModal('Manager', subtitle, bodyContent, actionsBarContent, true, 'large', modalSideTab, defaultFullscreen);
  postModalCreate(title, managerModalCurrentTab);
}

// eslint-disable-next-line no-unused-vars
async function addManagerButton() {
  const existingManagerButton = document.querySelector('#manager-button');

  if (existingManagerButton) return;

  const managerButtonWrapper = document.createElement('div');
  managerButtonWrapper.id = 'manager-button-wrapper';
  managerButtonWrapper.classList = 'flex flex-wrap z-10';
  managerButtonWrapper.style = 'margin-bottom: 1rem;right: 0;padding:0 12px;min-width: 56px;';

  const managerButtonHiddenList = document.createElement('div');
  managerButtonHiddenList.id = 'manager-button-hidden-list';
  managerButtonHiddenList.classList = 'hidden mb-2 flex flex-wrap w-full gap-1.5 bg-token-main-surface-primary rounded-md';
  // blur managerButtonHiddenList background
  managerButtonHiddenList.style = 'backdrop-filter: blur(10px);';
  managerButtonWrapper.appendChild(managerButtonHiddenList);

  chrome.runtime.sendMessage({
    type: 'checkHasSubscription',
  }, (hasSubscription) => {
    const reverseManagerTabList = [...managerTabList].reverse();
    if (!hasSubscription) {
      reverseManagerTabList.unshift(upgradeButton);
    }
    reverseManagerTabList.forEach((tab) => {
      if (['conversations', 'prompts', 'gallery', 'settings', 'upgrade'].includes(tab.code)) {
        const managerButtonHidden = document.createElement('button');
        managerButtonHidden.classList = 'flex items-center justify-center border border-token-border-medium text-token-text-tertiary bg-token-main-surface-primary hover:text-token-text-primary text-xs font-sans cursor-pointer rounded-md w-8 h-8';
        managerButtonHidden.innerHTML = tab.icon.replace('icon-lg', 'icon-sm').replace('icon-xl', 'icon-sm');
        // add a tooltip on hover on the left side of the tab
        createTooltip(managerButtonHidden, `<div class="me-2">${translate(tab.code)}</div><div claass="text-token-text-tertiary ms-2">${buttonGenerator(tab?.keyboard || [], 'xs')}</div>`, 'transform: translate(-36px, 0);');

        // click open the tab
        managerButtonHidden.addEventListener('click', () => {
          if (tab.code === 'settings') {
            createSettingsModal();
            return;
          }
          if (tab.code === 'upgrade') {
            openUpgradeModal();
            return;
          }
          createManager(tab.code);
        });
        managerButtonHiddenList.appendChild(managerButtonHidden);
      }
    });
  });

  const managerButton = document.createElement('button');
  managerButton.id = 'manager-button';
  managerButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="icon-lg" stroke="purple" fill="purple"><path d="M240.5 224H352C365.3 224 377.3 232.3 381.1 244.7C386.6 257.2 383.1 271.3 373.1 280.1L117.1 504.1C105.8 513.9 89.27 514.7 77.19 505.9C65.1 497.1 60.7 481.1 66.59 467.4L143.5 288H31.1C18.67 288 6.733 279.7 2.044 267.3C-2.645 254.8 .8944 240.7 10.93 231.9L266.9 7.918C278.2-1.92 294.7-2.669 306.8 6.114C318.9 14.9 323.3 30.87 317.4 44.61L240.5 224z"/></svg>';
  managerButton.classList = 'flex items-center justify-center border border-token-border-medium text-token-text-tertiary bg-gold hover:bg-gold-dark hover:text-token-text-primary text-xs font-sans cursor-pointer rounded-md w-8 h-8';
  // add a tooltip on hover on the left side of the tab
  createTooltip(managerButton, translate('Manager'), 'transform: translate(-36px, 0);');
  // click open last tab
  managerButton.addEventListener('click', (e) => {
    if (e.shiftKey) {
      chrome.runtime.sendMessage({
        type: 'clearAllCache',
        forceRefresh: true,
      }, () => {
        window.location.reload();
      });
      return;
    }
    createManager(managerModalCurrentTab);
  });

  managerButtonWrapper.appendChild(managerButton);

  managerButtonWrapper.addEventListener('mouseenter', () => {
    managerButtonHiddenList.classList.remove('hidden');
  });
  managerButtonWrapper.addEventListener('mouseleave', () => {
    managerButtonHiddenList.classList.add('hidden');
  });

  const floatingButtonWrapper = document.querySelector('#floating-button-wrapper');
  if (floatingButtonWrapper) {
    floatingButtonWrapper.insertAdjacentElement('afterbegin', managerButtonWrapper);
  }
}
