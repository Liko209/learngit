/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-10 19:29:47
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';

const MODEL_MAP = {
  Call: require('../models/Call'),
  CallLog: require('../models/CallLog'),
  CodeIte: require('../models/CodeItem'),
  Company: require('../models/Company'),
  ConferenceItem: require('../models/ConferenceItem'),
  EventItem: require('../models/EventItem'),
  FileItem: require('../models/FileItem'),
  Group: require('../models/Group'),
  GroupConfig: require('../models/GroupConfig'),
  GroupState: require('../models/GroupState'),
  IntegrationItem: require('../models/IntegrationItem'),
  InteractiveMessageItem: require('../models/InteractiveMessageItem'),
  Item: require('../models/Item'),
  LinkItem: require('../models/LinkItem'),
  MeetingItem: require('../models/MeetingItem'),
  MyState: require('../models/MyState'),
  NoteItem: require('../models/NoteItem'),
  Person: require('../models/Person'),
  PhoneNumber: require('../models/PhoneNumber'),
  Post: require('../models/Post'),
  Presence: require('../models/Presence'),
  Profile: require('../models/Profile'),
  Progress: require('../models/Progress'),
  TaskItem: require('../models/TaskItem'),
  UserPermission: require('../models/UserPermission'),
  UserSetting: require('../models/UserSetting'),
  Voicemail: require('../models/Voicemail'),
};

class ModelProvider {
  private _ModelCreator: object;
  constructor() {
    this._ModelCreator = {};
  }

  getModelCreator(name: string) {
    let Creator = this._ModelCreator[name];
    if (!Creator) {
      Creator = MODEL_MAP[_.upperFirst(name)].default;
      this._ModelCreator[name] = Creator;
    }
    return Creator;
  }
}

export default ModelProvider;
