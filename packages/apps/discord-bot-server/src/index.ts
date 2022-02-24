import 'dotenv/config';
import DiscordClient, {EventPayload} from '@socialsnitch/discord-client';
import {startMessageTransmitter} from './message-transmitter-new';
import {
  createSubscription,
  getSubscriptionDataByUsername,
  removeSubscription,
} from '@socialsnitch/database/src/subscription';

try {
  console.log('Starting...');
  const bot = new DiscordClient(process.env.DISCORD_BOT_TOKEN);

  bot.on('ready', async () => {
    console.log('Ready!');
    try {
      await bot.registerSlashCommands();
      startMessageTransmitter(bot);
    } catch (err) {
      console.log('Error', err);
    }
  });

  bot.on('error', err => {
    console.error(err);
  });

  bot.on('subscribe', async ({channel_id, options, interaction}: EventPayload) => {
    let success = false;
    try {
      await createSubscription(
        `discord:${channel_id}`,
        {[options.platform]: options.keywords},
        {channelId: channel_id}
      );
      success = true;
    } catch (err) {
      console.log('Error while subscribing', channel_id, options.keywords, err);
    }
    return interaction.createMessage(
      success ? 'Subscription successful ✅' : 'Request failed ❌. Please try again.'
    );
  });

  bot.on('unsubscribe', async ({channel_id, options, interaction}: EventPayload) => {
    let success = false;
    try {
      await removeSubscription(`discord:${channel_id}`, {[options.platform]: options.keywords});
      success = true;
    } catch (err) {
      console.log('Error while unsubscribing', channel_id, options.keywords, err);
    }
    return interaction.createMessage(
      success ? 'Unsubscribe successful ✅' : 'Request failed ❌. Please try again.'
    );
  });

  bot.on('list-subscriptions', async ({channel_id, interaction}) => {
    const data = await getSubscriptionDataByUsername(`discord:${channel_id}`);
    if (!data || data?.keyword?.length === 0) {
      return interaction.createMessage('No active subscriptions found for this channel.');
    }
    const platformWiseKeywordsString = Object.keys(data.keyword)
      .map((platform, idx) => `${idx + 1}. ${platform}: ${data.keyword[platform].join('|')}`)
      .join('\n');
    return interaction.createMessage(
      `Active keyword subscriptions:\n${platformWiseKeywordsString}`
    );
  });

  console.log('Connecting...');
  bot.connect().catch(err => {
    console.error('Error connecting', err);
  });
  console.log('Connecting... done');
} catch (err) {
  console.error('Error while starting the discord bot server', err);
}
