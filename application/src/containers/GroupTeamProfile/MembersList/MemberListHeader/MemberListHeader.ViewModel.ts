
import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { MemberListHeaderProps } from './types';

class MemberListHeaderViewModel extends StoreViewModel<MemberListHeaderProps> {
  @computed
  private get _id() {
    return this.props.id;
  }
  @computed
  private get _group() {
    return getEntity(ENTITY_NAME.GROUP, this._id);
  }
  @computed
  get counts() {
    return this._group && this._group.members.length;
  }
}
export { MemberListHeaderViewModel };
