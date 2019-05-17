/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-04-22 09:29:02
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { observer } from 'mobx-react';
import { JuiConversationPostText } from 'jui/pattern/ConversationCard';
import {
  JuiConversationCardLinkItems,
  JuiConversationCardVideoLink,
} from 'jui/pattern/ConversationCardLinkItems';
import { LinkItemModel, LinkItemViewProps } from './types';
import { accelerateURL } from '@/common/accelerateURL';
import { StreamContext } from '../../PostListPage/Stream/types';
@observer
class LinkItemView extends React.Component<LinkItemViewProps> {
  static contextType = StreamContext;
  onLinkItemClose = (id: number) => () => {
    const { onLinkItemClose } = this.props;

    onLinkItemClose(id);
  }

  formatUrlStamp = (url: string) => {
    // In Glip must has this key
    // hard code in order to show the current image
    const stamp = '&key=4527f263d6e64d7a8251b007b1ba9972';

    return accelerateURL(url && `${url}${stamp}`) || url;
  }

  formatLinkProtocol = (url: string) => {
    return (
      accelerateURL(url.match('http://|https://') ? url : `http://${url}`) ||
      url
    );
  }

  renderLinkCard = (item: LinkItemModel) => {
    const { url, title, image, summary, id, favicon, providerName } = item;

    const isUnableShow = !(title || image || summary);

    return isUnableShow ? null : (
      <JuiConversationCardLinkItems
        key={id}
        title={title}
        summary={summary}
        thumbnail={this.formatUrlStamp(image)}
        url={this.formatLinkProtocol(url)}
        onLinkItemClose={this.onLinkItemClose(id)}
        favicon={this.formatUrlStamp(favicon)}
        faviconName={providerName}
      />
    );
  }

  renderLinkText = (item: LinkItemModel) => {
    const { text: postText } = this.props.post;
    const { id, url, title } = item;

    return postText ? null : (
      <JuiConversationPostText
        key={id}
        url={this.formatLinkProtocol(url)}
        title={title}
      />
    );
  }

  renderContent = (item: LinkItemModel) => {
    const { doNotRender } = item;

    return doNotRender ? this.renderLinkText(item) : this.renderLinkCard(item);
  }

  renderVideo = (item: LinkItemModel) => {
    const { id, url, data } = item;

    if (!data || !this.context.isShow) return null;

    const { object, title } = data;

    return (
      <JuiConversationCardVideoLink
        key={id}
        title={title}
        url={url}
        html={object ? object.html : ''}
      />
    );
  }

  renderLink = (item: LinkItemModel) => {
    const { deactivated, isVideo } = item;

    if (deactivated) return null;

    return isVideo ? this.renderVideo(item) : this.renderContent(item);
  }

  render() {
    const { postItems } = this.props;

    return <>{postItems.map(this.renderLink)}</>;
  }
}
export { LinkItemView };
