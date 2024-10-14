import {
  Contact,
  InteractiveHeader,
  TemplateComponent,
} from './messages.types';
import { SendMessageResult } from './sendRequestHelper';
import { FreeFormObject } from './utils/misc';

export interface Message {
  from: string;
  name: string | undefined;
  id: string;
  timestamp: string;
  type: MessageType | InteractiveType;
  data: FreeFormObject; // TODO: properly define interfaces for each type
  to_phone_number_id: string;
}

export interface Status extends StatusReceived {
  to_phone_number_id: string;
}

export interface StatusReceived {
  timestamp: string; // in seconds
  status: string; // 'failed', 'delivered', 'read'
  recipient_id: string; // phone number
  id: string; // id of the sent message which this status is for
  errors: StatusError[] | undefined; // array of errors
  // TODO: add the rest of the fields
}

export interface StatusError {
  code: number;
  title: string | undefined;
  error_data:
    | {
        details: string | undefined;
      }
    | undefined;
}

// from: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components
export type MessageType =
  | 'audio'
  | 'button'
  | 'document'
  | 'text'
  | 'image'
  | 'interactive'
  | 'order'
  | 'sticker'
  | 'system'
  | 'unknown'
  | 'video'
  | 'location'
  | 'contacts'
  | 'catalog'
  | 'multi_product';

export type InteractiveType = 'button_reply' | 'list_reply';

export interface Product extends Message {
  type: 'catalog';
  catalog: {
    catalog_id: string;
    body?: {
      text: string;
    };
  };
}

export interface ProductList extends Message {
  type: 'multi_product';
  interactive: {
    type: 'product_list';
    header: {
      type: 'text';
      text: string;
    };
    body: {
      text: string;
    };
    footer?: {
      text: string;
    };
    action: {
      catalog_id: string;
      sections: {
        title: string;
        product_items: {
          product_retailer_id: string;
        }[];
      }[];
    };
  };
}

export interface MessageSender {
  sendText: (
    to: string,
    text: string,
    options?: {
      preview_url?: boolean;
      reply?: string;
    }
  ) => Promise<SendMessageResult>;
  sendMessage: (
    to: string,
    text: string,
    options?: {
      preview_url?: boolean;
      reply?: string;
    }
  ) => Promise<SendMessageResult>;
  sendReaction: (
    to: string,
    emoji: string,
    message_id: string
  ) => Promise<SendMessageResult>;
  sendImage: (
    to: string,
    urlOrObjectId: string,
    options?: {
      caption?: string;
      reply?: string;
    }
  ) => Promise<SendMessageResult>;
  sendDocument: (
    to: string,
    urlOrObjectId: string,
    options?: {
      caption?: string;
      filename?: string;
      reply?: string;
    }
  ) => Promise<SendMessageResult>;
  sendAudio: (
    to: string,
    urlOrObjectId: string,
    options?: {
      reply?: string;
    }
  ) => Promise<SendMessageResult>;
  sendVideo: (
    to: string,
    urlOrObjectId: string,
    options?: {
      caption?: string;
      reply?: string;
    }
  ) => Promise<SendMessageResult>;
  sendSticker: (
    to: string,
    urlOrObjectId: string,
    options?: {
      reply?: string;
    }
  ) => Promise<SendMessageResult>;
  sendLocation: (
    to: string,
    latitude: number,
    longitude: number,
    options?: {
      name?: string;
      address?: string;
      reply?: string;
    }
  ) => Promise<SendMessageResult>;
  sendTemplate: (
    to: string,
    name: string,
    languageCode: string,
    components?: TemplateComponent[]
  ) => Promise<SendMessageResult>;
  sendContacts: (
    to: string,
    contacts: Contact[],
    options?: {
      reply?: string;
    }
  ) => Promise<SendMessageResult>;
  sendReplyButtons: (
    to: string,
    bodyText: string,
    buttons: {
      [id: string]: string | number;
    },
    options?: {
      footerText?: string;
      header?: InteractiveHeader;
      reply?: string;
    }
  ) => Promise<SendMessageResult>;
  sendList: (
    to: string,
    buttonName: string,
    bodyText: string,
    sections: {
      [sectionTitle: string]: {
        id: string | number;
        title: string | number;
        description?: string;
      }[];
    },
    options?: {
      footerText?: string;
      header?: InteractiveHeader;
      reply?: string;
    }
  ) => Promise<SendMessageResult>;
  sendProduct: (
    to: string,
    catalogId: string,
    options?: {
      body?: string;
    }
  ) => Promise<SendMessageResult>;
  sendProductList: (
    to: string,
    catalogId: string,
    headerText: string,
    bodyText: string,
    sections: {
      title: string;
      productIds: string[];
    }[],
    options?: {
      footerText?: string;
    }
  ) => Promise<SendMessageResult>;
  sendCatalog: (
    to: string,
    bodyText: string,
    options?: {
      thumbnailProductRetailerId?: string;
      footerText?: string;
    }
  ) => Promise<SendMessageResult>;
}

export type ICreateMessageSender = (
  fromPhoneNumberId: string,
  accessToken: string,
  /**
   * Optional function to log/store the request and response from the API.
   */
  responseLogger?: (obj: {
    fromPhoneNumberId: string;
    requestBody: any;
    responseSummary: SendMessageResult;
  }) => Promise<void>
) => MessageSender;
