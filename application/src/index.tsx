/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-07 11:28:43
 * Copyright © RingCentral. All rights reserved.
 */
import 'reflect-metadata';
import './polyfill';
import { container } from 'framework/ioc';
import { Application } from './Application';

container.get(Application).run();
