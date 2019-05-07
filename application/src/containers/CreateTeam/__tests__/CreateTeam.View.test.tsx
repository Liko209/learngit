/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-11 10:31:35
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { shallow } from 'enzyme';
import { CreateTeamView } from '../CreateTeam.View';
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
      };
      Notification.flashToast = jest.fn().mockImplementationOnce(() => {});
      shallow(<CreateTeamView {...props} />);
      expect(Notification.flashToast).toHaveBeenCalledTimes(0);
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
      const view = new CreateTeamView(props);
      const items = [
        {
          type: 'isPublic',
          text: 'people.team.SetAsPublicTeam',
          checked: false,
        },
        {
          type: 'canPost',
          text: 'people.team.MembersMayPostMessages',

          checked: true,
        },
        {
          type: 'canAddMember',
          text: 'people.team.MembersMayAddOtherMembers',
          checked: true,
        },
        {
          type: 'canPin',
          text: 'people.team.MembersMayPinPosts',
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
        permissionFlags: {
          TEAM_ADD_MEMBER: true,
          TEAM_POST: true,
          TEAM_PIN_POST: true,
        },
      };
      expect(mockCreate).toBeCalledWith(props.members, expectResult);
    });
  });
});
