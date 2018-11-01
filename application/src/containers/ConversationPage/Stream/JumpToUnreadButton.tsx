import React, { ButtonHTMLAttributes } from 'react';
import ReactDOM from 'react-dom';

type JumpToFirstUnreadButtonProps = ButtonHTMLAttributes<any> & {
  count: number;
};

const JumpToFirstUnreadButton = ({
  count,
  ...rest
}: JumpToFirstUnreadButtonProps) => {
  const jumpToFirstUnreadButtonRoot = document.getElementById(
    'jumpToFirstUnreadButtonRoot',
  );

  if (!jumpToFirstUnreadButtonRoot) return null;

  return ReactDOM.createPortal(
    <button {...rest}>{count} Unread ⬆</button>,
    jumpToFirstUnreadButtonRoot,
  );
};

export { JumpToFirstUnreadButton, JumpToFirstUnreadButtonProps };
