/*
 * @Author: isaac.liu
 * @Date: 2019-07-01 16:26:05
 * Copyright © RingCentral. All rights reserved.
 */
import React, { useState, useEffect, ComponentType } from 'react';
import { container, injectable, decorate } from 'framework/ioc';
import { Jupiter } from 'framework/Jupiter';
import { ModuleConfig } from 'framework/types';
import { CLIENT_SERVICE } from '@/modules/common/interface';
import { ClientService } from '@/modules/common';
import { App } from '@/modules/app/container';
import history from '@/history';

type ModuleMap = {
  [key: string]: ModuleConfig;
};

type MockAppProps = {
  modules?: string[];
  inited?: boolean;
};

type BootstrapConfig = {
  modules?: string[];
  url?: string;
};

let kAllModules: ModuleMap;

decorate(injectable(), ClientService);

function initAllModules() {
  if (!kAllModules) {
    kAllModules = {};
    const leaveBlocker = require('@/modules/leave-blocker/module.config');
    const router = require('@/modules/router/module.config');
    const app = require('@/modules/app/module.config');
    // const message = require('@/modules/message/module.config');
    const GlobalSearch = require('@/modules/GlobalSearch/module.config');
    const home = require('@/modules/home/module.config');
    const featuresFlags = require('@/modules/featuresFlags/module.config');
    const notification = require('@/modules/notification/module.config');
    const setting = require('@/modules/setting/module.config');

    kAllModules['leave-blocker'] = leaveBlocker.config;
    kAllModules['router'] = router.config;
    kAllModules['app'] = app.config;
    // kAllModules['message'] = message.config;
    kAllModules['GlobalSearch'] = GlobalSearch.config;
    kAllModules['home'] = home.config;
    kAllModules['featuresFlags'] = featuresFlags.config;
    kAllModules['notification'] = notification.config;
    kAllModules['setting'] = setting.config;

    container.bind(CLIENT_SERVICE).to(ClientService);
  }
}

function bootstrap(config: BootstrapConfig): Promise<void> {
  // init modules if needed
  initAllModules();
  let { modules } = config;
  const { url } = config;
  if (url) {
    history.push(url);
  }
  const jupiter = container.get(Jupiter);
  if (!modules || modules.length === 0) {
    modules = Object.keys(kAllModules);
  }
  modules.forEach((name: string) => {
    const config = kAllModules[name];
    if (config) {
      jupiter.registerModule(config);
    }
  });

  return jupiter.bootstrap();
}

const mock = (Comp: ComponentType) => async (config: BootstrapConfig) => {
  await bootstrap(config);
  return <Comp />;
};

const mockApp = mock(App);

export { mockApp, mock, bootstrap, BootstrapConfig };
