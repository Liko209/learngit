/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-29 11:22:13
 * Copyright © RingCentral. All rights reserved.
 */
import { test, testable } from 'shield';
import { mockEntity } from 'shield/application';
import { mockService } from 'shield/sdk';
import { RCInfoService } from 'sdk/module/rcInfo';

import { E911ViewModel } from '../E911.ViewModel';

jest.mock('@/containers/Notification');

describe('E911ViewModel', () => {
  function createUserInfo(value: any = {}) {
    return {
      value,
    };
  }

  @testable
  class disabled {
    @test('should be false if some need check field is undefined')
    @mockEntity(
      createUserInfo({
        street: 'street',
      }),
    )
    t1() {
      const vm = new E911ViewModel({});
      expect(vm.disabled).toBeTruthy();
    }

    @test('should be check state if state api return name iso and id')
    @mockEntity(
      createUserInfo({
        country: 'country',
        customerName: 'customerName',
        street: 'street',
        city: 'city',
        zip: 'zip',
      }),
    )
    @mockService(RCInfoService, 'getStateList', [
      {
        id: 'id',
        isoCode: 'isoCode',
        name: 'name',
      },
    ])
    async t2() {
      const vm = new E911ViewModel({});
      await vm.getState('1');
      expect(vm.disabled).toBeFalsy();
    }

    @test('should be true if has all check field')
    @mockEntity(
      createUserInfo({
        country: 'country',
        customerName: 'customerName',
        street: 'street',
        city: 'city',
        zip: 'zip',
      }),
    )
    t3() {
      const vm = new E911ViewModel({});
      expect(vm.disabled).toBeFalsy();
    }

    @test('should be check stateName if state api only return name')
    @mockEntity(
      createUserInfo({
        country: 'country',
        customerName: 'customerName',
        street: 'street',
        city: 'city',
        zip: 'zip',
      }),
    )
    @mockService(RCInfoService, 'getStateList', [
      {
        id: 1,
        name: 'name',
      },
    ])
    async t4() {
      const vm = new E911ViewModel({});
      await vm.getState('1');
      expect(vm.disabled).toBeFalsy();
    }
  }

  @testable
  class getState {
    @test('should be call saveStateOrCountry if state list length > 0')
    @mockEntity(createUserInfo())
    @mockService(RCInfoService, 'getStateList', [1])
    async t1() {
      const vm = new E911ViewModel({});
      jest.spyOn(vm, 'saveStateOrCountry');
      await vm.getState('1');
      expect(vm.stateList).toEqual([1]);
      expect(vm.saveStateOrCountry).toHaveBeenCalledWith('state', 1);
    }

    @test('should not call saveStateOrCountry if state list length === 0')
    @mockEntity(createUserInfo())
    @mockService(RCInfoService, 'getStateList', [])
    async t2() {
      const vm = new E911ViewModel({});
      jest.spyOn(vm, 'saveStateOrCountry');
      await vm.getState('1');
      expect(vm.stateList).toEqual([]);
      expect(vm.saveStateOrCountry).not.toHaveBeenCalled();
    }
  }

  @testable
  class getCountryInfo {
    @test(
      'should be saveStateOrCountry with user setting if user has been setting',
    )
    @mockEntity(
      createUserInfo({
        countryName: 'countryName',
      }),
    )
    @mockService(RCInfoService, [
      {
        method: 'getCountryList',
        data: [
          {
            id: 1,
            name: 'countryName',
          },
        ],
      },
    ])
    async t1() {
      const vm = new E911ViewModel({});
      jest.spyOn(vm, 'saveStateOrCountry').mockImplementation();
      jest.spyOn(vm, 'getState').mockImplementation();
      await vm.getCountryInfo();
      expect(vm.countryList).toEqual([
        {
          id: 1,
          name: 'countryName',
        },
      ]);
      expect(vm.saveStateOrCountry).toHaveBeenCalledWith('country', {
        id: 1,
        name: 'countryName',
      });
      expect(vm.getState).toHaveBeenCalledWith(1);
    }
  }

  @testable
  class countryOnChange {
    @test('should be get state if country change')
    @mockEntity(createUserInfo())
    @mockService(RCInfoService, [
      {
        method: 'getCountryList',
        data: [
          {
            id: 1,
            name: 'countryList',
          },
        ],
      },
      {
        method: 'getCurrentCountry',
        data: {},
      },
    ])
    async t1() {
      const vm = new E911ViewModel({});
      jest.spyOn(vm, 'saveStateOrCountry').mockImplementation();
      jest.spyOn(vm, 'getState').mockImplementation();
      await vm.getCountryInfo();
      await vm.countryOnChange({ target: { value: 'countryList' } } as any);
      expect(vm.saveStateOrCountry).toHaveBeenCalledWith('country', {
        id: 1,
        name: 'countryList',
      });
      expect(vm.getState).toHaveBeenCalledWith(1);
    }
  }

  @testable
  class stateOnChange {
    @test('should be save state if state change')
    @mockEntity(createUserInfo())
    @mockService(RCInfoService, 'getStateList', [
      {
        name: 'state',
      },
    ])
    async t1() {
      const vm = new E911ViewModel({});
      jest.spyOn(vm, 'saveStateOrCountry');
      await vm.getState('1');
      expect(vm.saveStateOrCountry).toHaveBeenCalledWith('state', {
        name: 'state',
      });
    }
  }

  @testable
  class saveStateOrCountry {
    @test('should be save state if state change')
    @mockEntity(createUserInfo())
    t1() {
      const vm = new E911ViewModel({});
      vm.saveStateOrCountry('state', {
        id: 'id',
        name: 'name',
        isoCode: 'isoCode',
      });
      expect(vm.value).toMatchObject({
        state: 'isoCode',
        stateName: 'name',
        stateId: 'id',
        stateIsoCode: 'isoCode',
      });
    }

    @test('should be name if state not isoCode')
    @mockEntity(createUserInfo())
    t2() {
      const vm = new E911ViewModel({});
      vm.saveStateOrCountry('state', {
        id: 'id',
        name: 'name',
      });
      expect(vm.value).toMatchObject({
        state: undefined,
        stateName: 'name',
        stateId: 'id',
        stateIsoCode: undefined,
      });
    }
  }

  @testable
  class handleFieldChange {
    @test('should be save value if field change')
    @mockEntity(createUserInfo())
    t1() {
      const vm = new E911ViewModel({});
      vm.handleFieldChange('customerName')({
        target: { value: 'customerName' },
      } as any);
      expect(vm.value.customerName).toBe('customerName');
    }
  }

  const valueSetter = jest.fn();

  @testable
  class onSubmit {
    @test('should be save value if field change')
    @mockEntity({
      valueSetter,
    })
    t1() {
      const vm = new E911ViewModel({});
      vm.onSubmit();
      expect(valueSetter).toHaveBeenCalledWith(vm.value);
    }
  }
});
