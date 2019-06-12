/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-19 16:35:57
 * Copyright © RingCentral. All rights reserved.
 */
import { ComponentType } from 'react';
import { RouteProps } from 'react-router-dom';
import { createDecorator } from 'framework';
import { SubModuleConfig, NavConfig } from '../types';

const IHomeService = createDecorator('IHomeService');
interface IHomeService {
  registerSubModule(moduleName: string, config: SubModuleConfig): void;
  unRegisterModule(moduleName: string): void;
  hasModules(names: string[]): void;
  registerExtension(key: string, extension: ComponentType): void;
  registerNavItem(moduleName: string, navItemConfig: NavConfig): void;
  registerRoute(moduleName: string, route: RouteProps): void;
}

export { IHomeService };
