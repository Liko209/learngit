import React, { ComponentType, Component } from 'react';
import {
  JuiButtonBar,
} from 'jui/components/Buttons';
import {
  BUTTON_TYPE,
  VoicemailActionsProps,
  VoicemailActionsViewProps,
} from './types';
import { More } from './More';
import { Read } from './Read';
import { Delete } from './Delete';
import { Download } from './Download';

const VOICEMAIL_ACTIONS = [
  Read,
  Download,
  Delete,
];

const MAX_BUTTON_COUNT = 0;

class VoicemailActionsView extends Component<VoicemailActionsViewProps & VoicemailActionsProps> {
  getButtons = (
    buttons: ComponentType<any>[],
    type: BUTTON_TYPE,
  ) => {
    const { id, hookAfterClick } = this.props;
    return buttons.map((ButtonComponent: ComponentType<any>, index: number) => {
      return (
        <ButtonComponent
          key={`${id}-${type}-${index}`}
          hookAfterClick={hookAfterClick}
          type={type}
          id={id}
        />
      );
    });
  }

  getButtonsConfig = () => {
    if (MAX_BUTTON_COUNT < VOICEMAIL_ACTIONS.length) {
      const buttons = VOICEMAIL_ACTIONS.slice(0, MAX_BUTTON_COUNT);
      const dropdownItems = VOICEMAIL_ACTIONS.slice(MAX_BUTTON_COUNT, VOICEMAIL_ACTIONS.length);
      return {
        buttons: this.getButtons(buttons, BUTTON_TYPE.ICON),
        dropdownItems: this.getButtons(dropdownItems, BUTTON_TYPE.MENU_ITEM),
      };
    }

    return {
      buttons: this.getButtons(VOICEMAIL_ACTIONS, BUTTON_TYPE.ICON),
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
