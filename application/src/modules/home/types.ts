/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-08 18:07:56
 * Copyright © RingCentral. All rights reserved.
 */
import { RouteProps } from 'react-router-dom';
import { ModuleConfig } from 'framework';

type NavConfig = {
  url: string;
  icon: string;
  title: string;
  placement: 'top' | 'bottom';
  umi?: JSX.Element;
};

type SubModuleConfig = {
  route?: RouteProps;
  nav?: () => NavConfig;
  loader?: () => Promise<{ config: ModuleConfig }>;
  afterBootstrap?: (...args: any[]) => void;
};

type HomeConfig = {
  defaultRouterPaths: string[];
  subModules: { [key: string]: SubModuleConfig };
};

export { HomeConfig, NavConfig, SubModuleConfig };
