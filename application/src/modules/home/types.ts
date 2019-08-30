/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-08 18:07:56
 * Copyright © RingCentral. All rights reserved.
 */
import { RouteProps } from 'react-router-dom';
import { ModuleConfig } from 'framework/types';

type NavConfig = {
  url: string | (() => string);
  Icon: React.ReactElement;
  IconSelected: React.ReactElement;
  title: string | Promise<string>;
  placement: 'top' | 'bottom';
  umi?: JSX.Element;
};

type RouteConfig = {
  cache?: boolean;
} & RouteProps;

type SubModuleConfig = {
  route?: RouteConfig;
  nav?: () => Promise<NavConfig>;
  moduleConfigLoader?: () => Promise<{ config: ModuleConfig }>;
  moduleConfig?: ModuleConfig;
  afterBootstrap?: (...args: any[]) => void;
};

type HomeConfig = {
  defaultRouterPaths: string[];
  subModules: { [key: string]: SubModuleConfig };
};

export { HomeConfig, NavConfig, SubModuleConfig, RouteConfig };
