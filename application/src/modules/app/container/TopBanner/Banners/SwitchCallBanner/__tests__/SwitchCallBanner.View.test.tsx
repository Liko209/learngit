/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-07-25 10:00:14
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { test, testable } from 'shield';
import { shallow } from 'enzyme';
// import { mountWithTheme } from 'shield/utils';
import { SwitchCallBannerView } from '../SwitchCallBanner.View';
import {
  JuiSnackbarContent,
  JuiSnackbarAction,
} from 'jui/components/Snackbars';
import { Dialog } from '@/containers/Dialog';
import { WithTranslation } from 'react-i18next';

jest.mock('@/containers/Dialog');

describe('SwitchCallBannerView', () => {
  const mockI18N = {
    t: (key: string) => key,
  } as WithTranslation;
  @testable
  class render {
    @test('should check switch call banner content when it shows up [JPT-2523]')
    t1() {
      const props = { isShow: true };
      const wrapper = shallow(
        <SwitchCallBannerView {...props} {...mockI18N} />,
      );
      expect(wrapper.find(JuiSnackbarContent).get(0).props.message).toBe(
        'common.prompt.switchCall',
      );
    }
  }
});
