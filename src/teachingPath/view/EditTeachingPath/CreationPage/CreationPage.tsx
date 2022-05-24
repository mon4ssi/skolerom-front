import React, { Component, SyntheticEvent, MouseEvent } from 'react';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';
import classnames from 'classnames';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import TextAreaAutosize from 'react-textarea-autosize';
import clone from 'lodash/clone';
import isEqual from 'lodash/isEqual';
import { Location } from 'history';

import { DndProvider, useDrag, useDrop } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

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
import { AssignmentsList } from '../AddItemModal/AssignmentsList/AssignmentsList';
import { ArticlesList } from '../AddItemModal/ArticlesList/ArticlesList';
import { ItemContentTypeContext } from '../ItemContentTypeContext';

import articleImg from 'assets/images/article-eye.svg';
import assignmentImg from 'assets/images/assignment.svg';
import domainImg from 'assets/images/app-open-icon.svg';
import placeholderImg from 'assets/images/list-placeholder.svg';
import actualArrowLeftRounded from 'assets/images/actual-arrow-left-rounded.svg';

import './CreationPage.scss';
import { AppHeader } from 'components/layout/AppHeader/AppHeader';
import { TeachingPathsListStore } from 'teachingPath/view/TeachingPathsList/TeachingPathsListStore';
import { TeacherguidanceModal } from 'teachingPath/view/TeacherGuidance/TeacherGuidanceModal';
import { trim } from 'lodash';

const cardWidth = 322;
const leftIndent = 160;

const minNumberOfTitleCols = 20;
const maxNumberOfTitleCols = 50;
const num2 = 2;
const ENTER_SINGLE_QUOTE_CODE = 219;
const ENTER_DOUBLE_QUOTE_CODE = 50;
const DELAY = 100;

interface NodeContentProps {
  editTeachingPathStore?: EditTeachingPathStore;
  node: EditableTeachingPathNode;
  parentNode?: EditableTeachingPathNode;
  allNode: EditableTeachingPathNode;
  isRoot?: boolean;
  nestedOrder: number;
  index?: number;
  readOnly?: boolean;
  dropArticles?: boolean;
  dropAssignments?: boolean;
  dragCards?: boolean;
  onDrop(type: string): void;
}

interface NodeContentState {
  numberOfTitleCols: number;
  isDraggable: boolean;
  isDrop: boolean;
  myNode: EditableTeachingPathNode | null;
  isPosibleDrop: boolean;
  isDropInit: boolean;
}

@inject('editTeachingPathStore')
@observer
class NodeContent extends Component<NodeContentProps, NodeContentState> {
  public static contextType = ItemContentTypeContext;
  public titleRef = React.createRef<TextAreaAutosize & HTMLTextAreaElement>();
  public insideRef = React.createRef<TextAreaAutosize & HTMLTextAreaElement>();
  public divRef = React.createRef<HTMLDivElement>();
  public state = {
    numberOfTitleCols: 20,
    EditDomain: false,
    isDraggable: false,
    isDrop: false,
    myNode: null,
    isPosibleDrop: false,
    isDropInit: false
  };

  public componentDidMount() {
    this.props.node.improbeSubjects(this.props.node.draftTeachingPath.subjects);
    if (this.titleRef && this.titleRef.current) {
      const valueLength = this.titleRef.current.props.value!.length;
      this.handleChangeNumberOfTitleCols(valueLength);
    }
    const headerArray = Array.from(document.getElementsByClassName('header') as HTMLCollectionOf<HTMLElement>);
    headerArray[0].style.display = 'flex';
    this.props.editTeachingPathStore!.falseIsDraggable();
  }

  public onClean() {
    this.setState({
      isDraggable: false
    });
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
    const value = this.useValuedQuotes(event.currentTarget.value);
    if (lettersNoEn(value)) {
      this.props.node.setSelectedQuestion(value);
      const valueLength = value.length;

      this.handleChangeNumberOfTitleCols(valueLength);
    }
  }

  public dropInfoCard = () => {
    const { node, parentNode, readOnly, editTeachingPathStore } = this.props;
    const classMine = (!node.children.length) ? 'dropInfoAddtional dropLeftArticle insited' : 'dropInfoAddtional dropLeftArticle ';
    return (
      <div className={classMine} onDrop={this.handleDrop} onDragEnter={this.dragenterthandler} onDragOver={this.handleDragOver} onDragLeave={this.handleDragLeave}>
        <div className="isPosibleDragInside">
          {intl.get('generals.dragdrop')}
        </div>
      </div>
    );
  }

  public handleDragOver = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.add('posibleactive');
  }

  public handleDragLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove('posibleactive');
    this.setState({ isDrop: false });
  }

  public handleDrop = (event: React.MouseEvent<HTMLDivElement>) => {
    const { editTeachingPathStore, node, parentNode, allNode, onDrop } = this.props;
    const myNode = editTeachingPathStore!.getSelectedDragNode();
    const myParent = editTeachingPathStore!.getParentSelectedDragNode();
    const childrenNode = node.children;
    const allchildren = allNode.children;
    event.preventDefault();
    this.setState({
      isDrop: false,
      isDropInit: false,
      isPosibleDrop: false
    });
    if (myNode) {
      editTeachingPathStore!.setCurrentNode(node!);
      editTeachingPathStore!.addChildToCurrentNodeNullPerItem(myNode);

      // delete item
      editTeachingPathStore!.setCurrentNode(myParent);
      editTeachingPathStore!.removeChildToCurrentNodeNullPerItem(myNode);

      // format items
      editTeachingPathStore!.setCurrentNode(null);
      editTeachingPathStore!.setSelectedDragNode(null);
      editTeachingPathStore!.setParentSelectedDragNode(null);
      editTeachingPathStore!.falseIsDraggable();
    } else {
      Notification.create({
        type: NotificationTypes.ERROR,
        title: intl.get('edit_teaching_path.notifications.onlydraggable')
      });
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
            url: article.url,
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
    let image = item.value.images ?
      item.value.images.url : item.value.featuredImage ?
        item.value.featuredImage : item.value.relatedArticles && item.value.relatedArticles.length > 0 ?
          (item.value.relatedArticles[0].images !== undefined) ? item.value.relatedArticles[0].images.url : placeholderImg : placeholderImg;

    const levels = item.type === TeachingPathNodeType.Assignment ?
      item.value.levels :
      (item.value.levels && item.value.levels.length) ? item.value.levels[0].childArticles.length ? item.value.levels[0].childArticles.map(
        (article: Article) => article.levels!.length && Number(article.levels![0].slug.split('-')[1])
      ) : [Number(item.value.levels[0].slug.split('-')[1])] : [];

    const withoutBottomVerticalLine = readOnly && (this.props.node.children.length === 0);
    let imagenType = articleImg;
    let urldomain = '';
    let urlBasic = '';
    if (item.type === TeachingPathNodeType.Article) {
      imagenType = articleImg;
      urlBasic = item.value.url;
    }
    if (item.type === TeachingPathNodeType.Assignment) {
      imagenType = assignmentImg;
      urlBasic = `/assignments/view/${item.value.id}?preview`;
    }
    if (item.type === TeachingPathNodeType.Domain) {
      imagenType = domainImg;
      image = (item.value.featuredImage !== undefined) ? item.value.featuredImage : item.value.image;
      urlBasic = item.value.url;
      urldomain = item.value.url;
    }

    return (
      <div className={containerClassNames} key={`${item.id}-${index}`}>
        <div className="topVerticalLine" style={{ left: leftIndent }} />
        <InfoCard
          withButtons={!readOnly}
          id={item.value.id}
          type={item.type}
          icon={imagenType}
          title={item.value.title}
          description={item.value.excerpt || item.value.description}
          img={image}
          url={urlBasic}
          urldomain={urldomain}
          grades={item.value.grades}
          numberOfQuestions={item.value.numberOfQuestions}
          onDelete={this.handleDeleteItem}
          onEdit={this.handleEditItem}
          onDrag={this.handleDragItem}
          onCancelDrag={this.handleCancelDragItem}
          levels={levels}
          onCLickImg={this.onCLickImg}
        />
        {!withoutBottomVerticalLine && <div className="bottomVerticalLine" style={{ left: leftIndent }} />}
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

  public onCLickImg = async (url: string) => {
    window.open(`${url}`, '_blank');
  }

  public handleEditItem = async (itemId: number, type: string) => {
    const { editTeachingPathStore, node, parentNode } = this.props;
    editTeachingPathStore!.setCurrentNode(node!);
    this.context.changeContentType(null);
    switch (type) {
      case 'ARTICLE':
        editTeachingPathStore!.trueIsEditArticles();
        editTeachingPathStore!.setArticleInEdit(itemId);
        this.context.changeContentType(0);
        break;
      case 'ASSIGNMENT':
        editTeachingPathStore!.trueIsEditAssignments();
        editTeachingPathStore!.setAssignmentInEdit(itemId);
        this.context.changeContentType(1);
        break;
      case 'DOMAIN':
        editTeachingPathStore!.trueIsEditDomain();
        this.context.changeContentType(num2);
        break;
      default:
        this.context.changeContentType(null);
        break;
    }
  }

  public handleCancelDragItem = async (itemId: number, type: string) => {
    const { editTeachingPathStore, onDrop } = this.props;
    onDrop('NONE');
    if (this.state.isDraggable) {
      this.divRef.current!.classList.remove('dragged');
    }
    this.setState(
      {
        isDraggable: false,
      },
      () => {
        const headerArray = Array.from(document.getElementsByClassName('header') as HTMLCollectionOf<HTMLElement>);
        headerArray[0].style.display = 'flex';
      }
    );
    this.setState({ isDrop: false });
    editTeachingPathStore!.falseIsDraggable();
  }

  public onCancelDrag = async () => {
    const { editTeachingPathStore, onDrop } = this.props;
    onDrop('NONE');
    if (this.state.isDraggable) {
      this.divRef.current!.classList.remove('dragged');
    }
    this.setState(
      {
        isDraggable: false,
      },
      () => {
        const headerArray = Array.from(document.getElementsByClassName('header') as HTMLCollectionOf<HTMLElement>);
        headerArray[0].style.display = 'flex';
      }
    );
    this.setState({ isDrop: false });
    editTeachingPathStore!.falseIsDraggable();
  }

  public handleDragItem = async (itemId: number, type: string) => {
    // step 0: variables
    const { editTeachingPathStore, node, parentNode, allNode, onDrop } = this.props;
    const childrenNode = node.children;
    const allchildren = allNode.children;
    const mytype = node.type;
    // step 1: detect posible drop
    this.setState({ isDrop: false, isPosibleDrop: false });
    editTeachingPathStore!.trueIsDraggable();
    onDrop(mytype);
    // step 2: draggable

    const allContainers = Array.from(document.getElementsByClassName('teachingPathItemsContainer') as HTMLCollectionOf<HTMLElement>);
    if (allContainers.length > 0) {
      allContainers.forEach((container) => {
        container.classList.remove('draggableclass');
        container.setAttribute('draggable', 'false');
      });
      this.divRef.current!.classList.add('draggableclass');
      this.divRef.current!.setAttribute('draggable', 'true');
    }

    this.setState({ isDraggable: false });
    this.setState(
      {
        isDraggable: true
      },
      () => {
        const headerArray = Array.from(document.getElementsByClassName('header') as HTMLCollectionOf<HTMLElement>);
        headerArray[0].style.display = 'none';
      }
    );
    // step 3: check node
    this.setState(
      {
        myNode: node
      },
      () => {
        editTeachingPathStore!.setSelectedDragNode(this.state.myNode);
        if (parentNode !== undefined) {
          editTeachingPathStore!.setParentSelectedDragNode(parentNode);
        }
      }
    );
    editTeachingPathStore!.setSelectedDragNode(node);
    if (parentNode !== undefined) {
      editTeachingPathStore!.setParentSelectedDragNode(parentNode);
    }
    // this.divRef.current!.ondrag(DragEvent, true);
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
        parentNode!.children[index! - 1].setSelectedQuestion(intl.get('edit_teaching_path.paths.node_teaching_path_title'));
        parentNode!.removeChild(node);
      }
    }
  }

  public handleUnmergeNode = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const { node, parentNode, editTeachingPathStore, index, allNode } = this.props;

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
      className={`flexBox ${this.props.isRoot ? 'dirColumn' : 'dirRow alingBaseLine'}`}
    >
    <NodeContent
      index={index}
      parentNode={this.props.node}
      node={childNode as EditableTeachingPathNode}
      nestedOrder={this.props.nestedOrder! + 1}
      editTeachingPathStore={this.props.editTeachingPathStore}
      allNode={this.props.allNode}
      dropArticles={this.props.dropArticles}
      dropAssignments={this.props.dropAssignments}
      readOnly={this.props.readOnly}
      dragCards={this.props.dragCards}
      onDrop={this.props.onDrop}
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
        {!lastItem && <div className="bottomHorizontalLine" style={{ width: horizontalLineWidth }} />}
      </div>
    );
  }

  public dragenterthandler = () => {
    const { onDrop } = this.props;
    this.setState({ isDrop: true });
  }

  public ondragleavetitle = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove('imposibleDrop');
    event.currentTarget.classList.remove('posibleDrop');
    this.setState({ isPosibleDrop: false });
  }

  public validChildrenOnType = (node: EditableTeachingPathNode, myNode: EditableTeachingPathNode) => {
    let returnIfhaveChildren = false;
    if (node === myNode) {
      returnIfhaveChildren = true;
      return returnIfhaveChildren;
    }
    if (node.children!.length > 0) {
      node.children.forEach((child) => {
        this.validChildrenOnType(child, myNode);
      });
    }
    return returnIfhaveChildren;
  }

  public ondroptitle = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const { editTeachingPathStore, node, parentNode, allNode, onDrop } = this.props;
    const myNode = editTeachingPathStore!.getSelectedDragNode();
    const myParent = editTeachingPathStore!.getParentSelectedDragNode();
    const childrenNode = node.children;
    const allchildren = allNode.children;
    const mytypeFirstChildNode = (node.children.length > 0) ? node.children[0].type : 'none';
    event.currentTarget.classList.remove('imposibleDrop');
    event.currentTarget.classList.remove('posibleDrop');
    if (this.state.isPosibleDrop) {
      if (myNode) {
        editTeachingPathStore!.setCurrentNode(node!);
        editTeachingPathStore!.addChildToCurrentNodeNullPerItem(myNode);
        this.setState({
          isDrop: false,
          isDropInit: false,
          isPosibleDrop: false,
        });
        editTeachingPathStore!.falseIsDraggable();
        // delete item
        editTeachingPathStore!.setCurrentNode(myParent);
        editTeachingPathStore!.removeChildToCurrentNodeNullPerItem(myNode);
        // format items
        editTeachingPathStore!.setCurrentNode(null);
        editTeachingPathStore!.setSelectedDragNode(null);
        editTeachingPathStore!.setParentSelectedDragNode(null);
      } else {
        Notification.create({
          type: NotificationTypes.ERROR,
          title: intl.get('edit_teaching_path.notifications.onlydraggable')
        });
      }
    } else {
      if (myNode!.type === mytypeFirstChildNode) {
        Notification.create({
          type: NotificationTypes.ERROR,
          title: intl.get('edit_teaching_path.notifications.unable_to_drop')
        });
      } else {
        Notification.create({
          type: NotificationTypes.ERROR,
          title: intl.get('edit_teaching_path.notifications.unable_to_mix_different_natures')
        });
      }
    }
  }
  public ondragovertitle = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    // step 0: variables
    const { editTeachingPathStore, node, parentNode, allNode, onDrop } = this.props;
    const childrenNode = node.children;
    const allchildren = allNode.children;
    const mytype = (node.children.length > 0) ? node.children[0].type : 'none';
    const myChildrens = (node.children.length > 0) ? node.children : [];
    const myid = node.id;
    const myNode = editTeachingPathStore!.getSelectedDragNode();
    const myParent = editTeachingPathStore!.getParentSelectedDragNode();
    this.setState({ isPosibleDrop: false });
    if (myNode) {
      if (myChildrens.includes(myNode)) {
        event.currentTarget.classList.add('imposibleDrop');
      } else {
        if (mytype === myNode!.type) {
          event.currentTarget.classList.add('posibleDrop');
          this.setState({ isPosibleDrop: true });
        } else {
          event.currentTarget.classList.add('imposibleDrop');
        }
      }
    }
  }

  public dragleavethandler = (event: React.MouseEvent<HTMLDivElement>) => {
    const { onDrop } = this.props;

  }

  public dragStart = (event: React.MouseEvent<HTMLDivElement>) => {
    this.setState({ isDropInit: true });
    if (this.state.isDraggable) {
      event.currentTarget.classList.add('dragged');
    }
  }

  public dragendhandler = (event: React.MouseEvent<HTMLDivElement>) => {
    const { editTeachingPathStore, onDrop } = this.props;
    onDrop('NONE');
    if (this.state.isDraggable) {
      event.currentTarget.classList.remove('dragged');
    }
    this.setState(
      {
        isDraggable: false,
      },
      () => {
        const headerArray = Array.from(document.getElementsByClassName('header') as HTMLCollectionOf<HTMLElement>);
        headerArray[0].style.display = 'flex';
      }
    );
    this.setState({ isDrop: false });
    editTeachingPathStore!.falseIsDraggable();
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
      <div className={containerClassNames} onDragEnter={this.dragenterthandler}>
        {node.type !== TeachingPathNodeType.Root && <div className="topVerticalLine" />}
        <AddingButtons node={node} nester={nestedOrder} onCancelDrag={this.onCancelDrag}/>
      </div>
    );
  }

  public useValuedQuotes = (value: string) => {
    const startQuote = '«';
    const endQuote = '»';
    let newvalue = value;
    if (value.split("'").length > 1 || value.split('"').length > 1) {
      const initValue = (value.split("'").length > 1) ? value.split("'")[0] : value.split('"')[0];
      newvalue = `${initValue}${startQuote}${endQuote}`;
    }
    return newvalue;
  }

  public informativeBox = () => (<div className="boxInformationDrop">{intl.get('generals.dragdrop')}</div>);

  public renderInput = () => {
    const { nestedOrder, node, readOnly } = this.props;
    const placeholder = intl.get('edit_teaching_path.paths.node_teaching_path_place_holder');
    if (readOnly) {
      if (node.selectQuestion !== intl.get('edit_teaching_path.paths.node_teaching_path_title')) {
        return node.type === TeachingPathNodeType.Root || node.children.length ? (
          <div className="teachingPathItemsTitleDiv" data-number={nestedOrder} >
            <TextAreaAutosize
              ref={this.titleRef}
              inputRef={this.insideRef}
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

      return (
        <div className="teachingPathItemsTitleDiv" data-number={nestedOrder} >
          <TextAreaAutosize
            className="teachingPathItemsTitle fw500"
            ref={this.titleRef}
            inputRef={this.insideRef}
            value={node.selectQuestion}
            readOnly={readOnly}
          />
        </div>
      );
    }

    // if it is not readonly mode
    return node.type === TeachingPathNodeType.Root || node.children.length ? (
      <div className="teachingPathItemsTitleDiv" data-number={nestedOrder} >
        <TextAreaAutosize
          ref={this.titleRef}
          inputRef={this.insideRef}
          className="teachingPathItemsTitle fw500"
          value={node.selectQuestion}
          placeholder={placeholder}
          onChange={this.handleChangeTitle}
          cols={this.state.numberOfTitleCols}
          maxLength={MAX_TITLE_LENGTH}
          readOnly={readOnly}
          autoFocus={true}
        />
      </div>
    ) : null;
  }

  public getLetterNode = (): number => {
    const { editTeachingPathStore, node } = this.props;
    let nroLetterLoop: number;

    if (node.children.length) {
      const firstLetterNumber: number = 97;

      if (editTeachingPathStore!.currentEntity!.content === node) {
        nroLetterLoop = firstLetterNumber;
      } else {
        let children: Array<EditableTeachingPathNode> = [];
        let childrenTmp: Array<EditableTeachingPathNode> = editTeachingPathStore!.currentEntity!.content.children;
        let continueLoop = true;
        let nroNodes: number = 0;

        //
        while (continueLoop) {
          nroNodes = 0;
          children = childrenTmp;
          childrenTmp = [];

          nroLetterLoop = firstLetterNumber;

          children.some((item) => {

            if (item.children.length > 0) {
              item.children.forEach((child) => {
                if (child.children.length > 0) {
                  childrenTmp.push(child);
                }
              });

              nroNodes += 1;

              if (item === node) {
                nroNodes = 0;
                return true;
              }

              nroLetterLoop += 1;
            }
          });

          continueLoop = (nroNodes > 0);
        }
      }
    }

    return nroLetterLoop!;
  }

  public renderNestedOrderNumber = (withUnmerge?: boolean) => {
    const { nestedOrder, node, readOnly, editTeachingPathStore } = this.props;
    const nroLetterLoop: number = this.getLetterNode();

    const containerClassName = classnames(
      'nestedOrderNumberContainer flexBox dirColumn',
      !withUnmerge && 'withoutUnmergeButton'
    );

    const isFirstNodeReadOnlyBlank: boolean = (readOnly === true && node.type === TeachingPathNodeType.Root && this.haveTitleNode(node.selectQuestion));

    return node.children.length ? (
      <>
        {node.type !== TeachingPathNodeType.Root ? <div className="topVerticalLine" /> : isFirstNodeReadOnlyBlank ? <div className="topVerticalLine" style={{ top: 0, height: 0 }} /> : null}
        <NestedOrderNumber
          node={node}
          nestedOrderNumber={nestedOrder}
          readOnly={readOnly}
          nroLetter={nroLetterLoop!}
          onCancelDrag={this.onCancelDrag}
        />
      </>
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
        <button className="mergeButton" onClick={this.handleMergeNodes} title={intl.get('edit_teaching_path.merge')} />
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

  public haveTitleNode = (value: string): boolean => {
    const titleNode: string = trim(value);
    return (titleNode === '' || titleNode === null || typeof (titleNode) === 'undefined');
  }

  public renderBoxNodeOptions = () => {
    const { node, allNode, readOnly, editTeachingPathStore } = this.props;
    const classNodeTransparent: string = (readOnly === true && this.haveTitleNode(node.selectQuestion)) ? 'nodeChildrenReadOnly' : '';
    const childrenNode = node.children;
    const allchildren = allNode.children;
    const mytype = (node.children.length > 0) ? node.children[0].type : 'none';
    const myChildrens = (node.children.length > 0) ? node.children : [];
    const myid = node.id;
    const myNode = editTeachingPathStore!.getSelectedDragNode();
    const myParent = editTeachingPathStore!.getParentSelectedDragNode();
    // let isposible = true;
    const isposible = (myNode) ? (myChildrens.includes(myNode)) ? false : (mytype === myNode!.type) ? true : false : true;
    /* if (myNode) {
      if (myChildrens.includes(myNode)) {
        isposible = false;
      } else {
        if (mytype === myNode!.type) {
          isposible = true;
        } else {
          isposible = false;
        }
      }
    } */
    return node.children.length ? (
      <div className={`${node.type === TeachingPathNodeType.Root ? 'boxNodeOptionsRoot' : 'boxNodeOptionsChildren'} ${classNodeTransparent}`} onDragOver={this.ondragovertitle} onDrop={this.ondroptitle} onDragLeave={this.ondragleavetitle}>

        {isposible && editTeachingPathStore!.returnIsDraggable() && this.informativeBox()}
        {this.renderInput()}
        <div className={`sectImgs ${readOnly ? 'sectImgsReadOnly' : ''}`}>
          {node.type === TeachingPathNodeType.Root && this.renderNestedOrderNumber(true)}
          {node.type !== TeachingPathNodeType.Root && this.renderNestedOrderNumber(readOnly ? false : !!this.renderUnmergeButton())}
        </div>
      </div>
    ) : null;
  }

  public render() {
    const { node, parentNode, index, readOnly, dropArticles, dropAssignments, editTeachingPathStore } = this.props;
    const children = node.children as Array<EditableTeachingPathNode>;
    const ifDropCant = (children.length === 0) ? false : true;
    const accIf = (ifDropCant) ? children[0].type : node.type;
    const ifArticles = (accIf === 'ARTICLE') ? true : false;
    const ifAssignments = (accIf === 'ASSIGNMENT') ? true : false;
    const myclass = (this.state.isDraggable) ? 'draggableclass' : '';

    const containerClassNames = classnames(
      'teachingPathItemsContainer flexBox dirColumn alignCenter',
      myclass,
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
      <div className={containerClassNames} draggable={this.state.isDraggable} onDragStart={this.dragStart} onDragLeave={this.dragleavethandler} onDragEnd={this.dragendhandler} ref={this.divRef}>
        {this.renderItems()}

        {!readOnly && this.renderUnmergeButton()}

        {this.renderBoxNodeOptions()}

        {!readOnly && this.renderAddingButtons(!!this.renderUnmergeButton())}

        <div className="childrenContainer flexBox">
          {children.length ? children.map(this.renderNodeContent) : null}
        </div>
        {editTeachingPathStore!.returnIsDraggable() && !this.state.isDraggable && !ifDropCant && this.dropInfoCard()}

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

  public state = {
    valuearticles: false,
    valueassigments: false
  };

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

  public onDrop = (type: string) => {
    if (type === 'ARTICLE') {
      this.setState({
        valuearticles: true,
        valueassigments: false
      });
    }
    if (type === 'ASSIGNMENT') {
      this.setState({
        valuearticles: false,
        valueassigments: true
      });
    }
    if (type === 'NONE') {
      this.setState({
        valuearticles: false,
        valueassigments: false,
      });
    }
  }

  public renderExitButton = () => (
    <div className={'exitButton'}>
      <Link to={'/teaching-paths/all'}>
        <div className={'flexBox alignCenter exitTeachingPath'}>
          <img src={actualArrowLeftRounded} alt="actualArrowLeftRounded" />
          <span>{intl.get('teaching path passing.exit')}</span>
        </div>
      </Link>
    </div>
  )

  public render() {
    const { editTeachingPathStore, readOnly } = this.props;
    const { teachingPathContainer, currentEntity: currentTeachingPath } = editTeachingPathStore!;
    const allNode = currentTeachingPath!.content! as EditableTeachingPathNode;

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
          <TeachingPathTitle readOnly={readOnly} />

          <TeacherguidanceModal
            currentEntity={currentTeachingPath!}
            readOnly={readOnly}
            editTeachingPathStore={editTeachingPathStore}
          />
          <NodeContent
            isRoot
            node={currentTeachingPath!.content! as EditableTeachingPathNode}
            allNode={allNode}
            nestedOrder={1}
            readOnly={readOnly}
            dropArticles={this.state.valuearticles}
            dropAssignments={this.state.valueassigments}
            dragCards={editTeachingPathStore!.returnIsDraggable()}
            onDrop={this.onDrop}
          />

          {readOnly && this.renderExitButton()}
        </div>
      </>
    );
  }
}

export const CreationPage = withRouter(CreationPageComponent);
