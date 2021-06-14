import React, { Component, Suspense, lazy } from 'react';
import classnames from 'classnames';
import intl from 'react-intl-universal';
import onClickOutside from 'react-onclickoutside';

import { Grade, ImageArticle, ArticleLevel } from 'assignment/Assignment';
import { sortByAlphabet } from 'utils/sortByAlphabet';
import { lettersNoEn } from 'utils/lettersNoEn';

import closeCross from 'assets/images/close-rounded-black.svg';
import closeCrossLight from 'assets/images/close-cross.svg';

import './TagInput.scss';

const sixArticles = 6;
const scrollDelay = 200;
const timeoutlint = 4500;

export interface TagProp {
  id: number;
  title: string;
  excerpt?: string;
  images?: ImageArticle;
  grades?: Array<Grade>;
  levels?: Array<ArticleLevel>;
}

interface Props {
  dataid?: string;
  className?: string;
  autoFocus?: boolean;
  listView?: boolean;
  tags: Array<TagProp>;
  removeTag?: (id: number) => void;
  addTag?: (id: number) => void;
  currentTags: Array<TagProp>;
  orderbyid : boolean;
  noOpenOnFocus?: boolean;
  temporaryTagsArray?: boolean;
}

interface State {
  tagInput: string;
  isTagsWindowVisible: boolean;
  temporaryTagsArray: Array<TagProp>;
  temporaryFoundedTagsArray: Array<TagProp>;
  temporaryLoadedFoundedTagsArray: Array<TagProp>;
  isTagInputChanged: boolean;
}

const TagsFound = lazy(() => import('./TagsFound'));

class TagInputWrapper extends Component<Props, State> {
  public tagInput: HTMLInputElement | null = null;

  public state = {
    tagInput: '',
    isTagsWindowVisible: false,
    temporaryTagsArray: [],
    temporaryFoundedTagsArray: [],
    temporaryLoadedFoundedTagsArray: [],
    isTagInputChanged: false
  };

  private onSelectTag = (id: number): void => {
    if (this.props.addTag) {
      this.props.addTag(id);
    }
    /*setTimeout(
      () => {
        this.setState({ isTagsWindowVisible: false });
      },
      timeoutlint
    );*/
  }

  private onRemoveTag = (id: number): void => {
    const { removeTag } = this.props;
    if (removeTag) {
      removeTag(id);
    }
    setTimeout(
      () => {
        this.setState({ isTagsWindowVisible: false });
      },
      timeoutlint
    );
  }

  private isTagSelected = (tag: TagProp): boolean => {
    const { currentTags } = this.props;

    return !!currentTags!.find(currentTag => currentTag.id === tag.id);
  }

  public componentDidMount = () => {
    this.setState({ temporaryTagsArray: this.props.tags.slice(0, sixArticles) });

    if (!this.props.temporaryTagsArray) {
      this.setState({ temporaryTagsArray: this.props.tags });
    }
  }

  public componentDidUpdate = (prevProps: Props, prevState: State) => {
    if (prevProps.tags !== this.props.tags) {
      this.setState({ temporaryTagsArray: this.props.tags.slice(0, sixArticles) });
    }

    if (prevProps.tags !== this.props.tags && !this.props.temporaryTagsArray) {
      this.setState({ temporaryTagsArray: this.props.tags });
    }

    if (prevState.tagInput !== this.state.tagInput) {
      this.setState({ isTagInputChanged: true }, () => this.setState({ isTagInputChanged: false }));
    }
  }

  public temporaryLoadMoreTags = () => {
    setTimeout(() => {
      this.setState({ temporaryTagsArray: this.props.tags.slice(0, this.state.temporaryTagsArray.length + sixArticles) });
    },         scrollDelay);
  }

  public temporaryLoadMoreFoundedTags = () => {
    setTimeout(() => {
      this.setState({
        temporaryLoadedFoundedTagsArray: this.state.temporaryFoundedTagsArray.slice(
                        0, this.state.temporaryLoadedFoundedTagsArray.length + sixArticles
                      )
      });
    },         scrollDelay);
  }

  public handleChangeTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (lettersNoEn(e.target.value)) {
      const result = this.props.tags.filter(tag => tag.title.toLowerCase().startsWith(e.target.value));
      this.setState(
        {
          tagInput: e.target.value,
          isTagsWindowVisible: true,
          temporaryFoundedTagsArray: result
        },
        () => {
          this.setState({ temporaryLoadedFoundedTagsArray: result.slice(0, sixArticles) });
        }
      );
    }
  }

  public onFocusInput = () => {
    const { noOpenOnFocus } = this.props;
    this.setState({ isTagsWindowVisible: false });
    if (!noOpenOnFocus) {
      this.setState({ isTagsWindowVisible: true });
    }
  }

  public handleClickOutside = () => {
    this.setState({ isTagsWindowVisible: false });
  }

  public renderCurrentTag = (tag: TagProp) => {
    const { className } = this.props;
    const darkTheme = !!(className && className.includes('darkTheme'));
    return <CurrentTag key={tag.id} id={tag.id} title={tag.title} onRemove={this.onRemoveTag} dark={darkTheme} />;
  }

  public focusInput = () => {
    this.tagInput!.focus();
  }

  public renderTags = () => {
    const { tagInput } = this.state;
    const { tags, listView } = this.props;

    return (
      <TagsFound
        onScroll={!tagInput ? this.temporaryLoadMoreTags : this.temporaryLoadMoreFoundedTags}
        tags={!tagInput ? tags : this.state.temporaryLoadedFoundedTagsArray}
        tagInput={tagInput}
        listView={listView}
        onSelectTag={this.onSelectTag}
        isTagSelected={this.isTagSelected}
        temporaryTagsArray={this.state.temporaryTagsArray}
        isScrollToTop={this.state.isTagInputChanged}
      />
    );
  }

  public renderVisibleTags = () => {
    const { isTagsWindowVisible } = this.state;
    const loading = <div>{intl.get('loading')}</div>;

    return (
      <Suspense fallback={loading}>
        {isTagsWindowVisible && this.renderTags()}
      </Suspense>
    );
  }

  public setNamesRender() {
    const { currentTags, orderbyid } = this.props;
    if (orderbyid) {
      return  currentTags!.sort((a, b) => a.id - b.id).map(this.renderCurrentTag);
    }
    return currentTags!.sort(sortByAlphabet).map(this.renderCurrentTag);
  }

  public render() {
    const { dataid, className, autoFocus, currentTags, orderbyid } = this.props;
    const { tagInput } = this.state;

    return (
      <div
        className={classnames('TagInput', className)}
        // onClick={this.focusInput}
      >
        <div className={'tagWrapper'}>
          {this.setNamesRender()}
        </div>
        <label id={dataid} className="hidden">{tagInput}</label>
        <input
          onFocus={this.onFocusInput}
          autoFocus={autoFocus}
          value={tagInput}
          style={{ width: 110, flex: 1 }}
          onChange={this.handleChangeTagInput}
          ref={node => (this.tagInput = node)}
          aria-labelledby={dataid}
          aria-required="true"
          aria-invalid="false"
        />

        {this.renderVisibleTags()}
      </div>
    );
  }
}

interface CurrentTagProps {
  id: number;
  title: string;
  dark?: boolean;
  onRemove: (id: number) => void;
}

class CurrentTag extends Component<CurrentTagProps> {
  private onRemove = () => {
    const { id, onRemove } = this.props;
    onRemove(id);
  }

  public render() {
    const { title, dark } = this.props;
    return (
      <div className="tag">
        <span className={'title'}>{title}</span>
        <button onClick={this.onRemove} title={title}>
          <img src={dark ? closeCrossLight : closeCross} alt="Close" title={title} />
        </button>
      </div>
    );
  }
}

export const TagInputComponent = onClickOutside(TagInputWrapper);
