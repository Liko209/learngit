import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import SectionGroupHandler from '@/store/handler/SectionGroupHandler';
import { MessageUmiProps, MessageUmiViewProps } from './types';

class MessageUmiViewModel extends StoreViewModel<MessageUmiProps>
  implements MessageUmiViewProps {
  @computed
  get groupIds() {
    return SectionGroupHandler.getInstance().groupIds;
  }
}

export { MessageUmiViewModel };
