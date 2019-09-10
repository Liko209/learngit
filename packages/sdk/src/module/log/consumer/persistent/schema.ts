/*
 * @Author: Paynter Chen
 * @Date: 2019-03-24 11:08:57
 * Copyright © RingCentral. All rights reserved.
 */
import { ISchema } from 'foundation/db';

export const TABLE_LOG = 'log';

/**
 * Generator unique and indices
 * @param {String} unique
 * @param {Array} indices
 * return {*}
 */
const gen = (
  unique: string = 'id',
  indices: string[] = [],
  onUpgrade?: (item: any) => void,
) => ({
  unique,
  indices,
  onUpgrade,
});

const schema: ISchema = {
  name: 'Log',
  version: 1, // Should update this number if all the old data in client db need to be deleted.
  schema: {
    1: {
      [TABLE_LOG]: gen('++id', ['sessionId', 'startTime']),
    },
  },
};

export default schema;
