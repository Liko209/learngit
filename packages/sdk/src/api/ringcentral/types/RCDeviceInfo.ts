/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-07-25 11:01:06
 * Copyright © RingCentral. All rights reserved.
 */
import { ICountryInfo, PagingInfo, INavigationInfo } from './common';

type IDeviceRequest = {
  linePooling: string;
};

type AddressInfo = {
  street: string;
  street2: string;
  city: string;
  state: string;
  stateId: string;
  stateIsoCode: string;
  stateName: string;
  country: string;
  countryId: string;
  countryIsoCode: string;
  countryName: string;
  zip: string;
  customerName: string;
  outOfCountry: boolean;
};

type DeviceExtension = {
  uri: string;
  id: string;
  extensionNumber: string;
};

type EmergencyAddressInfo = {
  required: boolean;
  localOnly: boolean;
};

type DevicePhoneInfo = {
  id: number;
  phoneNumber: string;
  paymentType: string;
  type: string;
  usageType: string;
  country: ICountryInfo;
};

type DevicePhoneLine = {
  lineType: string;
  emergencyAddress: EmergencyAddressInfo;
  phoneInfo: DevicePhoneInfo;
};

type ShippingMethod = {
  id: string;
  name: string;
};

type ShippingInfo = {
  address: AddressInfo;
  method: ShippingMethod;
  status: string;
};

type DeviceRecord = {
  uri: string;
  id: string;
  type: string;
  sku: string;
  name: string;
  status: string;
  extension: DeviceExtension;
  phoneLines: DevicePhoneLine[];
  emergencyServiceAddress: AddressInfo;
  shipping: ShippingInfo;
  linePooling: string;
};

type DeviceInfo = {
  uri: string;
  records: DeviceRecord[];
  paging: PagingInfo;
  navigation: INavigationInfo;
};

type IAssignLineRequest = {
  emergencyServiceAddress: AddressInfo;
  originalDeviceId: string;
};

type IUpdateLineRequest = {
  emergencyServiceAddress: AddressInfo;
};

export {
  IDeviceRequest,
  DeviceInfo,
  DeviceRecord,
  IAssignLineRequest,
  AddressInfo,
  IUpdateLineRequest,
};
