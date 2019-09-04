/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-27 17:37:07
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { test, testable } from 'shield';
import { shallow } from 'enzyme';
import { JuiPhoneFilter } from 'jui/pattern/Phone/Filter';
import { JuiAutoSizer } from 'jui/components/AutoSizer/AutoSizer';
import { Observer } from 'mobx-react';
import { JuiConversationPageHeader } from 'jui/pattern/ConversationPageHeader';

import { ListMainView } from '../ListMain.View';

describe('ListMainView', () => {

  function getFilter(Wrapper) {
    return Wrapper.find(JuiAutoSizer)
    .shallow()
    .find(Observer)
    .shallow()
    .find(JuiConversationPageHeader)
    .shallow()
    .find(JuiPhoneFilter)
    .shallow()
  }

  @testable
  class renderFilter {
    @test('should be maxlength 60 when show filter [JPT-2847]')
    t1() {
      const props = {
        filter: {
          placeholder: 'placeholder'
        },
        setSearchKey() {},
      };
      const Wrapper = shallow(<ListMainView {...props} />);
      const Filter = getFilter(Wrapper);
      expect(Filter.props().InputProps.inputProps.maxLength).toBe(60)
    }

    @test('should show the ghost text when show filter [JPT-2849]')
    t2() {
      const props = {
        filter: {
          placeholder: 'placeholder'
        },
        setSearchKey() {},
      };
      const Wrapper = shallow(<ListMainView {...props} />);
      const Filter = getFilter(Wrapper);
      expect(Filter.props().InputProps.placeholder).toBe('placeholder')
    }

    @test('should show the tool tip when show filter [JPT-2850]')
    t3() {
      const props = {
        filter: {
          placeholder: 'placeholder'
        },
        setSearchKey() {},
      };
      const Wrapper = shallow(<ListMainView {...props} />);
      const Filter = getFilter(Wrapper);
      expect(Filter.props().IconRightToolTip).toBe('common.clear')
      expect(Filter.props().IconRightProps['aria-label']).toBe('common.clearText')
    }
  }
});
