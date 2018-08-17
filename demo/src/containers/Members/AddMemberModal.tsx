/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-06-07 17:26:18
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { Async } from 'react-select';
import 'react-select/dist/react-select.css';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import Modal from '@/components/Modal';
import Button from '@/components/Button';

import AddMemberPresenter from './AddMemberPresenter';
import { getName } from '../../utils/getName';

interface Props {
  handleCloseModal: Function;
  showModal: boolean;
  groupId: number;
  members: number[];
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

@observer
class AddMemberModal extends Component<Props> {
  addMemberPresenter: AddMemberPresenter;
  state = {
    selectedMembers: [],
  };

  constructor(props: Props) {
    super(props);
    this.addMemberPresenter = new AddMemberPresenter();
    this.getMembers = this.getMembers.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    const { members } = this.props;
    this.addMemberPresenter.existMembers = members;
  }

  handleChange = (selectedMembers: { value: number; label: string }[]) => {
    this.setState({ selectedMembers });
  }

  getMembers(input: string) {
    // const { fetchSearch } = this.addMemberPresenter;

    if (!input) {
      return Promise.resolve({ options: [] });
    }

    return this.addMemberPresenter.fetchSearch(input).then((data) => {
      const members = data.map(member => ({
        value: member.id,
        label: getName(member),
      }));
      return { options: members };
    });
  }

  handleAddMember(selectedMembers: { value: number; label: string }[]) {
    const { groupId, handleCloseModal } = this.props;
    this.addMemberPresenter.addMember(selectedMembers, groupId).then(() => {
      handleCloseModal();
    });
  }

  render() {
    const { selectedMembers } = this.state;

    return (
      <Modal {...this.props}>
        <Wrapper>
          <Async
              name="form-field-name"
              value={selectedMembers}
              onChange={this.handleChange}
              loadOptions={this.getMembers}
              multi={true}
          />
          <ButtonsWrapper>
            <Button
                handleRoute={() => this.handleAddMember(selectedMembers)}
                backgroundColor="#0584bd"
                disabled={!selectedMembers.length}
            >
              Add Members
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

export default AddMemberModal;
