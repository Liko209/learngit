import * as React from 'react';

import { AutoSizer, List } from 'react-virtualized';
import { PostList, TRowRendererParams } from './DynamicHeightList';
interface IChatBoxProps {
  rowRenderer:(params:TChatBoxRowRendererProps) => React.ReactNode;
  threshold:number;
  list:any[];
  onInfiniteLoad:(params?:any) => Promise<any>;
  shouldTriggerLoad:() => boolean;
}

type TChatBoxRowRendererProps = TRowRendererParams &{
  overFlow:boolean,
};

type TScrollInfo = { clientHeight:any, scrollHeight:any, scrollTop:any };

const randomLargeNumber = 9999999999999;

export default class ChatBox extends React.Component<IChatBoxProps>  {
  static defaultProps = {
    estimatedRowSize: 30,
    noRowsRenderer: () => null,
    onRowsRendered: () => null,
    onScroll: () => null,
    overscanRowCount: 10,
    scrollToAlignment: 'auto',
    scrollToIndex: -1,
    style: {},
    threshold: 50,
    list: [],
    shouldTriggerLoad:() => true,
  };

  public scrollTop:number =  randomLargeNumber;
  public scrollHeight: number ;
  public clientHeight :number;
  public isInfiniteLoading :boolean = false;
  public attachToBottom :boolean = true;
  public listComponent:React.RefObject<List>  = React.createRef<List>();

  public componentDidUpdate() {
    this._scrollHandler();
  }

  private _scrollHandler = () => {
    const listInstance = this.listComponent.current;
    if (!listInstance) {
      return;
    }
    if (this.attachToBottom) {
      listInstance.scrollToRow(this.props.list.length + 1);
    }
  }

  private _rowRender = ({ style, isVisible, ...rest }:TRowRendererParams) => {
    const overFlow = this.clientHeight < this.scrollHeight;
    return this.props.rowRenderer({ isVisible, overFlow, style, ...rest });
  }

  private _onScroll = (params:TScrollInfo) => {
    this._updateScrollTop(params);
    if (this.shouldTriggerLoad(params)) {
      this.isInfiniteLoading = true;
      const p = this.props.onInfiniteLoad();
      p.then(() => this.isInfiniteLoading = false);
    }
  }

  private _updateScrollTop = (params:TScrollInfo) => {
    const { clientHeight, scrollHeight, scrollTop } = params;
    if (!(scrollHeight && clientHeight)) return;
    this.scrollHeight = scrollHeight;
    this.clientHeight = clientHeight;
    this.scrollTop = scrollTop;
    if (scrollHeight >= clientHeight) {
      this.attachToBottom = scrollTop >= (scrollHeight - clientHeight) ? true : false;
    }
  }

  shouldTriggerLoad = (scrollPosition:TScrollInfo) => {
    const { scrollTop } = scrollPosition;
    const threshold = this.props.threshold;
    const passedThreshold = scrollTop <= threshold;
    return passedThreshold && !this.isInfiniteLoading && this.props.shouldTriggerLoad();
  }

  render() {
    const { list } = this.props;
    return (
      <AutoSizer>
        {
          ({ height, width }) =>
            (
            <PostList
                list={list}
                ref={this.listComponent}
                onScroll={this._onScroll}
                rowRenderer={this._rowRender}
                rowCount={list.length}
                overscanRowCount={0}
                height={height}
                width={width}
            />)}
      </AutoSizer >
    );
  }
}
export { ChatBox };
