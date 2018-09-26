/// <reference path="../../../../.storybook/storybook.d.ts" />
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withState } from '@dump247/storybook-state';
import { JuiChatView } from '..';

storiesOf('Atoms/ChatBox', module)
  .addDecorator((storyFn) => {
    return <div style={{ textAlign: 'center' }}>{storyFn()}</div>;
  })
  .addWithJSX('atoms/ChatBox', withState({ list: [1, 323, 234325, 43534, 123, 34324, 23432, 234234, 2342] })(
    (({ store }) => {
      const loadMore = async (append?: boolean) => {
        const sleep = new Promise((resolve) => {
          setTimeout(() => { resolve(); }, 500);
        },
        );
        await sleep;
        if (append) {
          return store.set({ list: [Math.random(), ...store.state.list] });
        }
        store.set({ list: [...store.state.list, Math.random()] });
      };
      const returnTrue = () => true;
      const clickHandler = () => loadMore(true);
      return (
        <div>
          <div style={{ height: '500px', width: '100%', overflow: 'hidden' }}>
            <JuiChatView flipped={true} onInfiniteLoad={loadMore.bind(false)} shouldTriggerLoad={returnTrue} scrollLoadThreshold={300}>
              {store.state.list.map((id, index) => <div key={index}>{id}</div>)}
            </JuiChatView>
          </div>
          <button onClick={clickHandler}>add post</button> ;
        </div>
      );
    }),
  ),
  );
