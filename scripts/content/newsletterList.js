/* global createAnnouncementModal, animatePing, escapeHTML, closeMenus, isDarkMode */

// eslint-disable-next-line no-unused-vars
let lastSelectedNewsletterCardId = null;

// eslint-disable-next-line no-unused-vars
function loadNewsletterList(page = 1) {
  chrome.runtime.sendMessage({
    type: 'getNewsletters',
    detail: {
      page,
    },
  }, (data) => {
    const newsletters = data.results;
    if (!newsletters) return;
    if (!Array.isArray(newsletters)) return;
    const newsletterListElement = document.querySelector('#newsletter-list');
    chrome.storage.local.get(['readNewsletterIds'], (result) => {
      const readNewsletterIds = result.readNewsletterIds || [];
      for (let i = 0; i < newsletters.length; i += 1) {
        const newsletter = newsletters[i];
        const isRead = readNewsletterIds.includes(newsletter.id);
        const newsletterCard = createNewsletterCard(newsletter, isRead);
        newsletterListElement.appendChild(newsletterCard);
        if (!readNewsletterIds.includes(newsletter.id) && i === 0 && page === 1) {
          newsletterCard?.insertAdjacentElement('beforeend', animatePing('#ef4146'));
        }
      }
    });
    if (data.next) newsletterListElement?.insertAdjacentHTML('beforeend', '<div id="newsletter-list-loading" style="font-size:1em;">Loading...</div>');
    const newsletterListLoading = document.querySelector('#newsletter-list-loading');
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        newsletterListLoading.remove();
        loadNewsletterList(page + 1);
      }
    }, { threshold: 0.5 });
    if (newsletterListLoading) observer.observe(newsletterListLoading);
  });
}

function createNewsletterCard(newsletter, isRead = false) {
  const releaseDate = new Date(newsletter.release_date);
  const releaseDateWithOffset = new Date(releaseDate.getTime() + (releaseDate.getTimezoneOffset() * 60000));
  const newsletterCard = document.createElement('div');

  newsletterCard.id = `newsletter-card-${newsletter.id}`;
  newsletterCard.classList = `relative bg-token-main-surface-primary border border-token-border-medium rounded-md cursor-pointer hover:bg-token-main-surface-tertiary flex flex-col h-auto ${isRead ? 'opacity-50' : ''}`;
  newsletterCard.style = 'height: max-content;outline-offset: 4px; outline: none;';
  newsletterCard.innerHTML = `<div class="flex flex-col items-start justify-between border-b border-token-border-medium pb-1 flex-grow">
  
  <figure class="h-full overflow-hidden w-full"><img loading="eager" src="${newsletter.thumbnail_url || 'https://media.beehiiv.com/cdn-cgi/image/fit=scale-down,format=auto,onerror=redirect,quality=80/uploads/publication/logo/99fb7747-3ebe-4c53-9e43-47a744e8fa86/thumb_logo-bg.png'}" alt="${newsletter.title}" class="rounded-t-md w-full h-full object-cover" style="max-height:150px;"></figure>

  <div class="flex items-start w-full break-all text-md p-2" style="min-height:100px;">${escapeHTML(newsletter.title)}</div>
  </div>
  <div class="flex justify-between items-center p-2">
    <div class="flex items-center text-xs text-token-text-tertiary">
      ${releaseDateWithOffset.toDateString()}
    </div>
    <div id="newsletter-card-action-right-${newsletter.id}" class="flex items-center">
      <div class="flex items-center text-xs ${isRead ? 'visible' : 'invisible'}" id="newsletter-read-indicator">Read <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="icon-sm ms-2"><path fill="currentColor" fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m14.076-4.068a1 1 0 0 1 .242 1.393l-4.75 6.75a1 1 0 0 1-1.558.098l-2.5-2.75a1 1 0 0 1 1.48-1.346l1.66 1.827 4.032-5.73a1 1 0 0 1 1.394-.242" clip-rule="evenodd"></path></svg></div>
    </div>
  </div>`;
  newsletterCard.addEventListener('click', (e) => {
    e.preventDefault();
    closeMenus();
    updateSelectedNewsletterCard(newsletter.id);
    chrome.runtime.sendMessage({
      type: 'getNewsletter',
      detail: {
        id: newsletter.id,
      },
    }, (newsletterData) => {
      createAnnouncementModal(newsletterData);
      chrome.storage.local.get(['readNewsletterIds'], (res) => {
        const oldReadNewsletterIds = res.readNewsletterIds || [];
        if (!oldReadNewsletterIds.includes(newsletter.id)) {
          chrome.runtime.sendMessage({
            type: 'incrementOpenRate',
            forceRefresh: true,
            detail: {
              announcementId: newsletter.id,
            },
          });
        }
        chrome.storage.local.set({ readNewsletterIds: [newsletter.id, ...oldReadNewsletterIds.slice(0, 100)] }, () => {
          const curNewsletterCard = document.querySelector(`#newsletter-card-${newsletter.id}`);
          curNewsletterCard.classList.add('opacity-50');
          if (curNewsletterCard && curNewsletterCard.querySelector('#ping')) {
            // remove from card
            curNewsletterCard?.querySelector('#ping')?.remove();
            // remove from tab
            const modalManagerSideTabNewsletter = document.querySelector('#modal-manager-side-tab-newsletters');
            if (modalManagerSideTabNewsletter) {
              modalManagerSideTabNewsletter?.querySelector('#ping')?.remove();
            }
          }

          const newsletterReadIndicator = curNewsletterCard.querySelector('#newsletter-read-indicator');
          newsletterReadIndicator?.classList?.replace('invisible', 'visible');
        });
      });
    });
  });
  return newsletterCard;
}
function updateSelectedNewsletterCard(newsletterId) {
  if (lastSelectedNewsletterCardId) {
    const prevSelectedCard = document.querySelector(`#modal-manager #newsletter-card-${lastSelectedNewsletterCardId}`);
    if (prevSelectedCard) prevSelectedCard.style.outline = 'none';
  }
  if (!newsletterId) return;
  const newsletterCard = document.querySelector(`#modal-manager #newsletter-card-${newsletterId}`);
  lastSelectedNewsletterCardId = newsletterId;
  newsletterCard.style.outline = `2px solid ${isDarkMode() ? '#fff' : '#000'}`;
}
// eslint-disable-next-line no-unused-vars
function newsletterListModalContent() {
  lastSelectedNewsletterCardId = null;
  // create newsletterList modal content
  const content = document.createElement('div');
  content.id = 'modal-content-newsletter-list';
  content.style = 'overflow-y: hidden;position: relative;height:100%; width:100%;';
  const newsletterListElement = document.createElement('article');
  newsletterListElement.id = 'newsletter-list';
  newsletterListElement.classList = 'grid grid-cols-4 gap-4 p-4 pb-32 overflow-y-auto h-full content-start';
  content.appendChild(newsletterListElement);
  return content;
}
