import { PERMISSION_ENUM } from './constants';
type TeamSetting = {
  name?: string;
  description?: string;
  isPublic?: boolean;
  permissionMap?: TeamPermissionMap;
};

type TeamPermissionMap = { [key in PERMISSION_ENUM]?: boolean };

export { TeamSetting, TeamPermissionMap };
