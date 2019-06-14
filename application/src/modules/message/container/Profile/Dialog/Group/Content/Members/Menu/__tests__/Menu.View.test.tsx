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
  describe('error handling', () => {
    it('should display flash toast notification with content revokeTeamAdminNetworkError when revoke team admin fail in network error.', async () => {
      const props: any = {
        ...someProps,
        isThePersonAdmin: true,
        toggleTeamAdmin: () => {
          throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, '');
        },
      };
      const Wrapper = shallow(<MenuViewComponent {...props} />);
      await Wrapper.find('[data-test-automation-id="revokeTeamAdmin"]').simulate(
        'click',
      );
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'people.prompt.revokeTeamAdminNetworkError',
        }),
      );
    });
    it('should display flash toast notification content revokeTeamAdminBackendError when revoke team admin fail in backend error.', async () => {
      const props: any = {
        ...someProps,
        isThePersonAdmin: true,
        toggleTeamAdmin: () => {
          throw new JServerError(ERROR_CODES_NETWORK.BAD_REQUEST, '');
        },
      };
      const Wrapper = shallow(<MenuViewComponent {...props} />);
      await Wrapper.find('[data-test-automation-id="revokeTeamAdmin"]').simulate(
        'click',
      );
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'people.prompt.revokeTeamAdminBackendError',
        }),
      );
    });
    it('should display flash toast notification with content makeTeamAdminNetworkError when make team admin fail in network error.', async () => {
      const props: any = {
        ...someProps,
        toggleTeamAdmin: () => {
          throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, '');
        },
      };
      const Wrapper = shallow(<MenuViewComponent {...props} />);
      await Wrapper.find('[data-test-automation-id="makeTeamAdmin"]').simulate(
        'click',
      );
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'people.prompt.makeTeamAdminNetworkError',
        }),
      );
    });
    it('should display flash toast notification content makeTeamAdminBackendError when make team admin fail in backend error.', async () => {
      const props: any = {
        ...someProps,
        toggleTeamAdmin: () => {
          throw new JServerError(ERROR_CODES_NETWORK.BAD_REQUEST, '');
        },
      };
      const Wrapper = shallow(<MenuViewComponent {...props} />);
      await Wrapper.find('[data-test-automation-id="makeTeamAdmin"]').simulate(
        'click',
      );
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'people.prompt.makeTeamAdminBackendError',
        }),
      );
    });
    it('should display flash toast notification content removeMemberBackendError when remove from team fail in backend error.', async () => {
      const props: any = {
        ...someProps,
        removeFromTeam: () => {
          throw new JServerError(ERROR_CODES_NETWORK.BAD_REQUEST, '');
        },
      };
      const Wrapper = shallow(<MenuViewComponent {...props} />);
      await Wrapper.find('[data-test-automation-id="removeFromTeam"]').simulate(
        'click',
      );
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'people.prompt.removeMemberBackendError',
        }),
      );
    });
    it('should display flash toast notification with content removeMemberNetworkError when remove from team fail in network error.', async () => {
      const props: any = {
        ...someProps,
        removeFromTeam: () => {
          throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, '');
        },
      };
      const Wrapper = shallow(<MenuViewComponent {...props} />);
      await Wrapper.find('[data-test-automation-id="removeFromTeam"]').simulate(
        'click',
      );
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'people.prompt.removeMemberNetworkError',
        }),
      );
    });
  });
});
