/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-03-12 16:29:02
 * Copyright © RingCentral. All rights reserved.
 */
// import { handerTimeZoneOffset } from '@/utils/date/index.ts';

async function fetchVersionInfo() {
  const versionInfos = (await import('./versionInfo.json')).data;

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
  const d = date ? new Date(date) : new Date();
  let month = String(d.getMonth() + 1);
  let day = String(d.getDate());
  const year = d.getFullYear();
  let hours = String(d.getHours());
  let mins = String(d.getMinutes());
  let seconds = String(d.getSeconds());

  if (month.length < 2) month = `0${month}`;
  if (day.length < 2) day = `0${day}`;
  if (hours.length < 2) hours = `0${hours}`;
  if (mins.length < 2) mins = `0${mins}`;
  if (seconds.length < 2) seconds = `0${seconds}`;

  return `${[year, month, day].join('-')} ${[hours, mins, seconds].join(':')}`;
}

export { formatDate, fetchVersionInfo };
