import React, { ButtonHTMLAttributes } from 'react';

type JumpToFirstUnreadButtonProps = ButtonHTMLAttributes<any> & {
  count: number;
};

const JumpToFirstUnreadButton = ({
  count,
  ...rest
}: JumpToFirstUnreadButtonProps) => {
  return <button {...rest}>{count} Unread ⬆</button>;
};

export { JumpToFirstUnreadButton, JumpToFirstUnreadButtonProps };
