import { ERROR_CODES_SDK } from 'sdk/error';

const errorHandler = (e: any) => {
  let message;
  switch (e.code) {
    case ERROR_CODES_SDK.POST_DEACTIVATED:
    case ERROR_CODES_SDK.ITEM_DEACTIVATED:
      message = 'shareFileDeleted';
      break;
    case ERROR_CODES_SDK.GROUP_ARCHIVED:
      message = 'shareFileTeamArchived';
      break;
    case ERROR_CODES_SDK.GROUP_DEACTIVATED:
      message = 'shareFileTeamDeleted';
      break;
    case ERROR_CODES_SDK.GROUP_NOT_MEMBER:
      message = 'shareFileNotMember';
      break;
    case ERROR_CODES_SDK.GROUP_NO_PERMISSION:
      message = 'shareFileNoAuth';
      break;
    default:
      throw e;
  }
  return message;
};
export { errorHandler };
