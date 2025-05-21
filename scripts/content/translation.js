let translation = {};
// eslint-disable-next-line no-unused-vars
async function setTranslation() {
  const language = window.localStorage.getItem('oai/apps/locale')?.replace(/['"]+/g, '')?.split('-')[0] || 'en';
  // try getting the translation file. If it fails, use the english translation(en/messages.json)
  // check if the translation file exist
  try {
    const response = await fetch(chrome.runtime.getURL(`_locales/${language}/messages.json`));
    translation = await response.json();
  } catch (error) {
    const response = await fetch(chrome.runtime.getURL('_locales/en/messages.json'));
    translation = await response.json();
  }
}
// eslint-disable-next-line no-unused-vars
function translate(key) {
  // replace all space and hyphen with underscore
  const newKey = key.toLowerCase().replace(/[- ]/g, '_');
  return translation[newKey]?.message || key;
}
