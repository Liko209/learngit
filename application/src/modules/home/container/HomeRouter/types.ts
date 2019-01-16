/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 12:24:06
 * Copyright © RingCentral. All rights reserved.
 */

import { RouteProps } from 'react-router-dom';

type HomeRouterProps = {};

type HomeRouterViewProps = {
  defaultRouterPath: string;
  routes: RouteProps[];
};

export { HomeRouterProps, HomeRouterViewProps };
