/// <reference path="../../../.storybook/storybook.d.ts" />
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { withState } from '@dump247/storybook-state';
import { JuiChatView } from '.';

storiesOf('ChatBox', module)
  .addDecorator((storyFn) => {
    return <div style={{ textAlign: 'center' }}>{storyFn()}</div>;
  })
  .addWithJSX('atoms/ChatBox',
              withState({ list:[1, 2, 3, 20, 13, 15, 15, 1231, 13, 123, 13, 32, 123, 123, 13, 13212, 3213, 123, 123, 213, 123, 213, 12,] })(
               (({ store }) => {
                 const loadMore = async  (append?:boolean) => {
                   const sleep = new Promise((resolve) => {
                     setTimeout(() => { resolve(); }, 500);
                   },
                  );
                   await sleep;
                   if (append) {
                     return store.set({  list:[Math.random(), ...store.state.list] });
                   }
                   store.set({ list:[...store.state.list, Math.random()] });
                 };
                 return (
                  <div>
                     <div style={{ height:'500px' , width:'100%', overflow:'hidden' }}>
                    <JuiChatView flipped={true} onInfiniteLoad={loadMore.bind(false)} shouldTriggerLoad={() => true} scrollLoadThreshold={300}>
                      {store.state.list.map((id, index) => <div key={index}>{id}</div>)}
                    </JuiChatView>
                  </div>
                   <button onClick={() => loadMore(true)}>add post</button> ;
                  </div>
                 );
               }),
              ),
              );
