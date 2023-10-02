# whatsapp-cloud-api-express

[![npm package][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Code Coverage][codecov-img]][codecov-url]
[![Commitizen Friendly][commitizen-img]][commitizen-url]
[![Semantic Release][semantic-release-img]][semantic-release-url]

> A set of Node.js and Express.js functions for sending/receiving Whatsapp messages using the [Whatsapp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api/).

## Features:

All features in [here](https://github.com/tawn33y/whatsapp-cloud-api/tree/v0.2.6), plus:

- 🔥 Added a way to listen for message status changes in messages. This allows to listen for `delivered`, `failed`, `read`,... statuses on the sent messages.

- 🔥 Added `sendReaction` function to [react to a message](https://github.com/j05u3/whatsapp-cloud-api-express/pull/1#issue-1922143536).

- 🔥 Made the webhook able to run on serverless environments (like Google Cloud Functions).[^1]

- ✅ Added `to_phone_number` so you can identify which phone number was the one receiving the message.

- ✅ Added support for type `button` in incoming messages. Which is generated when the user "replies" from a template button.

- ✅ Added a logging callback for each message sent so you can log each sent message easily.

- ✅ Changed the architecture so we can use the webhook and the sender separately.

- ✅ Added 'parameters' type for template header component.

[^1]: This is because on the webhook now we wait for callbacks to finish before the response is sent (`sendStatus`), this was done because on serverless environments code is not guaranteed to be kept alive after the response is sent.

## Install

```bash
npm install whatsapp-cloud-api-express
```

## Usage

You can use this library only to send Whatsapp messages or only to receive Whatsapp messages or you can do both.

Beforehand you should get some values from the Facebook developers website, you can use [the part (1) of this amazing tutorial](https://github.com/tawn33y/whatsapp-cloud-api/blob/v0.2.6/TUTORIAL.md) by @tawn33y.

### Receiving messages

The webhook part of the API is implemented as an express router. The webhook is the part that allows you to listen for new messages incoming to your bot. You can use it like this:

```ts
app.use(
  '/webhook/whatsapp', // you can change this path to whatever you want,
  // but make sure to change it on the Facebook Developer Console too
  getWebhookRouter({
    // fill your own values here:
    webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFICATION_TOKEN ?? '',
    onNewMessage,
  })
);
```

You will need to verify the webhook with Facebook. You can either deploy this to a server or deploy locally and use ngrok, the @tawn33y tutorial above has a section about using ngrok and verifying.

This library has been tested on v15.0 and v17.0 of the webhook API.

### Sending messages

First, create a sender like this:

```ts
const sender = createMessageSender(
  // fill your own values here:
  process.env.NUMBER_ID ?? '',
  process.env.ACCESS_TOKEN ?? ''
);
```

To send a message you can check [this guide](https://github.com/tawn33y/whatsapp-cloud-api/blob/v0.2.6/API.md#api-reference) (omit `createBot`, `startExpressServer` and `on` as those were removed here). You can find some examples in [there too](https://github.com/tawn33y/whatsapp-cloud-api/tree/v0.2.6).

Here is an "almost complete" example of the integration using Google Cloud Functions and Firestore to display the messages using [this](https://github.com/j05u3/chats_manager): https://gist.github.com/j05u3/b3ad1d5d9106a918941587e03c1919b1, let me know if you have any questions/doubts ✌️.

[build-img]: https://github.com/j05u3/whatsapp-cloud-api-express/actions/workflows/release.yml/badge.svg
[build-url]: https://github.com/j05u3/whatsapp-cloud-api-express/actions/workflows/release.yml
[downloads-img]: https://img.shields.io/npm/dt/whatsapp-cloud-api-express
[downloads-url]: https://www.npmtrends.com/whatsapp-cloud-api-express
[npm-img]: https://img.shields.io/npm/v/whatsapp-cloud-api-express
[npm-url]: https://www.npmjs.com/package/whatsapp-cloud-api-express
[issues-img]: https://img.shields.io/github/issues/j05u3/whatsapp-cloud-api-express
[issues-url]: https://github.com/j05u3/whatsapp-cloud-api-express/issues
[codecov-img]: https://codecov.io/gh/j05u3/whatsapp-cloud-api-express/branch/main/graph/badge.svg
[codecov-url]: https://codecov.io/gh/j05u3/whatsapp-cloud-api-express
[semantic-release-img]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release
[commitizen-img]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[commitizen-url]: http://commitizen.github.io/cz-cli/

## Some recommendations

* If you are using serverless I suggest to set min instances (in Google Cloud Functions) or reserved concurrency (in AWS) to at least 1 (~4 USD or less in monthly cost) so your bot responds fast without being affected by cold starts.

* Make sure to **only allowlist** the Facebook IPs in your serverless environment. See [here](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks/#ip-addresses) for the IPs.

* Make sure your `onNewMessage` function resolves in a 'reasonable time'. Not sure how long yet, but in a project where we were sleeping one minute Whatsapp servers started retrying the call to the webhook.

## Related work

I built an open-source [chats visualization frontend here](https://github.com/j05u3/chats_manager) that you can use to visualize your chats, it's compatible with this library ✌️.

I also built [monaguillo.org](https://monaguillo.org) using this library.

## Attribution

This project was based on https://github.com/j05u3/whatsapp-cloud-api which is a fork of https://github.com/tawn33y/whatsapp-cloud-api. Thanks to @tawn33y and the community for the hard work.

This project was started using the template: https://github.com/ryansonshine/typescript-npm-package-template.
