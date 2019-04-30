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
  t: (str: string) => {},
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
    it('should display flash toast notification with content AddTeamMembersBackendError when add members fail in backend error. [JPT-926]', (done: jest.DoneCallback) => {
      const props: any = {
        ...someProps,
        addTeamMembers: () => {
          throw new JServerError(ERROR_CODES_NETWORK.BAD_REQUEST, '');
        },
      };
      const Wrapper = shallow(<AddMembersComponent {...props} />);
      Wrapper.find(JuiModal)
        .shallow()
        .find(JuiButton)
        .simulate('click');
      setTimeout(() => {
        expect(Notification.flashToast).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'people.prompt.AddTeamMembersBackendError',
          }),
        );
        done();
      },         0);
    });
    it('should display flash toast notification with content AddTeamMembersNetworkError when add members fail in network error. [JPT-925]', (done: jest.DoneCallback) => {
      const props: any = {
        ...someProps,
        addTeamMembers: () => {
          throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, '');
        },
      };
      const Wrapper = shallow(<AddMembersComponent {...props} />);
      Wrapper.find(JuiModal)
        .shallow()
        .find(JuiButton)
        .simulate('click');
      setTimeout(() => {
        expect(Notification.flashToast).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'people.prompt.AddTeamMembersNetworkError',
          }),
        );
        done();
      },         0);
    });
  });
});
