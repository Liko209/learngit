import { IApiContract } from '../../../../../types';
import { GlipProfile } from '../../types';

export interface IGlipProfilePut extends IApiContract {
  host: 'glip';
  path: '/api/profile/:id';
  method: 'put';
  query: {
    id: number;
  };
  request: {
    data: Partial<GlipProfile>;
  };
  response: {
    data: GlipProfile;
  };
}
