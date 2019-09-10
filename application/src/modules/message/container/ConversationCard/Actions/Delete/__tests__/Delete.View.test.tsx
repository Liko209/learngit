/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-08-26 19:14:53
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { shallow } from 'enzyme';
import { DeleteView } from '../Delete.View';
import { Dialog } from '@/containers/Dialog';

describe('DeleteView', () => {
  describe('render()', () => {
    it('should render correct delete post dialog. [JPT-473]', () => {
      jest.spyOn(Dialog, 'confirm').mockImplementation(jest.fn());
      const props: any = {
        t: (str: string) => str,
        deletePost: () => {},
        disabled: false,
      };

      const wrapper = shallow(<DeleteView {...props} />);
      wrapper.simulate('click');

      expect(JSON.stringify(Dialog.confirm.mock.calls[0][0])).toMatchSnapshot();
    });
  });
});
