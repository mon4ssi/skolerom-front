import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';
import { validDomain } from 'utils/validDomain';
import { AssignmentListStore } from 'assignment/view/AssignmentsList/AssignmentListStore';
import { Assignment, GreepSelectValue, FilterGrep, Greep, GrepFilters, GoalsData } from 'assignment/Assignment';
import { EditTeachingPathStore } from '../../EditTeachingPathStore';
import { ItemContentTypeContext } from '../../ItemContentTypeContext';
import { TeachingPathNodeType } from 'teachingPath/TeachingPath';
import { CreateButton } from 'components/common/CreateButton/CreateButton';
import { StoreState } from 'utils/enums';
import { lettersNoEn } from 'utils/lettersNoEn';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';

import linkImg from 'assets/images/link.svg';

import { SkeletonLoader } from 'components/common/SkeletonLoader/SkeletonLoader';
const TIMEOUT = 500;
interface Props {
  assignmentListStore?: AssignmentListStore;
  editTeachingPathStore?: EditTeachingPathStore;
}

interface State {
  modalDomain: boolean;
  disabledbutton: boolean;
  loading: boolean;
  valueInputDomain: string;
}

@inject('assignmentListStore', 'editTeachingPathStore')
@observer
export class DomainModal extends Component<Props, State> {
  public static contextType = ItemContentTypeContext;
  constructor(props: Props) {
    super(props);
    this.state = {
      modalDomain: false,
      disabledbutton: true,
      loading: true,
      valueInputDomain: ''
    };
  }

  public componentDidMount() {
    document.addEventListener('keyup', this.handleKeyboardControl);
  }

  public closeDomainModal = () => {
    const { editTeachingPathStore } = this.props;
    if (this.state.loading) {
      this.setState({
        modalDomain: false
      });
      this.context.changeContentType(null);
      editTeachingPathStore!.setCurrentNode(null);
      document.removeEventListener('keyup', this.handleKeyboardControl);
    }
  }

  public handleKeyboardControl = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      if (!this.state.disabledbutton) {
        this.sendDomain();
      }
    }
    if (event.key === 'Escape') {
      this.closeDomainModal();
    }
  }

  public sendDomain = async () => {
    const { disabledbutton } = this.state;
    const { editTeachingPathStore } = this.props;
    const { currentNode } = this.props.editTeachingPathStore!;
    if (!disabledbutton) {
      const response = await editTeachingPathStore!.sendDataDomain(this.validUrlPath(this.state.valueInputDomain));
      setTimeout(
        () => {
          editTeachingPathStore!.setCurrentNode(currentNode);
          editTeachingPathStore!.currentNode!.editItemDomain(response);
          editTeachingPathStore!.currentEntity!.save();
          this.context.changeContentType(null);
          editTeachingPathStore!.setCurrentNode(null);
          document.removeEventListener('keyup', this.handleKeyboardControl);
        },
        TIMEOUT
      );
    } else {
      Notification.create({
        type: NotificationTypes.ERROR,
        title: intl.get('teaching path passing.external_error')
      });
    }
  }

  public validUrlPath = (value: string) => {
    if (value.split('//').length > 1) {
      return value;
    }
    return `https://${value}`;
  }

  public handleChangeNewQuestion = (e:  React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ valueInputDomain: e.target.value });
    if (validDomain(e.target.value)) {
      this.setState({ disabledbutton: false });
    } else {
      this.setState({ disabledbutton: true });
    }
  }
  public render() {
    const { assignmentListStore } = this.props;
    const { disabledbutton } = this.state;
    return (
    <div className="modalDomain">
      <div className="modalDomain__background" onClick={this.closeDomainModal} />
      <div className="modalDomain__content">
        <div className="modalDomain__context">
          <div className="modalDomain__form">
            <div className="modalDomain__input">
              <img src={linkImg} alt="add-domain" />
              <input
                className="newTextQuestionInput"
                placeholder={intl.get('new assignment.type_or_paste')}
                value={this.state.valueInputDomain}
                onChange={this.handleChangeNewQuestion}
                aria-required="true"
                aria-invalid="false"
                autoFocus={true}
              />
            </div>
            <div className="modalDomain__button">
              <button
                className="btn"
                onClick={this.sendDomain}
                title={intl.get('new assignment.add_link')}
              >
                {intl.get('new assignment.add_link')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  }
}
