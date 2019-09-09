/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-11 09:50:10
 * Copyright © RingCentral. All rights reserved.
 */

import { container } from 'framework/ioc';
import { jupiter } from 'framework/Jupiter';
import { HomeService } from '../HomeService';
import { IHomeService } from '../../interface/IHomeService';
import { config } from '../../module.config';

jest.unmock('react-quill');
jest.unmock('quill');

jupiter.registerModule(config);

describe('HomeService', () => {
  it('registerSubModule should call private registerSubModule function', () => {
    const homeService = new HomeService();
    homeService._registerSubModule = jest.fn();
    homeService.registerSubModule('test');
    expect(homeService._registerSubModule).toHaveBeenCalled();
  });

  it('registerSubModules should call registerSubModule function to register sub module', () => {
    const homeService = new HomeService();
    homeService.registerSubModule = jest.fn();
    homeService.registerSubModules(['test', 'test2']);
    expect(homeService.registerSubModule).toHaveBeenCalledTimes(2);
  });

  it('setDefaultRouterPaths should call home store setDefaultRouterPaths function', () => {
    const homeService = new HomeService();
    homeService._homeStore = {
      setDefaultRouterPaths: jest.fn(),
    };
    const test = [''];
    homeService.setDefaultRouterPaths(test);
    expect(homeService._homeStore.setDefaultRouterPaths).toHaveBeenCalledWith(
      test,
    );
  });

  it('setDefaultRouterPaths should call home store setDefaultRouterPaths function', () => {
    const homeService = new HomeService();
    homeService._homeStore = {
      setDefaultRouterPaths: jest.fn(),
    };
    const test = [''];
    homeService.setDefaultRouterPaths(test);
    expect(homeService._homeStore.setDefaultRouterPaths).toHaveBeenCalledWith(
      test,
    );
  });

  it('registerNavItem should call home store addNavItem function', () => {
    const homeService = new HomeService();
    homeService._homeStore = {
      addNavItem: jest.fn(),
    };
    const moduleName = '';
    const navItemConfig: any = '';
    homeService.registerNavItem(moduleName, navItemConfig);
    expect(homeService._homeStore.addNavItem).toHaveBeenCalledWith(
      moduleName,
      navItemConfig,
    );
  });

  it('registerRoute should call home store addRoute function', () => {
    const homeService = new HomeService();
    homeService._homeStore = {
      addRoute: jest.fn(),
    };
    const moduleName = '';
    const route: any = '';
    homeService.registerRoute(moduleName, route);
    expect(homeService._homeStore.addRoute).toHaveBeenCalledWith(
      moduleName,
      route,
    );
  });

  it('registerExtension should call home store addExtensions function', () => {
    const homeService = new HomeService();
    homeService._homeStore = {
      addExtensions: jest.fn(),
    };
    const key = '';
    const extension: any = '';
    homeService.registerExtension(key, extension);
    expect(homeService._homeStore.addExtensions).toHaveBeenCalledWith(
      key,
      extension,
    );
  });

  it('hasModules should return correct value', async () => {
    const homeService = container.get(IHomeService.toString());
    await homeService.registerSubModules(['message']);
    expect(homeService.hasModules(['message'])).toBeTruthy();
    expect(
      homeService.hasModules(['message', 'telephony', '1122']),
    ).toBeFalsy();
  });

  it('unRegisterNavItem should call home store removeNavItem function', () => {
    const homeService = new HomeService();
    // @ts-ignore
    homeService._homeStore = {
      removeNavItem: jest.fn(),
    };
    const moduleName = '';
    homeService.unRegisterNavItem(moduleName);
    // @ts-ignore
    expect(homeService._homeStore.removeNavItem).toHaveBeenCalledWith(
      moduleName,
    );
  });
});
