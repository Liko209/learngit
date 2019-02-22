/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-02-03 10:11:57
 * Copyright © RingCentral. All rights reserved.
 */
// import { UserConfig } from 'sdk/service/account';
import { getEntity } from '../../../../../../../../store/utils';
import { GroupItemViewModel } from '../GroupItem.ViewModel';
import { Props } from '../types';

jest.mock('../../../../../../../../store/utils');
// jest.mock('sdk/service/account');

const mockData = {
  isTeam: true,
  privacy: 'protected',
  members: [1],
  isMember: false,
};

describe('GroupItemViewModel', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });
  describe('get canJoinTeam', () => {
    it('If isTeam && privacy = protected & !isMember canJoinTeam should be true', () => {
      (getEntity as jest.Mock).mockReturnValue({
        isTeam: true,
        privacy: 'protected',
        members: [1],
        isMember: false,
      });
      const groupItemViewModel = new GroupItemViewModel({} as Props);
      expect(groupItemViewModel.canJoinTeam).toBeTruthy();
    });
    it('If isTeam = false canJoinTeam should be false', () => {
      (getEntity as jest.Mock).mockReturnValue({
        isTeam: false,
      });
      const groupItemViewModel = new GroupItemViewModel({} as Props);
      expect(groupItemViewModel.canJoinTeam).toBeFalsy();
    });
    it('If isMember = true canJoinTeam should be false', () => {
      (getEntity as jest.Mock).mockReturnValue({
        isMember: true,
      });
      const groupItemViewModel = new GroupItemViewModel({} as Props);
      expect(groupItemViewModel.canJoinTeam).toBeFalsy();
    });
    it('If privacy != protected canJoinTeam should be false', () => {
      (getEntity as jest.Mock).mockReturnValue({
        privacy: '',
      });
      const groupItemViewModel = new GroupItemViewModel({} as Props);
      expect(groupItemViewModel.canJoinTeam).toBeFalsy();
    });
  });
  describe('get isPrivate', () => {
    it('If isTeam & privacy = private isPrivate should be true', () => {
      (getEntity as jest.Mock).mockReturnValue({
        isTeam: true,
        privacy: 'private',
      });
      const groupItemViewModel = new GroupItemViewModel({} as Props);
      expect(groupItemViewModel.isPrivate).toBeTruthy();
    });
    it('If isTeam = false isPrivate should be false', () => {
      (getEntity as jest.Mock).mockReturnValue({
        isTeam: false,
      });
      const groupItemViewModel = new GroupItemViewModel({} as Props);
      expect(groupItemViewModel.isPrivate).toBeFalsy();
    });
    it('If privacy != private isPrivate should be false', () => {
      (getEntity as jest.Mock).mockReturnValue({
        privacy: '',
      });
      const groupItemViewModel = new GroupItemViewModel({} as Props);
      expect(groupItemViewModel.isPrivate).toBeFalsy();
    });
  });
  describe('get isJoined', () => {
    it('If isTeam & privacy = protected & isMember isJoined should be true', () => {
      (getEntity as jest.Mock).mockReturnValue({
        isTeam: true,
        privacy: 'protected',
        isMember: true,
      });
      const groupItemViewModel = new GroupItemViewModel({} as Props);
      expect(groupItemViewModel.isJoined).toBeTruthy();
    });
    it('If isTeam = false isJoined should be false', () => {
      (getEntity as jest.Mock).mockReturnValue({
        isTeam: false,
      });
      const groupItemViewModel = new GroupItemViewModel({} as Props);
      expect(groupItemViewModel.isJoined).toBeFalsy();
    });
    it('If privacy != protected isJoined should be false', () => {
      (getEntity as jest.Mock).mockReturnValue({
        privacy: '',
      });
      const groupItemViewModel = new GroupItemViewModel({} as Props);
      expect(groupItemViewModel.isJoined).toBeFalsy();
    });
    it('If isMember != true isJoined should be false', () => {
      (getEntity as jest.Mock).mockReturnValue({
        isMember: false,
      });
      const groupItemViewModel = new GroupItemViewModel({} as Props);
      expect(groupItemViewModel.isJoined).toBeFalsy();
    });
  });
  describe('get hovered', () => {
    it('If sectionIndex and cellIndex = selectIndex hovered should be true', () => {
      const groupItemViewModel = new GroupItemViewModel({
        sectionIndex: 1,
        selectIndex: [1, 2],
        cellIndex: 2,
      } as Props);
      expect(groupItemViewModel.hovered).toBeTruthy();
    });
    it('If sectionIndex != selectIndex[0] hovered should be false', () => {
      const groupItemViewModel = new GroupItemViewModel({
        sectionIndex: 2,
        selectIndex: [1, 2],
      } as Props);
      expect(groupItemViewModel.hovered).toBeFalsy();
    });
    it('If cellIndex != selectIndex[1] hovered should be false', () => {
      const groupItemViewModel = new GroupItemViewModel({
        selectIndex: [1, 2],
        cellIndex: 1,
      } as Props);
      expect(groupItemViewModel.hovered).toBeFalsy();
    });
  });

  describe('get shouldHidden', () => {
    it('If delete the team or group should be hidden', () => {
      (getEntity as jest.Mock).mockReturnValue({
        isTeam: true,
        deactivated: true,
      });
      const groupItemViewModel = new GroupItemViewModel({} as Props);
      expect(groupItemViewModel.shouldHidden).toBeTruthy();
    });
    it('If group or team is private and not include me should be hidden', () => {
      (getEntity as jest.Mock).mockReturnValue({
        isTeam: true,
        isMember: false,
        privacy: 'private',
      });
      const groupItemViewModel = new GroupItemViewModel({} as Props);
      expect(groupItemViewModel.shouldHidden).toBeTruthy();
    });
    it('If group or team is private and include me should not be hidden', () => {
      (getEntity as jest.Mock).mockReturnValue({
        isTeam: true,
        isMember: true,
        privacy: 'private',
      });
      const groupItemViewModel = new GroupItemViewModel({} as Props);
      expect(groupItemViewModel.shouldHidden).toBeFalsy();
    });
  });
});
