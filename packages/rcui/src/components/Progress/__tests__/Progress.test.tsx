/*
 * @Author: wayne.zhou
 * @Date: 2019-05-10 09:41:18
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import ThemeProvider from '../../../foundation/styles/ThemeProvider';
import * as renderer from 'react-test-renderer';
import { RuiCircularProgress, RuiLinearProgress } from '../';

describe('RuiCircularProgress', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create(
        <ThemeProvider>
          <div>
            <RuiCircularProgress />
            <RuiCircularProgress size={30} color="secondary" />
          </div>
        </ThemeProvider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('RuiLinearProgress', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create(
        <ThemeProvider>
          <div>
            <RuiLinearProgress />
            <RuiLinearProgress color="secondary" />
          </div>
        </ThemeProvider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
