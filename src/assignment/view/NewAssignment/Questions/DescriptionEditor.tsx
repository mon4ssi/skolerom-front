import React, { Component } from 'react';
import * as intl from 'react-intl-universal';
import ReactQuill from 'react-quill';
import classnames from 'classnames';

// tslint:disable-next-line: no-import-side-effect
import 'react-quill/dist/quill.bubble.css';
import './DescriptionEditor.scss';

interface Props {
  description: string;
  onChange?: (description: string) => void;
  readOnly?: boolean;
  className?: string;
}

export class DescriptionEditor extends Component<Props> {
  private onChange = (content: string): void => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(content);
    }
  }
  private changeKeyFunction = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.shiftKey && e.key === 'S' || e.shiftKey && e.key === 's') {
      e.preventDefault();
    }
  }

  public render() {
    const { description, readOnly, className } = this.props;

    const placeholder = intl.get('new assignment.enter_a_description');

    const formats = ['bold', 'italic', 'link', 'header'];

    const modules = {
      toolbar: [
        ['bold', 'italic', 'link'],
        [{ header: '1' }, { header: '2' }]
      ],
      clipboard: {
        matchVisual: false,
      },
      keyboard: {
        bindings: {
          tab: false
        }
      }
    };

    return (
      <ReactQuill
        className={classnames('DescriptionEditor', className)}
        theme="bubble"
        formats={formats}
        modules={modules}
        value={description}
        onChange={this.onChange}
        placeholder={placeholder}
        onKeyDown={this.changeKeyFunction}
        bounds=".app"
        readOnly={readOnly}
      />
    );
  }
}
