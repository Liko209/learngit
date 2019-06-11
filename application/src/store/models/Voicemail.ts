/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-05-30 17:19:53
 * Copyright © RingCentral. All rights reserved.
 */

import { observable, computed } from 'mobx';
import { Voicemail } from 'sdk/module/RCItems/voicemail/entity/Voicemail';
import { RCMessage } from 'sdk/module/RCItems';

import Base from './Base';

export default class VoicemailModel extends Base<Voicemail> {
  @observable availability: Voicemail['availability'];
  @observable creationTime: Voicemail['creationTime'];
  @observable direction: Voicemail['direction'];
  @observable readStatus: Voicemail['readStatus'];
  @observable uri: Voicemail['uri'];
  @observable vmTranscriptionStatus: Voicemail['vmTranscriptionStatus'];
  @observable attachments: RCMessage['attachments'];
  @observable from: Voicemail['from'];
  @observable to: Voicemail['to'];

  constructor(data: Voicemail) {
    super(data);
    const {
      availability,
      creationTime,
      direction,
      readStatus,
      uri,
      from,
      to,
      vmTranscriptionStatus,
      attachments,
    } = data;

    this.availability = availability;
    this.creationTime = creationTime;
    this.direction = direction;
    this.readStatus = readStatus;
    this.uri = uri;
    this.from = from;
    this.to = to;
    this.vmTranscriptionStatus = vmTranscriptionStatus;
    this.attachments = attachments;
  }

  @computed
  get isBlock() {
    const { phoneNumber, name } = this.from;
    return !phoneNumber && !name;
  }

  static fromJS(data: Voicemail) {
    return new VoicemailModel(data);
  }
}
