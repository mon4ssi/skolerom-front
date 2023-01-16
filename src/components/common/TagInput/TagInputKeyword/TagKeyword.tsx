import React, { Component } from 'react';
import classnames from 'classnames';

interface TagKeywordProps {
  description: string;
  onClick: (description: string) => void;
  onBlurTag?: (description: string) => void;
  isSelected?: boolean | false;
}

export class TagKeyword extends Component<TagKeywordProps> {
  private onClick = (): void => {
    const { description, onClick, isSelected } = this.props;

    if (!isSelected) {
      onClick(description);
    }
  }

  private onBlurTag = (): void => {
    const { description, onBlurTag, isSelected } = this.props;

    onBlurTag!(description);
  }

  public render() {
    const { description, isSelected } = this.props;
    const classNames = classnames('tag fw500', {
      selected: isSelected,
      unselected: !isSelected,
    });

    return (
      <button
        className={classNames}
        key={description}
        onClick={this.onClick}
        onBlur={this.onBlurTag}
        title={description}
      >
        {description}
      </button>
    );
  }
}
