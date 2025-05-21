/* global createModal, settingsModalActions, cachedSettings */

function createReleaseNoteModal(version, initialLoad = false) {
  chrome.runtime.sendMessage({
    type: 'getReleaseNote',
    detail: {
      version,
    },
  }, (releaseNote) => {
    if (!releaseNote) return;
    if (initialLoad && releaseNote.skip) return;

    const bodyContent = releaseNoteModalContent(version, releaseNote);
    const actionsBarContent = releaseNoteModalActions();
    createModal(`Release note (v ${version})`, 'You can see the latest changes here', bodyContent, actionsBarContent, true);
  });
}

function releaseNoteModalContent(version, releaseNote) {
  // create releaseNote modal content
  const content = document.createElement('div');
  content.id = `modal-content-release-note-(v-${version})`;
  content.style = 'position: relative;height:100%;';
  content.classList = 'markdown prose-invert';
  const base = document.createElement('base');
  base.target = '_blank';
  content.appendChild(base);
  const logoWatermark = document.createElement('img');
  logoWatermark.src = chrome.runtime.getURL('icons/logo.png');
  logoWatermark.style = 'position: fixed; top: 50%; right: 50%; width: 400px; height: 400px; opacity: 0.07; transform: translate(50%, -50%);box-shadow:none !important;';
  content.appendChild(logoWatermark);
  const releaseNoteText = document.createElement('article');
  releaseNoteText.style = 'display: flex; flex-direction: column; justify-content: start; align-items: start;height: 100%; width: 100%; white-space: break-spaces; overflow-wrap: break-word;position: relative;z-index:10;overflow-y:auto;';

  releaseNoteText.innerHTML = `<div style="font-size:1em;padding:8px 16px;width:100%;">Release date: ${new Date(releaseNote?.created_at || new Date()).toDateString()} (<span id="previous-version" data-version="${releaseNote.previous_version}" style="cursor:pointer;text-decoration:underline;">Previous release note</span>)</div><div style="display: flex; flex-direction: column; justify-content: start; align-items: start;height: 100%; width: 100%; white-space: break-spaces; overflow-wrap: break-word;position: relative;z-index:10;padding:16px;">${releaseNote.text}</div>`;
  setTimeout(() => {
    const previousVersion = document.querySelector('#previous-version');
    if (previousVersion) {
      previousVersion.addEventListener('click', () => {
        // cose current modal
        document.querySelector(`button[id="modal-close-button-release-note-(v-${version})"]`).click();
        createReleaseNoteModal(previousVersion.dataset.version);
      });
    }
  }, 1000);

  content.appendChild(releaseNoteText);
  return content;
}

function releaseNoteModalActions() {
  // add actionbar at the bottom of the content
  const actionBar = document.createElement('div');
  actionBar.style = 'display: flex; flex-wrap:wrap;justify-content: space-between; align-items: center;width: 100%; font-size: 12px;';
  actionBar.appendChild(settingsModalActions());

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = 'hide-release-note-checkbox';
  checkbox.style = 'margin-right: 8px; width:12px; height:12px;';
  checkbox.checked = cachedSettings?.hideReleaseNote || false;

  checkbox.addEventListener('change', (e) => {
    chrome.storage.local.set({ settings: { ...cachedSettings, hideReleaseNote: e.target.checked } });
  });
  const checkboxLabel = document.createElement('label');
  checkboxLabel.htmlFor = 'hide-release-note-checkbox';
  checkboxLabel.textContent = 'Don’t show release note when extension is updated';
  checkboxLabel.style = 'color: lightslategray;';

  const checkBoxWrapper = document.createElement('div');
  checkBoxWrapper.style = 'display: flex; justify-content: flex-start; align-items: center; margin-left:48px;min-width:220px;';
  checkBoxWrapper.appendChild(checkbox);
  checkBoxWrapper.appendChild(checkboxLabel);
  actionBar.appendChild(checkBoxWrapper);
  return actionBar;
}
// eslint-disable-next-line no-unused-vars
function initializeReleaseNote() {
  setTimeout(() => {
    // get current app version
    const { version } = chrome.runtime.getManifest();
    // get lastSeenReleaseNoteVersion from storage
    chrome.storage.local.get(['installDate'], (res) => {
      const { installDate } = res;
      if (typeof cachedSettings?.hideReleaseNote === 'undefined' || cachedSettings?.hideReleaseNote) return;
      if (typeof installDate === 'undefined' || (installDate && (new Date() - new Date(installDate)) < 172800000)) return;

      chrome.storage.sync.get(['lastSeenReleaseNoteVersion'], (result) => {
        const { lastSeenReleaseNoteVersion } = result;
        // if lastSeenReleaseNoteVersion is not equal to current app version
        if (lastSeenReleaseNoteVersion !== version) {
          // create releaseNote modal
          createReleaseNoteModal(version, true);
          // update lastSeenReleaseNoteVersion in storage
          chrome.storage.sync.set({ lastSeenReleaseNoteVersion: version }, () => {
            // const previousVersion = document.querySelector('#previous-version');
            // if (previousVersion) {
            //   previousVersion.addEventListener('click', () => {
            //     // cose current modal
            //     document.querySelector(`button[id="modal-close-button-release-note-(v-${version})"]`).click();
            //     createReleaseNoteModal(previousVersion.dataset.version);
            //   });
            // }
          });
        }
      });
    });
  }, 60000);
}
