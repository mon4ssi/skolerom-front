import React, { Component, MouseEvent } from 'react';
import { RouteComponentProps, withRouter, Redirect } from 'react-router-dom';
import { Location } from 'history';
import intl from 'react-intl-universal';

import { CreateButton } from '../../../common/CreateButton/CreateButton';

import thumbImg from 'assets/images/thumbs-up-pink.svg';
import arrowLeftImg from 'assets/images/arrow-left-rounded-white.svg';

import './ConfirmationPage.scss';

type LocationState = Location<{
  entityType: string;
  editPath: string;
  exitPath: string;
}>;

interface Props extends RouteComponentProps {
  location: LocationState;
}

class ConfirmationPageComponent extends Component<Props> {

  private handleEditClick = (e: MouseEvent<HTMLSpanElement>) => {
    const { history, location: { state } } = this.props;
    e.preventDefault();

    history.push(state.editPath);
  }

  private handleGoBackClick = () => {
    /* console.log('going back!!'); */
    const { history, location: { state } } = this.props;
    /* console.log(state!.exitPath); */
    history.push(state.exitPath);
    const url: string = localStorage!.getItem('url') !== null ? localStorage!.getItem('url')!.toString().split('?')[1] : '';
    /* console.log(url); */
    if (url !== null && url !== '' && url !== undefined) {
      /* console.log('es trueeee'); */
      /* console.log(url); */
      this.props.history.push(`/teaching-paths/all?${url}`);
      localStorage.removeItem('url');
    } else {
      /* console.log('es falseee'); */
      localStorage.removeItem('url');
    }
  }

  public render() {
    const { state } = this.props.location;

    return state ? (
      <div className="ConfirmationPage_container">
        <img
          src={thumbImg}
          alt="thumb"
          className="ConfirmationPage_thumb"
        />

        <div className="ConfirmationPage_title">
          {intl.get('distribution_page.after_distribution.title', { entity: intl.get(state.entityType) })}
        </div>

        <div className="ConfirmationPage_body">
          {intl.get('distribution_page.after_distribution.body_part_1')} {' '}
          <span
            className="ConfirmationPage_edit"
            onClick={this.handleEditClick}
          >
            {intl.get('distribution_page.after_distribution.body_part_2', { entity: intl.get(state.entityType) })}
          </span>
        </div>

        <CreateButton className={'backButton'} onClick={this.handleGoBackClick} title={intl.get('distribution_page.after_distribution.go_to_my_account')}>
          <div>
            <img src={arrowLeftImg} alt="exit"/>
            <span>{intl.get('distribution_page.after_distribution.go_to_my_account')}</span>
          </div>
        </CreateButton>
      </div>
    ) : <Redirect to="/activity" />;
  }
}

export const ConfirmationPage = withRouter(ConfirmationPageComponent);
