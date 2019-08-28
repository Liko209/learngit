import React from 'react';
import { observer } from 'mobx-react';
import { GenericDialerPanel } from '../GenericDialerPanel';
import { DialerPanelViewProps } from './types';
import { DialBtn } from '../DialBtn';
import { VoiceMail } from '../VoiceMail';
import { AskFirst } from '../AskFirst';
import { Transfer } from '../Transfer';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiIconButton } from 'jui/components/Buttons';

type Props = DialerPanelViewProps & WithTranslation;
@observer
class DialerPanelViewComponent extends React.Component<Props> {
  private _Back = () => {
    const { t, backToDialerFromTransferPage } = this.props;
    return (
      <JuiIconButton
        variant="plain"
        color="common.white"
        onClick={backToDialerFromTransferPage}
        size="large"
        tooltipTitle={t('telephony.action.back')}
        aria-label={t('telephony.action.back')}
        data-test-automation-id="reply-back-button"
      >
        previous
      </JuiIconButton>
    );
  };

  render() {
    const {
      makeCall,
      onAfterDialerOpen,
      displayCallerIdSelector,
      isTransferPage,
    } = this.props;
    const CallActionBtn = isTransferPage
      ? [AskFirst, Transfer, VoiceMail]
      : DialBtn;
    return (
      <GenericDialerPanel
        inputStringProps="inputString"
        onInputEnterKeyDown={makeCall}
        CallActionBtn={CallActionBtn}
        displayCallerIdSelector={displayCallerIdSelector}
        onContactSelected={makeCall}
        onAfterMount={onAfterDialerOpen}
        Back={isTransferPage ? this._Back : undefined}
      />
    );
  }
}

const DialerPanelView = withTranslation('translations')(
  DialerPanelViewComponent,
);

export { DialerPanelView };
