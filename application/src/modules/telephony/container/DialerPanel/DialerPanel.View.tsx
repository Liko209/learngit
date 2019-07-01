import React from 'react';
import { observer } from 'mobx-react';
import { GenericDialerPanel } from '../GenericDialerPanel';
import { DialerPanelViewProps } from './types';
import { DialBtn } from '../DialBtn';

@observer
export class DialerPanelView extends React.Component<DialerPanelViewProps> {
  render() {
    const { makeCall, onAfterDialerOpen } = this.props;
    return (
      <GenericDialerPanel
        inputStringProps="inputString"
        onInputEnterKeyDown={makeCall}
        CallActionBtn={DialBtn}
        displayCallerIdSelector={true}
        onContactSelected={makeCall}
        onAfterMount={onAfterDialerOpen}
      />
    );
  }
}
