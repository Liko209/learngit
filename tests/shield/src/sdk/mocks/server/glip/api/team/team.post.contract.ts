import { IApiContract } from '../../../../../types';
import { GlipGroup } from '../../types';

export interface IGlipTeamPost extends IApiContract {
  path: '/api/team';
  method: 'post';
  query: {
    id: number;
  };
  request: {
    data: Partial<GlipGroup>;
  };
  response: {
    data: GlipGroup;
  };
}
