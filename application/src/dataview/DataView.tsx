import React from 'react';
import { observer } from 'mobx-react';
import { withLoading } from 'ui-components';
import { DataViewVM } from './DataViewVM';

type DataViewProps<T> = {
  vm: DataViewVM<T>;
  View: React.ComponentType<T>;
};

@observer
class DataView<T> extends React.Component<DataViewProps<T>> {
  async componentDidMount() {
    await this.props.vm.loadData();
  }

  render() {
    const { View } = this.props;
    const ViewWithLoading = withLoading(View);
    return <View {...this.props.vm.data} />;
  }
}

export { DataView };
