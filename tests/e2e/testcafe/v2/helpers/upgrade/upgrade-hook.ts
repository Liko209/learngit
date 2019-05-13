/*
 * @Author: doyle.wu
 * @Date: 2019-05-09 15:49:32
 */
import axios from 'axios';
import { RequestHook } from 'testcafe';
import {
  SITE_URL, NEW_VERSION_SITE,
  GIT_SOURCE_BRANCH, GIT_TARGET_BRANCH
} from '../../../config';

class UpgradeHook extends RequestHook {
  private siteHost: string;
  private destHost: string;
  private oldVersion: boolean;

  constructor() {
    super(undefined, { includeHeaders: true, includeBody: true });
    this.oldVersion = false;
    this.siteHost = new URL(SITE_URL).host;
  }

  public upgrade() {
    this.oldVersion = false;
  }

  public downgrade() {
    this.oldVersion = true;
  }

  private _getSubdomain(): string {
    if (GIT_TARGET_BRANCH === "master") {
      return 'release';
    }

    if (["develop", "stage"].indexOf(GIT_TARGET_BRANCH) > -1) {
      return GIT_TARGET_BRANCH;
    }

    let subDomain = GIT_TARGET_BRANCH.replace(/[\/\.]/g, '-').toLowerCase()
    return `mr-${subDomain}`;
  }

  async setup() {
    if (!GIT_SOURCE_BRANCH || !GIT_TARGET_BRANCH || GIT_SOURCE_BRANCH === GIT_TARGET_BRANCH) {
      return;
    }

    if (NEW_VERSION_SITE) {
      try {
        this.destHost = new URL(NEW_VERSION_SITE).host;
      } catch (err) {
      }
      return;
    }

    let subDomain = this._getSubdomain();
    let target = `https://${subDomain}.fiji.gliprc.com`;
    try {
      const response = await axios.get(target);
      if (response.status === 200) {
        this.destHost = new URL(target).host;
      }
    } catch (err) {
    }
  }

  async onRequest(event) {
    if (!this.oldVersion) {
      return;
    }

    let url = new URL(event.requestOptions.url);
    if (this.siteHost !== url.host || url.pathname.indexOf('sw-notification.js') > -1 || !this.destHost) {
      return;
    }

    const target = [event.requestOptions.protocol, '//', this.destHost, url.pathname, url.search].join('');

    event.requestOptions.url = target;
    event.requestOptions.homename = this.destHost;
    event.requestOptions.host = this.destHost;
    event.requestOptions.headers['Host'] = this.destHost;
  }

  async onResponse(event) {
  }
}


export {
  UpgradeHook
}
