/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-21 18:11:42
 * Copyright © RingCentral. All rights reserved.
 */
import React, {
  PureComponent,
  ChangeEvent,
  KeyboardEvent,
  MouseEvent,
  createRef,
  RefObject,
} from 'react';
import styled from '../../foundation/styled-components';
import {
  spacing,
  typography,
  palette,
  height,
  ellipsis,
} from '../../foundation/utils/styles';
import { JuiTextField } from '../../components/Forms';
import { Theme } from '../../foundation/theme/theme';
import { JuiIconButton } from '../../components/Buttons';
import ReactDOM from 'react-dom';
import { isFunction, debounce } from 'lodash';

type Props = {
  Back?: React.ComponentType;
  HoverActions?: React.ComponentType;
  Avatar?: React.ComponentType;
  RecentCallBtn?: React.ComponentType;
  name?: string;
  phone?: string;
  placeholder?: string;
  showDialerInputField?: boolean;
  dialerValue?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  focus?: boolean;
  ariaLabelForDelete?: string;
  deleteInputString?: (startPos: number, endPos: number) => void;
  deleteAllInputString?: () => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
};

type State = {
  showHoverActions: boolean;
};

const DIALER_CLASS_NAME = 'dialer-input';

const StyledBack = styled('div')`
  margin-right: ${spacing(3)};
`;

const StyledInfoContainer = styled('div')`
  margin-left: ${spacing(3)};
  ${ellipsis()};
`;

const StyledName = styled('div')`
  ${typography('subheading3')};
  ${ellipsis()};
`;

const StyledPhone = styled('div')`
  ${typography('body1')};
  ${ellipsis()};
`;

const StyledHeader = styled('div')`
  && {
    color: ${palette('common', 'white')};
    padding: ${spacing(1, 4, 3)};
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;
    height: ${height(14)};
  }
`;

const StyledHeaderNoPadding = styled('div')`
  && {
    color: ${palette('common', 'white')};
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;
    height: ${height(13)};
  }
`;

const StyledLeft = styled('div')`
  && {
    ${typography('body2')};
    display: flex;
    align-items: center;
    width: 100%;
  }
  && caption {
    ${typography('caption2')};
  }
`;

const StyledRight = styled('div')`
  && {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }
`;

const StyledDialerBtnContainer = styled('div')`
  && {
    width: ${spacing(6)};
    height: ${spacing(6)};
    min-width: ${spacing(6)};
  }
`;

const StyledInputContainer = styled('div')`
  && {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
  }
`;

const colorTransition = ({ theme }: { theme: Theme }) =>
  theme.transitions.create(['color'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.standard,
  });

const SearchInput = styled(JuiTextField)<any>`
  && {
    flex-grow: 1;
    border: none;
    margin: 0 ${spacing(3)};
    transition: ${colorTransition};
    .${DIALER_CLASS_NAME} {
      ${typography('headline')};
      color: white;
      text-align: center;
      transition: ${colorTransition};
      padding: 0;

      &::placeholder {
        ${typography('subheading1')};
        line-height: ${spacing(7)};
        color: ${palette('common', 'white')};
      }
    }
    input[draggable='false'] {
      user-select: text;
    }
  }
`;

function moveCaretToPos(inputField: HTMLInputElement, pos: number) {
  if (!inputField) {
    return;
  }
  inputField.blur();

  if (isFunction((inputField as any).createTextRange)) {
    const FieldRange = ((inputField as any).createTextRange as Function)();
    FieldRange.moveStart('character', pos);
    FieldRange.collapse();
    FieldRange.select();
  } else if (inputField.selectionStart || inputField.selectionStart === 0) {
    inputField.selectionStart = pos;
    inputField.selectionEnd = pos;
  }
  inputField && inputField.focus();
}

class JuiHeader extends PureComponent<Props, State> {
  private _mouseDownTime: number;
  private _timerForClearAll: NodeJS.Timeout;
  private _inputRef: RefObject<any> = createRef();

  state = {
    showHoverActions: false,
  };
  /* eslint-disable react/sort-comp */
  private _handleMouseEvent = () => {
    const { HoverActions, showDialerInputField } = this.props;
    if (showDialerInputField) {
      return;
    }
    const { showHoverActions } = this.state;
    if (HoverActions) {
      this.setState({
        showHoverActions: !showHoverActions,
      });
    }
  };

  private _renderCallInfo() {
    const { showHoverActions } = this.state;
    const { Back, Avatar, name, phone, HoverActions } = this.props;
    return (
      <>
        <StyledLeft>
          {Back && (
            <StyledBack>
              <Back />
            </StyledBack>
          )}
          {Avatar && <Avatar />}
          <StyledInfoContainer>
            <StyledName data-test-automation-id='telephony-dialer-header-name'>
              {name}
            </StyledName>
            {phone && (
              <StyledPhone data-test-automation-id='telephony-dialer-header-phone'>
                {phone}
              </StyledPhone>
            )}
          </StyledInfoContainer>
        </StyledLeft>
        {HoverActions && showHoverActions && (
          <StyledRight>
            <HoverActions />
          </StyledRight>
        )}
      </>
    );
  }

  private _handleMouseDown = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    this._mouseDownTime = +new Date();
    this._timerForClearAll = setTimeout(() => {
      const { deleteAllInputString } = this.props;

      if (!deleteAllInputString) {
        return;
      }
      deleteAllInputString();
      this._clearTimeout();
    }, 1000);
  };
  /* eslint-disable react/no-find-dom-node */
  private _handleMounseUp = (e: MouseEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const input =
      this._inputRef.current &&
      (ReactDOM.findDOMNode(
        this._inputRef.current,
      ) as HTMLDivElement).querySelector('input');

    if (!input) {
      return;
    }
    input.focus(); // focus first

    const mouseUpTime = +new Date();
    if (this._mouseDownTime && mouseUpTime - this._mouseDownTime >= 1000) {
      return;
    }
    /**
     * if the browser support `document.execCommand('delete', false)` within input box which is not a standard operation
     * then we can handle the delete operation to the `change` event's callback
     */
    if (!document.execCommand('delete', false)) {
      if (!this.props.deleteInputString) {
        return;
      }
      // #1: has selected a range
      if (
        typeof input.selectionStart === 'number' &&
        typeof input.selectionEnd === 'number' &&
        input.selectionStart !== input.selectionEnd
      ) {
        const [min, max] = [
          input.selectionStart as number,
          input.selectionEnd as number,
        ];
        this.props.deleteInputString(min, max - 1);
        this._moveCaretToPos(input, input.selectionStart);
      } else {
        // #2: else delete the one before the caret
        const caretPos = this._doGetCaretPosition();
        const deletePos = caretPos === 0 ? 0 : caretPos - 1;
        this.props.deleteInputString(deletePos, deletePos);
        this._moveCaretToPos(input, deletePos);
      }
    }
    this._clearTimeout();
    delete this._mouseDownTime;
  };

  private _moveCaretToPos = debounce(moveCaretToPos, 17, {
    leading: false,
    trailing: true,
  });

  private _doGetCaretPosition() {
    if (!this._inputRef.current) {
      return 0;
    }
    const inputField = (ReactDOM.findDOMNode(
      this._inputRef.current,
    ) as HTMLDivElement).querySelector('input') as HTMLInputElement;
    // Initialize
    let iCaretPos = 0;

    // IE Support
    if ((document as any).selection) {
      // Set focus on the element
      inputField.focus();

      // To get cursor position, get empty selection range
      const oSel = (document as any).selection.createRange();

      // Move selection start to 0 position
      oSel.moveStart('character', -inputField.value.length);

      // The caret position is selection length
      iCaretPos = oSel.text.length;
    } else if (
      // Firefox support
      inputField.selectionStart ||
      inputField.selectionStart === 0
    ) {
      iCaretPos =
        inputField.selectionDirection === 'backward'
          ? inputField.selectionStart
          : inputField.selectionEnd || 0;
    }
    // Return results
    return iCaretPos;
  }

  private _clearTimeout = () => {
    clearTimeout(this._timerForClearAll);
    delete this._timerForClearAll;
  };

  private _handleMouseDownOnInput = (e: React.MouseEvent<any>) => {
    // prevent drag & drop
    e.stopPropagation();
  };

  private _renderDialerInput() {
    const {
      onBlur,
      onFocus,
      onChange,
      dialerValue,
      placeholder,
      ariaLabelForDelete,
      onKeyDown,
      Back,
    } = this.props;
    const fakeFunc = () => {};

    // TODO: change delete button's icon
    /* eslint-disable react/jsx-no-duplicate-props */
    return (
      <StyledInputContainer draggable={false}>
        <StyledDialerBtnContainer>
          {Back && (
            <StyledBack>
              <Back />
            </StyledBack>
          )}
        </StyledDialerBtnContainer>
        <SearchInput
          onBlur={onBlur || fakeFunc}
          onFocus={onFocus || fakeFunc}
          onChange={onChange || fakeFunc}
          placeholder={placeholder || ''}
          value={dialerValue || ''}
          onMouseDown={this._handleMouseDownOnInput}
          inputProps={{
            placeholder,
            className: DIALER_CLASS_NAME,
            maxLength: 30,
          }}
          InputProps={{
            disableUnderline: true,
          }}
          onKeyDown={onKeyDown || fakeFunc}
          autoFocus
          autoComplete='off'
          ref={this._inputRef}
        />
        <StyledDialerBtnContainer>
          {dialerValue && dialerValue.length && (
            <JuiIconButton
              variant='plain'
              color='common.white'
              disableToolTip={false}
              onMouseDown={this._handleMouseDown}
              onMouseUp={this._handleMounseUp}
              size='large'
              tooltipTitle={ariaLabelForDelete}
              ariaLabel={ariaLabelForDelete}
            >
              deletenumber
            </JuiIconButton>
          )}
        </StyledDialerBtnContainer>
      </StyledInputContainer>
    );
  }

  componentWillUnmount() {
    if (this._timerForClearAll) {
      this._clearTimeout();
    }
  }
  render() {
    const { showDialerInputField, RecentCallBtn } = this.props;

    return (
      <StyledHeader
        onMouseEnter={this._handleMouseEvent}
        onMouseLeave={this._handleMouseEvent}
        data-test-automation-id='telephony-dialer-header'
      >
        {RecentCallBtn && <RecentCallBtn />}
        {showDialerInputField
          ? this._renderDialerInput()
          : this._renderCallInfo()}
      </StyledHeader>
    );
  }
}

export { JuiHeader, StyledHeaderNoPadding };
