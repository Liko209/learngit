/*
 * @Author: isaac.liu
 * @Date: 2019-05-27 14:55:33
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { CallHistory } from '../';
import { test, testable } from 'shield';
import { shallow } from 'enzyme';
import { JuiTabs, JuiTab } from 'jui/components/Tabs';
import { CallHistoryTypes } from '../types';

describe('CallHistory', () => {
  @testable
  class JPT2143 {
    @test('should show all when open call history')
    t1() {
      const wrapper = shallow(<CallHistory />);
      expect(wrapper.find(JuiTabs).prop('defaultActiveIndex')).toBe(
        CallHistoryTypes.All,
      );
    }
    @test('should has two tab(All calls/Missed calls) when open call history')
    t2() {
      const wrapper = shallow(<CallHistory />);
      expect(wrapper.find(JuiTab)).toHaveLength(2);
      expect(wrapper.find(JuiTab).get(0).props.automationId).toBe(
        'CallHistoryAllCalls',
      );
      expect(wrapper.find(JuiTab).get(1).props.automationId).toBe(
        'CallHistoryMissedCalls',
      );
    }
  }
});
