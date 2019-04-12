/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-03-12 16:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import moment from 'moment';
import { gitCommitInfo } from './commitInfo';

type versionInfoType = {
  buildTime: string | number;
  buildCommit: string;
  buildVersion: string;
  deployedTime: string | number;
  deployedCommit: string;
  deployedVersion: string;
};

async function fetchVersionInfo() {
  const versionInfo = (await import(/*
    webpackChunkName: "versionInfo" */ './versionInfo.json'))
    .data;
  return formatVersionInfo(versionInfo);
}

function formatVersionInfo(versionInfo: versionInfoType) {
  let {
    buildTime,
    buildCommit,
    buildVersion,
    deployedTime,
    deployedCommit,
    deployedVersion,
  } = versionInfo;

  let commitInfo = {
    date: '',
    commitHash: '',
  };

  if (gitCommitInfo.commitInfo && gitCommitInfo.commitInfo.length) {
    commitInfo = gitCommitInfo.commitInfo[0];
  }

  const envBuildTime = process.env.BUILD_TIME
    ? formatDate(process.env.BUILD_TIME as string)
    : commitInfo.date;

  buildTime =
    buildTime !== '{{buildTime}}'
      ? (formatDate(Number(buildTime)) as string)
      : (envBuildTime as string);
  deployedTime =
    deployedTime !== '{{deployedTime}}'
      ? (formatDate(Number(deployedTime)) as string)
      : (envBuildTime as string);

  const lastCommitHash: string = commitInfo.commitHash;

  buildCommit =
    buildCommit !== '{{buildCommit}}' ? buildCommit : lastCommitHash;
  deployedCommit =
    deployedCommit !== '{{deployedCommit}}' ? deployedCommit : lastCommitHash;

  const envBuildVersion = process.env.APP_VERSION
    ? (process.env.APP_VERSION as string)
    : '';

  buildVersion =
    buildVersion !== '{{buildVersion}}' ? buildVersion : envBuildVersion;
  deployedVersion =
    deployedVersion !== '{{deployedVersion}}'
      ? deployedVersion
      : envBuildVersion;

  return {
    buildCommit,
    buildVersion,
    deployedCommit,
    deployedVersion,
    buildTime,
    deployedTime,
  };
}

function formatDate(date: string | number) {
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
}

export { versionInfoType, formatDate, fetchVersionInfo, formatVersionInfo };
