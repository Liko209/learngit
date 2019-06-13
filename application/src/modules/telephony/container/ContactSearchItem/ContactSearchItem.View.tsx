/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-05-30 10:34:43
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component, createRef, RefObject } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { JuiMenuItem } from 'jui/components/Menus';
import { JuiListItemText } from 'jui/components/Lists';
import { Avatar } from '@/containers/Avatar';
import { JuiIconButton } from 'jui/components/Buttons';
import { ContactSearchItemViewProps } from './types';
import { observer } from 'mobx-react';
import { ContactSearchItemContent as ItemContent } from 'jui/pattern/Dialer';

type Props = WithTranslation & ContactSearchItemViewProps;

@observer
class ContactSearchItemViewComponent extends Component<Props> {
  private _ref: RefObject<JuiMenuItem> = createRef();
  private _frameId: number;

  componentWillUnmount() {
    cancelAnimationFrame(this._frameId);
  }

  componentDidMount() {
    const { onAfterMount } = this.props;
    onAfterMount && onAfterMount();
  }

  render() {
    const {
      uid,
      onClick,
      showDialIcon,
      isExt,
      phoneNumber,
      t,
      name,
      selected = false,
    } = this.props;

    return (
      <JuiMenuItem
        selected={selected}
        avatar={
          <Avatar
            uid={uid}
            showDefaultAvatar={!uid}
            size="medium"
            data-test-automation-id="telephony-contact-search-list_item-avatar"
          />
        }
        onClick={onClick}
        ref={this._ref}
        data-test-automation-id="telephony-contact-search-list_item"
      >
        <ItemContent>
          <JuiListItemText
            primary={showDialIcon ? t('telephony.dial') : name}
            secondary={
              isExt ? `${t('telephony.Ext')}${phoneNumber}` : phoneNumber}
          />
          {showDialIcon && (
            <JuiIconButton
              variant="plain"
              color="primary.600"
              size="medium"
              onClick={onClick}
              disableToolTip={true}
              data-test-automation-id="telephony-contact-search-list_item-dial_button"
            >
              dial
            </JuiIconButton>
          )}
        </ItemContent>
      </JuiMenuItem>
    );
  }
}

export const ContactSearchItemView = withTranslation('translations')(
  ContactSearchItemViewComponent,
);
