/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-03-13 09:52:08
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import i18next from 'i18next';
import { ConvertToTeamViewProps } from './types';
import { toTitleCase } from '@/utils/string';
import { JuiModal } from 'jui/components/Dialog';
import portalManager from '@/common/PortalManager';

@observer
class ConvertToTeamView extends Component<ConvertToTeamViewProps> {
  private _handleClose = () => {
    portalManager.dismissLast();
  }

  private _handleOk = async () => {
    alert('ok');
  }

  render() {
    const { saving } = this.props;
    const disabledOkBtn = false;
    return (
      <JuiModal
        fillContent={true}
        open={true}
        size={'medium'}
        okBtnProps={{ disabled: disabledOkBtn, loading: saving }}
        title={i18next.t('people.team.convertToTeam')}
        onCancel={this._handleClose}
        onOK={this._handleOk}
        okText={toTitleCase(i18next.t('common.dialog.save'))}
        cancelText={toTitleCase(i18next.t('common.dialog.cancel'))}
      >
        convert to team
      </JuiModal>
    );
  }
}

export { ConvertToTeamView };
