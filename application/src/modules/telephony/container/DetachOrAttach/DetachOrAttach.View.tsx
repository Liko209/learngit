/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { DetachOrAttachViewProps } from './types';
import { JuiIconButton } from 'jui/components/Buttons';

type Props = DetachOrAttachViewProps & WithTranslation;

@observer
class DetachOrAttachViewComponent extends Component<Props> {
  private _handleDetachOrAttach = async () => {
    const { detachOrAttach } = this.props;
    detachOrAttach();
  }

  render() {
    const { t, isDetached } = this.props;
    return (
      <JuiIconButton
        size="small"
        tooltipTitle={
          isDetached
            ? t('telephony.action.attach')
            : t('telephony.action.detach')
        }
        onClick={this._handleDetachOrAttach}
        variant="plain"
        color="common.white"
        data-test-automation-id="telephony-detach-or-attach-btn"
      >
        tear_off
      </JuiIconButton>
    );
  }
}

const DetachOrAttachView = withTranslation('translations')(
  DetachOrAttachViewComponent,
);

export { DetachOrAttachView };
