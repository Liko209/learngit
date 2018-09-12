import { computed } from 'mobx';
import { DataViewVM } from './DataViewVM';

type ItemModel = {
  id: number | string;
};

abstract class DataListVM<T extends ItemModel> extends DataViewVM<T[]> {
  @computed
  get items() {
    return this.data;
  }
}

export { ItemModel, DataListVM };
