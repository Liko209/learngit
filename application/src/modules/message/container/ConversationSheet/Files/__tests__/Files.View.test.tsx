/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-03-18 15:06:10
 * Copyright © RingCentral. All rights reserved.
 */
import { testable, test } from 'shield';
import React from 'react';
import { shallow } from 'enzyme';
import { container } from 'framework/ioc';
import { Jupiter } from 'framework/Jupiter';
import { FilesView } from '../Files.View';
import {
  JuiPreviewImage,
  JuiFileWithPreview,
  FileCard,
} from 'jui/pattern/ConversationCard/Files';
import { ImageCard } from 'jui/pattern/ConversationCard/Files/style';
import { config } from '@/modules/viewer/module.config';
import * as Viewer from '@/modules/viewer/container/ViewerView';
import { VIEWER_SERVICE } from '@/modules/viewer/interface';

const jupiter = container.get(Jupiter);
jupiter.registerModule(config);
jest.mock('@/modules/viewer/container/ViewerView');
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
            ready: false,
            downloadUrl: 'downloadUrl',
          },
        },
      ],
      [],
      [],
    ],
    urlMap: { get: () => '1' },
    getFilePreviewBackgroundContainPermission: { get: () => false },
    isRecentlyUploaded: () => false,
    getCropImage: () => null,
    getShowDialogPermission: () => true,
  };

  @testable.skip
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
        .find(ImageCard)
        .simulate('click', mockEvent);

      setTimeout(() => {
        expect(Viewer.showImageViewer).toHaveBeenCalled();
        done();
      }, 0);
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
        .find(ImageCard)
        .simulate('click', mockEvent);

      setTimeout(() => {
        expect(Viewer.showImageViewer).not.toHaveBeenCalled();
        done();
      }, 0);
    }
  }

  let viewerService: any;
  const someFilesProps = {
    files: [
      [],
      [
        {
          item: {
            origHeight: 0,
            id: 1,
            origWidth: 0,
            name: '0',
            type: 'doc',
            latestVersion: {
              status: 'ready',
            },
            downloadUrl: 'downloadUrl',
          },
        },
      ],
      [],
    ],
    urlMap: { get: () => '1' },
    isRecentlyUploaded: () => false,
    getCropImage: () => null,
    getShowDialogPermission: () => true,
    getFilePreviewBackgroundContainPermission: { get: () => false },
  };
  @testable
  class _handleFileClick {
    beforeEach() {
      viewerService = container.get(VIEWER_SERVICE);

      jest.spyOn(viewerService, 'open').mockImplementationOnce(() => {});
    }
    @test(
      'should the file types support in the full-screen viewer if [JPT-2036]',
    )
    t1(done: jest.DoneCallback) {
      const props: any = {
        ...someFilesProps,
        postId: 1,
      };
      const wrapper = shallow(<FilesView {...props} />);
      wrapper
        .find(JuiFileWithPreview)
        .shallow()
        .find(FileCard)
        .simulate('click', mockEvent);
      setTimeout(() => {
        expect(viewerService.open).toHaveBeenCalled();
        done();
      }, 0);
    }

    @test('should the user should not be able to open file when [JPT-2166]')
    t2(done: jest.DoneCallback) {
      const props: any = {
        ...someFilesProps,
        progresses: { get: () => 1 },
      };
      props.files[1][0].item.latestVersion.status = 'first_page_ready';
      const wrapper = shallow(<FilesView {...props} />);
      wrapper
        .find(JuiFileWithPreview)
        .shallow()
        .find(FileCard)
        .simulate('click', mockEvent);

      setTimeout(() => {
        expect(viewerService.open).not.toHaveBeenCalled();
        done();
      }, 0);
    }

    @test('should the user should able to open file when file status no ready but item.ready is true')
    t2(done: jest.DoneCallback) {
      const props: any = {
        ...someFilesProps,
        progresses: { get: () => 1 },
      };
      props.files[1][0].item.latestVersion.status = 'first_page_ready';
      props.files[1][0].item.latestVersion.ready = true;
      const wrapper = shallow(<FilesView {...props} />);
      wrapper
        .find(JuiFileWithPreview)
        .shallow()
        .find(FileCard)
        .simulate('click', mockEvent);

      setTimeout(() => {
        expect(viewerService.open).toHaveBeenCalled();
        done();
      }, 0);
    }
  }
});
