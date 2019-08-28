import { errorHandler } from '../errorHandler';
import { ERROR_CODES_SDK } from 'sdk/error';

describe('errorHandler', () => {
  it('should catch when file is deleted [JPT-2832]', () => {
    expect(errorHandler({ code: ERROR_CODES_SDK.ITEM_DEACTIVATED })).toBe(
      'shareFileDeleted',
    );
  });
  it('should catch when conversation is archived [JPT-2816]', () => {
    expect(errorHandler({ code: ERROR_CODES_SDK.GROUP_ARCHIVED })).toBe(
      'shareFileTeamArchived',
    );
  });
  it('should catch when conversation is deleted [JPT-2816]', () => {
    expect(errorHandler({ code: ERROR_CODES_SDK.GROUP_DEACTIVATED })).toBe(
      'shareFileTeamDeleted',
    );
  });
  it('should catch when current user is not the member [JPT-2816]', () => {
    expect(errorHandler({ code: ERROR_CODES_SDK.GROUP_NOT_MEMBER })).toBe(
      'shareFileNotMember',
    );
  });
  it('should catch when current user has no permission [JPT-2816]', () => {
    expect(errorHandler({ code: ERROR_CODES_SDK.GROUP_NO_PERMISSION })).toBe(
      'shareFileNoAuth',
    );
  });
});
