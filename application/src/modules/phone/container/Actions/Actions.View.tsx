import React, { ComponentType, Component } from 'react';
import {
  JuiButtonBar,
} from 'jui/components/Buttons';
import {
  BUTTON_TYPE,
  ActionsProps,
  ActionsViewProps,
} from './types';
import { More } from './More';
import { Read } from './Read';
import { Delete } from './Delete';
import { Download } from './Download';
import { ENTITY_TYPE } from '../constants';

const MAX_BUTTON_COUNT = 3;

class ActionsView extends Component<ActionsViewProps & ActionsProps> {
  get _actions() {
    const { entity } = this.props;
    return [
      entity === ENTITY_TYPE.VOICEMAIL && Read,
      entity === ENTITY_TYPE.VOICEMAIL && Download,
      Delete,
    ].filter(item => !!item);
  }

  getButtons = (
    buttons: (false | ComponentType<any>)[],
    type: BUTTON_TYPE,
  ) => {
    const { id, hookAfterClick, entity } = this.props;
    return buttons.map((ButtonComponent: ComponentType<any>, index: number) => {
      return (
        <ButtonComponent
          key={`${id}-${type}-${index}`}
          entity={entity}
          hookAfterClick={hookAfterClick}
          type={type}
          id={id}
        />
      );
    });
  }

  getButtonsConfig = () => {
    if (MAX_BUTTON_COUNT < this._actions.length) {
      const buttons = this._actions.slice(0, MAX_BUTTON_COUNT);
      const dropdownItems = this._actions.slice(MAX_BUTTON_COUNT, this._actions.length);
      return {
        buttons: this.getButtons(buttons, BUTTON_TYPE.ICON),
        dropdownItems: this.getButtons(dropdownItems, BUTTON_TYPE.MENU_ITEM),
      };
    }

    return {
      buttons: this.getButtons(this._actions, BUTTON_TYPE.ICON),
      dropdownItems: null,
    };
  }

  renderButtons = () => {
    const { buttons, dropdownItems } = this.getButtonsConfig();
    if (dropdownItems) {
      buttons.push(<More key="more">{dropdownItems}</More>);
    }
    return buttons;
  }

  render() {
    return (
      <JuiButtonBar overlapSize={0}>
        {this.renderButtons()}
      </JuiButtonBar>
    );
  }
}

export { ActionsView };
