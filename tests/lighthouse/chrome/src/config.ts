/*
 * @Author: doyle.wu
 * @Date: 2019-02-25 08:51:31
 */
require('dotenv').config();

class ConfigWrapper {
  /* basic config */
  public loggerLevel: string;
  public reportUri: string;
  public dashboardUrl: string;
  public fileServerUrl: string;
  public fileUpload: boolean;
  public sceneRepeatCount: number;
  public buildURL: string;
  public runFps: boolean;
  public defaultProtocolTimeout: number;
  public takeHeapSnapshot: boolean;
  /* basic config */

  /* mock config */
  public mockSwitch: boolean;
  public mockServerUrl: string;
  public useInitialCache: boolean;
  /* mock config */

  /* jupiter config */
  public jupiterEnv: string;
  public jupiterUser: string;
  public jupiterPassword: string;
  public jupiterPin: string;
  public jupiterLoginUrl: string;
  public jupiterHost: string;
  public jupiterReleaseHost: string;
  public jupiterStageHost: string;
  public jupiterDevelopHost: string;
  public jupiterAppKey: string;
  public jupiterAppSecret: string;
  /* jupiter config */

  /* db connecttion config */
  public dbName: string;
  public dbUser: string;
  public dbPassword: string;
  public dbHost: string;
  public dbPort: number;
  public dbDialect: string;
  public dbPoolMax: number;
  public dbPoolMin: number;
  public dbPoolAcquire: number;
  public dbPoolIdle: number;
  /* db connecttion config */

  /* scene config */
  public includeScene: Array<string>;
  public switchConversationIds: Array<string>;
  public searchKeywords: Array<string>;
  public searchPhones: Array<string>;
  /* scene config */

  constructor() {
    /* basic config */
    this.loggerLevel = this.getValue("LOGGER_NAME", "info");
    this.reportUri = this.getValue("REPORT_URI", "reports");
    this.dashboardUrl = this.getValue("DASHBOARD_URL", "http://xmn145.rcoffice.ringcentral.com:9005/dashboard/15");
    this.fileUpload = this.getValue("FILE_UPLOAD", "true").toLowerCase() === 'true';
    this.fileServerUrl = this.getValue("FILE_SERVER_URL", "http://xmn02-i01-mck01.lab.nordigy.ru:9000");
    this.sceneRepeatCount = parseInt(this.getValue("SCENE_REPEAT_COUNT", "100"));
    this.buildURL = this.getValue("BUILD_URL", "http://jenkins.lab.rcch.ringcentral.com/view/Jupiter/job/Jupiter-Performance-Daily/");
    this.runFps = this.getValue("RUN_FPS", "true").toLowerCase() === 'true';
    this.defaultProtocolTimeout = parseInt(this.getValue("DEFAULT_PROTOCOL_TIMEOUT", "120000"));
    this.takeHeapSnapshot = this.getValue("TAKE_HEAP_SNAPSHOT", "false").toLowerCase() === 'true';
    /* basic config */

    /* mock config */
    this.mockSwitch = this.getValue("MOCK_SWITCH", "true").toLowerCase() === 'true';
    this.mockServerUrl = this.getValue("MOCK_SERVER_URL", "https://xmn02-i01-mck02.lab.nordigy.ru");
    this.useInitialCache = this.getValue("MOCK_USE_INITIAL_CACHE", "true").toLowerCase() === 'true';
    /* mock config */

    /* jupiter config */
    this.jupiterEnv = this.getValue("JUPITER_ENV", "XMN-UP");
    this.jupiterUser = this.getValue("JUPITER_USER_CREDENTIAL", "+18332278914");
    this.jupiterPassword = this.getValue("JUPITER_USER_PASSWORD", "Test!123");
    this.jupiterPin = this.getValue("JUPITER_USER_PIN", "1001");
    this.jupiterLoginUrl = this.getValue("JUPITER_LOGIN_URL", "https://xmn02-i01-mck02.lab.nordigy.ru/jupiter/login");
    this.jupiterHost = this.getValue("JUPITER_HOST", "https://develop.fiji.gliprc.com");
    this.jupiterReleaseHost = this.getValue("JUPITER_RELEASE_HOST", "https://release.fiji.gliprc.com");
    this.jupiterStageHost = this.getValue("JUPITER_STAGE_HOST", "https://stage.fiji.gliprc.com");
    this.jupiterDevelopHost = this.getValue("JUPITER_DEVELOP_HOST", "https://develop.fiji.gliprc.com");
    this.jupiterAppKey = this.getValue("JUPITER_APP_KEY", "YCWFuqW8T7-GtSTb6KBS6g");
    this.jupiterAppSecret = this.getValue("JUPITER_APP_SECRET", "vRR_7-8uQgWpruNZNLEaKgcsoaFaxnS-uZh9uWu2zlsA");
    /* jupiter config */

    /* db connecttion config */
    this.dbName = this.getValue("DB_NAME", "performance_testing");
    this.dbUser = this.getValue("DB_USER", "root");
    this.dbPassword = this.getValue("DB_PASSWORD", "123456");
    this.dbHost = this.getValue("DB_HOST", "127.0.0.1");
    this.dbPort = parseInt(this.getValue("DB_PORT", "3306"));
    this.dbDialect = this.getValue("DB_DIALECT", "mysql");
    this.dbPoolMax = parseInt(this.getValue("DB_POOL_MAX", "5"));
    this.dbPoolMin = parseInt(this.getValue("DB_POOL_MIN", "0"));
    this.dbPoolAcquire = parseInt(this.getValue("DB_POOL_ACQUIRE", "60000"));
    this.dbPoolIdle = parseInt(this.getValue("DB_POOL_IDLE", "10000"));
    /* db connecttion config */

    /* scene config */
    this.includeScene = this.getArray("INCLUDE_SCENE", "");
    this.switchConversationIds = this.getArray("SWITCH_CONVERSATION_ID", "2288713734,2288697350");
    this.searchKeywords = this.getArray("SEARCH_KEYWORD", "John,Team,Dock,Kacey");
    this.searchPhones = this.getArray("SEARCH_PHONE", "1,2,3,4,5,6,7,8,9,0");
    /* scene config */
  }

  getValue(key, defValue): string {
    return process.env[key] || defValue;
  }

  getArray(key, defValue): Array<string> {
    const value = this.getValue(key, defValue);
    return value ? value.split(',') : [];
  }
}

const Config = new ConfigWrapper();

export { Config };

