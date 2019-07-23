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
import './jest/setup/selection';
import './jest/setup/promise';

jest.mock('@/modules/common/util/lazyComponent');
jest.mock('@/containers/ThemeProvider');
jest.mock('jui/components/Tabs/Tabs');
jest.mock('jui/components/AutoSizer/AutoSizer');
jest.mock('jui/components/VirtualizedList/InfiniteList');
jest.mock('jui/hoc/withDelay/withDelay');
// jest.mock('jui/foundation/Iconography/Iconography');
// jest.mock('jui/components/Buttons/IconButton/IconButton');

jest.setTimeout(30 * 1000);
