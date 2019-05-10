/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-03-18 15:06:10
 * Copyright © RingCentral. All rights reserved.
 */
import { testable, test } from 'tests/integration-test';
import React from 'react';
import { shallow } from 'enzyme';
import { FilesView } from '../Files.View';
import { JuiPreviewImage, StyledImg } from 'jui/pattern/ConversationCard/Files';
import * as Viewer from '@/containers/Viewer';

jest.mock('@/containers/Viewer');
describe('FilesView', () => {
  const mockEvent = {
    stopPropagation: () => undefined,
    currentTarget: { querySelector: () => {} },
  };

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

  @testable
  class _handleImageClick {
    beforeEach() {
      jest.spyOn(Viewer, 'showImageViewer').mockImplementationOnce(() => {});
    }
    @test('should call showImageViewer function when has postId > 0')
    t1(done: jest.DoneCallback) {
      const props: any = {
        ...someProps,
        postId: 1,
      };
      const wrapper = shallow(<FilesView {...props} />);
      wrapper
        .find(JuiPreviewImage)
        .shallow()
        .find(StyledImg)
        .simulate('click', mockEvent);

      setTimeout(() => {
        expect(Viewer.showImageViewer).toHaveBeenCalled();
        done();
      },         0);
    }

    @test('should not call showImageViewer function when has postId < 0')
    t2(done: jest.DoneCallback) {
      const props: any = {
        ...someProps,
        postId: -1,
        progresses: { get: () => 1 },
      };
      const wrapper = shallow(<FilesView {...props} />);
      wrapper
        .find(JuiPreviewImage)
        .shallow()
        .find(StyledImg)
        .simulate('click', mockEvent);

      setTimeout(() => {
        expect(Viewer.showImageViewer).not.toHaveBeenCalled();
        done();
      },         0);
    }
  }
});
