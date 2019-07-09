import React from 'react';
import { observer } from 'mobx-react';
import { GenericDialerPanel } from '../GenericDialerPanel';
import { DialerPanelViewProps } from './types';
import { DialBtn } from '../DialBtn';
import { withTranslation, WithTranslation } from 'react-i18next';

type Props = DialerPanelViewProps & WithTranslation;
@observer
class DialerPanelViewComponent extends React.Component<Props> {
  render() {
    const { makeCall, onAfterDialerOpen } = this.props;
    return (
      <GenericDialerPanel
        inputStringProps="inputString"
        onInputEnterKeyDown={makeCall}
        CallActionBtn={DialBtn}
        displayCallerIdSelector
        onContactSelected={makeCall}
        onAfterMount={onAfterDialerOpen}
      />
    );
  }
}

const DialerPanelView = withTranslation('translations')(
  DialerPanelViewComponent,
);

export { DialerPanelView };
