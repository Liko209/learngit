/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-11-08 13:42:46
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { JuiConversationPage } from 'jui/pattern/ConversationPage';
import { JuiConversationPageHeader } from 'jui/pattern/ConversationPageHeader';
import { PostListPageViewProps } from './types';
import { Stream } from './Stream';
import { ConversationPageContext } from '../ConversationPage/types';
import { withTranslation } from 'react-i18next';
import { JuiSizeDetector, Size } from 'jui/components/SizeDetector';

// app top bar header & stream header
const USED_HEIGHT = 64 + 48;
@observer
class PostListPageViewComponent extends Component<PostListPageViewProps> {
  componentWillUnmount() {
    this.props.unsetCurrentPostListValue();
  }
  state = { height: 0 };
  handleSizeChanged = (size: Size) => {
    if (size.height !== this.state.height) {
      this.setState({ height: size.height - USED_HEIGHT });
    }
  }
  render() {
    const { kind, caption, ids, t, postFetcher } = this.props;
    return (
      <ConversationPageContext.Provider
        value={{ disableMoreAction: true, height: this.state.height }}
      >
        <JuiConversationPage
          data-test-automation-id="post-list-page"
          data-type={kind}
        >
          <JuiSizeDetector handleSizeChanged={this.handleSizeChanged} />
          <JuiConversationPageHeader
            data-test-automation-id="post-list-page-header"
            title={t(caption)}
          />
          {ids ? (
            <Stream postIds={ids} key={kind} postFetcher={postFetcher} />
          ) : null}
        </JuiConversationPage>
      </ConversationPageContext.Provider>
    );
  }
}

const PostListPageView = withTranslation()(PostListPageViewComponent);

export { PostListPageView };
