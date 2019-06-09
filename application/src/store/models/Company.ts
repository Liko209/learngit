import { observable } from 'mobx';
import { Company } from 'sdk/module/company/entity';
import Base from './Base';
import { CustomEmojiMap } from '@/common/emojiHelpers';

export default class CompanyModel extends Base<Company> {
  @observable
  name: string;
  @observable
  customEmoji: CustomEmojiMap;
  rcAccountId?: number;
  rcBrand?: string;

  constructor(data: Company) {
    super(data);
    this.name = data.name;
    this.customEmoji = data.custom_emoji;
    this.rcAccountId = data.rc_account_id;
    this.rcBrand = data.rc_brand;
  }

  static fromJS(data: Company) {
    return new CompanyModel(data);
  }
}
