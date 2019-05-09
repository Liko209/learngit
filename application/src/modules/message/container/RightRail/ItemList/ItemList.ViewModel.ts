import { observable, computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { Props } from './types';
import { GroupItemListHandler } from './GroupItemListHandler';

class ItemListViewModel extends StoreViewModel<Props> {
  @observable listHandler: GroupItemListHandler;

  constructor(props: Props) {
    super(props);
    this.reaction(
      () => this._groupId,
      () => {
        if (this.listHandler) {
          this.listHandler.dispose();
        }
        this.listHandler = new GroupItemListHandler(this._groupId, this._type);
      },
      { fireImmediately: true },
    );
  }

  @computed
  private get _type() {
    return this.props.type;
  }

  @computed
  private get _groupId() {
    return this.props.groupId;
  }

  dispose() {
    super.dispose();
    return this.listHandler.dispose();
  }
}

export { ItemListViewModel };
