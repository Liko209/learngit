import { GlipSdk } from './sdk/glip';
import { RcPlatformSdk } from './sdk/platform';
import { LogHelper } from './helpers/log-helper';

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
  owner?: IUser;
  members: IUser[];
  type: string; // Team or DirectMessage(Group, Direct, Personal)
  privacy?: string;
  isPublic?: boolean;
  description?: string;
}

export interface ICredential {
  username: string;
  extension: string;
  password: string;
}

export interface IStep {
  text: string;
  metadata?: { [key: string]: string };
  status?: Status;
  startTime?: number;
  endTime?: number;
  screenshotPath?: string;
  attachments?: string[];
  children?: IStep[];
}

export interface IStepOptions {
  takeScreenshot?: boolean;
  screenshotPath?: string;
  args?: { [key: string]: string };
}

export enum Status {
  PASSED = 'passed',
  PENDING = 'pending',
  SKIPPED = 'skipped',
  FAILED = 'failed',
  BROKEN = 'broken',
}

export enum Process {
  RUN = 'run',
  FINISH = 'finish',
}

export interface IConsoleLog {
  consoleLogPath: string;
  warnConsoleLogPath: string;
  errorConsoleLogPath: string;
  warnConsoleLogNumber?: number;
  errorConsoleLogNumber?: number;
}

export interface ITestMeta {
  priority: string[];
  caseIds: string[];
  maintainers: string[];
  keywords: string[];
}


export interface INotification {
  id: any;
  title: string;
  body: string;
  icon: string;
}
