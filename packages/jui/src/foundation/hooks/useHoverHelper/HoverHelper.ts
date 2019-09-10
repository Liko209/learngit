/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-08-27 15:39:35
 * Copyright © RingCentral. All rights reserved.
 */
type SetHovered = (hovered: boolean) => void;
type Params = {
  hovered: boolean;
  setHovered: SetHovered;
};

class HoverHelper {
  hovered: boolean;
  private _setHovered: SetHovered;

  constructor({ hovered, setHovered }: Params) {
    this.hovered = hovered;
    this._setHovered = setHovered;
  }

  setHovered(hovered: boolean) {
    this.hovered = hovered;
  }

  private _handleMouseOver = (event: React.MouseEvent) => {
    const { target, currentTarget, relatedTarget } = event;
    if (
      !this.hovered &&
      (currentTarget.contains(target as Node) ||
        currentTarget.contains(relatedTarget as Node))
    ) {
      this._setHovered(true);
    }
  };

  private _handleMouseOut = (event: React.MouseEvent) => {
    const { target, currentTarget, relatedTarget } = event;
    if (
      this.hovered &&
      !currentTarget.contains(target as Node) &&
      !currentTarget.contains(relatedTarget as Node)
    ) {
      this._setHovered(false);
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
