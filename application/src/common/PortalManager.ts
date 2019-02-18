/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-12-26 14:22:44
 * Copyright © RingCentral. All rights reserved.
 */
import { ComponentType } from 'react';
import { EventEmitter2 } from 'eventemitter2';

type Portal = {
  component: ComponentType<any>;
  dismiss: () => void;
  props?: any;
};

type Portals = Portal[];

const EventKey = 'portalsChange';

class PortalManager extends EventEmitter2 {
  portals: Portals = [];

  register({ component, dismiss, props }: Portal) {
    const length = this.portals.push({ component, dismiss, props });
    this.emit(EventKey, this.portals);
    return length - 1;
  }

  unRegister(index: number) {
    this.portals.splice(index, 1);
    this.emit(EventKey, this.portals);
  }

  dismissAll(afterDismiss?: () => void) {
    this.portals.length = 0;
    this.emit(EventKey, this.portals);
    typeof afterDismiss === 'function' && afterDismiss();
  }

  dismissLast(afterDismiss?: () => void) {
    if (this.portals.length) {
      this.portals.pop();
      this.emit(EventKey, this.portals);
    }
    typeof afterDismiss === 'function' && afterDismiss();
  }

  wrapper(component: ComponentType<any>, container?: Element) {
    let hasShow = false;
    const wrapperComponent = {
      index: -1,
      dismiss: (afterDismiss?: () => void) => {
        hasShow = false;
        this.unRegister(wrapperComponent.index);
        typeof afterDismiss === 'function' && afterDismiss();
      },
      show: (props?: any) => {
        const dismiss = wrapperComponent.dismiss;

        if (hasShow) {
          return {
            dismiss,
          };
        }

        hasShow = true;

        const newProps = { ...props };

        if (!newProps.key) {
          newProps.key = `${Date.now()}`;
        }

        wrapperComponent.index = this.register({
          component,
          dismiss,
          props: newProps,
        });

        return {
          dismiss,
        };
      },
    };

    return {
      dismiss: wrapperComponent.dismiss,
      show: wrapperComponent.show,
    };
  }

  onChange(fn: Function) {
    this.on(EventKey, (portals: Portals) => {
      fn(portals);
    });
  }
}

export { Portals, PortalManager, EventKey };
export default new PortalManager();
