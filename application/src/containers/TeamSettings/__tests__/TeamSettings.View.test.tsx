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
  });
});
