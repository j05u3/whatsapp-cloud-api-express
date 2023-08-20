import { Application } from 'express';
import { Request, Response } from 'express-serve-static-core';
import { Server } from 'http';
import { FreeFormObject } from './utils/misc';
import { Message, Status, StatusReceived } from './createBot.types';

export interface ServerOptions {
  app?: Application;
  useMiddleware?: (app: Application) => void;
  port?: number;
  webhookPath?: string;
  webhookVerifyToken?: string;
}

export interface ExpressServer {
  server?: Server;
  app: Application;
}

export function webhookVerifyTokenHandler(webhookVerifyToken: string) {
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

export function webhookMainHandler(
  onNewMessage: (message: Message) => Promise<void>,
  onStatusChange?: (status: Status) => Promise<void>,
  logAllEntrantRequests?: boolean
) {
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
                type?: string;
                text?: {
                  body?: FreeFormObject;
                };
                interactive?: {
                  type?: string;
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
      if (logAllEntrantRequests) {
        console.log(JSON.stringify(req.body));
      }

      if (!req.body.object || !req.body.entry) {
        res.sendStatus(400);
        return;
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

              let event: string | undefined;
              let data: FreeFormObject | undefined;

              switch (type) {
                case 'text':
                  event = 'text';
                  data = { text: text?.body };
                  break;

                case 'image':
                case 'document':
                case 'audio':
                case 'video':
                case 'sticker':
                case 'location':
                case 'button':
                case 'contacts':
                  event = type;
                  data = rest[type] as FreeFormObject;
                  break;

                case 'interactive':
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
                await onNewMessage(payload);
              }
            }
            // processing statuses
            // https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components#statuses-object
            for (const _status of value.statuses ?? []) {
              const payload: Status = {
                ..._status,
                to_phone_number_id: toPhoneNumberId,
              };
              await onStatusChange?.(payload);
            }
          }
        }
      }

      res.sendStatus(200);
      // eslint-disable-next-line @typescript-eslint/no-empty-function
    })().then(() => {}, console.error);
  };
}