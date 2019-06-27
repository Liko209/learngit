import { notificationCenter, SERVICE } from 'sdk/src/service';
import { GroupTyping } from 'sdk/src/module/group/entity';
import { observable, computed, reaction } from 'mobx';
import { getGlobalValue, getEntity } from '@/store/utils';
import { GLOBAL_KEYS, ENTITY_NAME } from '@/store/constants';
import { Disposer } from 'mobx-react';

const CHECKING_INTERVAL = 2000;
const TYPING_INTERVAL = 5000;

class TypingListHandler {
  private _interval: NodeJS.Timeout;

  @observable typingListStore = {};

  @computed
  get typingList() {
    return Object.keys(this.typingListStore).map(userId => {
      const { displayName } = getEntity(ENTITY_NAME.PERSON, userId);
      return displayName;
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
    return new Date().getTime() - timestamp > TYPING_INTERVAL;
  }

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
                !this.isStillTyping(this.typingListStore[user_id]) &&
                  delete this.typingListStore[user_id];
              }
            },                           CHECKING_INTERVAL);
          } else {
            clearInterval(this._interval);
          }
        },
      ),
    );
    // notificationCenter.on(SERVICE.GROUP_TYPING, this._handleGroupTyping);
  }

  dispose() {
    this._disposers.forEach(disposer => disposer());
    notificationCenter.off(SERVICE.GROUP_TYPING, this._handleGroupTyping);
    clearInterval(this._interval);
  }
}

export { TypingListHandler };
