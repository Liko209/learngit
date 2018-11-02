/*
 * @Author: Andy Hu
 * @Date: 2018-10-26 13:10:55
 * Copyright © RingCentral. All rights reserved.
 */
import { getGlobalValue, getEntity } from '@/store/utils';
import { GLOBAL_KEYS, ENTITY_NAME } from '@/store/constants';
import Segment from 'load-segment';
import keys from './key.json';
import { IReactionDisposer, reaction } from 'mobx';
import PersonModel from '@/store/models/Person';
import CompanyModel from '@/store/models/Company';

type TAnalytics = {
  bootstrap: () => void;
  identify: () => void;
};

class Analytics implements TAnalytics {
  private _segment: TSegment;
  private _disposer: IReactionDisposer;

  async bootstrap() {
    this._segment = Segment({ key: keys.test });
  }

  identify() {
    this._disposer = reaction(this._extractInfo, this._identify, {
      fireImmediately: false,
    });
  }

  private _extractInfo = () => {
    const userId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
    if (!userId) {
      return { userId };
    }
    const user = getEntity(ENTITY_NAME.PERSON, userId);
    if (!user.companyId) {
      return { userId, user };
    }
    const company = getEntity(ENTITY_NAME.COMPANY, user.companyId);
    return {
      userId,
      user,
      company,
    };
  }

  private _identify = async (info: {
    userId: number;
    user: PersonModel;
    company: CompanyModel;
  }) => {
    const { userId, company, user } = info;
    if (!user.email || !company.name || !userId) {
      return;
    }
    const { email, companyId, inviterId } = user;
    const { name, rcAccountId } = company;
    const traits = {
      email,
      companyId,
      rcAccountId,
      companyName: name,
      id: userId,
      signupType: inviterId ? 'viral' : 'organic',
      accountType: rcAccountId ? 'rc' : 'non-rc',
    };
    this._segment.identify(userId, traits);
    this._disposer();
  }
  catch(e: Error) {}
}

const analytics = new Analytics();

export { analytics };
