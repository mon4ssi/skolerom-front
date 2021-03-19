import React, { Component, FunctionComponent } from 'react';
import './AssignmentPreview.scss';
import intl from 'react-intl-universal';

import clockIcon from 'assets/images/clock.svg';
import questionsIcon from 'assets/images/questions.svg';
import level2Icon from 'assets/images/level-2.svg';
import isLikedIcon from 'assets/images/is-liked.svg';

export interface User {
  name: string;
  avatar?: string;
}

export interface UserResult {
  id: string;
  user: User;
  time: number;
  date: string;
  level: number;
  questions: number;
  likes: number;
}

const renderUserResult: FunctionComponent<UserResult> = (userResult) => {
  const key = `${userResult.id}_${Math.random()}`;
  return (
    <li key={key} className="recentUser">
      <div className="by flexBox spaceBetween">
        {intl.get('assignment preview.By')} {userResult.user.name}{' '}
        <span className="date">{userResult.date}</span>
      </div>

      <div className="indicators flexBox spaceBetween">
        <div className="flexBox alignCenter">
          <img src={clockIcon} alt="Completion time" /> {userResult.time}{' '}
          {intl.get('assignment preview.m')}
        </div>

        <div className="flexBox alignCenter">
          <img src={questionsIcon} alt="Questions" /> {userResult.questions}{' '}
          {intl.get('assignment preview.que')}
        </div>

        <div className="flexBox alignCenter">
          <img src={level2Icon} alt="Level" />{' '}
          {intl.get('assignment preview.Level')} {userResult.level}
        </div>

        <div className="flexBox alignCenter">
          <img src={isLikedIcon} alt="Likes" /> {userResult.likes}
        </div>
      </div>
    </li>
  );
};

export class AssignmentPreview extends Component {
  public render() {
    // const { assignment } = this.props;
    // const { author } = assignment;
    // const backgroundStyles = {
    //   background: `url(${assignment.image}) no-repeat center`,
    //   backgroundSize: "cover"
    // };

    return (
      <div className="AssignmentPreview">
        {/* tslint:disable-next-line:jsx-no-multiline-js */}
        {/* <div className="header flexBox alignCenter" style={backgroundStyles}>
          <div className="assignmentIcon flexBox alignCenter">
            {intl.get("assignment preview.ASSIGNMENT")}
          </div>

          <h2>{assignment.title}</h2>

          <div className="author flexBox alignCenter">
            <img src={author.avatar} alt={author.name} />

            <div className="description">
              <div className="by">
                <span>{intl.get("assignment preview.By")}</span> {author.name}
              </div>

              <div className="date">{intl.get("months.November")} 4, 2019</div>
            </div>
          </div>
        </div>

        <div className="details flexBox alignCenter">
          <div className="flexBox alignCenter">
            <img src={clockIcon} alt="Completion time" /> 17{" "}
            {intl.get("assignment preview.min completion time")}
          </div>

          <div className="flexBox alignCenter">
            <img src={questionsIcon} alt="Questions" /> 13{" "}
            {intl.get("assignment preview.questions")}
          </div>

          <div className="flexBox alignCenter">
            <img src={level2Icon} alt="Level" />
            {intl.get("assignment preview.Level")} 2
          </div>
        </div>

        <div className="previewData flexBox">
          <div className="sort w50">
            <div className="flexBox spaceBetween">
              4 {intl.get("assignment preview.versions")}
              <Select options={[intl.get("assignment preview.By date")]} />
            </div>

            <ul className="recentUsers">
              {assignment.results.map(renderUserResult)}
            </ul>
          </div>

          <div className="statistics w50">
            <div>{intl.get("assignment preview.Statistics")}</div>

            <ul>
              <li className="indicators flexBox alignCenter spaceBetween">
                <div className="countWrapper">
                  <span className="count">121</span>{" "}
                  <span className="phrase">
                    {intl.get("assignment preview.VIEWS")}
                  </span>
                </div>
                <img src={viewsIcon} alt="Vies" />
              </li>

              <li className="indicators flexBox alignCenter spaceBetween">
                <div className="countWrapper">
                  <span className="count">23</span>

                  <span className="phrase">
                    {intl.get(
                      "assignment preview.STUDENTS HAVE COMPLETED ASSIGNMENT"
                    )}
                  </span>
                </div>
                <img src={completedIcon} alt="Vies" />
              </li>

              <li className="indicators flexBox alignCenter spaceBetween">
                <div className="countWrapper">
                  <span className="count">14</span>

                  <span className="phrase">
                    {intl.get(
                      "assignment preview.TEACHERS HAVE USED ASSIGNMENT WITH THEIR STUDENTS"
                    )}
                  </span>
                </div>
                <img src={withStudentsIcon} alt="Vies" />
              </li>
            </ul>
          </div>
        </div>

        <div className="gradient" />

        <div className="options flexBox spaceBetween alignCenter">
          <NavLink className="previewOption flexBox alignCenter" to="#">
            {intl.get("assignment preview.View assignment")}
          </NavLink>

          <NavLink className="previewOption flexBox alignCenter" to="#">
            {intl.get("assignment preview.Edit assignment")}
          </NavLink>

          <NavLink className="previewOption flexBox alignCenter" to="#">
            {intl.get("assignment preview.View answers")}
          </NavLink>
        </div> */}
      </div>
    );
  }
}
