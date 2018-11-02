// Type definitions for react-visibility-sensor 3.11
// Project: https://github.com/joshwnj/react-visibility-sensor#readme
// Definitions by: Rasmus Bergström <https://github.com/JRasmusBm>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.8

declare module 'react-visibility-sensor' {
  import * as React from 'react';

  interface Shape {
    top?: number;
    left?: number;
    bottom?: number;
    right?: number;
  }

  interface Props {
    onChange: (isVisible: boolean, visibilityRect?: Shape) => void;
    active?: boolean;
    partialVisibility?: boolean;
    offset?: Shape;
    minTopValue?: number;
    intervalCheck?: boolean;
    intervalDelay?: number;
    scrollCheck?: boolean;
    scrollDelay?: number;
    scrollThrottle?: number;
    resizeCheck?: boolean;
    resizeDelay?: number;
    resizeThrottle?: number;
    delayedCall?: boolean;
    children?:
      | React.ReactNode // react-visibility-sensor v5.0 supports React.ReactNode as children
      | ((
          args: { isVisible: boolean; visibilityRect?: Shape },
        ) => React.ReactNode);
  }

  const ReactVisibilitySensor: React.StatelessComponent<Props>;

  export = ReactVisibilitySensor;
}
