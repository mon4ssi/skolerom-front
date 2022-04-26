import React from 'react';

export enum AttachmentContentType {
  text,
  magazine,
  customImage,
  image,
  video,
  sound,
  articles
}

export interface AttachmentContentTypeContextValue {
  contentType: AttachmentContentType | null;
  changeContentType: (type: AttachmentContentType) => void;
}

export const AttachmentContentTypeContext = React.createContext<AttachmentContentTypeContextValue>({
  contentType: null,
  changeContentType: type => null,
});
