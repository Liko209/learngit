/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-06-03 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component, cloneElement } from 'react';
import { observer } from 'mobx-react';
import { JuiViewerBackground } from 'jui/pattern/ImageViewer';
import {
  withResponsive,
  VISUAL_MODE,
  JuiResponsiveLayout,
} from 'jui/foundation/Layout/Responsive';
import { withTranslation, WithTranslation } from 'react-i18next';
import {
  JuiDialogHeader,
  JuiDialogHeaderTitle,
  JuiDialogHeaderActions,
  JuiDialogHeaderMeta,
} from 'jui/components/Dialog/DialogHeader';
import { JuiDivider } from 'jui/components/Divider';
import { JuiIconButton } from 'jui/components/Buttons/IconButton';
import { JuiButtonBar } from 'jui/components/Buttons/ButtonBar';
import {
  JuiTransition,
  imageViewerHeaderAnimation,
} from 'jui/components/Animation';
import ReactResizeDetector from 'react-resize-detector';
import { JuiViewerSidebar, JuiViewerDocument } from 'jui/pattern/Viewer';
import ViewerContext from './ViewerContext';
import { IViewerView } from './interface';

type ViewerViewType = {
  dataModule: IViewerView;
  originElement?: HTMLElement;
};

const LeftResponsive = withResponsive(
  (props: any) => {
    return cloneElement(props.content);
  },
  {
    defaultWidth: 268,
    visualMode: VISUAL_MODE.BOTH,
    enable: {
      right: true,
    },
    priority: 1,
  },
);

const DocumentResponsive = withResponsive(
  (props: any) => {
    return cloneElement(props.content);
  },
  {
    minWidth: 400,
    priority: 2,
  },
);

@observer
class ViewerViewComponent extends Component<
  ViewerViewType & WithTranslation,
  any
> {
  constructor(props: ViewerViewType & WithTranslation) {
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
    this.props.dataModule.viewerDestroyer();
  }

  renderThumbnailBar = () => {
    const { dataModule } = this.props;
    if (dataModule.pages) {
      const items = dataModule.pages.map(page => {
        return page.cmp;
      });
      return (
        <JuiViewerSidebar
          open={true}
          items={items}
          selectedIndex={2}
          onSelectedChanged={() => {}}
        />
      );
    }
    return null;
  }

  renderDocument = () => {
    const { dataModule } = this.props;
    if (dataModule.pages) {
      const pages = dataModule.pages.map(page => {
        const { viewport } = page;
        return {
          cmp: page.cmp,
          getViewport: () => {
            return {
              height: viewport ? viewport.origHeight : 0,
              width: viewport ? viewport.origWidth : 0,
            };
          },
        };
      });
      return <JuiViewerDocument pages={pages} />;
    }
    return null;
  }

  render() {
    const { t, dataModule } = this.props;
    const { show } = this.state.contextValue;
    return (
      <ViewerContext.Provider value={this.state.contextValue}>
        <JuiViewerBackground data-test-automation-id="Viewer" show={show}>
          <JuiTransition
            appear={true}
            show={show}
            duration="standard"
            easing="sharp"
            onExited={this.onTransitionExited}
            animation={imageViewerHeaderAnimation}
          >
            <JuiDialogHeader data-test-automation-id="ViewerHeader">
              <ReactResizeDetector handleWidth={true} onResize={() => {}} />
              {dataModule.info && (
                <JuiDialogHeaderMeta>{dataModule.info}</JuiDialogHeaderMeta>
              )}
              {dataModule.title && (
                <JuiDialogHeaderTitle
                  variant="responsive"
                  data-test-automation-id={'previewerTitle'}
                >
                  {dataModule.title}
                </JuiDialogHeaderTitle>
              )}
              <JuiDialogHeaderActions>
                <JuiButtonBar overlapSize={-2}>
                  <>{dataModule.actions}</>
                  <JuiIconButton
                    onClick={this.closeViewer}
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
          <>
            <JuiResponsiveLayout>
              <LeftResponsive content={this.renderThumbnailBar()} />
              <DocumentResponsive content={this.renderDocument()} />
            </JuiResponsiveLayout>
          </>
        </JuiViewerBackground>
      </ViewerContext.Provider>
    );
  }
}

const ViewerView = withTranslation('translations')(ViewerViewComponent);

export { ViewerView };
