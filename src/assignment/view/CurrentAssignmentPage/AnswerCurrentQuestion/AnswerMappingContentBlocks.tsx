import React from 'react';

import { ContentBlockType, ImageContentBlock, TextContentBlock, VideoContentBlock } from '../../../ContentBlock';
import { DescriptionEditor } from '../../NewAssignment/Questions/DescriptionEditor';
import { QuestionAttachments } from '../Images/QuestionAttachments';
import { TypedQuestion } from '../../../Assignment';

import './AnswerTextQuestion/AnswerTextQuestion.scss';

interface Props {
  question: TypedQuestion;
}

export const AnswerMappingContentBlock = (props: Props) => {
  const { question } = props;
  const renderBlocks = question.content.map((block) => {
    switch (block.type) {
      case ContentBlockType.Text:
        const textBlock = block as TextContentBlock;
        return <DescriptionEditor description={textBlock.text} readOnly className="descriptionPreview" />;
      case ContentBlockType.Images:
        const imageBlock = block as ImageContentBlock;
        const imagePathes = imageBlock.images.map(image => image.path);
        return <QuestionAttachments paths={imagePathes} />;
      case ContentBlockType.Videos:
        const videoBlock = block as VideoContentBlock;
        const videosPaths = videoBlock.videos.map(video => video.path);
        return <QuestionAttachments paths={videosPaths} />;
      default:
        throw new TypeError(`Unknown content type: ${block.type}`);
    }
  });
  return <>{renderBlocks}</>;
};
