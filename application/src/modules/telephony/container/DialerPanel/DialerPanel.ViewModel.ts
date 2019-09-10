import { StoreViewModel } from '@/store/ViewModel';
import { DialerPanelProps, DialerPanelViewProps } from './types';
import { container } from 'framework/ioc';
import { TelephonyService } from '../../service';
import { TELEPHONY_SERVICE } from '../../interface/constant';
import { TelephonyStore } from '../../store';
import { computed, action } from 'mobx';

export class DialerPanelViewModel extends StoreViewModel<DialerPanelProps>
  implements DialerPanelViewProps {
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);
  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );
  @action
  makeCall = async (val: string) => {
    // make sure `this._telephonyStore.dialerCall()` run before `this._telephonyStore.end()`
    if (!(await this._telephonyService.directCall(val))) {
      await new Promise(resolve => {
        requestAnimationFrame(resolve);
      });
      this._telephonyStore.end();
    }
  };

  @action
  backToDialerFromTransferPage = () =>
    this._telephonyStore.backToDialerFromTransferPage();

  onAfterDialerOpen = () => this._telephonyService.onAfterDialerOpen();

  @computed
  get displayCallerIdSelector() {
    return (
      Array.isArray(this._telephonyStore.callerPhoneNumberList) &&
      !!this._telephonyStore.callerPhoneNumberList.length &&
      !this.isTransferPage
    );
  }

  @computed
  get isTransferPage() {
    return this._telephonyStore.isTransferPage;
  }
}
