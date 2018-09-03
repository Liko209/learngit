/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-31 16:55:49
 * Copyright © RingCentral. All rights reserved.
 */
import styled, { isStyledComponent, FlattenInterpolation } from 'styled-components';

export const styledComponentWrapper = <T>(MaybeStyledComponent: any, css: FlattenInterpolation<T>[]) =>
  isStyledComponent(MaybeStyledComponent)
    ? MaybeStyledComponent
    : styled<T>(MaybeStyledComponent)`${css}`;
