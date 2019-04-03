import { StoreViewModel } from '@/store/ViewModel';
import { MessageUmiProps, MessageUmiViewProps } from './types';

class MessageUmiViewModel extends StoreViewModel<MessageUmiProps>
  implements MessageUmiViewProps {}

export { MessageUmiViewModel };
