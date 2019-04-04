import { GlipSdk } from './sdk/glip';
import { RcPlatformSdk } from './sdk/platform';
import { LogHelper } from './helpers/log-helper';
import * as format from 'string-format';

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
  description?: string;
  status?: Status;
  startTime?: number;
  endTime?: number;
  screenshotPath?: string;
  attachments?: string[];
  needDescription?: boolean;
  children?: Array<IStep>;
  logHelper?: LogHelper;

  putMetadata(key: string, value: any);

  newChildStep(message, args?: { [key: string]: any }): IStep;

  withLog(cb: (step: IStep) => Promise<any>, options: LogOptions);
}

export class Step implements IStep {
  message: string;
  metadata?: { [key: string]: string };
  description?: string;
  status?: Status;
  startTime?: number;
  endTime?: number;
  screenshotPath?: string;
  attachments?: string[];
  needDescription: boolean;
  children?: Array<IStep>;
  logHelper?: LogHelper;

  constructor(message: string, args: { [key: string]: any }, logHelper: LogHelper) {
    this.logHelper = logHelper;
    this.metadata = Object.assign({}, args);
    this.message = message.replace(/\{/g, '[').replace(/\}/g, ']');
    this.description = format(message.replace(/\$\{/g, '{'), this.metadata);
    this.children = new Array();
    if (Object.keys(this.metadata).length > 0) {
      this.needDescription = true;
    } else {
      this.needDescription = false
    }
  }

  putMetadata(key: string, value: string) {
    this.metadata[key] = value;
  }

  newChildStep(message, args?: { [key: string]: any }): IStep {
    const child = new Step(message, args, this.logHelper);
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

  async withLog(cb: (step: IStep) => Promise<any>, options?: LogOptions) {
    this.startTime = Date.now();
    if (!options) {
      options = <LogOptions>{ takeScreenShot: false };
    }
    try {
      const ret = await cb(this);
      this.status = Status.PASSED;
      return ret;
    } catch (error) {
      this.status = Status.FAILED;
      options.takeScreenShot = false;
      throw error;
    } finally {
      this.endTime = Date.now();
      if (options.takeScreenShot) {
        this.screenshotPath = await this.logHelper.takeScreenShot();
      }
      console.log(`${new Date(this.startTime).toLocaleString()} [${this.status}] ${this.message} (${this.endTime - this.startTime}ms)`);
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
