/*
 * @Author: Spike.Yang
 * @Date: 2019-09-10 09:27:00
 * Copyright © RingCentral. All rights reserved.
 */
import React, {
  ComponentType,
  useRef,
  FunctionComponent,
  useEffect,
} from 'react';
import ReactDOM from 'react-dom';
import ThemeProvider from '@/containers/ThemeProvider';

// :TODO: fix input/shadow dom element fiberNode can't GC
function withOutFiberReference<T>(
  Component: ComponentType<T>,
): FunctionComponent<T> {
  return (props: T) => {
    const ref: React.RefObject<any> = useRef(null);

    useEffect(() => {
      if (ref && ref.current) {
        ReactDOM.render(
          <ThemeProvider>
            <Component {...props} />
          </ThemeProvider>,
          ref.current,
        );
      }

      return () => {
        if (ref && ref.current) ReactDOM.unmountComponentAtNode(ref!.current);
      };
    }, []);

    return <div ref={ref} />;
  };
}

export { withOutFiberReference };
