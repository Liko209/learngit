/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-30 21:51:32
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { withInfo, Options as WithInfoOptions } from '@storybook/addon-info';
// import createDependencies from './createDependenciesDoc';
import { RenderFunction } from '@storybook/react';
import { StyledComponentClass } from 'styled-components';
import { Dependencies } from '../styled-components';
import { Theme } from '../theme/theme';

export const alignCenterDecorator = (story: RenderFunction) => {
  return <div style={{ textAlign: 'center' }}>{story()}</div>;
};

export const withInfoDecorator = (
  Component: (
    | React.ComponentType<any>
    | StyledComponentClass<any, Theme, any>) &
    Dependencies,
  options?: WithInfoOptions,
) => (story: RenderFunction, context: object) => withInfo()(story)(context);
// withInfo({
//   text: Component.dependencies
//     ? createDependencies(Component.dependencies)
//     : undefined,
//   ...options,
// })(story)(context);
