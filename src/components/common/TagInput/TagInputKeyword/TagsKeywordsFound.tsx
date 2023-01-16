import React, { Component, createRef } from 'react';
import classnames from 'classnames';

import { TagKeywordProp } from './TagInputKeyword';
import { TagKeyword } from './TagKeyword';

interface Props {
  tags: Array<TagKeywordProp>;
  tagInput: string;
  isTagSelected: (tag: TagKeywordProp) => boolean;
  onSelectTag: (description: string) => void;
  onBlurTag?: (description: string) => void;
  listView?: boolean | false;
  onScroll?: (() => void) | undefined;
  temporaryTagsArray?: Array<TagKeywordProp>;
  isScrollToTop: boolean;
}

class TagsFound extends Component<Props> {
  private articlesListRef = createRef<HTMLDivElement>();

  public componentDidUpdate (prevProps: Props) {
    if ((prevProps.isScrollToTop !== this.props.isScrollToTop) && this.props.isScrollToTop) {
      this.articlesListRef.current!.scrollTo(0, 0);
    }
  }

  public renderTag = (tag: TagKeywordProp): JSX.Element => {
    const { isTagSelected, onSelectTag, onBlurTag } = this.props;

    return (
      <TagKeyword
        key={tag.description}
        {...tag}
        isSelected={isTagSelected(tag)}
        onBlurTag={onBlurTag}
        onClick={onSelectTag}
      />
    );
  }

  public onScroll = (): void => {
    const { onScroll } = this.props;

    if (
      onScroll && (this.articlesListRef.current!.scrollTop + this.articlesListRef.current!.clientHeight >=
      this.articlesListRef.current!.scrollHeight)
    ) {
      onScroll();
    }
  }

  public render() {
    const { temporaryTagsArray, tags, tagInput, listView } = this.props;

    const filteredTags = tags.filter(tag => tag.description.toLowerCase().startsWith(tagInput));

    return (
      <div
        className={classnames('TagsWindow', listView && 'listTags')}
        onScroll={this.onScroll}
        ref={this.articlesListRef}
      >
        {/* temporary */}
        {!tagInput ? temporaryTagsArray!.map(this.renderTag) : filteredTags.map(this.renderTag)}
      </div>
    );
  }
}

export { TagsFound as default };
