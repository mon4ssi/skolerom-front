import React, { Component } from 'react';
import intl from 'react-intl-universal';

import clockImg from 'assets/images/clock-grey.svg';
import questionImg from 'assets/images/questions-grey.svg';
import levelImg from 'assets/images/level-3-grey.svg';
import likeImg from 'assets/images/is-liked-grey.svg';

import './Versions.scss';

export class Versions extends Component {

  public renderVersion = () => (
    <div className="version">

      <div className="flexBox spaceBetween">
        <p className="versionTitle">
          {intl.get('publishing_page.by_teacher', { teacher: 'Ola Nordmann' })}
        </p>
        <p className="versionDate fw300">
          17/08/19
        </p>
      </div>

      <div className="versionInfo flexBox spaceBetween">
        <div>
          <img src={clockImg} alt="clock" className={'clock'}/>
          <span className={'fs13'}>{intl.get('publishing_page.minutes_number', { minutes: 14 })}</span>
        </div>

        <div>
          <img src={questionImg} alt="question" className={'question'}/>
          <span className={'fs13'}>{intl.get('publishing_page.questions_number', { questions: 11 })}</span>
        </div>

        <div>
          <img src={levelImg} alt="level" className={'level'}/>
          <span className={'fs13'}>2</span>
        </div>

        <div>
          <img src={likeImg} alt="like" className={'like'}/>
          <span className={'fs13'}>7</span>
        </div>
      </div>

    </div>
  )

  public render() {
    return (
      <div className="Versions w50">
        <div className="versionsHeader flexBox spaceBetween alignCenter">
          <p>
            5 {intl.get('assignment preview.versions')}
          </p>

          <select className="select" disabled>
            <option>
              {intl.get('assignment preview.By date')}
            </option>
          </select>
        </div>

        <div className="versionsList flexBox dirColumn">
          {this.renderVersion()}
          {this.renderVersion()}
          {this.renderVersion()}
          {this.renderVersion()}
          {this.renderVersion()}
          {this.renderVersion()}
          {this.renderVersion()}
          {this.renderVersion()}
          {this.renderVersion()}
        </div>

      </div>
    );
  }
}
