/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-04 16:12:41
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { JuiIconButton } from 'jui/components/Buttons';
import { CallViewProps, CallProps } from './types';

type Props = WithNamespaces & CallViewProps & CallProps;

@observer
class CallViewComponent extends Component<Props> {
  handleClick = () => {
    const { makeCall } = this.props;
    makeCall();
  }

  render() {
    const { t, phone } = this.props;
    return (
      <JuiIconButton
        size="small"
        onClick={this.handleClick}
        tooltipTitle={t('common.call')}
        ariaLabel={t('common.ariaCall', {
          value: phone,
        })}
      >
        phone
      </JuiIconButton>
    );
  }
}

const CallView = translate('translations')(CallViewComponent);

export { CallView };
