/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-30 09:29:02
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { observer } from 'mobx-react';
import { JuiConversationCardLinkItems } from 'jui/pattern/ConversationCardLinkItems';
import { LinkItem } from '@/store/models/Items';

type Props = {
  postItems: LinkItem[];
  onLinkItemClick: (e: React.MouseEvent<HTMLSpanElement>) => void;
};
@observer
class LinkItemView extends React.Component<Props> {
  render() {
    const { postItems, onLinkItemClick } = this.props;
    return (
      <>
        {postItems.map((item, idx) => {
          const image = item.image
            ? `${item.image}&key=4527f263d6e64d7a8251b007b1ba9972`
            : '';
          return (item.title || item.image || item.summary) &&
            !item.data.do_not_render &&
            !item.deactivated ? (
              <JuiConversationCardLinkItems
                key={idx}
                title={item.title}
                summary={item.summary}
                thumbnail={image}
                url={item.url}
                onLinkItemClose={onLinkItemClick.bind(this, item.id)}
              />
            ) : null;
        })}
      </>
    );
  }
}
export { LinkItemView };
