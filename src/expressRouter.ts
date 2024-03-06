import { Request, Response } from 'express-serve-static-core';
import { FreeFormObject } from './utils/misc';
import {
  InteractiveType,
  Message,
  MessageType,
  Status,
  StatusReceived,
} from './createBot.types';
import { Router } from 'express';
import { logRequest } from './utils/logRequestMiddleware';
import { createHmac } from 'crypto';

function webhookVerifyTokenHandler(webhookVerifyToken: string) {
  return (
    req: Request<
      Record<string, unknown>,
      any,
      any,
      qs.ParsedQs,
      Record<string, any>
    >,
    res: Response
  ): void => {
    if (!req.query) {
      res.sendStatus(403);
      return;
    }

    const mode = req.query['hub.mode'];
    const verifyToken = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (!mode || !verifyToken || !challenge) {
      res.sendStatus(403);
      return;
    }

    if (mode === 'subscribe' && verifyToken === webhookVerifyToken) {
      // eslint-disable-next-line no-console
      console.log('✔️ Webhook verified');
      res.setHeader('content-type', 'text/plain');
      res.send(challenge);
      return;
    }

    res.sendStatus(403);
  };
}

function webhookMainHandler(
  onNewMessage: (message: Message) => Promise<void>,
  appSecret: string | null,
  onStatusChange?: (status: Status) => Promise<void>
) {
  if (appSecret == null) {
    // show a warning if the appSecret is not set
    console.warn(
      '[Warning❗] The appSecret is not set. ' +
        'This means that the request signature will not be verified. ' +
        'This is not recommended for production environments. ' +
        'Alternatively, you can verify facebook servers IPs: ' +
        ' https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks/#ip-addresses'
    );
  }
  return (
    req: Request<
      Record<string, unknown>,
      any,
      {
        object?: unknown;
        entry?: {
          changes?: {
            value?: {
              metadata?: {
                phone_number_id?: string;
              };
              messages?: {
                from?: string;
                id?: string;
                timestamp?: string;
                type?: MessageType;
                text?: {
                  body?: FreeFormObject;
                };
                interactive?: {
                  type?: InteractiveType;
                  list_reply?: FreeFormObject;
                  button_reply?: FreeFormObject;
                };
                [others: string]: unknown;
              }[];
              statuses?: StatusReceived[];
              contacts?: {
                profile?: {
                  name?: string;
                  [others: string]: unknown;
                };
                [others: string]: unknown;
              }[];
            };
          }[];
        }[];
      },
      qs.ParsedQs,
      Record<string, any>
    >,
    res: Response
  ): void => {
    (async () => {
      if (!req.body.object || !req.body.entry) {
        res.sendStatus(400);
        return;
      }

      //// validate the request
      if (appSecret != null) {
        // get raw body
        // TODO: find/expose a way to get rawBody in other environments, maybe suggest the user to use a middleware
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const buf = (req as any).rawBody as Buffer | undefined; // this works in Google Cloud Functions https://issuetracker.google.com/issues/36252545?pli=1

        if (buf == null) {
          console.error(
            '[verify] No rawBody found in the request, check your serverless environment ' +
              'configuration and/or use a middleware like the "verify"' +
              ' function in express.json, see https://flaviocopes.com/express-get-raw-body'
          );
          res.sendStatus(403);
          return;
        }

        const signature256HeaderPossiblyArray =
          req.headers['X-Hub-Signature-256'] ??
          req.headers['x-hub-signature-256'];

        // concat signature256 if it a string[] to a single string
        const signature256Header =
          (Array.isArray(signature256HeaderPossiblyArray)
            ? signature256HeaderPossiblyArray.join('')
            : signature256HeaderPossiblyArray) ?? '';

        // remove the prefix if it exists
        const SIGNATURE_PREFIX = 'sha256=';
        const signature256 = signature256Header.startsWith(SIGNATURE_PREFIX)
          ? signature256Header.slice(SIGNATURE_PREFIX.length)
          : signature256Header;

        // validate signature256 is not empty
        if (signature256 == null || signature256 === '') {
          console.error(
            '[verify] No signature found, headers: ' +
              JSON.stringify(req.headers)
          );
          res.sendStatus(403);
          return;
        }
        const hash = createHmac('sha256', appSecret).update(buf).digest('hex');
        if (hash != signature256) {
          console.error('[verify] Signature verification failed');
          res.sendStatus(403);
          return;
        }
        console.log('[verify] ✅ Signature verification passed');
      }

      for (const entry of req.body.entry) {
        for (const change of entry.changes ?? []) {
          const { value } = change;
          if (value != null) {
            const toPhoneNumberId = value.metadata?.phone_number_id ?? '';
            // processing messages
            // https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components#messages-object
            for (const message of value.messages ?? []) {
              const { from, id, timestamp, type, text, interactive, ...rest } =
                message;

              let event: InteractiveType | MessageType | undefined;
              let data: FreeFormObject | undefined;

              switch (type) {
                case 'text':
                  event = type;
                  data = { text: text?.body };
                  break;

                case 'image':
                case 'document':
                case 'audio':
                case 'video':
                case 'sticker':
                case 'location':
                case 'button': // template button reply
                case 'contacts':
                  event = type;
                  data = rest[type] as FreeFormObject;
                  break;

                case 'interactive': // e.g. when the user replies to a sendReplyButtons message
                  event = interactive?.type;
                  data = {
                    ...(interactive?.list_reply ?? interactive?.button_reply),
                  };
                  break;

                default:
                  break;
              }

              if (rest.context) {
                data = {
                  ...data,
                  context: rest.context,
                };
              }

              const name = value.contacts?.[0]?.profile?.name ?? undefined;

              if (event && data) {
                const payload: Message = {
                  from: from ?? '',
                  name,
                  id: id ?? '',
                  timestamp: timestamp ?? '',
                  type: event,
                  data,
                  to_phone_number_id: toPhoneNumberId,
                };
                try {
                  await onNewMessage(payload);
                } catch (error) {
                  console.error(error);
                }
              }
            }
            // processing statuses
            // https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components#statuses-object
            for (const _status of value.statuses ?? []) {
              const payload: Status = {
                ..._status,
                to_phone_number_id: toPhoneNumberId,
              };
              try {
                await onStatusChange?.(payload);
              } catch (error) {
                console.error(error);
              }
            }
          }
        }
      }

      res.sendStatus(200);
      // eslint-disable-next-line @typescript-eslint/no-empty-function
    })().then(() => {}, console.error);
  };
}

export interface WebhookRouterOptions {
  /**
   * The app secret is used to verify the request signature.
   * If null, the request signature will not be verified.
   */
  appSecret: string | null;
  webhookVerifyToken: string;
  onNewMessage: (message: Message) => Promise<void>;
  webhookPath?: string;
  onStatusChange?: (status: Status) => Promise<void>;
  /**
   * Log all entrant requests to console.
   * Remember that the Whatsapp servers make requests to this webhook with new incoming messages and statuses.
   * This option is useful for debugging.
   */
  logAllEntrantRequests?: boolean;
}

export function getWebhookRouter(options: WebhookRouterOptions): Router {
  const r = Router();

  if (options.logAllEntrantRequests) {
    // log request URL and body
    r.use(logRequest);
  }

  // endpoints for webhook
  r.get(
    options.webhookPath ?? '/',
    webhookVerifyTokenHandler(options.webhookVerifyToken)
  );
  r.post(
    options.webhookPath ?? '/',
    webhookMainHandler(
      options.onNewMessage,
      options.appSecret,
      options.onStatusChange
    )
  );

  return r;
}
