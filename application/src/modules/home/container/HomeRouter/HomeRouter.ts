/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 12:24:53
 * Copyright © RingCentral. All rights reserved.
 */
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { buildContainer } from '@/base';
import { HomeRouterView } from './HomeRouter.View';
import { HomeRouterViewModel } from './HomeRouter.ViewModel';
import { HomeRouterProps } from './types';

const HomeRouter = withRouter(
  buildContainer<HomeRouterProps & RouteComponentProps>({
    View: HomeRouterView,
    ViewModel: HomeRouterViewModel,
  }),
);

export { HomeRouter, HomeRouterProps };
