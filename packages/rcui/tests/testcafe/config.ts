import * as dotenv from 'dotenv'


dotenv.config();

export const TEST_URL: string = process.env.TEST_URL || 'https://develop-rcui.fiji.gliprc.com/?path=/story/tooltip--tooltipe';

export const FILE_PATH: string = process.env.FILE_PATH || `tmp/${new Date().getTime()}`;
