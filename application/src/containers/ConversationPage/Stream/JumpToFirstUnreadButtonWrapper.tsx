import React, { HTMLAttributes } from 'react';

type JumpToFirstUnreadButtonWrapperProps = HTMLAttributes<any>;
const JumpToFirstUnreadButtonWrapper = (
  props: JumpToFirstUnreadButtonWrapperProps,
) => {
  return (
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
    </div>
  );
};

export { JumpToFirstUnreadButtonWrapper, JumpToFirstUnreadButtonWrapperProps };
