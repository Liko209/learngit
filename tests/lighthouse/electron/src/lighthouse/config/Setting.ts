/*
 * @Author: doyle.wu
 * @Date: 2019-02-25 14:20:08
 */

import { Throttling, WIFI } from "./Throttling";

class Setting {
  public output: string = "html";
  public maxWaitForLoad: number = 45 * 1000;
  public throttlingMethod: string = "devtools"; // 'simulate' || 'devtools' || 'provided'
  public throttling: Throttling = WIFI;
  public auditMode: boolean = false;
  public gatherMode: boolean = false;
  public disableStorageReset: boolean = false;
  public disableDeviceEmulation: boolean = true;
  public emulatedFormFactor: string = "desktop"; // 'mobile' || 'desktop' || 'none'
  // the following settings have no defaults but we still want ensure that `key in settings`
  // in config will work in a typechecked way
  public locale: "en-US"; // actual default determined by Config using lib/i18n
  public blockedUrlPatterns: string[] | null = null;
  public additionalTraceCategories: string | null = null;
  public extraHeaders: null;
  public onlyAudits: string[] | null = null;
  public onlyCategories: string[] | null = null;
  public skipAudits: string[] | null = null;
  public url?: string;
}

export { Setting };
