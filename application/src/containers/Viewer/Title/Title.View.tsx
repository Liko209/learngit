/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-02-26 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import moment from 'moment';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { ViewerTitleViewProps } from './types';
import {
  JuiDialogHeader,
  JuiDialogHeaderTitle,
  JuiDialogHeaderActions,
  JuiDialogHeaderMeta,
  JuiDialogHeaderMetaLeft,
  JuiDialogHeaderMetaRight,
} from 'jui/components/Dialog/DialogHeader/index';
import { JuiDivider } from 'jui/components/Divider';
import { JuiIconButton } from 'jui/components/Buttons/IconButton';
import { JuiMenuList, JuiMenuItem } from 'jui/components/Menus';
import { JuiPopoverMenu } from 'jui/pattern/PopoverMenu/PopoverMenu';
import { Avatar } from '@/containers/Avatar';
import { DialogContext } from '@/containers/Dialog';
import { JuiButtonBar } from 'jui/components/Buttons/ButtonBar';
import {
  JuiTransition,
  imageViewerHeaderAnimation,
} from 'jui/components/Animation';
import { dateFormatter } from '@/utils/date';

@observer
class ViewerTitleViewComponent extends Component<
  WithNamespaces & ViewerTitleViewProps
> {
  static contextType = DialogContext;

  dismiss = this.context;

  state = { show: true };

  closeDialog = () => {
    this.setState({ show: false });
  }

  render() {
    const { item, total, currentIndex, person, t } = this.props;
    const { name, modifiedAt } = item;
    const { userDisplayName, id } = person;
    return (
      <JuiTransition
        appear={true}
        show={this.state.show}
        duration="standard"
        easing="openCloseDialog"
        onExited={this.dismiss}
        animation={imageViewerHeaderAnimation}
      >
        <div>
          <JuiDialogHeader>
            <JuiDialogHeaderMeta>
              <JuiDialogHeaderMetaLeft>
                <Avatar uid={id} />
              </JuiDialogHeaderMetaLeft>
              <JuiDialogHeaderMetaRight
                title={userDisplayName}
                subtitle={dateFormatter.dateAndTimeWithoutWeekday(
                  moment(modifiedAt),
                )}
              />
            </JuiDialogHeaderMeta>
            <JuiDialogHeaderTitle variant="responsive">
              <span>{name}</span>
              <span> {`(${currentIndex + 1}/${total})`}</span>
            </JuiDialogHeaderTitle>
            <JuiDialogHeaderActions>
              <JuiButtonBar overlapSize={2.5}>
                <JuiIconButton tooltipTitle={t('common.download')}>
                  download
                </JuiIconButton>
                <JuiPopoverMenu
                  Anchor={() => (
                    <JuiIconButton tooltipTitle={t('common.more')}>
                      more_horiz
                    </JuiIconButton>
                  )}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                  }}
                >
                  <JuiMenuList>
                    <JuiMenuItem>{t('common.pin')}</JuiMenuItem>
                    <JuiMenuItem>{t('message.action.bookmark')}</JuiMenuItem>
                  </JuiMenuList>
                </JuiPopoverMenu>
                <JuiIconButton
                  onClick={this.closeDialog}
                  tooltipTitle={t('common.dialog.close')}
                >
                  close
                </JuiIconButton>
              </JuiButtonBar>
            </JuiDialogHeaderActions>
          </JuiDialogHeader>
          <JuiDivider key="divider-filters" />
        </div>
      </JuiTransition>
    );
  }
}

const ViewerTitleView = translate('translations')(ViewerTitleViewComponent);

export { ViewerTitleView };
