import { ENTITY_NAME } from '../../../store';
import OrderListPresenter from '@/store/base/OrderListPresenter';

export type IConversationSectionPresenter = {
  fetchData:() => any;
  iconName:string;
  title:string;
  entityName:ENTITY_NAME;
  anchor:string;
} & OrderListPresenter;
