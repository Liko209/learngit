import { TypingListHandler } from '../TypingListHandler';
import { notificationCenter } from 'sdk/service';
jest.mock('@/store/utils', () => {
  const personList = {
    111: 'alex',
    222: 'ben',
    333: 'cathy',
  };
  return {
    getGlobalValue: jest.fn().mockReturnValue(123),
    getEntity: jest.fn((_, userId) => ({
      userDisplayName: personList[userId],
    })),
  };
});

describe('TypingListHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('typingList', () => {
    it('should be ["alex", "ben"] when typingListStore has userId: 111,222', () => {
      const typingListHandler = new TypingListHandler();
      typingListHandler.typingListStore = {
        111: 1,
        222: 2,
      };
      expect(typingListHandler.typingList).toEqual(['alex', 'ben']);
    });
  });
  describe('_handleGroupTyping()', () => {
    it('should delete userId in typingListStore when clear is true and userId exists in typingListStore', () => {
      const typingListHandler = new TypingListHandler();
      typingListHandler.typingListStore = {
        111: 1,
        222: 2,
      };
      typingListHandler._handleGroupTyping({
        group_id: 123,
        user_id: 111,
        clear: true,
      });
      expect(typingListHandler.typingList).toHaveLength(1);
    });
    it('should add userId in typingListStore when clear is false and userId does not exist in typingListStore', () => {
      const typingListHandler = new TypingListHandler();
      typingListHandler.typingListStore = {
        111: 1,
        222: 2,
      };
      typingListHandler._handleGroupTyping({
        group_id: 123,
        user_id: 333,
        clear: false,
      });
      expect(typingListHandler.typingList).toHaveLength(3);
    });
  });
  describe('isStillTyping()', () => {
    jest.setTimeout(6000);
    const delay = (seconds: number) =>
      new Promise(resolve =>
        setTimeout(() => {
          resolve();
        }, seconds * 1000),
      );
    it('should be true when new timestamp is created less than 5 seconds later after the old one was created', async () => {
      const typingListHandler = new TypingListHandler();
      const oldTimeStamp = new Date().getTime();
      await delay(4);
      expect(typingListHandler.isStillTyping(oldTimeStamp)).toBeTruthy();
    });
    it('should be false when new timestamp is created more than 5 seconds later after the old one was created', async () => {
      const typingListHandler = new TypingListHandler();
      const oldTimeStamp = new Date().getTime();
      await delay(5.5);
      expect(typingListHandler.isStillTyping(oldTimeStamp)).toBeFalsy();
    });
  });
  describe('dispose()', () => {
    it('should call notificationCenter.off and clearInterval when being called', () => {
      const typingListHandler = new TypingListHandler();
      notificationCenter.off = jest.fn();
      global.clearInterval = jest.fn();
      typingListHandler.dispose();
      expect(notificationCenter.off).toBeCalled();
      expect(clearInterval).toBeCalled();
    });
  });
});
