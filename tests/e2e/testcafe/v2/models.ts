export interface ICompany {
  type: string;
  number: string;
  domain: string;
  brandId: string;
  admin: IUser;
  users: IUser[];
  groups: IGroup[];
}

export interface IUser {
  rcId?: string;
  glipId?: string;
  company: ICompany;
  extension?: string;
  email?: string;
  password: string;
}

export interface IGroup {
  name?: string;
  glipId?: string;
  members: IUser[];
  type: string;
}

export interface ICredential {
  username: string;
  extension: string;
  password: string;
}

export interface IStep {
  message: string;
  status: Status;
  startTime: number;
  endTime: number;
  screenshotPath?: string;
}


export enum Status {
  PASSED = 'passed',
  PENDING = 'pending',
  SKIPPED = 'skipped',
  FAILED = 'failed',
  BROKEN = 'broken',
}
