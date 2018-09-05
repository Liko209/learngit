/// <reference path="../../../.storybook/storybook.d.ts" />
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { withState } from '@dump247/storybook-state';
import { ChatBox } from '.';

storiesOf('ChatBox', module)
  .addDecorator((storyFn) => {
    return <div style={{ textAlign: 'center' }}>{storyFn()}</div>;
  })
  .addWithJSX('reverseList',
              withState({ list:[1, 2, 3, 20, 13, 15, 15, 1231, 13, 123, 13, 32, 123, 123, 13, 13212, 3213, 123, 123, 213, 123, 213, 12, ] })(
               (({ store }) => {
                 const rowRenderer = ({ measure, index, style  }) => {
                   return (<div onLoad={measure} style={style}>{store.state.list[index]}-Row{index}-{Math.random().toString(36).substring(index + 1)}</div>);
                 };
                 const loadMore = async  () => {
                   store.set({ list:[...store.state.list, Math.random()] });
                 };
                 return (
                  <div>
                     <div style={{ height:'600px' , width:'100%', overflow:'hidden' }}>
                    <ChatBox rowRenderer={rowRenderer} {...store.state} onInfiniteLoad={loadMore}/>
                  </div>
                   <button onClick={() => loadMore({}, true)}>add post</button> ;
                  </div>
                 );
               }),
              ),
              );
