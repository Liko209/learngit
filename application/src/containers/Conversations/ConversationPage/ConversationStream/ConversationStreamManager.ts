import { ConversationStreamViewModel } from './ConversationStreamViewModel';

const MAX_CONVERSATION_THREAD = 5;

export default class ConversationThreadsManager {
  ConversationStreamViewModels: Map<
    number,
    ConversationStreamViewModel
  > = new Map();
  addConversationThread(groupId: number) {
    this.ConversationStreamViewModels.set(
      groupId,
      new ConversationStreamViewModel(groupId),
    );
    return this.getConversationThread(groupId);
  }

  delConversationThread(groupId: number) {
    const conversationThread = this.ConversationStreamViewModels.get(groupId);
    conversationThread && conversationThread.dispose();
    this.ConversationStreamViewModels.delete(groupId);
  }

  getConversationThread(groupId: number): ConversationStreamViewModel {
    let conversationThread = this.ConversationStreamViewModels.get(groupId);
    if (!conversationThread) {
      conversationThread = this.addConversationThread(groupId);
      this.checkCache();
    } else {
      this.ConversationStreamViewModels.delete(groupId);
      this.ConversationStreamViewModels.set(groupId, conversationThread);
    }
    return conversationThread;
  }

  removeFirstConversationThread() {
    const firstKey = this.ConversationStreamViewModels.keys().next().value;
    return this.delConversationThread(firstKey);
  }

  loadPosts(groupId: number) {
    const ConversationStreamViewModel = this.getConversationThread(groupId);
    ConversationStreamViewModel && ConversationStreamViewModel.loadPosts();
  }

  checkCache() {
    const conversationThreadSize = this.getSize();
    if (conversationThreadSize > MAX_CONVERSATION_THREAD) {
      this.removeFirstConversationThread();
    }
  }

  getStore(groupId: number) {
    const ConversationStreamViewModel = this.getConversationThread(groupId);
    if (ConversationStreamViewModel) {
      return ConversationStreamViewModel.store;
    }
    return null;
  }

  dispose(groupId: number) {
    if (groupId) {
      const ConversationStreamViewModel = this.getConversationThread(groupId);
      ConversationStreamViewModel.dispose();
    } else {
      this.ConversationStreamViewModels.forEach(
        (vm: ConversationStreamViewModel) => {
          vm.dispose();
        },
      );
    }
  }

  getSize() {
    return this.ConversationStreamViewModels.size;
  }
}

export { ConversationThreadsManager };
