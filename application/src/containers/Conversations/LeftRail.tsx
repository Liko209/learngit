import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Divider, styled } from 'ui-components';

import { LeftRailPresenter } from './LeftRailPresenter';
import { ConversationSection, ConversationSectionPresenter } from './sections';
import { transformGroupSortKey } from './transformFunc';

type IProps = {} & RouteComponentProps<any>;

export type ISection = {
  title: string;
  iconName: string;
  sortable?: boolean;
  expanded?: boolean;
  presenter: ConversationSectionPresenter;
};

const Container = styled.div`
  height: 100%;
  overflow: auto;
  border-right: 1px solid ${({ theme }) => theme.palette.divider};
`;

class LeftRail extends Component<IProps> {
  presenter: LeftRailPresenter;
  sections: ISection[];

  constructor(props: IProps) {
    super(props);
    this.presenter = new LeftRailPresenter();
    this.sections = this.presenter.sections.map(({ entity, queryType, transformFunc, ...rest }) => ({
      presenter: new ConversationSectionPresenter({
        entity,
        queryType,
        transformFunc: transformFunc || transformGroupSortKey,
      }),
      ...rest,
    }));
  }

  render() {
    return (
      <Container>
        {this.sections.map(({ title, iconName, sortable, presenter }, index) => [
          index ? <Divider key="divider" /> : null,
          <ConversationSection key="section" title={title} iconName={iconName} sortable={sortable} presenter={presenter} />,
        ])}
      </Container>
    );
  }

}

export default withRouter(LeftRail);
