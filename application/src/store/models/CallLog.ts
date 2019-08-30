/*
 * @Author: isaac.liu
 * @Date: 2019-06-03 14:23:11
 * Copyright © RingCentral. All rights reserved.
 */

import { observable } from 'mobx';
import { CallLog } from 'sdk/module/RCItems/callLog/entity/CallLog';

import Base from './Base';

export default class CallLogModel extends Base<CallLog, string> {
  @observable uri: CallLog['uri'];
  @observable sessionId: CallLog['sessionId'];
  @observable from: CallLog['from'];
  @observable to: CallLog['to'];
  @observable type: CallLog['type'];
  @observable direction: CallLog['direction'];
  @observable action: CallLog['action'];
  @observable result: CallLog['result'];
  @observable reason: CallLog['reason'];
  @observable startTime: CallLog['startTime'];
  @observable duration: CallLog['duration'];
  @observable recording: CallLog['recording'];
  @observable lastModifiedTime: CallLog['lastModifiedTime'];
  @observable transport: CallLog['transport'];
  @observable extension: CallLog['extension'];
  @observable delegate: CallLog['delegate'];
  @observable legs: CallLog['legs'];
  @observable message: CallLog['message'];
  @observable deleted: CallLog['deleted'];
  @observable timestamp: CallLog['__timestamp'];
  @observable isPseudo: CallLog['__isPseudo'];
  constructor(data: CallLog) {
    super(data);

    const {
      uri,
      sessionId,
      from,
      to,
      type,
      direction,
      action,
      result,
      reason,
      startTime,
      duration,
      recording,
      lastModifiedTime,
      transport,
      extension,
      delegate,
      legs,
      message,
      deleted,
      __timestamp,
      __isPseudo,
    } = data;

    this.uri = uri;
    this.sessionId = sessionId;
    this.from = from;
    this.to = to;
    this.type = type;
    this.direction = direction;
    this.action = action;
    this.result = result;
    this.reason = reason;
    this.startTime = startTime;
    this.duration = duration;
    this.recording = recording;
    this.lastModifiedTime = lastModifiedTime;
    this.transport = transport;
    this.extension = extension;
    this.delegate = delegate;
    this.legs = legs;
    this.message = message;
    this.deleted = deleted;
    this.timestamp = __timestamp;
    this.isPseudo = __isPseudo;
  }

  static fromJS(data: CallLog) {
    return new CallLogModel(data);
  }
}
