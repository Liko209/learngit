import ConversationThreadPresenter from './ConversationThreadPresenter';
import storeManager from '#/store';
import { GLOBAL_STORE_DATA } from '#/constants';

const MAX_CONVERSATION_THREAD = 5;

export default class PostsPresenter {
  constructor() {
    this.conversationThreadPresenters = new Map();
    this.globalStore = storeManager.getGlobalStore();
  }

  setGlobalStoreSWITCH(flag) {
    this.globalStore.set(GLOBAL_STORE_DATA.IS_SWITCH, flag);
  }

  addConversationThread(groupId) {
    this.conversationThreadPresenters.set(
      groupId,
      new ConversationThreadPresenter(groupId)
    );
    return this.getConversationThread(groupId);
  }

  delConversationThread(groupId) {
    const conversationThread = this.conversationThreadPresenters.get(groupId);
    conversationThread.dispose();
    this.conversationThreadPresenters.delete(groupId);
  }

  getConversationThread(groupId) {
    let conversationThread = this.conversationThreadPresenters.get(groupId);
    if (!conversationThread) {
      conversationThread = this.addConversationThread(groupId);
      this.checkCache();
    } else {
      this.conversationThreadPresenters.delete(groupId);
      this.conversationThreadPresenters.set(groupId, conversationThread);
    }
    return conversationThread;
  }

  removeFirstConversationThread() {
    const firstKey = this.conversationThreadPresenters.keys().next().value;
    return this.delConversationThread(firstKey);
  }

  loadPosts(groupId) {
    const conversationThreadPresenter = this.getConversationThread(groupId);
    conversationThreadPresenter.loadPosts();
  }

  checkCache() {
    const conversationThreadSize = this.getSize();
    if (conversationThreadSize > MAX_CONVERSATION_THREAD) {
      this.removeFirstConversationThread();
    }
  }

  getStore(groupId) {
    const conversationThreadPresenter = this.getConversationThread(groupId);
    if (conversationThreadPresenter) {
      return conversationThreadPresenter.getStore();
    }
    return null;
  }

  dispose(groupId) {
    if (groupId) {
      const conversationThreadPresenter = this.getConversationThread(groupId);
      conversationThreadPresenter.dispose();
    } else {
      this.conversationThreadPresenters.forEach(presenter => {
        presenter.dispose();
      });
    }
  }

  getSize() {
    return this.conversationThreadPresenters.size;
  }
}
