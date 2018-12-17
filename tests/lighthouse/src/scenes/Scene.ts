/*
 * @Author: doyle.wu
 * @Date: 2018-12-11 11:59:55
 */
import { SceneConfig } from './config/SceneConfig';
import * as puppeteer from 'puppeteer';
import * as lighthouse from 'lighthouse';
import { logUtils } from '../utils/LogUtils';
import { fileService } from '../services/FileService';
import * as reportGenerater from 'lighthouse/lighthouse-core/report/report-generator';

const EXTENSION_PATH = `${process.cwd()}/extension`;
type Timing = { startDate: Date, endDate: Date, total: number };

class Scene {
    protected url: string;
    protected config: SceneConfig;
    protected timing: Timing;
    protected data = {};
    protected report;
    protected artifacts;
    protected logger = logUtils.getLogger(__filename);

    constructor(url: string) {
        this.url = url;
    }

    /**
     * @description: run scene. don't override this method
     */
    async run() {
        const startDate = new Date();

        await this.preHandle();

        await this.collectData();

        const endDate = new Date();
        this.timing = {
            startDate,
            endDate,
            total: endDate.getTime() - startDate.getTime()
        }

        await this.saveMetircsIntoDisk();

        await this.saveMetircsIntoDb();
    }

    /**
     * @description: save performance metrics into disk. don't override this method
     */
    async saveMetircsIntoDisk() {
        let fileName = this.name();
        if (this.report) {
            await fileService.saveReportIntoDisk(this.report, fileName);
        }
        if (this.artifacts) {
            await fileService.saveArtifactsIntoDisk(this.artifacts, fileName);
        }
        if (this.data) {
            await fileService.saveDataIntoDisk(this.data, fileName);
        }
    }

    /**
     * @description: scene pre handle  
     */
    async preHandle() {
        this.config = new SceneConfig();
    }

    /**
     * @description: collect performance metrics
     */
    async collectData() {
        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: [
                `--disable-extensions-except=${EXTENSION_PATH}`,
                `--load-extension=${EXTENSION_PATH}`,
                '--enable-experimental-extension-apis'
            ]
        });

        const { lhr, artifacts } = await lighthouse(this.finallyUrl(), {
            port: (new URL(browser.wsEndpoint())).port,
            logLevel: 'info'
        }, this.config.toLightHouseConfig());

        lhr['finalUrl'] = this.url;
        lhr['requestedUrl'] = this.url;

        this.data = lhr;
        this.report = reportGenerater.generateReport(lhr, 'html');
        this.artifacts = artifacts;

        await browser.close();
    }

    /**
     * @description: save performance metrics into db
     */
    async saveMetircsIntoDb() {
        //todo save metrics into db
        this.logger.info('saveData');
    }

    /**
     * @description: get scene name
     */
    name(): string {
        if (this.config.name === '') {
            return `${this.constructor.name}`;
        } else {
            return `${this.constructor.name} ${this.config.name}`;
        }
    }

    finallyUrl(): string {
        return this.url;
    }
}

export {
    Scene
}