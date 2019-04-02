// tslint:disable:no-console
// In production, we register a service worker to serve assets from local cache.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on the 'N+1' visit to a page, since previously
// cached resources are updated in the background.

// To learn more about the benefits of this model, read https://goo.gl/KwvDNy.
// This link also includes instructions on opting out of this behavior.

const logTag = '[ServiceWorker][Upgrade]';

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/,
    ),
);

export default function register(
  registeredHandler: (swURL: string) => void,
  updateInstalledHandler: VoidFunction,
) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    // The URL constructor is available in all browsers that support SW.
    const publicUrl = new URL(
      process.env.PUBLIC_URL!,
      window.location.toString(),
    );
    if (publicUrl.origin !== window.location.origin) {
      console.log(
        `${logTag}Can not register. PUBLIC_URL: ${
          process.env.PUBLIC_URL
        }, location ${window.location.toString()}, publicUrl.origin ${
          publicUrl.origin
        }, window.location.origin ${window.location.origin}`,
      );
      // Our service worker won't work if PUBLIC_URL is on a different origin
      // from what our page is served on. This might happen if a CDN is used to
      // serve assets; see https://github.com/facebookincubator/create-react-app/issues/2374
      return;
    }

    const registerServiceWorker = () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // This is running on localhost. Lets check if a service worker still exists or not.
        checkValidServiceWorker(
          swUrl,
          registeredHandler,
          updateInstalledHandler,
        );

        // Add some additional logging to localhost, pointing developers to the
        // service worker/PWA documentation.
        navigator.serviceWorker.ready.then(() => {
          console.log(
            `${logTag}This web app is being served cache-first by a service \
              worker. To learn more, visit https://goo.gl/SC7cgQ`,
          );
        });
      } else {
        // Is not local host. Just register service worker
        registerValidSW(swUrl, registeredHandler, updateInstalledHandler);
      }
    };

    const readyState = document.readyState;
    if (readyState === 'complete') {
      console.log(
        `${logTag}registerServiceWorker. document.readyState: ${readyState}`,
      );
      registerServiceWorker();
    } else {
      console.log(
        `${logTag}registerServiceWorker on load. document.readyState: ${readyState}`,
      );
      window.addEventListener('load', registerServiceWorker);
    }
  } else {
    console.log(
      `${logTag}Can not register. NODE_ENV: ${
        process.env.NODE_ENV
      }, has service worker ${'serviceWorker' in navigator}`,
    );
  }
}

function registerValidSW(
  swUrl: string,
  registeredHandler: (swURL: string) => void,
  updateInstalledHandler: VoidFunction,
) {
  console.log(`${logTag}registerValidSW: ${swUrl}`);
  navigator.serviceWorker
    .register(swUrl)
    .then((registration: ServiceWorkerRegistration) => {
      console.log(`${logTag}registered ${swUrl}`);
      const beforeunloadHandler = () => {
        console.log(`${logTag}beforeunload, waiting ${!!registration.waiting}`);
        registration.waiting &&
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      };
      window.addEventListener('beforeunload', beforeunloadHandler);

      registration.onupdatefound = () => {
        console.log(`${logTag}onupdatefound`);
        const installingWorker = registration.installing;
        if (installingWorker) {
          installingWorker.onstatechange = () => {
            console.log(`${logTag}onstatechange: ${installingWorker.state}`);
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // At this point, the old content will have been purged and
                // the fresh content will have been added to the cache.
                // It's the perfect time to display a 'New content is
                // available; please refresh.' message in your web app.
                console.log(
                  `${logTag}New content is available; please refresh.`,
                );

                updateInstalledHandler();
              } else {
                // At this point, everything has been precached.
                // It's the perfect time to display a
                // 'Content is cached for offline use.' message.
                console.log(`${logTag}Content is cached for offline use.`);
              }
            }
          };
        }
      };

      registeredHandler(swUrl);
    })
    .catch((error: any) => {
      console.error(
        `${logTag}Error during service worker registration:`,
        error,
      );
    });
}

function checkValidServiceWorker(
  swUrl: string,
  registeredHandler: (swURL: string) => void,
  updateInstalledHandler: VoidFunction,
) {
  // Check if the service worker can be found. If it can't reload the page.
  fetch(swUrl)
    .then((response: any) => {
      // Ensure service worker exists, and that we really are getting a JS file.
      if (
        response.status === 404 ||
        response.headers.get('content-type')!.indexOf('javascript') === -1
      ) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then(
          (registration: ServiceWorkerRegistration) => {
            registration.unregister().then(() => {
              window.location.reload();
            });
          },
        );
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl, registeredHandler, updateInstalledHandler);
      }
    })
    .catch(() => {
      console.log(
        'No internet connection found. App is running in offline mode.',
      );
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(
      (registration: ServiceWorkerRegistration) => {
        registration.unregister();
      },
    );
  }
}
