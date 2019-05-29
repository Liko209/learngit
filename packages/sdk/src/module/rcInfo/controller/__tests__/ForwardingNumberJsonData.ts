/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-05-28 14:21:45
 * Copyright © RingCentral. All rights reserved.
 */

const ForwardingNumberJsonData = {
  uri:
    'https://platform.ringcentral.com/restapi/v1.0/account/404611540004/extension/404611540004/forwarding-number?page=1&perPage=100',
  records: [
    {
      id: '417276280004',
      phoneNumber: '+16502095678',
      label: 'Mobile',
      type: 'Mobile',
      features: ['CallFlip', 'CallForwarding'],
      flipNumber: '1',
    },
    {
      id: '417276281004',
      phoneNumber: '+16502090011',
      label: 'Home',
      type: 'Home',
      features: ['CallFlip'],
      flipNumber: '2',
    },
    {
      id: '417276282004',
      phoneNumber: '+16502096235',
      label: 'Work',
      type: 'Work',
      features: ['CallForwarding'],
      flipNumber: '3',
    },
  ],
  paging: {
    page: 1,
    totalPages: 1,
    perPage: 100,
    totalElements: 3,
    pageStart: 0,
    pageEnd: 2,
  },
  navigation: {
    firstPage: {
      uri:
        'https://platform.ringcentral.com/restapi/v1.0/account/404611540004/extension/404611540004/forwarding-number?page=1&perPage=100',
    },
    lastPage: {
      uri:
        'https://platform.ringcentral.com/restapi/v1.0/account/404611540004/extension/404611540004/forwarding-number?page=1&perPage=100',
    },
  },
};

export { ForwardingNumberJsonData };
