import { Config } from '../config';

export const API_HOST = process.env.NODE_ENV === 'production' ? Config.REACT_APP_KAI_REST_API_HOST : '';
