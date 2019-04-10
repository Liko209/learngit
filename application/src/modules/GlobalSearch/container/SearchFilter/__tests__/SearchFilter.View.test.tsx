/*
 * @Author: ken.li
 * @Date: 2019-04-10 11:22:29
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { mount } from 'enzyme';
import { ThemeProvider } from 'styled-components';
import { SearchFilterView } from '@/modules/GlobalSearch/container/SearchFilter/SearchFilter.View';
import { JuiBoxSelect } from 'jui/components/Selects/BoxSelect';
import { theme } from '../../../../../__tests__/utils';

const mountWithTheme = (content: React.ReactNode) =>
  mount(<ThemeProvider theme={theme}>{content}</ThemeProvider>);

function setup() {
  return {};
}

describe('SearchFilterView', () => {
  describe('type filter should display current selected value when select type filter[JPT-1579]', () => {
    it('All is selected by default', () => {
      const props = {
        heightSize: 'default',
        MenuProps: {
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'left',
          },
          getContentAnchorEl: null,
        },
      };
    });
  });
});
