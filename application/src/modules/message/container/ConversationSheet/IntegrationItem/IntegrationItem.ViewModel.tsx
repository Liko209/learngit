/*
 * @Author: isaac.liu
 * @Date: 2019-05-03 09:54:59
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { IntegrationItemProps } from './types';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
// import GlipTypeUtil from 'sdk/utils/glip-type-dictionary/util';
import { IntegrationItem } from 'sdk/module/item/entity';
import IntegrationItemModel from '@/store/models/IntegrationItem';

class IntegrationItemViewModel extends StoreViewModel<IntegrationItemProps> {
  @computed
  get items() {
    return this.props.ids.map((id: number) =>
      getEntity<IntegrationItem, IntegrationItemModel>(ENTITY_NAME.ITEM, id),
    );
  }
}

export { IntegrationItemViewModel };
