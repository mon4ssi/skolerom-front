import React, { Component } from 'react';
import intl from 'react-intl-universal';
import submitAnswersIcon from 'assets/images/submit-answers.svg';
import './SubmitTeachingPath.scss';

interface Props {
  onSubmit(): void;
  onDelete(): void;
}

export class SubmitTeachingPath extends Component<Props> {
  public render() {
    return (
      <div className="SubmitTeachingPath">
        <div className="SubmitTeachingPath__title">
          {intl.get('teaching path passing.complete.title')}
        </div>

        <div className="SubmitTeachingPath__description">
          {intl.get('teaching path passing.complete.description')}
        </div>

        {/*<button className="SubmitTeachingPath__deleteButton" onClick={this.props.onDelete}>*/}
        {/*  {intl.get('teaching path passing.complete.delete_all_answers')}*/}
        {/*</button>*/}

        <button
          className="SubmitTeachingPath__button"
          onClick={this.props.onSubmit}
          title={intl.get('current_assignment_page.submit')}
        >
          <img
            className="SubmitTeachingPath__buttonImage"
            src={submitAnswersIcon}
            alt={intl.get('current_assignment_page.submit')}
            title={intl.get('current_assignment_page.submit')}
          />
          {intl.get('teaching path passing.complete.button')}
        </button>
      </div>
    );
  }
}
