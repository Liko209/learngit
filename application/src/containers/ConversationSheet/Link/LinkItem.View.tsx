/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-30 09:29:02
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { observer } from 'mobx-react';
import { JuiConversationCardLinkItems } from 'jui/pattern/ConversationCardLinkItems';
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
  render() {
    const { postItems } = this.props;
    return (
      <>
        {postItems.map((item: LinkItemModel) => {
          // In Glip must has this key
          // hard code in order to show the current image
          const itemUrlWithProtocol = item.url && item.url.indexOf('http') > -1 ? item.url : `http://${item.url}`;
          const image = item.image
            ? `${item.image}&key=4527f263d6e64d7a8251b007b1ba9972`
            : '';
          return (item.title || item.image || item.summary) &&
            !item.doNotRender &&
            !item.deactivated ? (
            <JuiConversationCardLinkItems
              key={item.id}
              title={item.title}
              summary={item.summary}
              thumbnail={image}
              url={itemUrlWithProtocol}
              onLinkItemClose={this.onLinkItemClose(item.id)}
              favicon={
                item.favicon
                  ? `${item.favicon}&key=4527f263d6e64d7a8251b007b1ba9972` // hard code in order to show the current image
                  : ''
              }
              faviconName={item.providerName}
            />
          ) : null;
        })}
      </>
    );
  }
}
export { LinkItemView };
