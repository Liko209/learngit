/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-03-13 09:52:08
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import i18next from 'i18next';
import { GroupSettingsProps, GroupSettingsViewProps } from './types';
import { toTitleCase } from '@/utils/string';
import { JuiModal } from 'jui/components/Dialog';
import portalManager from '@/common/PortalManager';
import {
  JuiTeamSettingButtonList as ButtonList,
  JuiTeamSettingButtonListItem as ButtonListItem,
  JuiTeamSettingButtonListItemText as ButtonListItemText,
} from 'jui/pattern/TeamSetting';
import { ConvertToTeam } from '@/containers/ConvertToTeam';
import { JuiDivider } from 'jui/components/Divider';

@observer
class GroupSettingsView extends Component<
  GroupSettingsProps & GroupSettingsViewProps
> {
  private _handleClose = () => {
    portalManager.dismissLast();
  }

  private _handleOk = async () => {
    this._handleClose();
  }

  private _openConvertToTeam = (e: React.MouseEvent<HTMLInputElement>) => {
    const { id } = this.props;
    this._handleClose();
    ConvertToTeam.show({ id });
  }

  render() {
    return (
      <JuiModal
        fillContent={true}
        open={true}
        size={'medium'}
        title={i18next.t('setting.teamSettings')}
        onCancel={this._handleClose}
        onOK={this._handleOk}
        okText={toTitleCase(i18next.t('common.dialog.save'))}
        cancelText={toTitleCase(i18next.t('common.dialog.cancel'))}
      >
        <ButtonList>
          <JuiDivider />
          <ButtonListItem
            data-test-automation-id="groupSettingsConvertToTeam"
            color="primary"
            onClick={this._openConvertToTeam}
          >
            <ButtonListItemText color="primary">
              {i18next.t('people.team.convertToTeam')}
            </ButtonListItemText>
          </ButtonListItem>
          <JuiDivider />
        </ButtonList>
      </JuiModal>
    );
  }
}

export { GroupSettingsView };
