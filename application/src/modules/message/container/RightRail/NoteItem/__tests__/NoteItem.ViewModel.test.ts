/*
 * @Author: isaac.liu
 * @Date: 2019-01-14 14:23:02
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '@/store/utils';
import { NoteItemViewModel } from '../NoteItem.ViewModel';
import { GLOBAL_KEYS, ENTITY_NAME } from '../../../../../../store/constants';
import {
  ERROR_CODES_NETWORK,
  JNetworkError,
  JServerError,
  ERROR_CODES_SERVER,
} from 'sdk/error';
import { ServiceLoader } from 'sdk/module/serviceLoader';
const body = 'Body';
const id = 1;

const itemService = {
  getNoteBody: jest.fn().mockResolvedValue(body),
};

jest.mock('@/store/utils');

const noteItemViewModel = new NoteItemViewModel({ id: 123 });

describe('NoteItemViewModel', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    ServiceLoader.getInstance = jest.fn().mockReturnValue(itemService);
  });

  it('should get title ', () => {
    (getEntity as jest.Mock).mockReturnValue({
      title: 'This is note',
    });
    expect(noteItemViewModel.title).toBe('This is note');
  });

  it('should get subTitle', () => {
    (getEntity as jest.Mock).mockImplementation((type: string) => {
      if (type === ENTITY_NAME.PERSON) {
        return { userDisplayName: 'username' };
      }
      if (type === ENTITY_NAME.ITEM) {
        return { creatorId: 111 };
      }
      return null;
    });

    expect(noteItemViewModel.subTitle).toBe('username');
  });

  describe('getBodyInfo', () => {
    it('should get body info ', async () => {
      const noteItemViewModel = new NoteItemViewModel({ id: 123 });
      itemService.getNoteBody = jest.fn().mockImplementationOnce(() => body);
      const result = await noteItemViewModel.getBodyInfo();
      expect(result).toEqual(body);
    });
    it('should return error when service error ', async () => {
      const noteItemViewModel = new NoteItemViewModel({ id: 123 });
      itemService.getNoteBody = jest.fn().mockImplementationOnce(() => {
        throw new JServerError(ERROR_CODES_SERVER.NOT_AUTHORIZED, '');
      });
      const result = await noteItemViewModel.getBodyInfo();
      expect(result).toEqual('Error');
    });
  });
});
