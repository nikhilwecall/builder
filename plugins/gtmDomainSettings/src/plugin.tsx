import { Builder } from '@builder.io/react';

function addScript(id: string, src: string) {
  if (document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id;
  script.src = src;
  script.async = true;
  document.head.appendChild(script);
}

function removeScript(id: string) {
  const script = document.getElementById(id);
  if (script) {
    script.remove();
  }
}

function addGTM(containerId: string) {
  if (containerId) {
    addScript('gtm-script', `https://www.googletagmanager.com/gtm.js?id=${containerId}`);
  }
}

function removeGTM() {
  removeScript('gtm-script');
}

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

function addFacebookPixel(pixelId: string) {
  if (pixelId) {
    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
  }
}

function removeFacebookPixel() {
  removeScript('fb-pixel-script');
}

function addVoluum(voluumId: string) {
  if (voluumId) {
    addScript('voluum-script', `https://YOUR_VOLUM_URL.com/${voluumId}`);
  }
}

function removeVoluum() {
  removeScript('voluum-script');
}

Builder.register('plugin', {
  name: 'Domain Settings',
  settings: [
    {
      name: 'gtmContainerId',
      type: 'string',
      helperText: 'Enter your Google Tag Manager container ID (e.g., GTM-XXXXXX)',
    },
    {
      name: 'facebookPixelId',
      type: 'string',
      helperText: 'Enter your Facebook Pixel ID',
    },
    {
      name: 'voluumId',
      type: 'string',
      helperText: 'Enter your Voluum ID',
    },
    {
      name: 'enableGTM',
      type: 'boolean',
      helperText: 'Toggle to enable/disable Google Tag Manager',
    },
    {
      name: 'enableFacebookPixel',
      type: 'boolean',
      helperText: 'Toggle to enable/disable Facebook Pixel',
    },
    {
      name: 'enableVoluum',
      type: 'boolean',
      helperText: 'Toggle to enable/disable Voluum',
    },
  ],
  onSave: (settings: any) => {
    if (settings.enableGTM) {
      addGTM(settings.gtmContainerId);
    } else {
      removeGTM();
    }
    if (settings.enableFacebookPixel) {
      addFacebookPixel(settings.facebookPixelId);
    } else {
      removeFacebookPixel();
    }
    if (settings.enableVoluum) {
      addVoluum(settings.voluumId);
    } else {
      removeVoluum();
    }
  },
});
