/*
 * @Author: wayne.zhou
 * @Date: 2019-05-08 23:01:16
 * Copyright © RingCentral. All rights reserved.
 */
import './jest/setup/setupConsole';
import './jest/setup/setupTimezone';
import './jest/setup/setupMobx';
import './jest/setup/setupStyledTheme';

jest.mock('@/modules/common/util/lazyComponent');
jest.mock('@/containers/ThemeProvider');
jest.mock('@/modules/router/container/AuthRoute/AuthRoute');
