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
  message: string;
  metadata?: { [key: string]: string };
  status?: Status;
  startTime?: number;
  endTime?: number;
  screenshotPath?: string;
  attachments?: string[];
  children?: Array<IStep>;
  logHelper?: LogHelper;

  putMetadata(key: string, value: any);

  putMetadatas(metadata: { [key: string]: string });

  subStep(message: string, args?: { [key: string]: any }): IStep;

  withSubStep(message: string, cb: (step: IStep) => Promise<any>, options?: LogOptions);
}

export class Step implements IStep {
  message: string;
  metadata?: { [key: string]: string };
  status?: Status;
  startTime?: number;
  endTime?: number;
  screenshotPath?: string;
  attachments?: string[];
  children?: Array<IStep>;
  logHelper?: LogHelper;

  constructor(message: string, logHelper: LogHelper) {
    this.logHelper = logHelper;
    this.metadata = {};
    this.message = message;
    this.children = new Array();
  }

  putMetadata(key: string, value: string) {
    this.metadata[key] = value;
  }

  putMetadatas(metadata: { [key: string]: string }) {
    this.metadata = Object.assign(this.metadata, metadata);
  }

  subStep(message: string, args?: { [key: string]: any }): IStep {
    const child = new Step(message, this.logHelper);
    child.putMetadatas(args);
    child.status = Status.PASSED;
    if (this.children.length === 0) {
      child.startTime = this.startTime;
    } else {
      child.startTime = Date.now();
      let lastChild = this.children[this.children.length - 1];
      if (!lastChild.endTime) {
        lastChild.endTime = child.startTime;
      }
    }

    this.children.push(child);

    return child;
  }

  async withSubStep(message: string, cb: (step: IStep) => Promise<any>, options?: LogOptions) {
    this.startTime = Date.now();

    const child = new Step(message, this.logHelper);
    if (this.children.length === 0) {
      child.startTime = this.startTime;
    } else {
      child.startTime = Date.now();
      let lastChild = this.children[this.children.length - 1];
      if (!lastChild.endTime) {
        lastChild.endTime = child.startTime;
      }
    }

    this.children.push(child);

    if (!options) {
      options = <LogOptions>{ takeScreenShot: false };
    }
    try {
      const ret = await cb(child);
      child.status = Status.PASSED;
      return ret;
    } catch (error) {
      child.status = Status.FAILED;
      options.takeScreenShot = false;
      throw error;
    } finally {
      child.endTime = Date.now();
      if (options.takeScreenShot) {
        child.screenshotPath = await child.logHelper.takeScreenShot();
      }
      console.log(`${new Date(child.startTime).toLocaleString()} [${child.status}] ${child.message} (${child.endTime - child.startTime}ms)`);
    }
  }
}

export class LogOptions {
  takeScreenShot?: boolean;
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
