/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-08-30 08:41:28
 * Copyright © RingCentral. All rights reserved.
 */
import { RenderFunction } from '@storybook/react';

declare module '@storybook/react' {
  export interface Story {
    addWithJSX(storyName: string, callback: RenderFunction): this;
  }
}
