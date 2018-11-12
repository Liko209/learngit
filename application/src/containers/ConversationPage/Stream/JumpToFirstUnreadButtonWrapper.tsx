import React from 'react';
import ReactDOM from 'react-dom';
import {
  JuiJumpToFirstUnreadButtonWrapper,
  JuiJumpToFirstUnreadButtonWrapperProps,
} from 'jui/pattern/ConversationPage/JumpToFirstUnreadButtonWrapper';

type JumpToFirstUnreadButtonWrapperProps = JuiJumpToFirstUnreadButtonWrapperProps;

const JumpToFirstUnreadButtonWrapper = (
  props: JumpToFirstUnreadButtonWrapperProps,
) => {
  const root = document.getElementById('jumpToFirstUnreadButtonRoot');
  if (!root) return null;

  return ReactDOM.createPortal(
    <JuiJumpToFirstUnreadButtonWrapper>
      {props.children}
    </JuiJumpToFirstUnreadButtonWrapper>,
    root,
  );
};

export { JumpToFirstUnreadButtonWrapper, JumpToFirstUnreadButtonWrapperProps };
