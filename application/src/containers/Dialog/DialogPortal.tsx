/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-12-26 14:37:10
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { createPortal } from 'react-dom';
import portalManager, { PortalsMapProps } from '@/common/PortalManager';

type Props = {};
type State = {
  portals: PortalsMapProps;
};
// type ProviderProps = { value: () => void };
// const Xxx = React.createContext<ProviderProps>({ value: () => {} });

class DialogPortal extends React.Component<Props, State> {
  state: State = {
    portals: new Map(),
  };

  constructor(props: Props) {
    super(props);
    portalManager.onChange((portals: PortalsMapProps) => {
      this.setState({
        portals,
      });
    });
  }

  render() {
    const { portals } = this.state;
    const components = [];
    for (const [Element, value] of portals.entries()) {
      const { node, props } = value;
      if (Element instanceof Function) {
        components.push(createPortal(<Element {...props} />, node));
      } else {
        components.push(createPortal(Element, node));
      }
    }
    return components;
  }
}

export { DialogPortal };
