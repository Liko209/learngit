/*
 * @Author: wayne.zhou
 * @Date: 2019-05-08 23:01:16
 * Copyright © RingCentral. All rights reserved.
 */
import './jest/setup/console';
import './jest/setup/timezone';
import './jest/setup/mobx';
import './jest/setup/styledTheme';
import './jest/setup/media';

jest.mock('@/modules/common/util/lazyComponent');
jest.mock('@/containers/ThemeProvider');
jest.mock('@/modules/router/container/AuthRoute/AuthRoute');
