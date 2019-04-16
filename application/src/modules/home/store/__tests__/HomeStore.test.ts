/*
 * @Author: Steven Zhuang (steven.zhuang@ringcentral.com)
 * @Date: 2019-02-15 00:20:33
 * Copyright © RingCentral. All rights reserved.
 */

import { HomeStore, SubModuleConfig } from '../HomeStore';

describe('Home Store', () => {
  const mockModuleName = ['dashboard', 'messages', 'phone', 'meeting'];
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
  const mockSubRoutes = [
    {
      path: '/dashboard',
    },
    {
      path: '/messages',
    },
    {
      path: '/phone',
    },
    {
      path: '/meeting',
    },
  ];
  let homeStore: HomeStore;

  beforeEach(() => {
    homeStore = new HomeStore();
    mockSubModules.forEach((m, i) => {
      homeStore.addSubModule(mockModuleName[i], m);
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

  describe('subModuleConfigs', () => {
    it('should get subModule configs', () => {
      expect(homeStore.subModuleConfigs).toEqual(mockSubModules);
    });
  });

  describe('subRoutes', () => {
    it('should get subModule configs', () => {
      expect(homeStore.subRoutes).toEqual(mockSubRoutes);
    });
  });

  describe('navConfigs', () => {
    it('should get empty navConfigs', () => {
      expect(homeStore.navConfigs).toEqual([]);
    });
  });

  describe('getSubModule()', () => {
    it('should get subModule by name', () => {
      const name = mockModuleName[0];
      const subModule = mockSubModules[0];
      expect(homeStore.getSubModule(name)).toEqual(subModule);
    });
  });
});
