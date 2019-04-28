/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-08-30 08:40:59
 * Copyright © RingCentral. All rights reserved.
 */

import '@storybook/addon-storysource/register';
import '@storybook/addon-actions/register';
import '@storybook/addon-notes/register';
import '@storybook/addon-knobs/register';
import '@storybook/addon-backgrounds/register';
import '@storybook/addon-a11y/register';

import addHeadWarning from './head-warning';

addHeadWarning('manager-head-not-loaded', 'Manager head not loaded');
