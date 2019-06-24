import React, { ComponentType, Component } from 'react';
import {
  JuiButtonBar,
} from 'jui/components/Buttons';
import {
  BUTTON_TYPE,
  VoicemailActionsProps,
  VoicemailActionsViewProps,
} from './types';
import { More } from '../Actions/More';
import { Read } from '../Actions/Read';
import { Delete } from '../Actions/Delete';
import { Download } from '../Actions/Download';
import { ENTITY_TYPE } from '../constants';

const MAX_BUTTON_COUNT = 0;

class VoicemailActionsView extends Component<VoicemailActionsViewProps & VoicemailActionsProps> {
  get _actions() {
    return [
      Read,
      Download,
      Delete,
    ];
  }

  getButtons = (
    buttons: ComponentType<any>[],
    type: BUTTON_TYPE,
  ) => {
    const { id, hookAfterClick } = this.props;
    return buttons.map((ButtonComponent: ComponentType<any>, index: number) => {
      return (
        <ButtonComponent
          key={`${id}-${type}-${index}`}
          entity={ENTITY_TYPE.VOICEMAIL}
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

export { VoicemailActionsView };
