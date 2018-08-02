import ConfigChangeNotifier from './configChangeNotifier';
import { IFlag, BETA_FEATURE } from './interface';
import IFlagCalculator from './FlagCalculator';
import { strictDiff } from './utils';
import dataDispatcher from '../DataDispatcher';
import { SOCKET } from '../../service';

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
    this._flags = this.dumpFlags();
  }

  isFeatureEnabled(featureName: BETA_FEATURE): boolean {
    return this._calculator.isFeatureEnabled(this._flags, featureName);
  }

  handleData(flags: IFlag) {
    const oldFlag = this.getFromStorage('Client_Config');
    const touchedFlags = strictDiff([oldFlag, flags]);
    Object.keys(touchedFlags).length && this.notify(touchedFlags);
    this.saveToStorage('Client_Config', flags);
    this._flags = this.dumpFlags();
  }

  getFlagValue(key: string) {
    return this._calculator.getFlagValue(this._flags, key);
  }

  private dumpFlags() {
    const defaultFlags = {};
    return ['Client_Config', 'Split.io_Flag', 'RC_permission'].reduce(
      (prev, curr) => ({ ...prev, ...this.getFromStorage(curr) }),
      defaultFlags,
    );
  }
  private notify(touchedFlags: IFlag) {
    this._notifier.broadcast(touchedFlags);
  }
  private saveToStorage(itemName: string, flags: IFlag) {
    localStorage.setItem(itemName, JSON.stringify(flags));
    this._flags = this.dumpFlags();
  }
  private getFromStorage(itemName: string) {
    const flags = localStorage.getItem(itemName);
    if (!flags) {
      return {};
    }
    return JSON.parse(flags);
  }
}

export default FeatureFlag;
