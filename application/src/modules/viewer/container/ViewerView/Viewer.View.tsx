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
import { JuiZoomButtonGroup } from 'jui/pattern/DragZoom';
import { JuiDivider } from 'jui/components/Divider';
import { JuiIconButton } from 'jui/components/Buttons/IconButton';
import { JuiButtonBar } from 'jui/components/Buttons/ButtonBar';
import {
  JuiTransition,
  imageViewerHeaderAnimation,
} from 'jui/components/Animation';
import {
  JuiViewerSidebar,
  JuiViewerDocument,
  isSameScale,
} from 'jui/pattern/Viewer';
import ViewerContext, { ViewerContextType } from './ViewerContext';
import { IViewerView } from './interface';
import _ from 'lodash';

const MAX_SCALE = 10.0;
const MIN_SCALE = 0.1;
const SCALE_UNIT = 0.1;
const LEFT_WIDTH = 268;

type updateParamsType = {
  scale?: number;
  pageIdx?: number;
};

type ViewerViewType = {
  dataModule: IViewerView;
  originElement?: HTMLElement;
};

const LeftResponsive = withResponsive(
  (props: any) => {
    return cloneElement(props.content);
  },
  {
    minWidth: LEFT_WIDTH,
    maxWidth: LEFT_WIDTH,
    defaultWidth: LEFT_WIDTH,
    visualMode: VISUAL_MODE.AUTOMATIC,
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

type State = {
  contextValue: ViewerContextType;
  initialScale: number;
};

@observer
class ViewerViewComponent extends Component<
  ViewerViewType & WithTranslation,
  State
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
      initialScale: 0,
    };
  }

  _handlerKeydown = (event: KeyboardEvent) => {
    // 107 Num Key  +
    // 109 Num Key  -
    // 173 Min Key  hyphen/underscor Hey
    // 61 Plus key  +/= key
    if (
      event.ctrlKey &&
      (event.which === 61 ||
        event.which === 107 ||
        event.which === 173 ||
        event.which === 109 ||
        event.which === 187 ||
        event.which === 189)
    ) {
      event.preventDefault();
    }
  }

  _handlerScroll = (event: MouseEvent) => {
    if (event.ctrlKey) {
      event.preventDefault();
    }
  }

  componentDidMount() {
    window.addEventListener('keydown', this._handlerKeydown, {
      passive: false,
    });
    ['DOMMouseScroll', 'mousewheel'].forEach((v: string) => {
      window.addEventListener(v, this._handlerScroll, {
        passive: false,
      });
    });
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this._handlerKeydown);
    ['DOMMouseScroll', 'mousewheel'].forEach((v: string) => {
      window.removeEventListener(v, this._handlerScroll);
    });
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

  private _handleZoomOut = () => {
    const { dataModule } = this.props;
    const { currentScale } = dataModule;
    this._setScale(currentScale - 1 * SCALE_UNIT);
  }

  private _handleZoomIn = () => {
    const { dataModule } = this.props;
    const { currentScale } = dataModule;
    this._setScale(currentScale + 1 * SCALE_UNIT);
  }

  private _handleScaleChanged = (newScale: number) => {
    this._setScale(newScale);
    const { initialScale } = this.state;
    if (initialScale === 0) {
      this.setState({
        initialScale: newScale,
      });
    }
  }

  private _setScale = _.debounce((newScale: number) => {
    const { dataModule } = this.props;
    const { currentScale } = dataModule;
    if (
      isSameScale(currentScale, newScale) ||
      newScale < MIN_SCALE ||
      newScale > MAX_SCALE
    ) {
      return;
    }
    this._update({
      scale: newScale,
    });
  },                             100);

  private _handlePageIdxChanged = _.debounce((toIdx: number) => {
    const { dataModule } = this.props;
    const { currentPageIdx } = dataModule;
    if (currentPageIdx === toIdx) {
      return;
    }
    this._update({
      pageIdx: toIdx,
    });
  },                                         100);

  private _update = ({ scale, pageIdx }: updateParamsType) => {
    const { dataModule } = this.props;
    const { onUpdate } = dataModule;
    onUpdate &&
      onUpdate({
        scale,
        pageIdx,
      });
  }

  private _handleReset = () => {
    this._update({
      scale: this.state.initialScale,
    });
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
          selectedIndex={dataModule.currentPageIdx}
          onSelectedChanged={this._handlePageIdxChanged}
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
      return (
        <JuiViewerDocument
          pages={pages}
          scale={dataModule.currentScale}
          pageIndex={dataModule.currentPageIdx}
          pageFit={true}
          scrollBarPadding={LEFT_WIDTH}
          onScaleChange={this._handleScaleChanged}
          onCurrentPageIdxChanged={this._handlePageIdxChanged}
        />
      );
    }
    return null;
  }

  private _getScaleDisplayString = () => {
    const { dataModule } = this.props;
    const { currentScale } = dataModule;
    const scaleStr = parseInt(`${currentScale * 100}`, 10);
    return `${scaleStr}%`;
  }

  render() {
    const { t, dataModule } = this.props;
    const { currentScale } = dataModule;
    const { show } = this.state.contextValue;
    const { initialScale } = this.state;
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
            <JuiZoomButtonGroup
              className="zoomGroup"
              resetMode={true}
              centerText={this._getScaleDisplayString()}
              ZoomOut={
                <JuiIconButton
                  variant="plain"
                  tooltipTitle={t('viewer.ZoomOut')}
                  ariaLabel={t('viewer.ZoomOut')}
                  disabled={currentScale === MIN_SCALE}
                  onClick={() => this._handleZoomOut()}
                >
                  zoom_out
                </JuiIconButton>
              }
              ZoomIn={
                <JuiIconButton
                  variant="plain"
                  tooltipTitle={t('viewer.ZoomIn')}
                  ariaLabel={t('viewer.ZoomIn')}
                  disabled={currentScale === MAX_SCALE}
                  onClick={() => this._handleZoomIn()}
                >
                  zoom_in
                </JuiIconButton>
              }
              ZoomReset={
                <JuiIconButton
                  variant="plain"
                  tooltipTitle={t('viewer.ZoomReset')}
                  ariaLabel={t('viewer.ZoomReset')}
                  disabled={currentScale === initialScale}
                  onClick={() => this._handleReset()}
                >
                  reset_zoom
                </JuiIconButton>
              }
            />
          </>
        </JuiViewerBackground>
      </ViewerContext.Provider>
    );
  }
}

const ViewerView = withTranslation('translations')(ViewerViewComponent);

export { ViewerView };
