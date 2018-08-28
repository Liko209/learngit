/*
 * @Author: Andy Hu (andy.hu@ringcentral.com)
 * @Date: 2018-08-22 15:22:05
 * Copyright © RingCentral. All rights reserved.
 */
import { ENTITY_NAME } from '../../../store';
import OrderListPresenter from '@/store/base/OrderListPresenter';
import { Group } from 'sdk/models';
import GroupModel from '../../../store/models/Group';

export type IConversationSectionPresenter = {
  fetchData: () => any;
  iconName: string;
  title: string;
  entityName: ENTITY_NAME;
  entity: string;
  anchor: string;
} & OrderListPresenter<Group, GroupModel>;
