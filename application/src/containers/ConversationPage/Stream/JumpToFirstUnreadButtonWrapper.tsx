import React, { HTMLAttributes } from 'react';
import ReactDOM from 'react-dom';

type JumpToFirstUnreadButtonWrapperProps = HTMLAttributes<any>;
const JumpToFirstUnreadButtonWrapper = (
  props: JumpToFirstUnreadButtonWrapperProps,
) => {
  const root = document.getElementById('jumpToFirstUnreadButtonRoot');
  if (!root) return null;

  return ReactDOM.createPortal(
    <div
      style={{
        position: 'absolute',
        top: 12,
        left: 0,
        right: 0,
        textAlign: 'center',
      }}
    >
      {props.children}
    </div>,
    root,
  );
};

export { JumpToFirstUnreadButtonWrapper, JumpToFirstUnreadButtonWrapperProps };
