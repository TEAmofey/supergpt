/* global getConversation,getConversations, formatTime, getSelectedConversations, JSZip, saveAs, replaceCitations, loadingSpinner, translate, toast, errorUpgradeConfirmation, getPDFStyle, getConversationTextDocs, cachedSettings, getProjectId, getProjectConversations, escapeHTML */
let exportAllCanceled = false;
let exportTimeout;

function fileFormatConverter(fileFormat) {
  switch (fileFormat) {
    case 'json':
      return 'json';
    case 'text':
      return 'txt';
    case 'markdown':
      return 'md';
    case 'html':
      return 'html';
    default:
      return 'txt';
  }
}

function exportSelectedConversations(exportFormats, selectedConversationIds = [], action = 'export', filename = '') {
  const exportAllModalProgressBarLabel = document.querySelector('#export-all-modal-progress-bar-label');
  const exportAllModalProgressBarFill = document.querySelector('#export-all-modal-progress-bar-fill');
  const exportAllModalProgressBarFilename = document.querySelector('#export-all-modal-progress-bar-filename');
  const includeArchived = document.querySelector('#export-all-modal-include-archived-checkbox')?.checked;
  getSelectedConversations(selectedConversationIds, includeArchived).then((conversationIds) => {
    if (conversationIds.error && conversationIds.error.type === 'limit') {
      errorUpgradeConfirmation(conversationIds.error);
      return;
    }
    const zip = new JSZip();
    // fetch every conversation
    const fetchConversation = async (conversationId, exportMode) => {
      if (exportAllCanceled) {
        return;
      }
      await getConversation(conversationId).then((conversation) => {
        const conversationTitle = conversation.title.replace(/[^a-zA-Z0-9]/g, '_');
        let currentNode = conversation.current_node;
        const createDate = new Date(formatTime(conversation.create_time));
        //  folderName = conversation.create_time in local time in the format of YYYY-MM-DD
        const folderName = `${createDate.getFullYear()}-${createDate.getMonth() + 1}-${createDate.getDate()}`;
        // create filePrefix  from conversation.create_time in user local time in the format of HH-MM-SS
        const filePrefix = `${createDate.getHours()}-${createDate.getMinutes()}-${createDate.getSeconds()}`;
        if (conversation.is_archived) {
          zip.folder('Archived');
        }
        // create zip folder with date as name if it doesn't exist
        zip.folder(folderName);
        let messages = [];
        while (currentNode) {
          const { message, parent } = conversation.mapping[currentNode];
          if (message) messages.push(message);
          currentNode = parent;
        }

        if (!exportMode) {
          messages = messages.filter((m) => m.author?.role === 'assistant');
        }
        // download as .txt file
        if (exportFormats.includes('text')) {
          const conversationText = messages.reverse().filter((m) => {
            const role = m?.author?.role;
            const contentType = m?.content?.content_type;
            const content = contentType === 'thoughts'
              ? m?.content?.thoughts.map((t) => t.content).join('')
              : m?.content?.parts?.join('');
            return content && contentType !== 'user_editable_context' && (role === 'user' || role === 'assistant');
          }).map((m) => {
            const contentType = m?.content?.content_type;
            const content = contentType === 'thoughts'
              ? m?.content?.thoughts.map((t) => t.content)
              : m?.content?.parts;
            const role = contentType === 'thoughts' ? 'Thoughts' : m?.author?.role?.toUpperCase();

            return `${exportMode ? `>> ${role}: ` : ''}${replaceCitations((content || [])?.filter((p) => typeof p === 'string')?.join('\n').replace(/^## Instructions[\s\S]*?## End Instructions\n\n/m, ''), m.metadata.citations, 'text')}`;
          })?.join('\n\n');
          zip.file(`${folderName}/${filePrefix}-${conversationTitle}.${fileFormatConverter('text')}`, conversationText);
          if (action === 'copy') {
            copyToClipboard(conversationText, 'text');
          }
        }
        // download as .json file
        if (exportFormats.includes('json')) {
          const conversationJson = conversation;
          zip.file(`${folderName}/${filePrefix}-${conversationTitle}.${fileFormatConverter('json')}`, JSON.stringify(conversationJson));
          if (action === 'copy') {
            copyToClipboard(JSON.stringify(conversationJson), 'JSON');
          }
        }
        // download as .md file
        if (exportFormats.includes('markdown')) {
          const conversationMarkdown = messages.reverse().filter((m) => {
            const role = m?.author?.role;
            const contentType = m?.content?.content_type;
            const content = contentType === 'thoughts'
              ? m?.content?.thoughts.map((t) => t.content).join('')
              : m?.content?.parts?.join('');
            return content && contentType !== 'user_editable_context' && (role === 'user' || role === 'assistant');
          }).map((m) => {
            const contentType = m?.content?.content_type;
            const content = contentType === 'thoughts'
              ? m?.content?.thoughts.map((t) => t.content)
              : m?.content?.parts;
            const role = contentType === 'thoughts' ? 'Thoughts' : m?.author?.role?.toUpperCase();

            return `${exportMode ? `## ${role}\n` : ''}${replaceCitations((content || [])?.filter((p) => typeof p === 'string')?.join('\n').replace(/^## Instructions[\s\S]*?## End Instructions\n\n/m, ''), m.metadata.citations, 'markdown')}`;
          })?.join('\n\n');
          // replace citations
          zip.file(`${folderName}/${filePrefix}-${conversationTitle}.${fileFormatConverter('markdown')}`, conversationMarkdown);
          if (action === 'copy') {
            copyToClipboard(conversationMarkdown, 'Markdown');
          }
        }
        // update exportAllModalProgressBar.style
        const fileCount = Object.values(zip.files).filter((f) => !f.dir).length;
        const percentage = Math.round((Math.round(fileCount / exportFormats.length) / conversationIds.length) * 100);
        exportAllModalProgressBarLabel.textContent = `${Math.round(fileCount / exportFormats.length)} / ${conversationIds.length}`;
        exportAllModalProgressBarFill.style.width = `${percentage}%`;
        exportAllModalProgressBarFilename.textContent = conversation.title;
      })
        .catch((_err) => { });
    };

    const fetchAllConversationsAsync = async (convIds, exportMode) => {
      for (let i = 0; i < convIds.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await fetchConversation(convIds[i], exportMode, i);
      }
    };

    const { exportMode } = cachedSettings;
    fetchAllConversationsAsync(conversationIds, exportMode).then(() => {
      if (exportAllCanceled) {
        exportAllCanceled = false;
        return;
      }
      clearTimeout(exportTimeout);
      if (action === 'export') {
        zip.generateAsync({ type: 'blob', compression: 'DEFLATE' }).then((content) => {
          const outputFileName = filename ? `${filename}.zip` : `${new Date().toISOString().slice(0, 10)}-conversations.zip`;
          saveAs(content, outputFileName);
          const exportAllModal = document.querySelector('#export-all-modal');
          setTimeout(() => {
            exportAllModal.remove();
          }, 500);
        });
      } else {
        const copyButton = document.querySelector('#export-all-modal-copy-button');
        copyButton.disabled = exportFormats.length !== 1;
        const formatCheckboxes = document.querySelectorAll('input[name="export-all-modal-checkbox"]');
        formatCheckboxes.forEach((formatCheckbox) => {
          formatCheckbox.disabled = false;
        });
      }
    });
  }, () => { });
}
function copyToClipboard(text, format = 'text') {
  navigator.clipboard.writeText(text).then(() => {
    // eslint-disable-next-line no-alert
    toast(`Conversation ${format} copied to clipboard`);
  }, () => {
    // eslint-disable-next-line no-alert
    toast('Failed to copy conversation to clipboard');
  });
}
async function saveConversationAsPDF(conversationId, targetArticle = null) {
  const conversation = await getConversation(conversationId);
  // click on all dropdown buttons to open them before printing
  document.querySelector('main article').parentElement.querySelectorAll('button svg path[d="M5.29289 9.29289C5.68342 8.90237 6.31658 8.90237 6.70711 9.29289L12 14.5858L17.2929 9.29289C17.6834 8.90237 18.3166 8.90237 18.7071 9.29289C19.0976 9.68342 19.0976 10.3166 18.7071 10.7071L12.7071 16.7071C12.5196 16.8946 12.2652 17 12 17C11.7348 17 11.4804 16.8946 11.2929 16.7071L5.29289 10.7071C4.90237 10.3166 4.90237 9.68342 5.29289 9.29289Z"]').forEach((el) => {
    //  check if classlist has otate-90
    if (el.closest('svg')?.classList?.contains('rotate-90')) return;
    el.closest('button').click();
  });
  // reasoning buttons
  document.querySelector('main article').parentElement.querySelectorAll('button svg path[d="M9.29289 18.7071C8.90237 18.3166 8.90237 17.6834 9.29289 17.2929L14.5858 12L9.29289 6.70711C8.90237 6.31658 8.90237 5.68342 9.29289 5.29289C9.68342 4.90237 10.3166 4.90237 10.7071 5.29289L16.7071 11.2929C16.8946 11.4804 17 11.7348 17 12C17 12.2652 16.8946 12.5196 16.7071 12.7071L10.7071 18.7071C10.3166 19.0976 9.68342 19.0976 9.29289 18.7071Z"]').forEach((el) => {
    if (el.closest('svg')?.classList?.contains('rotate-90')) return;
    el.closest('button').click();
  });
  // eslint-disable-next-line no-promise-executor-return
  await new Promise((resolve) => setTimeout(resolve, 500));

  // open print window in a new tab
  const printWindow = window.open('', '_blank');
  // show loading spinner
  printWindow.document.write(`<html><head><title>${conversation.title}</title></head><body><div style="width:100vw;height:100vh;display:flex;align-items:center;justify-content:center;"><svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><style>.spinner_S1WN{animation:spinner_MGfb .8s linear infinite;animation-delay:-.8s}.spinner_Km9P{animation-delay:-.65s}.spinner_JApP{animation-delay:-.5s}@keyframes spinner_MGfb{93.75%,100%{opacity:.2}}</style><circle class="spinner_S1WN" cx="4" cy="12" r="3"/><circle class="spinner_S1WN spinner_Km9P" cx="12" cy="12" r="3"/><circle class="spinner_S1WN spinner_JApP" cx="20" cy="12" r="3"/></svg></div></body></html>`);

  // wait for all dropdowns to open before clonning the article
  // eslint-disable-next-line no-promise-executor-return
  await new Promise((resolve) => setTimeout(resolve, 1000));

  let conversationNode = targetArticle
    ? targetArticle.cloneNode(true)
    : document.querySelector('main article').parentElement.cloneNode(true);

  // there can be duplicate img elements with the same url in the conversationNode. remove duplicates
  const imgSrcs = new Set();
  conversationNode.querySelectorAll('img').forEach((img) => {
    if (imgSrcs.has(img.src)) {
      img.parentElement.remove();
    } else {
      imgSrcs.add(img.src);
    }
  });
  if (targetArticle) {
    // if targetArticle is provided, wrap it in a div and use that
    const wrapper = document.createElement('div');
    wrapper.appendChild(conversationNode);
    conversationNode = wrapper;
    // remove ChatGPT said:
    const h6 = conversationNode.querySelector('h6');
    if (h6?.textContent === 'ChatGPT said:') {
      h6.remove();
    }
  }
  // remove any child that is not an article
  conversationNode.childNodes.forEach((child) => {
    if (child.tagName !== 'ARTICLE') {
      child.remove();
    }
  });
  // wrap article content in a pre inside the article
  conversationNode.querySelectorAll('article').forEach((article) => {
    const pre = document.createElement('pre');
    pre.innerHTML = article.innerHTML;
    article.innerHTML = '';
    article.appendChild(pre);
  });

  // if the is an h5 tag that has no text, look at it's previous h5 tag. if the previous says, you said, add ChatGPT said to empty h5, else add you said
  const allh5Tags = Array.from(conversationNode.querySelectorAll('h5'));
  allh5Tags.forEach((h5, index) => {
    if (h5.textContent === '') {
      const previousH5 = allh5Tags[index - 1];
      if (previousH5.textContent.includes('You said')) {
        h5.textContent = 'ChatGPT said:';
      } else {
        h5.textContent = 'You said:';
      }
    }
  });

  // remove all buttons other than reasoning button
  conversationNode.querySelectorAll('button, div[role="button"]').forEach((el) => {
    el.removeAttribute('role');
    // reasoning button inner svg
    if (el.querySelector('svg path[d="M9.29289 18.7071C8.90237 18.3166 8.90237 17.6834 9.29289 17.2929L14.5858 12L9.29289 6.70711C8.90237 6.31658 8.90237 5.68342 9.29289 5.29289C9.68342 4.90237 10.3166 4.90237 10.7071 5.29289L16.7071 11.2929C16.8946 11.4804 17 11.7348 17 12C17 12.2652 16.8946 12.5196 16.7071 12.7071L10.7071 18.7071C10.3166 19.0976 9.68342 19.0976 9.29289 18.7071Z"]')) return;
    // if button include img element with src that contains files, keep it
    if (el.querySelector('img')?.src.includes('files')) return;
    if (el.id.startsWith('textdoc-message-')) return;
    el.remove();
  });

  // remove all styles and roles from all elements in conversationNode before adding new styles
  conversationNode.querySelectorAll('*').forEach((el) => {
    if (el.style.opacity === '0') el.remove();
    if (el.style.display === 'none') el.remove();
    el.removeAttribute('style');
  });
  // style reasoning content to have left margin
  conversationNode.querySelectorAll('div[class*="ps-4"], div[class*="overflow-clip"]').forEach((el) => {
    el.style.borderLeft = '2px solid #888';
    el.style.paddingLeft = '1rem';
    el.style.margin = '1rem 0.5rem';
  });

  // remove all classes from all elements in conversationNode
  conversationNode.querySelectorAll('*').forEach((el) => {
    if (el.classList.contains('invisible')) el.remove();
    if (el.classList.contains('hidden')) el.remove();
    if (el.classList.contains('opacity-0')) el.remove();
    el.removeAttribute('class');
  });

  conversationNode.querySelectorAll('#message-char-word-counter, #message-timestamp, #message-instructions, div[id^="message-actions-"]').forEach((el) => {
    el.remove();
  }); // get all links. for each link, if it's wrapped in a <div> tag, remove the div tag but keep the link
  conversationNode.querySelectorAll('a').forEach((el) => {
    if (el.parentElement.tagName === 'DIV') {
      el.parentElement.replaceWith(el);
      // add spacing around the link
      el.style = 'margin: 0 4px; background-color: #f0f0f0; padding: 0px 4px; border-radius: 4px; display: inline-block;line-height:1.8;word-break: break-all;overflow-wrap: break-word;';
    }
  });
  // get all textdoc-message-
  const textDocElements = conversationNode.querySelectorAll('div[id^="textdoc-message-"]');
  const textDocs = await getConversationTextDocs(conversationId);
  // for each text
  textDocElements.forEach((el) => {
    const textDocId = el.id.split('textdoc-message-')[1];
    const textDoc = textDocs.find((td) => td.id === textDocId);
    if (textDoc) {
      el.style.height = 'auto';
      el.lastChild.innerHTML = `<pre><code>${escapeHTML(textDoc.content)}</code></pre>`;
    }
  });

  // remove all div existing stuff from print window
  printWindow.document.body.innerHTML = '';
  printWindow.document.write(`<html><head><title>${conversation.title}</title><style id="dynamic-style">${getPDFStyle('style1')}</style></head><body>`);
  // add buttons to change the style
  printWindow.document.write('<div class="hidden-print">');
  printWindow.document.write('<span>Select the style: </span>');
  // add a dropdown menu for selecting styles
  printWindow.document.write('<select id="style-btn">');
  printWindow.document.write('<option value="style1">Default</option>');
  printWindow.document.write('<option value="style2">Dark Minimal</option>');
  printWindow.document.write('<option value="style3">Elegant Serif</option>');
  printWindow.document.write('<option value="style4">Retro Neon</option>');
  printWindow.document.write('<option value="style5">Clean and Structured</option>');
  printWindow.document.write('<option value="style6">Vintage Typewriter</option>');
  printWindow.document.write('<option value="style7">Futuristic Circuit</option>');
  printWindow.document.write('<option value="style8">Organic Nature</option>');
  printWindow.document.write('<option value="style9">Comic Pop</option>');
  printWindow.document.write('<option value="style10">Abstract Geometry</option>');
  printWindow.document.write('<option value="style11">Celestial Night</option>');
  printWindow.document.write('<option value="style12">Pop Art Explosion</option>');
  printWindow.document.write('<option value="style13">Industrial Blueprint</option>');
  printWindow.document.write('<option value="style14">Watercolor Dream</option>');
  printWindow.document.write('<option value="style15">Cosmic Space</option>');
  printWindow.document.write('<option value="style16">Botanical Illustration</option>');
  printWindow.document.write('<option value="style17">Digital Doodle</option>');
  printWindow.document.write('<option value="style18">Glitch Art</option>');
  printWindow.document.write('<option value="style19">Origami Fold</option>');
  printWindow.document.write('<option value="style20">Retro Computer</option>');
  printWindow.document.write('<option value="style21">Underwater Dream</option>');
  printWindow.document.write('<option value="style22">Enchanted Forest</option>');
  printWindow.document.write('<option value="style23">Aurora Sky</option>');
  printWindow.document.write('<option value="style24">Desert Mirage</option>');
  printWindow.document.write('<option value="style25">Mystic Marble</option>');
  printWindow.document.write('<option value="style26">Tropical Vibes</option>');
  printWindow.document.write('<option value="style27">Galactic Nebula</option>');
  printWindow.document.write('<option value="style28">Cosmic Watercolor</option>');
  printWindow.document.write('</select>');

  printWindow.document.write('<span>then click on print</span>');
  printWindow.document.write('<button id="print-btn">Print</button>');
  if (!targetArticle) {
    printWindow.document.write('<div style="margin-left:auto;">');
    printWindow.document.write('<button id="print-mode-btn">Hide User Messages</button>');
    printWindow.document.write('</div>');
  }
  printWindow.document.write('</div>');
  printWindow.document.write(conversationNode.outerHTML);
  printWindow.document.write('<footer>Created by <a href="https://chromewebstore.google.com/detail/superpower-chatgpt/amhmeenmapldpjdedekalnfifgnpfnkc" target="_blank" rel="noreferrer">Superpower ChatGPT</a></footer>');
  printWindow.document.write('</body></html>');
  printWindow.document.close();

  // eslint-disable-next-line func-names
  printWindow.onload = function () {
    const styleBtn = printWindow.document.getElementById('style-btn');
    styleBtn?.addEventListener('change', (e) => {
      const selectedStyle = e.target.value;
      const dynamicStyle = printWindow.document.getElementById('dynamic-style');
      dynamicStyle.innerHTML = getPDFStyle(selectedStyle);
    });

    const printBtn = printWindow.document.getElementById('print-btn');
    printBtn?.addEventListener('click', () => {
      printWindow.print();
    });

    const printModeBtn = printWindow.document.getElementById('print-mode-btn');
    printModeBtn?.addEventListener('click', () => {
      const showUserMessages = printModeBtn.textContent === 'Show User Messages';
      const articles = printWindow.document.querySelectorAll('article');
      articles.forEach((article) => {
        // if showUserMessages, show h6 tag, else hide it
        const h6 = article.querySelector('h6');
        if (h6) {
          h6.style.display = showUserMessages ? 'block' : 'none';
        }
        // data-message-author-role
        if (article.querySelector('div[data-message-author-role="user"]')) {
          article.style.display = showUserMessages ? 'block' : 'none';
        }
      });

      printModeBtn.textContent = showUserMessages ? 'Hide User Messages' : 'Show User Messages';
    });
  };
}
// eslint-disable-next-line no-unused-vars
function addProjectExportButton(url = window.location) {
  const onProject = url.pathname.startsWith('/g/g-p-') && url.pathname.endsWith('/project');
  if (!onProject) return;
  const projectTopButton = document.querySelector('button svg path[d="M8.866 5.003a2 2 0 0 1 1.227.508c.036.032.073.07.2.196l.017.017c.103.103.18.18.262.254a4 4 0 0 0 2.454 1.016c.109.006.219.006.365.006H16.2c.857 0 1.439 0 1.889.038.438.035.663.1.819.18a2 2 0 0 1 .874.874c.08.156.145.38.18.819.024.294.033.643.036 1.089H4V8.8c0-.857 0-1.439.038-1.889.035-.438.1-.663.18-.819a2 2 0 0 1 .874-.874c.156-.08.38-.145.819-.18C6.361 5 6.943 5 7.8 5h.786c.18 0 .232 0 .28.003M22 10.759c0-.805 0-1.47-.044-2.01-.046-.563-.145-1.08-.392-1.565a4 4 0 0 0-1.748-1.748c-.485-.247-1.002-.346-1.564-.392C17.71 5 17.046 5 16.242 5h-2.828c-.18 0-.232 0-.28-.003a2 2 0 0 1-1.227-.508 6 6 0 0 1-.2-.196l-.017-.017a7 7 0 0 0-.262-.254 4 4 0 0 0-2.454-1.016C8.865 3 8.755 3 8.61 3h-.85c-.805 0-1.47 0-2.01.044-.563.046-1.08.145-1.565.392a4 4 0 0 0-1.748 1.748c-.247.485-.346 1.002-.392 1.564C2 7.29 2 7.954 2 8.758v6.483c0 .805 0 1.47.044 2.01.046.563.145 1.08.392 1.565a4 4 0 0 0 1.748 1.748c.485.247 1.002.346 1.564.392C6.29 21 6.954 21 7.758 21h8.483c.805 0 1.47 0 2.01-.044.563-.046 1.08-.145 1.565-.392a4 4 0 0 0 1.748-1.748c.247-.485.346-1.002.392-1.564.044-.541.044-1.206.044-2.01zM20 12v3.2c0 .857 0 1.439-.038 1.889-.035.438-.1.663-.18.819a2 2 0 0 1-.874.874c-.156.08-.38.145-.819.18-.45.037-1.032.038-1.889.038H7.8c-.857 0-1.439 0-1.889-.038-.438-.035-.663-.1-.819-.18a2 2 0 0 1-.874-.874c-.08-.156-.145-.38-.18-.819C4 16.639 4 16.057 4 15.2V12z"]')?.closest('button');
  if (!projectTopButton) return;
  const header = projectTopButton.parentElement;
  header.classList.remove('mb-6');
  header.classList.add('relative', 'mt-10', 'mb-50');

  const exportButton = projectTopButton.cloneNode(true);
  exportButton.id = 'project-export-button';
  exportButton.classList.remove('relative');
  exportButton.classList.add('absolute', 'end-4', 'top-0');
  // remove last div from button
  exportButton.removeChild(exportButton.lastChild);
  // replace svg with export icon svg
  exportButton.querySelector('svg').insertAdjacentHTML('afterend', '<svg stroke="currentColor" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-lg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.70711 10.2929C7.31658 9.90237 6.68342 9.90237 6.29289 10.2929C5.90237 10.6834 5.90237 11.3166 6.29289 11.7071L11.2929 16.7071C11.6834 17.0976 12.3166 17.0976 12.7071 16.7071L17.7071 11.7071C18.0976 11.3166 18.0976 10.6834 17.7071 10.2929C17.3166 9.90237 16.6834 9.90237 16.2929 10.2929L13 13.5858L13 4C13 3.44771 12.5523 3 12 3C11.4477 3 11 3.44771 11 4L11 13.5858L7.70711 10.2929ZM5 19C4.44772 19 4 19.4477 4 20C4 20.5523 4.44772 21 5 21H19C19.5523 21 20 20.5523 20 20C20 19.4477 19.5523 19 19 19L5 19Z" fill="currentColor"></path></svg>');

  exportButton.querySelector('svg').remove();
  header.appendChild(exportButton);
  exportButton.addEventListener('click', async () => {
    const hasSubscription = await chrome.runtime.sendMessage({
      type: 'checkHasSubscription',
    });
    if (!hasSubscription) {
      const error = { title: 'This is a Pro feature', message: 'Exporting project conversations requires a Pro subscription. Upgrade to Pro to remove all limits.' };
      errorUpgradeConfirmation(error);
      return;
    }
    const projectId = getProjectId(url.href);
    if (!projectId) return;
    const conversations = await getProjectConversations(projectId);

    const conversationIds = conversations.map((c) => c.id);
    const curHeader = exportButton.parentElement;
    const projectName = curHeader.innerText.trim();
    openExportModal(conversationIds, 'project', projectName);
  });
}
// eslint-disable-next-line no-unused-vars
function openExportModal(selectedConversationIds = [], exportType = 'all', filename = '') { // all, folder, selected, dateRange
  clearTimeout(exportTimeout);
  exportAllCanceled = false;
  const exportAllModal = document.createElement('div');
  exportAllModal.style = 'position:fixed;top:0px;left:0px;width:100%;height:100%;z-index:100001;display:flex;align-items:center;justify-content:center;';
  exportAllModal.classList = 'bg-black/50 dark:bg-black/80 text-token-text-primary';
  exportAllModal.id = 'export-all-modal';
  exportAllModal.addEventListener('click', (e) => {
    // export-all-modal-progress-bar-fill
    const exportAllModalProgressBarFill = document.querySelector('#export-all-modal-progress-bar-fill');
    if (e.target.id === 'export-all-modal' && (exportAllModalProgressBarFill.style.width === '0%' || exportAllModalProgressBarFill.style.width === '100%')) {
      exportAllModal.remove();
    }
  });

  const exportAllModalBody = document.createElement('div');
  exportAllModalBody.style = 'max-width:650px; min-width: 500px;min-height:300px;';
  exportAllModalBody.classList = 'bg-token-main-surface-primary rounded-md flex flex-col items-start justify-start border border-token-border-medium relative shadow-md';

  exportAllModal.appendChild(exportAllModalBody);

  const exportAllModalHeader = document.createElement('div');
  exportAllModalHeader.classList = 'w-full';
  const title = {
    all: 'Export All Conversations',
    folder: 'Export Folder Conversations',
    selected: 'Export Selected Conversations',
    current: 'Export Current Conversation',
    dateRange: 'Export Conversation in Date Range',
    project: 'Export All Conversations in Project',
  };
  exportAllModalHeader.innerHTML = `
  <div class="px-4 pb-4 pt-5 flex items-center justify-between border-b border-token-border-medium">
    <div class="flex">
      <div class="flex items-center">
        <div class="flex grow gap-1">
          <h2 as="h3" class="text-lg font-medium leading-6 text-token-text-tertiary">
          ${translate(title[exportType])} </h2>
          <a href="https://www.youtube.com/watch?v=aDeU0A5gxMQ&ab_channel=SuperpowerChatGPT" target="_blank" rel="noreferrer"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md ps-0.5 text-token-text-tertiary h-5 w-5 ms-2"><path fill="currentColor" d="M13 12a1 1 0 1 0-2 0v4a1 1 0 1 0 2 0zM12 9.5A1.25 1.25 0 1 0 12 7a1.25 1.25 0 0 0 0 2.5"></path><path fill="currentColor" fill-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2M4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0" clip-rule="evenodd"></path></svg></a>
          </div>
      </div>
    </div>
  </div>`;

  exportAllModalBody.appendChild(exportAllModalHeader);
  // const exportAllModalDescription = document.createElement('div');
  // exportAllModalDescription.style = 'font-size:0.875rem;color:#565869;';
  // exportAllModalDescription.textContent = 'This can take a few seconds.';
  // exportAllModalContent.appendChild(exportAllModalDescription);

  const exportAllModalContent = document.createElement('div');
  exportAllModalContent.classList = 'w-full h-full flex flex-col items-start justify-start relative p-4';

  exportAllModalBody.appendChild(exportAllModalContent);

  // How would you like to export the conversation?
  // 2 radio options: Export onlt ChatGPT messages, Export both ChatGPT and User messages
  const exportAllModalExportModeTitle = document.createElement('div');
  exportAllModalExportModeTitle.classList = 'font-semibold text-token-text-primary my-1';
  exportAllModalExportModeTitle.textContent = translate('How would you like to export the conversation?');
  exportAllModalContent.appendChild(exportAllModalExportModeTitle);
  const exportAllModalExportModeWrapper = document.createElement('div');
  exportAllModalExportModeWrapper.classList = 'flex flex-wrap items-start justify-start w-full mt-2 text-token-text-tertiary';
  exportAllModalContent.appendChild(exportAllModalExportModeWrapper);
  const exportAllModalExportModeOptions = [
    {
      id: 'export-all-modal-chatgpt-checkbox',
      name: 'export-all-modal-export-mode',
      value: 'chatgpt',
      label: 'ChatGPT messages only',
    },
    {
      id: 'export-all-modal-all-checkbox',
      name: 'export-all-modal-export-mode',
      value: 'all',
      label: 'ChatGPT and User messages',
    },
  ];

  // onchange event listener for checkboxes
  const exportAllModalExportModeOnChange = (e) => {
    chrome.storage.local.set({
      settings: {
        ...cachedSettings,
        exportMode: e.target.value === 'all',
      },

    });
  };

  const { exportMode } = cachedSettings;
  exportAllModalExportModeOptions.forEach((exportModeOption) => {
    const exportAllModalCheckboxWrapper = document.createElement('div');
    exportAllModalCheckboxWrapper.classList = 'w-full ps-3 my-1';
    exportAllModalExportModeWrapper.appendChild(exportAllModalCheckboxWrapper);
    const exportAllModalCheckbox = document.createElement('input');
    exportAllModalCheckbox.type = 'radio';
    exportAllModalCheckbox.id = exportModeOption.id;
    exportAllModalCheckbox.name = exportModeOption.name;
    exportAllModalCheckbox.value = exportModeOption.value;
    exportAllModalCheckbox.checked = exportModeOption.value === (exportMode ? 'all' : 'chatgpt');
    exportAllModalCheckbox.addEventListener('change', exportAllModalExportModeOnChange);
    exportAllModalCheckboxWrapper.appendChild(exportAllModalCheckbox);
    const exportAllModalCheckboxLabel = document.createElement('label');
    exportAllModalCheckboxLabel.htmlFor = exportModeOption.id;
    exportAllModalCheckboxLabel.style = 'font-size:0.875rem;margin-left:8px;';
    exportAllModalCheckboxLabel.textContent = exportModeOption.label;
    exportAllModalCheckboxWrapper.appendChild(exportAllModalCheckboxLabel);
  });

  // 3 checkboxes in a row for export format: input/label, input/label, input/label
  const exportAllModalFormatTitle = document.createElement('div');
  exportAllModalFormatTitle.classList = 'font-semibold text-token-text-primary mt-6 mb-1';
  exportAllModalFormatTitle.textContent = translate('Select the format(s) for export');
  exportAllModalContent.appendChild(exportAllModalFormatTitle);
  const exportAllModalFormatCheckboxWrapper = document.createElement('div');
  exportAllModalFormatCheckboxWrapper.classList = 'flex items-center justify-between w-full mt-2 text-token-text-tertiary px-2';
  exportAllModalContent.appendChild(exportAllModalFormatCheckboxWrapper);
  const exportAllModalFormatOptions = [
    {
      id: 'export-all-modal-markdown-checkbox',
      name: 'export-all-modal-checkbox',
      value: 'markdown',
      label: 'Markdown',
    },
    {
      id: 'export-all-modal-json-checkbox',
      name: 'export-all-modal-checkbox',
      value: 'json',
      label: 'Json',
    },
    {
      id: 'export-all-modal-text-checkbox',
      name: 'export-all-modal-checkbox',
      value: 'text',
      label: 'Text',
    },
  ];
  let exportFormats = [];
  // onchange event listener for checkboxes
  const exportAllModalFormatOnChange = (e) => {
    const { checked, value } = e.target;
    if (checked) {
      exportFormats.push(value);
    } else {
      exportFormats = exportFormats.filter((format) => format !== value);
    }

    // enable/disable copy button
    const exportAllModalCopyButton = document.querySelector('#export-all-modal-copy-button');
    if (exportAllModalCopyButton) {
      exportAllModalCopyButton.style.opacity = (selectedConversationIds.length === 1 && exportFormats.length === 1) ? '1' : '0.5';
      exportAllModalCopyButton.disabled = selectedConversationIds.length !== 1 || exportFormats.length !== 1;
      exportAllModalCopyButton.title = (selectedConversationIds.length !== 1 || exportFormats.length !== 1) ? 'Copy only works when selecting single conversation and single format' : '';
    }
    // enable/disable pdf button
    const exportAllModalPDFButton = document.querySelector('#export-all-modal-pdf-button');
    if (exportAllModalPDFButton) {
      exportAllModalPDFButton.style.opacity = (selectedConversationIds.length === 1 && exportFormats.length === 0) ? '1' : '0.5';
      exportAllModalPDFButton.disabled = selectedConversationIds?.length !== 1 || exportFormats.length !== 0;
      exportAllModalPDFButton.title = (selectedConversationIds?.length !== 1 || exportFormats.length !== 0) ? 'Save as PDF only works when selecting single conversation and no format' : '';
    }

    // enable/disable export button
    const exportAllModalExportButton = document.querySelector('#export-all-modal-export-button');
    exportAllModalExportButton.style.opacity = exportFormats.length === 0 ? '0.5' : '1';
    exportAllModalExportButton.disabled = exportFormats.length === 0;
  };
  exportAllModalFormatOptions.forEach((formatOption) => {
    const exportAllModalCheckboxWrapper = document.createElement('div');
    exportAllModalCheckboxWrapper.style = 'display:flex;align-items:center;justify-content:center;';
    exportAllModalFormatCheckboxWrapper.appendChild(exportAllModalCheckboxWrapper);
    const exportAllModalCheckbox = document.createElement('input');
    exportAllModalCheckbox.type = 'checkbox';
    exportAllModalCheckbox.id = formatOption.id;
    exportAllModalCheckbox.name = formatOption.name;
    exportAllModalCheckbox.value = formatOption.value;
    exportAllModalCheckbox.checked = false;
    exportAllModalCheckbox.addEventListener('change', exportAllModalFormatOnChange);
    exportAllModalCheckboxWrapper.appendChild(exportAllModalCheckbox);
    const exportAllModalCheckboxLabel = document.createElement('label');
    exportAllModalCheckboxLabel.htmlFor = formatOption.id;
    exportAllModalCheckboxLabel.style = 'font-size:0.875rem;margin-left:8px;';
    exportAllModalCheckboxLabel.textContent = formatOption.label;

    exportAllModalCheckboxWrapper.appendChild(exportAllModalCheckboxLabel);
  });

  // progress bar label
  const exportAllModalProgressBarLabel = document.createElement('div');
  exportAllModalProgressBarLabel.id = 'export-all-modal-progress-bar-label';
  exportAllModalProgressBarLabel.style = 'font-size:0.875rem;margin:32px auto 8px;';
  exportAllModalProgressBarLabel.textContent = `0 / ${selectedConversationIds?.length || '--'} `;

  exportAllModalContent.appendChild(exportAllModalProgressBarLabel);
  // progress bar
  const exportAllModalProgressBar = document.createElement('div');
  exportAllModalProgressBar.id = 'export-all-modal-progress-bar';
  exportAllModalProgressBar.style = 'min-height:12px;';
  exportAllModalProgressBar.classList = 'bg-token-main-surface-tertiary relative w-full h-3 rounded-md overflow-hidden';
  exportAllModalContent.appendChild(exportAllModalProgressBar);

  const exportAllModalProgressBarFill = document.createElement('div');
  exportAllModalProgressBarFill.id = 'export-all-modal-progress-bar-fill';
  exportAllModalProgressBarFill.style = 'position:absolute;top:0px;left:0px;width:0%;height:12px;min-height:12px;background-color:gold;border-radius:4px;';
  exportAllModalProgressBar.appendChild(exportAllModalProgressBarFill);
  // progress bar filename
  const exportAllModalProgressBarFilename = document.createElement('div');
  exportAllModalProgressBarFilename.id = 'export-all-modal-progress-bar-filename';
  exportAllModalProgressBarFilename.style = 'font-size:0.875rem;margin:8px auto 32px;';
  exportAllModalProgressBarFilename.classList = 'truncate w-full text-token-text-tertiary';
  exportAllModalProgressBarFilename.textContent = ' ';
  exportAllModalContent.appendChild(exportAllModalProgressBarFilename);

  // modal action wrapper
  const exportAllModalActionWrapper = document.createElement('div');
  exportAllModalActionWrapper.classList = 'mt-auto w-full flex items-center justify-end gap-2';
  exportAllModalContent.appendChild(exportAllModalActionWrapper);

  // include archived checkbox
  const includeArchivedCheckboxWrapper = document.createElement('div');
  includeArchivedCheckboxWrapper.style = 'display:flex;align-items:center;justify-content:center;margin-right:auto;';
  exportAllModalActionWrapper.appendChild(includeArchivedCheckboxWrapper);
  const includeArchivedCheckbox = document.createElement('input');
  includeArchivedCheckbox.type = 'checkbox';
  includeArchivedCheckbox.id = 'export-all-modal-include-archived-checkbox';
  includeArchivedCheckbox.name = 'export-all-modal-include-archived-checkbox';
  includeArchivedCheckbox.value = 'includeArchived';
  includeArchivedCheckbox.checked = true;
  // includeArchivedCheckbox.addEventListener('change', includeArchivedOnChange);
  includeArchivedCheckboxWrapper.appendChild(includeArchivedCheckbox);
  const includeArchivedCheckboxLabel = document.createElement('label');
  includeArchivedCheckboxLabel.htmlFor = 'export-all-modal-include-archived-checkbox';
  includeArchivedCheckboxLabel.style = 'font-size:0.875rem;margin-left:8px;';
  includeArchivedCheckboxLabel.classList = 'text-token-text-tertiary';
  includeArchivedCheckboxLabel.textContent = translate('Include archived conversations');

  includeArchivedCheckboxWrapper.appendChild(includeArchivedCheckboxLabel);
  // cancel button
  const exportAllModalCancelButton = document.createElement('button');
  exportAllModalCancelButton.classList = 'btn relative btn-secondary';
  exportAllModalCancelButton.textContent = translate('Cancel');
  exportAllModalCancelButton.addEventListener('click', () => {
    exportAllCanceled = true;
    // Get a reference to the last interval + 1
    const intervalId = setInterval(() => { }, Number.MAX_SAFE_INTEGER);
    // Clear any timeout/interval up to that id
    for (let i = 1; i < intervalId; i += 1) {
      clearInterval(i);
    }
    clearTimeout(exportTimeout);

    exportAllModal.remove();
  });
  exportAllModalActionWrapper.appendChild(exportAllModalCancelButton);

  // copy button
  const exportAllModalCopyButton = document.createElement('button');
  exportAllModalCopyButton.id = 'export-all-modal-copy-button';
  exportAllModalCopyButton.classList = 'btn relative btn-primary';
  exportAllModalCopyButton.style.opacity = (selectedConversationIds?.length === 0 || exportFormats.length !== 1) ? '0.5' : '1';
  exportAllModalCopyButton.textContent = translate('Copy to clipboard');
  exportAllModalCopyButton.disabled = selectedConversationIds?.length !== 1 || exportFormats?.length !== 1;
  exportAllModalCopyButton.title = (selectedConversationIds?.length !== 1 || exportFormats?.length !== 1) ? 'Copy to clipboard only works when selecting single conversation and single format' : '';
  exportAllModalCopyButton.addEventListener('click', () => {
    exportAllCanceled = false;
    exportAllModalCopyButton.disabled = true;
    const formatCheckboxes = document.querySelectorAll('input[name="export-all-modal-checkbox"]');
    formatCheckboxes.forEach((formatCheckbox) => {
      formatCheckbox.disabled = true;
    });
    exportSelectedConversations(exportFormats, selectedConversationIds, 'copy');
  });
  exportAllModalActionWrapper.appendChild(exportAllModalCopyButton);

  // PDF button
  const exportAllModalPDFButton = document.createElement('button');
  exportAllModalPDFButton.id = 'export-all-modal-pdf-button';
  exportAllModalPDFButton.classList = 'btn relative btn-primary';
  exportAllModalPDFButton.style.opacity = (selectedConversationIds?.length !== 1 || exportFormats.length !== 0) ? '0.5' : '1';
  exportAllModalPDFButton.disabled = selectedConversationIds?.length !== 1 || exportFormats.length !== 0;
  exportAllModalPDFButton.title = (selectedConversationIds?.length !== 1 || exportFormats.length !== 0) ? 'Save as PDF only works when selecting single conversation and no format' : '';

  exportAllModalPDFButton.textContent = translate('Save as PDF');
  exportAllModalPDFButton.addEventListener('click', () => {
    saveConversationAsPDF(selectedConversationIds[0]);
  });
  exportAllModalActionWrapper.appendChild(exportAllModalPDFButton);

  // export button
  const exportAllModalExportButton = document.createElement('button');
  exportAllModalExportButton.id = 'export-all-modal-export-button';
  exportAllModalExportButton.classList = 'btn relative btn-primary';
  exportAllModalExportButton.style.opacity = (selectedConversationIds?.length === 0 || exportFormats.length === 0) ? '0.5' : '1';
  exportAllModalExportButton.textContent = translate('Export');
  exportAllModalExportButton.disabled = (selectedConversationIds?.length === 0 || exportFormats.length === 0);
  exportAllModalExportButton.addEventListener('click', () => {
    exportAllCanceled = false;
    exportAllModalExportButton.disabled = true;
    exportAllModalExportButton.innerText = `${translate('Exporting')}...`;
    exportAllModalExportButton.appendChild(loadingSpinner('export-all-modal-export-button'));
    const formatCheckboxes = document.querySelectorAll('input[name="export-all-modal-checkbox"]');
    formatCheckboxes.forEach((formatCheckbox) => {
      formatCheckbox.disabled = true;
    });
    exportSelectedConversations(exportFormats, selectedConversationIds, 'export', filename);
  });
  exportAllModalActionWrapper.appendChild(exportAllModalExportButton);

  if (selectedConversationIds?.length === 0) {
    getConversations(0, 1).then((conversations) => {
      const { total } = conversations;
      chrome.storage.local.set({ totalConversations: total });
      exportAllModalProgressBarLabel.textContent = `0 / ${total} `;
      exportAllModalExportButton.disabled = total === 0 || exportFormats.length === 0;
      exportAllModalExportButton.style.opacity = (total === 0 || exportFormats.length === 0) ? '0.5' : '1';
    }, () => {
      exportAllModalProgressBarLabel.textContent = 'You don\'t have any conversations.';
    });
  }

  document.body.appendChild(exportAllModal);
}
