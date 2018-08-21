import React from 'react';
import { observer } from 'mobx-react';
import {
  ConversationListSection,
  Icon,
  ConversationList,
} from 'ui-components';
import TeamListPresenter from './TeamListPresenter';
import ConversationListItemCell from './ConversationListItemCell';
import { ENTITY_NAME } from '../../store';
interface IProps {

}

interface IState {
  groups: Group[];
}

interface Group {
  id: number;
  display_name: string;
  is_team: boolean;
  members: number[];
}

@observer
class TeamSection extends React.Component<IProps, IState> {
  static defaultProps = {
    expanded:true,
  };
  teamPresenter: TeamListPresenter;
  constructor(props: IProps) {
    super(props);
    this.teamPresenter = new TeamListPresenter();
  }

  componentDidMount() {
    this.teamPresenter.fetchData();
  }

  renderTeamList() {
    const store = this.teamPresenter.getStore();
    const ids = store.getIds();
    return (
      <ConversationList>
        {ids.map(id => (
          <ConversationListItemCell id={id} key={id} entityName={ENTITY_NAME.GROUP} />
        ))}
      </ConversationList>
    );
  }

  render() {
    return (
      <div data-anchor="teamSection">
        <ConversationListSection
          icon={<Icon>S</Icon>}
          title={'Teams'}
          expanded={true}
        >
        {this.renderTeamList()}
        </ConversationListSection>
      </div >
    );
  }
}

export default TeamSection;
