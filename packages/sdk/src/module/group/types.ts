import { PERMISSION_ENUM } from './constants';
type TeamSetting = {
  name?: string;
  description?: string;
  isPublic?: boolean;
  permissionFlags?: PermissionFlags;
};
type PermissionKeys = keyof typeof PERMISSION_ENUM;
type PermissionFlags = { [KEY in PermissionKeys]?: boolean };

export { TeamSetting, PermissionKeys, PermissionFlags };
