import React from 'react';
import ReactDOM from 'react-dom';
import {
  JuiAnchorButtonWrapper,
  JuiAnchorButtonWrapperProps
} from 'jui/pattern/ConversationPage/AnchorButtonWrapper';

type AnchorButtonWrapperProps = JuiAnchorButtonWrapperProps;

const AnchorButtonWrapper = (props: AnchorButtonWrapperProps) => {
  const root = document.getElementById('jumpToFirstUnreadButtonRoot');
  if (!root) return null;

  return ReactDOM.createPortal(
    <JuiAnchorButtonWrapper>{props.children}</JuiAnchorButtonWrapper>,
    root
  );
};

export { AnchorButtonWrapper, AnchorButtonWrapperProps };
