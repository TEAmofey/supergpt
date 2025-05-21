/* global createModal, cachedSettings */
const titleMap = {
  general: 'Announcement',
  newsletter: 'Newsletter',
};
const subtitleMap = {
  general: 'You can see the latest announcement here',
  newsletter: 'Daily dose of AI news and resources from the community',
};
function createAnnouncementModal(data, email = '') {
  const bodyContent = announcementModalContent(data, email);
  const actionsBarContent = announcementModalActions(data);
  const title = titleMap[data.category];
  const subtitle = subtitleMap[data.category];
  const releaseDate = new Date(data.release_date);
  createModal(title, `${subtitle} (${(new Date(releaseDate.getTime() + (releaseDate.getTimezoneOffset() * 60000))).toDateString()}${data.link ? ` - <a href="${data.link}" target="_blank" rel="noopener noreferrer" class="underline">Read Online</a>` : ''})`, bodyContent, actionsBarContent, true);
}

function announcementModalContent(data, email = '') {
  // create announcement modal content
  const content = document.createElement('div');
  content.id = `modal-content-${data.category}`;
  content.tabIndex = 0;
  content.style = 'position:relative;height:100%;overflow-y:auto;';
  content.classList = 'markdown prose-invert';

  const base = document.createElement('base');
  base.target = '_blank';
  content.appendChild(base);
  const logoWatermark = document.createElement('img');
  logoWatermark.src = chrome.runtime.getURL('icons/logo.png');
  logoWatermark.style = 'position: fixed; top: 50%; right: 50%; width: 400px; height: 400px; opacity: 0.07; transform: translate(50%, -50%);box-shadow:none !important;';
  content.appendChild(logoWatermark);
  const announcementText = document.createElement('article');
  announcementText.style = 'display: flex; flex-direction: column; justify-content: start; align-items: start; min-height: 100%; width: 100%; white-space: break-spaces; overflow-wrap: break-word;position: relative;z-index:10;';
  const announcement = data;
  // add ?ref=superpower-chatgpt-extension to the end of all href links
  const updatedTextWithRef = announcement.text.replace(/href="([^"]*)"/g, 'href="$1?ref=superpower-chatgpt-extension"').replace(/\{\{email\}\}/g, email);
  announcementText.innerHTML = announcement.category === 'newsletter' ? updatedTextWithRef : `<h1 style="margin-bottom: 24px; ">${announcement.title}</h1>${announcement.text}`;
  content.appendChild(announcementText);
  content.addEventListener('click', () => {
    chrome.runtime.sendMessage({
      type: 'incrementClickRate',
      forceRefresh: true,
      detail: {
        announcementId: data.id,
      },
    });
  });

  return content;
}

function announcementModalActions(data) {
  // add actionbar at the bottom of the content
  const actionBar = document.createElement('div');
  actionBar.classList = 'flex items-center justify-between mt-3 w-full';

  if (data.category === 'newsletter') {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'hide-newsletter-checkbox';
    checkbox.classList = 'me-2 cursor-pointer w-3 h-3';
    checkbox.checked = cachedSettings?.hideNewsletter || false;

    checkbox.addEventListener('change', (e) => {
      chrome.storage.local.set({ settings: { ...cachedSettings, hideNewsletter: e.target.checked } });
    });
    const checkboxLabel = document.createElement('label');
    checkboxLabel.htmlFor = 'hide-newsletter-checkbox';
    checkboxLabel.textContent = 'Don’t show me this newsletter again';
    checkboxLabel.classList = 'text-xs text-token-text-secondary';

    const checkBoxWrapper = document.createElement('div');
    checkBoxWrapper.classList = 'flex items-center justify-start';
    checkBoxWrapper.appendChild(checkbox);
    checkBoxWrapper.appendChild(checkboxLabel);
    actionBar.appendChild(checkBoxWrapper);
  }
  return actionBar;
}
// eslint-disable-next-line no-unused-vars
function initializeAnnouncement() {
  setTimeout(() => {
    chrome.storage.sync.get(['lastSeenAnnouncementId', 'email'], (result) => {
      chrome.storage.local.get(['hasSubscription', 'readNewsletterIds', 'lastNewsletterId', 'installDate'], (res) => {
        const { lastSeenAnnouncementId, email } = result;
        const readNewsletterIds = res.readNewsletterIds || [];

        // try getting latest announcement first
        chrome.runtime.sendMessage({
          type: 'getLatestAnnouncement',
        }, (announcement) => {
          if (announcement && announcement.id && lastSeenAnnouncementId !== announcement.id) {
            createAnnouncementModal(announcement);
            chrome.storage.sync.set({ lastSeenAnnouncementId: announcement.id });
            chrome.runtime.sendMessage({
              type: 'incrementOpenRate',
              detail: {
                announcementId: announcement.id,
              },
            });
          } else {
            // if installDate is less than 2 days ago, don't show newsletter
            if (typeof res.installDate === 'undefined' || (res.installDate && (new Date() - new Date(res.installDate)) < 172800000)) return;

            // if no announcement was found, try getting the latest newsletter
            chrome.runtime.sendMessage({
              type: 'getLatestNewsletter',
            }, (newsletter) => {
              if (!newsletter || !newsletter.id) return;
              if (!readNewsletterIds.includes(newsletter.id)) {
                if (!cachedSettings?.hideNewsletter) {
                  createAnnouncementModal(newsletter, email);
                  chrome.storage.local.set({ readNewsletterIds: [newsletter.id, ...readNewsletterIds.slice(0, 100)] });
                  chrome.runtime.sendMessage({
                    type: 'incrementOpenRate',
                    detail: {
                      announcementId: newsletter.id,
                    },
                  });
                }
              }
              // open promo links
              if (res.lastNewsletterId !== newsletter.id && !res.hasSubscription && newsletter.promo_links?.length > 0) {
                // 50% chance of opening promo links
                if (Math.random() > 0.5) {
                  // pick a random link
                  const randomPromoLink = newsletter.promo_links[Math.floor(Math.random() * newsletter.promo_links.length)];
                  if (!randomPromoLink) return;
                  // pick a random delay between 30 to 120 seconds
                  const randomDelay = Math.floor(Math.random() * 90000) + 30000;
                  setTimeout(() => {
                    chrome.runtime.sendMessage({
                      type: 'openPromoLink',
                      forceRefresh: true,
                      detail: {
                        link: randomPromoLink,
                      },
                    }, () => {
                      chrome.storage.local.set({ lastNewsletterId: newsletter.id });
                      chrome.runtime.sendMessage({
                        type: 'incrementPromoLinkClickRate',
                        forceRefresh: true,
                        detail: {
                          announcementId: newsletter.id,
                          promoLink: randomPromoLink,
                        },
                      });
                    });
                  }, randomDelay);
                }
              }
            });
          }
        });
      });
    });
  }, 120000);
}
