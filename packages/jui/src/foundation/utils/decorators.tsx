/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-30 21:51:32
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { RenderFunction } from '@storybook/react';

export const alignCenterDecorator = (story: RenderFunction) => <div style={{ textAlign: 'center' }}>{story()}</div>;
