/*
 * @Author: doyle.wu
 * @Date: 2018-12-08 18:07:46
 */
import { Page } from 'puppeteer/lib/Page';

const MAX_TRY_COUNT = 10;

class PuppeteerUtils {

    /**
     * @description: wait for element appear by selector
     */
    async waitForSelector(page: Page, selector: string, options = {}): Promise<boolean> {
        let opt = Object.assign({ visible: true, timeout: 30000 }, options);

        let cnt = MAX_TRY_COUNT;
        opt['timeout'] = opt['timeout'] / cnt;

        while (cnt-- > 0) {
            try {
                await page.waitForSelector(selector, opt);
                return true;
            } catch (error) {
            }
        }
        return false;
    }

    async exist(page: Page, selector: string, options = {}) {
        return await this.waitForSelector(page, selector, options);
    }

    /**
     * @description: wait for element appear by xpath
     */
    async waitForXpath(page: Page, xpath: string, options = {}): Promise<boolean> {
        let opt = Object.assign({ visible: true, timeout: 30000 }, options);

        let cnt = MAX_TRY_COUNT;
        opt['timeout'] = opt['timeout'] / cnt;

        while (cnt-- > 0) {
            try {
                await page.waitForXPath(xpath, opt);
                return true;
            } catch (error) {
            }
        }
        return false;
    }

    /**
     * @description: ensure type text into element
     */
    async type(page: Page, selector: string, text: string, check: boolean = true, options = {}): Promise<boolean> {
        let typeOpt = Object.assign({ delay: 50 }, options);

        if (!await this.waitForSelector(page, selector, options)) {
            return false;
        }

        await page.type(selector, text, typeOpt);

        if (!check) {
            return true;
        }

        let cnt = MAX_TRY_COUNT, res;
        while (cnt-- > 0) {
            try {
                res = await page.$eval(selector, (node, args) => {
                    let result = node.value === args[0];
                    if (!result) {
                        // clear text
                        node.value = '';
                    }
                    return result;
                }, [text]);
                if (res) {
                    return true;
                }

                await page.type(selector, text, typeOpt);
            } catch (error) {
            }
        }

        return false;
    }

    /**
     * @description: wait for element appear and click
     */
    async click(page: Page, selector: string, options = {}): Promise<boolean> {
        if (!await this.waitForSelector(page, selector, options)) {
            return false;
        }

        let opt = Object.assign({ button: 'left', clickCount: 1, delay: 0 }, options);

        await page.click(selector, opt);

        return true;
    }

    /**
     * @description: get element text
     */
    async text(page: Page, selector: string, options = {}): Promise<boolean> {
        if (!await this.waitForSelector(page, selector, options)) {
            return false;
        }

        let text = await page.$eval(selector, (node) => {
            let text = node.value;
            if (text) {
                return text;
            }
            return node.innerHTML;
        });

        return text;
    }
}

const puppeteerUtils = new PuppeteerUtils();
export {
    puppeteerUtils,
    PuppeteerUtils
};