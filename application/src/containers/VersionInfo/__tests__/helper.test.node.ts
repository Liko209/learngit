/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-03-13 10:00:02
 * Copyright © RingCentral. All rights reserved.
 */
import { formatDate, formatVersionInfo } from '../helper';

describe('VersionInfoHelper', () => {
  describe('formatDate()', () => {
    it('should be format date correct in beijing time', () => {
      const zeroTimestamp = 0;
      const ZeroTimestampInBeijingTime = '1970-01-01 08:00:00';
      expect(formatDate(zeroTimestamp)).toEqual(ZeroTimestampInBeijingTime);
    });

    it('should format 24 hour time', () => {
      const timestamp = 1552553559631;
      const timestampInBeijingTime = '2019-03-14 16:52:39';
      expect(formatDate(timestamp)).toEqual(timestampInBeijingTime);
    });
  });

  describe('formatVersionInfo()', () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...OLD_ENV };
      delete process.env.NODE_ENV;
    });

    afterEach(() => {
      process.env = OLD_ENV;
    });

    it('should return the version info when version json file is not rewrite', () => {
      jest.doMock('../versionInfo.json');
      jest.doMock('../commitInfo.ts', () => {
        const gitCommitInfo = {
          commitInfo: [
            {
              date: '2019-03-14 16:52:39',
              commitHash: '6c2946a',
            },
          ],
        };
        return { gitCommitInfo };
      });
      const versionInfo = require('../versionInfo.json').data;
      const { gitCommitInfo } = require('../commitInfo.ts');

      const envAppVersion = '1.1.1';
      const envBuildTime = '2019-03-14 18:01:39';
      process.env = {
        APP_VERSION: envAppVersion,
        BUILD_TIME: envBuildTime,
      };
      const version = formatVersionInfo(versionInfo);

      expect(version.buildTime).toEqual(envBuildTime);
      expect(version.buildVersion).toEqual(envAppVersion);
      expect(version.buildCommit).toEqual(
        gitCommitInfo.commitInfo[0].commitHash,
      );
    });

    it('should return the version info when version json file is be rewrite', () => {
      const timestamp = 1552553559631;
      const timestampInBeijingTime = '2019-03-14 16:52:39';
      const commit = '6c2946a';
      const appVersion = '1.1.1';
      jest.doMock('../versionInfo.json', () => {
        return {
          data: {
            buildTime: timestamp,
            buildCommit: commit,
            buildVersion: appVersion,
            deployedTime: timestamp,
            deployedCommit: commit,
            deployedVersion: appVersion,
          },
        };
      });
      const versionInfo = require('../versionInfo.json').data;
      const version = formatVersionInfo(versionInfo);

      expect(version.buildTime).toEqual(timestampInBeijingTime);
      expect(version.deployedTime).toEqual(timestampInBeijingTime);
      expect(version.buildCommit).toEqual(commit);
      expect(version.deployedCommit).toEqual(commit);
      expect(version.buildVersion).toEqual(appVersion);
      expect(version.deployedVersion).toEqual(appVersion);
    });
  });
});
