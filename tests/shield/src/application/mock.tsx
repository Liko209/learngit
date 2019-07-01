/*
 * @Author: isaac.liu
 * @Date: 2019-07-01 16:26:05
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { Jupiter, container, ModuleConfig } from 'framework';
import { App } from '@/modules/app/container';

type ModuleMap = {
  [key: string]: ModuleConfig;
};

type MockAppProps = {
  modules?: string[];
};

let kAllModules: ModuleMap;

function initAllModules() {
  if (!kAllModules) {
    kAllModules = {};
    const leaveBlocker = require('@/modules/leave-blocker/module.config');
    const router = require('@/modules/router/module.config');
    const app = require('@/modules/app/module.config');
    const message = require('@/modules/message/module.config');
    const GlobalSearch = require('@/modules/GlobalSearch/module.config');
    const home = require('@/modules/home/module.config');
    const featuresFlags = require('@/modules/featuresFlags/module.config');
    const notification = require('@/modules/notification/module.config');
    const setting = require('@/modules/setting/module.config');

    kAllModules['leave-blocker'] = leaveBlocker.config;
    kAllModules['router'] = router.config;
    kAllModules['app'] = app.config;
    kAllModules['message'] = message.config;
    kAllModules['GlobalSearch'] = GlobalSearch.config;
    kAllModules['home'] = home.config;
    kAllModules['featuresFlags'] = featuresFlags.config;
    kAllModules['notification'] = notification.config;
    kAllModules['setting'] = setting.config;
  }
}

type State = {
  modules: string[];
};

class MockApp extends Component<MockAppProps, State> {
  constructor(props: MockAppProps) {
    super(props);

    initAllModules();

    let { modules } = props;
    if (!modules || modules.length === 0) {
      modules = Object.keys(kAllModules);
    }
    this.state = { modules };
  }

  async componentWillMount() {
    const jupiter = container.get(Jupiter);
    const { modules } = this.state;
    modules.forEach((name: string) => {
      const config = kAllModules[name];
      if (config) {
        jupiter.registerModule(config);
      }
    });

    await jupiter.bootstrap();
  }

  render() {
    return <App />;
  }
}

export { MockApp };
