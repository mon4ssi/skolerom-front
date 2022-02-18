import React, { Component, createRef } from 'react';
import { inject } from 'mobx-react';
import intl from 'react-intl-universal';
import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';
import { Location } from 'history';

import { CurrentQuestionaryStore } from 'assignment/view/CurrentAssignmentPage/CurrentQuestionaryStore';

import goToAccountIcon from 'assets/images/exit.svg';
import thumbsUp from 'assets/images/thumbs-up.svg';
import pinkThumb from 'assets/images/thumbs-up-pink.svg';

import './Submitted.scss';

interface LocationState {
  originPath: string;
  title: string;
  isTeachingPath?: boolean;
}

type LocataionProps = Location<LocationState>;

interface Props extends RouteComponentProps {
  currentQuestionaryStore?: CurrentQuestionaryStore;
  location: LocataionProps;
}

@inject('currentQuestionaryStore')
class Submitted extends Component<Props> {
  public refbutton = createRef<HTMLButtonElement>();
  private goToDashboard = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    this.props.history.push(this.props.location.state!.originPath);
  }

  private renderDescriptionIfNeeded = () => this.props.location.state!.isTeachingPath && (
    <div className="Submitted__description">
      {intl.get('current_assignment_page.submited_description_part_1')}
    </div>
  )

  public componentDidMount() {
    if (this.refbutton.current) {
      this.refbutton.current!.focus();
    }
  }

  public render() {
    const { state } = this.props.location;
    const img = state && state.isTeachingPath ? pinkThumb : thumbsUp;

    return state ? (
      <div className="Submitted">
        <div className="Submitted__container">
          <img className="Submitted__image" src={img} alt="Thumbs up"/>
          <div className="Submitted__title">{intl.get(state!.title)}</div>
          {this.renderDescriptionIfNeeded()}
          <button
            className="Submitted__button"
            onClick={this.goToDashboard}
            title={intl.get('current_assignment_page.submited_button_title')}
            ref={this.refbutton}
          >
            <img className="Submitted__buttonImage" src={goToAccountIcon} title={intl.get('current_assignment_page.submited_button_title')} alt="Go to account" />
            {intl.get('current_assignment_page.submited_button_title')}
          </button>
        </div>
      </div>
    ) : <Redirect to="/activity" />;
  }
}

const SubmittedWithRouter = withRouter(Submitted);
export { SubmittedWithRouter as Submitted };
