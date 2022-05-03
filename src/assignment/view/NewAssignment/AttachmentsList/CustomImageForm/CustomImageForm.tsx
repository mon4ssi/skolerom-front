import { ARTICLE_REPO_KEY } from 'assignment/Assignment';
import { ArticleService } from 'assignment/service';
import { injector } from 'Injector';
import { values } from 'lodash';
import React, { useContext, useState } from 'react';

import './CustomImageForm.scss';

export interface CustomImage {
  image: File | string | null;
  title: string;
  source: string;
  id?: number;
}

export const CustomImageForm = () => {
  const articleService: ArticleService = injector.get(ARTICLE_REPO_KEY);
  const [image, setImage] = useState('');
  const [title, setTitle] = useState('');
  const [source, setSource] = useState('');
  const [fileName, setFileName] = useState('');

  const handleChangeFile = (e: any) => {
    setImage(e.target.files!.length > 0 ? e.target.files![0] : 'Image not selected yet.');
    setFileName(e.target.files!.length > 0 ? e.target.files![0].name : 'Image not selected yet.');
  };

  const handleChangeTitle = (e: any) => {
    setTitle(e.target.value);
  };

  const handleChangeSource = (e: any) => {
    setSource(e.target.value);
  };

  const saveImage = () => {
    const formdata: FormData = new FormData;
    formdata.append('image', image);
    formdata.append('title', title);
    formdata.append('source', source);
    formdata.append('id', '0');
    articleService.createCustomImage(formdata).then(
      clearFormFields,
      /* clearInputs, */
    );
  };

  /* const clearInputs = () => {

  } */

  const clearFormFields = () => {
    setImage('');
    setTitle('');
    setSource('');
    setFileName('');
  };

  return (
    <div>
      <div className="spaced">
        <label className="custom-file-upload">
          <input onChange={(e) => { handleChangeFile(e); }} className="inputFileImages" type="file" accept="image/png, image/jpg, image/jpeg" />
          Select a new image
        </label>
        <span className="filenameSpan">{fileName}</span>

      </div>
      <div className="spaced">
        Title: <input id="title" onChange={(e) => { handleChangeTitle(e); }} className="custom-input-image" type="text" />

      </div>
      <div className="spaced">
        Source: <input id="source" onChange={(e) => { handleChangeSource(e); }} className="custom-input-image" type="text" />
      </div>
      <div className="spaced right">
        <button className="createButton" onClick={saveImage}>Save image</button>
      </div>
    </div>
  );
};
