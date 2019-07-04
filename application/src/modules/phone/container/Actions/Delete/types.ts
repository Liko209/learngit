/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-05-24 07:28:07
 * Copyright © RingCentral. All rights reserved.
 */
import { BUTTON_TYPE } from 'jui/pattern/Phone/VoicemailItem';
import { ENTITY_TYPE } from '../../constants';

type DeleteProps = {
  id: number | string;
  type: BUTTON_TYPE;
};

type DeleteViewProps = {
  type: BUTTON_TYPE;
  entity: ENTITY_TYPE;
  deleteCallLog: () => Promise<any>;
  deleteVoicemail: () => Promise<any>;
};

export { DeleteProps, DeleteViewProps };
