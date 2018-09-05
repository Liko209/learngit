import ConversationThreadPresenter from './ConversationStreamViewModel';
import storeManager from '@/store';

const MAX_CONVERSATION_THREAD = 5;

export default class ConversationThreadsManager {
  conversationThreadPresenters: Map<number, ConversationThreadPresenter> = new Map();
  addConversationThread(groupId: number) {
    this.conversationThreadPresenters.set(
      groupId,
      new ConversationThreadPresenter(groupId),
    );
    return this.getConversationThread(groupId);
  }

  delConversationThread(groupId: number) {
    const conversationThread = this.conversationThreadPresenters.get(groupId);
    conversationThread && conversationThread.dispose();
    this.conversationThreadPresenters.delete(groupId);
  }

  getConversationThread(groupId: number): ConversationThreadPresenter {
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

  loadPosts(groupId: number) {
    const conversationThreadPresenter = this.getConversationThread(groupId);
    conversationThreadPresenter && conversationThreadPresenter.loadPosts();
  }

  checkCache() {
    const conversationThreadSize = this.getSize();
    if (conversationThreadSize > MAX_CONVERSATION_THREAD) {
      this.removeFirstConversationThread();
    }
  }

  getStore(groupId: number) {
    const conversationThreadPresenter = this.getConversationThread(groupId);
    if (conversationThreadPresenter) {
      return conversationThreadPresenter.getStore();
    }
    return null;
  }

  dispose(groupId: number) {
    if (groupId) {
      const conversationThreadPresenter = this.getConversationThread(groupId);
      conversationThreadPresenter.dispose();
    } else {
      this.conversationThreadPresenters.forEach((presenter: ConversationThreadPresenter) => {
        presenter.dispose();
      });
    }
  }

  getSize() {
    return this.conversationThreadPresenters.size;
  }
}
