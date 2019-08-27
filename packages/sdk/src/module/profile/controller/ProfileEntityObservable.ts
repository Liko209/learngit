import { IProfileObservable, IProfileObserver } from '../types';
import { Profile } from '../entity/Profile';
import { Nullable } from 'sdk/types';
import _ from 'lodash';
import { SETTING_KEYS } from '../constants';

class ProfileEntityObservable implements IProfileObservable {
  private _profileCache: Profile;
  private _observers = new Map<SETTING_KEYS, IProfileObserver[]>();
  onProfileUpdate(profile: Profile) {
    this._observers.forEach(
      (observers: IProfileObserver[], key: SETTING_KEYS) => {
        const originValue = this._profileCache && this._profileCache[key];
        if (!_.isEqual(profile[key], originValue)) {
          observers.map(item => this.notify(item, profile, this._profileCache));
        }
      },
    );
    this._profileCache = _.cloneDeep(profile);
  }
  register(observer: IProfileObserver) {
    observer.keys.forEach((key: SETTING_KEYS) => {
      const observers = this._observers.get(key) || [];
      observers.push(observer);
      this._observers.set(key, observers);
    });
  }
  unRegister(observer: IProfileObserver) {
    this._observers.forEach(
      (observers: IProfileObserver[], key: SETTING_KEYS) => {
        this._observers.set(
          key,
          observers.filter((item: IProfileObserver) => item !== observer),
        );
      },
    );
  }
  unRegisterAll() {
    this._observers = new Map<SETTING_KEYS, IProfileObserver[]>();
  }
  async notify(
    observer: IProfileObserver,
    profile: Profile,
    originProfile: Nullable<Profile>,
  ) {
    observer.update && (await observer.update(profile, originProfile));
  }
}
export { ProfileEntityObservable };
