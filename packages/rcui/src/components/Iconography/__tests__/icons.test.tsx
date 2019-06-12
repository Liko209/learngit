/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-03-11 11:23:46
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import fs from 'fs';
import path from 'path';
import { iconLabelMap } from '../iconLabelMap';
import ThemeProvider from '../../../foundation/styles/ThemeProvider';
import * as renderer from 'react-test-renderer';
import { RuiIconography } from '../';

function getIconList(svgData: string): string[] {
  const re = /<title>(.+?)<\/title>/g;
  const matches: any = [];
  svgData.replace(re, function (m: any, p1: any) {
    matches.push(p1);
  } as any);
  return matches;
}

describe('icon svg file', () => {
  // will remove until upgrade material ui
  beforeAll(() => {
    // mock console for jest
    (global as any)['console'] = {
      error: jest.fn(),
    };
  });
  const file = fs.readFileSync(
    path.join(__dirname, '../icon-symbol.svg'),
    'utf8',
  );
  const icons = getIconList(file);
  it('contain all the icons that needed', () => {
    Object.values(iconLabelMap).forEach((icon: string) => {
      expect(icons.includes(icon)).toBeTruthy();
    });
  });

  it('expect svg file to match snapshot', () => {
    expect(file).toMatchSnapshot();
  });
});

describe('RuiIconography', () => {
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
          <RuiIconography icon="star" />
        </ThemeProvider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
