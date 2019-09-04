import { FileActionMenuView } from '../FileActionMenu';
import { getFileType } from '@/common/getFileType';
import { shallow } from 'enzyme';
import React from 'react';
import { FileType } from '@/store/models/FileItem';

jest.mock('@/common/getFileType');

describe('FileActionMenu', () => {
  it('should render correctly', () => {
    getFileType = jest.fn().mockReturnValue({ type: FileType.image });
    const wrapper = shallow(
      <FileActionMenuView
        fileId={1}
        scene="conversationHistory"
        item={{} as any}
        fileName={'filename'}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('should not render viewInBrowser when item is not image', () => {
    getFileType = jest.fn().mockReturnValue({ type: '' });
    const wrapper = shallow(
      <FileActionMenuView
        fileId={1}
        scene="conversationHistory"
        item={{} as any}
        fileName={'filename'}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
