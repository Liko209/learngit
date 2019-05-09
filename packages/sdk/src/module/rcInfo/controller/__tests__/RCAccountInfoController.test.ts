/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-04-30 14:20:40
 * Copyright © RingCentral. All rights reserved.
 */

import { RCAccountInfoController } from '../RCAccountInfoController';
import { RCInfoFetchController } from '../RCInfoFetchController';
import { CompanyService } from '../../../company';
import { RCBrandType } from '../../types';
import { ServiceLoader } from '../../../serviceLoader';
import { RC_BRAND_IDS } from '../constants';

jest.mock('../../../serviceLoader');
jest.mock('../../../company');
jest.mock('../RCInfoFetchController');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('', () => {
  let companyService: CompanyService;
  let rcAccountInfoController: RCAccountInfoController;
  let rcInfoFetchController: RCInfoFetchController;

  const validAccountInfo = {
    outboundCallPrefix: '7',
    mainNumber: '18801785164',
    serviceInfo: {
      brand: {
        id: '1210',
        homeCountry: {
          callingCode: '86',
          id: '1',
          isoCode: 'CN',
          name: 'China',
          uri:
            'https://api-xmnup.lab.nordigy.ru/restapi/v1.0/dictionary/country/1',
        },
      },
      uri:
        'https://api-xmnup.lab.nordigy.ru/restapi/v1.0/account/279967004/service-info',
    },
  };
  const inValidAccountInfo = { brand: {} };
  function setUp() {
    companyService = new CompanyService();
    ServiceLoader.getInstance = jest.fn().mockReturnValue(companyService);
    rcInfoFetchController = new RCInfoFetchController();
    rcAccountInfoController = new RCAccountInfoController(
      rcInfoFetchController,
    );
  }

  beforeEach(() => {
    clearMocks();
  });

  describe('getBrandID2Type', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });
    it.each`
      brandId   | brandType
      ${'1210'} | ${RCBrandType.RINGCENTRAL}
      ${'3710'} | ${RCBrandType.RINGCENTRAL_UK}
      ${'3420'} | ${RCBrandType.ATT}
      ${'7310'} | ${RCBrandType.TELUS}
      ${'1234'} | ${RCBrandType.OTHER}
    `('should return expected type for $brandId', ({ brandId, brandType }) => {
      expect(rcAccountInfoController.getBrandID2Type(brandId)).toEqual(
        brandType,
      );
    });
  });

  describe('getAccountBrandId', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return brand id in account info when has it ', async () => {
      rcInfoFetchController.getRCAccountInfo = jest
        .fn()
        .mockResolvedValue(validAccountInfo);
      const result = await rcAccountInfoController.getAccountBrandId();
      expect(result).toEqual(validAccountInfo.serviceInfo.brand.id);
    });

    it('should return brand id in company when has no in account info ', async () => {
      rcInfoFetchController.getRCAccountInfo = jest
        .fn()
        .mockResolvedValue(inValidAccountInfo);

      companyService.getBrandType = jest.fn().mockResolvedValue('RC');
      const result = await rcAccountInfoController.getAccountBrandId();
      expect(result).toEqual(RC_BRAND_IDS.RINGCENTRAL);
    });
  });

  describe('getOutboundCallPrefix', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it.each`
      ocp     | result
      ${'1'}  | ${'\0'}
      ${'2'}  | ${'2'}
      ${'3'}  | ${'3'}
      ${'4'}  | ${'4'}
      ${'5'}  | ${'5'}
      ${'6'}  | ${'6'}
      ${'7'}  | ${'7'}
      ${'8'}  | ${'8'}
      ${'9'}  | ${'9'}
      ${'10'} | ${'\0'}
    `(
      'should return ocp as $result when ocp is $ocp',
      async ({ ocp, result }) => {
        const info = { ...validAccountInfo };
        info.outboundCallPrefix = ocp;
        rcInfoFetchController.getRCAccountInfo = jest
          .fn()
          .mockResolvedValue(info);
        const rOCP = await rcAccountInfoController.getOutboundCallPrefix();
        expect(rOCP).toEqual(result);
      },
    );
  });

  describe('getAccountMainNumber', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return main number in the account info', async () => {
      rcInfoFetchController.getRCAccountInfo = jest
        .fn()
        .mockResolvedValue(validAccountInfo);
      const result = await rcAccountInfoController.getAccountMainNumber();
      expect(result).toEqual(validAccountInfo.mainNumber);
    });

    it('should return undefined when has no account info', async () => {
      rcInfoFetchController.getRCAccountInfo = jest
        .fn()
        .mockResolvedValue(inValidAccountInfo);
      const result = await rcAccountInfoController.getAccountMainNumber();
      expect(result).toEqual(undefined);
    });
  });

  describe('getHomeCountry', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return home country info if has account info', async () => {
      rcInfoFetchController.getRCAccountInfo = jest
        .fn()
        .mockResolvedValue(validAccountInfo);
      const result = await rcAccountInfoController.getHomeCountry();
      expect(result).toEqual(validAccountInfo.serviceInfo.brand.homeCountry);
    });

    it('should return undefined info if has no account info ', async () => {
      rcInfoFetchController.getRCAccountInfo = jest
        .fn()
        .mockResolvedValue(inValidAccountInfo);
      const result = await rcAccountInfoController.getHomeCountry();
      expect(result).toEqual(undefined);
    });
  });
});
