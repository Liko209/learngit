/*
 * @Author: Conner
 * @Date: 2019-03-06 16:40
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import {
  AssemblerAddFuncArgs,
  AssemblerDelFuncArgs,
} from '@/modules/message/container/ConversationPage/Stream/StreamItemAssemblyLine/Assembler/types';
import { SingletonTagChecker } from '@/modules/message/container/ConversationPage/Stream/StreamItemAssemblyLine/Assembler/CalcItems';
import { StreamItem, StreamItemType } from '@/modules/message/container/ConversationPage/Stream/types';

function runOnAdd(args: AssemblerAddFuncArgs) {
  const separator = new SingletonTagChecker();
  return separator.onAdd(args);
}

function runOnDelete(args: AssemblerDelFuncArgs) {
  const separator = new SingletonTagChecker();
  return separator.onDelete(args);
}

describe('CalcItems', () => {

  describe('onAdd()', () => {
    it('should remove Date separator when it was followed by new message separator', () => {
      const newMegSeparator: StreamItem = {
        id: 1000,
        timeStart: 1000,
        type: StreamItemType.NEW_MSG_SEPARATOR,
      };
      const dateSeparator: StreamItem = {
        id: 1001,
        timeStart: 1001,
        type: StreamItemType.DATE_SEPARATOR,
      };
      const postMsg: StreamItem = {
        id: 1002,
        timeStart: 1002,
        type: StreamItemType.POST,
      };
      const separator = runOnAdd(<AssemblerAddFuncArgs>{
        streamItemList: _([
          newMegSeparator,
          dateSeparator,
          postMsg,
        ]),
      });

      expect(separator.streamItemList.size()).toEqual(2);
      expect(separator.streamItemList.reverse().value()).toEqual([newMegSeparator, postMsg]);
    });

    it('should remove Date separator when it was followed by another Date separator', () => {
      const dateSeparator1: StreamItem = {
        id: 1001,
        timeStart: 1001,
        type: StreamItemType.DATE_SEPARATOR,
      };
      const dateSeparator2: StreamItem = {
        id: 1002,
        timeStart: 1002,
        type: StreamItemType.DATE_SEPARATOR,
      };
      const postMsg: StreamItem = {
        id: 1003,
        timeStart: 1003,
        type: StreamItemType.POST,
      };
      const separator = runOnAdd(<AssemblerAddFuncArgs>{
        streamItemList: _([
          dateSeparator1,
          dateSeparator2,
          postMsg,
        ]),
      });

      expect(separator.streamItemList.size()).toEqual(2);
      expect(separator.streamItemList.reverse().value()).toEqual([dateSeparator2, postMsg]);
    });
  });

  describe('onDelete()', () => {
    it('should remove Date separator when it was followed by new message separator', () => {
      const newMegSeparator: StreamItem = {
        id: 1000,
        timeStart: 1000,
        type: StreamItemType.NEW_MSG_SEPARATOR,
      };
      const dateSeparator: StreamItem = {
        id: 1001,
        timeStart: 1001,
        type: StreamItemType.DATE_SEPARATOR,
      };
      const postMsg: StreamItem = {
        id: 1002,
        timeStart: 1002,
        type: StreamItemType.POST,
      };
      const separator = runOnDelete(<AssemblerDelFuncArgs>{
        streamItemList: _([
          newMegSeparator,
          dateSeparator,
          postMsg,
        ]),
      });

      expect(separator.streamItemList.size()).toEqual(2);
      expect(separator.streamItemList.reverse().value()).toEqual([newMegSeparator, postMsg]);
    });

    it('should remove Date separator when it was followed by another Date separator', () => {
      const dateSeparator1: StreamItem = {
        id: 1001,
        timeStart: 1001,
        type: StreamItemType.DATE_SEPARATOR,
      };
      const dateSeparator2: StreamItem = {
        id: 1002,
        timeStart: 1002,
        type: StreamItemType.DATE_SEPARATOR,
      };
      const postMsg: StreamItem = {
        id: 1003,
        timeStart: 1003,
        type: StreamItemType.POST,
      };
      const separator = runOnDelete(<AssemblerDelFuncArgs>{
        streamItemList: _([
          dateSeparator1,
          dateSeparator2,
          postMsg,
        ]),
      });

      expect(separator.streamItemList.size()).toEqual(2);
      expect(separator.streamItemList.reverse().value()).toEqual([dateSeparator2, postMsg]);
    });
  });
});
