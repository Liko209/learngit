/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-06-13 14:29:53
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { Async } from 'react-select';
import 'react-select/dist/react-select.css';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router';
import styled from 'styled-components';
import ErrorHandler from '@/containers/ErrorHandler';

import Modal from '@/components/Modal';
import Button from '@/components/Button';

import CreateTeamPresenter from './CreateTeamPresenter';
import { getName } from '../../utils/getName';
import { History } from 'history';
import { Group } from 'sdk/models';

interface Props {
  handleCloseModal: Function;
  showModal: boolean;
  groupId: number;
  members: number[];
  history: History;
}

const ButtonsWrapper = styled.div`
  display: flex;
  align-self: flex-end;
  margin-top: 30px;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;

const TeamName = styled.input`
  background-color: #fff;
  border-color: #d9d9d9 #ccc #b3b3b3;
  border-radius: 4px;
  border: 1px solid #ccc;
  color: #333;
  cursor: default;
  display: table;
  border-spacing: 0;
  border-collapse: separate;
  height: 36px;
  outline: none;
  overflow: hidden;
  position: relative;
  width: 100%;
  padding: 0 10px;
  margin-bottom: 20px;
`;
const TeamDescription = styled.textarea`
  background-color: #fff;
  border-color: #d9d9d9 #ccc #b3b3b3;
  border-radius: 4px;
  border: 1px solid #ccc;
  color: #333;
  cursor: default;
  display: table;
  border-spacing: 0;
  border-collapse: separate;
  outline: none;
  overflow: hidden;
  position: relative;
  width: 100%;
  padding: 10px;
  margin: 20px 0;
`;
const SwitchContainerWrapper = styled.div``;
const SwitchWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;
const SwitchLabel = styled.span``;
const SwitchValue = styled.input``;

@observer
class AddMemberModal extends Component<Props> {
  createTeamPresenter: CreateTeamPresenter;
  state = {
    selectedMembers: []
  };

  constructor(props: Props) {
    super(props);
    this.createTeamPresenter = new CreateTeamPresenter();
    this.getMembers = this.getMembers.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
    this.handleSwitchPermisson = this.handleSwitchPermisson.bind(this);
    this.handleTeamNameChange = this.handleTeamNameChange.bind(this);
    this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
  }

  handleTeamNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { value } = event.target;
    const { model } = this.createTeamPresenter;
    model.name = value;
  }

  handleDescriptionChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const { value } = event.target;
    const { model } = this.createTeamPresenter;
    model.description = value;
  }

  handleSelectionChange(selectedMembers: { value: number; label: string }[]) {
    this.setState({ selectedMembers });
  }

  getMembers(input: string) {
    const { currentUserId } = this.createTeamPresenter;

    if (!input) {
      return Promise.resolve({ options: [] });
    }

    return this.createTeamPresenter.fetchSearch(input).then(data => {
      const members = data.map(member => {
        if (currentUserId !== member.id) {
          return {
            value: member.id,
            label: getName(member)
          };
        }
        return {};
      });
      return { options: members };
    });
  }

  handleSwitchPermisson(
    event: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) {
    const { checked } = event.target;
    const { model } = this.createTeamPresenter;
    model.options[type] = checked;
  }

  handleCreateTeam(selectedMembers: { value: number; label: string }[]) {
    const { handleCloseModal, history } = this.props;
    const { model } = this.createTeamPresenter;
    model.memberIds = selectedMembers.map(
      ({ value }: { value: number; label: string }) => value
    );
    this.createTeamPresenter
      .createTeam()
      .then((result: Group | null) => {
        if (result) {
          handleCloseModal();
          history.push(`/conversation/${result.id}`);
        }
      })
      .catch(error => {
        const handler = new ErrorHandler(error);
        handler.handle().show();
      });
  }

  render() {
    const { selectedMembers } = this.state;
    const { model } = this.createTeamPresenter;

    return (
      <Modal {...this.props}>
        <Wrapper>
          <TeamName
            type="text"
            value={model.name}
            onChange={this.handleTeamNameChange}
          />
          <Async
            name="form-field-name"
            value={selectedMembers}
            onChange={this.handleSelectionChange}
            loadOptions={this.getMembers}
            multi={true}
          />
          <TeamDescription
            rows={4}
            value={model.description}
            onChange={this.handleDescriptionChange}
          />
          <SwitchContainerWrapper>
            <SwitchWrapper>
              <SwitchLabel>Public Team (any co-worker can join)</SwitchLabel>
              <SwitchValue
                type="checkbox"
                checked={model.options.isPublic}
                onChange={e => this.handleSwitchPermisson(e, 'isPublic')}
              />
            </SwitchWrapper>
            <SwitchWrapper>
              <SwitchLabel>
                Members (except guests) may add other members
              </SwitchLabel>
              <SwitchValue
                type="checkbox"
                checked={model.options.canAddMember}
                onChange={e => this.handleSwitchPermisson(e, 'canAddMember')}
              />
            </SwitchWrapper>
            <SwitchWrapper>
              <SwitchLabel>Members may post messages</SwitchLabel>
              <SwitchValue
                type="checkbox"
                checked={model.options.canPost}
                onChange={e => this.handleSwitchPermisson(e, 'canPost')}
              />
            </SwitchWrapper>
            <SwitchWrapper>
              <SwitchLabel>Members may add integrations</SwitchLabel>
              <SwitchValue
                type="checkbox"
                checked={model.options.canAddIntegrations}
                onChange={e =>
                  this.handleSwitchPermisson(e, 'canAddIntegrations')
                }
              />
            </SwitchWrapper>
            <SwitchWrapper>
              <SwitchLabel>Members may pin posts</SwitchLabel>
              <SwitchValue
                type="checkbox"
                checked={model.options.canPin}
                onChange={e => this.handleSwitchPermisson(e, 'canPin')}
              />
            </SwitchWrapper>
          </SwitchContainerWrapper>
          <ButtonsWrapper>
            <Button
              handleRoute={() => this.handleCreateTeam(selectedMembers)}
              backgroundColor="#0584bd"
              disabled={!model.name}
            >
              Create Team
            </Button>
            <Button
              handleRoute={this.props.handleCloseModal}
              backgroundColor="#0584bd"
            >
              Close
            </Button>
          </ButtonsWrapper>
        </Wrapper>
      </Modal>
    );
  }
}

export default withRouter(AddMemberModal as React.ComponentType<any>);
