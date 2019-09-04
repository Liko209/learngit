import { FileShareAction } from '../FileShareAction.view';
import { shallow } from 'enzyme';
import React from 'react';
import * as errorHandler from '@/common/catchError';

describe('FileShareAction', () => {
  describe('shareToConversation', () => {
    let view;
    beforeAll(() => {
      jest.spyOn(errorHandler, 'wrapHandleError').mockImplementation();
      view = shallow(<FileShareAction fileId={0} groupId={0} postId={0} />);
    });
    it('should catch network error and backend error[JPT-2819] [JPT-2821] ', () => {
      expect(errorHandler.wrapHandleError).toHaveBeenCalled();
    });
  });
});
