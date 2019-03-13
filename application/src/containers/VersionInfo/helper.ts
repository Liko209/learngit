/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-03-12 16:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import moment from 'moment';

async function fetchVersionInfo() {
  const versionInfos = (await import(/*
    webpackChunkName: "versionInfo" */ './versionInfo.json'))
    .data;

  const {
    buildCommit,
    buildVersion,
    deployCommit,
    deployVersion,
  } = versionInfos;

  const { buildTime, deployTime } = versionInfos;

  const formatBuildTime = formatDate(Number(buildTime));
  const formatDeployTime = formatDate(Number(deployTime));

  return {
    buildCommit,
    buildVersion,
    deployCommit,
    deployVersion,
    buildTime: formatBuildTime,
    deployTime: formatDeployTime,
  };
}

function formatDate(date: string | number) {
  return moment(date).format('YYYY-DD-MM hh:mm:ss');
}

export { formatDate, fetchVersionInfo };
