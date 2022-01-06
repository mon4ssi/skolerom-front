import React, { Component } from 'react';
import { EditableTeachingPathNode } from 'teachingPath/teachingPathDraft/TeachingPathDraft';

interface Props {
  nodeData: EditableTeachingPathNode;
}

interface TeacherguidanceChild {
  level: number;
  title: string;
  description: string;
}

interface Teacherguidance {
  modalTitle: string;
  sourceTitle:string;
  sourceDescription:string;
  children: Array<TeacherguidanceChild>;
}

const getDataTeacherguidance = (data: EditableTeachingPathNode): Teacherguidance => {
  const nodeTG: Array<TeacherguidanceChild> = [];
  const obj: Teacherguidance = {
    modalTitle: 'How is the teacher supposed to use this teaching path?',
    sourceTitle: 'prueba',
    sourceDescription: 'prueba2',
    children: nodeTG,
  };
  return obj;
};

export const TeacherguidanceModal = (props: Props) => {
  const dataTeacherguidance = getDataTeacherguidance(props.nodeData);
  return (
      <div>
          <h1>{dataTeacherguidance.modalTitle}</h1>
      </div>
  );
};
