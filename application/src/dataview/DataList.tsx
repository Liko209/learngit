import React, { Fragment } from 'react';
import { DataListVM, ItemModel } from './DataListVM';

type DataListProps<T extends ItemModel> = {
  vm: DataListVM<T>;
  ItemView: React.ComponentType<T>;
};

class DataList<T extends ItemModel> extends React.Component<DataListProps<T>> {
  render() {
    const { ItemView } = this.props;
    const children = this.props.vm.items.map(item => (
      <ItemView key={item.id} {...item} />
    ));
    return <Fragment>{children}</Fragment>;
  }
}

export { DataList };
