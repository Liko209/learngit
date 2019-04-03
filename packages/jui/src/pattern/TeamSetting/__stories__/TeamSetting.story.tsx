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
import { JuiToggleButton } from '../../../components/Buttons/ToggleButton';
import {
  JuiTeamSettingEditSection,
  JuiTeamSettingEditSectionLeft,
  JuiTeamSettingEditSectionRight,
} from '../EditSection';
import {
  JuiTeamSettingSubSection,
  JuiTeamSettingSubSectionTitle,
  JuiTeamSettingSubSectionList,
  JuiTeamSettingSubSectionListItem,
} from '../SubSection';
import {
  JuiTeamSettingButtonList,
  JuiTeamSettingButtonListItem,
  JuiTeamSettingButtonListItemText,
} from '../ButtonList';
import defaultTeamAvatar from './defaultTeamAvatar.png';
import { boolean, number } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { JuiDivider } from '../../../components/Divider/Divider';
import { JuiIconButton } from '../../../components/Buttons/IconButton';

storiesOf('Pattern/TeamSetting', module)
  .add('Admin', () => {
    const nameTakenError = boolean('name taken error', false);
    const forbidSave = boolean('forbid saving', false);
    const nameMaxLength = number('name max length', 200);
    const descMaxLength = number('description max length', 1000);
    return (
      <JuiModal
        fillContent={true}
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
              label="Team name"
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
              label="Team description"
              inputProps={{
                maxLength: descMaxLength,
              }}
              fullWidth={true}
              onChange={action('on description change')}
            />
          </JuiTeamSettingEditSectionRight>
        </JuiTeamSettingEditSection>
        <JuiDivider />
        <JuiTeamSettingSubSection>
          <JuiTeamSettingSubSectionTitle>
            Allow team members to
          </JuiTeamSettingSubSectionTitle>
          <JuiTeamSettingSubSectionList>
            <JuiTeamSettingSubSectionListItem label="Add team members">
              <JuiToggleButton onChange={action('on allowMemberAdd change')} />
            </JuiTeamSettingSubSectionListItem>
            <JuiDivider />
            <JuiTeamSettingSubSectionListItem label="Post messages">
              <JuiToggleButton onChange={action('on allowMemberPost change')} />
            </JuiTeamSettingSubSectionListItem>
            <JuiDivider />
            <JuiTeamSettingSubSectionListItem label="Pin posts">
              <JuiToggleButton onChange={action('on allowMemberPin change')} />
            </JuiTeamSettingSubSectionListItem>
          </JuiTeamSettingSubSectionList>
        </JuiTeamSettingSubSection>
        <JuiDivider />
        <JuiTeamSettingButtonList>
          <JuiTeamSettingButtonListItem color="semantic.negative">
            <JuiTeamSettingButtonListItemText color="semantic.negative">
              Delete team
            </JuiTeamSettingButtonListItemText>
            <JuiIconButton
              variant="plain"
              tooltipTitle="Fugiat excepteur non excepteur adipisicing quis magna tempor tempor est ex mollit."
            >
              remove
            </JuiIconButton>
          </JuiTeamSettingButtonListItem>
          <JuiDivider />
          <JuiTeamSettingButtonListItem color="semantic.negative">
            <JuiTeamSettingButtonListItemText color="semantic.negative">
              Archive team
            </JuiTeamSettingButtonListItemText>
            <JuiIconButton
              variant="plain"
              tooltipTitle="Fugiat excepteur non excepteur adipisicing quis magna tempor tempor est ex mollit."
            >
              remove
            </JuiIconButton>
          </JuiTeamSettingButtonListItem>
          <JuiDivider />
        </JuiTeamSettingButtonList>
      </JuiModal>
    );
  })
  .add('Non-admin', () => {
    return (
      <JuiModal
        fillContent={true}
        open={true}
        size={'medium'}
        modalProps={{ scroll: 'body' }}
        title="Settings"
        onCancel={action('on cancel')}
        onOK={action('on ok')}
        okText="Save"
        cancelText="Cancel"
      >
        <JuiDivider />
        <JuiTeamSettingButtonList>
          <JuiTeamSettingButtonListItem color="semantic.negative">
            <JuiTeamSettingButtonListItemText color="semantic.negative">
              Leave team
            </JuiTeamSettingButtonListItemText>
          </JuiTeamSettingButtonListItem>
          <JuiDivider />
        </JuiTeamSettingButtonList>
      </JuiModal>
    );
  });
