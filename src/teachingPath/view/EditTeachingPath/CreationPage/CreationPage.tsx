import React, { Component, SyntheticEvent, MouseEvent } from 'react';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';
import classnames from 'classnames';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import TextAreaAutosize from 'react-textarea-autosize';
import clone from 'lodash/clone';
import isEqual from 'lodash/isEqual';
import { Location } from 'history';

import { EditTeachingPathStore } from '../EditTeachingPathStore';
import { TeachingPathTitle } from '../TeachingPathTitle/TeachingPathTitle';
import { InfoCard } from 'components/common/InfoCard/InfoCard';
import { Header } from '../Header/Header';
import { AddItemModal } from '../AddItemModal/AddItemModal';
import { AddingButtons } from './AddingButtons/AddingButtons';
import { EditableTeachingPathNode } from 'teachingPath/teachingPathDraft/TeachingPathDraft';
import { TeachingPathNodeType } from 'teachingPath/TeachingPath';
import { NestedOrderNumber } from './NestedOrderNumber/NestedOrderNumber';
import { NewAssignmentStore } from 'assignment/view/NewAssignment/NewAssignmentStore';
import { lettersNoEn } from 'utils/lettersNoEn';
import { MAX_TITLE_LENGTH } from 'utils/constants';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';
import { Article } from 'assignment/Assignment';
import { Loader } from 'components/common/Loader/Loader';

import articleImg from 'assets/images/article-eye.svg';
import assignmentImg from 'assets/images/assignment.svg';
import placeholderImg from 'assets/images/list-placeholder.svg';
import actualArrowLeftRounded from 'assets/images/actual-arrow-left-rounded.svg';

import './CreationPage.scss';
import { AppHeader } from 'components/layout/AppHeader/AppHeader';
import { TeachingPathsListStore } from 'teachingPath/view/TeachingPathsList/TeachingPathsListStore';

const cardWidth = 322;
const leftIndent = 160;

const minNumberOfTitleCols = 20;
const maxNumberOfTitleCols = 50;

interface NodeContentProps {
  editTeachingPathStore?: EditTeachingPathStore;
  node: EditableTeachingPathNode;
  parentNode?: EditableTeachingPathNode;
  isRoot?: boolean;
  nestedOrder: number;
  index?: number;
  readOnly?: boolean;
}

interface NodeContentState {
  numberOfTitleCols: number;
}

@inject('editTeachingPathStore')
@observer
class NodeContent extends Component<NodeContentProps, NodeContentState> {

  public titleRef = React.createRef<TextAreaAutosize & HTMLTextAreaElement>();
  public state = {
    numberOfTitleCols: 20
  };

  public componentDidMount() {
    if (this.titleRef && this.titleRef.current) {
      const valueLength = this.titleRef.current.props.value!.length;
      this.handleChangeNumberOfTitleCols(valueLength);
    }
  }

  public handleChangeNumberOfTitleCols = (valueLength: number) => {
    if (valueLength >= minNumberOfTitleCols && valueLength <= maxNumberOfTitleCols) {
      this.setState({ numberOfTitleCols: valueLength });
    } else if (valueLength < minNumberOfTitleCols) {
      this.setState({ numberOfTitleCols: minNumberOfTitleCols });
    } else if (valueLength > maxNumberOfTitleCols) {
      this.setState({ numberOfTitleCols: maxNumberOfTitleCols });
    }
  }

  public handleChangeTitle = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
    if (lettersNoEn(event.currentTarget.value)) {
      this.props.node.setSelectedQuestion(event.currentTarget.value);
      const valueLength = event.currentTarget.value.length;

      this.handleChangeNumberOfTitleCols(valueLength);
    }
  }

  // tslint:disable-next-line: no-any
  public renderInfoCard = (rawItem: any, index: number) => {
    const { parentNode, readOnly, editTeachingPathStore } = this.props;
    let item = clone(rawItem);

    if (readOnly && item.value && !item.value.excerpt && !item.value.grades && !item.value.images && item.type === TeachingPathNodeType.Article) {
      const article = editTeachingPathStore!.getArticleFromUsedOne(item.value.wpId);
      if (article) {
        item = {
          type: item.type,
          value: new Article({
            ...item.value,
            images: article.images,
            title: article.title,
            grades: article.grades,
            levels: article.levels,
            excerpt: article.excerpt
          })
        };
      }
    }

    const firstItemOfLevel = parentNode!.children[0].items![0];
    const lastItemOfLevel = parentNode!.children[parentNode!.children.length - 1]
      .items![parentNode!.children[parentNode!.children.length - 1].items!.length - 1];

    const containerClassNames = classnames(
      'infoCardContainer',
      {
        first: isEqual(item.value.id, firstItemOfLevel.value.id),
        last: item.value.id === lastItemOfLevel.value.id,
        solo: parentNode!.children.length === 1 && parentNode!.children[0].items!.length === 1
      }
    );
    const image = item.value.images ?
      item.value.images.url : item.value.featuredImage ?
        item.value.featuredImage : item.value.relatedArticles && item.value.relatedArticles.length > 0 ?
          item.value.relatedArticles[0].images.url : placeholderImg;

    const levels = item.type === TeachingPathNodeType.Assignment ?
      item.value.levels :
      (item.value.levels && item.value.levels.length) ? item.value.levels[0].childArticles.length ? item.value.levels[0].childArticles.map(
        (article: Article) => article.levels!.length && Number(article.levels![0].slug.split('-')[1])
      ) : [Number(item.value.levels[0].slug.split('-')[1])] : [];

    const withoutBottomVerticalLine = readOnly && (this.props.node.children.length === 0);
    let imagenType = articleImg;
    let urldomain = '';
    if (item.type === TeachingPathNodeType.Article) { imagenType = articleImg; }
    if (item.type === TeachingPathNodeType.Assignment) { imagenType = assignmentImg; }
    if (item.type === TeachingPathNodeType.Domain) {
      imagenType = assignmentImg;
      urldomain = item.value.url;
    }

    return (
        <div className={containerClassNames} key={`${item.id}-${index}`}>
          <div className="topVerticalLine" style={{ left: leftIndent }}/>
          <InfoCard
            withButtons={!readOnly}
            id={item.value.id}
            type={item.type}
            icon={imagenType}
            title={item.value.title}
            description={item.value.excerpt || item.value.description}
            img={image}
            urldomain={urldomain}
            grades={item.value.grades}
            numberOfQuestions={item.value.numberOfQuestions}
            onDelete={this.handleDeleteItem}
            levels={levels}
          />
          {!withoutBottomVerticalLine && <div className="bottomVerticalLine" style={{ left: leftIndent }}/>}
        </div>
    );
  }

  public handleDeleteItem = async (itemId: number) => {
    const { node, parentNode } = this.props;

    if (node.items!.length === 1) {
      const deleteConfirm = await Notification.create({
        type: NotificationTypes.CONFIRM,
        title: intl.get('edit_teaching_path.notifications.delete_path')
      });

      if (deleteConfirm) {
        parentNode!.removeChild(node);
      }
    } else {
      const deleteConfirm = await Notification.create({
        type: NotificationTypes.CONFIRM,
        title: intl.get(
          'edit_teaching_path.notifications.delete_item',
          {
            item: intl.get(`edit_teaching_path.notifications.${node.type.toLowerCase()}`)
          }
        )
      });

      if (deleteConfirm) {
        node.removeItem(itemId);
      }
    }
  }

  public handleMergeNodes = async (event: SyntheticEvent) => {
    const { node, index, parentNode } = this.props;

    event.preventDefault();

    if (
      parentNode!.children[index! - 1].children.length && node.children.length &&
      parentNode!.children[index! - 1].children[0].type !== node.children[0].type
    ) {
      Notification.create({
        type: NotificationTypes.ERROR,
        title: intl.get('edit_teaching_path.notifications.unable_to_merge')
      });
    } else {
      const mergeConfirm = await Notification.create({
        type: NotificationTypes.CONFIRM,
        title: intl.get('edit_teaching_path.notifications.merge_paths')
      });

      if (mergeConfirm) {
        node.items!.forEach(
          (item) => {
            if (!parentNode!.children[index! - 1].items!.find(el => el.value.id === item.value.id)) {
              parentNode!.children[index! - 1].addItem(item.value);
            }
          }
        );

        parentNode!.children[index! - 1].setChildren([...parentNode!.children[index! - 1].children, ...node.children]);
        parentNode!.children[index! - 1].setSelectedQuestion(intl.get('edit_teaching_path.paths.teaching_path_title'));
        parentNode!.removeChild(node);
      }
    }
  }

  public handleUnmergeNode = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const { node, parentNode, editTeachingPathStore, index } = this.props;

    event.preventDefault();
    const unmergeConfirm = await Notification.create({
      type: NotificationTypes.CONFIRM,
      title: intl.get('edit_teaching_path.notifications.unmerge_path')
    });
    if (unmergeConfirm) {
      editTeachingPathStore!.setCurrentNode(node);
      const nodeChildrenCopy = node.children.slice();
      const newUnmergedNodesWithoutItems = node.items!.map(
        item => editTeachingPathStore!.createNewNode(item.value, node.type)
      );
      parentNode!.removeChild(node);
      newUnmergedNodesWithoutItems[0].setChildren(nodeChildrenCopy);
      newUnmergedNodesWithoutItems.reverse().forEach(node => parentNode!.addChild(node, index));
      editTeachingPathStore!.setCurrentNode(null);
    }
  }

  public renderNodeContent = (childNode: EditableTeachingPathNode, index: number) => (
    <div
      key={index}
      className={`flexBox ${this.props.isRoot ? 'dirColumn' : 'dirRow'}`}
    >
      <NodeContent
        index={index}
        parentNode={this.props.node}
        node={childNode as EditableTeachingPathNode}
        nestedOrder={this.props.nestedOrder! + 1}
        editTeachingPathStore={this.props.editTeachingPathStore}
        readOnly={this.props.readOnly}
      />
    </div>
  )

  public renderItems = () => {
    const { node, index, readOnly } = this.props;
    if (node.type === TeachingPathNodeType.Root) {
      return null;
    }
    const horizontalLineWidth = (node.items!.length - 1) * cardWidth;

    const containerClassNames = classnames(
      'infoCardsContainer flexBox',
      {
        first: index === 0
      }
    );

    const lastItem = readOnly && node.children.length === 0;

    return (
      <div
        className={containerClassNames}
      >
        {node.items!.map(this.renderInfoCard)}
        {!lastItem && <div className="bottomHorizontalLine" style={{ width: horizontalLineWidth }}/>}
      </div>
    );
  }

  public renderAddingButtons = (withUnmergeButton: boolean) => {
    const { nestedOrder, node } = this.props;
    const containerClassNames = classnames(
      'teachingPathButtons flexBox justifyCenter',
      withUnmergeButton && 'withUnmergeButton',
      !this.renderMergeButton() && 'contentNone',
      !(node.type !== TeachingPathNodeType.Root && node.items!.length > 1) && 'withPadding',
      node.type === TeachingPathNodeType.Root && 'withoutPadding'
    );

    return !node.children.length && (
      <div className={containerClassNames}>
        {node.type !== TeachingPathNodeType.Root && <div className="topVerticalLine"/>}
        <AddingButtons node={node} nester={nestedOrder}/>
      </div>
    );
  }

  public renderInput = () => {
    const { nestedOrder, node, readOnly } = this.props;
    const placeholder = node.type === TeachingPathNodeType.Root ?
      intl.get('edit_teaching_path.paths.main_teaching_path_title') :
      intl.get('edit_teaching_path.paths.teaching_path_title');

    return node.type === TeachingPathNodeType.Root || node.children.length ? (
      <div className="teachingPathItemsTitleDiv" data-number={nestedOrder} >
      <TextAreaAutosize
        ref={this.titleRef}
        className="teachingPathItemsTitle fw500"
        value={node.selectQuestion}
        placeholder={placeholder}
        onChange={this.handleChangeTitle}
        cols={this.state.numberOfTitleCols}
        maxLength={MAX_TITLE_LENGTH}
        readOnly={readOnly}
      />
      </div>
    ) : null;
  }

  public renderNestedOrderNumber = (withUnmerge?: boolean) => {
    const { nestedOrder, node, readOnly } = this.props;
    const containerClassName = classnames(
      'nestedOrderNumberContainer flexBox dirColumn',
      !withUnmerge && 'withoutUnmergeButton'
    );

    return node.children.length ? (
      <div className={containerClassName}>
        {node.type !== TeachingPathNodeType.Root && <div className="topVerticalLine"/>}
        <NestedOrderNumber
          node={node}
          nestedOrderNumber={nestedOrder}
          readOnly={readOnly}
        />
      </div>
    ) : null;
  }

  public renderMergeButton = () => {
    const { index, editTeachingPathStore } = this.props;

    const mergeTooltipClassnames = classnames(
      'mergeTooltip',
      `${editTeachingPathStore!.getCurrentLocale()}Locale`
    );

    return !!index && (
      <div className="mergePanel">
        <div className={mergeTooltipClassnames}>{intl.get('edit_teaching_path.merge')}</div>
        <button className="mergeButton" onClick={this.handleMergeNodes} title={intl.get('edit_teaching_path.merge')}/>
      </div>
    );
  }

  public renderUnmergeButton = () => {
    const { node, editTeachingPathStore } = this.props;

    const unmergeTooltipClassnames = classnames(
      'unmergeTooltip',
      `${editTeachingPathStore!.getCurrentLocale()}Locale`
    );

    return node.type !== TeachingPathNodeType.Root && node.items!.length > 1 ? (
      <div className="mergePanel">
        <div className={unmergeTooltipClassnames}>{intl.get('edit_teaching_path.expand')}</div>
        <button className="unmergeImg" onClick={this.handleUnmergeNode} title={intl.get('edit_teaching_path.expand')} />
      </div>
    ) : null;
  }

  public render() {
    const { node, parentNode, index, readOnly } = this.props;
    const children = node.children as Array<EditableTeachingPathNode>;

    const containerClassNames = classnames(
      'teachingPathItemsContainer flexBox dirColumn alignCenter',
      node.type === TeachingPathNodeType.Root && 'rootContainer',
      parentNode && {
          // TOP HORIZONTAL LINES
        first: index === 0 && index !== parentNode.children.length - 1,
        last: index !== 0 && index === parentNode.children.length - 1,
        solo: index === 0 && index === parentNode.children.length - 1 && parentNode.type !== TeachingPathNodeType.Root,
        contentNone: parentNode.children.length === 1,
          // MERGE LINES
        mergeLineBeforeButton: index === 0 && parentNode.children.length > 1 && !readOnly,
        mergeLineFullWidth: index !== 0 && index !== parentNode.children.length - 1 && !readOnly,
        mergeLineAfterButton: index === parentNode.children.length - 1 && parentNode.children.length > 1 && !readOnly
      }
    );
    return (
      <div className={containerClassNames}>
        {this.renderItems()}

        {!readOnly && this.renderUnmergeButton()}

        {node.type !== TeachingPathNodeType.Root && this.renderNestedOrderNumber(readOnly ? false : !!this.renderUnmergeButton())}

        {this.renderInput()}

        {node.type === TeachingPathNodeType.Root && this.renderNestedOrderNumber(true)}

        {!readOnly && this.renderAddingButtons(!!this.renderUnmergeButton())}

        <div className="childrenContainer flexBox">
          {children.length ? children.map(this.renderNodeContent) : null}
        </div>

        {!readOnly && this.renderMergeButton()}
      </div>
    );
  }
}

type LocationProps = Location<{ fromAssignmentCreating: boolean }>;

interface Props extends RouteComponentProps {
  editTeachingPathStore?: EditTeachingPathStore;
  newAssignmentStore?: NewAssignmentStore;
  teachingPathsListStore?: TeachingPathsListStore;
  location: LocationProps;
  readOnly?: boolean;
}

@inject('editTeachingPathStore', 'newAssignmentStore', 'teachingPathsListStore')
@observer
export class CreationPageComponent extends Component<Props> {

  public componentDidMount() {
    const { editTeachingPathStore, newAssignmentStore, location, history } = this.props;
    const { createNewNode, teachingPathContainer } = editTeachingPathStore!;

    if (teachingPathContainer && location.state && location.state.fromAssignmentCreating) {
      history.replace({
        state: undefined
      });

      const newChild = createNewNode(newAssignmentStore!.storedAssignment!, TeachingPathNodeType.Assignment);
      editTeachingPathStore!.addChildToCurrentNode(newChild);
      newAssignmentStore!.clearStoredAssignment();
      editTeachingPathStore!.setCurrentNode(null);
    }
  }

  public onLogoClick = (e: MouseEvent) => {
    e.preventDefault();
    this.props.history.push('/teaching-paths/all');
  }

  public renderHeader = () => {
    const { readOnly, editTeachingPathStore } = this.props;

    return readOnly ? (
      <AppHeader
        fromTeachingPathPassing
        onLogoClick={this.onLogoClick}
        entityStore={this.props.teachingPathsListStore!}
        currentEntityId={editTeachingPathStore!.currentEntity!.id}
      />
    ) : (
      <Header isCreation />
    );
  }

  public renderExitButton = () => (
      <div className={'exitButton'}>
        <Link to={'/teaching-paths/all'}>
          <div className={'flexBox alignCenter exitTeachingPath'}>
            <img src={actualArrowLeftRounded} alt="actualArrowLeftRounded"/>
            <span>{intl.get('teaching path passing.exit')}</span>
          </div>
        </Link>
      </div>
    )

  public render() {
    const { editTeachingPathStore, readOnly } = this.props;
    const { teachingPathContainer, currentEntity: currentTeachingPath } = editTeachingPathStore!;

    if (!teachingPathContainer) {
      return (
        <div className={'loading'}><Loader /></div>
      );
    }

    return (
      <>
        {this.renderHeader()}

        <AddItemModal />

        <div className="main flexBox dirColumn alignCenter">
          <TeachingPathTitle readOnly={readOnly}/>

          <NodeContent
            isRoot
            node={currentTeachingPath!.content! as EditableTeachingPathNode}
            nestedOrder={1}
            readOnly={readOnly}
          />

          {readOnly && this.renderExitButton()}
        </div>
      </>
    );
  }
}

export const CreationPage = withRouter(CreationPageComponent);
