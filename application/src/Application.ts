/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-16 17:14:27
 * Copyright © RingCentral. All rights reserved.
 */
import { inject, container, injectable } from 'framework/ioc';
import { Jupiter } from 'framework/Jupiter';
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
import * as viewer from '@/modules/viewer/module.config';
import * as phone from '@/modules/phone/module.config';
import * as setting from '@/modules/setting/module.config';
import * as media from '@/modules/media/module.config';
import * as contact from '@/modules/contact/module.config';
import { Pal } from 'sdk/pal';
import { ImageDownloader } from '@/common/ImageDownloader';
import { errorReporter } from '@/utils/error';

import config from '@/config';
import { Performance, FirebasePerformance } from 'foundation/performance';

@injectable()
class Application {
  @inject(Jupiter) private _jupiter: Jupiter;

  run() {
    Pal.instance.setImageDownloader(new ImageDownloader());
    Pal.instance.setErrorReporter(errorReporter);
    Pal.instance.setWhiteScreenChecker({
      isWhiteScreen: () => {
        const root = document.getElementById('root');
        return !root || !root.hasChildNodes();
      },
    });
    if (config.isProductionAccount()) {
      Performance.instance.setPerformance(new FirebasePerformance());
      Performance.instance.initialize();
    }

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
    jupiter.registerModule(viewer.config);
    jupiter.registerModule(phone.config);
    jupiter.registerModule(setting.config);
    jupiter.registerModule(media.config);
    jupiter.registerModule(contact.config);

    if (window.jupiterElectron) {
      jupiter.registerModuleAsync(() =>
        import(/*
        webpackChunkName: "m.electron" */
        '@/modules/electron/module.config'),
      );
    }
    return this._jupiter.bootstrap();
  }
}

container.bind<Application>(Application).to(Application);

export { Application };
