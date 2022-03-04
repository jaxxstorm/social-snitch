import bluebird from 'bluebird';
import {createNotification} from '@socialsnitch/database/src/notification';
import {getSubscriptionConfigsForWatchConfigId} from '@socialsnitch/database/src/subscription_config';
import {getAllWatchConfigs, updateWatchConfig} from '@socialsnitch/database/src/watch_config';
import 'dotenv/config';
import searchForUpdates from './searcher';

async function main() {
  const watchConfigs = await getAllWatchConfigs();
  for (const watchConfig of watchConfigs) {
    console.log('Getting updates for', `'${watchConfig.keyword}'`);
    const currentTime = new Date().toISOString();
    const results = await searchForUpdates(watchConfig);
    if (results.length === 0) {
      console.log('No new updates for', `'${watchConfig.keyword}'`);
      await updateWatchConfig(watchConfig.id, {last_run_at: currentTime});
      continue;
    }
    console.log('Found', results.length, 'new updates for', `'${watchConfig.keyword}'`);
    const subscriptionConfigs = await getSubscriptionConfigsForWatchConfigId(watchConfig.id);
    for (const subscriptionConfig of subscriptionConfigs) {
      const {notification_config_id} = subscriptionConfig;
      await bluebird.map(results, result => createNotification(notification_config_id, result));
    }
    await updateWatchConfig(watchConfig.id, {last_run_at: currentTime});
    console.log('Getting updates for', `'${watchConfig.keyword}'`, '...Done');
  }
}

main();
