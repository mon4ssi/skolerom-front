import { ARTICLE_REPO_KEY } from 'assignment/Assignment';
import { ArticleService } from 'assignment/service';
import { injector } from 'Injector';
import intl from 'react-intl-universal';
import { values } from 'lodash';
import React, { useContext, useState } from 'react';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';

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
  const [fileName, setFileName] = useState(intl.get('assignments_page.img_not'));

  const handleChangeFile = (e: any) => {
    setImage(e.target.files!.length > 0 ? e.target.files![0] : '');
    setFileName(e.target.files!.length > 0 ? e.target.files![0].name.split('.')[0] : intl.get('assignments_page.img_not'));
  };

  const handleChangeTitle = (e: any) => {
    setTitle(e.target.value);
  };

  const handleChangeSource = (e: any) => {
    setSource(e.target.value);
  };

  const saveImage = () => {
    if (validateFields()) {
      const formdata: FormData = new FormData;
      formdata.append('image', image);
      formdata.append('title', title);
      formdata.append('source', source);
      formdata.append('id', '0');
      articleService.createCustomImage(formdata).then(
        clearFormFields,
        /* clearInputs, */
      ).then(showCustomImageUploadMessage);
    }
  };

  const validateFields = () => {
    let emptyFormFields = '';
    if (image === undefined || image === null || image === '') {
      emptyFormFields = emptyFormFields !== '' ? `${emptyFormFields}, image` : 'image';
    }
    if (title === null || title === '') {
      emptyFormFields = emptyFormFields !== '' ? `${emptyFormFields}, title` : 'title';
    }
    if (source === null || source === '') {
      emptyFormFields = emptyFormFields !== '' ? `${emptyFormFields}, source` : 'source';
    }

    if (emptyFormFields !== '') {
      Notification.create({
        type: NotificationTypes.ERROR,
        title: `Please check this fields: ${emptyFormFields}`,
      });
      return false;
    }
    return true;
  };

  const showCustomImageUploadMessage = () => {
    Notification.create({
      type: false ? NotificationTypes.ERROR : NotificationTypes.SUCCESS,
      title: '' || 'Image uploaded succesfully'
    });
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
        <label className="label" htmlFor="title">Title: </label>
        <input id="title" value={title} onChange={(e) => { handleChangeTitle(e); }} className="custom-input-image" type="text" />

      </div>
      <div className="spaced">
        <label className="label" htmlFor="source">Source: </label>
        <input id="source" value={source} onChange={(e) => { handleChangeSource(e); }} className="custom-input-image" type="text" />
      </div>
      <div className="spaced right">
        <button className="createButton" onClick={saveImage}>Save image</button>
      </div>
    </div>
  );
};
