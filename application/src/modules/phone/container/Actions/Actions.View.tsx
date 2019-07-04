import React, { ComponentType, Component } from 'react';
import { BUTTON_TYPE } from 'jui/pattern/Phone/VoicemailItem';
import { ActionsProps, ActionsViewProps } from './types';
import { JuiButtonBar } from 'jui/components/Buttons';
import { More } from './More';
import { Read } from './Read';
import { Block } from './Block';
import { Delete } from './Delete';
import { Download } from './Download';
import { ENTITY_TYPE } from '../constants';
import { Message } from './Message';
import { Call } from './Call';

class ActionsView extends Component<ActionsViewProps & ActionsProps> {
  get _actions() {
    const { entity, shouldShowBlock, person, showCall, isBlock } = this.props;

    return [
      showCall && !isBlock && Call,
      person !== null && Message,
      entity === ENTITY_TYPE.VOICEMAIL && Read,
      entity === ENTITY_TYPE.VOICEMAIL && Download,
      shouldShowBlock && Block,
      Delete,
    ].filter(item => !!item);
  }

  getButtons = (buttons: (false | ComponentType<any>)[], type: BUTTON_TYPE) => {
    const { id, hookAfterClick, entity, caller, person } = this.props;
    return buttons.map((ButtonComponent: ComponentType<any>, index: number) => {
      return (
        <ButtonComponent
          key={`${id}-${type}-${index}`}
          hookAfterClick={hookAfterClick}
          entity={entity}
          caller={caller}
          person={person}
          type={type}
          id={id}
        />
      );
    });
  }

  getButtonsConfig = () => {
    const { maxButtonCount } = this.props;

    if (maxButtonCount < this._actions.length) {
      const buttons = this._actions.slice(0, maxButtonCount);
      const dropdownItems = this._actions.slice(
        maxButtonCount,
        this._actions.length,
      );
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
    const { entity } = this.props;

    if (dropdownItems) {
      buttons.push(
        <More key="more" automationId={`${entity}-more-button`}>
          {dropdownItems}
        </More>,
      );
    }
    return buttons;
  }

  render() {
    return <JuiButtonBar overlapSize={0}>{this.renderButtons()}</JuiButtonBar>;
  }
}

export { ActionsView };
