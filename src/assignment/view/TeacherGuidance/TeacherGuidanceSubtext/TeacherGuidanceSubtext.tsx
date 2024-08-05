import { EditableQuestion } from 'assignment/assignmentDraft/AssignmentDraft';
import React, { useState } from 'react';
import arrowLeftRounded from 'assets/images/arrow-left-rounded.svg';
import { Question } from 'assignment/Assignment';

export interface Props {
  item: EditableQuestion | Question;
}

export const TeacherGuidanceSubtext = (props: Props) => {
  const [showDescription, setshowDescription] = useState(false);

  const toggleRead = () => {
    if (showDescription) {
      setshowDescription(false);
    } else {
      setshowDescription(true);
    }
  };

  const hasOneTextContentAtLast = () => {
    const index = props.item.content.findIndex(item =>
      item.type === 'TEXT'
    );
    if (index >= 0) {
      return true;
    }
    return false;
  };

  const expandedDiv = (!showDescription) ? 'expansion full' : 'expansion';
  const expandedparagraph = (!showDescription) ? 'paragraph full' : 'paragraph';
  const ClassButton = (showDescription) ? 'toggleRead active' : 'toggleRead';

  if (!hasOneTextContentAtLast()) {
    return null;
  }
  return (

    <div className={expandedDiv}>
      <div className={expandedparagraph}>
        {props.item.content.map(item => item.type === 'TEXT' && <div key={item.text!} dangerouslySetInnerHTML={{ __html: item.text! }} />)}
      </div>
      <a href="#" className={ClassButton} onClick={toggleRead}><img src={arrowLeftRounded} alt="arrowLeftRounded" /></a>
    </div>
  );
};
