/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-03-12 16:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import moment from 'moment';
import { gitCommitInfo } from './commitInfo';

async function fetchVersionInfo() {
  const versionInfos = (await import(/*
    webpackChunkName: "versionInfo" */ './versionInfo.json'))
    .data;

  let { buildTime, buildVersion, deployedTime, deployedVersion } = versionInfos;

  let { buildCommit, deployedCommit } = versionInfos;

  const envBuildTime = process
    ? formatDate(process.env.BUILD_TIME as string)
    : +new Date();

  buildTime =
    buildTime !== '{{buildTime}}'
      ? (formatDate(Number(buildTime)) as string)
      : (envBuildTime as string);
  deployedTime =
    deployedTime !== '{{deployedTime}}'
      ? (formatDate(Number(deployedTime)) as string)
      : (envBuildTime as string);

  let lastCommitHash: string = '';
  if (gitCommitInfo.commitInfo && gitCommitInfo.commitInfo.length) {
    lastCommitHash = gitCommitInfo.commitInfo[0].commitHash;
  }

  buildCommit =
    buildCommit !== '{{buildCommit}}' ? buildCommit : lastCommitHash;
  deployedCommit =
    deployedCommit !== '{{deployedCommit}}' ? deployedCommit : lastCommitHash;

  const envBuildVersion = process ? (process.env.APP_VERSION as string) : '';

  if (envBuildVersion !== '') {
    buildVersion =
      buildVersion !== '{{buildVersion}}' ? buildVersion : envBuildVersion;
    deployedVersion =
      deployedVersion !== '{{deployedVersion}}'
        ? deployedVersion
        : envBuildVersion;
  }
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
  return moment(date).format('YYYY-DD-MM hh:mm:ss');
}

export { formatDate, fetchVersionInfo };
