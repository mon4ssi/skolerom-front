import React, { Component, SyntheticEvent } from 'react';
import intl from 'react-intl-universal';
import { Link } from 'react-router-dom';
import { LocationDescriptor } from 'history';
import onClickOutside from 'react-onclickoutside';
import { injector } from 'Injector';
import { TeachingPathService, TEACHING_PATH_SERVICE } from 'teachingPath/service';
import { UserType } from 'user/User';
import { UserService } from 'user/UserService';
import { Notification, NotificationTypes } from '../../../components/common/Notification/Notification';
import { Search, SimpleNumberData, SimpleStringData, SimpleGoalData, LvlData } from '../../Search';
import closeimg from 'assets/images/close-button.svg';
import langImg from 'assets/images/lang.svg';
import gradeImg from 'assets/images/grade.svg';
import tagsImg from 'assets/images/tags.svg';
import cogsImg from 'assets/images/cogs.svg';
import goalsImg from 'assets/images/goals.svg';

interface Props {
  item: Search;
  onClose: () => void;
}

interface State {
  modalPreview: boolean;
  modalFunction: boolean;
}
export const USER_SERVICE = 'USER_SERVICE';
class TPContent extends Component<Props, State> {
  private teachingPathService: TeachingPathService = injector.get(TEACHING_PATH_SERVICE);
  private userService: UserService = injector.get<UserService>(USER_SERVICE);

  public state = {
    modalPreview: false,
    modalFunction: false
  };
  public handleClickOutside = () => this.props.onClose();
  public close = () => this.props.onClose();
  public lvlArticles = (item: LvlData) => {
    const link = `${process.env.REACT_APP_WP_URL}?p=${item.article_id}`;
    const name = `${intl.get('assignment preview.Level')} ${item.level}`;
    return (
      <li>
        <a className="CreateButton" href={link} target="_blank">
          {name}
        </a>
      </li>
    );
  }
  public relatedArticles = () => {
    const {
        relatedArticles
    } = this.props.item;
    if (relatedArticles && relatedArticles.length > 0) {
      const link = `${process.env.REACT_APP_WP_URL}/undervisning/?fwp_ids==${String(relatedArticles)}`;
      return (
        <li><a href={link} target="_blank">{intl.get('edit_teaching_path.modals.articles')}</a></li>
      );
    }
  }
  public relatedTP = () => {
    const {
        relatedTp
    } = this.props.item;
    if (relatedTp && relatedTp.length > 0) {
      const link = `${process.env.REACT_APP_BASE_URL}/teaching-paths/all?articles=${String(relatedTp)}`;
      return (
        <li><a href={link} target="_blank">{intl.get('teaching path')}</a></li>
      );
    }
  }
  public relatedAssignments = () => {
    const {
        relatedAssignment
    } = this.props.item;
    if (relatedAssignment && relatedAssignment.length > 0) {
      const link = `${process.env.REACT_APP_BASE_URL}/assignments/all?articles=${String(relatedAssignment)}`;
      return (
        <li><a href={link} target="_blank">{intl.get('assignment')}</a></li>
      );
    }
  }
  public renderListNumber = (item: SimpleNumberData) => (
    <li>{item.name}</li>
  )
  public renderListString = (item: SimpleStringData) => (
    <li>{item.name}</li>
  )
  public renderListGoal = (item: SimpleGoalData) => (
    <li className="goalData">
      <div className="goalData__grade">{item.grade_name}</div>
      <div className="goalData__subject">{item.subject_name}</div>
      <div className="goalData__name">{item.name}</div>
    </li>
  )
  public changeOpenpreview = () => {
    this.setState({ modalFunction: false });
    if (this.state.modalPreview) {
      this.setState({ modalPreview: false });
    } else {
      this.setState({ modalPreview: true });
    }
  }

  public changeOpenFunction = () => {
    this.setState({ modalPreview: false });
    if (this.state.modalFunction) {
      this.setState({ modalFunction: false });
    } else {
      this.setState({ modalFunction: true });
    }
  }
  public async componentDidMount() {
    const { id } = this.props.item;
    const tpservice = await this.teachingPathService.getTeachingPathDataById(id);
    // console.log(tpservice);
  }
  public render() {
    const {
        description,
        grades,
        subjects,
        topics,
        goals,
        lvlArticles
    } = this.props.item;
    const openPreview = (this.state.modalPreview) ? 'modalToggle active' : 'modalToggle';
    const openFunction = (this.state.modalFunction) ? 'modalToggle active' : 'modalToggle';
    return (
      <div className="previewModalInfo" tabIndex={0}>
        <div className="previewModalInfo__background" onClick={this.close} />
        <div className="previewModalInfo__content">
          <div className="contentContainer">
            <div className="NewheaderPanel">
              <div className="headerButtons">
                <div className="previewButtons">
                  <a href="javascript:void(0)" className={openPreview} onClick={this.changeOpenpreview}>{intl.get('new assignment.Preview')}</a>

                </div>
                <div className="functionsButtons">
                    <a href="javascript:void(0)" className={openFunction} onClick={this.changeOpenFunction}>{intl.get('preview.teaching_path.buttons.edit')}</a>
                </div>
                <div className="DistributeButtons" />
              </div>
            </div>
          </div>
          <div className="footerButtons" />
        </div>
      </div>
    );
  }
}
const TPComponent = onClickOutside(TPContent);
export { TPComponent as TPContent };
