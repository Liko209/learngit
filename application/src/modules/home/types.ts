/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-08 18:07:56
 * Copyright © RingCentral. All rights reserved.
 */
import { RouteProps } from 'react-router-dom';
import { ModuleConfig } from 'framework';

type NavConfig = {
  url: string;
  Icon: React.ReactElement;
  IconSelected: React.ReactElement;
  title: string | Promise<string>;
  placement: 'top' | 'bottom';
  umi?: JSX.Element;
};

type SubModuleConfig = {
  route?: RouteProps;
  nav?: () => Promise<NavConfig>;
  loader?: () => Promise<{ config: ModuleConfig }>;
  afterBootstrap?: (...args: any[]) => void;
};

type HomeConfig = {
  defaultRouterPaths: string[];
  subModules: { [key: string]: SubModuleConfig };
};

export { HomeConfig, NavConfig, SubModuleConfig };
