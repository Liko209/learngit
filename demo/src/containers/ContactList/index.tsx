import React from 'react';
import { observer } from 'mobx-react';
import {
  List,
  AutoSizer,
  OnScrollParams,
  ListRowProps,
} from 'react-virtualized';
import ContactListPresenter from './ContactListPresenter';
import {
  Wrapper,
  SearchInput,
  LetterWrapper,
  LetterItem,
  ContactListWrapper,
  ContactItem,
} from './styles';
import { ALPHABET } from './constants';

// TODO; remove; it;
const contactCount = extractUrlParameter('contact_count');
if (contactCount) {
  import('./_importContacts/index').then((module) => {
    const generate = module.default;
    generate(Number(contactCount));
  });
}

function extractUrlParameter(name: string) {
  const nameTemp = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
  const regex = new RegExp(`[\\?&]${nameTemp}=([^&#]*)`);
  const results = regex.exec(window.location.search);
  return results === null
    ? ''
    : decodeURIComponent(results[1].replace(/\+/g, ' '));
}
interface Props {
  [propName: string]: any;
}

@observer
class ContactList extends React.Component<Props> {
  presenter: ContactListPresenter;
  list: List;

  constructor(opts: any) {
    super(opts);
    this.onScroll = this.onScroll.bind(this);
    this.onSearch = this.onSearch.bind(this);
    this.onLetterItemsClick = this.onLetterItemsClick.bind(this);
    this.rowRenderer = this.rowRenderer.bind(this);
    this.presenter = new ContactListPresenter();
  }

  async componentDidMount() {
    this.presenter.init().then(() => {
      this.list.scrollToPosition(3);
    });
    // Better loading up
    this.list.scrollToPosition(3);
  }

  componentWillUnmount() {
    this.presenter.dispose();
  }

  onSearch(event: React.ChangeEvent<HTMLInputElement>) {
    this.presenter.search(event.target.value);
  }

  async onScroll(params: OnScrollParams) {
    const { rowHeight, keyword } = this.presenter;
    const { scrollTop } = params;
    const prefix = this.presenter.findPrefixByIndex(
      Math.floor(scrollTop / rowHeight),
    );
    this.presenter.setCurPrefix(prefix);
    if (this.presenter.allLoaded || keyword) return;
    prefix && this.scrollPage(prefix, params);
  }

  async scrollPage(prefix: string, params: OnScrollParams) {
    const { loading, rowHeight } = this.presenter;
    if (loading) return;
    const { scrollTop, scrollHeight, clientHeight } = params;

    if (scrollTop > (scrollHeight - clientHeight) * 0.7) {
      await this.presenter.fetchNextPrefix(prefix);
    } else if (scrollTop <= rowHeight * 3) {
      const { length } = await this.presenter.fetchPrevPrefix(prefix);
      length && requestAnimationFrame(() => this.list.scrollToRow(length));
    }
  }

  async onLetterItemsClick(prefix: string) {
    // keyword is true or curPrefix equal prefix will lock letter item operation
    const { curPrefix, keyword, loading } = this.presenter;
    if (loading || keyword || !prefix || curPrefix === prefix) return;
    if (this.presenter.allLoaded) {
      const index = this.presenter.findIndexByPrefix(prefix);
      index >= 0 && this.list.scrollToRow(index);
      return;
    }
    await this.presenter.letterItemClickHandle(prefix);
    // Better loading up
    this.list.scrollToPosition(3);
  }

  rowRenderer({ key, index, style }: ListRowProps) {
    const contacts = this.presenter.contacts;
    const contact = contacts[index];
    let content = <ContactItem />;
    if (contact) {
      const { display_name, first_name, last_name, email } = contact;
      const name =
        display_name ||
        (first_name && first_name + ' ' + (last_name || '')) ||
        email;
      content = (
        <ContactItem>
          <h3>{name}</h3>
          <p>{contact.email}</p>
        </ContactItem>
      );
    }

    return (
      <div key={key} style={style}>
        {content}
      </div>
    );
  }

  render() {
    const {
      length,
      curPrefix,
      rowHeight,
      letterWrapperIsDisabled: isDisabled,
    } = this.presenter;

    return (
      <Wrapper>
        <SearchInput
          type="search"
          onChange={this.onSearch}
          placeholder="Search"
        />
        <LetterWrapper>
          {ALPHABET.map((letter: string) => (
            <LetterItem
              className={
                curPrefix === letter && !isDisabled
                  ? 'is_focus'
                  : isDisabled
                    ? 'is_disabled'
                    : ''
              }
              key={letter}
              onClick={() => {
                this.onLetterItemsClick(letter);
              }}
            >
              {letter}
            </LetterItem>
          ))}
        </LetterWrapper>
        <ContactListWrapper>
          <AutoSizer>
            {({ width = 0, height = 0 }) => (
              <List
                ref={(list: List) => {
                  this.list = list;
                }}
                scrollToAlignment="start"
                width={width}
                height={height}
                rowCount={length}
                rowHeight={rowHeight}
                rowRenderer={this.rowRenderer}
                onScroll={this.onScroll}
              />
            )}
          </AutoSizer>
        </ContactListWrapper>
      </Wrapper>
    );
  }
}

export default ContactList;
