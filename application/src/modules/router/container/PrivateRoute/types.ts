/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-01-30 14:42:22
 * Copyright © RingCentral. All rights reserved.
 */

type PrivateRouteProps = {
  component: React.ComponentType<any>;
};

type PrivateRouteViewProps = PrivateRouteProps & {
  isAuthenticated: boolean;
};

export { PrivateRouteProps, PrivateRouteViewProps };
