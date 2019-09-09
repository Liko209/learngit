/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-11 10:31:35
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { shallow } from 'enzyme';
import { CreateTeamView } from '../CreateTeam.View';
import { Notification } from '@/containers/Notification';
import { INIT_ITEMS } from '../types';
import { JuiModal } from 'jui/components/Dialog';

jest.mock('@/containers/Notification');

describe('CreateTeamView', () => {
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
  describe('render()', () => {
    it('should display flash toast notification when create team failed. [JPT-388]', () => {
      Notification.flashToast = jest.fn().mockImplementationOnce(() => {});
      shallow(<CreateTeamView {...props} />);
      expect(Notification.flashToast).toHaveBeenCalledTimes(0);
    });
    it('should render withEscTracking when Component rendered ', async () => {
      const Wrapper = shallow(<CreateTeamView {...props} />);
      const modal = Wrapper.shallow().find(JuiModal);
      expect(modal.props().onEscTracking).toBeTruthy();
    });
  });

  describe('createTeam()', () => {
    it('should call create with correct teamSetting [JPT-892]', () => {
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
          type: INIT_ITEMS.IS_PUBLIC,
          text: 'people.team.SetAsPublicTeam',
          checked: false,
        },
        {
          type: INIT_ITEMS.CAN_POST,
          text: 'people.team.MembersMayPostMessages',

          checked: true,
        },
        {
          type: INIT_ITEMS.CAN_ADD_MEMBER,
          text: 'people.team.MembersMayAddOtherMembers',
          checked: true,
        },
        {
          type: INIT_ITEMS.CAN_AT_TEAM_MENTION,
          text: 'people.team.MembersCanAtTeamMention',
          checked: false,
        },
        {
          type: INIT_ITEMS.CAN_PIN,
          text: 'people.team.MembersMayPinPosts',
          checked: true,
        },
      ];
      Object.assign(view.state, { items });
      view.createTeam();
      expect(mockCreate).toHaveBeenCalled();

      const expectResult = {
        name: props.teamName,
        description: props.description,
        isPublic: false,
        permissionFlags: {
          TEAM_ADD_MEMBER: true,
          TEAM_POST: true,
          TEAM_PIN_POST: true,
          TEAM_MENTION: false,
        },
      };
      expect(mockCreate).toHaveBeenCalledWith(props.members, expectResult);
    });
  });
});
