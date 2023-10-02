import isURL from 'validator/lib/isURL';
import { ICreateMessageSender } from './createBot.types';
import {
  MediaBase,
  TextMessage,
  MediaMessage,
  LocationMessage,
  TemplateMessage,
  ContactMessage,
  InteractiveMessage,
  ReactionMessage,
} from './messages.types';
import { sendRequestHelper } from './sendRequestHelper';

interface PayloadBase {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  context?: string;
}

const payloadBase: PayloadBase = {
  messaging_product: 'whatsapp',
  recipient_type: 'individual',
};

export const createMessageSender: ICreateMessageSender = (
  fromPhoneNumberId,
  accessToken,
  responseLogger
) => {
  const sendRequest = sendRequestHelper(
    fromPhoneNumberId,
    accessToken,
    responseLogger
  );

  const getMediaPayload = (urlOrObjectId: string, options?: MediaBase) => ({
    ...(isURL(urlOrObjectId) ? { link: urlOrObjectId } : { id: urlOrObjectId }),
    caption: options?.caption,
    filename: options?.filename,
  });

  return {
    sendText: (to, text, options) =>
      sendRequest<TextMessage>({
        ...payloadBase,
        context: options?.reply ? { message_id: options?.reply } : undefined,
        to,
        type: 'text',
        text: {
          body: text,
          preview_url: options?.preview_url,
        },
      }),

    sendMessage(to, text, options) {
      return this.sendText(to, text, options);
    },
    sendReaction: (to, emoji, message_id) =>
      sendRequest<ReactionMessage>({
        ...payloadBase,
        to,
        type: 'reaction',
        reaction: {
          emoji: emoji,
          message_id: message_id,
        },
      }),
    sendImage: (to, urlOrObjectId, options) =>
      sendRequest<MediaMessage>({
        ...payloadBase,
        context: options?.reply ? { message_id: options?.reply } : undefined,
        to,
        type: 'image',
        image: getMediaPayload(urlOrObjectId, options),
      }),
    sendDocument: (to, urlOrObjectId, options) =>
      sendRequest<MediaMessage>({
        ...payloadBase,
        context: options?.reply ? { message_id: options?.reply } : undefined,
        to,
        type: 'document',
        document: getMediaPayload(urlOrObjectId, options),
      }),
    sendAudio: (to, urlOrObjectId, options) =>
      sendRequest<MediaMessage>({
        ...payloadBase,
        context: options?.reply ? { message_id: options?.reply } : undefined,
        to,
        type: 'audio',
        audio: getMediaPayload(urlOrObjectId),
      }),
    sendVideo: (to, urlOrObjectId, options) =>
      sendRequest<MediaMessage>({
        ...payloadBase,
        context: options?.reply ? { message_id: options?.reply } : undefined,
        to,
        type: 'video',
        video: getMediaPayload(urlOrObjectId, options),
      }),
    sendSticker: (to, urlOrObjectId, options) =>
      sendRequest<MediaMessage>({
        ...payloadBase,
        context: options?.reply ? { message_id: options?.reply } : undefined,
        to,
        type: 'sticker',
        sticker: getMediaPayload(urlOrObjectId),
      }),
    sendLocation: (to, latitude, longitude, options) =>
      sendRequest<LocationMessage>({
        ...payloadBase,
        context: options?.reply ? { message_id: options?.reply } : undefined,
        to,
        type: 'location',
        location: {
          latitude,
          longitude,
          name: options?.name,
          address: options?.address,
        },
      }),
    sendTemplate: (to, name, languageCode, components) =>
      sendRequest<TemplateMessage>({
        ...payloadBase,
        to,
        type: 'template',
        template: {
          name,
          language: {
            code: languageCode,
          },
          components,
        },
      }),
    sendContacts: (to, contacts, options) =>
      sendRequest<ContactMessage>({
        ...payloadBase,
        context: options?.reply ? { message_id: options?.reply } : undefined,
        to,
        type: 'contacts',
        contacts,
      }),
    sendReplyButtons: (to, bodyText, buttons, options) =>
      sendRequest<InteractiveMessage>({
        ...payloadBase,
        context: options?.reply ? { message_id: options?.reply } : undefined,
        to,
        type: 'interactive',
        interactive: {
          body: {
            text: bodyText,
          },
          ...(options?.footerText
            ? {
                footer: { text: options?.footerText },
              }
            : {}),
          header: options?.header,
          type: 'button',
          action: {
            buttons: Object.entries(buttons).map(([key, value]) => ({
              type: 'reply',
              reply: {
                title: value,
                id: key,
              },
            })),
          },
        },
      }),
    sendList: (to, buttonName, bodyText, sections, options) =>
      sendRequest<InteractiveMessage>({
        ...payloadBase,
        context: options?.reply ? { message_id: options?.reply } : undefined,
        to,
        type: 'interactive',
        interactive: {
          body: {
            text: bodyText,
          },
          ...(options?.footerText
            ? {
                footer: { text: options?.footerText },
              }
            : {}),
          header: options?.header,
          type: 'list',
          action: {
            button: buttonName,
            sections: Object.entries(sections).map(([key, value]) => ({
              title: key,
              rows: value,
            })),
          },
        },
      }),
  };
};
