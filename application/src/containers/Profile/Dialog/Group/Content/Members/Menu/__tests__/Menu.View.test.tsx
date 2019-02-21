/*
 * @Author: looper.wang (looper.wang@ringcentral.com)
 * @Date: 2019-02-12 09:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { shallow } from 'enzyme';
import { MenuViewComponent } from '../Menu.View';
import { Notification } from '@/containers/Notification';
import { JServerError, JNetworkError, ERROR_CODES_NETWORK } from 'sdk/error';
jest.mock('@/containers/Notification');

const someProps = {
  personId: 1,
  groupId: 2,
  onMenuClose: () => {},
};

Notification.flashToast = jest.fn().mockImplementationOnce(() => {});

describe('AddMembersView', () => {
  describe('render()', () => {
    it('should display flash toast notification content removeMemberBackendError when remove from team fail in backend error.', (done: jest.DoneCallback) => {
      const props: any = {
        ...someProps,
        removeFromTeam: () => {
          throw new JServerError(ERROR_CODES_NETWORK.BAD_REQUEST, '');
        },
      };
      const Wrapper = shallow(<MenuViewComponent {...props} />);
      Wrapper.find('[data-test-automation-id="removeFromTeam"]').simulate(
        'click',
      );
      setTimeout(() => {
        expect(Notification.flashToast).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'people.prompt.removeMemberBackendError',
          }),
        );
        done();
      },         0);
    });
    it('should display flash toast notification with content removeMemberNetworkError when remove from team fail in network error.', (done: jest.DoneCallback) => {
      const props: any = {
        ...someProps,
        removeFromTeam: () => {
          throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, '');
        },
      };
      const Wrapper = shallow(<MenuViewComponent {...props} />);
      Wrapper.find('[data-test-automation-id="removeFromTeam"]').simulate(
        'click',
      );
      setTimeout(() => {
        expect(Notification.flashToast).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'people.prompt.removeMemberNetworkError',
          }),
        );
        done();
      },         0);
    });
  });
});
