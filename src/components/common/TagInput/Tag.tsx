import React, { Component } from 'react';
import classnames from 'classnames';

interface TagProps {
  id: number;
  title: string;
  onClick: (id: number) => void;
  isSelected?: boolean | false;
}

export class Tag extends Component<TagProps> {
  private onClick = (): void => {
    const { id, onClick, isSelected } = this.props;

    if (!isSelected) {
      onClick(id);
    }
  }

  public render() {
    const { id, title, isSelected } = this.props;
    const classNames = classnames('tag fw500', {
      selected: isSelected,
      unselected: !isSelected,
    });

    return (
      <button
        className={classNames}
        key={id}
        onClick={this.onClick}
        title={title}
      >
        {title}
      </button>
    );
  }
}
