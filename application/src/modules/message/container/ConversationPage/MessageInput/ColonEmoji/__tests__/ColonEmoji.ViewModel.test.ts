/*
 * @Author: ken.li
 * @Date: 2019-06-05 11:10:11
 * Copyright © RingCentral. All rights reserved.
 */

import { testable, test } from 'shield';
import { mockEntity } from 'shield/application';
import { mockService } from 'shield/sdk';
import { ENTITY_NAME } from '@/store';

import { getEntity, transform2Map } from '@/store/utils';
import { CONVERSATION_TYPES } from '@/constants';
import { ColonEmojiViewModel } from '../ColonEmoji.ViewModel';
import { ServiceLoader } from 'sdk/module/serviceLoader';

jest.mock('@/store/utils');
jest.mock('sdk/module/search');

let colonEmojiViewModel: ColonEmojiViewModel;
const mockGroupEntityData: {
  type: CONVERSATION_TYPES;
  members: number[];
} = {
  type: CONVERSATION_TYPES.NORMAL_ONE_TO_ONE,
  members: [1, 2, 3],
};
beforeEach(() => {
  let mockSearchService: any;
  mockSearchService = {
    doFuzzySearchPersons: jest.fn(),
  };

  ServiceLoader.getInstance = jest.fn().mockReturnValue(mockSearchService);

  colonEmojiViewModel = new ColonEmojiViewModel({ id: 1 });
});
describe('colonEmojiViewModel', () => {
  @testable
  class lifecycleMethod {
    @test('should be initial state when start')
    t1() {
      expect(colonEmojiViewModel.open).toBe(false);
      expect(colonEmojiViewModel.currentIndex).toBe(0);
      expect(colonEmojiViewModel.members).toEqual([]);
      expect(colonEmojiViewModel.searchTerm).toBe(undefined);
    }
  }
  @testable
  class reset {
    @test('should be reset if called')
    t1() {
      colonEmojiViewModel.reset();
      expect(colonEmojiViewModel._canDoFuzzySearch).toBe(false);
      expect(colonEmojiViewModel.open).toBe(false);
      expect(colonEmojiViewModel.currentIndex).toBe(0);
      expect(colonEmojiViewModel.members).toEqual([]);
    }
  }
  @testable
  class _selectHandler {
    @test('should be add to quill if selected')
    t1() {
      const colonEmojiModules = {
        select: jest.fn(),
      };
      const quill = {
        getModule: jest.fn().mockReturnValue(colonEmojiModules),
      };
      const handler = colonEmojiViewModel
        ._selectHandler(colonEmojiViewModel)
        .bind({
          quill,
        });
      handler();
      expect(quill.getModule).not.toBeCalled();
      colonEmojiViewModel.open = true;
      colonEmojiViewModel.members = [1];
      handler();
      expect(quill.getModule).toBeCalledWith('emoji');
      expect(colonEmojiModules.select).toBeCalledWith(
        colonEmojiViewModel.members[colonEmojiViewModel.currentIndex].displayId,
        colonEmojiViewModel.members[colonEmojiViewModel.currentIndex]
          .displayName,
        colonEmojiViewModel._denotationChar,
      );
      expect(colonEmojiViewModel.open).toBe(false);
    }
  }
  @testable
  class selectHandler {
    @test('should call _selecthandler to apply quill if selected')
    t1() {
      const handler = colonEmojiViewModel
        .selectHandler(1)
        .bind(colonEmojiViewModel);
      colonEmojiViewModel._selectHandler = jest.fn().mockReturnValue(jest.fn());
      document.querySelector = jest.fn().mockReturnValue({
        __quill: jest.fn(),
      });
      handler();
      expect(colonEmojiViewModel.currentIndex).toBe(1);
      expect(colonEmojiViewModel._selectHandler).toBeCalled();
    }
  }
  @testable
  class _onColon {
    @test('should open when on :xx ')
    t1() {
      colonEmojiViewModel._onColon(true, 'fl', ':');
      expect(colonEmojiViewModel.open).toBe(true);
      expect(colonEmojiViewModel.searchTerm).toBe('fl');
      expect(colonEmojiViewModel._denotationChar).toBe(':');
    }
    t2() {
      colonEmojiViewModel._onColon(false, '', ':');
      expect(colonEmojiViewModel.open).toBe(false);
    }
  }

  @testable
  class _upHandler {
    @test('should go up when click up')
    t1() {
      const handler = colonEmojiViewModel._upHandler(colonEmojiViewModel);
      colonEmojiViewModel.members = [1, 2, 3];
      colonEmojiViewModel.currentIndex = 1;
      handler();
      expect(colonEmojiViewModel.currentIndex).toBe(0);
      handler();
      expect(colonEmojiViewModel.currentIndex).toBe(2);
      handler();
      expect(colonEmojiViewModel.currentIndex).toBe(1);
    }
  }

  @testable
  class _downHandler {
    @test('should go down when click down')
    t1() {
      const handler = colonEmojiViewModel._downHandler(colonEmojiViewModel);
      colonEmojiViewModel.members = [1, 2, 3];
      colonEmojiViewModel.currentIndex = 1;
      handler();
      expect(colonEmojiViewModel.currentIndex).toBe(2);
      handler();
      expect(colonEmojiViewModel.currentIndex).toBe(0);
      handler();
      expect(colonEmojiViewModel.currentIndex).toBe(1);
    }
  }

  @testable
  class _escapeHandler {
    @test('should close if exc clicked')
    t1() {
      const handler = colonEmojiViewModel._escapeHandler(colonEmojiViewModel);
      handler();
      expect(colonEmojiViewModel.open).toBe(false);
    }
  }
});
