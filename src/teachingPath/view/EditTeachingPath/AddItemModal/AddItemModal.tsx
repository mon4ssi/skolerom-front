import React, { Component } from 'react';
import onClickOutside from 'react-onclickoutside';
import isNull from 'lodash/isNull';
import intl from 'react-intl-universal';

import { ItemContentTypeContext } from '../ItemContentTypeContext';
import { AssignmentsList } from './AssignmentsList/AssignmentsList';
import { ArticlesList } from './ArticlesList/ArticlesList';
import { DomainModal } from './DomainModal/DomainModal';

import './AddItemModal.scss';
const num2 = 2;

class AddItemComponent extends Component {
  public static contextType = ItemContentTypeContext;
  public renderModalContent = () => {
    const { contentType } = this.context;
    switch (contentType) {
      case 0:
        return <ArticlesList />;
      case 1:
        return <AssignmentsList />;
      case num2:
        return <DomainModal />;
      default:
        return;
    }
  }

  public handleClickOutside = () => {
    this.context.changeContentType(null);
  }
  public render() {
    const { contentType } = this.context;
    const classN = `addItemModal background_${contentType}`;
    return (
        <div className={classN}>
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
