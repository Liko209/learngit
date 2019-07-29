/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-04-29 16:15:19
 * Copyright © RingCentral. All rights reserved.
 */

import IntegrationItemModel from '../IntegrationItem';

describe('IntegrationItemModel', () => {
  describe('constructor', () => {
    const IntegrationItemData = {
      activity: 'Incident Feedback',
      body:
        'Download debug data at FileStack: https://cdn.filestackcontent.com/rdjf18QSG6flzx2PmiBU',
      company_id: 44466177,
      created_at: 1556371685882,
      creator_id: 3,
      deactivated: false,
      group_ids: [4499677190],
      icon:
        'https://cdn3.iconfinder.com/data/icons/basic-filled/80/76_BO_info-128.png',
      integration_id: 257589275,
      integration_owner_id: 999751683,
      is_new: true,
      model_size: 0,
      modified_at: 1556371685882,
      post_ids: [9259543797764],
      title: 'marul.mehta@terafinainc.com report incident: 5BD0ABA4',
      type_id: 7000,
      version: 6569129102278656,
      id: 122386692952,
    };
    it('should have correct data', () => {
      const model = IntegrationItemModel.fromJS(IntegrationItemData);
      expect(model.activity).toEqual('Incident Feedback');
      expect(model.text).toEqual(
        `${IntegrationItemData.title}${IntegrationItemData.body}`,
      );
    });
  });
});
