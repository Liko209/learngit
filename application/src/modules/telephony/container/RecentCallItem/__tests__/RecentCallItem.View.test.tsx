/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-06-28 13:47:39
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { shallow } from 'enzyme';
import { RecentCallItemView } from '../RecentCallItem.View';
import { CALL_DIRECTION } from 'sdk/module/RCItems';

describe('RecentCallItemView', () => {
  describe('render', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    it('should render each record item [JPT-2316, JPT-2317]', () => {
      const props = {
        caller: {
          phoneNumber: '00000',
          location: 'abc',
          name: 'Shining',
        },
        icon: 'missedcall',
        isMissedCall: true,
        startTime: '2019-06-28T02:09:28.595Z',
        direction: CALL_DIRECTION.INBOUND,
        handleClick: () => {},
        isTransferPage: false,
      };
      const Wrapper = shallow(<RecentCallItemView {...props} />);
      expect(Wrapper).toMatchSnapshot();
    });
  });
});
