import React, { Component } from 'react';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import isNil from 'lodash/isNil';
import TextAreaAutosize from 'react-textarea-autosize';
import isNull from 'lodash/isNull';

import { AssignmentEvaluationStore } from '../../EvaluationDraft/AssignmentEvaluationStore';
import { Subject } from 'assignment/Assignment';
import { EntityType } from 'utils/enums';
import { AssignmentsCheckingPanel } from './CheckingPanelContent/AssignmentsCheckingPanel';
import { TeachingPathCheckingPanel } from './CheckingPanelContent/TeachingPathCheckingPanel';
import { TeachingPathEvaluationStore } from '../../../teachingPath/evaluationDraft/TeachingPathEvaluationStore';

import './CheckingPanel.scss';

// tslint:disable-next-line:no-magic-numbers
const marks = [1, 2, 3, 4, 5, 6];

interface Props {
  store?: AssignmentEvaluationStore | TeachingPathEvaluationStore;
  type: EntityType;
  save(): void;
}

@inject('teachingPathEvaluationStore')
@observer
export class CheckingPanel extends Component<Props> {

  public componentWillUnmount() {
    const { store } = this.props;
    store!.resetCurrentEntity();
  }

  public renderSubject = (subject: Subject) => (
    <div key={subject.id} className="readArticle__subject">
      {subject.title}
    </div>
  )

  public setCommentToEntity = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.props.store!.setCommentToEntity(e.target.value);
  }

  public setMark = (mark: number) => () => {
    const { store } = this.props;

    if (!store!.currentEvaluation!.isReadyToEvaluate) {
      return;
    }

    if (store!.currentEvaluation!.mark === mark) {
      store!.setStatus(null);
      return store!.setMark(null);
    }
    return store!.setMark(mark);
  }

  public setStatus = (status: boolean) => () => {
    const { store } = this.props;

    if (!store!.currentEvaluation!.isReadyToEvaluate || isNil(store!.currentEvaluation!.mark)) {
      return;
    }

    if (store!.currentEvaluation!.status === status) {
      return store!.setStatus(null);
    }
    return store!.setStatus(status);
  }

  public renderMark = (mark: number) => {
    const { store } = this.props;
    const style = `markItem ${store!.currentEvaluation!.mark === mark && 'activeMark'} ${(store!.currentEvaluation!.mark === mark && mark === 1) && 'failed'}`;
    return <button key={mark} className={style} title="mark" onClick={this.setMark(mark)}>{mark}</button>;
  }

  public renderSavePanel = () => {
    const { store, save } = this.props;

    if (store!.currentEvaluation && store!.currentEvaluation.isReadyToEvaluate) {
      return (
        <div className="controlPanel">
          <button className={'save'} title={intl.get('answers.Save changes')} onClick={save}>{intl.get('answers.Save changes')}</button>
          {store!.displaySaveMessage && <span className="saved">{intl.get('answers.Answer edited')}</span>}
        </div>
      );
    }
  }

  public setPassedStatus = (status: boolean) => () => {
    const { store } = this.props;

    if (!store!.currentEvaluation!.isReadyToEvaluate) {
      return;
    }
    if (store!.currentEvaluation!.isPassed === status) {
      store!.currentEvaluation!.setPassedStatus(null);
    } else {
      store!.currentEvaluation!.setPassedStatus(status);
    }
    store!.currentEvaluation!.setMark(null);
    store!.currentEvaluation!.setStatus(null);
  }

  public renderCheckingPanelContent = () => {
    const { type } = this.props;
    if (type === EntityType.ASSIGNMENT) {
      return <AssignmentsCheckingPanel/>;
    }
    return <TeachingPathCheckingPanel />;
  }

  public render() {
    const { store } = this.props;
    const { status, isPassed, mark } = store!.currentEvaluation!;
    const isPassedAssignment = store!.calcPassedStatus();

    const negativeMark = mark === 1;

    const minusStatusStyle = `markItem markButton ${(!isNull(status) && !status) ? 'activeMark' : ''} ${negativeMark && !status && !isNull(status) && 'failed'}`;
    const plusStatusStyle = `markItem markButton ${(!isNull(status) && status) ? 'activeMark' : ''} ${negativeMark && status && !isNull(status) && 'failed'}`;
    const passedStatusStyle = `markItem markButton ${(isPassed || isPassedAssignment) ? 'activeMark' : ''}`;
    const notPassedStatusStyle = `markItem markButton ${isNull(isPassed) ? '' : ((!isNull(isPassed) && !isPassed) && !isPassedAssignment) ? 'activeMark failed' : ''}`;

    return (
      <div className={'checking'}>
        <div className="flexBox flexWrap mainContainer">
          {this.renderCheckingPanelContent()}
          <div className="comments">
            <div className="comment">
              <span className={'headline'}>{intl.get('answers.Comment to student')}</span>
              <TextAreaAutosize
                className="text"
                placeholder={intl.get('answers.enter your comment')}
                defaultValue={store!.currentEvaluation ? store!.currentEvaluation.content.commentToEntity : ''}
                onChange={this.setCommentToEntity}
                disabled={!store!.currentEvaluation!.isReadyToEvaluate}
              />
            </div>
            <div className="evaluation">
              <span className={'headline'}>{intl.get('answers.Evaluation')}</span>
              <div className="mark">
                <div className="flexBox markNumbers">
                  {marks.map(this.renderMark)}
                </div>
                <div className="flexBox markButtons">
                  <button className={minusStatusStyle} title="minus" onClick={this.setStatus(false)}>-</button>
                  <button className={plusStatusStyle} title="plus" onClick={this.setStatus(true)}>+</button>
                </div>
              </div>
              <div className="flexBox">
                <button className={passedStatusStyle} title={intl.get('answers.Passed')} onClick={this.setPassedStatus(true)}>{intl.get('answers.Passed')}</button>
                <button className={notPassedStatusStyle} title={intl.get('answers.Not passed')} onClick={this.setPassedStatus(false)}>{intl.get('answers.Not passed')}</button>
              </div>
            </div>
          </div>
        </div>
        {this.renderSavePanel()}
      </div>
    );
  }
}
