import { Person } from 'sdk/module/person/entity';
import { Group } from 'sdk/module/group/entity';
import { Profile } from 'sdk/module/profile/entity';
import { Company } from 'sdk/module/company/entity';
import { Post } from 'sdk/module/post/entity';
import { Item } from 'sdk/module/item/entity';
import {
  IResponse,
  IRequest,
  INetworkRequestExecutorListener,
} from 'foundation';

export type GlipBase = {
  _id: number;
  created_at: number;
  modified_at: number;
  creator_id: number;
  is_new: boolean;
  deactivated: boolean;
  version: number;
  model_id?: string;
  model_size?: number;
};

export type GlipGroup = Group;
export type GlipProfile = Profile;
export type GlipPerson = Person;
export type GlipCompany = Company;
export type GlipPost = Post;
export type GlipItem = Item;
export type GlipState = GlipBase;
export type GlipClientConfig = GlipBase;

export type GlipModel =
  | GlipState
  | GlipGroup
  | GlipProfile
  | GlipCompany
  | GlipPost
  | GlipItem
  | GlipClientConfig;

export type InitialData = {
  user_id: number;
  company_id: number;
  profile?: GlipProfile;
  companies?: GlipCompany[];
  items?: GlipItem[];
  // presences?: Presence[];
  state?: GlipState;
  people?: GlipPerson[];
  public_teams?: GlipGroup[];
  groups?: GlipGroup[];
  teams?: GlipGroup[];
  posts?: GlipPost[];
  max_posts_exceeded?: boolean;
  timestamp?: number;
  scoreboard?: string;
  client_config: GlipClientConfig;
  static_http_server: string;
};

export type HttpVerb = 'get' | 'post' | 'put' | 'delete';
export type Handler = (request: IRequest) => Promise<IResponse> | IResponse;
export type VerbHandler = { [key in HttpVerb]: Handler };
export interface IApi {
  [key: string]: Partial<VerbHandler>;
}

export interface IResponseAdapter {
  adapt: (
    handler: Handler,
  ) => (request: IRequest, cb: INetworkRequestExecutorListener) => void;
}
