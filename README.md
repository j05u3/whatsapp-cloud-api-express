# whatsapp-cloud-api-express

[![npm package][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Code Coverage][codecov-img]][codecov-url]
[![Commitizen Friendly][commitizen-img]][commitizen-url]
[![Semantic Release][semantic-release-img]][semantic-release-url]

> A set of Node.js and Express.js functions for sending/receiving messages using the [Whatsapp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api/). Contains typescript declarations.

## Install

```bash
npm install whatsapp-cloud-api-express
```

## Usage

```ts
import { myPackage } from 'whatsapp-cloud-api-express';

myPackage('hello');
//=> 'hello from my package'
```

## API

### myPackage(input, options?)

#### input

Type: `string`

Lorem ipsum.

#### options

Type: `object`

##### postfix

Type: `string`
Default: `rainbows`

Lorem ipsum.

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

## Related work

I built a [chats visualization frontend compatible here](https://github.com/j05u3/chats_manager) that you can use to visualize your chats ✌️.

## Attribution

This project was based on https://github.com/j05u3/whatsapp-cloud-api which is a fork of https://github.com/tawn33y/whatsapp-cloud-api. Thanks to @tawn33y and the community for the hard work.

This project was started using the template: https://github.com/ryansonshine/typescript-npm-package-template.
