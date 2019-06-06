/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-03-18 15:06:10
 * Copyright © RingCentral. All rights reserved.
 */
import { testable, test } from 'shield';
import React from 'react';
import { shallow } from 'enzyme';
import { container, Jupiter } from 'framework';
import { FilesView } from '../Files.View';
import {
  JuiPreviewImage,
  StyledImg,
  JuiFileWithPreview,
  FileCardMedia,
} from 'jui/pattern/ConversationCard/Files';
import { config } from '@/modules/viewer/module.config';
import * as Viewer from '@/modules/viewer/container/Viewer';
import { ViewerService } from '@/modules/viewer/service';
import { VIEWER_SERVICE } from '@/modules/viewer/interface';

const jupiter = container.get(Jupiter);
jupiter.registerModule(config);
jest.mock('@/modules/viewer/container/Viewer');
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
    urlMap: { get: () => '1' },
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
        .find(StyledImg)
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
            versions: [
              {
                status: 'ready',
              },
            ],
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
        .find(FileCardMedia)
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
        postId: -1,
        progresses: { get: () => 1 },
      };
      props.files[1][0].item.type = 'ppt';
      const wrapper = shallow(<FilesView {...props} />);
      wrapper
        .find(JuiFileWithPreview)
        .shallow()
        .find(FileCardMedia)
        .simulate('click', mockEvent);

      setTimeout(() => {
        expect(viewerService.open).not.toHaveBeenCalled();
        done();
      }, 0);
    }
  }
});
