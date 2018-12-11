/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-11 10:31:35
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { shallow } from 'enzyme';
import { CreateTeamComponent } from '../CreateTeam.View';
import { Notification } from '@/containers/Notification';
jest.mock('@/containers/Notification');

describe('CreateTeamView', () => {
  describe('render()', () => {
    it('should display flash toast notification when create team failed. [JPT-388]', () => {
      const props: any = {
        t: (str: string) => {},
        create: () => {},
        isOpen: false,
        disabledOkBtn: false,
        isOffline: false,
        nameError: false,
        emailError: false,
        errorMsg: 'string',
        emailErrorMsg: 'string',
        teamName: 'string',
        description: 'string',
        serverError: false,
        members: [],
        errorEmail: 'string',
        updateCreateTeamDialogState: () => {},
        inputReset: () => {},
        handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => {},
        handleDescChange: (e: React.ChangeEvent<HTMLInputElement>) => {},
        handleSearchContactChange: (items: any) => {},
        serverUnknownError: true,
      };
      Notification.flashToast = jest.fn().mockImplementationOnce(() => {});
      shallow(<CreateTeamComponent {...props} />);
      expect(Notification.flashToast).toHaveBeenCalled();
    });
  });
});
