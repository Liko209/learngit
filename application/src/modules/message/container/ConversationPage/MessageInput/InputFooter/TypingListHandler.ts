import { notificationCenter, SERVICE } from 'sdk/service';
import { GroupTyping } from 'sdk/module/group/entity';
import { observable, computed, reaction } from 'mobx';
import { getGlobalValue, getEntity } from '@/store/utils';
import { GLOBAL_KEYS, ENTITY_NAME } from '@/store/constants';
import { Disposer } from 'mobx-react';
import PersonModel from '@/store/models/Person';
import { Person } from 'sdk/module/person/entity';

const CHECKING_INTERVAL = 2000;
const TYPING_INTERVAL = 5000;

class TypingListHandler {
  constructor() {
    this._disposers.push(
      reaction(
        () => this.currentGroupId,
        () => {
          this.typingListStore = {};
        },
      ),
    );
    this._disposers.push(
      reaction(
        () => this.typingList.length > 0,
        hasTypingList => {
          if (hasTypingList) {
            this._interval = setInterval(() => {
              for (const user_id in this.typingListStore) {
                if (!this.isStillTyping(this.typingListStore[user_id])) {
                  delete this.typingListStore[user_id];
                }
              }
            }, CHECKING_INTERVAL);
          } else {
            clearInterval(this._interval);
          }
        },
      ),
    );
    notificationCenter.on(SERVICE.GROUP_TYPING, this._handleGroupTyping);
  }

  private _interval: NodeJS.Timeout;

  @observable typingListStore = {};

  @computed
  get typingUserIds() {
    return Object.keys(this.typingListStore);
  }

  @computed
  get typingList() {
    return this.typingUserIds.map(userId => {
      const { userDisplayName } = getEntity<Person, PersonModel>(
        ENTITY_NAME.PERSON,
        parseInt(userId, 10),
      );
      return userDisplayName;
    });
  }

  @computed
  get currentGroupId() {
    return getGlobalValue(GLOBAL_KEYS.CURRENT_CONVERSATION_ID);
  }

  private _disposers: Disposer[] = [];

  private _handleGroupTyping = (groupTyping: GroupTyping) => {
    const { group_id, user_id, clear } = groupTyping;
    if (group_id === this.currentGroupId) {
      if (clear) {
        delete this.typingListStore[user_id];
      } else {
        this.typingListStore[user_id] = new Date().getTime();
      }
    }
  }

  isStillTyping(timestamp: number) {
    return new Date().getTime() - timestamp < TYPING_INTERVAL;
  }

  dispose() {
    this._disposers.forEach(disposer => disposer());
    notificationCenter.off(SERVICE.GROUP_TYPING, this._handleGroupTyping);
    clearInterval(this._interval);
  }
}

export { TypingListHandler };
