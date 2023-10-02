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
        to,
        type: 'image',
        image: getMediaPayload(urlOrObjectId, options),
      }),
    sendDocument: (to, urlOrObjectId, options) =>
      sendRequest<MediaMessage>({
        ...payloadBase,
        to,
        type: 'document',
        document: getMediaPayload(urlOrObjectId, options),
      }),
    sendAudio: (to, urlOrObjectId) =>
      sendRequest<MediaMessage>({
        ...payloadBase,
        to,
        type: 'audio',
        audio: getMediaPayload(urlOrObjectId),
      }),
    sendVideo: (to, urlOrObjectId, options) =>
      sendRequest<MediaMessage>({
        ...payloadBase,
        to,
        type: 'video',
        video: getMediaPayload(urlOrObjectId, options),
      }),
    sendSticker: (to, urlOrObjectId) =>
      sendRequest<MediaMessage>({
        ...payloadBase,
        to,
        type: 'sticker',
        sticker: getMediaPayload(urlOrObjectId),
      }),
    sendLocation: (to, latitude, longitude, options) =>
      sendRequest<LocationMessage>({
        ...payloadBase,
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
    sendContacts: (to, contacts) =>
      sendRequest<ContactMessage>({
        ...payloadBase,
        to,
        type: 'contacts',
        contacts,
      }),
    sendReplyButtons: (to, bodyText, buttons, options) =>
      sendRequest<InteractiveMessage>({
        ...payloadBase,
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
