
import * as React from 'react';
import { CellMeasurerCache, CellMeasurer, List, ListRowProps, ListProps } from 'react-virtualized';
interface IDynamicHeightListProps extends Partial<ListProps> {
  width: number;
  list : any[];
  rowRenderer: (params: TRowRendererParams) => React.ReactNode;
  rowCount: number;
  height:number;
}
type TRowRendererParams = ListRowProps&{measure:() => void};

class DynamicHeightList extends React.PureComponent<IDynamicHeightListProps> {
  private _cache : CellMeasurerCache = new CellMeasurerCache({
    fixedWidth: true,
    minHeight: 50,
  });

  render() {
    const { list, rowRenderer, forwardedRef, height, ...restProps } = this.props;
    return (
        <List
          ref={forwardedRef}
          deferredMeasurementCache={this._cache}
          overscanRowCount={0}
          height={height}
          rowHeight={this._cache.rowHeight}
          rowRenderer={this._rowRenderer}
          {...restProps}
        />
    );
  }

  private _rowRenderer = (params:TRowRendererParams) => {
    const { index, key, parent } = params;
    const {  rowRenderer } = this.props;
    return (
      <CellMeasurer
        cache={this._cache}
        columnIndex={0}
        key={key}
        rowIndex={index}
        parent={parent}
      >
        {({ measure }) => (
          rowRenderer({ measure, ...params })
        )}
      </CellMeasurer>
    );
  }
}
const PostList = React.forwardRef((props:IDynamicHeightListProps, ref:React.RefObject<List>) => <DynamicHeightList {...props} forwardedRef={ref}/>);

export { PostList, TRowRendererParams };
