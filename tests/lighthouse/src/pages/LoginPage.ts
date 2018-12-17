/*
 * @Author: doyle.wu
 * @Date: 2018-12-11 11:58:30
 */
import * as bluebird from 'bluebird';
import * as puppeteer from 'puppeteer';
import { Page } from './Page';
import { puppeteerUtils, PuppeteerUtils } from '../utils/PuppeteerUtils'

class LoginPage {
    private url: string;
    private _authUrl: string | null;
    protected utils: PuppeteerUtils = puppeteerUtils;
    private step1Submit: string = 'button[type="submit"]';
    private step2Credential: string = '#credential';
    private step2Submit: string = 'button[data-test-automation-id="loginCredentialNext"]';
    private step3Pin: string = '#pin';
    private step3Password: string = '#password';
    private step3Submit: string = 'button[data-test-automation-id="signInBtn"]';

    constructor() {
        this.url = process.env.JUIPTER_LOGIN_URL;
    }

    async authUrl() {
        this._authUrl = null;
        let args = ['--enable-features=NetworkService'];
        let isDebug = process.env.RUN_MODE === 'DEBUG';
        if (!isDebug) {
            args.push('--no-sandbox', '--disable-setuid-sandbox');
        }

        let browser = await puppeteer.launch({
            headless: !isDebug,
            defaultViewport: null,
            args: args
        });

        browser.on('targetchanged', async (target) => {
            let page = await target.page();
            let str = page.url();

            const url = new URL(str);
            let params = url.searchParams;

            if (params.has('code') && params.has('state')) {
                this._authUrl = str;
                await page.close({ runBeforeUnload: true });
            }
        });

        let page = await browser.newPage();
        await page.goto(this.url);

        // step one
        await this.utils.click(page, this.step1Submit);

        // step two
        await this.utils.type(page, this.step2Credential, process.env.JUIPTER_USER_CREDENTIAL);
        await this.utils.click(page, this.step2Submit);

        // step three
        await this.utils.type(page, this.step3Pin, process.env.JUIPTER_USER_PIN);
        await this.utils.type(page, this.step3Password, process.env.JUIPTER_USER_PASSWORD);

        // login 
        await this.utils.click(page, this.step3Submit);

        while (!this._authUrl) {
            await bluebird.delay(500);
        }

        await browser.close();

        return this._authUrl;
    }
}

class LoginPage2 extends Page {
    private url: string;
    protected utils: PuppeteerUtils = puppeteerUtils;
    private step1Submit: string = 'button[type="submit"]';
    private step2Credential: string = '#credential';
    private step2Submit: string = 'button[data-test-automation-id="loginCredentialNext"]';
    private step3Pin: string = '#pin';
    private step3Password: string = '#password';
    private step3Submit: string = 'button[data-test-automation-id="signInBtn"]';

    constructor(passContext: any) {
        super(passContext);
        this.url = process.env.JUIPTER_LOGIN_URL;
    }

    async login() {
        let browser = await this.browser();

        let page = await browser.newPage();
        await page.goto(this.url);

        // step one
        await this.utils.click(page, this.step1Submit);

        // step two
        await this.utils.type(page, this.step2Credential, process.env.JUIPTER_USER_CREDENTIAL);
        await this.utils.click(page, this.step2Submit);

        // step three
        await this.utils.type(page, this.step3Pin, process.env.JUIPTER_USER_PIN);
        await this.utils.type(page, this.step3Password, process.env.JUIPTER_USER_PASSWORD);

        // login 
        await this.utils.click(page, this.step3Submit);
    }
}

export {
    LoginPage,
    LoginPage2
}