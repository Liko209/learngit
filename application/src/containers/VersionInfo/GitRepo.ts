/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-04-02 09:41:46
 * Copyright © RingCentral. All rights reserved.
 */
// tslint:disable:no-console
const { exec } = require('child_process');
const Async = require('async');
const fs = require('fs');

class GitLogMessage {
  rawMessage: string;
  treeHash: string;
  author: string;
  date: string;
  subject: string;
  commitHash: string;
  constructor(message: string) {
    this.rawMessage = message;
    const messageArr = this.rawMessage.split('|');
    this.treeHash = messageArr[0];
    this.author = messageArr[1];
    this.date = messageArr[2];
    this.subject = messageArr[3];
    this.commitHash = messageArr[4];
  }
}

class GitRepo {
  private branchName: string;
  private srcDir: string;
  constructor() {
    this.srcDir = '';
  }

  getSrcDir() {
    return this.srcDir;
  }

  ensureSrcPath(callback: Function) {
    exec('pwd', (error: any, stdout: any, stderr: any) => {
      if (error) {
        console.log(`GitRepo could not run pwd: ${error}`);
        return callback(error);
      }
      if (stderr) {
        console.log(`GitRepo run pwd returned an error: ${stderr}`);
        return callback(stderr);
      }
      console.log(stdout);
      this.srcDir = stdout.trim('\n');
      return callback(null);
    });
  }

  getLastNCommits(n: number, callback: Function) {
    Async.series([this.ensureSrcPath.bind(this)], (err: any) => {
      if (err) {
        return callback(err);
      }
      const gitCommitLine = `cd ${
        this.srcDir
      } && git log -n ${n} --pretty=format:"%t|%an|%ad|%s|%h"`;
      return exec(gitCommitLine, (error: any, stdout: any, stderr: any) => {
        if (error) {
          console.log(`run ${gitCommitLine} ${error}`);
          return callback(error);
        }
        if (stderr) {
          console.log(`run ${gitCommitLine} return ${stderr}`);
          return callback(stderr);
        }
        if (stdout) {
          const logMessage = stdout.split('\n');
          const result = logMessage.map((item: string) => {
            const str = item.replace(/(['"])/g, '\\$1');
            return new GitLogMessage(str);
          });
          return callback(null, result);
        }
        return callback('No output from command');
      });
    });
  }

  getLastCommit(callback: Function) {
    Async.series([this.ensureSrcPath.bind(this)], (error: any) => {
      if (error) {
        return callback(error);
      }
      return this.getLastNCommits(1, (err: any, commits: GitLogMessage[]) => {
        const commit = commits ? commits[0] : null;
        return callback(err, commit);
      });
    });
  }

  getBranchNameFromEnv(callback: Function) {
    const gitCommitLine = 'echo $gitlabSourceBranch';
    return exec(gitCommitLine, (error: any, stdout: any, stderr: any) => {
      if (error || stderr) {
        console.log('error');
        return callback(null);
      }
      if (stdout && stdout.trim() !== '') {
        console.log('getBranchNameFromEnv:', stdout);
        this.branchName = stdout.trim();
      }
      return callback(null);
    });
  }

  getBranchNameFromGit(callback: Function) {
    if (this.branchName) {
      return callback(null);
    }
    const gitCommitLine = `cd ${this.srcDir} && git branch | grep "*"`;
    return exec(gitCommitLine, (error: any, stdout: any, stderr: any) => {
      if (error) {
        return callback(error);
      }
      if (stderr) {
        return callback(stderr);
      }
      if (stdout) {
        console.log('getBranchNameFromGit:', stdout);
        this.branchName = stdout.replace(/^\* (.*)\n/, '$1');
        return callback(null, this.branchName);
      }
      return callback('No output from command');
    });
  }

  getCurrentBranch(callback: Function) {
    Async.series(
      [
        this.ensureSrcPath.bind(this),
        this.getBranchNameFromEnv.bind(this),
        this.getBranchNameFromGit.bind(this),
      ],
      (error: any) => {
        if (error) {
          return callback('No output from command');
        }
        return callback(null, this.branchName);
      },
    );
  }
}

class RunGitInfoIntoFile {
  private gitRepo: GitRepo;
  private currentBranch: string;
  private commits: GitLogMessage[];
  private srcDir: string;
  constructor() {
    this.gitRepo = new GitRepo();
  }
  run() {
    Async.series(
      [
        this.getCurrentBranch.bind(this),
        this.getLast3Commits.bind(this),
        this.writeInfoToFile.bind(this),
      ],
      (error: any) => {
        console.log(`RunGitInfoIntoFile ${error}`);
      },
    );
  }

  getCurrentBranch(callback: Function) {
    this.gitRepo.getCurrentBranch((error: any, branchName: string) => {
      if (error) {
        return callback(error);
      }
      this.currentBranch = branchName;
      return callback(null);
    });
  }

  getLast3Commits(callback: Function) {
    this.gitRepo.getLastNCommits(3, (error: any, commits: GitLogMessage[]) => {
      if (error) {
        return callback(error);
      }
      this.commits = commits;
      return callback(null);
    });
  }

  writeInfoToFile(callback: Function) {
    let info = '/* tslint:disable */ \n\n';
    info += 'export const gitCommitInfo = { \n';
    info += `currentBranch: '${this.currentBranch}',\n`;
    info += 'commitInfo:\n[';
    for (let i = 0; i < this.commits.length; i += 1) {
      const commit = this.commits[i];
      const keys = Object.keys(commit);
      info += '{\n';
      for (let j = 0; j < keys.length; j += 1) {
        info += `\t${keys[j]}: "${commit[keys[j]]}",\n`;
      }
      info += '},\n';
    }
    info += ']}';
    this.srcDir = `${this.gitRepo.getSrcDir()}/commitInfo.ts`;
    fs.writeFile(`${this.srcDir}`, info, (err: any) => {
      if (err) {
        console.error(`write commit info to file error ${err}`);
        return callback(err);
      }
      console.log('write file success');
      return callback(null);
    });
  }
}

const run = new RunGitInfoIntoFile();
run.run();
