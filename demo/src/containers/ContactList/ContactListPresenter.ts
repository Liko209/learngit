/*
 * @Author: Lily.li (lily.li@ringcentral.com)
 * @Date: 2018-06-04 17:06:15
 * Copyright © RingCentral. All rights reserved.
 */
import { Person } from 'sdk/models';
import BasePresenter from '#/store/base/BasePresenter';
import { observable, action, computed } from 'mobx';
import { service } from 'sdk';
import {
  IPageParams,
  ALPHABET,
  DIVIDING_DATA,
  PREFIX_START_ENUM,
} from './constants';
import Page from './Page';

const { PersonService } = service;

export default class ContactPresenter extends BasePresenter {
  personService: PersonService;
  pagination: Page;
  @observable contactsMap: Map<string, Person[]> = new Map();
  @observable loading: boolean = false;
  @observable keyword: string = '';
  @observable allLoaded: boolean;
  @observable curPrefix: string;
  rowHeight: number = 70;
  letterWrapperIsDisabled: boolean = false;

  constructor() {
    super();
    this.personService = new PersonService();
    this.pagination = new Page(this.personService);
  }

  @computed
  get contacts() {
    if (this.keyword !== '') {
      return this.filteredContacts;
    }
    return this.loadedContacts;
  }

  @computed
  get loadedContacts() {
    const loadedContacts = [];
    for (const [, contacts] of this.contactsMap) {
      loadedContacts.push(...contacts);
    }
    return loadedContacts;
  }

  @computed
  get filteredContacts(): Person[] {
    return this.loadedContacts.filter((contact: Person) => {
      return new RegExp('^' + this.keyword, 'i').test(
        contact.display_name || contact.first_name || contact.email,
      );
    });
  }

  @computed
  get length() {
    return this.contacts.length;
  }

  @action
  setCurPrefix(prefix: string) {
    const p = prefix.toUpperCase();
    if (p && this.curPrefix !== p) {
      this.curPrefix = p;
    }
  }

  @action
  setLoading(flag: boolean = false) {
    this.loading = flag;
  }

  @action.bound
  async fetchNextPrefix(
    prefix: string,
    direction?: PREFIX_START_ENUM,
  ): Promise<Person[]> {
    this.setLoading(true);
    let exist = (prefix && this.contactsMap.get(prefix)) || [];
    const params = await this.pagination.getNextParams({
      prefix,
      direction,
      exist: exist.length,
    });
    exist = this.contactsMap.get(this.pagination.prefix) || [];
    if (!params || params.offset < exist.length) {
      this.setLoading();
      return [];
    }
    const contacts = await this.fetchContactsByPrefix(params);
    this.contactsMap.set(this.pagination.prefix, [...exist, ...contacts]);
    return contacts;
  }

  @action.bound
  async fetchPrevPrefix(
    prefix: string,
    direction?: PREFIX_START_ENUM,
  ): Promise<Person[]> {
    this.setLoading(true);
    let exist = this.contactsMap.get(prefix) || [];
    const params = await this.pagination.getPrevParams({
      prefix,
      direction,
      exist: exist.length,
    });
    if (!params) {
      this.setLoading();
      return [];
    }
    const contacts = await this.fetchContactsByPrefix(params);
    exist = this.contactsMap.get(this.pagination.prefix) || [];
    this.contactsMap.set(this.pagination.prefix, [...contacts, ...exist]);

    return contacts;
  }

  @action
  async search(keyword: string) {
    this.keyword = keyword;
    this.searchFetchData(keyword);
  }

  async fetchContactsByPrefix(page: IPageParams): Promise<Person[]> {
    let contacts: Person[] = [];
    this.setLoading(true);
    console.log(JSON.stringify(page));
    const { prefix, offset, limit } = page;
    console.time(`fetchContactsByPrefix('${prefix}')`);
    prefix &&
      (contacts = await this.personService.getPersonsByPrefix(prefix, {
        limit,
        offset,
      }));
    console.timeEnd(`fetchContactsByPrefix('${prefix}')`);

    this.setLoading(false);

    return contacts;
  }

  async fetchAllContacts() {
    const contactsMap = await this.personService.getPersonsOfEachPrefix(
      Infinity,
    );
    this.contactsMap = contactsMap;
    this.allLoaded = true;
  }

  findPrefixByIndex(index: number): string {
    const contact = this.contacts[index];
    if (contact) {
      const display =
        contact.display_name || contact.first_name || contact.email;
      const prefix = String(display)
        .slice(0, 1)
        .toUpperCase();

      if (this.contactsMap.has(prefix)) {
        return prefix;
      }
      return '#';
    }
    return '';
  }

  findIndexByPrefix(prefix: string): number {
    const reg = new RegExp('^' + prefix + '.*', 'i');
    return this.contacts.findIndex((contact) => {
      const { display_name, first_name, email } = contact;
      const name = display_name || first_name || email;
      if (prefix === '#') {
        return !ALPHABET.slice(1).includes(name.slice(0, 1).toUpperCase());
      }
      return reg.test(name);
    });
  }

  resetContactsMap() {
    this.contactsMap.clear();
    ALPHABET.forEach((alpha) => {
      this.contactsMap.set(alpha, []);
    });
  }

  @action
  async init(prefix: string = 'A'): Promise<void> {
    this.resetContactsMap();
    this.setCurPrefix(prefix);
    await this.fetchNextPrefix(prefix, PREFIX_START_ENUM.TOP);

    const count = await this.personService.getAllCount();
    if (count < DIVIDING_DATA) {
      if (count < 10) {
        this.letterWrapperIsDisabled = true;
      }
      await this.fetchAllContacts();
    }
  }

  @action
  async letterItemClickHandle(prefix: string): Promise<Person[] | void> {
    this.resetContactsMap();
    this.setCurPrefix(prefix);
    await this.fetchNextPrefix(prefix, PREFIX_START_ENUM.TOP);
  }

  @action
  async searchFetchData(keyword: string): Promise<void> {
    if (!keyword) return;
    const prefix = keyword.slice(0, 1).toUpperCase();
    this.resetContactsMap();
    this.setCurPrefix(prefix);
    const contacts = await this.fetchContactsByPrefix({
      prefix,
      limit: Infinity,
      offset: 0,
    });

    this.contactsMap.set(prefix, contacts);
  }
}
