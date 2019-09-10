/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-03-13 09:52:08
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { GroupSettingsProps, GroupSettingsViewProps } from './types';
import { toTitleCase } from '@/utils/string';
import { JuiModal } from 'jui/components/Dialog';
import { withEscTracking } from '@/containers/Dialog';
import portalManager from '@/common/PortalManager';
import {
  JuiTeamSettingButtonList as ButtonList,
  JuiTeamSettingButtonListItem as ButtonListItem,
  JuiTeamSettingButtonListItemText as ButtonListItemText,
} from 'jui/pattern/TeamSetting';
import { ConvertToTeam } from '@/containers/ConvertToTeam';
import { JuiDivider } from 'jui/components/Divider';

type Props = GroupSettingsProps & GroupSettingsViewProps & WithTranslation;
const Modal = withEscTracking(JuiModal);
@observer
class GroupSettingsComponent extends Component<Props> {
  private _handleClose = () => {
    portalManager.dismissLast();
  };

  private _handleOk = async () => {
    this._handleClose();
  };

  private _openConvertToTeam = () => {
    const { id } = this.props;
    this._handleClose();
    ConvertToTeam.show({ id });
  };

  render() {
    const { t } = this.props;

    return (
      <Modal
        fillContent
        open
        size={'medium'}
        title={t('setting.teamSettings')}
        onCancel={this._handleClose}
        onOK={this._handleOk}
        okText={toTitleCase(t('common.dialog.save'))}
        cancelText={toTitleCase(t('common.dialog.cancel'))}
      >
        <ButtonList>
          <JuiDivider />
          <ButtonListItem
            data-test-automation-id="groupSettingsConvertToTeam"
            color="primary"
            onClick={this._openConvertToTeam}
          >
            <ButtonListItemText color="primary">
              {t('people.team.convertToTeam')}
            </ButtonListItemText>
          </ButtonListItem>
          <JuiDivider />
        </ButtonList>
      </Modal>
    );
  }
}

const GroupSettingsView = withTranslation('translations')(
  GroupSettingsComponent,
);

export { GroupSettingsView };
