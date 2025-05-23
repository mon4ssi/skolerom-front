import React, { Component, Suspense, lazy } from 'react';
import classnames from 'classnames';
import intl from 'react-intl-universal';
import onClickOutside from 'react-onclickoutside';

import { Grade, ImageArticle, ArticleLevel, Keyword } from 'assignment/Assignment';
import { sortByAlphabet } from 'utils/sortByAlphabet';
import { lettersNoEn } from 'utils/lettersNoEn';

import closeCross from 'assets/images/close-rounded-black.svg';
import closeCrossLight from 'assets/images/close-cross.svg';

import './TagInputKeyword.scss';
import { TagKeyword } from './TagKeyword';
import { NewAssignmentStore } from 'assignment/view/NewAssignment/NewAssignmentStore';
import { EditTeachingPathStore } from 'teachingPath/view/EditTeachingPath/EditTeachingPathStore';

const sixArticles = 6;
const scrollDelay = 200;
const timeoutlint = 4500;
const ENTER_KEYCODE = 13;
const five = 5;

export interface TagKeywordProp {
  description: string;
}

interface Props {
  dataid?: string;
  className?: string;
  autoFocus?: boolean;
  listView?: boolean;
  tags: Array<TagKeywordProp>;
  placeholder?: string;
  removeTag?: (description: string) => void;
  addTag?: (description: string) => void;
  currentTags: Array<TagKeywordProp>;
  orderbydescription: boolean;
  noOpenOnFocus?: boolean;
  temporaryTagsArray?: boolean;
  store?: NewAssignmentStore | EditTeachingPathStore;
}

interface State {
  tagInput: string;
  isTagsWindowVisible: boolean;
  temporaryTagsArray: Array<TagKeywordProp>;
  temporaryFoundedTagsArray: Array<TagKeywordProp>;
  temporaryLoadedFoundedTagsArray: Array<TagKeywordProp>;
  isTagInputChanged: boolean;
  newInputValue: string;
  isAddingNewTag: boolean;
}

const TagsKeywordsFound = lazy(() => import('./TagsKeywordsFound'));

class TagKeywordInputWrapper extends Component<Props, State> {
  public tagInput: HTMLInputElement | null = null;

  public state = {
    tagInput: '',
    isTagsWindowVisible: false,
    temporaryTagsArray: [],
    temporaryFoundedTagsArray: [],
    temporaryLoadedFoundedTagsArray: [],
    isTagInputChanged: false,
    newInputValue: '',
    isAddingNewTag: false,
  };

  private onBlurTag = (description: string): void => {
    const idc = (this.props.tags[five]) ? this.props.tags[five].description : '';
    const idFin = this.props.tags[this.props.tags.length - 1].description;
    if (idc === description || idFin === description) {
      this.setState({ isTagsWindowVisible: false });
    }
  }

  private onBlur = (description: string): void => {
    this.setState({ isTagsWindowVisible: false });
  }

  private onSelectTag = (description: string): void => {
    if (this.props.addTag) {
      this.props.addTag(description);
    }
    /*setTimeout(
      () => {
        this.setState({ isTagsWindowVisible: false });
      },
      timeoutlint
    );*/
  }

  private onRemoveTag = (description: string): void => {
    const { removeTag } = this.props;
    if (removeTag) {
      removeTag(description);
    }
    setTimeout(
      () => {
        this.setState({ isTagsWindowVisible: false });
      },
      timeoutlint
    );
  }

  private isTagSelected = (tag: TagKeywordProp): boolean => {
    const { currentTags } = this.props;

    return !!currentTags!.find(currentTag => currentTag.description === tag.description);
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
    }, scrollDelay);
  }

  public temporaryLoadMoreFoundedTags = () => {
    setTimeout(() => {
      this.setState({
        temporaryLoadedFoundedTagsArray: this.state.temporaryFoundedTagsArray.slice(
          0, this.state.temporaryLoadedFoundedTagsArray.length + sixArticles
        )
      });
    }, scrollDelay);
  }

  public handleKeyPressed = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      this.setState({ isAddingNewTag: true });
      this.props.currentTags.push(new Keyword(e.currentTarget.value.trim()));
      this.props.store!.allKeywords.push(new Keyword(e.currentTarget.value.trim()));
      /* this.props.store!.ke */
      this.props.tags.push(new Keyword(e.currentTarget.value.trim()));
      if (this.props.addTag) {
        this.props.addTag(e.currentTarget.value.trim());
      }
      this.setState({ isAddingNewTag: false });
      e.currentTarget.value = '';
    }
  }

  public handleChangeTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (lettersNoEn(e.target.value)) {
      const result = this.props.tags.filter(tag => tag.description.toLowerCase().startsWith(e.target.value));
      /* if (result!.length === 0 && this.state.isAddingNewTag!) {
        this.props.currentTags.push(new Keyword(e.target.value.trim()));
        this.props.tags.push(new Keyword(e.target.value.trim()));
        if (this.props.addTag) {
          this.props.addTag(e.target.value.trim());
        }
        this.setState({ isAddingNewTag: false });
        e.target.value = '';
      } */
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

  public renderCurrentTag = (tag: TagKeywordProp) => {
    const { className } = this.props;
    const darkTheme = !!(className && className.includes('darkTheme'));
    return <CurrentKeywordTag key={tag.description} description={tag.description} title={tag.description} onRemove={this.onRemoveTag} dark={darkTheme} onBlur={this.onBlur}/>;
  }

  public focusInput = () => {
    this.tagInput!.focus();
  }

  public renderTags = () => {
    const { tagInput } = this.state;
    const { tags, listView } = this.props;

    return (
      <TagsKeywordsFound
        onScroll={!tagInput ? this.temporaryLoadMoreTags : this.temporaryLoadMoreFoundedTags}
        tags={!tagInput ? tags : this.state.temporaryLoadedFoundedTagsArray}
        tagInput={tagInput}
        listView={listView}
        onSelectTag={this.onSelectTag}
        onBlurTag={this.onBlurTag}
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
    const { currentTags, orderbydescription } = this.props;
    if (orderbydescription) {
      return currentTags!.sort((a, b) => 1).map(this.renderCurrentTag);
    }
    return currentTags!.sort(sortByAlphabet).map(this.renderCurrentTag);
  }

  public render() {
    const { dataid, className, autoFocus, placeholder, currentTags, orderbydescription } = this.props;
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
          onKeyUp={this.handleKeyPressed}
          onChange={this.handleChangeTagInput}
          ref={node => (this.tagInput = node)}
          aria-labelledby={dataid}
          aria-required="true"
          aria-invalid="false"
          placeholder={placeholder}
        />

        {this.renderVisibleTags()}
      </div>
    );
  }
}

interface CurrentKeywordTagProps {
  title: string;
  description: string;
  dark?: boolean;
  onRemove: (description: string) => void;
  onBlur: (description: string) => void;
}

class CurrentKeywordTag extends Component<CurrentKeywordTagProps> {
  private onRemove = () => {
    const { description, onRemove } = this.props;
    onRemove(description);
  }

  private onBlur = () => {
    const { description, onBlur } = this.props;
    onBlur(description);
  }

  public render() {
    const { description, dark } = this.props;
    return (
      <div className="tag">
        <span className={'title'}>{description}</span>
        <button onClick={this.onRemove} title={description} onBlur={this.onBlur}>
          <img src={dark ? closeCrossLight : closeCross} alt="Close" title={description} />
        </button>
      </div>
    );
  }
}

export const TagKeywordInputComponent = onClickOutside(TagKeywordInputWrapper);
