/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-05-29 10:00:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { createRef, ReactNode } from 'react';
import styled from '../../../foundation/styled-components';
import { palette } from '../../../foundation/utils/styles';
import { JuiViewerPage } from '../ViewerPage';
import {
  scrollIntoView,
  getVisibleElements,
  normalizeWheelEventDelta,
  watchScroll,
  isSameScale,
} from '../ui_utils';

const DEFAULT_SCALE_DELTA = 1.1;
const MAX_SCALE = 10.0;
const MIN_SCALE = 0.1;
const PAGE_PADDING = 32;

const ViewerDocumentWrap = styled('div')`
  && {
    background-color: ${palette('grey', '100')};
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    overflow: auto;
    outline: 0;

    &::-webkit-scrollbar {
      width: 0 !important;
    }
  }
`;

type ScaleType = number | string;
type pageContainersItemsType = {
  div: HTMLDivElement;
  id: number;
};
type ViewportType = {
  width: number;
  height: number;
};
type PagesType = {
  cmp: ReactNode;
  loading?: ReactNode;
  getViewport?: () => ViewportType;
};

type VisiblePageType = {
  view: pageContainersItemsType;
  percent: number;
  id: string | number;
  x: number;
  y: number;
};
type VisiblePagesType = {
  first: VisiblePageType;
  last: VisiblePageType;
  views: VisiblePageType[];
};

type LocationType = {
  pageNumber: number;
  scale: number;
  top: number;
  left: number;
};

type WatchScrollStateType = {
  right: boolean;
  down: boolean;
  lastX: number;
  lastY: number;
  _eventHandler: () => void;
};

type ScrollPageIntoViewDestType = {
  left: number;
  top: number;
};
type ScrollPageIntoViewParamType = {
  pageNumber: number;
  dest: ScrollPageIntoViewDestType | null;
};

type Props = {
  pages: PagesType[];
  pageIndex?: number;
  resizeAble?: boolean;
  scale?: ScaleType;
  pageFit?: boolean;
  onScaleChange?: (scale: ScaleType) => void;
  onCurrentPageIdxChanged?: (idx: number) => void;
};
type States = {
  numberPages: number;
  currentScale: number;
  currentPageIndex: number;
};

class JuiViewerDocument extends React.Component<Props, States> {
  container = createRef<HTMLDivElement>();

  pageContainers: pageContainersItemsType[] = [];
  pageCmpContainers: JuiViewerPage[] = [];

  private _location: LocationType;
  private _emitPageIdx: number = 0;
  private _scrollState: WatchScrollStateType;

  state: States = {
    numberPages: 0,
    currentScale: 1,
    currentPageIndex: 0,
  };

  componentWillUnmount() {
    const containerEl = this.container.current;
    if (containerEl && this._scrollState) {
      const { _eventHandler } = this._scrollState;
      window.removeEventListener('scroll', _eventHandler);
    }
  }

  componentDidMount() {
    const { pageIndex, pages, pageFit = true } = this.props;
    const containerEl = this.container.current;
    if (containerEl) {
      containerEl.addEventListener('wheel', this.handleContainerWheel, {
        passive: false,
      });
      this._scrollState = watchScroll(
        containerEl,
        this._scrollUpdate.bind(this),
      );
    }
    if (pageIndex !== undefined) {
      this.setState({
        currentPageIndex: pageIndex,
      });
    }
    if (pages !== undefined) {
      this.setState({
        numberPages: pages.length,
      });
    }

    this._update();

    if (pageFit) {
      setTimeout(() => {
        this._setScale('page-fit');
      },         1000);
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const { pageIndex, scale } = nextProps;
    const { currentScale, currentPageIndex } = this.state;
    if (
      pageIndex !== undefined &&
      this.props.pageIndex !== pageIndex &&
      currentPageIndex !== pageIndex
    ) {
      this._updateViewingByIndex(pageIndex);
    }
    if (
      scale !== undefined &&
      this.props.scale !== scale &&
      currentScale !== scale
    ) {
      setTimeout(() => {
        this._setScale(scale);
      },         0);
    }
  }

  private _updateViewingByIndex(toIdx: number) {
    if (toIdx < 0 || toIdx > this.state.numberPages - 1) {
      return;
    }
    this.setState(
      {
        currentPageIndex: toIdx,
      },
      () => {
        this._resetCurrentPageView(toIdx);

        const { onCurrentPageIdxChanged } = this.props;
        onCurrentPageIdxChanged && onCurrentPageIdxChanged(toIdx);
      },
    );
  }

  private _resetCurrentPageView = (pageNumber: number) => {
    const currentPageContainer = this.pageContainers[pageNumber];
    const pageDiv = currentPageContainer.div;

    if (pageDiv) {
      scrollIntoView(pageDiv);
    }
  }

  private _setScale(toScale: ScaleType) {
    const scale = toScale;
    if (typeof scale === 'number' && scale > 0) {
      this._setScaleToUpdatePage(scale, false);
    } else {
      const pageFit = this.props.pageFit;
      if (pageFit) {
        const pageNumber = this.state.currentPageIndex;
        const currentPageCmpContainer = this.pageCmpContainers[pageNumber];
        const viewport = currentPageCmpContainer.currentViewport;
        const currentScale = this.state.currentScale;
        const containerEl = this.container.current;

        let scale: ScaleType = currentScale;

        let width = 0;
        let height = 0;
        let pageWidthScale = 1;
        let pageHeightScale = 1;

        if (viewport) {
          width = viewport.width;
          height = viewport.height;
        }
        if (containerEl) {
          const hPadding = PAGE_PADDING;
          const vPadding = PAGE_PADDING;

          pageWidthScale =
            ((containerEl.clientWidth - hPadding) / width) * currentScale;
          pageHeightScale =
            ((containerEl.clientHeight - vPadding) / height) * currentScale;
        }

        scale = Math.min(pageWidthScale, pageHeightScale);
        this._setScaleToUpdatePage(scale, false);
      }
    }
  }

  private _setScaleToUpdatePage = (newScale: number, noScroll = false) => {
    const { currentScale } = this.state;

    if (isSameScale(currentScale, newScale)) {
      return;
    }

    this.setState({
      currentScale: newScale,
    });

    // fix location
    if (!noScroll) {
      const { currentPageIndex } = this.state;
      let destValue: ScrollPageIntoViewDestType | null = null;
      let pageNumber = currentPageIndex;
      if (this._location) {
        const { left, top, pageNumber: pageIdx } = this._location;
        pageNumber = pageIdx;
        destValue = {
          left,
          top,
        };
      }

      this._scrollPageIntoView({
        pageNumber,
        dest: destValue,
      });
    }

    this._update();

    const { onScaleChange } = this.props;
    onScaleChange && onScaleChange(newScale);
  }

  private _scrollPageIntoView = ({
    pageNumber,
    dest = null,
  }: ScrollPageIntoViewParamType) => {
    const currentPageContainer = this.pageContainers[pageNumber];
    const pageDiv = currentPageContainer.div;

    const currentPageCmpContainer = this.pageCmpContainers[pageNumber];
    const viewport = currentPageCmpContainer.currentViewport;
    const viewPort = currentPageCmpContainer.getViewport();

    if (pageDiv) {
      if (!dest) {
        this._updateViewingByIndex(pageNumber);
        return;
      }
      let x = 0;
      let y = 0;
      const width = 0;
      const height = 0;
      let pageHeight = 0;

      if (viewport) {
        pageHeight = viewport.height / this.state.currentScale;
      }

      if (dest) {
        const { left, top } = dest;
        x = left;
        y = top;

        x = x !== null ? x : 0;
        y = y !== null ? y : pageHeight;
      }

      const boundingRect = [
        viewPort.convertToViewportPoint(x, y),
        viewPort.convertToViewportPoint(x + width, y + height),
      ];
      const left = Math.min(boundingRect[0][0], boundingRect[1][0]);
      const top = Math.min(boundingRect[0][1], boundingRect[1][1]);

      scrollIntoView(pageDiv, {
        left,
        top,
      });
    }
  }

  private _zoomOut = (ticks: number) => {
    let newScale = this.state.currentScale;
    let _ticks = ticks;
    do {
      newScale = Number((newScale / DEFAULT_SCALE_DELTA).toFixed(2));
      newScale = Math.floor(newScale * 10) / 10;
      newScale = Math.max(MIN_SCALE, newScale);
    } while (--_ticks > 0 && newScale > MIN_SCALE);
    this._setScale(newScale);
  }
  private _zoomIn = (ticks: number) => {
    let newScale = this.state.currentScale;
    let _ticks = ticks;
    do {
      newScale = Number((newScale * DEFAULT_SCALE_DELTA).toFixed(2));
      newScale = Math.ceil(newScale * 10) / 10;
      newScale = Math.min(MAX_SCALE, newScale);
    } while (--_ticks > 0 && newScale < MAX_SCALE);
    this._setScale(newScale);
  }

  handleContainerWheel = (event: WheelEvent) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();

      const delta = normalizeWheelEventDelta(event);

      const previousScale = this.state.currentScale;

      const MOUSE_WHEEL_DELTA_PER_PAGE_SCALE = 3.0;
      const ticks = delta * MOUSE_WHEEL_DELTA_PER_PAGE_SCALE;

      if (ticks < 0) {
        this._zoomOut(ticks);
      } else {
        this._zoomIn(ticks);
      }

      const currentScale = this.state.currentScale;
      const containerEl = this.container.current;
      if (previousScale !== currentScale && containerEl) {
        const scaleCorrectionFactor = currentScale / previousScale - 1;
        const rect = containerEl.getBoundingClientRect();
        const dx = event.clientX - rect.left;
        const dy = event.clientY - rect.top;
        containerEl.scrollLeft += dx * scaleCorrectionFactor;
        containerEl.scrollTop += dy * scaleCorrectionFactor;
      }
    }
  }

  private _scrollUpdate = () => {
    if (this.state.numberPages === 0) {
      return;
    }

    this._updateCurrentPage();
    this._update();
  }

  private _updateCurrentPage = () => {
    const visiblePages = this._getVisiblePages();
    if (visiblePages) {
      this._updateCurrentPageIndex(visiblePages);
      this._emitCurrentPageIdxChanged(visiblePages);
    }
  }

  private _updateCurrentPageIndex = (visiblePages: VisiblePagesType) => {
    const { first } = visiblePages;
    const firstPageIdx = Number(first.id);
    if (this.state.currentPageIndex === firstPageIdx) {
      return;
    }

    this.setState({
      currentPageIndex: firstPageIdx,
    });
  }

  private _emitCurrentPageIdxChanged = (visiblePages: VisiblePagesType) => {
    const { first, last, views } = visiblePages;
    const viewLength = views.length;

    let emitIdx = this._emitPageIdx;
    const { onCurrentPageIdxChanged } = this.props;

    if (emitIdx < first.id || emitIdx > last.id) {
      emitIdx = Number(first.id);
    } else {
      if (viewLength > 2) {
        if (emitIdx < first.id || emitIdx > last.id) {
          emitIdx = Number(first.id);
        }
      } else if (viewLength === 2) {
        const secondView = views[1];
        if (secondView.percent > first.percent) {
          emitIdx = Number(secondView.id);
        } else {
          emitIdx = Number(first.id);
        }
      }
    }
    this._emitPageIdx = emitIdx;

    onCurrentPageIdxChanged && onCurrentPageIdxChanged(emitIdx);
  }

  private _getVisiblePages = (): VisiblePagesType | null => {
    if (this.container.current) {
      const pageContainers = this.pageCmpContainers.map((pageCmp, idx) => {
        return {
          div: pageCmp.container.current as HTMLDivElement,
          id: idx,
        };
      });
      this.pageContainers = pageContainers;

      return getVisibleElements(this.container.current, pageContainers);
    }
    return null;
  }

  private _update = () => {
    const visiblePages = this._getVisiblePages();

    if (visiblePages) {
      if (visiblePages.views.length === 0) {
        return;
      }

      const { first } = visiblePages;
      first && this._updateLocation(first);
    }
  }

  private _updateLocation = (firstPage: VisiblePageType) => {
    const pageNumber = firstPage.id;
    const { currentScale, currentPageIndex } = this.state;
    const containerEl = this.container.current;
    if (containerEl) {
      const currentPageCmpContainer = this.pageCmpContainers[currentPageIndex];
      const topLeft = currentPageCmpContainer.getPagePoint(
        containerEl.scrollLeft - firstPage.x,
        containerEl.scrollTop - firstPage.y,
      );
      const intLeft = Math.round(topLeft[0]);
      const intTop = Math.round(topLeft[1]);

      this._location = {
        pageNumber: Number(pageNumber),
        scale: currentScale,
        top: intTop,
        left: intLeft,
      };
    }
  }

  renderPages = () => {
    const { pages } = this.props;
    const { currentScale } = this.state;
    if (pages) {
      return pages.map((pageItem, idx) => {
        const { cmp, getViewport, loading } = pageItem;
        const page = (
          <JuiViewerPage
            key={idx}
            pageNumber={idx}
            scale={currentScale}
            getViewport={getViewport}
            loading={loading}
            ref={(ref: JuiViewerPage) => {
              this.pageCmpContainers[idx] = ref;
            }}
          >
            {cmp}
          </JuiViewerPage>
        );
        return page;
      });
    }
    return null;
  }

  render() {
    return (
      <ViewerDocumentWrap
        className="ViewerDocument"
        ref={this.container as any}
      >
        <div className="ViewerDocumentContent">{this.renderPages()}</div>
      </ViewerDocumentWrap>
    );
  }
}

export { JuiViewerDocument, Props as JuiViewerDocumentProps };
