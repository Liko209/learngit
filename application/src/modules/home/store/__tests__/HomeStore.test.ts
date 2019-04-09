/*
 * @Author: Steven Zhuang (steven.zhuang@ringcentral.com)
 * @Date: 2019-02-15 00:20:33
 * Copyright © RingCentral. All rights reserved.
 */

import { HomeStore, SubModuleConfig } from '../HomeStore';

describe('Home Store', () => {
  const moduleName = ['dashboard', 'messages', 'phone', 'meeting'];
  const mockSubModules: SubModuleConfig[] = [
    {
      route: {
        path: '/dashboard',
      },
    },
    {
      route: {
        path: '/messages',
      },
    },
    {
      route: {
        path: '/phone',
      },
    },
    {
      route: {
        path: '/meeting',
      },
    },
  ];
  let homeStore: HomeStore;

  beforeEach(() => {
    homeStore = new HomeStore();
    mockSubModules.forEach((m, i) => {
      homeStore.addSubModule(moduleName[i], m);
    });
  });
  afterEach(() => {
    homeStore = undefined;
  });

  describe('defaultRouterPath', () => {
    it('should get empty path when paths not in sub', () => {
      homeStore.setDefaultRouterPaths(['/settings']);
      expect(homeStore.defaultRouterPath).toEqual('');
    });

    it('should get first matched path when there is path which is not registered', () => {
      homeStore.setDefaultRouterPaths(['/settings', '/messages', '/dashboard']);
      expect(homeStore.defaultRouterPath).toEqual('/messages');
    });

    it('should get first matched path when there is path which is not registered', () => {
      homeStore.setDefaultRouterPaths(['/settings', '/dashboard', '/messages']);
      expect(homeStore.defaultRouterPath).toEqual('/dashboard');
    });
  });
});
