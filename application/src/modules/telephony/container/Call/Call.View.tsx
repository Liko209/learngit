/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-04 16:12:41
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiIconButton } from 'jui/components/Buttons';
import portalManager from '@/common/PortalManager';
import { CallViewProps, CallProps } from './types';

type Props = WithTranslation & CallViewProps & CallProps;

@observer
class CallViewComponent extends Component<Props> {
  private _handleClick = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    const { directCall, onClick } = this.props;
    if (onClick) {
      onClick();
    } else {
      portalManager.dismissLast();
    }
    directCall();
  }

  render() {
    const { t, phoneNumber, size, variant, color, showIcon } = this.props;

    if (!showIcon.get()) {
      return null;
    }

    return (
      <JuiIconButton
        size={size ? size : 'medium'}
        onClick={this._handleClick}
        tooltipTitle={t('common.call')}
        ariaLabel={t('common.ariaCall', {
          value: phoneNumber,
        })}
        variant={variant}
        color={color}
      >
        phone
      </JuiIconButton>
    );
  }
}

const CallView = withTranslation('translations')(CallViewComponent);

export { CallView };
