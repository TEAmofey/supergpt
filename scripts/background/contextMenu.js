/* global getPrompt, getAllFavoritePrompts */
chrome.contextMenus.onClicked.addListener(genericOnClick);
let newChat = true;
// A generic onclick callback function.
async function checkHasPermission(permissions) {
  const hasPermission = await chrome.permissions.contains({
    permissions,
  });
  return hasPermission;
}
async function askForPermisson(permissions) {
  const granted = await chrome.permissions.request({
    permissions,
  });
  return granted;
}
async function removePermission(permissions) {
  const removed = await chrome.permissions.remove({
    permissions,
  });
  return removed;
}
// removePermission(['tabs', 'activeTab']);
async function genericOnClick(info) {
  if (info.menuItemId === 'learnMore') {
    chrome.tabs.create({ url: 'https://youtu.be/u3LSii5XOO8?si=nDvoFW-EyL--llfD' });
  } else if (info.menuItemId === 'newChat') {
    newChat = true;
  } else if (info.menuItemId === 'currentChat') {
    newChat = false;
  } else if (info.menuItemId === 'requestScreenshotPermission') {
    const granted = await askForPermisson(['tabs', 'activeTab']);
    if (granted) {
      chrome.contextMenus.removeAll(() => {
        addCustomPromptContextMenu();
      });
    }
  } else if (info.menuItemId === 'takeScreenshot') {
    const hasPermission = await checkHasPermission(['tabs', 'activeTab']);
    // show alert if no permission
    if (!hasPermission) {
      return;
    }

    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      if (dataUrl) {
        chrome.tabs.query({ url: 'https://chatgpt.com/*' }, (tabs) => {
          const chatGPTTab = tabs[0];
          if (chatGPTTab) {
            chrome.tabs.update(chatGPTTab.id, { active: true }).then(() => {
              chrome.tabs.sendMessage(chatGPTTab.id, {
                newChat,
                action: 'insertScreenshot',
                screenshot: dataUrl,
              });
            });
          } else {
            chrome.tabs.create({ url: 'https://chatgpt.com/' }).then((tab) => {
              chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
                if (tabId === tab.id && changeInfo.status === 'complete') {
                  setTimeout(() => {
                    chrome.tabs.sendMessage(tab.id, {
                      newChat,
                      action: 'insertScreenshot',
                      screenshot: dataUrl,
                    });
                  }, 3000);
                  chrome.tabs.onUpdated.removeListener(listener);
                }
              });
            });
          }
        });
      }
    });
  } else if (info.menuItemId === 'sendImage') {
    const imageUrl = info.srcUrl;
    chrome.tabs.query({ url: 'https://chatgpt.com/*' }, (tabs) => {
      const chatGPTTab = tabs[0];
      if (chatGPTTab) {
        chrome.tabs.update(chatGPTTab.id, { active: true }).then(() => {
          chrome.tabs.sendMessage(chatGPTTab.id, {
            newChat,
            action: 'insertImage',
            imageUrl,
          });
        });
      } else {
        chrome.tabs.create({ url: 'https://chatgpt.com/' }).then((tab) => {
          chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
            if (tabId === tab.id && changeInfo.status === 'complete') {
              setTimeout(() => {
                chrome.tabs.sendMessage(tab.id, {
                  newChat,
                  action: 'insertImage',
                  imageUrl,
                });
              }, 3000);
              chrome.tabs.onUpdated.removeListener(listener);
            }
          });
        });
      }
    });
  } else {
    chrome.storage.sync.get(['hashAcessToken'], (result) => {
      if (!result.hashAcessToken) {
        return;
      }
      const backupHeaders = { 'Hat-Token': result.hashAcessToken };
      getPrompt(info.menuItemId, backupHeaders).then((prompt) => {
        // get chatgpt tab
        chrome.tabs.query({ url: 'https://chatgpt.com/*' }, (tabs) => {
          const chatGPTTab = tabs[0];
          if (chatGPTTab) {
            chrome.tabs.update(chatGPTTab.id, { active: true }).then(() => {
              chrome.tabs.sendMessage(chatGPTTab.id, {
                newChat,
                action: 'insertPrompt',
                prompt,
                selectionText: info.selectionText,
              });
            });
          } else {
            chrome.tabs.create({ url: 'https://chatgpt.com/' }).then((tab) => {
              chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
                if (tabId === tab.id && changeInfo.status === 'complete') {
                  setTimeout(() => {
                    chrome.tabs.sendMessage(tab.id, {
                      newChat,
                      action: 'insertPrompt',
                      prompt,
                      selectionText: info.selectionText,
                    });
                  }, 3000);
                  chrome.tabs.onUpdated.removeListener(listener);
                }
              });
            });
          }
        });
      });
    });
  }
}
chrome.runtime.onInstalled.addListener(() => {
  addCustomPromptContextMenu();
});

async function addCustomPromptContextMenu() {
  const hasPermission = await checkHasPermission(['tabs', 'activeTab']);
  chrome.storage.sync.get(['hashAcessToken'], (result) => {
    if (!result.hashAcessToken) {
      return;
    }
    const backupHeaders = { 'Hat-Token': result.hashAcessToken };
    getAllFavoritePrompts(backupHeaders).then((prompts) => {
      // send image (it has to be first lavel menu)
      chrome.contextMenus.create({
        title: 'Send Image to ChatGPT',
        contexts: ['image'],
        id: 'sendImage',
      });

      const superpowerMenu = chrome.contextMenus.create({
        title: 'Superpower ChatGPT Pro',
        contexts: ['page', 'selection'],
        id: 'superpower',
      });
      // if no selection, show Please select some text
      chrome.contextMenus.create({
        title: 'Select some text to see your prompts',
        contexts: ['page'],
        parentId: superpowerMenu,
        id: 'noSelection',
      });
      // add divider
      chrome.contextMenus.create({
        id: 'divider1',
        type: 'separator',
        parentId: superpowerMenu,
      });
      // add custom prompts
      if (prompts && prompts.length > 0) {
        prompts.sort((a, b) => a.title - b.title).forEach((prompt) => {
          chrome.contextMenus.create({
            title: `${prompt.title.substring(0, 20)}${prompt.title.length > 20 ? '...' : ''} - (${prompt.steps.length} ${prompt.steps.length > 1 ? 'steps' : 'step'})`,
            contexts: ['selection'],
            parentId: superpowerMenu,
            id: prompt.id.toString(),
          });
        });
      }
      chrome.contextMenus.create({
        id: 'divider2',
        type: 'separator',
        contexts: ['page', 'selection'],
        parentId: superpowerMenu,
      });
      // send screenshot
      chrome.contextMenus.create({
        title: hasPermission ? 'Send Screenshot to ChatGPT' : 'Allow to Send Screenshot to ChatGPT',
        contexts: ['page', 'selection'],
        parentId: superpowerMenu,
        id: hasPermission ? 'takeScreenshot' : 'requestScreenshotPermission',
      });
      chrome.contextMenus.create({
        id: 'divider3',
        type: 'separator',
        contexts: ['page', 'selection'],
        parentId: superpowerMenu,
      });
      const newChatSettingsMenu = chrome.contextMenus.create({
        title: 'When you select a prompt or screenshot',
        contexts: ['page', 'selection'],
        id: 'newChatSettings',
        parentId: superpowerMenu,
      });
      // add two options: new chat and current chat
      chrome.contextMenus.create({
        title: 'Start a New Chat',
        contexts: ['page', 'selection'],
        parentId: newChatSettingsMenu,
        id: 'newChat',
        type: 'radio',
      });
      chrome.contextMenus.create({
        title: 'Continue Current Chat',
        contexts: ['page', 'selection'],
        parentId: newChatSettingsMenu,
        id: 'currentChat',
        type: 'radio',
      });
      // add learn more
      chrome.contextMenus.create({
        title: 'Learn more ➜',
        contexts: ['page', 'selection'],
        parentId: superpowerMenu,
        id: 'learnMore',
      });
    });
  });
}
