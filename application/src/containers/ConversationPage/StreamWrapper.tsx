import React from 'react';

type StreamWrapperProps = {
  children?: React.ReactNode;
};

const StreamWrapper = (props: StreamWrapperProps) => {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {props.children}
    </div>
  );
};

export { StreamWrapper, StreamWrapperProps };
