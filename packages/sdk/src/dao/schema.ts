/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-23 23:42:59
 * Copyright © RingCentral. All rights reserved.
 */
import { ISchema } from 'foundation';

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

// const refactorId = (item: any) => {
//   item._id = item._id;
//   delete item._id;
// };

const schema: ISchema = {
  name: 'Glip',
  version: 3, // Should update this number if all the old data in client db need to be deleted.
  schema: {
    1: {
      person: gen(),
      group: gen(),
      post: gen('id', ['group_id', 'created_at']),
      item: gen(),
      company: gen(),
      profile: gen('id', ['favorite_group_ids']),
      state: gen(),
    },
    2: {
      state: gen('id', ['person_id']),
    },
    3: {
      person: gen('id', ['first_name', 'last_name', 'display_name', 'email']),
    },
    4: {
      post: gen('id', ['group_id', 'created_at', '[group_id+created_at]']),
      group: gen('id', ['most_recent_post_created_at']),
    },
    5: {
      groupState: gen(),
    },
    6: {
      deactivated: gen(),
    },
    7: {
      item: gen('id', ['*group_ids']),
    },
    8: { groupConfig: gen() },
  },
};

export default schema;
