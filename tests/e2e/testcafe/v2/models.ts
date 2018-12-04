import { GlipSdk } from './sdk/glip';
import { RcPlatformSdk } from './sdk/platform';

export interface Sdk {
  glip: GlipSdk;
  platform: RcPlatformSdk;
}

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
  company: ICompany;
  extension?: string;
  email?: string;
  password: string;
  sdk: Sdk;
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
  status?: Status;
  startTime?: number;
  endTime?: number;
  screenshotPath?: string;
  attachments?: string[];
}


export enum Status {
  PASSED = 'passed',
  PENDING = 'pending',
  SKIPPED = 'skipped',
  FAILED = 'failed',
  BROKEN = 'broken',
}

export interface IConsoleLog {
  consoleLogPath: string;
  warnConsoleLogPath: string;
  errorConsoleLogPath: string;
  warnConsoleLogNumber?: number;
  errorConsoleLogNumber?: number;
}