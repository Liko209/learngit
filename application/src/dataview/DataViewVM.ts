import { observable, computed, action } from 'mobx';

abstract class DataViewVM<T> {
  @observable
  private _data = observable.box<T>();

  @observable
  private _loading: boolean = false;

  abstract dataLoader(): Promise<T> | T;

  @computed
  get data(): T {
    return this._data.get();
  }

  @computed
  get loading() {
    return this._loading;
  }

  @action
  async loadData() {
    this._loading = true;
    const data = await this.dataLoader();
    this._data.set(data);
    this._loading = false;
  }
}

export { DataViewVM };
