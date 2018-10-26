/*
 * @Author: Andy Hu
 * @Date: 2018-10-26 13:10:55
 * Copyright © RingCentral. All rights reserved.
 */
import { getGlobalValue, getEntity } from '@/store/utils';
import { GLOBAL_KEYS, ENTITY_NAME } from '@/store/constants';
import Segment from 'load-segment';
import PersonModel from '@/store/models/Person';
import CompanyModel from '@/store/models/Company';
import keys from './key.json';
import { IReactionDisposer, reaction } from 'mobx';


type TAnalytics = {
  bootstrap: () => void;
  identify: () => void;
};

class Analytics implements TAnalytics {
  private _currentUserID: number;
  private _user: PersonModel;
  private _company: CompanyModel;
  private _segment: TSegment;
  private _disposer: IReactionDisposer;

  async bootstrap() {
    this._segment = Segment({ key: keys.test });
  }

  identify() {
    this._disposer = reaction(this._extractInfo, this._identify);
  }

  private _extractInfo = () => {
    this._user = getEntity(ENTITY_NAME.PERSON, this._currentUserID!);
    this._company = getEntity(ENTITY_NAME.COMPANY, this._user.companyId);
    return { user: this._user, company: this._company };
  }

  private _identify = async (info: {
    user: PersonModel;
    company: CompanyModel;
  }) => {
    const { user, company } = info;
    this._currentUserID = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);

    const { email, companyId, inviterId } = user;
    const { name, rcAccountId } = company;
    const traits = {
      email,
      companyId,
      rcAccountId,
      companyName: name,
      id: this._currentUserID,
      signupType: inviterId ? 'viral' : 'original',
    };
    this._segment.identify(this._currentUserID, traits);
    this._disposer();
  }
  catch(e: Error) {
    console.warn(e.message);
  }
}

const analytics = new Analytics();

export { analytics };
