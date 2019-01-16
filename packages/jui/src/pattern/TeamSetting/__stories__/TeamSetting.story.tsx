/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-01-15 10:29:41
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { JuiModal } from '../../../components/Dialog';
import { JuiTextField } from '../../../components/Forms/TextField';
import { JuiTextarea } from '../../../components/Forms/Textarea';
import { JuiAvatar } from '../../../components/Avatar';
import {
  JuiTeamSettingEditSection,
  JuiTeamSettingEditSectionLeft,
  JuiTeamSettingEditSectionRight,
} from '../EditSection';
import defaultTeamAvatar from './defaultTeamAvatar.png';
import { boolean, number } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';

storiesOf('Pattern/SettingDialogs', module).add('Team Settings', () => {
  const nameTakenError = boolean('name taken error', false);
  const forbidSave = boolean('forbid saving', false);
  const nameMaxLength = number('name max length', 200);
  const descMaxLength = number('description max length', 1000);
  return (
    <JuiModal
      open={true}
      size={'medium'}
      modalProps={{ scroll: 'body' }}
      okBtnProps={{ disabled: forbidSave }}
      title="Settings"
      onCancel={action('on cancel')}
      onOK={action('on ok')}
      okText="Save"
      cancelText="Cancel"
    >
      <JuiTeamSettingEditSection>
        <JuiTeamSettingEditSectionLeft>
          <JuiAvatar size="xlarge" src={defaultTeamAvatar} />
        </JuiTeamSettingEditSectionLeft>
        <JuiTeamSettingEditSectionRight>
          <JuiTextField
            id="names"
            label="Team Names"
            fullWidth={true}
            error={nameTakenError}
            inputProps={{
              maxLength: nameMaxLength,
            }}
            helperText={
              nameTakenError
                ? 'The name is already taken, choose another one.'
                : ''
            }
            onChange={action('on name change')}
          />
          <JuiTextarea
            id="Description"
            label="Description"
            inputProps={{
              maxLength: descMaxLength,
            }}
            fullWidth={true}
            onChange={action('on description change')}
          />
        </JuiTeamSettingEditSectionRight>
      </JuiTeamSettingEditSection>
    </JuiModal>
  );
});
