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
import { JuiTeamSettingButtonListItem as ButtonListItem } from 'jui/pattern/TeamSetting';

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
        t: (s: string, options) => {
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
  });
});
