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
// import { JuiMenuList, JuiMenuItem } from 'jui/components/Menus';
// import { JuiPopoverMenu } from 'jui/pattern/PopoverMenu/PopoverMenu';
import { Avatar } from '@/containers/Avatar';
import { DialogContext } from '@/containers/Dialog';
import { JuiButtonBar } from 'jui/components/Buttons/ButtonBar';
import {
  JuiTransition,
  imageViewerHeaderAnimation,
} from 'jui/components/Animation';
import { dateFormatter } from '@/utils/date';
import ViewerContext from '../ViewerContext';
import { Download } from '@/containers/common/Download';
import ReactResizeDetector from 'react-resize-detector';

@observer
class ViewerTitleViewComponent extends Component<
  WithNamespaces & ViewerTitleViewProps
> {
  static contextType = DialogContext;

  dismiss = this.context;

  state = { show: true, smallWindow: false };

  closeDialog = () => {
    this.setState({ show: false });
  }

  handleHeaderResize = (width: number) => {
    this.setState({ smallWindow: width < 640 });
  }

  render() {
    const { item, total, currentIndex, person, t } = this.props;
    const { name, modifiedAt, downloadUrl } = item;
    const { userDisplayName, id } = person;
    return (
      <ViewerContext.Consumer>
        {viewerContext => (
          <JuiTransition
            appear={true}
            show={viewerContext.show}
            duration="standard"
            easing="openCloseDialog"
            animation={imageViewerHeaderAnimation}
          >
            <div>
              <JuiDialogHeader>
                <ReactResizeDetector
                  handleWidth={true}
                  onResize={this.handleHeaderResize}
                />
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
                    <Download url={downloadUrl} variant="round" />
                    {/* <JuiPopoverMenu
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
                        {this.state.smallWindow ? (
                          <JuiMenuItem>{t('common.download')}</JuiMenuItem>
                        ) : null}
                      </JuiMenuList>
                    </JuiPopoverMenu> */}
                    <JuiIconButton
                      onClick={viewerContext.closeViewer}
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
        )}
      </ViewerContext.Consumer>
    );
  }
}

const ViewerTitleView = translate('translations')(ViewerTitleViewComponent);

export { ViewerTitleView };
