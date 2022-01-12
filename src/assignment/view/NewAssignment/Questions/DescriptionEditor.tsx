import React, { Component, createRef } from 'react';
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
  public bodyInput = createRef<ReactQuill>();
  private onChange = (content: string): void => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(content);
    }
  }

  public componentDidMount() {
    this.bodyInput.current!.getEditor().root.focus();
  }

  public render() {
    const { description, readOnly, className } = this.props;

    let placeholder = intl.get('new assignment.enter_a_description');
    if (readOnly === true) { placeholder = ''; }

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
        bounds=".app"
        readOnly={readOnly}
        ref={this.bodyInput}
      />
    );
  }
}
