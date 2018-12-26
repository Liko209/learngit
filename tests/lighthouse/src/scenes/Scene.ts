/*
 * @Author: doyle.wu
 * @Date: 2018-12-11 11:59:55
 */
import { SceneConfig } from './config/SceneConfig';
import * as lighthouse from 'lighthouse';
import { logUtils } from '../utils/LogUtils';
import { puppeteerUtils } from '../utils/PuppeteerUtils';
import { TaskDto } from '../models';
import { fileService } from '../services/FileService';
import { metriceService } from '../services/MetricService';
import { mockHelper } from '../mock/MockHelper';
import * as reportGenerater from 'lighthouse/lighthouse-core/report/report-generator';

const EXTENSION_PATH = `${process.cwd()}/extension`;
type Timing = { startTime: Date, endTime: Date, total: number };

const RETRY_COUNT = 3;

class Scene {
    protected url: string;
    protected config: SceneConfig;
    protected timing: Timing;
    protected data;
    protected report;
    protected artifacts;
    protected taskDto: TaskDto;
    protected logger = logUtils.getLogger(__filename);

    constructor(url: string, taskDto: TaskDto) {
        this.url = url;
        this.taskDto = taskDto;
    }

    /**
     * @description: run scene. don't override this method
     */
    async run(): Promise<boolean> {
        for (let i = 0; i < RETRY_COUNT; i++) {
            try {
                const startTime = new Date();

                await this.preHandle();

                this.config.settings.url = this.url;

                await this.collectData();

                const endTime = new Date();
                this.timing = {
                    startTime,
                    endTime,
                    total: endTime.getTime() - startTime.getTime()
                }
            } catch (err) {
                this.logger.error(err);
            }

            if (this.isSuccess()) {
                await this.saveMetircsIntoDisk();

                await this.saveMetircsIntoDb();
                return true;
            }
        }
        return false;
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

        mockHelper.open();
    }

    /**
     * @description: collect performance metrics
     */
    async collectData() {
        const browser = await puppeteerUtils.launch({
            args: [
                `--disable-extensions-except=${EXTENSION_PATH}`,
                `--load-extension=${EXTENSION_PATH}`,
                '--enable-experimental-extension-apis'
            ]
        });

        try {
            const { lhr, artifacts } = await lighthouse(this.finallyUrl(), {
                port: (new URL(browser.wsEndpoint())).port,
                logLevel: 'info'
            }, this.config.toLightHouseConfig());

            lhr['finalUrl'] = this.url;
            lhr['uri'] = new URL(this.url).pathname;
            lhr['aliasUri'] = lhr['uri'];
            lhr['requestedUrl'] = this.url;

            this.data = lhr;
            this.report = reportGenerater.generateReport(lhr, 'html');
            this.artifacts = artifacts;
        } catch (err) {
            this.logger.error(err);
        } finally {
            await browser.close();
        }
    }

    /**
     * @description: save performance metrics into db
     */
    async saveMetircsIntoDb() {
        let sceneDto = await metriceService.createScene(this.taskDto, this);

        await metriceService.createPerformance(sceneDto, this);

        await metriceService.createPerformanceItem(sceneDto, this);
    }

    isSuccess(): boolean {
        if (this.data) {
            let { categories } = this.data;

            return categories
                && categories['performance'] && categories['performance'].score
                && categories['pwa'] && categories['pwa'].score
                && categories['accessibility'] && categories['accessibility'].score
                && categories['best-practices'] && categories['best-practices'].score
                && categories['seo'] && categories['seo'].score;
        }
        return false;
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

    getData() {
        return this.data;
    }

    getArtifacts() {
        return this.artifacts;
    }

    getTiming(): Timing {
        return this.timing;
    }
}

export {
    Scene
}