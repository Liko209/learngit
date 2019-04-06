/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { RecordViewProps } from './types';
import { JuiIconButton } from 'jui/components/Buttons';
import { JuiKeypadAction } from 'jui/pattern/Dialer';

type Props = RecordViewProps & WithTranslation;

@observer
class RecordViewComponent extends Component<Props> {
  private _handleRecord: () => void;

  constructor(props: Props) {
    super(props);
    this._handleRecord = () => {
      const { handleClick } = this.props;
      return handleClick();
    };
  }

  render() {
    const { t, disabled, recording } = this.props;
    // TODO: add the stop icon
    return (
      <JuiKeypadAction>
        <JuiIconButton
          color={recording ? 'semanctic.negative' : 'grey.900'}
          disableToolTip={true}
          onClick={this._handleRecord}
          size="xxlarge"
          disabled={disabled}
          awake={recording}
          shouldPersistBg={recording}
          data-test-automation-id="recordBtn"
          aria-label={recording ? t('telephony.accessibility.stopRecord') : t('telephony.accessibility.record')}
        >
          {recording ? 'hold' : 'record'}
        </JuiIconButton>
        <span className={disabled ? 'disabled' : undefined}>{recording ? t('telephony.action.stopRecord') : t('telephony.action.record')}</span>

      </JuiKeypadAction>
    );
  }
}

const RecordView = withTranslation('translations')(RecordViewComponent);

export { RecordView };
