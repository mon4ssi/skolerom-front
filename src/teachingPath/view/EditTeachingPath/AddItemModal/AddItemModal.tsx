import React, { Component } from 'react';
import onClickOutside from 'react-onclickoutside';
import isNull from 'lodash/isNull';

import { ItemContentTypeContext } from '../ItemContentTypeContext';
import { AssignmentsList } from './AssignmentsList/AssignmentsList';
import { ArticlesList } from './ArticlesList/ArticlesList';

import './AddItemModal.scss';

class AddItemComponent extends Component {
  public static contextType = ItemContentTypeContext;
  public state = {
    greeddata: false
  };

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

  public renderInformationContent = () => {
    const { greeddata } = this.state;
    return <div>Unique Information</div>;
  }

  public renderInformationContentDefault = () => {
    const { greeddata } = this.state;
    return <div>Default</div>;
  }

  public conditionalGreedData = () => {
    const { greeddata } = this.state;
    if (greeddata) {
      this.renderInformationContent();
    }
    return this.renderInformationContentDefault();
  }

  public render() {
    return (
        <div className="addItemModal">
          <div className="addItemModal__content">
            <div className="addItemModal__left">
              {this.conditionalGreedData()}
            </div>
            <div className="addItemModal__right">
              {this.renderModalContent()}
            </div>
          </div>
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
