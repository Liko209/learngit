import { ISchema } from 'foundation/src/db';

const gen = (unique: string = '_id', indices: string[] = []) => ({
  unique,
  indices,
});
export const schema: ISchema = {
  name: 'GlipServer',
  version: 1,
  schema: {
    1: {
      clientConfig: gen(),
      company: gen(),
      group: gen(),
      item: gen(),
      person: gen(),
      post: gen('_id', ['group_id', 'created_at']),
      profile: gen('_id', ['favorite_group_ids']),
      state: gen(),
      groupState: gen(),
    },
  },
};
