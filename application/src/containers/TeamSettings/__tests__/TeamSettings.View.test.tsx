/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-01-15 17:54:59
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { shallow } from 'enzyme';
import { TeamSettingsComponent } from '../TeamSettings.View';
import { JuiTextField } from 'jui/components/Forms/TextField';
import { JuiTextarea } from 'jui/components/Forms/Textarea';
import { Dialog } from '@/containers/Dialog';
import {
  JuiTeamSettingButtonListItem as ButtonListItem,
  JuiTeamSettingButtonListItemText as ButtonListItemText,
} from 'jui/pattern/TeamSetting';

describe('TeamSettingsView', () => {
  describe('render()', () => {
    it('should pass correct max length attributes to the input fields [JPT-927]', () => {
      const props: any = {
        t: (s: string) => s,
        initialData: {
          name: '',
          description: '',
        },
        id: 123,
        isAdmin: true,
        save: () => {},
      };
      const result = shallow(<TeamSettingsComponent {...props} />);
      expect(
        result
          .find(JuiTextField)
          .at(0)
          .props(),
      ).toMatchObject({
        inputProps: { maxLength: 200 },
      });
      expect(
        result
          .find(JuiTextarea)
          .at(0)
          .props(),
      ).toMatchObject({
        inputProps: { maxLength: 1000 },
      });
    });

    it('should display original name and description of team when first open setting [JPT-892]', () => {
      const props: any = {
        t: (s: string) => s,
        initialData: {
          name: 'INITIAL NAME',
          description: 'SOME INITIAL DESC....',
        },
        id: 123,
        isAdmin: true,
        save: () => {},
      };
      const result = shallow(<TeamSettingsComponent {...props} />);
      expect(
        result
          .find(JuiTextField)
          .at(0)
          .props(),
      ).toMatchObject({
        value: 'INITIAL NAME',
      });
      expect(
        result
          .find(JuiTextarea)
          .at(0)
          .props(),
      ).toMatchObject({
        value: 'SOME INITIAL DESC....',
      });
    });
  });

  describe('Confirm dialog', () => {
    it('The Leave Team dialog display correctly after clicking leave team button [JPT-934]', (done: jest.DoneCallback) => {
      jest.spyOn(Dialog, 'confirm');
      const props: any = {
        t: (s: string, options: object) => {
          if (!options) {
            return s;
          }
          return `${s} ${JSON.stringify(options)}`;
        },
        initialData: {
          name: '',
          description: '',
        },
        id: 123,
        isAdmin: false,
        isCompanyTeam: false,
        save: () => {},
        leaveTeam: () => {},
        groupName: 'my team',
      };
      const result = shallow(<TeamSettingsComponent {...props} />);
      const leaveTeamButton = result
        .find(ButtonListItem)
        .filterWhere(wrapper => wrapper.text() === 'leaveTeam');
      expect(leaveTeamButton.text()).toEqual('leaveTeam');
      expect(leaveTeamButton.simulate('click'));
      setTimeout(() => {
        expect(Dialog.confirm).toHaveBeenCalledWith(
          expect.objectContaining({
            content: 'leaveTeamConfirmContent {"teamName":"my team"}',
            okText: 'Leaveteamconfirmok',
            cancelText: 'Cancel',
          }),
        );
        done();
      });
    });

    it('Only team admins are allowed to delete team [JPT-1107]', () => {
      const props: any = {
        t: (s: string, options: object) => {
          if (!options) {
            return s;
          }
          return `${s} ${JSON.stringify(options)}`;
        },
        initialData: {
          name: '',
          description: '',
        },
        id: 123,
        isAdmin: false,
        isCompanyTeam: false,
        save: () => {},
        leaveTeam: () => {},
        groupName: 'my team',
      };
      let result = shallow(<TeamSettingsComponent {...props} />);
      let deleteTeamButton = result
        .find(ButtonListItem)
        .filterWhere(
          wrapper => wrapper.find(ButtonListItemText).text() === 'deleteTeam',
        );
      expect(deleteTeamButton.prop('hide')).toBeTruthy();
      props.isAdmin = true;
      result = shallow(<TeamSettingsComponent {...props} />);
      deleteTeamButton = result
        .find(ButtonListItem)
        .filterWhere(
          wrapper => wrapper.find(ButtonListItemText).text() === 'deleteTeam',
        );
      expect(deleteTeamButton.prop('hide')).toBeFalsy();
    });

    it('There\'s no "Delete team" options in the "All Hands" team. [JPT-1115]', () => {
      const props: any = {
        t: (s: string, options: object) => {
          if (!options) {
            return s;
          }
          return `${s} ${JSON.stringify(options)}`;
        },
        initialData: {
          name: '',
          description: '',
        },
        id: 123,
        isAdmin: true,
        isCompanyTeam: true,
        save: () => {},
        leaveTeam: () => {},
        groupName: 'my team',
      };
      let result = shallow(<TeamSettingsComponent {...props} />);
      let deleteTeamButton = result
        .find(ButtonListItem)
        .filterWhere(
          wrapper => wrapper.find(ButtonListItemText).text() === 'deleteTeam',
        );
      expect(deleteTeamButton.prop('hide')).toBeTruthy();
      props.isCompanyTeam = false;
      result = shallow(<TeamSettingsComponent {...props} />);
      deleteTeamButton = result
        .find(ButtonListItem)
        .filterWhere(
          wrapper => wrapper.find(ButtonListItemText).text() === 'deleteTeam',
        );
      expect(deleteTeamButton.prop('hide')).toBeFalsy();
    });

    it('The Delete Team dialog display correctly after clicking "Delete team" button [JPT-1108]', (done: jest.DoneCallback) => {
      jest.spyOn(Dialog, 'confirm');
      const props: any = {
        t: (s: string, options: object) => {
          if (!options) {
            return s;
          }
          return `${s} ${JSON.stringify(options)}`;
        },
        initialData: {
          name: '',
          description: '',
        },
        id: 123,
        isAdmin: true,
        isCompanyTeam: false,
        save: () => {},
        leaveTeam: () => {},
        groupName: 'my team',
      };
      const result = shallow(<TeamSettingsComponent {...props} />);
      const deleteTeamButton = result
        .find(ButtonListItem)
        .filterWhere(
          wrapper => wrapper.find(ButtonListItemText).text() === 'deleteTeam',
        );
      expect(deleteTeamButton.prop('hide')).toBeFalsy();
      expect(deleteTeamButton.find(ButtonListItemText).text()).toEqual(
        'deleteTeam',
      );
      expect(deleteTeamButton.simulate('click'));
      setTimeout(() => {
        expect(Dialog.confirm).toHaveBeenCalledWith(
          expect.objectContaining({
            content: 'deleteTeamConfirmContent {"teamName":"my team"}',
            okText: 'Deleteteamconfirmok',
            cancelText: 'Cancel',
          }),
        );
        done();
      });
    });

    it('Only team admins are allowed to archive team [JPT-1126]', () => {
      const props: any = {
        t: (s: string, options: object) => {
          if (!options) {
            return s;
          }
          return `${s} ${JSON.stringify(options)}`;
        },
        initialData: {
          name: '',
          description: '',
        },
        id: 123,
        isAdmin: false,
        isCompanyTeam: false,
        save: () => {},
        leaveTeam: () => {},
        groupName: 'my team',
      };
      let result = shallow(<TeamSettingsComponent {...props} />);
      let archiveTeamButton = result
        .find(ButtonListItem)
        .filterWhere(
          wrapper => wrapper.find(ButtonListItemText).text() === 'archiveTeam',
        );
      expect(archiveTeamButton.prop('hide')).toBeTruthy();
      props.isAdmin = true;
      result = shallow(<TeamSettingsComponent {...props} />);
      archiveTeamButton = result
        .find(ButtonListItem)
        .filterWhere(
          wrapper => wrapper.find(ButtonListItemText).text() === 'archiveTeam',
        );
      expect(archiveTeamButton.prop('hide')).toBeFalsy();
    });

    it('There\'s no "Archive team" options in the "All Hands" team. [JPT-1127]', () => {
      const props: any = {
        t: (s: string, options: object) => {
          if (!options) {
            return s;
          }
          return `${s} ${JSON.stringify(options)}`;
        },
        initialData: {
          name: '',
          description: '',
        },
        id: 123,
        isAdmin: true,
        isCompanyTeam: true,
        save: () => {},
        leaveTeam: () => {},
        groupName: 'my team',
      };
      let result = shallow(<TeamSettingsComponent {...props} />);
      let archiveTeamButton = result
        .find(ButtonListItem)
        .filterWhere(
          wrapper => wrapper.find(ButtonListItemText).text() === 'archiveTeam',
        );
      expect(archiveTeamButton.prop('hide')).toBeTruthy();
      props.isCompanyTeam = false;
      result = shallow(<TeamSettingsComponent {...props} />);
      archiveTeamButton = result
        .find(ButtonListItem)
        .filterWhere(
          wrapper => wrapper.find(ButtonListItemText).text() === 'archiveTeam',
        );
      expect(archiveTeamButton.prop('hide')).toBeFalsy();
    });

    it('The Archive Team dialog display correctly after clicking "Archive team" button [JPT-1128]', (done: jest.DoneCallback) => {
      jest.spyOn(Dialog, 'confirm');
      const props: any = {
        t: (s: string, options: object) => {
          if (!options) {
            return s;
          }
          return `${s} ${JSON.stringify(options)}`;
        },
        initialData: {
          name: '',
          description: '',
        },
        id: 123,
        isAdmin: true,
        isCompanyTeam: false,
        save: () => {},
        leaveTeam: () => {},
        groupName: 'my team',
      };
      const result = shallow(<TeamSettingsComponent {...props} />);
      const archiveTeamButton = result
        .find(ButtonListItem)
        .filterWhere(
          wrapper => wrapper.find(ButtonListItemText).text() === 'archiveTeam',
        );
      expect(archiveTeamButton.prop('hide')).toBeFalsy();
      expect(archiveTeamButton.find(ButtonListItemText).text()).toEqual(
        'archiveTeam',
      );
      expect(archiveTeamButton.simulate('click'));
      setTimeout(() => {
        expect(Dialog.confirm).toHaveBeenCalledWith(
          expect.objectContaining({
            content: 'archiveTeamConfirmContent {"teamName":"my team"}',
            okText: 'Archiveteamconfirmok',
            cancelText: 'Cancel',
          }),
        );
        done();
      });
    });
  });
});
