/// <reference path="../../../../.storybook/storybook.d.ts" />
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withState } from '@dump247/storybook-state';
import { ChatBox } from '..';
import { alignCenterDecorator, withInfoDecorator } from '../../../utils/decorators';

storiesOf('Atoms/ChatBox', module)
  .addDecorator(alignCenterDecorator)
  .addDecorator(withInfoDecorator(ChatBox))
  .addWithJSX('reverseList',
              withState({
                list: [1, 2, 3,],
              })(
      (({ store }) => {
        const rowRenderer = ({ measure, index, style }) => {
          return (<div onLoad={measure} style={style}>{store.state.list[index]}-Row{index}-{Math.random().toString(36).substring(index + 1)}</div>);
        };
        const loadMore = async () => {
          store.set({ list: [...store.state.list, Math.random()] });
        };
        return (
          <div>
            <div style={{ height: '600px', width: '100%', overflow: 'hidden' }}>
              <ChatBox rowRenderer={rowRenderer} {...store.state} onInfiniteLoad={loadMore} />
            </div>
            <button onClick={loadMore}>add post</button> ;
                  </div>
        );
      }),
    ),
  );
