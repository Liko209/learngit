import React, { RefObject, createRef } from 'react';
import { observer } from 'mobx-react';
import { DialPad, JuiHeaderContainer, JuiContainer } from 'jui/pattern/Dialer';
import { KeypadPanelViewProps } from './types';
import { DialerKeypadHeader } from '../DialerKeypadHeader';
import { DialerTitleBar } from '../DialerTitleBar';
import { End } from '../End';
import ReactDOM from 'react-dom';

@observer
class KeypadPanelView extends React.Component<KeypadPanelViewProps> {
  private _dialerHeaderRef: RefObject<any> = createRef();

  private _renderKeypadActions = () => {
    const {
      dtmfThroughKeypad,
      dtmfThroughKeyboard,
      dialerFocused,
    } = this.props;
    return (
      <DialPad
        makeMouseEffect={dtmfThroughKeypad}
        makeKeyboardEffect={dtmfThroughKeyboard}
        shouldHandleKeyboardEvts={dialerFocused}
      />
    );
  };

  private _onFocus = () => {
    if (!this._dialerHeaderRef.current) {
      return;
    }
    /* eslint-disable react/no-find-dom-node */
    const fakeInput = (ReactDOM.findDOMNode(
      this._dialerHeaderRef.current,
    ) as HTMLDivElement).querySelector('[tabindex="0"]') as HTMLDivElement;

    fakeInput && fakeInput.focus();
  };

  render() {
    return (
      <>
        <JuiHeaderContainer>
          <DialerTitleBar />
          <DialerKeypadHeader ref={this._dialerHeaderRef} />
        </JuiHeaderContainer>
        <JuiContainer
          CallAction={End}
          KeypadActions={this._renderKeypadActions()}
          onFocus={this._onFocus}
        />
      </>
    );
  }
}

export { KeypadPanelView };
