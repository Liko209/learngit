/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-01 09:46:36
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { CallViewProps } from './types';
import { ActionButton } from 'jui/pattern/Phone/VoicemailItem';

type Props = CallViewProps & WithTranslation;

@observer
class CallViewComponent extends Component<Props> {
  get title() {
    const { t } = this.props;
    return t('common.call');
  }

  get screenreaderText() {
    const { t } = this.props;
    return t('common.call');
  }

  render() {
    const { phoneNumber, doCall, type, isMe } = this.props;
    return (
      phoneNumber &&
      !isMe && (
        <ActionButton
          key="call-button"
          icon="phone"
          type={type}
          tooltip={this.title}
          onClick={doCall}
          screenReader={this.screenreaderText}
          automationId={`${type}-call-button`}
        />
      )
    );
  }
}

const CallView = withTranslation('translations')(CallViewComponent);

export { CallView };
