/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-11-08 13:42:46
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer, Observer } from 'mobx-react';
import { JuiConversationPage } from 'jui/pattern/ConversationPage';
import { JuiConversationPageHeader } from 'jui/pattern/ConversationPageHeader';
import { PostListPageViewProps } from './types';
import { Stream } from './Stream';
import { ConversationPageContext } from '../ConversationPage/types';
import { withTranslation } from 'react-i18next';
import { JuiSizeMeasurer } from 'jui/components/SizeMeasurer';

// stream header
const USED_HEIGHT = 49;
@observer
class PostListPageViewComponent extends Component<PostListPageViewProps> {
  componentWillUnmount() {
    this.props.unsetCurrentPostListValue();
  }

  render() {
    const { kind, caption, ids, t, postFetcher } = this.props;
    return (
      <JuiSizeMeasurer>
        {({ ref, height }) => (
          <Observer>
            {() => (
              <ConversationPageContext.Provider
                value={{
                  height: height ? height - USED_HEIGHT : height,
                  disableMoreAction: true,
                }}
              >
                <JuiConversationPage
                  data-test-automation-id="post-list-page"
                  data-type={kind}
                  ref={ref}
                >
                  <JuiConversationPageHeader
                    data-test-automation-id="post-list-page-header"
                    title={t(caption)}
                  />
                  {ids ? (
                    <Stream
                      type={kind}
                      postIds={ids}
                      key={kind}
                      postFetcher={postFetcher}
                    />
                  ) : null}
                </JuiConversationPage>
              </ConversationPageContext.Provider>
            )}
          </Observer>
        )}
      </JuiSizeMeasurer>
    );
  }
}

const PostListPageView = withTranslation()(PostListPageViewComponent);

export { PostListPageView };
