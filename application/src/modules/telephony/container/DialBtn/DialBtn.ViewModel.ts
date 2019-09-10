/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-29 16:16:10
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework/ioc';
import { TelephonyService } from '../../service';
import { TELEPHONY_SERVICE } from '../../interface/constant';
import { TelephonyStore } from '../../store';
import { StoreViewModel } from '@/store/ViewModel';
import { DialBtnProps, DialBtnViewProps } from './types';
import { analyticsCollector } from '@/AnalyticsCollector';

const ANALYTICS_SOURCE = 'dialer';

class DialBtnViewModel extends StoreViewModel<DialBtnProps>
  implements DialBtnViewProps {
  private _telephonyService: TelephonyService = container.get<TelephonyService>(
    TELEPHONY_SERVICE,
  );
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);

  makeCall = () => {
    if (!this._telephonyStore.inputString) {
      this._telephonyStore.enterFirstLetterThroughKeypadForInputString();
      return this._updateInputString(this._telephonyService.lastCalledNumber);
    }
    /**
     * TODO: move this call making & state changing logic down to SDK
     */
    this._makeCall(this._telephonyStore.inputString);
    this._trackCall(ANALYTICS_SOURCE);
  };

  // FIXME: remove this logic by exposing the phone parser from SDK to view-model layer
  private _makeCall = async (val: string) => {
    // make sure line 30 run before end()
    if (!(await this._telephonyService.directCall(val))) {
      await new Promise(resolve => {
        requestAnimationFrame(resolve);
      });
      this._telephonyService.hangUp();
    }
  };

  private _trackCall = (analysisSource: string) => {
    analyticsCollector.makeOutboundCall(analysisSource);
  };

  private _updateInputString = this._telephonyService.updateInputStringFactory(
    'inputString',
  );
}

export { DialBtnViewModel };
