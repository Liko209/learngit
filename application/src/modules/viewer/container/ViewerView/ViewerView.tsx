/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-06-03 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { JuiViewerBackground } from 'jui/pattern/ImageViewer';
import { withTranslation, WithTranslation } from 'react-i18next';
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
import { Avatar } from '@/containers/Avatar';
import { JuiButtonBar } from 'jui/components/Buttons/ButtonBar';
import {
  JuiTransition,
  imageViewerHeaderAnimation,
} from 'jui/components/Animation';
import { Download } from '@/containers/common/Download';
import ReactResizeDetector from 'react-resize-detector';
import ViewerContext from './ViewerContext';
import { IViewerView } from './interface';

@observer
class ViewerViewComponent extends Component<
  IViewerView & WithTranslation,
  any
> {
  constructor(props: IViewerView & WithTranslation) {
    super(props);
    this.state = {
      contextValue: {
        show: true,
        closeViewer: this.closeViewer,
        onTransitionExited: this.onTransitionExited,
        onTransitionEntered: this.onTransitionEntered,
        isAnimating: true,
      },
    };
  }

  closeViewer = () => {
    this.setState({
      contextValue: {
        ...this.state.contextValue,
        show: false,
        isAnimating: true,
      },
    });
  }

  onTransitionEntered = () => {
    this.setState({
      contextValue: { ...this.state.contextValue, isAnimating: false },
    });
  }

  onTransitionExited = () => {
    this.props.viewerDestroyer();
  }

  render() {
    const { t } = this.props;
    const { show } = this.state.contextValue;
    return (
      <ViewerContext.Provider value={this.state.contextValue}>
        <JuiViewerBackground data-test-automation-id="Viewer" show={show}>
          <JuiTransition
            appear={true}
            show={show}
            duration="standard"
            easing="sharp"
            animation={imageViewerHeaderAnimation}
          >
            <JuiDialogHeader data-test-automation-id="ViewerHeader">
              <ReactResizeDetector handleWidth={true} onResize={() => {}} />
              <JuiDialogHeaderMeta>
                <JuiDialogHeaderMetaLeft>
                  <Avatar
                    uid={1}
                    data-test-automation-id={'previewerSenderAvatar'}
                  />
                </JuiDialogHeaderMetaLeft>
                <JuiDialogHeaderMetaRight
                  title={'1'}
                  data-test-automation-id={'previewerSenderInfo'}
                  subtitle={'2'}
                />
              </JuiDialogHeaderMeta>
              <JuiDialogHeaderTitle
                variant="responsive"
                data-test-automation-id={'previewerTitle'}
              >
                <span>{name}</span>
                <JuiDialogHeaderSubtitle> 1</JuiDialogHeaderSubtitle>
              </JuiDialogHeaderTitle>
              <JuiDialogHeaderActions>
                <JuiButtonBar overlapSize={2.5}>
                  <Download url={''} variant="round" />
                  <JuiIconButton
                    onClick={() => {
                      this.closeViewer();
                      this.onTransitionExited();
                    }}
                    aria-label={t('common.dialog.close')}
                    tooltipTitle={t('common.dialog.close')}
                  >
                    close
                  </JuiIconButton>
                </JuiButtonBar>
              </JuiDialogHeaderActions>
            </JuiDialogHeader>
            <JuiDivider key="divider-filters" />
          </JuiTransition>
        </JuiViewerBackground>
      </ViewerContext.Provider>
    );
  }
}

const ViewerView = withTranslation('translations')(ViewerViewComponent);

export { ViewerView };
