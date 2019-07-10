import { IApiContract } from '../../../../../types';
import { GlipGroup } from '../../types';

export interface IGlipGroupPut extends IApiContract {
  path: '/api/group/:id';
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
