/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-12-26 14:22:44
 * Copyright © RingCentral. All rights reserved.
 */
import { ComponentClass, ComponentType } from 'react';
import { EventEmitter2 } from 'eventemitter2';

type ComponentTypes = ComponentClass | ComponentType<any>;
type PortalsMapValue = {
  node: HTMLElement;
  dismiss: () => void;
  props?: any;
};

type PortalsMapProps = Map<ComponentTypes, PortalsMapValue>;

const EventKey = 'portalsChange';

class PortalManager extends EventEmitter2 {
  portals: PortalsMapProps;
  constructor() {
    super();
    this.portals = new Map();
  }

  register(
    component: ComponentTypes,
    { node, dismiss, props }: PortalsMapValue,
  ) {
    this.portals.set(component, { node, dismiss, props });
    this.emit(EventKey, this.portals);
  }

  unRegister(component: ComponentTypes) {
    const value = this.portals.get(component);
    if (value) {
      const node = value.node;
      node.parentNode && node.parentNode.removeChild(node);
      this.portals.delete(component);
      this.emit(EventKey, this.portals);
    }
  }

  dismiss(afterDismiss?: () => void) {
    const portals = this.portals;
    const last = portals.size - 1;
    this.unRegister(Array.from(portals.keys())[last]);
    typeof afterDismiss === 'function' && afterDismiss();
  }

  wrapper(component: ComponentTypes) {
    const wrapperComponent = {
      dismiss: (afterDismiss?: () => void) => {
        this.unRegister(component);
        typeof afterDismiss === 'function' && afterDismiss();
      },
      show: (appendNode?: HTMLElement, props?: any) => {
        const dismiss = wrapperComponent.dismiss;

        if (this.portals.get(component)) {
          return {
            dismiss,
          };
        }

        const renderNode = document.createElement('div');

        this.register(component, {
          dismiss,
          props,
          node: renderNode,
        });
        (appendNode || document.body).appendChild(renderNode);

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
    this.on(EventKey, (portals: PortalsMapProps) => {
      fn(portals);
    });
  }
}

export { PortalsMapProps, PortalManager };
export default new PortalManager();
