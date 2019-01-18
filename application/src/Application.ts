/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-16 17:14:27
 * Copyright © RingCentral. All rights reserved.
 */
import { Jupiter, inject, container, injectable } from 'framework';
import * as sw from '@/modules/service-worker/module.config';
import * as router from '@/modules/router/module.config';
import * as home from '@/modules/home/module.config';
import * as app from '@/modules/app/module.config';

@injectable()
class Application {
  @inject(Jupiter) private _jupiter: Jupiter;

  run() {
    const jupiter = this._jupiter;
    // TODO auto load modules
    jupiter.registerModule(sw.config);
    jupiter.registerModule(router.config);
    jupiter.registerModule(home.config);
    jupiter.registerModule(app.config);

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
