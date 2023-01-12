import React, { Component, createRef } from 'react';
import classnames from 'classnames';

import { TagProp } from './TagInput';
import { Tag } from './Tag';

interface Props {
  tags: Array<TagProp>;
  tagInput: string;
  isTagSelected: (tag: TagProp) => boolean;
  onSelectTag: (id: number) => void;
  onBlurTag?: (id: number) => void;
  listView?: boolean | false;
  onScroll?: (() => void) | undefined;
  temporaryTagsArray?: Array<TagProp>;
  isScrollToTop: boolean;
}

class TagsFound extends Component<Props> {
  private articlesListRef = createRef<HTMLDivElement>();

  public componentDidUpdate (prevProps: Props) {
    if ((prevProps.isScrollToTop !== this.props.isScrollToTop) && this.props.isScrollToTop) {
      this.articlesListRef.current!.scrollTo(0, 0);
    }
  }

  public renderTag = (tag: TagProp): JSX.Element => {
    const { isTagSelected, onSelectTag, onBlurTag } = this.props;

    return (
      <Tag
        key={tag.id}
        {...tag}
        isSelected={isTagSelected(tag)}
        onClick={onSelectTag}
        onBlur={onBlurTag}
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

    const filteredTags = tags.filter(tag => tag.title.toLowerCase().startsWith(tagInput));

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
