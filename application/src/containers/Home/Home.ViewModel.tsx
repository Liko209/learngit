/*
 * @Author: Andy Hu
 * @Date: 2018-10-11 19:12:17
 * Copyright © RingCentral. All rights reserved.
 */
import { action, observable } from 'mobx';

import { StoreViewModel } from '@/store/ViewModel';

class HomeViewModel extends StoreViewModel {
  @observable
  openCreateTeam: boolean = false;

  @action
  public toggleCreateTeam() {
    this.openCreateTeam = !this.openCreateTeam;
  }
}
export { HomeViewModel };
