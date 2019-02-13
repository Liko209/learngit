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

  describe('createTeam()', () => {
    it('should call create with correct teamSetting', () => {
      const mockCreate = jest.fn();
      const props: any = {
        create: mockCreate,
        teamName: 'teamName',
        description: 'teamDescription',
        members: 'teamMember',
      };
      const view = new CreateTeamComponent(props);
      const items = [
        {
          type: 'isPublic',
          text: 'PublicTeam',
          checked: false,
        },
        {
          type: 'canPost',
          text: 'MembersMayPostMessages',

          checked: true,
        },
        {
          type: 'canAddMember',
          text: 'MembersMayAddOtherMembers',
          checked: true,
        },
      ];
      Object.assign(view.state, { items });
      view.createTeam();
      expect(mockCreate).toBeCalled();

      const expectResult = {
        name: props.teamName,
        description: props.description,
        isPublic: false,
        canPost: true,
        canAddMember: true,
        permissionFlags: {
          TEAM_ADD_MEMBER: false,
          TEAM_POST: true,
        },
      };
      expect(mockCreate).toBeCalledWith(props.members, expectResult);
    });
  });
});
