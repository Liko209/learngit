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

  let {
    buildTime,
    buildVersion,
    deployTime,
    deployVersion,
  } = versionInfos;

  let { buildCommit, deployCommit } = versionInfos;

  const envBuildTime = process ? formatDate(process.env.BUILD_TIME as string) : +new Date();

  buildTime = buildTime !== '{{buildTime}}' ?
    formatDate(Number(buildTime)) as string : envBuildTime as string;
  deployTime = deployTime !== '{{deployTime}}' ?
    formatDate(Number(deployTime)) as string : envBuildTime as string;

  let lastCommitHash: string = '';
  if (gitCommitInfo.commitInfo && gitCommitInfo.commitInfo.length) {
    lastCommitHash = gitCommitInfo.commitInfo[0].commitHash;
  }

  buildCommit = buildCommit !== '{{buildCommit}}' ? buildCommit : lastCommitHash;
  deployCommit = deployCommit !== '{{deployCommit}}' ? deployCommit : lastCommitHash;

  const envBuildVersion = process ? process.env.APP_VERSION as string : '';

  if (envBuildVersion !== '') {
    buildVersion = buildVersion !== '{{buildVersion}}' ?
      buildVersion : envBuildVersion;
    deployVersion = deployVersion !== '{{deployVersion}}' ?
      deployVersion : envBuildVersion;
  }
  return {
    buildCommit,
    buildVersion,
    deployCommit,
    deployVersion,
    buildTime,
    deployTime,
  };
}

function formatDate(date: string | number) {
  return moment(date).format('YYYY-DD-MM hh:mm:ss');
}

export { formatDate, fetchVersionInfo };
