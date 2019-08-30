/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-08-27 15:39:35
 * Copyright © RingCentral. All rights reserved.
 */
import { observable } from 'mobx';

class HoverHelper {
  @observable
  hovered = false;

  private _handleMouseOver = () => {
    if (!this.hovered) {
      this.hovered = true;
    }
  };

  private _handleMouseOut = (event: React.MouseEvent) => {
    const { target, currentTarget, relatedTarget } = event;
    if (
      !currentTarget.contains(target as Node) ||
      !currentTarget.contains(relatedTarget as Node)
    ) {
      this.hovered = false;
    }
  };

  get TriggerProps() {
    return {
      onMouseEnter: this._handleMouseOver,
      onMouseOver: this._handleMouseOver,
      onMouseOut: this._handleMouseOut,
    };
  }
}

export { HoverHelper };
