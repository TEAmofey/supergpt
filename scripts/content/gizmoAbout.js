/* global isDescendant, getGizmosByUser */
/* eslint-disable no-unused-vars */

function showGizmoAboutDialog(gizmoResource, showStartChat = false) {
  const uniqueTools = gizmoResource.tools.map((tool) => tool.type).filter((value, index, self) => self.indexOf(value) === index);
  const title = gizmoResource?.gizmo?.display?.name;
  const creator = gizmoResource?.gizmo?.author?.display_name || 'community builder';
  const authorLink = gizmoResource ? gizmoResource?.gizmo?.author?.link_to || '' : '';
  const creatorElement = authorLink ? `<a href="${authorLink}" target="_blank" class="underline">${creator}</a>` : creator;
  const rating = gizmoResource?.about_blocks?.find((block) => block.type === 'rating');
  const category = gizmoResource?.about_blocks?.find((block) => block.type === 'category');
  const conversations = gizmoResource?.about_blocks?.find((block) => block.type === 'generic_title_subtitle');
  const conversationStarters = gizmoResource?.gizmo?.display?.prompt_starters.sort(() => Math.random() - 0.5).slice(0, 4);

  const aboutDialog = `<div id="gizmo-about-dialog" class="absolute inset-0" style="z-index:100001">
  <div data-state="open" class="fixed inset-0 bg-black/50 dark:bg-black/80" style="pointer-events: auto;">
    <div class="grid h-full w-full grid-cols-[10px_1fr_10px] grid-rows-[minmax(10px,_1fr)_auto_minmax(10px,_1fr)] overflow-y-auto md:grid-rows-[minmax(20px,_1fr)_auto_minmax(20px,_1fr)]" style="opacity: 1; transform: none;">
      <div role="dialog" id="gizmo-about-dialog-content" aria-describedby="radix-:r6c:" aria-labelledby="radix-:r6b:" data-state="open" class="popover relative start-1/2 ltr:-translate-x-1/2 rtl:translate-x-1/2 col-auto col-start-2 row-auto row-start-2 w-full rounded-xl bg-token-main-surface-primary text-start shadow-xl transition-all flex flex-col focus:outline-none max-w-md flex h-[calc(100vh-25rem)] min-h-[80vh] max-w-xl" tabindex="-1" style="pointer-events: auto;">
        <div class="flex-grow overflow-y-auto">
          <div class="relative flex h-full flex-col gap-2 overflow-hidden px-2 py-4">
            <div id="gizmo-about-dialog-inner-content" class="relative flex flex-grow flex-col gap-4 overflow-y-auto px-6 pb-20 pt-16">
              <div class="absolute top-0">
                <div class="fixed start-4 end-4 z-10 flex min-h-[64px] items-start justify-end gap-4 bg-gradient-to-b from-token-main-surface-primary to-transparent px-2">
                  <button id="gizmo-about-menu-button" type="button" aria-haspopup="menu" aria-expanded="false" data-state="closed" class="hidden text-token-text-primary border border-transparent inline-flex h-9 items-center justify-center gap-1 rounded-lg bg-white px-3 text-sm dark:transparent dark:bg-transparent leading-none outline-none cursor-pointer hover:bg-token-main-surface-secondary dark:hover:bg-token-main-surface-secondary focus-visible:border-green-500 dark:focus-visible:border-green-500 radix-state-active:text-token-text-tertiary radix-disabled:cursor-auto radix-disabled:bg-transparent radix-disabled:text-token-text-tertiary dark:radix-disabled:bg-transparent focus:border-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                      xmlns="http://www.w3.org/2000/svg" class="text-token-text-tertiary hover:text-token-text-tertiary">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M3 12C3 10.8954 3.89543 10 5 10C6.10457 10 7 10.8954 7 12C7 13.1046 6.10457 14 5 14C3.89543 14 3 13.1046 3 12ZM10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12ZM17 12C17 10.8954 17.8954 10 19 10C20.1046 10 21 10.8954 21 12C21 13.1046 20.1046 14 19 14C17.8954 14 17 13.1046 17 12Z" fill="currentColor"></path>
                    </svg>
                  </button>
                  <button id="gizmo-about-close-button" class="text-token-text-tertiary hover:text-token-text-tertiary">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.34315 6.34338L17.6569 17.6571M17.6569 6.34338L6.34315 17.6571" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="absolute bottom-[64px]">
                <div class="fixed start-4 end-4 z-10 flex min-h-[64px] items-end bg-gradient-to-t from-token-main-surface-primary to-transparent px-2">
                  ${showStartChat ? `<div class="flex flex-grow flex-col items-center"><a target="_self" class="btn relative btn-primary h-12 w-full" as="link" to="/g/${gizmoResource.gizmo.short_url}" href="/g/${gizmoResource.gizmo.short_url}"><div class="flex w-full gap-2 items-center justify-center"><svg width="24" height="24" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-lg"><g id="chat"><path id="vector" fill-rule="evenodd" clip-rule="evenodd" d="M12 4.5C7.58172 4.5 4 8.08172 4 12.5C4 14.6941 4.88193 16.6802 6.31295 18.1265C6.6343 18.4513 6.69466 18.9526 6.45959 19.3443L5.76619 20.5H12C16.4183 20.5 20 16.9183 20 12.5C20 8.08172 16.4183 4.5 12 4.5ZM2 12.5C2 6.97715 6.47715 2.5 12 2.5C17.5228 2.5 22 6.97715 22 12.5C22 18.0228 17.5228 22.5 12 22.5H4C3.63973 22.5 3.30731 22.3062 3.1298 21.9927C2.95229 21.6792 2.95715 21.2944 3.14251 20.9855L4.36137 18.9541C2.88894 17.2129 2 14.9595 2 12.5Z" fill="currentColor"></path></g></svg>Start Chat</div></a></div>` : ''}
                </div>
              </div>
              <div class="flex h-full flex-col items-center justify-center text-token-text-primary !h-fit">
                <div class="relative">
                  <div class="mb-3 h-12 w-12 !h-20 !w-20">
                    <div class="gizmo-shadow-stroke overflow-hidden rounded-full">
                      <img src="${gizmoResource.gizmo.display.profile_picture_url}" class="h-full w-full bg-token-main-surface-secondary" alt="GPT" width="80" height="80">
                      </div>
                    </div>
                  </div>
                  <div class="flex flex-col items-center gap-2">
                    <div class="text-center text-2xl font-medium">${title}</div>
                    <div class="flex items-center gap-1 text-token-text-tertiary">
                      <div class="mt-1 flex flex-row items-center space-x-1">
                        <div class="text-sm text-token-text-tertiary">By ${creatorElement}</div>
                        <div>
                          <div title="The builder of this GPT cannot view your conversations." class="my-2" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="radix-:r6f:" data-state="closed">
                            <div class="flex items-center gap-1 rounded-xl bg-token-main-surface-secondary px-2 py-1">
                              <svg width="24" height="24" viewBox="0 0 20 20" fill="red"
                                xmlns="http://www.w3.org/2000/svg" class="icon-xs text-token-text-tertiary">
                                <path id="vector" fill-rule="evenodd" clip-rule="evenodd" d="M0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10ZM9.98514 2.00291C9.99328 2.00046 9.99822 2.00006 9.99964 2C10.001 2.00006 10.0067 2.00046 10.0149 2.00291C10.0256 2.00615 10.047 2.01416 10.079 2.03356C10.2092 2.11248 10.4258 2.32444 10.675 2.77696C10.9161 3.21453 11.1479 3.8046 11.3486 4.53263C11.6852 5.75315 11.9156 7.29169 11.981 9H8.01901C8.08442 7.29169 8.3148 5.75315 8.65137 4.53263C8.85214 3.8046 9.08392 3.21453 9.32495 2.77696C9.57422 2.32444 9.79081 2.11248 9.92103 2.03356C9.95305 2.01416 9.97437 2.00615 9.98514 2.00291ZM6.01766 9C6.08396 7.13314 6.33431 5.41167 6.72334 4.00094C6.87366 3.45584 7.04762 2.94639 7.24523 2.48694C4.48462 3.49946 2.43722 5.9901 2.06189 9H6.01766ZM2.06189 11H6.01766C6.09487 13.1737 6.42177 15.1555 6.93 16.6802C7.02641 16.9694 7.13134 17.2483 7.24522 17.5131C4.48461 16.5005 2.43722 14.0099 2.06189 11ZM8.01901 11H11.981C11.9045 12.9972 11.6027 14.7574 11.1726 16.0477C10.9206 16.8038 10.6425 17.3436 10.3823 17.6737C10.2545 17.8359 10.1506 17.9225 10.0814 17.9649C10.0485 17.9852 10.0264 17.9935 10.0153 17.9969C10.0049 18.0001 9.99994 18 9.99994 18C9.99994 18 9.99479 18 9.98471 17.9969C9.97356 17.9935 9.95155 17.9852 9.91857 17.9649C9.84943 17.9225 9.74547 17.8359 9.61768 17.6737C9.35747 17.3436 9.0794 16.8038 8.82736 16.0477C8.39726 14.7574 8.09547 12.9972 8.01901 11ZM13.9823 11C13.9051 13.1737 13.5782 15.1555 13.07 16.6802C12.9736 16.9694 12.8687 17.2483 12.7548 17.5131C15.5154 16.5005 17.5628 14.0099 17.9381 11H13.9823ZM17.9381 9C17.5628 5.99009 15.5154 3.49946 12.7548 2.48694C12.9524 2.94639 13.1263 3.45584 13.2767 4.00094C13.6657 5.41167 13.916 7.13314 13.9823 9H17.9381Z" fill="currentColor"></path>
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="max-w-md text-center text-sm font-normal text-token-text-primary">${gizmoResource.gizmo.display.description}</div>
                  </div>
                </div>
                <div class="flex justify-center">
                  ${rating ? `<div class="flex flex-col justify-center items-center gap-2 border-s border-token-border-medium first:border-0 w-48 mt-4 px-2">
                    <div class="flex flex-row items-center gap-1.5 pt-1 text-xl font-medium text-center leading-none">
                      <svg width="24" height="24" viewBox="0 0 39 39" fill="none"
                        xmlns="http://www.w3.org/2000/svg" class="icon-sm">
                        <path d="M15.6961 2.70609C17.4094 -0.33367 21.7868 -0.333671 23.5002 2.70609L27.237 9.33591C27.3648 9.56271 27.585 9.72268 27.8402 9.77418L35.3003 11.2794C38.7207 11.9695 40.0734 16.1327 37.7119 18.7015L32.5613 24.3042C32.3851 24.4958 32.301 24.7547 32.3309 25.0133L33.2046 32.5734C33.6053 36.0397 30.0639 38.6127 26.891 37.1605L19.971 33.9933C19.7342 33.885 19.4621 33.885 19.2253 33.9933L12.3052 37.1605C9.1324 38.6127 5.59103 36.0397 5.99163 32.5734L6.86537 25.0133C6.89526 24.7547 6.81116 24.4958 6.63496 24.3042L1.48438 18.7015C-0.877157 16.1327 0.475528 11.9695 3.89596 11.2794L11.356 9.77418C11.6113 9.72268 11.8314 9.56271 11.9593 9.33591L15.6961 2.70609Z" fill="currentColor"></path>
                      </svg>${rating.avg}
                    </div>
                    <div class="text-xs text-token-text-tertiary">${rating.count_str}</div>
                  </div>` : ''}
                  ${category ? `<div class="flex flex-col justify-center items-center gap-2 border-s border-token-border-medium first:border-0 w-48 mt-4 px-2">
                    <div class="flex flex-row items-center gap-1.5 pt-1 text-xl font-medium text-center leading-none">${category.category_ranking ? `#${category.category_ranking}` : category.category_str}</div>
                    <div class="text-xs text-token-text-tertiary">${category.category_ranking ? `in ${category.category_str} ${category.category_locale_str}` : 'Category'}</div>
                  </div>` : ''}
                  ${conversations ? `<div class="flex flex-col justify-center items-center gap-2 border-s border-token-border-medium first:border-0 w-48 mt-4 px-2">
                    <div class="flex flex-row items-center gap-1.5 pt-1 text-xl font-medium text-center leading-none">${conversations.title}</div>
                    <div class="text-xs text-token-text-tertiary">${conversations.subtitle}</div>
                  </div>` : ''}
                </div>
                <div class="flex flex-col">
                  <div class="font-bold mt-6">Conversation Starters</div>
                  <div class="mt-4 grid grid-cols-2 gap-x-1.5 gap-y-2">
                    ${conversationStarters.map((conversationStarter) => `<div class="flex" tabindex="0">
                      <a class="group border-token-border-medium bg-token-main-surface-primary hover:bg-token-main-surface-secondary relative ms-2 h-14 min-w-full grow rounded-xl border px-4 focus:outline-hidden" target="_self" href="/g/${gizmoResource.gizmo.short_url}?p=${conversationStarter}">
                        <div class="flex h-full items-center">
                          <div class="text-sm line-clamp-2 break-all">${conversationStarter}</div>
                        </div>
                        <div class="border-token-border-medium bg-token-main-surface-primary group-hover:bg-token-main-surface-secondary absolute -start-2 -bottom-px h-3 w-4 border-b">
                          <div class="border-token-border-medium bg-token-main-surface-primary h-3 w-2 rounded-ee-full border-e border-b"></div>
                        </div>
                        <div class="absolute bottom-0 end-2 top-0 hidden items-center group-hover:flex">
                          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-token-main-surface-primary">
                            <svg width="24" height="24" viewBox="0 0 24 25" fill="none"
                              xmlns="http://www.w3.org/2000/svg" class="icon-md text-token-text-primary">
                              <g id="chat">
                                <path id="vector" fill-rule="evenodd" clip-rule="evenodd" d="M12 4.5C7.58172 4.5 4 8.08172 4 12.5C4 14.6941 4.88193 16.6802 6.31295 18.1265C6.6343 18.4513 6.69466 18.9526 6.45959 19.3443L5.76619 20.5H12C16.4183 20.5 20 16.9183 20 12.5C20 8.08172 16.4183 4.5 12 4.5ZM2 12.5C2 6.97715 6.47715 2.5 12 2.5C17.5228 2.5 22 6.97715 22 12.5C22 18.0228 17.5228 22.5 12 22.5H4C3.63973 22.5 3.30731 22.3062 3.1298 21.9927C2.95229 21.6792 2.95715 21.2944 3.14251 20.9855L4.36137 18.9541C2.88894 17.2129 2 14.9595 2 12.5Z" fill="currentColor"></path>
                              </g>
                            </svg>
                          </div>
                        </div>
                      </a>
                    </div>`).join('')}
                  </div>
                </div>
                <div class="flex flex-col">
                  <div class="font-bold mt-6 mb-2">Capabilities</div>
                  ${uniqueTools.map((tool) => `<div class="flex flex-row items-start gap-2 py-1 text-sm">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                      xmlns="http://www.w3.org/2000/svg" class="icon-sm mt-0.5 text-green-600">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M18.0633 5.67375C18.5196 5.98487 18.6374 6.607 18.3262 7.06331L10.8262 18.0633C10.6585 18.3093 10.3898 18.4678 10.0934 18.4956C9.79688 18.5234 9.50345 18.4176 9.29289 18.2071L4.79289 13.7071C4.40237 13.3166 4.40237 12.6834 4.79289 12.2929C5.18342 11.9023 5.81658 11.9023 6.20711 12.2929L9.85368 15.9394L16.6738 5.93664C16.9849 5.48033 17.607 5.36263 18.0633 5.67375Z" fill="currentColor"></path>
                    </svg>
                    <div>${toolPrettyName(tool)}
                      ${tool === 'plugins_prototype' ? '<div class="text-xs text-token-text-tertiary">Retrieves or takes actions outside of ChatGPT</div>' : ''}
                    </div>
                  </div>`).join('')}
                </div>
                <div class="flex flex-col">
                  <div class="mb-2">
                    <div class="font-bold mt-6">Ratings</div>
                  </div>
                ${gizmoResource?.review_stats?.by_rating.length > 0 ? `${gizmoResource?.review_stats?.by_rating?.reverse()?.map((ratingStat, index) => `
                  <div class="flex flex-row items-center gap-2 py-1 text-xl font-medium">
                    <div class="icon-lg relative">
                      <svg width="24" height="24" viewBox="0 0 39 39" fill="none"
                        xmlns="http://www.w3.org/2000/svg" class="icon-lg text-green-500">
                        <path d="M15.6961 2.70609C17.4094 -0.33367 21.7868 -0.333671 23.5002 2.70609L27.237 9.33591C27.3648 9.56271 27.585 9.72268 27.8402 9.77418L35.3003 11.2794C38.7207 11.9695 40.0734 16.1327 37.7119 18.7015L32.5613 24.3042C32.3851 24.4958 32.301 24.7547 32.3309 25.0133L33.2046 32.5734C33.6053 36.0397 30.0639 38.6127 26.891 37.1605L19.971 33.9933C19.7342 33.885 19.4621 33.885 19.2253 33.9933L12.3052 37.1605C9.1324 38.6127 5.59103 36.0397 5.99163 32.5734L6.86537 25.0133C6.89526 24.7547 6.81116 24.4958 6.63496 24.3042L1.48438 18.7015C-0.877157 16.1327 0.475528 11.9695 3.89596 11.2794L11.356 9.77418C11.6113 9.72268 11.8314 9.56271 11.9593 9.33591L15.6961 2.70609Z" fill="currentColor"></path>
                      </svg>
                      <div class="absolute inset-0 flex items-center justify-center text-[11px] text-white">${5 - index}</div>
                    </div>
                    <div class="h-2.5 flex-grow overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                      <div class="h-full bg-green-500" style="width: ${ratingStat * 100}%;"></div>
                    </div>
                  </div>`).join('')}
                ` : '<div class="text-sm text-token-text-tertiary">Not enough ratings yet</div>'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
  // add to body
  document.body.insertAdjacentHTML('beforeend', aboutDialog);
  // add event listeners
  const aboutDialogCloseButton = document.querySelector('#gizmo-about-close-button');
  aboutDialogCloseButton.addEventListener('click', () => {
    const curAboutDialog = document.querySelector('#gizmo-about-dialog');
    curAboutDialog.remove();
  });
  // click outside content to close
  document.body.addEventListener('click', (e) => {
    const aboutDialogContent = document.querySelector('#gizmo-about-dialog-content');
    if (aboutDialogContent && !isDescendant(aboutDialogContent, e.target)) {
      const curAboutDialog = document.querySelector('#gizmo-about-dialog');
      curAboutDialog.remove();
    }
  });
  getGizmosByUser(gizmoResource?.gizmo?.author?.user_id).then((response) => {
    const gizmosByUser = response.items;
    if (gizmosByUser.length === 0) return;
    const gizmosByUserElement = `<div class="flex flex-col"><div class="mb-2"><div class="font-bold mt-6">More by ${gizmoResource.gizmo.author.display_name}</div></div><div class="no-scrollbar group flex min-h-[104px] items-center space-x-2 overflow-x-auto overflow-y-hidden">
      ${gizmosByUser.map((gizmoByUser) => `
      <a href="/g/${gizmoByUser.gizmo.short_url}" class="h-fit min-w-fit-sp rounded-xl bg-token-main-surface-secondary px-1 py-4 md:px-3 md:py-4 lg:px-3"><div class="flex w-full flex-grow items-center gap-4 overflow-hidden"><div class="h-12 w-12 flex-shrink-0"><div class="gizmo-shadow-stroke overflow-hidden rounded-full"><img src="${gizmoByUser.gizmo.display.profile_picture_url}" class="h-full w-full bg-token-main-surface-secondary" alt="GPT" width="80" height="80"></div></div><div class="overflow-hidden text-ellipsis break-words"><span class="text-sm font-medium leading-tight line-clamp-2">${gizmoByUser.gizmo.display.name}</span><span class="text-xs line-clamp-3">${gizmoByUser.gizmo.display.description}</span><div class="mt-1 flex items-center gap-1 text-ellipsis whitespace-nowrap pe-1 text-xs text-token-text-tertiary"><div class="mt-1 flex flex-row items-center space-x-1"><div class="text-token-text-tertiary text-xs">By ${gizmoByUser.gizmo.author.display_name}</div></div><span class="text-[8px]">•</span><svg width="24" height="24" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3"><path id="vector" fill-rule="evenodd" clip-rule="evenodd" d="M9 2.33317C5.31811 2.33317 2.33334 5.31794 2.33334 8.99984C2.33334 10.8282 3.06828 12.4833 4.2608 13.6886C4.52859 13.9592 4.57889 14.377 4.383 14.7034L3.80516 15.6665H9C12.6819 15.6665 15.6667 12.6817 15.6667 8.99984C15.6667 5.31794 12.6819 2.33317 9 2.33317ZM0.666672 8.99984C0.666672 4.39746 4.39763 0.666504 9 0.666504C13.6024 0.666504 17.3333 4.39746 17.3333 8.99984C17.3333 13.6022 13.6024 17.3332 9 17.3332H2.33334C2.03311 17.3332 1.75609 17.1717 1.60817 16.9104C1.46025 16.6492 1.4643 16.3285 1.61876 16.0711L2.63448 14.3782C1.40745 12.9272 0.666672 11.0494 0.666672 8.99984Z" fill="currentColor"></path></svg>${gizmoByUser.gizmo.vanity_metrics.num_conversations_str}</div></div></div></a>`).join('')}  
    </div></div>`;
    const aboutDialogInnerContent = document.querySelector('#gizmo-about-dialog-inner-content');
    aboutDialogInnerContent?.insertAdjacentHTML('beforeend', gizmosByUserElement);
  });
}
function toolPrettyName(tool) {
  switch (tool) {
    case 'browser':
      return 'Browsing';
    case 'python':
      return 'Data Analysis';
    case 'dalle':
      return 'DALL•E';
    case 'plugins_prototype':
      return 'Actions';
    default:
      return tool;
  }
}
