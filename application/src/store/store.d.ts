interface IEntity {
  id: number;
  [name: string]: any;
}

interface IIncomingData {
  type: string;
  entities: Map<number, IEntity>;
}

interface IService {
  getById(id: number): Promise<IEntity>;
}

interface IIDSortKey {
  id: number;
  sortKey: number;
}

interface ICompany {
  id: number;
  name: string;
}

interface IGroup {
  id: number;
  isTeam: boolean;
  setAbbreviation: string;
  members: number[];
  description: string;
  pinnedPostIds: number[];
}

interface IGroupState {
  id: number;
  unread_count: number;
  unread_mentions_count: number;
}

interface IPerson {
  id: number;
  companyId: number;
  firstName: string;
  lastName: string;
  headshot: string;
  email: string;
  rcPhoneNumbers: string[];
}

interface IPresence {
  id: number;
  presence: string;
}
