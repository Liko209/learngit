/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-07 10:23:13
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Fragment } from 'react';
import { storiesOf } from '@storybook/react';
import EventIcon from '@material-ui/icons/Event';
import Checkbox from '@material-ui/core/Checkbox';
import { boolean } from '@storybook/addon-knobs';
import styled from '../../../foundation/styled-components';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiConversationItemCard } from '../';

const CheckboxTest = styled(Checkbox)`
  && {
    padding: 0;
  }
`;

const Wrapper = styled.div`
  &.checked .itemTitle {
    text-decoration: line-through;
  }
`;

storiesOf('Pattern/ConversationItemCard', module)
  .addDecorator(withInfoDecorator(JuiConversationItemCard, { inline: true }))
  .add('JuiConversationItemCard', () => {
    class ConversationItem extends React.Component<{}, { checked: boolean }> {
      constructor(p) {
        super(p);
        this.state = {
          checked: false,
        };
      }

      onClick = () => {
        const { checked } = this.state;
        this.setState({
          checked: !checked,
        });
      }

      render() {
        const { checked } = this.state;

        return (
          <Wrapper className={checked ? 'checked' : ''}>
            <JuiConversationItemCard title={'Event Name'} icon={<EventIcon />}>
              content
            </JuiConversationItemCard>
            <JuiConversationItemCard
              title={'Event Name'}
              titleClick={this.onClick}
              classes={{
                itemTitle: 'itemTitle',
              }}
              icon={<CheckboxTest checked={checked} disableRipple={true} />}
              footer={<div>footer</div>}
            >
              content
            </JuiConversationItemCard>
          </Wrapper>
        );
      }
    }
    return <ConversationItem />;
  });
