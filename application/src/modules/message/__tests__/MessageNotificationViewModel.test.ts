import { observable } from 'mobx';
import { MessageNotificationViewModel } from '../MessageNotificationViewModel';
import * as utils from '@/store/utils';

describe(MessageNotificationViewModel.name, () => {
  describe('constructor', () => {
    let vm;
    let hooks: {
      onCreate: Function;
      onUpdate: Function;
      onDispose: Function;
    };
    let observablePost: {
      text: string;
      deactivated: boolean;
      likes: number;
    };
    beforeEach(() => {
      jest.clearAllMocks();
      hooks = {
        onCreate: jest.fn(),
        onUpdate: jest.fn(),
        onDispose: jest.fn(),
      };
      observablePost = observable({
        text: 'happy',
        deactivated: false,
        likes: 0,
      });
      jest.spyOn(utils, 'getEntity').mockReturnValue(observablePost);
      vm = new MessageNotificationViewModel(1, hooks);
    });
    it('should call on create when initiated', () => {
      expect(hooks.onCreate).toHaveBeenCalledTimes(1);
    });
    it('should subscribe entity when initiated', () => {
      expect(utils.getEntity).toHaveBeenCalled();
    });
    it('should call onUpdate hook when entity text changed', () => {
      observablePost.text = 'notBad';
      expect(hooks.onUpdate).toBeCalledTimes(1);
    });
    it('should not call onUpdate hook when entity likes changed', () => {
      observablePost.likes = 1;
      expect(hooks.onUpdate).not.toBeCalled();
    });
    it('should call dispose when entity deactivated', () => {
      observablePost.deactivated = true;
      expect(hooks.onDispose).toBeCalled();
    });
  });
});
