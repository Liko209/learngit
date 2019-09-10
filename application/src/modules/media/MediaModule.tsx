/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-06-24 10:00:00
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractModule } from 'framework/AbstractModule';
import { Utils } from './Utils';

class MediaModule extends AbstractModule {
  bootstrap() {
    Utils.safariAudioPolicyHandler();
  }
}

export { MediaModule };
