/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-12-26 14:37:10
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import portalManager, { Portals } from '@/common/PortalManager';
import DialogContext from './DialogContext';

type Props = {};
type State = {
  portals: Portals;
};

class ModalPortal extends React.Component<Props, State> {
  state: State = {
    portals: new Map(),
  };

  constructor(props: Props) {
    super(props);
    portalManager.onChange((portals: Portals) => {
      this.setState({
        portals,
      });
    });
  }

  render() {
    const { portals } = this.state;
    return [...portals.values()].map(
      ({ component: Component, props, dismiss }) => {
        if (Component instanceof Function) {
          return (
            <DialogContext.Provider value={dismiss} key={props.key}>
              <Component {...props} />
            </DialogContext.Provider>
          );
        }
        return Element;
      },
    );
  }
}

export { ModalPortal };
