/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-05-30 13:55:51
 * Copyright © RingCentral. All rights reserved.
 */
import React, { createRef, RefObject } from 'react';
import { observer } from 'mobx-react';
import { GenericDialerPanel } from '../GenericDialerPanel';
import { ViewProps } from './types';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiFabButton, JuiIconButton } from 'jui/components/Buttons';

type Props = ViewProps & WithTranslation;
@observer
class ForwardViewComponent extends React.Component<Props> {
  dialerHeaderRef: RefObject<any> = createRef();
  private _Back = () => {
    const { t, quitForward } = this.props;
    return (
      <JuiIconButton
        variant="plain"
        color="common.white"
        onClick={quitForward}
        size="large"
        tooltipTitle={t('telephony.action.back')}
        aria-label={t('telephony.action.back')}
        data-test-automation-id="reply-back-button"
      >
        previous
      </JuiIconButton>
    );
  };

  private _ForwardBtn = () => {
    const { t, makeForwardCall } = this.props;
    return (
      <JuiFabButton
        color="semantic.positive"
        size="moreLarge"
        showShadow={false}
        tooltipPlacement="top"
        iconName="forwardcall"
        data-test-automation-id="telephony-forward-btn"
        aria-label={t('telephony.action.forward')}
        tooltipTitle={t('telephony.action.forward')}
        onClick={makeForwardCall}
      />
    );
  };
  render() {
    const { forward } = this.props;

    return (
      <GenericDialerPanel
        inputStringProps="forwardString"
        onInputEnterKeyDown={forward}
        CallActionBtn={this._ForwardBtn}
        displayCallerIdSelector={false}
        onContactSelected={forward}
        Back={this._Back}
      />
    );
  }
}

const ForwardView = withTranslation('translations')(ForwardViewComponent);

export { ForwardView };
