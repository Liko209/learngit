/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-07-02 18:56:42
 * Copyright © RingCentral. All rights reserved.
 */
import { isElementInPopup } from './utils';
import { PopupState } from './types';

const SELECT_TRIGGER_KEYS = ['ArrowUp', 'ArrowDown', 'Enter', ' '];

class PopupHelper {
  private _popupId?: string;
  private _variant: string;
  private _minWidth: number;
  private _state: PopupState;
  private _setState: React.Dispatch<React.SetStateAction<PopupState>>;

  constructor({
    minWidth = 120,
    popupId,
    variant,
    state,
    setState,
  }: {
    minWidth?: number;
    popupId?: string;
    variant: string;
    state: PopupState;
    setState: React.Dispatch<React.SetStateAction<PopupState>>;
  }) {
    this._popupId = popupId;
    this._minWidth = minWidth;
    this._variant = variant;
    this._state = state;
    this._setState = setState;
  }

  close = () => {
    if (this._state.open) {
      this._setState({
        open: false,
        hovered: false,
      });
    }
  };

  open = (event: React.SyntheticEvent<any>) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    if (!this._state.open) {
      this._setState({
        anchorEl: event.currentTarget,
        open: true,
        hovered: event.type === 'mouseenter',
      });
    }
  };

  handleMouseLeave = (event: React.MouseEvent<any>) => {
    const { hovered, anchorEl } = this._state;
    const relatedTarget = event.relatedTarget;
    if (
      hovered &&
      !isElementInPopup({
        anchorEl,
        element: relatedTarget,
        popupId: this._popupId,
      })
    ) {
      this.close();
    }
  };

  get PopoverProps() {
    const { open, anchorEl } = this._state;
    return {
      open,
      anchorEl,
      onMouseLeave: this.handleMouseLeave,
      id: this._popupId,
      onClose: this.close,
    };
  }

  get PopperProps() {
    const { open, anchorEl } = this._state;
    return {
      open,
      anchorEl,
      id: this._popupId,
    };
  }

  get MenuProps() {
    return this.PopoverProps;
  }

  get TriggerProps() {
    return {
      ...this._AccessabilityProps,
      onClick: this.open,
    };
  }

  get SelectMenuProps() {
    return {
      ...this.MenuProps,
      PaperProps: { style: { minWidth: this._minWidth } },
    };
  }

  get SelectTriggerProps() {
    return {
      ...this.TriggerProps,
      onKeyDownCapture: (event: React.KeyboardEvent) => {
        if (SELECT_TRIGGER_KEYS.includes(event.key)) {
          event.preventDefault();
          this.open(event);
        }
      },
    };
  }

  get HoverProps() {
    return {
      ...this._AccessabilityProps,
      onMouseEnter: this.open,
      onMouseMove: this.open,
      onMouseLeave: this.handleMouseLeave,
    };
  }

  private get _AccessabilityProps() {
    const { open } = this._state;
    return {
      [this._variant === 'popover' ? 'aria-owns' : 'aria-describedby']: open
        ? this._popupId
        : null,
      'aria-haspopup': this._variant === 'popover' ? true : undefined,
      tabIndex: 0,
    };
  }
}

export { PopupHelper };
