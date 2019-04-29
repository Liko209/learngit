/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-01-21 13:01:55
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { CodeSnippetView } from '../CodeSnippetItem.View';
import copy from 'copy-to-clipboard';
import { shallow } from 'enzyme';

jest.mock('copy-to-clipboard');

describe('CodeSnippetItem.View', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleCopy()', () => {
    const token = Date.now().toString();
    const props = {
      postItem: {
        title: '',
        body: token,
        mode: '',
        mimeType: '',
        wrapLines: false,
      },
    };
    it('should call copy when called', () => {
      const codeSnippet = new CodeSnippetView(props);
      codeSnippet.handleCopy();
      expect(copy).toBeCalledWith(token);
    });
  });

  describe('Expand/Collapse', () => {
    const token = Date.now().toString();
    const props: any = {
      postItem: {
        title: '',
        body: token,
        mode: '',
        mimeType: '',
        wrapLines: false,
      },
    };
    it('should get the initial value from vm on mounted', () => {
      props.isCollapse = false;
      let codeSnippet = shallow(<CodeSnippetView {...props} />);
      expect(codeSnippet.state().isCollapse).toBe(false);

      props.isCollapse = true;
      codeSnippet = shallow(<CodeSnippetView {...props} />);
      expect(codeSnippet.state().isCollapse).toBe(true);
    });
    it('should update state if vm updated', () => {
      props.isCollapse = true;
      const codeSnippet = shallow(<CodeSnippetView {...props} />);
      expect(codeSnippet.state().isCollapse).toBe(true);

      codeSnippet.setProps({ isCollapse: false });
      expect(codeSnippet.state().isCollapse).toBe(false);
    });
    it('should update vm on user toggle on view', () => {
      props.isCollapse = true;
      props.setCollapse = jest.fn();
      const codeSnippet = shallow(<CodeSnippetView {...props} />);
      const component: CodeSnippetView = codeSnippet.instance();

      component.handleExpand();
      expect(component.state.isCollapse).toBeFalsy();
      expect(component.props.setCollapse).toHaveBeenCalledWith(false);

      component.handleCollapse();
      expect(component.state.isCollapse).toBeTruthy();
      expect(component.props.setCollapse).toHaveBeenCalledWith(true);
    });
  });
});
