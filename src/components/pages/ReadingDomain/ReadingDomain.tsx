import React, { Component, MouseEvent } from 'react';
import back from 'assets/images/back-arrow-dark.svg';
import intl from 'react-intl-universal';
import classnames from 'classnames';
import isNull from 'lodash/isNull';

import { Domain } from 'assignment/Assignment';

import { CreateButton } from 'components/common/CreateButton/CreateButton';

import './ReadingDomain.scss';
const PATHLENGTH = 4;
interface Props {
  titleCurrentDomain: string;
  shownDomainId?: number | null;
  shownDomainUrl?: string;
  closeArticle(): void;
  finishReading(graduation: number): void;
}

interface State {
  graduation: number | null;
}

export class ReadingDomain extends Component<Props, State> {

  public state = {
    graduation: null,
  };

  public finishReading = () => {
    this.props.finishReading(this.state.graduation!);
  }

  public handleKeyboardControl = (event: KeyboardEvent) => {
    const path = event.composedPath().length;
    const htmlPathArea = String(event.composedPath()[0]);
    const htmlText = '[object HTMLTextAreaElement]';
    const inputText = '[object HTMLInputElement]';
    if (event.shiftKey && event.key === 'F' || event.shiftKey && event.key === 'f') {
      this.props.finishReading(this.state.graduation!);
    }
  }

  public componentDidMount() {
    document.addEventListener('keyup', this.handleKeyboardControl);
  }

  public render() {
    const { closeArticle, titleCurrentDomain, shownDomainUrl } = this.props;

    return (
      <div className="ReadingArticle">
        <div className="ReadingArticle__headerWrapper">
          <div className="ReadingArticle__header">
            <button className="ReadingArticle__backButton" onClick={closeArticle} title="back">
              <img src={back} alt="back" title="back" />
              <span className="ReadingArticle__backButtonText">
                {intl.get('header.Article')}: {titleCurrentDomain}
              </span>
            </button>
            <div className="ReadingArticle__finishButton">
              <CreateButton
                children={intl.get('assignment preview.Finish reading article')}
                onClick={this.finishReading}
                title={intl.get('assignment preview.Finish reading article')}
              />
            </div>
          </div>
        </div>

        <div className="ReadingArticle__content">
          <iframe
            width="100%"
            height="100%"
            src={shownDomainUrl}
            title={titleCurrentDomain}
          />
        </div>

      </div>
    );
  }
}
