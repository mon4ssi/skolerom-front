import React, { Component } from 'react';
import onClickOutside from 'react-onclickoutside';
import isNull from 'lodash/isNull';

import { ItemContentTypeContext } from '../ItemContentTypeContext';
import { AssignmentsList } from './AssignmentsList/AssignmentsList';
import { ArticlesList } from './ArticlesList/ArticlesList';

import './AddItemModal.scss';

class AddItemComponent extends Component {
  public static contextType = ItemContentTypeContext;

  public renderModalContent = () => {
    const { contentType } = this.context;
    switch (contentType) {
      case 0:
        return <ArticlesList />;
      case 1:
        return <AssignmentsList />;
      default:
        return;
    }
  }

  public handleClickOutside = () => {
    this.context.changeContentType(null);
  }

  public render() {
    return (
        <div className="addItemModal">
          {this.renderModalContent()}
        </div>
    );
  }
}

const AddItemModalComponent = onClickOutside(AddItemComponent);

export class AddItemModal extends Component {
  public static contextType = ItemContentTypeContext;

  public render() {
    const { contentType } = this.context;

    return !isNull(contentType) && (
      <div className="addItemModalBackground flexBox paymenth">
        <AddItemModalComponent />
      </div>
    );
  }
}
