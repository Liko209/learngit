/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-03-18 15:06:10
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { shallow } from 'enzyme';
import { FilesView } from '../Files.View';
import { JuiPreviewImage } from 'jui/pattern/ConversationCard/Files';
import * as Viewer from '@/containers/Viewer';

const someProps = {
  files: [
    [
      {
        item: {
          origHeight: 0,
          id: 1,
          origWidth: 0,
          name: '0',
          downloadUrl: 'downloadUrl',
        },
      },
    ],
    [],
    [],
  ],
  urlMap: { get: () => 1 },
  isRecentlyUploaded: () => false,
  getCropImage: () => null,
  getShowDialogPermission: () => true,
};

jest.mock('@/containers/Viewer');
describe('FilesView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Viewer, 'showImageViewer').mockImplementationOnce(() => {});
  });

  describe('render()', () => {
    it('should call showImageViewer function when has postId > 0', (done: jest.DoneCallback) => {
      const props: any = {
        ...someProps,
        postId: 1,
      };
      const wrapper = shallow(<FilesView {...props} />);
      wrapper
        .find(JuiPreviewImage)
        .shallow()
        .find('img')
        .simulate('click', { stopPropagation: () => undefined });

      setTimeout(() => {
        expect(Viewer.showImageViewer).toHaveBeenCalled();
        done();
      },         0);
    }, 2);
    it('should not call showImageViewer function when has postId < 0', (done: jest.DoneCallback) => {
      const props: any = {
        ...someProps,
        postId: -1,
        progresses: { get: () => 1 },
      };
      const wrapper = shallow(<FilesView {...props} />);
      wrapper
        .find(JuiPreviewImage)
        .shallow()
        .find('img')
        .simulate('click', { stopPropagation: () => undefined });

      setTimeout(() => {
        expect(Viewer.showImageViewer).not.toHaveBeenCalled();
        done();
      },         0);
    }, 2);
  });
});
