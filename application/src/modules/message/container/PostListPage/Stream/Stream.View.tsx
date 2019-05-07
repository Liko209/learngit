/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-11-08 16:35:56
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import JuiConversationCard from 'jui/pattern/ConversationCard';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiStream } from 'jui/pattern/ConversationPage';
import { StreamViewProps, StreamProps } from './types';
import { observer } from 'mobx-react';
import { ConversationPost } from '../../ConversationPost';
import {
  JuiInfiniteList,
  ThresholdStrategy,
} from 'jui/components/VirtualizedList';
import { JuiSizeDetector, Size } from 'jui/components/SizeDetector';
import { DefaultLoadingWithDelay, DefaultLoadingMore } from 'jui/hoc';
import _ from 'lodash';

type Props = WithTranslation & StreamViewProps & StreamProps;

const MIN_DIALOG_HEIGHT = 400;
const MIN_HEIGHT_FIX = 40;
@observer
class StreamViewComponent extends Component<Props> {
  listRef: React.RefObject<HTMLElement> = React.createRef();
  private _loadMoreStrategy = new ThresholdStrategy({
    threshold: 60,
    minBatchCount: 10,
  });
  private _jumpToPostRef: React.RefObject<
    JuiConversationCard
  > = React.createRef();
  private _contentStyleGen = _.memoize(
    (height?: number) =>
      ({
        minHeight: height,
        display: 'flex',
        flexDirection: 'column',
      } as React.CSSProperties),
  );
  private _wrapperStyleGen = _.memoize(
    (height?: number) =>
      ({
        height,
      } as React.CSSProperties),
  );
  private _hasMore = (direction: string) => {
    if (direction === 'up') {
      return false;
    }
    return this.props.hasMoreDown;
  }
  state = { width: 0, height: 0 };
  handleSizeChanged = (size: Size) => {
    const { usedHeight } = this.props;
    let height = size.height - usedHeight;
    height = size.height < MIN_DIALOG_HEIGHT ? height + MIN_HEIGHT_FIX : height;
    this.setState({ height, width: size.width });
  }
  render() {
    const { ids, isShow = true } = this.props;
    // if conversation post include video and play video
    // when switch tab in global search will cache tabs
    // so we need to unmount conversation post

    const { height } = this.state;
    const defaultLoading = <DefaultLoadingWithDelay delay={100} />;
    const defaultLoadingMore = <DefaultLoadingMore />;
    return (
      <>
        <JuiSizeDetector handleSizeChanged={this.handleSizeChanged} />
        <JuiStream style={this._wrapperStyleGen(height)}>
          <JuiInfiniteList
            contentStyle={this._contentStyleGen(height)}
            height={height}
            loadMoreStrategy={this._loadMoreStrategy}
            minRowHeight={50} // extract to const
            loadInitialData={this.props.fetchInitialPosts}
            loadMore={this.props.fetchNextPagePosts}
            loadingRenderer={defaultLoading}
            hasMore={this._hasMore}
            loadingMoreRenderer={defaultLoadingMore}
            stickToLastPosition={false}
          >
            {isShow
              ? ids.map(id => (
                  <ConversationPost
                    id={id}
                    key={id}
                    cardRef={this._jumpToPostRef}
                    mode="navigation"
                  />
                ))
              : []}
          </JuiInfiniteList>
        </JuiStream>
      </>
    );
  }
}

const StreamView = withTranslation('translations')(StreamViewComponent);

export { StreamView };
