/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-05-24 07:20:20
 * Copyright © RingCentral. All rights reserved.
 */
// import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { ActionsProps } from './types';
// import { Read } from './Read';
// import { Delete } from './Delete';
// import { Download } from './Download';
// import { ENTITY_TYPE } from '../constants';

class ActionsViewModel extends StoreViewModel<ActionsProps> {
  // @computed
  // actions() {
  //   const { entity } = this.props;
  //   switch (entity) {
  //     case ENTITY_TYPE.VOICEMAIL:
  //       return [Read, Download, Delete];
  //     case ENTITY_TYPE.CALL_LOG:
  //       return [Delete];
  //     default:
  //       return [];
  //   }
  // }
}

export { ActionsViewModel };
