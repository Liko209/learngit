declare module 'react-chatview' {
  import React from 'react';
  interface IProps{
    flipped:boolean;
    scrollLoadThreshold:number;
    onInfiniteLoad: ()=>Promise<any>;
    shouldTriggerLoad: ()=>boolean;
    returnScrollable?:(el:any)=>void;
  }
  const  ChatView: React.SFC<IProps>;
  export default ChatView;
}
