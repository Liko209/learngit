/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-04-09 17:00:02
 * Copyright © RingCentral. All rights reserved.
 */

import { versionInfoType } from '../helper';

type electronVersionInfoType = {
  electronVersion: string;
  electronAppVersion: string;
};

type LoginVersionStatusProps = {
  versionInfo: versionInfoType;
};

type LoginVersionStatusViewProps = {
  versionInfo: versionInfoType;
  electronVersionInfo: electronVersionInfoType;
};

export {
  LoginVersionStatusProps,
  LoginVersionStatusViewProps,
  versionInfoType,
  electronVersionInfoType,
};
