const Twitter = require('twitter');
const Slack   = require('slack-node');

// config
const consumer_key        = process.env.CONSUMER_KEY;
const consumer_secret     = process.env.CONSUMER_SECRET;
const access_token_key    = process.env.ACCESS_TOKEN_KEY;
const access_token_secret = process.env.ACCESS_TOKEN_SECRET;
const slack_webhook_uri   = process.env.SLACK_WEBHOOK_URI;
const channel             = process.env.SLACK_CHANNEL;
const track               = process.env.KEYWORD;

if (track === '') {
  console.log('invalid keyword');
  process.exit();
}

const twitter = new Twitter({
  consumer_key,
  consumer_secret,
  access_token_key,
  access_token_secret
});

const slack = new Slack();
slack.setWebhook(slack_webhook_uri);

const postToSlack = (data) => {
  if (!data.text || !data.user) { return; }
  if (data.retweeted_status) { return; }

  const username   = data.user.screen_name;
  const tweet_uri  = `https://twitter.com/${username}/status/${data.id_str}`;
  const text       = `${data.text}\n${tweet_uri}`;
  const icon_emoji = data.user.profile_image_url;

  slack.webhook({
    channel,
    username,
    text,
    icon_emoji
  }, () => {});
};

// main
twitter.stream('statuses/filter', { track }, (stream) => {
  stream.on('data', postToSlack);
});
