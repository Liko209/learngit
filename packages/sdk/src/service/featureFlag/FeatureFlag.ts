import ConfigChangeNotifier from './configChangeNotifier';
import { Flag, BETA_FEATURE } from './utils';
import FlagCalculator from './FlagCalculator';

class FeatureFlag {
  private _flags: Flag;
  constructor(private _notifier: ConfigChangeNotifier, private _calculator: FlagCalculator) {
    this._notifier = _notifier;
    this._calculator = _calculator;
    this._flags = this._dumpFlags();
  }

  isFeatureEnabled(featureName: BETA_FEATURE): boolean {
    return this._calculator.isFeatureEnabled(this._flags, featureName);
  }

  // fetchBetaFlag() {
  //   //todo:
  //   return Promise.resolve();
  // }
  handleInitConfig(flags: Flag) {
    this._saveToStorage('Client_Config', flags);
    this._flags = this._dumpFlags();
  }
  //socket
  handleData(flags: Flag) {
    const oldFlag = this._getFromStorage('Client_Config');
    const touchedFlags = this._diff(oldFlag, flags);
    Object.keys(touchedFlags).length && this._notify(touchedFlags);
    this._saveToStorage('Client_Config', this._upInsert(oldFlag, flags));
    this._flags = this._dumpFlags();
  }

  getFlagValue(key: string) {
    return this._calculator.getFlagValue(this._flags, key);
  }
  private _upInsert(oldFlags: Flag, newFlags: Flag): Flag | {} {
    return Object.assign(oldFlags, newFlags);
  }
  private _diff(oldFlags: Flag, newFlags: Flag) {
    return Object.entries(newFlags)
      .filter(([key, val]) => val !== oldFlags[key])
      .reduce((prev, [key, val]) => ({ ...prev, [key]: val }), {});
  }
  private _dumpFlags() {
    return ['Client_Config', 'Split.io_Flag', 'RC_permission'].reduce(
      (prev, curr) => ({ ...prev, ...this._getFromStorage(curr) }),
      {}
    );
  }
  private _notify(touchedFlags: Flag) {
    this._notifier.broadcast(touchedFlags);
  }
  private _saveToStorage(itemName: string, flags: Flag) {
    localStorage.setItem(itemName, JSON.stringify(flags));
  }
  private _getFromStorage(itemName: string) {
    const flags = localStorage.getItem(itemName) || '{}';
    return JSON.parse(flags);
  }
}

export default FeatureFlag;
