/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-03-21 22:55:09
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import { RuiTooltip } from '../index';
import ThemeProvider from '../../../foundation/styles/ThemeProvider';
import * as renderer from 'react-test-renderer';

describe('Tooltip', () => {
  // will remove until upgrade material ui
  beforeAll(() => {
    // mock console for jest
    (global as any)['console'] = {
      error: jest.fn(),
    };
  });
  it('renders correctly', () => {
    const tree = renderer
      .create(
        <ThemeProvider>
          <RuiTooltip title="children">
            <div>children</div>
          </RuiTooltip>
        </ThemeProvider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
