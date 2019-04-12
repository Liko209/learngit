import { PERMISSION_ENUM, GROUP_CAN_NOT_SHOWN_REASON } from './constants';
type TeamSetting = {
  name?: string;
  description?: string;
  isPublic?: boolean;
  permissionFlags?: PermissionFlags;
};
type PermissionKeys = keyof typeof PERMISSION_ENUM;
type PermissionFlags = { [KEY in PermissionKeys]?: boolean };

type GroupCanBeShownResponse = {
  canBeShown: boolean;
  reason?: GROUP_CAN_NOT_SHOWN_REASON;
};

export {
  TeamSetting,
  PermissionKeys,
  PermissionFlags,
  GroupCanBeShownResponse,
};
