/* eslint-disable no-unused-vars */
function newUseArkoseSetupEnforcement(e) {
  e.setConfig({
    data: { blob: window.localStorage.getItem('sp/arkoseDX') },
    selector: '#enforcement-trigger',
    onCompleted(x) {
      // console.warn('onCompleted4', x);
      window.localStorage.setItem('sp/arkoseToken', x.token);
      const arkoseDX = window.localStorage.getItem('sp/arkoseDX');
      if (arkoseDX && arkoseDX !== 'undefined') {
        e.setConfig({ data: { blob: arkoseDX } });
      }
    },
    onError(x) {
      console.warn('onError', x);
    },
    onFailed(x) {
      console.warn('onFailed', x);
    },
    onShown(x) {
      // console.warn('onShown', x);
    },
    onReady(x) {
      // console.warn('onReady', x);
    },
  });
}
const defaultArkoseSetups = ['useArkoseSetupEnforcementchatgpt-paid', 'useArkoseSetupEnforcementchatgpt-freeaccount', 'useArkoseSetupEnforcementchatgpt-noauth', 'useArkoseSetupEnforcementpaid', 'useArkoseSetupEnforcementfreeaccount', 'useArkoseSetupEnforcementnoauth'];
const foundArkoseSetups = JSON.parse(window.localStorage.getItem('sp/arkoseSetups') || '[]');
const newArkoseSetups = foundArkoseSetups.length > 0 ? foundArkoseSetups : defaultArkoseSetups;

const overrideArkoseSetups = newArkoseSetups.reduce((acc, trigger) => {
  acc[trigger] = {
    configurable: true,
    get() {
      const isFirefox = window.navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
      const isOnGizmoEditor = window.location.href.includes('gpts/editor');

      if (isOnGizmoEditor || (window.localStorage.getItem('sp/autoSync') || 'true') !== 'true') {
        return this.value;
      }
      return newUseArkoseSetupEnforcement;
    },
    set(val) {
      this.value = val;
    },
  };
  return acc;
}, {});

Object.defineProperties(window, overrideArkoseSetups);

// window.localStorage.setItem('oai/apps/locale', '"en-US"');
