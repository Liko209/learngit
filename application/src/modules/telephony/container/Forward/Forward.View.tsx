/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-05-30 13:55:51
 * Copyright © RingCentral. All rights reserved.
 */
import React, { createRef, RefObject } from 'react';
import { observer } from 'mobx-react';
import { JuiHeaderContainer, JuiTitleBar } from 'jui/pattern/Dialer';
import { DialerHeader } from '../DialerHeader';
import { JuiIconButton } from 'jui/components/Buttons';
import { DialerContainer } from '../DialerContainer';
import { ViewProps } from './types';
import { withTranslation, WithTranslation } from 'react-i18next';

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
  }
  render() {
    const { t } = this.props;

    return (
      <>
        <JuiHeaderContainer>
          <JuiTitleBar label={t('telephony.forwardCall')} />
          <DialerHeader Back={this._Back} ref={this.dialerHeaderRef} />
        </JuiHeaderContainer>
        <DialerContainer dialerHeaderRef={this.dialerHeaderRef} />
      </>
    );
  }
}

const ForwardView = withTranslation('translations')(ForwardViewComponent);

export { ForwardView };
