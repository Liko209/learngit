import { ConversationThreadsManager } from '../ConversationStreamManager';
import { ConversationStreamViewModel } from '../ConversationStreamViewModel';

jest.mock('../ConversationStreamViewModel');
let conversationStreamManager;
describe('Conversation Stream Manager', () => {
  beforeEach(() => {
    conversationStreamManager = new ConversationThreadsManager();
  });
  it('should add one vm', () => {
    conversationStreamManager.addConversationThread(1);
    expect(
      conversationStreamManager.ConversationStreamViewModels.get(1),
    ).toBeInstanceOf(ConversationStreamViewModel);
  });
  it('should remove one vm', () => {
    conversationStreamManager.addConversationThread(1);
    conversationStreamManager.delConversationThread(1);
    expect(
      conversationStreamManager.ConversationStreamViewModels.get(1),
    ).toBeUndefined();
  });
  it('should add one vm if id does not exist in pool', () => {
    conversationStreamManager.getConversationThread(10);
    expect(
      conversationStreamManager.ConversationStreamViewModels.get(10),
    ).toBeInstanceOf(ConversationStreamViewModel);
  });
  it('should add one vm if id already exist in pool', () => {
    conversationStreamManager.addConversationThread(10);
    conversationStreamManager.getConversationThread(10);
    expect(
      conversationStreamManager.ConversationStreamViewModels.get(10),
    ).toBeInstanceOf(ConversationStreamViewModel);
  });
  it('should remove first vm', () => {
    conversationStreamManager.addConversationThread(10);
    conversationStreamManager.removeFirstConversationThread();
    expect(
      conversationStreamManager.ConversationStreamViewModels.keys().next().value,
    ).toBeUndefined();
  });

  it('should load post', () => {
    conversationStreamManager.addConversationThread(10);
    conversationStreamManager.loadPosts(10);
    expect(
      conversationStreamManager.ConversationStreamViewModels.get(10).loadPosts,
    ).toHaveBeenCalled();
  });
  it('get Size of the vm', () => {
    conversationStreamManager.addConversationThread(10);
    expect(conversationStreamManager.getSize()).toBe(1);
  });
  it('dispose all the vm', () => {
    conversationStreamManager.addConversationThread(10);
    conversationStreamManager.dispose();
  });
  it('dispose one the vm', () => {
    conversationStreamManager.addConversationThread(10);
    conversationStreamManager.dispose(10);
    expect(
      conversationStreamManager.ConversationStreamViewModels.get(10).dispose,
    ).toHaveBeenCalled();
  });
});
