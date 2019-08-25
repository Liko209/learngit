import { ProfileObservable, ProfileObserver } from '../types';
import { Profile } from '../entity/Profile';
import { Nullable } from 'sdk/types';
import _ from 'lodash';
import { SETTING_KEYS } from '../constants';

class ProfileEntityObservable implements ProfileObservable {
  private _observers = new Map<SETTING_KEYS, ProfileObserver[]>();
  onProfileUpdate(profile: Profile, originProfile: Nullable<Profile>) {
    this._observers.forEach(
      (observers: ProfileObserver[], key: SETTING_KEYS) => {
        const originValue = originProfile && originProfile[key];
        if (!_.isEqual(profile[key], originValue)) {
          observers.map(item => this.notify(item, profile, originProfile));
        }
      },
    );
  }
  register(observer: ProfileObserver) {
    observer.keys.forEach((key: SETTING_KEYS) => {
      const observers = this._observers.get(key) || [];
      observers.push(observer);
      this._observers.set(key, observers);
    });
  }
  unRegister(observer: ProfileObserver) {
    this._observers.forEach(
      (observers: ProfileObserver[], key: SETTING_KEYS) => {
        this._observers.set(
          key,
          observers.filter((item: ProfileObserver) => item !== observer),
        );
      },
    );
  }
  unRegisterAll() {
    this._observers = new Map<SETTING_KEYS, ProfileObserver[]>();
  }
  async notify(
    observer: ProfileObserver,
    profile: Profile,
    originProfile: Nullable<Profile>,
  ) {
    observer.update && (await observer.update(profile, originProfile));
  }
}
export { ProfileEntityObservable };
