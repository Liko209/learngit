/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-07 11:28:43
 * Copyright © RingCentral. All rights reserved.
 */
import 'reflect-metadata';
import { Jupiter } from 'framework';
import * as sw from '@/modules/service-worker/module.config';
import * as router from '@/modules/router/module.config';
import * as home from '@/modules/home/module.config';
import * as app from '@/modules/app/module.config';

(async function () {
  const jupiter = new Jupiter();

  // TODO auto load modules
  jupiter.registerModule(sw.config);
  jupiter.registerModule(router.config);
  jupiter.registerModule(home.config);
  jupiter.registerModule(app.config);

  if (window.jupiterElectron) {
    jupiter.registerModuleAsync('electron');
  }

  await jupiter.bootstrap();
})();
