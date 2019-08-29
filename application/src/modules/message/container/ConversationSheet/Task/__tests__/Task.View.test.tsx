/*
 * @Author: Looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-1-6 22:35:26
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { container } from 'framework/ioc';
import { Jupiter } from 'framework/Jupiter';
import { getEntity } from '@/store/utils';
import { TaskView } from '../Task.View';
import { shallow } from 'enzyme';
import { config } from '@/modules/viewer/module.config';
import { JuiTimeMessage } from 'jui/pattern/ConversationItemCard/ConversationItemCardBody';

const jupiter = container.get(Jupiter);
jupiter.registerModule(config);

jest.mock('@/store/utils');
jest.mock('i18next', () => ({
  t: (text: string) => text,
}));

describe('TaskView', () => {
  beforeAll(() => {
    (getEntity as jest.Mock).mockReturnValue({});
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('render()', () => {
    it('should date block empty when not date data [JPT-714]', () => {
      const props: any = {
        task: {
          color: '',
          complete: false,
          notes: '11',
          section: '11',
          repeat: '11',
          repeatEnding: '1546564919703',
          repeatEndingAfter: '1546564919703',
          repeatEndingOn: 1548259200000,
          text: '11',
          completeType: '11',
          assignedToIds: [],
          attachmentIds: [],
          completePeopleIds: [],
          completePercentage: 1,
          hasDueTime: true,
        },
        endTime: {
          get() {},
        },
      };
      const wrapper = shallow(<TaskView {...props} />);
      expect(wrapper.find(JuiTimeMessage)).not;
    });
  });
});
