/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-04-02 09:41:46
 * Copyright © RingCentral. All rights reserved.
 */

const { exec } = require('child_process');
const Async = require('async');
const fs = require('fs');

class GitLogMessage {
  constructor(message) {
    this.rawMessage = message;
    const messageArr = this.rawMessage.split('|');
    [
      this.treeHash,
      this.author,
      this.date,
      this.subject,
      this.commitHash
    ] = messageArr;
  }
}

class GitRepo {
  constructor() {
    this.srcDir = null;
  }

  getSrcDir() {
    return this.srcDir;
  }

  ensureSrcPath(callback) {
    exec('pwd', (error, stdout, stderr) => {
      if (error) {
        console.log(`GitRepo could not run pwd: ${error}`);
        return callback(error);
      } else if (stderr) {
        console.log(`GitRepo run pwd returned an errro: ${stderr}`);
        return callback(stderr);
      }
      console.log(stdout);
      this.srcDir = stdout.trim('\n');
      return callback(null);
    });
  }

  getLastNCommits(n, callback) {
    Async.series([this.ensureSrcPath.bind(this)], err => {
      if (err) {
        return callback(err);
      }
      const gitCommitLine = `cd ${
        this.srcDir
      } && git log -n ${n} --pretty=format:"%t|%an|%ad|%s|%h"`;
      return exec(gitCommitLine, (error, stdout, stderr) => {
        if (error) {
          console.log(`run ${gitCommitLine} ${error}`);
          return callback(error);
        } else if (stderr) {
          console.log(`run ${gitCommitLine} return ${stderr}`);
          return callback(stderr);
        } else if (stdout) {
          const logMessage = stdout.split('\n');
          const result = logMessage.map(item => new GitLogMessage(item));
          return callback(null, result);
        }
        return callback('No output from command');
      });
    });
  }

  getLastCommit(callback) {
    Async.series([this.ensureSrcPath.bind(this)], error => {
      if (error) {
        return callback(error);
      }
      return this.getLastNCommits(1, (err, commits) => {
        const commit = commits ? commits[0] : null;
        return callback(err, commit);
      });
    });
  }

  getBranchNameFromEnv(callback) {
    const gitCommitLine = 'echo $gitlabSourceBranch';
    return exec(gitCommitLine, (error, stdout, stderr) => {
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

  getBranchNameFromGit(callback) {
    if (this.branchName) {
      return callback(null);
    }
    const gitCommitLine = `cd ${this.srcDir} && git branch | grep "*"`;
    return exec(gitCommitLine, (error, stdout, stderr) => {
      if (error) {
        return callback(error);
      } else if (stderr) {
        return callback(stderr);
      } else if (stdout) {
        console.log('getBranchNameFromGit:', stdout);
        this.branchName = stdout.replace(/^\* (.*)\n/, '$1');
        return callback(null, this.branchName);
      }
      return callback('No output from command');
    });
  }

  getCurrentBranch(callback) {
    Async.series(
      [
        this.ensureSrcPath.bind(this),
        this.getBranchNameFromEnv.bind(this),
        this.getBranchNameFromGit.bind(this)
      ],
      error => {
        if (error) {
          return callback('No output from command');
        }
        return callback(null, this.branchName);
      }
    );
  }
}

class RunGitInfoIntoFile {
  constructor() {
    this.gitRepo = new GitRepo();
  }
  run() {
    Async.series(
      [
        this.getCurrentBranch.bind(this),
        this.getLast3Commits.bind(this),
        this.writeInfoToFile.bind(this)
      ],
      error => {
        console.log(`RunGitInfoIntoFile ${error}`);
      }
    );
  }

  getCurrentBranch(callback) {
    this.gitRepo.getCurrentBranch((error, branchName) => {
      if (error) {
        return callback(error);
      }
      this.currentBranch = branchName;
      return callback(null);
    });
  }

  getLast3Commits(callback) {
    this.gitRepo.getLastNCommits(3, (error, commits) => {
      if (error) {
        return callback(error);
      }
      this.commits = commits;
      return callback(null);
    });
  }

  writeInfoToFile(callback) {
    let info = '/* eslint-disable */ \n\n';
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
    this.srcDir = `${this.gitRepo.getSrcDir()}/commitInfo.js`;
    fs.writeFile(`${this.srcDir}`, info, err => {
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
