/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-11-08 16:35:56
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { JuiConversationCard } from 'jui/pattern/ConversationCard';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiStream } from 'jui/pattern/ConversationPage';
import { StreamViewProps, StreamProps, StreamContext } from './types';
import { observer } from 'mobx-react';
import { ConversationPost } from '../../ConversationPost';
import { ConversationPageContext } from '../../ConversationPage/types';
import {
  JuiInfiniteList,
  ThresholdStrategy,
} from 'jui/components/VirtualizedList';
import {
  DefaultLoadingWithDelay,
  DefaultLoadingMore,
} from 'jui/hoc/withLoading';
import _ from 'lodash';
import { POST_LIST_TYPE } from '../types';
import { JuiEmptyPage } from 'jui/pattern/EmptyPage';
import noMentionImage from '../images/empty-@mention.svg';
import noBookmarkImage from '../images/empty-bookmark.svg';
import moize from 'moize';
import { ErrorPage } from '@/modules/common/container/ErrorPage';
import { DIRECTION } from 'jui/components/Lists';

type Props = WithTranslation & StreamViewProps & StreamProps;

const POST_PRELOAD_COUNT = 20;
const POST_PRELOAD_DIRECTION = DIRECTION.UP;
const emptyPageData = {
  [POST_LIST_TYPE.mentions]: {
    translationKey: 'message.noMentionPosts',
    emptyImage: noMentionImage,
  },
  [POST_LIST_TYPE.bookmarks]: {
    translationKey: 'message.noBookmarkPosts',
    emptyImage: noBookmarkImage,
  },
};
@observer
class StreamViewComponent extends Component<Props> {
  static contextType = ConversationPageContext;
  listRef: React.RefObject<HTMLElement> = React.createRef();
  private _loadMoreStrategy = new ThresholdStrategy(
    {
      threshold: 60,
      minBatchCount: 10,
    },
    { direction: POST_PRELOAD_DIRECTION, count: POST_PRELOAD_COUNT },
  );
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
  };

  private _defaultLoading() {
    return <DefaultLoadingWithDelay delay={100} />;
  }

  private _defaultLoadingMore() {
    return <DefaultLoadingMore />;
  }

  private _getEmptyPage = moize((type, height) => {
    if (!type) {
      return undefined;
    }
    const { translationKey, emptyImage } = emptyPageData[type];
    const { t } = this.props;
    return (
      <JuiEmptyPage
        data-test-automation-id={`${type}EmptyPage`}
        image={emptyImage}
        message={t(translationKey)}
        height={height}
      />
    );
  });

  private _getErrorPage = moize(height => (
    <ErrorPage onReload={this.props.tryAgain} height={height} />
  ));

  render() {
    const { ids, isShow = true, shouldShowErrorPage, type } = this.props;
    // if conversation post include video and play video
    // when switch tab in global search will cache tabs
    // so we need to unmount conversation post

    const { height } = this.context;

    return type && shouldShowErrorPage ? (
      this._getErrorPage(height)
    ) : (
      <StreamContext.Provider value={{ isShow }}>
        <JuiStream style={this._wrapperStyleGen(height)}>
          <JuiInfiniteList
            contentStyle={this._contentStyleGen(height)}
            height={height}
            loadMoreStrategy={this._loadMoreStrategy}
            minRowHeight={50} // extract to const
            loadInitialData={this.props.fetchInitialPosts}
            loadMore={this.props.fetchNextPagePosts}
            loadingRenderer={this._defaultLoading}
            noRowsRenderer={this._getEmptyPage(type, height)}
            hasMore={this._hasMore}
            loadingMoreRenderer={this._defaultLoadingMore}
            stickToLastPosition={false}
          >
            {ids.map(id => (
              <ConversationPost
                id={id}
                key={id}
                cardRef={this._jumpToPostRef}
                mode="navigation"
              />
            ))}
          </JuiInfiniteList>
        </JuiStream>
      </StreamContext.Provider>
    );
  }
}

const StreamView = withTranslation('translations')(StreamViewComponent);

export { StreamView };
