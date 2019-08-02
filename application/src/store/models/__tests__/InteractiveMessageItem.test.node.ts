/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-05-03 10:12:47
 * Copyright © RingCentral. All rights reserved.
 */
import InteractiveMessageItemModel from '../InteractiveMessageItem';

describe('InteractiveMessageItemModel', () => {
  describe('constructor', () => {
    const InteractiveMessageItemData = {
      attachments: [],
      company_id: 44466177,
      created_at: 1555605156458,
      creator_id: 3,
      deactivated: false,
      group_ids: [2794389510],
      is_new: true,
      model_size: 0,
      modified_at: 1555605156458,
      post_ids: [9093234515972],
      title: null,
      type_id: 45,
      version: 458051186327552,
      id: 34481717293,
    };
    it('should have correct text data - 1', () => {
      const model = InteractiveMessageItemModel.fromJS(
        InteractiveMessageItemData,
      );
      expect(model.text).toEqual('');
    });
    it('should have correct text data - 2', () => {
      InteractiveMessageItemData['title'] = 'test_title';
      const model = InteractiveMessageItemModel.fromJS(
        InteractiveMessageItemData,
      );
      expect(model.text).toEqual('test_title');
    });
    it('should have correct text data - 3', () => {
      InteractiveMessageItemData['title'] = '';
      InteractiveMessageItemData['attachments'] = [
        {
          attachment_type: 'default',
          author_link: 'https://git.ringcentral.com/Glip/glip-request',
          author_name: 'Glip/glip-request',
          color: '#42a84d',
          fallback: '',
          fields: [],
          pretext: 'New version available',
        },
      ];
      const model = InteractiveMessageItemModel.fromJS(
        InteractiveMessageItemData,
      );
      expect(model.text).toEqual('New version available');
    });
  });
});
