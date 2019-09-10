import React, { ComponentType, Component } from 'react';
import { BUTTON_TYPE } from 'jui/pattern/Phone/VoicemailItem';
import { ActionsProps, ActionsViewProps } from './types';
import { JuiButtonBar } from 'jui/components/Buttons';
import { PHONE_TAB } from '@/AnalyticsCollector/constants';
import { More } from './More';
import { Read } from './Read';
import { Block } from './Block';
import { Delete } from './Delete';
import { Download } from './Download';
import { ENTITY_TYPE } from '../constants';
import { Message } from './Message';
import { Call } from './Call';

class ActionsView extends Component<ActionsViewProps & ActionsProps> {
  get tabName() {
    const { entity } = this.props;
    switch (entity) {
      case ENTITY_TYPE.CALL_LOG:
        return PHONE_TAB.CALL_HISTORY;
      case ENTITY_TYPE.VOICEMAIL:
        return PHONE_TAB.VOICEMAIL;
      default:
        return;
    }
  }

  getButtons = (buttons: ComponentType<any>[], type: BUTTON_TYPE) => {
    const { id, entity, caller, person, phoneNumber } = this.props;
    /* eslint-disable react/no-array-index-key */
    return buttons.map((ButtonComponent: ComponentType<any>, index: number) => {
      return (
        <ButtonComponent
          tabName={this.tabName}
          key={`${id}-${type}-${index}`}
          phoneNumber={phoneNumber}
          entity={entity}
          caller={caller}
          person={person}
          type={type}
          id={id}
        />
      );
    });
  };

  private get _voicemailActions() {
    const { shouldShowBlock, person, isBlock, isPseudo } = this.props;

    const actionsConfig = [
      !isBlock && Call,
      person !== null && Message,
      !isPseudo && Delete,
    ].filter(item => item) as ComponentType<any>[];

    const dropdownConfig = [Read, Download, shouldShowBlock && Block].filter(
      item => item,
    ) as ComponentType<any>[];

    return this._getButtonConfig(actionsConfig, dropdownConfig);
  }

  get _callLogActions() {
    const { shouldShowBlock, person, isBlock, isPseudo } = this.props;

    const actionsConfig = [
      !isBlock && Call,
      person !== null && Message,
      !isPseudo && Delete,
      shouldShowBlock && Block,
    ].filter(item => item) as ComponentType<any>[];

    return this._getButtonConfig(actionsConfig, null);
  }

  private _getButtonConfig = (
    actionsConfig: ComponentType<any>[],
    dropdownConfig: ComponentType<any>[] | null,
  ) => {
    const { maxButtonCount } = this.props;
    if (dropdownConfig && dropdownConfig.length === 1) {
      actionsConfig.push(dropdownConfig.pop() as ComponentType<any>);
    }
    if (actionsConfig.length >= maxButtonCount) {
      const buttons = actionsConfig.slice(0, maxButtonCount);
      const moreButtons = actionsConfig.slice(
        maxButtonCount,
        actionsConfig.length,
      );
      return {
        buttons: this.getButtons(buttons, BUTTON_TYPE.ICON),
        dropdownItems: this.getButtons(
          dropdownConfig ? [...moreButtons, ...dropdownConfig] : moreButtons,
          BUTTON_TYPE.MENU_ITEM,
        ),
      };
    }
    return {
      buttons: this.getButtons(actionsConfig, BUTTON_TYPE.ICON),
      dropdownItems: dropdownConfig
        ? this.getButtons(dropdownConfig, BUTTON_TYPE.MENU_ITEM)
        : null,
    };
  };

  renderButtons = () => {
    let buttons;
    let dropdownItems;
    const { entity } = this.props;
    if (entity === ENTITY_TYPE.VOICEMAIL) {
      buttons = this._voicemailActions.buttons;
      dropdownItems = this._voicemailActions.dropdownItems;
    } else {
      buttons = this._callLogActions.buttons;
      dropdownItems = this._callLogActions.dropdownItems;
    }

    if (dropdownItems && dropdownItems.length > 0) {
      return (
        <>
          {buttons}
          {dropdownItems ? (
            <More key="more" automationId={`${entity}-more-button`}>
              {dropdownItems}
            </More>
          ) : null}
        </>
      );
    }

    return buttons;
  };

  render() {
    return <JuiButtonBar overlapSize={0}>{this.renderButtons()}</JuiButtonBar>;
  }
}

export { ActionsView };
