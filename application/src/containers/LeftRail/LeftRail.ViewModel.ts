/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-02 15:46:35
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable } from 'mobx';
import { SECTION_TYPE } from './Section/types';
import { LeftRailViewProps, LeftRailProps, LeftRailFilter } from './types';
import StoreViewModel from '@/store/ViewModel';

class LeftRailViewModel extends StoreViewModel<LeftRailProps>
  implements LeftRailViewProps {
  @observable
  private _unreadOnly: boolean = false;
  @computed
  get sections(): SECTION_TYPE[] {
    return [
      SECTION_TYPE.FAVORITE,
      SECTION_TYPE.DIRECT_MESSAGE,
      SECTION_TYPE.TEAM,
    ];
  }

  @computed
  get filters(): LeftRailFilter[] {
    return [
      {
        label: 'Filter', // i18n
        value: this._unreadOnly,
        onChange: (evt: any, checked: boolean) => {
          console.log('unreadOnly changed');
          this._unreadOnly = checked;
        },
      },
    ];
  }
}

export { LeftRailViewModel };
