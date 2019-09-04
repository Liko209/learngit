/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-01-15 15:03:48
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { shallow } from 'enzyme';
import { AddMembersComponent } from '../AddMembers.View';
import { JuiButton } from 'jui/components/Buttons';
import { Notification } from '@/containers/Notification';
import { JuiModal } from 'jui/components/Dialog';
import { JServerError, JNetworkError, ERROR_CODES_NETWORK } from 'sdk/error';

jest.mock('@/containers/Notification');

const someProps = {
  t: (str: string) => {
    return str;
  },
  disabledOkBtn: false,
  isOffline: false,
  members: [],
  group: {},
  isTeam: true,
  handleSearchContactChange: (items: any) => {},
};

Notification.flashToast = jest.fn().mockImplementationOnce(() => {});

describe('AddMembersView', () => {
  describe('render()', () => {
    it('should display flash toast notification with content AddTeamMembersBackendError when add members fail in backend error. [JPT-926]', async () => {
      const props: any = {
        ...someProps,
        addTeamMembers: () => {
          throw new JServerError(ERROR_CODES_NETWORK.BAD_REQUEST, '');
        },
      };
      const Wrapper = shallow(<AddMembersComponent {...props} />);

      await Wrapper.find(JuiModal)
        .shallow()
        .find(JuiButton)
        .last()
        .simulate('click');
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'people.prompt.AddTeamMembersBackendError',
        }),
      );
    });
    it('should display flash toast notification with content AddTeamMembersNetworkError when add members fail in network error. [JPT-925]', async () => {
      const props: any = {
        ...someProps,
        addTeamMembers: () => {
          throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, '');
        },
      };
      const Wrapper = shallow(<AddMembersComponent {...props} />);
      await Wrapper.find(JuiModal)
        .shallow()
        .find(JuiButton)
        .last()
        .simulate('click');
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'people.prompt.AddTeamMembersNetworkError',
        }),
      );
    });
    it('should render withEscTracking when Component rendered', async () => {
      const props = { group: {} };
      const Wrapper = shallow(<AddMembersComponent {...props} />);
      const modal = Wrapper.shallow().find(JuiModal);
      expect(modal.props().onEscTracking).toBeTruthy();
    });
  });
});
