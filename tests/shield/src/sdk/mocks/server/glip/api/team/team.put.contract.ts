import { IApiContract } from '../../../../../types';
import { GlipGroup } from '../../types';

export interface IGlipTeamPut extends IApiContract {
  path: '/api/team/:id';
  method: 'put';
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
