import React from 'react';

export enum ItemContentType {
  articles,
  assignments
}

export interface ItemContentTypeContextValue {
  contentType: ItemContentType | null;
  changeContentType: (type: ItemContentType) => void;
}

export const ItemContentTypeContext = React.createContext<ItemContentTypeContextValue>({
  contentType: null,
  changeContentType: type => null,
});
