/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-07 10:23:13
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import Checkbox from '@material-ui/core/Checkbox';
import styled from '../../../foundation/styled-components';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiConversationItemCard } from '../';
import { JuiCodeSnippetBody } from '../ConversationItemCardBody';

const CheckboxTest = styled(Checkbox)`
  && {
    padding: 0;
    font-size: 20px;
  }
`;

const Wrapper = styled.div``;

storiesOf('Pattern/ConversationItemCard', module)
  .addDecorator(withInfoDecorator(JuiConversationItemCard, { inline: true }))
  .add('JuiConversationItemCard', () => {
    class ConversationItem extends React.PureComponent<
      {},
      { checked: boolean }
    > {
      constructor(p: any) {
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
          <Wrapper>
            <JuiConversationItemCard title={'Event Name'} Icon={'event'}>
              content
            </JuiConversationItemCard>
            <JuiConversationItemCard
              complete={checked}
              title={'Event Name'}
              titleClick={this.onClick}
              Icon={<CheckboxTest checked={checked} disableRipple={true} />}
              Footer={<div>footer</div>}
            >
              content
            </JuiConversationItemCard>
          </Wrapper>
        );
      }
    }
    return <ConversationItem />;
  })
  .add('code snippet', () => {
    const StyledSampleCode = styled('div')`
      padding: 12px;
      white-space: pre-wrap;
      background: silver;
    `;

    const StyledCodeSnippetContainer = styled('div')`
      padding: 12px;
    `;
    class CodeSnippet extends React.PureComponent<{}> {
      render() {
        return (
          <StyledCodeSnippetContainer>
            <JuiConversationItemCard
              Icon="remove"
              title="haah"
              contentHasPadding={false}
              headerActions={[
                { iconName: 'copy', handler: () => {}, tooltip: 'copy' },
                {
                  iconName: 'download',
                  handler: () => {},
                  tooltip: 'download',
                },
              ]}
              showHeaderActions={true}
            >
              <JuiCodeSnippetBody
                hoverActions={[
                  { text: 'collapse', handler: () => {} },
                  { text: 'download to see more', handler: () => {} },
                ]}
              >
                <StyledSampleCode>
                  Contrary to popular belief, Lorem Ipsum is not simply random
                  text. It has roots in a piece of classical Latin literature
                  from 45 BC, making it over 2000 years old. Richard McClintock,
                  a Latin professor at Hampden-Sydney College in Virginia,
                  looked up one of the more obscure Latin words, consectetur,
                  from a Lorem Ipsum passage, and going through the cites of the
                  word in classical literature, discovered the undoubtable
                  source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of
                  "de Finibus Bonorum et Malorum" (The Extremes of Good and
                  Evil) by Cicero, written in 45 BC. This book is a treatise on
                  the theory of ethics, very popular during the Renaissance. The
                  first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..",
                  comes from a line in section 1.10.32. The standard chunk of
                  Lorem Ipsum used since the 1500s is reproduced below for those
                  interested. Sections 1.10.32 and 1.10.33 from "de Finibus
                  Bonorum et Malorum" by Cicero are also reproduced in their
                  exact original form, accompanied by English versions from the
                  1914 translation by H. Rackham. function () function ()
                  function () function ()
                </StyledSampleCode>
              </JuiCodeSnippetBody>
            </JuiConversationItemCard>
          </StyledCodeSnippetContainer>
        );
      }
    }

    return <CodeSnippet />;
  });
