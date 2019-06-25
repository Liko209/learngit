/*
 * @Author: isaac.liu
 * @Date: 2019-05-27 14:55:33
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { CallHistoryWrapper, CallHistoryView } from '../CallHistory.View';
import { mountWithTheme } from 'shield/utils';
import { test, testable } from 'shield';
import { JuiTabs, JuiTab } from 'jui/components/Tabs';
import { CallHistoryTypes } from '../types';
import { WithTranslation } from 'react-i18next';
import { shallow } from 'enzyme';

describe('CallHistoryView', () => {
  const mockI18N = {
    t: (key: string) => key,
  } as WithTranslation;

  @testable
  class JPT2143 {
    @test('should show all when open call history')
    t1() {
      const wrapper = shallow(
        <CallHistoryWrapper height={1000} {...mockI18N} />,
      );
      expect(wrapper.find(JuiTabs).props().defaultActiveIndex).toBe(
        CallHistoryTypes.All,
      );
    }
    @test('should has two tab(All calls/Missed calls) when open call history')
    t2() {
      const wrapper = shallow(
        <CallHistoryWrapper height={1000} {...mockI18N} />,
      );
      expect(wrapper.find(JuiTab)).toHaveLength(2);
      expect(wrapper.find(JuiTab).get(0).props.automationId).toBe(
        'CallHistoryAllCalls',
      );
      expect(wrapper.find(JuiTab).get(1).props.automationId).toBe(
        'CallHistoryMissedCalls',
      );
    }
  }

  @testable
  class JPT2148 {
    @test('should be clear umi if switch tab')
    t1() {
      const props = {
        clearUMI: jest.fn(),
      };
      const wrapper = shallow(<CallHistoryView {...props} />);
      wrapper.unmount();
      expect(props.clearUMI).toHaveBeenCalled();
    }
  }
});
