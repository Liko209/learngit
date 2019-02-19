import ConfigChangeNotifier from './configChangeNotifier';
import { IFlag, BETA_FEATURE } from './interface';
import IFlagCalculator from './FlagCalculator';
import { strictDiff } from './utils';
import dataDispatcher from '../DataDispatcher';
import { SOCKET } from '../../service';
import { daoManager } from '../../dao';
import { RcInfoDao, RC_EXTENSION_INFO } from '../../module/rcInfo/dao';
import {
  RcExtensionInfo,
  RcServiceFeature,
} from '../../api/ringcentral/types/RcExtensionInfo';
import { RcInfoApi } from '../../api/ringcentral/RcInfo';

type IBETA_FLAG_SOURCE = 'Client_Config' | 'RC_PERMISSION' | 'Split.io_Flag';
class FeatureFlag {
  private _flags: IFlag;
  constructor(
    private _notifier: ConfigChangeNotifier,
    private _calculator: IFlagCalculator,
  ) {
    this._notifier = _notifier;
    this._calculator = _calculator;
    dataDispatcher.register(SOCKET.CLIENT_CONFIG, data =>
      this.handleData(data),
    );
    this._flags = this._dumpFlags();
  }

  isFeatureEnabled(featureName: BETA_FEATURE): boolean {
    return this._calculator.isFeatureEnabled(this._flags, featureName);
  }

  handleData(flags: IFlag, source: IBETA_FLAG_SOURCE = 'Client_Config') {
    const oldFlag = this._getFromStorage(source);
    const touchedFlags = strictDiff([oldFlag, flags]);
    Object.keys(touchedFlags).length && this._notify(touchedFlags);
    this._saveToStorage(source, flags);
    this._flags = this._dumpFlags();
  }

  async getServicePermission() {
    const rcInfoDao = daoManager.getKVDao(RcInfoDao);
    let rcExtensionInfo: RcExtensionInfo = rcInfoDao.get(RC_EXTENSION_INFO);
    if (!rcExtensionInfo || !rcExtensionInfo.serviceFeatures) {
      const result = await RcInfoApi.requestRcExtensionInfo();
      if (result.isOk()) {
        rcExtensionInfo = result.data;
      } else {
        throw result.error;
      }
    }
    const permissions = {};
    rcExtensionInfo.serviceFeatures!.forEach((item: RcServiceFeature) => {
      permissions[item.featureName] = item.enabled;
    });
    this.handleData(permissions, 'RC_PERMISSION');
  }

  getFlagValue(key: string) {
    return this._calculator.getFlagValue(this._flags, key);
  }

  private _dumpFlags() {
    const defaultFlags = {};
    return ['Client_Config', 'Split.io_Flag', 'RC_PERMISSION'].reduce(
      (prev, curr) => ({ ...prev, ...this._getFromStorage(curr) }),
      defaultFlags,
    );
  }
  private _notify(touchedFlags: IFlag) {
    this._notifier.broadcast(touchedFlags);
  }
  private _saveToStorage(itemName: string, flags: IFlag) {
    localStorage.setItem(itemName, JSON.stringify(flags));
    this._flags = this._dumpFlags();
  }
  private _getFromStorage(itemName: string) {
    const flags = localStorage.getItem(itemName);
    if (!flags) {
      return {};
    }
    return JSON.parse(flags);
  }
}

export default FeatureFlag;
