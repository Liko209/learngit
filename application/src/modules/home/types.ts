/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-08 18:07:56
 * Copyright © RingCentral. All rights reserved.
 */
import { RouteProps } from 'react-router-dom';

type NavConfig = {
  url: string;
  icon: string;
  title: string;
  placement: 'top' | 'bottom';
  umi?: JSX.Element;
};

type SubModuleConfig = {
  route?: RouteProps;
  nav?: ((currentConversationId: number, groupIds: number[]) => NavConfig);
  isDefault?: boolean;
};

type HomeConfig = {
  defaultRouterPath: string;
  subModules: SubModuleConfig[];
};

export { HomeConfig, NavConfig, SubModuleConfig };
