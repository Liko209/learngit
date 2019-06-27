/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-16 17:14:27
 * Copyright © RingCentral. All rights reserved.
 */
import '@/polyfill';
import { Jupiter, inject, container, injectable } from 'framework';
import * as sw from '@/modules/service-worker/module.config';
import * as leaveBlocker from '@/modules/leave-blocker/module.config';
import * as router from '@/modules/router/module.config';
import * as home from '@/modules/home/module.config';
import * as app from '@/modules/app/module.config';
import * as GlobalSearch from '@/modules/GlobalSearch/module.config';
import * as featuresFlag from '@/modules/featuresFlags/module.config';
import * as notification from '@/modules/notification/module.config';
import * as common from '@/modules/common/module.config';
import * as feedback from '@/modules/feedback/module.config';
import * as emoji from '@/modules/emoji/module.config';
import * as phone from '@/modules/phone/module.config';
import * as setting from '@/modules/setting/module.config';
import { Pal } from 'sdk/pal';
import { ImageDownloader } from '@/common/ImageDownloader';
import { errorReporter } from '@/utils/error';
// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from 'firebase/app';

// Add the Performance Monitoring library
import 'firebase/performance';

@injectable()
class Application {
  @inject(Jupiter) private _jupiter: Jupiter;

  run() {
    Pal.instance.setImageDownloader(new ImageDownloader());
    Pal.instance.setErrorReporter(errorReporter);
    const jupiter = this._jupiter;
    // TODO auto load modules
    jupiter.registerModule(sw.config);
    jupiter.registerModule(leaveBlocker.config);
    jupiter.registerModule(featuresFlag.config);
    jupiter.registerModule(router.config);
    jupiter.registerModule(home.config);
    jupiter.registerModule(app.config);
    jupiter.registerModule(GlobalSearch.config);
    jupiter.registerModule(notification.config);
    jupiter.registerModule(feedback.config);
    jupiter.registerModule(common.config);
    jupiter.registerModule(emoji.config);
    jupiter.registerModule(phone.config);
    jupiter.registerModule(setting.config);

    if (window.jupiterElectron) {
      jupiter.registerModuleAsync(() =>
        import(/*
        webpackChunkName: "m.electron" */
        '@/modules/electron/module.config'),
      );
    }

    // TODO: Replace the following with your app's Firebase project configuration
    const firebaseConfig = {
      apiKey: 'AIzaSyDN2BlRd-uSO_LM-63F7SC6003zI3S4Y70',
      authDomain: 'friendlychat-80e3c.firebaseapp.com',
      databaseURL: 'https://friendlychat-80e3c.firebaseio.com',
      projectId: 'friendlychat-80e3c',
      storageBucket: 'friendlychat-80e3c.appspot.com',
      messagingSenderId: '639743626766',
      appId: '1:639743626766:web:d8e3c266aea271dd',
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    firebase.performance();
    return this._jupiter.bootstrap();
  }
}

container.bind<Application>(Application).to(Application);

export { Application };
