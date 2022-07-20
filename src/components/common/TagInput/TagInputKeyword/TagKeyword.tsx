import React, { Component } from 'react';
import classnames from 'classnames';

interface TagKeywordProps {
  description: string;
  onClick: (description: string) => void;
  isSelected?: boolean | false;
}

export class TagKeyword extends Component<TagKeywordProps> {
  private onClick = (): void => {
    const { description, onClick, isSelected } = this.props;

    if (!isSelected) {
      onClick(description);
    }
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
        title={description}
      >
        {description}
      </button>
    );
  }
}
