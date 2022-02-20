import client from './client';
import {definitions} from './types';

export const ensureNotificationConfigExists = async (
  user_id: number,
  notification_platform_id: number,
  config: any
) => {
  return client.ensureEntityExists<definitions['notification_config']>('notification_config', {
    user_id,
    notification_platform_id,
    config: JSON.stringify(config),
  });
};

export const createNotificationConfig = async (
  user_id: number,
  notification_platform_id: number,
  config: any
) => {
  return client.insertEntity<definitions['notification_config']>('notification_config', {
    user_id,
    notification_platform_id,
    config: JSON.stringify(config),
  });
};

export const getNotificationConfig = async (query: Partial<definitions['notification_config']>) => {
  return client.getEntity<definitions['notification_config']>('notification_config', query);
};
