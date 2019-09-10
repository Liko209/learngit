/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-04-22 09:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { JuiConversationPostText } from 'jui/pattern/ConversationCard';
import { JuiConversationCardLinkItems } from 'jui/pattern/ConversationCardLinkItems';
import { LinkItemModel, LinkItemViewProps } from './types';
import { accelerateURL } from '@/common/accelerateURL';
import { StreamContext } from '../../PostListPage/Stream/types';
import { postParser, SearchHighlightContext } from '@/common/postParser';

@observer
class LinkItemView extends React.Component<LinkItemViewProps> {
  static contextType = StreamContext;
  onLinkItemClose = (id: number) => () => {
    const { onLinkItemClose } = this.props;

    onLinkItemClose(id);
  };

  formatUrlStamp = (url: string) => {
    // In Glip must has this key
    // hard code in order to show the current image
    const stamp = '&key=4527f263d6e64d7a8251b007b1ba9972';

    return accelerateURL(url && `${url}${stamp}`) || url;
  };

  formatLinkProtocol = (url: string) => {
    return (
      accelerateURL(url.match('http://|https://') ? url : `http://${url}`) ||
      url
    );
  };

  renderLinkCard = (item: LinkItemModel) => {
    const { url, title, image, summary, id, favicon, providerName } = item;
    const { canClosePreview } = this.props;
    const isUnableShow = !(title || image || summary);

    return isUnableShow ? null : (
      <SearchHighlightContext.Consumer key={id}>
        {({ keyword }) => (
          <JuiConversationCardLinkItems
            key={id}
            title={postParser(title, { keyword })}
            summary={postParser(summary, { keyword })}
            thumbnail={this.formatUrlStamp(image)}
            url={this.formatLinkProtocol(url)}
            onLinkItemClose={this.onLinkItemClose(id)}
            isShowCloseBtn={canClosePreview}
            favicon={this.formatUrlStamp(favicon)}
            faviconName={providerName}
          />
        )}
      </SearchHighlightContext.Consumer>
    );
  };

  renderLinkText = (item: LinkItemModel) => {
    const { text: postText } = this.props.post;
    const { id, url, title } = item;

    return postText ? null : (
      <SearchHighlightContext.Consumer key={id}>
        {({ keyword }) => (
          <JuiConversationPostText key={id}>
            {postParser(`[${title}](${this.formatLinkProtocol(url)})`, {
              keyword,
              html: true,
            })}
          </JuiConversationPostText>
        )}
      </SearchHighlightContext.Consumer>
    );
  };

  renderContent = (item: LinkItemModel) => {
    const { doNotRender } = item;
    return doNotRender ? this.renderLinkText(item) : this.renderLinkCard(item);
  };

  renderVideo = (item: LinkItemModel) => {
    const { id, url, data, doNotRender } = item;
    const { canClosePreview } = this.props;
    if (!data || !this.context.isShow) return null;

    const { object, title } = data;
    return doNotRender ? (
      this.renderLinkText(item)
    ) : (
      <SearchHighlightContext.Consumer key={id}>
        {({ keyword }) => (
          <JuiConversationCardLinkItems
            key={id}
            onLinkItemClose={this.onLinkItemClose(id)}
            title={postParser(title, { keyword })}
            isShowCloseBtn={canClosePreview}
            url={url}
            html={object ? object.html : ''}
          />
        )}
      </SearchHighlightContext.Consumer>
    );
  };

  renderLink = (item: LinkItemModel) => {
    const { deactivated, isVideo } = item;

    if (deactivated) return null;

    return isVideo ? this.renderVideo(item) : this.renderContent(item);
  };

  render() {
    const { postItems, isLinkPreviewDisabled } = this.props;
    if (isLinkPreviewDisabled) {
      return null;
    }
    return <>{postItems.map(this.renderLink)}</>;
  }
}
export { LinkItemView };
