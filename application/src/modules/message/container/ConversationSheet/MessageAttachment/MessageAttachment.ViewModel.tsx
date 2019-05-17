/*
 * @Author: isaac.liu
 * @Date: 2019-05-03 09:54:59
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { MessageAttachmentProps } from './types';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { InteractiveMessageItem } from 'sdk/module/item/entity';
import InteractiveMessageItemModel from '@/store/models/InteractiveMessageItem';

class MessageAttachmentViewModel extends StoreViewModel<
  MessageAttachmentProps
> {
  @computed
  get items() {
    return this.props.ids.map((id: number) =>
      getEntity<InteractiveMessageItem, InteractiveMessageItemModel>(
        ENTITY_NAME.ITEM,
        id,
      ),
    );
  }
}

export { MessageAttachmentViewModel };
