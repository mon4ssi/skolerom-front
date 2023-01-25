import React, { Component } from 'react';
import intl from 'react-intl-universal';
import classnames from 'classnames';
import Lightbox from 'react-image-lightbox';

// tslint:disable-next-line: no-import-side-effect
import 'react-image-lightbox/style.css';
import './Images.scss';
import { QuestionAttachment } from 'assignment/Assignment';

const numberOfImagesWithoutScroll = 3;

interface ImagesProps {
  paths: Array<string>;
  images?: Array<QuestionAttachment>;
  isEvaluationStyle?: boolean;
  isTeacher?: boolean;
}

export class QuestionAttachments extends Component<ImagesProps> {
  public state = {
    isLightBoxOpen: false,
    currentAttachmentIndex: 0
  };

  public renderLightBox = () => {
    const { paths } = this.props;
    const { currentAttachmentIndex } = this.state;

    return (
      <Lightbox
        mainSrc={paths[currentAttachmentIndex]}
        nextSrc={paths[(currentAttachmentIndex + 1) % paths.length]}
        prevSrc={paths[(currentAttachmentIndex + paths.length - 1) % paths.length]}
        onCloseRequest={this.close}
        onMovePrevRequest={this.onMovePrevRequest}
        onMoveNextRequest={this.onMoveNextRequest}
      />
    );
  }

  public setCurrentAttachmentByIndex = (index: number) => {
    /* if (!this.props.isEvaluationStyle) {
      this.setState({ currentAttachmentIndex: index, isLightBoxOpen: true });
    } */
    this.setState({ currentAttachmentIndex: index, isLightBoxOpen: true });
  }

  public onMovePrevRequest = () => {
    const { currentAttachmentIndex } = this.state;
    const { paths } = this.props;

    this.setState({
      currentAttachmentIndex: (currentAttachmentIndex + paths.length - 1) % paths.length
    });
  }

  public onMoveNextRequest = () => {
    const { currentAttachmentIndex } = this.state;
    const { paths } = this.props;

    this.setState({
      currentAttachmentIndex: (currentAttachmentIndex + 1) % paths.length
    });
  }

  public close = () => {
    this.setState({ isLightBoxOpen: false });
  }

  public renderCustomImageInfo = (image: QuestionAttachment) => (

    <div style={{ fontSize: '13px' }}>
      <div style={{ fontStyle: 'Italic', color: '#767168', fontWeight: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {image.title}
      </div>
      <div style={{ fontStyle: 'Italic', color: '#767168', fontWeight: 300 }}>
      {image.source !== '' && image.source !== null && image.source !== undefined ? `${intl.get('new assignment.updateCustomImagesForm.source')}: ${image.source!.includes('https') ? image.source!.split(',')[0] : image.source!}` : ''}
      </div>
    </div>
  )

  public renderImage = (image: QuestionAttachment, index: number) => {
    const isCustomImage = !image.path.includes('wp-content') && !image.path.includes('sites');
    const onSelectAttachment = () => this.setCurrentAttachmentByIndex(index);
    return (
      <div style={{ width: '275px', minWidth: '220px', padding: '5px' }}>
        <img src={image.path} alt={`Screen ${index}`} key={image.path} onClick={onSelectAttachment} />
        {this.renderCustomImageInfo(image)}
      </div>
    );
  }

  public renderLabel = () => {
    const { isTeacher } = this.props;

    if (!isTeacher) {
      return (
        <div style={{ color: '#939FA7', marginBottom: '40px' }} className={'fs15 fw300'}>
          {intl.get('current_assignment_page.Click to view full size version of images')}
        </div>
      );
    }
  }

  public render() {
    const { paths, images } = this.props;
    const { isLightBoxOpen } = this.state;

    const imageWrapperClassname = classnames(
      'imagesWrapper flexBox',
      paths.length < numberOfImagesWithoutScroll && 'centered',
    );

    return (
      <div className="Images">
        <div className={imageWrapperClassname}>
          {images!.map(this.renderImage)}
        </div>
        {this.renderLabel()}
        {isLightBoxOpen && this.renderLightBox()}
      </div>
    );
  }
}
