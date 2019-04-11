/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-30 09:29:02
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { observer } from 'mobx-react';
import {
  JuiConversationCardLinkItems,
  JuiConversationCardVideoLink,
} from 'jui/pattern/ConversationCardLinkItems';
import LinkItemModel from '@/store/models/LinkItem';

type Props = {
  postItems: LinkItemModel[];
  onLinkItemClose: Function;
};
@observer
class LinkItemView extends React.Component<Props> {
  onLinkItemClose = (id: number) => () => {
    const { onLinkItemClose } = this.props;
    onLinkItemClose(id);
  }

  renderLink = (item: LinkItemModel) => {
    const { url, title, image, summary, id, favicon, providerName } = item;
    let itemUrlWithProtocol;
    // In Glip must has this key
    // hard code in order to show the current image
    const imgStamp = '&key=4527f263d6e64d7a8251b007b1ba9972';

    if (url) {
      itemUrlWithProtocol = url.match('http://|https://')
        ? url
        : `http://${url}`;
    } else {
      itemUrlWithProtocol = url;
    }
    const thumbnail = image ? `${image}${imgStamp}` : '';
    return title || image || summary ? (
      <JuiConversationCardLinkItems
        key={id}
        title={title}
        summary={summary}
        thumbnail={thumbnail}
        url={itemUrlWithProtocol}
        onLinkItemClose={this.onLinkItemClose(id)}
        favicon={
          favicon
            ? `${favicon}${imgStamp}` // hard code in order to show the current image
            : ''
        }
        faviconName={providerName}
      />
    ) : null;
  }

  renderVideo = (item: LinkItemModel) => {
    if (!item.data) {
      return null;
    }
    const { id, url } = item;
    const { object, title } = item.data;
    return (
      <JuiConversationCardVideoLink
        key={id}
        title={title}
        url={url}
        html={object ? object.html : ''}
        onLinkItemClose={this.onLinkItemClose(id)}
      />
    );
  }

  render() {
    const { postItems } = this.props;
    return (
      <>
        {postItems.map((item: LinkItemModel) => {
          const { doNotRender, deactivated } = item;
          if (doNotRender || deactivated) {
            return null;
          }

          if (!item.isVideo) {
            return this.renderLink(item);
          }

          return this.renderVideo(item);
        })}
      </>
    );
  }
}
export { LinkItemView };
