import { Sequelize, Model } from 'sequelize-typescript';
import { Logger } from 'log4js';
import { logUtils } from './LogUtils';

class DbUtils {
    private sequelize: Sequelize;
    private logger: Logger;

    constructor() {
        // init db connection
        this.sequelize = new Sequelize({
            database: process.env.DB_NAME,
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT),
            dialect: process.env.DB_DIALECT,
            operatorsAliases: false,
            logging: false,

            pool: {
                max: parseInt(process.env.DB_POOL_MAX),
                min: parseInt(process.env.DB_POOL_MIN),
                acquire: parseInt(process.env.DB_POOL_ACQUIRE),
                idle: parseInt(process.env.DB_POOL_IDLE)
            }
        });
        this.logger = logUtils.getLogger(__filename);
    }

    /**
     * @description: model bind connection, and try to create table.
     */
    async addModels(models: Array<typeof Model>) {
        this.sequelize.addModels(models);

        let msg = [];
        for (let model of models) {
            // try to create table if not exist.
            await model.sync({ force: false, logging: false });

            msg.push(`table[${model.getTableName()}] sync success.`);
        }
        this.logger.info(msg.join('\n\r'));
    }

    /**
     * @description: close db connection
     */
    async close() {
        await this.sequelize.close();
        this.logger.info('db connection closed.');
    }
}

const dbUtils = new DbUtils();

export {
    dbUtils
}