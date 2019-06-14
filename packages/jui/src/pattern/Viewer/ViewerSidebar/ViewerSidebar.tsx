/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-05-29 10:00:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo, ReactNode, createRef } from 'react';
import styled from 'src/foundation/styled-components';
import { palette, spacing } from '../../../foundation/utils/styles';
import MuiDrawer, { DrawerProps } from '@material-ui/core/Drawer/index';
import { JuiViewerThumbnail, ThumbnailInfoType } from '../ViewerThumbnail';
import { getVisibleElements, scrollIntoViewWithContainer } from '../ui_utils';
import { duration } from '@material-ui/core/styles/transitions';

type VisibleThumbnailType = {
  view: ThumbnailContainerItemsType;
  percent: number;
  id: string | number;
  x: number;
  y: number;
};
type VisibleThumbsType = {
  first: VisibleThumbnailType;
  last: VisibleThumbnailType;
  views: VisibleThumbnailType[];
};

type Props = {
  open: boolean;
  items: ReactNode[];
  selectedIndex?: number;
  onSelectedChanged?: (idx: number) => void;
};

type States = {
  currentSelectedIndex: number;
  numberThumbnails: number;
};

type ViewerSidebarProps = {
  expand: boolean;
} & DrawerProps;

type ThumbnailContainerItemsType = {
  div: HTMLDivElement;
  id: number;
};

const CustomSidebar: React.SFC<ViewerSidebarProps> = memo(
  ({ expand, ...props }) => {
    return <MuiDrawer {...props} />;
  },
);

const MaxWidth = 268;
const MinWidth = 0;
const ViewerSidebarWrap = styled(CustomSidebar)`
  && {
    height: 100%;
    width: ${props => (props.open ? MaxWidth : MinWidth)}px;

    & .paper {
      position: relative;
      height: 100%;
      max-width: ${MaxWidth}px;
      background-color: ${props => props.theme.palette.background.paper};
      width: ${props => (props.open ? MaxWidth : MinWidth)}px;
      box-sizing: border-box;
    }
    &::-webkit-scrollbar {
      width: 0 !important;
    }
  }
`;

const ViewerSidebarContentWrap = styled.div`
  && {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    padding: ${spacing(5, 0)};
  }
`;

class JuiViewerSidebar extends React.PureComponent<Props, States> {
  container = createRef<HTMLDivElement>();

  thumbnailContainers: ThumbnailContainerItemsType[] = [];

  state: States = {
    currentSelectedIndex: 0,
    numberThumbnails: 0,
  };

  componentDidMount() {
    const { selectedIndex, items } = this.props;
    if (selectedIndex !== undefined) {
      this.setState({
        currentSelectedIndex: selectedIndex,
      });
    }
    if (items) {
      this.setState({
        numberThumbnails: items.length,
      });
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    if (
      nextProps.selectedIndex !== undefined &&
      this.props.selectedIndex !== nextProps.selectedIndex &&
      this.state.currentSelectedIndex !== nextProps.selectedIndex
    ) {
      this._updateSelectedByIndex(nextProps.selectedIndex);
    }
    if (nextProps.open !== undefined && nextProps.open) {
      const enterTime = duration.enteringScreen;
      setTimeout(() => {
        this._scrollThumbnailIntoView();
      },         enterTime);
    }
  }

  private _updateSelectedByIndex(toIdx: number) {
    if (toIdx >= 0 && toIdx <= this.state.numberThumbnails - 1) {
      const { onSelectedChanged } = this.props;
      this.setState(
        {
          currentSelectedIndex: toIdx,
        },
        () => {
          this._scrollThumbnailIntoView();
          onSelectedChanged && onSelectedChanged(toIdx);
        },
      );
    }
  }

  private _scrollThumbnailIntoView() {
    const visibleThumbs: VisibleThumbsType | null = this._getVisibleThumbs();

    if (visibleThumbs && visibleThumbs.views.length > 0) {
      const { first, last, views } = visibleThumbs;
      const { currentSelectedIndex } = this.state;
      let shouldScroll = false;
      if (currentSelectedIndex <= first.id || currentSelectedIndex >= last.id) {
        shouldScroll = true;
      } else {
        views.some((view: VisibleThumbnailType) => {
          if (view.id !== currentSelectedIndex) {
            return false;
          }
          shouldScroll = view.percent < 100;
          return true;
        });
      }

      if (shouldScroll) {
        const currentSelectedDiv = this.thumbnailContainers[
          currentSelectedIndex
        ];
        scrollIntoViewWithContainer(
          currentSelectedDiv,
          this.container.current as HTMLDivElement,
          -20,
        );
      }
    }
  }

  private _getVisibleThumbs() {
    if (this.container.current) {
      const visibleThumbs: VisibleThumbsType = getVisibleElements(
        this.container.current,
        this.thumbnailContainers,
      );
      return visibleThumbs;
    }
    return null;
  }

  handleItemSelected = (e: any, info: ThumbnailInfoType) => {
    const { thumbnailNumber } = info;
    const { currentSelectedIndex } = this.state;
    if (currentSelectedIndex !== thumbnailNumber) {
      this._updateSelectedByIndex(thumbnailNumber);
    }
  }

  renderThumbnail = () => {
    const { items } = this.props;
    const { currentSelectedIndex } = this.state;
    if (items) {
      return items.map((item, idx) => {
        const selected = idx === currentSelectedIndex;
        const thumbnail = (
          <JuiViewerThumbnail
            thumbnailNumber={idx}
            key={idx}
            selected={selected}
            onSelected={this.handleItemSelected}
          >
            <div
              ref={ref => {
                if (ref) {
                  this.thumbnailContainers[idx] = {
                    div: ref,
                    id: idx,
                  };
                }
              }}
            >
              {item}
            </div>
          </JuiViewerThumbnail>
        );
        return thumbnail;
      });
    }
    return null;
  }

  render() {
    const { open } = this.props;
    const transitionDuration = {
      enter: duration.enteringScreen,
      exit: duration.enteringScreen,
    };
    return (
      <ViewerSidebarWrap
        variant="persistent"
        expand={open}
        open={open}
        classes={{ paper: 'paper' }}
        transitionDuration={transitionDuration}
      >
        <ViewerSidebarContentWrap ref={this.container as any}>
          {this.renderThumbnail()}
        </ViewerSidebarContentWrap>
      </ViewerSidebarWrap>
    );
  }
}

export { JuiViewerSidebar };
