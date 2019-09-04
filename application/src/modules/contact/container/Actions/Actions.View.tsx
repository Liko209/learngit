/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-27 20:15:31
 * Copyright © RingCentral. All rights reserved.
 */
import React, { ComponentType, Component } from 'react';
import { BUTTON_TYPE } from 'jui/pattern/Phone/VoicemailItem';
import { ActionsProps, ActionsViewProps } from './types';
import { JuiButtonBar } from 'jui/components/Buttons';
import { Message } from './Message';
import { Call } from './Call';

class ActionsView extends Component<ActionsViewProps & ActionsProps> {
  get _actions() {
    return [Call, Message];
  }

  getButtons = (buttons: ComponentType<any>[]) => {
    const { id, entity, phoneNumber, contactType } = this.props;
    return buttons.map((ButtonComponent: ComponentType<any>) => {
      return (
        <ButtonComponent
          key={id}
          phoneNumber={phoneNumber}
          entity={entity}
          type={BUTTON_TYPE.ICON}
          contactType={contactType}
          id={id}
        />
      );
    });
  };

  render() {
    return (
      <JuiButtonBar overlapSize={0}>
        {this.getButtons(this._actions)}
      </JuiButtonBar>
    );
  }
}

export { ActionsView };
