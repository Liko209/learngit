/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-11 10:31:48
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { shallow } from 'enzyme';
import { NewMessageView } from '../NewMessage.View';
import { Notification } from '@/containers/Notification';
jest.mock('@/containers/Notification');

describe('NewMessageView', () => {
  describe('render()', () => {
    it('should display flash toast notification when create direct message failed. [JPT-280]', () => {
      const props: any = {
        t: () => {},
        newMessage: () => {},
        isOpen: false,
        disabledOkBtn: true,
        isOffline: false,
        errorUnknown: true,
        emailError: false,
        emailErrorMsg: '',
        message: '',
        serverError: false,
        members: [],
        errorEmail: '',
        updateNewMessageDialogState: () => {},
        updateCreateTeamDialogState: () => {},
        inputReset: () => {},
        handleSearchContactChange: (items: any) => {},
      };
      Notification.flashToast = jest.fn().mockImplementationOnce(() => {});
      shallow(<NewMessageView {...props} />);
      expect(Notification.flashToast).toHaveBeenCalled();
    });
  });
});
