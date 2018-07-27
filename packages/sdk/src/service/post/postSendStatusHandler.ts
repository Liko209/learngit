// import { SSL_OP_MICROSOFT_BIG_SSLV3_BUFFER } from 'constants';

/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-05-23 15:03:23
 */

enum ESendStatus {
  SUCCESS,
  FAIL,
  INPROGRESS
}
import { daoManager, PostDao } from '../../dao';
class PostSendStatusHandler {
  private sendStatusIdStatus: Map<number, ESendStatus>;
  private sendStatusIdVersion: Map<number, number>;
  private isInited: boolean = false;
  constructor() {
    this.sendStatusIdStatus = new Map<number, ESendStatus>();
    this.sendStatusIdVersion = new Map<number, number>();
  }

  async init() {
    let dao = daoManager.getDao(PostDao);
    const posts = await dao.queryPreInsertPost();
    if (posts && posts.length) {
      posts.forEach(element => {
        this.addIdAndVersion(element.id, element.version, ESendStatus.FAIL);
      });
    }
    this.isInited = true;
  }

  async getStatus(id: number): Promise<ESendStatus> {
    if (id > 0) {
      return ESendStatus.SUCCESS;
    }
    if (!this.isInited) {
      await this.init();
    }
    const status: ESendStatus | undefined = this.sendStatusIdStatus.get(id);
    return status ? status : ESendStatus.FAIL;
  }
  clear(): void {
    this.sendStatusIdStatus.clear();
    this.sendStatusIdVersion.clear();
  }
  addIdAndVersion(id: number, version: number, status: ESendStatus = ESendStatus.INPROGRESS): void {
    this.sendStatusIdStatus.set(id, status);
    this.sendStatusIdVersion.set(version, id);
  }
  removeVersion(version: number): void {
    const id: number | undefined = this.sendStatusIdVersion.get(version);
    if (id) {
      this.sendStatusIdStatus.delete(id);
      this.sendStatusIdVersion.delete(version);
    }
  }
  async isVersionInPreInsert(version: number): Promise<{ existed: boolean; id: number }> {
    if (!this.isInited) {
      this.init();
    }
    const id: number | undefined = this.sendStatusIdVersion.get(version);
    return id
      ? {
        existed: true,
        id
      }
      : {
        existed: false,
        id: 0
      };
  }
}

export { ESendStatus, PostSendStatusHandler };
