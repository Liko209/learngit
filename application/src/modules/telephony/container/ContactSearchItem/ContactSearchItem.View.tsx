/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-05-30 10:34:43
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { JuiMenuItem } from 'jui/components/Menus';
import { JuiListItemText } from 'jui/components/Lists';
import { Avatar } from '@/containers/Avatar';
import { JuiIconButton } from 'jui/components/Buttons';
import { ContactSearchItemViewProps } from './types';
import { observer } from 'mobx-react';
import {
  ContactSearchItemContent as ItemContent,
  StyledSelectedItemIcon,
} from 'jui/pattern/Dialer';
import { ROW_HEIGHT } from '../ContactSearchList/constants';
import { JuiIconography } from 'jui/foundation/Iconography';

type Props = WithTranslation & ContactSearchItemViewProps;
@observer
class ContactSearchItemViewComponent extends Component<Props> {
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
      isTransferPage,
      selectedCallItemIndex,
      itemIndex,
      selected,
    } = this.props;

    return (
      <JuiMenuItem
        style={{ height: ROW_HEIGHT }}
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
        data-test-automation-id="telephony-contact-search-list_item"
      >
        <ItemContent>
          <JuiListItemText
            primary={showDialIcon ? t('telephony.dial') : name}
            secondary={
              isExt ? `${t('telephony.Ext')} ${phoneNumber}` : phoneNumber
            }
          />
          {isTransferPage && selectedCallItemIndex === itemIndex && (
            <StyledSelectedItemIcon>
              <JuiIconography iconSize="medium">
                item-list-selected
              </JuiIconography>
            </StyledSelectedItemIcon>
          )}
          {showDialIcon && (
            <JuiIconButton
              variant="plain"
              color="primary.600"
              size="medium"
              disableToolTip
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
