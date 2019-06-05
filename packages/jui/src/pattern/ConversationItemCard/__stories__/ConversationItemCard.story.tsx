/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-07 10:23:13
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { text, object, boolean } from '@storybook/addon-knobs';
import Checkbox from '@material-ui/core/Checkbox';
import styled from '../../../foundation/styled-components';
import { JuiConversationItemCard } from '../';
import {
  JuiCodeSnippetBody,
  JuiTaskSectionOrDescription,
  JuiLabelWithContent,
  JuiTimeMessage,
  JuiEventLocation,
  JuiEventDescription,
  JuiTaskAvatarNames,
  JuiSectionDivider,
} from '../ConversationItemCardBody';
import { JuiExpandImage, JuiFileWrapper } from '../../ConversationCard/Files';
import { JuiTaskCheckbox } from '../ConversationItemCardHeader';
import { JuiMessageAttachment } from '../MessageAttachment';
import { JuiIntegrationItemView } from '../IntegrationItem';

const CheckboxTest = styled(Checkbox)`
  && {
    padding: 0;
    font-size: 20px;
  }
`;

const Wrapper = styled.div``;

storiesOf('Pattern/ConversationItemCard', module)
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
              complete={false}
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
  })
  .add('Message Attachment', () => {
    const defaultMessage = {
      created_at: 1504835374770,
      creator_id: 3,
      version: 7278183275560960,
      model_size: 0,
      is_new: true,
      post_ids: [2541469081604],
      group_ids: [4499562502],
      company_id: 44466177,
      integration_owner_id: 1284579331,
      type_id: 7000,
      modified_at: 1504835374770,
      attachments: [
        {
          author_name: 'Stanford S. Strickland',
          color: '#F35A00',
          author_link: 'https://glip.com',
          author_icon:
            'https://glip-vault-1.s3.amazonaws.com/web/customer_files/181022089228/modified.jpg?Expires=2075494478&AWSAccessKeyId=AKIAJROPQDFTIHBTLJJQ&Signature=w7n54QiHZ5jNgQmIkbJz7Bobjk8=',
          fallback:
            'New ticket from Andrea Lee - Ticket #1943: Cannot reset my password - https://groove.hq/path/to/ticket/1943',
          fields: [
            { title: 'Volume', value: '1', short: true },
            { title: 'Issue', value: '3', short: true },
          ],
          footer: 'Glip Api',
          footer_icon:
            'https://glip-vault-1.s3.amazonaws.com/web/customer_files/181022089228/modified.jpg?Expires=2075494478&AWSAccessKeyId=AKIAJROPQDFTIHBTLJJQ&Signature=w7n54QiHZ5jNgQmIkbJz7Bobjk8=',
          image_url: 'https://i.imgur.com/OJkaVOI.jpg?1',
          pretext: 'New ticket from Andrea Lee',
          title: 'The Further Adventures of Slackbot',
          title_link: 'https://groove.hq/path/to/ticket/1943',
          text: 'This is some sample Text',
          ts: 1496881204783,
        },
      ],
      body:
        '* Location: [The Funky Buddha Lounge](http://www.thefunkybuddha.com)\n* Beer Advocate Rating: [99](http://tinyurl.com/psf4uzq)',
      title: 'Jeff is having a Maple Bacon Coffee Porter',
      activity: 'Beer consumed',
      integration_id: 260522011,
      deactivated: false,
      id: 45316086616,
    };
    const data = object('Message Attachment', defaultMessage) as any;
    return (
      <div style={{ border: '1px solid grey', minHeight: 400 }}>
        <JuiMessageAttachment {...data} />
      </div>
    );
  })
  .add('Integration Item', () => {
    const title = text(
      'Integration Item Title',
      '[Test5](https://app.asana.com/0/1120812751569696/1120812751569718)',
    );
    const body = text(
      'Integration Item Body',
      '**Project**\n[Test](https://app.asana.com/0/1120812751569696)',
    );
    return (
      <div style={{ border: '1px solid grey', minHeight: 400 }}>
        <JuiIntegrationItemView title={title} body={body} />
      </div>
    );
  })
  .add('eventItemCard', () => {
    return (
      <JuiConversationItemCard
        title="event"
        iconColor={['primary', '500']}
        Icon="event"
      >
        <JuiSectionDivider gap={2}>
          <JuiLabelWithContent label={'new event'}>
            <JuiTimeMessage time={`${new Date().toLocaleDateString()}`} />
          </JuiLabelWithContent>
          <JuiLabelWithContent label={'hahaha'}>
            <JuiEventLocation location={'no local'} />
          </JuiLabelWithContent>
          <JuiEventDescription> this is a test event</JuiEventDescription>
        </JuiSectionDivider>
      </JuiConversationItemCard>
    );
  })
  .add('taskItemCard', () => {
    const hasEndTime = boolean('hasEndTime', true);
    const hasEffectId = boolean('hasEffectID', true);
    const section = boolean('hasSection', true);
    const notes = boolean('hasNote', true);
    const files = boolean('hasFiles', true);
    const hasContent = hasEndTime || hasEffectId || section || notes || files;

    return (
      <JuiConversationItemCard
        contentHasPadding={!!hasContent}
        complete={false}
        title={'a task'}
        Icon={<JuiTaskCheckbox checked={false} />}
      >
        <JuiSectionDivider gap={2}>
          {hasEndTime && (
            <>
              <JuiLabelWithContent label={'due'}>
                <JuiTimeMessage time={`${new Date().toLocaleDateString()} `} />
              </JuiLabelWithContent>
            </>
          )}
          {hasEffectId && (
            <>
              <JuiLabelWithContent label={'assignee'}>
                <JuiTaskAvatarNames count={3} otherText={'3 others'}>
                  avatar name
                </JuiTaskAvatarNames>
              </JuiLabelWithContent>
            </>
          )}
          {section && (
            <JuiLabelWithContent label={'section'}>
              <JuiTaskSectionOrDescription>
                {'sdfoasdfmasdf asdfaosdf asdfasdf'}
              </JuiTaskSectionOrDescription>
            </JuiLabelWithContent>
          )}
          {notes && (
            <JuiLabelWithContent label={'descriptionNotes'}>
              <JuiTaskSectionOrDescription>
                {'sdfoasdfmasdf asdfaosdf asdfasdf'}
              </JuiTaskSectionOrDescription>
            </JuiLabelWithContent>
          )}
          {files && (
            <JuiLabelWithContent label={'files'}>
              <JuiFileWrapper>
                <JuiExpandImage
                  Actions={(() => ({})) as any}
                  previewUrl=""
                  icon={'doc'}
                  fileName={'filename'}
                  i18UnfoldLess={'common.collapse'}
                  i18UnfoldMore={'common.expand'}
                  defaultExpansionStatus={false}
                />
              </JuiFileWrapper>
            </JuiLabelWithContent>
          )}
        </JuiSectionDivider>
      </JuiConversationItemCard>
    );
  });
