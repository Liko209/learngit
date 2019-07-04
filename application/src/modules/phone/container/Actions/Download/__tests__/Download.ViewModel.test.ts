/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-06-03 14:23:02
 * Copyright © RingCentral. All rights reserved.
 */

import { testable, test } from 'shield';
import { mockEntity } from 'shield/application';
import { mockService } from 'shield/sdk';
import { VoicemailService } from 'sdk/module/RCItems/voicemail';
import { ATTACHMENT_TYPE } from 'sdk/module/RCItems/constants';
import { BUTTON_TYPE } from 'jui/pattern/Phone/VoicemailItem';
import { URI_CONTENT_DISPOSITION_ATTACHMENT } from '../constants';
import { DownloadViewModel } from '../Download.ViewModel';

const mockEntityData = {
  attachments: [
    {
      uri: 'uri',
      type: ATTACHMENT_TYPE.AUDIO_RECORDING,
    },
  ],
};

describe('DownloadViewModel', () => {
  @testable
  class deleteVoicemail {
    @test('should return correct download url if getUri [JPT-2245]')
    @mockEntity(mockEntityData)
    @mockService(VoicemailService, 'buildDownloadUrl', 'downloadUrl')
    async t1() {
      const vm = new DownloadViewModel({ id: 2031622, type: BUTTON_TYPE.ICON });
      const uri = await vm.getUri();
      expect(uri).toContain(`downloadUrl${URI_CONTENT_DISPOSITION_ATTACHMENT}`);
    }
  }
});
