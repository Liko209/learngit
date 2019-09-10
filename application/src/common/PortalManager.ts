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

enum PROFILE_PORTAL_STATUS {
  IS_SHOW,
  SHOULD_CLOSE,
}

type ProfilePortalStatus =
  | PROFILE_PORTAL_STATUS.IS_SHOW
  | PROFILE_PORTAL_STATUS.SHOULD_CLOSE;

type Portals = Map<number | string, Portal>;

const EventKey = 'portalsChange';

class PortalManager extends EventEmitter2 {
  portals: Portals = new Map();
  profilePortalStatus: Set<ProfilePortalStatus> = new Set();

  addShowStatus() {
    this.profilePortalStatus.add(PROFILE_PORTAL_STATUS.IS_SHOW);
  }

  addShouldCloseStatus() {
    if (this.profilePortalIsShow) {
      this.profilePortalStatus.add(PROFILE_PORTAL_STATUS.SHOULD_CLOSE);
    }
  }

  clear() {
    this.profilePortalStatus.clear();
  }

  get profilePortalIsShow() {
    return this.profilePortalStatus.has(PROFILE_PORTAL_STATUS.IS_SHOW);
  }

  get profilePortalShouldClose() {
    return this.profilePortalStatus.has(PROFILE_PORTAL_STATUS.SHOULD_CLOSE);
  }

  register({ component, dismiss, props }: Portal) {
    this.portals.set(props.key, { component, dismiss, props });
    this.emit(EventKey, this.portals);
  }

  isOpened(key: any) {
    return this.portals.has(key);
  }

  unRegister(key: number) {
    this.portals.delete(key);
    this.emit(EventKey, this.portals);
  }

  dismissAll(afterDismiss?: () => void) {
    this.portals.forEach((portal: Portal) => {
      portal.dismiss();
    });
    typeof afterDismiss === 'function' && afterDismiss();
  }

  dismissLast(afterDismiss?: () => void) {
    const portal = Array.from(this.portals.values())[this.portals.size - 1];
    if (portal) {
      portal.dismiss();
    }
    typeof afterDismiss === 'function' && afterDismiss();
  }

  wrapper(component: ComponentType<any>) {
    let hasShow = false;
    const wrapperComponent = {
      key: -1,
      dismiss: (afterDismiss?: () => void) => {
        hasShow = false;
        this.unRegister(wrapperComponent.key);
        typeof afterDismiss === 'function' && afterDismiss();
      },
      show: (props?: any) => {
        const { dismiss } = wrapperComponent;

        if (hasShow) {
          return {
            dismiss,
          };
        }

        hasShow = true;

        const newProps = { ...props };

        if (!newProps.key) {
          newProps.key = Date.now();
        }
        wrapperComponent.key = newProps.key;
        this.register({
          component,
          dismiss,
          props: newProps,
        });

        return {
          dismiss,
        };
      },
      startLoading: () => {
        const portal = this.portals.get(wrapperComponent.key);
        if (!portal) {
          return;
        }
        const newProps = { ...portal.props };
        newProps.loading = true;
        this.register({
          component,
          dismiss: wrapperComponent.dismiss,
          props: newProps,
        });
      },
      stopLoading: () => {
        const portal = this.portals.get(wrapperComponent.key);
        if (!portal) {
          return;
        }
        const newProps = { ...portal.props };
        newProps.loading = false;
        this.register({
          component,
          dismiss: wrapperComponent.dismiss,
          props: newProps,
        });
      },
    };

    return wrapperComponent;
  }

  onChange(fn: Function) {
    this.on(EventKey, (portals: Portals) => {
      fn(portals);
    });
  }
}

export { Portals, PortalManager, EventKey };
export default new PortalManager();
