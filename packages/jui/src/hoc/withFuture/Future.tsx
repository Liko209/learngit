/*
 * @Author: isaac.liu
 * @Date: 2019-02-22 13:09:13
 * Copyright © RingCentral. All rights reserved.
 */
import React, {
  ComponentType,
  ComponentClass,
  ReactNode,
  PureComponent,
} from 'react';

type ReadyToShowCallback = () => void;
type FutureCreator = (callback: ReadyToShowCallback) => ReactNode;

type FutureProps = {
  future?: FutureCreator;
};

type State = {
  futureReady: boolean;
};

function withFuture<P>(
  Current: ComponentType<P>,
): ComponentClass<FutureProps | P> {
  return class Comp extends PureComponent<P & FutureProps, State> {
    state = { futureReady: false };
    private _showFuture = () => {
      this.setState({ futureReady: true });
    }
    render() {
      const { future, ...rest } = this.props;
      if (future) {
        const { futureReady } = this.state;
        const futureElement = future(this._showFuture);
        return futureReady ? (
          futureElement
        ) : (
          <>
            {<Current {...rest as P} />}
            <div style={{ display: 'none' }}>{futureElement}</div>
          </>
        );
      }
      return <Current {...rest as P} />;
    }
  };
}

export { withFuture, FutureCreator };
