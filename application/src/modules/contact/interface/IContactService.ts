/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-20 18:56:05
 * Copyright © RingCentral. All rights reserved.
 */
import { createDecorator } from 'framework/ioc';

const IContactService = createDecorator('IContactService');

interface IContactService {
  getCurrentUrl(): string;
}

export { IContactService };
