/* global getChatRequirements, replaceTextAreaElement */
/* eslint-disable no-restricted-globals */

const sid = self.crypto.randomUUID();

// eslint-disable-next-line no-unused-vars
function arkoseTrigger() {
  window.localStorage.removeItem('sp/arkoseToken');

  chrome.storage.local.get(['settings'], ({
    settings,
  }) => {
    // const isPaid = account?.accounts?.[chatgptAccountId || 'default']?.entitlement?.has_active_subscription || false;
    // const isGPT4 = selectedModel?.tags?.includes('gpt4');
    const inputForm = document.querySelector('main form');
    if (!inputForm) {
      const presentation = document.querySelector('main div[role=presentation]');
      if (presentation.childNodes.length > 1) {
        presentation.lastChild.remove();
      }
      replaceTextAreaElement(settings);
    }
    getChatRequirements().then((res) => {
      // trigger arkose
      const foundArkoseSetups = JSON.parse(window.localStorage.getItem('sp/arkoseSetups') || '[]');
      if (foundArkoseSetups.length > 0 && res.arkoseDX && res.arkoseDX !== 'undefined') {
        if (!inputForm.querySelector('#enforcement-trigger')) {
          inputForm.firstChild.insertAdjacentHTML('beforeend', '<button type="button" class="hidden" id="enforcement-trigger"></button>');
        }
        inputForm.querySelector('#enforcement-trigger').click();
      }
    });
  });
}

// eslint-disable-next-line no-unused-vars
async function processChatRequirements(data) {
  const { proofofwork, turnstile } = data;
  const { seed, difficulty } = proofofwork;
  if (proofofwork.required) {
    const proofOfWorkToken = await generateProofToken(seed, difficulty);
    window.localStorage.setItem('sp/proofOfWorkToken', proofOfWorkToken);
  } else {
    window.localStorage.setItem('sp/proofOfWorkToken', 'undefined');
  }

  if (turnstile.required && turnstile.dx) {
    initializeTurnstileToken(window.localStorage.getItem('sp/chatRequirementsPayload'));
    const turnstileToken = await generateTurnstileToken(turnstile.dx);

    window.localStorage.setItem('sp/turnstileToken', turnstileToken);
  } else {
    window.localStorage.setItem('sp/turnstileToken', 'undefined');
  }
  window.localStorage.setItem('sp/chatRequirementsToken', data.token);
  window.localStorage.setItem('sp/arkoseDX', data.arkose?.dx);
}
// eslint-disable-next-line no-unused-vars
function resetChatRequirements() {
  window.localStorage.removeItem('sp/proofOfWorkToken');
  window.localStorage.removeItem('sp/chatRequirementsToken');
  window.localStorage.removeItem('sp/turnstileToken');
  window.localStorage.removeItem('sp/arkoseDX');
  getChatRequirements();
}
// eslint-disable-next-line no-unused-vars
function checkArkoseDX() {
  const foundArkoseSetups = JSON.parse(window.localStorage.getItem('sp/arkoseSetups') || '[]');
  if (foundArkoseSetups.length > 0) {
    const arkoseDX = window.localStorage.getItem('sp/arkoseDX');
    if (!arkoseDX) {
      getChatRequirements().then((res) => {
        // refresh page
        if (res.arkoseDX) window.location.reload();
      });
    }
  }
}
// turnstileToken
const operationMap = new Map();

function initializeTurnstileToken(input) {
  setupTurnstileToken();
  operationMap.set(16, input);
}

function xorDecrypt(input, key) {
  let output = '';
  for (let i = 0; i < input.length; i += 1) {
    output += String.fromCharCode(
      // eslint-disable-next-line no-bitwise
      input.charCodeAt(i) ^ key.charCodeAt(i % key.length),
    );
  }
  return output;
}

function generateTurnstileToken(turnstileDX) {
  operationMap.set(16, window.localStorage.getItem('sp/chatRequirementsPayload'));

  return new Promise((resolve, reject) => {
    let counter = 0;
    setTimeout(() => resolve(`${counter}`), 100);
    operationMap.set(3, (e) => resolve(btoa(`${e}`)));
    operationMap.set(4, (e) => reject(btoa(`${e}`)));
    try {
      for (
        operationMap.set(9, JSON.parse(xorDecrypt(atob(turnstileDX), `${operationMap.get(16)}`)));
        operationMap.get(9).length > 0;
      ) {
        const [opCode, ...params] = operationMap.get(9).shift();
        operationMap.get(opCode)(...params);
        counter += 1;
      }
      resolve(btoa(`${counter}`));
    } catch (error) {
      // console.warn('Turnstile Error:', error);
      resolve(btoa(`${counter}: ${error}`));
    }
  });
}
function setupTurnstileToken(input) {
  operationMap.clear();
  operationMap.set(0, generateTurnstileToken);
  operationMap.set(1, (e, t) => operationMap.set(e, xorDecrypt(`${operationMap.get(e)}`, `${operationMap.get(t)}`)));
  operationMap.set(2, (e, t) => operationMap.set(e, t));
  operationMap.set(5, (e, t) => {
    const n = operationMap.get(e);
    // eslint-disable-next-line no-unused-expressions
    Array.isArray(n) ? n.push(operationMap.get(t)) : operationMap.set(e, n + operationMap.get(t));
  });
  operationMap.set(6, (e, t, n) => operationMap.set(e, operationMap.get(t)?.[operationMap.get(n)]));
  operationMap.set(7, (e, ...args) => {
    // eslint-disable-next-line no-unused-expressions
    operationMap.get(e) && operationMap.get(e)(...args.map((v) => operationMap.get(v)));
  });
  operationMap.set(17, (e, t, ...args) => operationMap.get(t) && operationMap.set(e, operationMap.get(t)(...args.map((v) => operationMap.get(v)))));
  operationMap.set(13, (e, t, ...args) => {
    try {
      operationMap.get(t)(...args);
    } catch (error) {
      operationMap.set(e, `${error}`);
    }
  });
  operationMap.set(8, (e, t) => operationMap.set(e, operationMap.get(t)));
  operationMap.set(10, window);
  operationMap.set(11, (e, t) => {
    const scriptSources = Array.from(document.scripts || [])
      .map((script) => script?.src?.match(operationMap.get(t)))
      .filter((match) => match?.length);
    const firstMatch = scriptSources[0] ?? null;
    operationMap.set(e, firstMatch ? firstMatch[0] : null);
  });
  operationMap.set(12, (e) => operationMap.set(e, operationMap));
  operationMap.set(14, (e, t) => operationMap.set(e, JSON.parse(`${operationMap.get(t)}`)));
  operationMap.set(15, (e, t) => operationMap.set(e, JSON.stringify(operationMap.get(t))));
  operationMap.set(18, (e) => operationMap.set(e, atob(`${operationMap.get(e)}`)));
  operationMap.set(19, (e) => operationMap.set(e, btoa(`${operationMap.get(e)}`)));
  operationMap.set(20, (e, t, n, ...args) => {
    // eslint-disable-next-line no-unused-expressions
    operationMap.get(e) === operationMap.get(t) && operationMap.get(n)(...args);
  });
  operationMap.set(21, (e, t, n, i, ...args) => (Math.abs(operationMap.get(e) - operationMap.get(t)) > operationMap.get(n)
    ? operationMap.get(i)(...args)
    : null));
  operationMap.set(23, (e, t, ...args) => (undefined !== operationMap.get(e) ? operationMap.get(t)(...args) : null));
  operationMap.set(24, (e, t, n) => operationMap.set(e, operationMap.get(t)[operationMap.get(n)].bind(operationMap.get(t))));
  operationMap.set(22, () => { });
  operationMap.set(25, () => { });
  operationMap.set(16, input);
}

// proofOfWorkToken
async function generateProofToken(seed, difficulty) {
  let errorToken = 'e';
  const startTime = performance.now();

  try {
    let idleResult = null;
    const config = proofTokenGetConfig();
    for (let attempt = 0; attempt < 500000; attempt += 1) {
      if (attempt > 5000 && attempt % 500 === 0) console.warn('>> attempt', attempt);
      if (!idleResult || idleResult.timeRemaining() <= 0) {
        // eslint-disable-next-line no-await-in-loop
        idleResult = await new Promise((resolve) => {
          const requestIdleCallback = window.requestIdleCallback ? window.requestIdleCallback.bind(window) : undefined;
          // eslint-disable-next-line func-names
          (requestIdleCallback || function (callback) {
            setTimeout(() => callback({ timeRemaining: () => 1, didTimeout: false }), 0);
          })((result) => {
            resolve(result);
          });
        });
      }

      config[3] = attempt;
      config[9] = Math.round(performance.now() - startTime);

      const generatedToken = proofTokenGenerateHash(config);
      // eslint-disable-next-line no-await-in-loop
      if (true) { // (await hashwasm.sha3(seed + generatedToken)).substring(0, difficulty.length) <= difficulty) {
        // console.warn('>> generateProofToken success');
        return `gAAAAAB${generatedToken}`;
      }
    }
    console.warn('GPT failed - 1');
  } catch (error) {
    console.warn('GPT failed - 2');
    errorToken = proofTokenGenerateHash(`${error}`);
  }
  return `wQ8Lk5FbGpA2NcR9dShT6gYjU7VxZ4D${errorToken}`;
}

function proofTokenGetConfig() {
  return [
    (navigator?.hardwareConcurrency || '') + (window.screen?.width || '') + (window.screen?.height || ''),
    `${new Date()}`,
    performance?.memory?.jsHeapSizeLimit || '',
    Math.random(),
    navigator?.userAgent || '',
    getRandomElement(
      Array.from(document.scripts)
        .map((script) => script?.src)
        .filter((src) => src),
    ),
    (
      Array.from(document.scripts || [])
        .map((script) => script?.src.match('dpl.*'))
        .filter((match) => match?.length)[0] || []
    )[0] || null,
    navigator.language,
    navigator.languages?.join(',') || '',
    Math.random(),
    (() => {
      const key = getRandomElement(Object.keys(Object.getPrototypeOf(navigator)));
      try {
        return `${key}−${navigator[key].toString()}`;
      } catch {
        return `${key}`;
      }
    })(),
    getRandomElement(Object.keys(document)),
    getRandomElement(Object.keys(window)),
    performance.now(),
    sid,
  ];
}
function getRandomElement(e) {
  return e[Math.floor(Math.random() * e.length)];
}
function proofTokenGenerateHash(input) {
  if (window.TextEncoder) {
    return btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(input))));
  }
  return btoa(unescape(encodeURIComponent(JSON.stringify(input))));
}
