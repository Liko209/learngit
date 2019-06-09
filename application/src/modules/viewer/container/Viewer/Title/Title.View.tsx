/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-02-26 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import moment from 'moment';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { ViewerTitleViewProps } from './types';
import {
  JuiDialogHeader,
  JuiDialogHeaderTitle,
  JuiDialogHeaderActions,
  JuiDialogHeaderMeta,
  JuiDialogHeaderMetaLeft,
  JuiDialogHeaderMetaRight,
  JuiDialogHeaderSubtitle,
} from 'jui/components/Dialog/DialogHeader';
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
import { FileActionMenu } from '@/containers/common/fileAction';

@observer
class ViewerTitleViewComponent extends Component<
  WithTranslation & ViewerTitleViewProps
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
    const { name, downloadUrl, createdAt } = item;
    const { userDisplayName, id } = person;
    return (
      <ViewerContext.Consumer>
        {viewerContext => (
          <JuiTransition
            appear={true}
            show={viewerContext.show}
            duration="standard"
            easing="sharp"
            animation={imageViewerHeaderAnimation}
          >
            <div>
              <JuiDialogHeader data-test-automation-id="ViewerHeader">
                <ReactResizeDetector
                  handleWidth={true}
                  onResize={this.handleHeaderResize}
                />
                <JuiDialogHeaderMeta>
                  <JuiDialogHeaderMetaLeft>
                    <Avatar
                      uid={id}
                      data-test-automation-id={'previewerSenderAvatar'}
                    />
                  </JuiDialogHeaderMetaLeft>
                  <JuiDialogHeaderMetaRight
                    title={userDisplayName}
                    data-test-automation-id={'previewerSenderInfo'}
                    subtitle={dateFormatter.dateAndTimeWithoutWeekday(
                      moment(createdAt),
                    )}
                  />
                </JuiDialogHeaderMeta>
                <JuiDialogHeaderTitle
                  variant="responsive"
                  data-test-automation-id={'previewerTitle'}
                >
                  <span>{name}</span>
                  <JuiDialogHeaderSubtitle>
                    {' '}
                    {total > -1 && currentIndex > -1
                      ? `(${currentIndex + 1}/${total})`
                      : ''}
                  </JuiDialogHeaderSubtitle>
                </JuiDialogHeaderTitle>
                <JuiDialogHeaderActions>
                  <JuiButtonBar overlapSize={0}>
                    <Download url={downloadUrl} variant="round" />
                    <FileActionMenu
                      variant="round"
                      fileId={item.id}
                      beforeDelete={() => {
                        viewerContext.setDeleteItem(true);
                      }}
                    />
                    <JuiIconButton
                      onClick={viewerContext.closeViewer}
                      aria-label={t('common.dialog.close')}
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

const ViewerTitleView = withTranslation('translations')(
  ViewerTitleViewComponent,
);

export { ViewerTitleView };
