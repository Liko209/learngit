/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-12 15:31:26
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { TranslationFunction, i18n } from 'i18next';
import { translate } from 'react-i18next';
import JuiDialog from 'ui-components/atoms/Dialog';
import JuiDialogTitle from 'ui-components/atoms/DialogTitle';
import JuiDialogContent from 'ui-components/atoms/DialogContent';
import JuiDialogActions from 'ui-components/atoms/DialogActions';
import JuiButton from 'ui-components/atoms/Button';
import JuiTextField from 'ui-components/molecules/Form/TextField';
import TextWithLink from 'ui-components/molecules/TextWithLink/TextWithLink';
import ListToggleButton, {
  IListToggleItemProps,
} from 'ui-components/molecules/Lists/ListToggleButton';
import HomePresenter from '../Home/HomePresenter';
import SearchContact from '../SearchContact';

interface IProps {
  homePresenter: HomePresenter;
  i18n: i18n;
  t: TranslationFunction;
}
interface IState {
  disabledOkBtn: boolean;
  nameError: boolean;
  items: IListToggleItemProps[];
}

@observer
class CreateTeam extends React.Component<IProps, IState> {
  private homePresenter: HomePresenter;

  constructor(props: IProps) {
    super(props);
    this.homePresenter = props.homePresenter;
    this.state = {
      disabledOkBtn: true,
      nameError: false,
      items: [
        {
          text: '123123123',
          checked: false,
        },
        {
          text: '22222222222',
          checked: true,
        },
      ],
    };
  }

  handleChange = (item: IListToggleItemProps, checked: boolean) => {
    const newItems = this.state.items.map((oldItem: IListToggleItemProps) => {
      if (oldItem.text === item.text) {
        return {
          ...oldItem,
          checked,
        };
      }
      return oldItem;
    });
    this.setState({
      items: newItems,
    });
  }

  handleSearchContactChange = (item: any) => {
    console.log(item);
  }

  onCancel = () => {
    this.homePresenter.handleOpenCreateTeam();
  }
  onClose = () => {
    this.homePresenter.handleOpenCreateTeam();
  }
  handleNameChange = () => {};
  render() {
    const { disabledOkBtn, nameError, items } = this.state;
    const { t } = this.props;

    return (
      <JuiDialog
        open={this.homePresenter.openCreateTeam}
        size={'medium'}
        scroll="paper"
      >
        <JuiDialogTitle>{t('Create Team')}</JuiDialogTitle>
        <JuiDialogContent>
          <JuiTextField
            id={t('Team Name')}
            label={t('Team Name')}
            fullWidth={true}
            error={nameError}
            inputProps={{
              maxLength: 200,
            }}
            helperText={nameError && t('Team name required')}
            onChange={this.handleNameChange}
          />
          <SearchContact
            onChange={this.handleSearchContactChange}
            label={t('Members')}
            placeholder={t('Search Contact Placeholder')}
          />
          <JuiTextField
            id={t('Team Description')}
            label={t('Team Description')}
            fullWidth={true}
            onChange={this.handleNameChange}
          />
          <ListToggleButton items={items} toggleChange={this.handleChange} />
          <TextWithLink
            TypographyProps={{
              align: 'center',
            }}
            text={t('tips')}
            linkText={t('linkTips')}
            href=""
          />
        </JuiDialogContent>

        <JuiDialogActions>
          <JuiButton
            onClick={this.onCancel}
            color="primary"
            variant="text"
            autoFocus={true}
          >
            {t('OK')}
          </JuiButton>
          <JuiButton
            onClick={this.onClose}
            color="primary"
            variant="contained"
            autoFocus={true}
            disabled={disabledOkBtn}
          >
            {t('Cancel')}
          </JuiButton>
        </JuiDialogActions>
      </JuiDialog>
    );
  }
}

export default translate('team')(CreateTeam);
