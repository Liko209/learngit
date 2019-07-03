/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-01 09:46:36
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { CallViewProps } from './types';
import { JuiIconButton } from 'jui/components/Buttons';
import { JuiActionIconWrapper } from 'jui/pattern/Phone/VoicemailItem';

type Props = CallViewProps & WithTranslation;

@observer
class CallViewComponent extends Component<Props> {
  get title() {
    const { t } = this.props;
    return t('common.call');
  }

  get screenreaderText() {
    const { t } = this.props;
    return t('phone.callBack');
  }

  render() {
    const { doCall, entity } = this.props;

    return (
      <JuiActionIconWrapper>
        <JuiIconButton
          color="common.white"
          variant="round"
          autoFocus={false}
          size="small"
          key="call-button"
          onClick={doCall}
          data-test-automation-id={`${entity}-call-button`}
          tooltipTitle={this.title}
          ariaLabel={this.screenreaderText}
        >
          answer
        </JuiIconButton>
      </JuiActionIconWrapper>
    );
  }
}

const CallView = withTranslation('translations')(CallViewComponent);

export { CallView };
