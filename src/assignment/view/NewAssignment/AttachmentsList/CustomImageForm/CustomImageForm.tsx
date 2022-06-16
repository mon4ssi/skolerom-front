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

export const CustomImageForm = (props: any) => {
  const articleService: ArticleService = injector.get(ARTICLE_REPO_KEY);
  const [image, setImage] = useState('');
  const [title, setTitle] = useState(props.attachment.title);
  const [source, setSource] = useState(props.attachment.src);
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

  const saveImage = async () => {
    if (validateFields()) {
      const formdata: FormData = new FormData;
      formdata.append('title', title);
      formdata.append('source', source);
      await articleService.updateCustomImage(props.attachment!.id, formdata).then(
        clearFormFields,
        /* clearInputs, */
      ).then(showCustomImageUploadMessage);
      props.onRedirectToList();
    }
  };

  const validateFields = () => {
    let emptyFormFields = '';
    /* if (image === undefined || image === null || image === '') {
      emptyFormFields = emptyFormFields !== '' ? `${emptyFormFields}, image` : 'image';
    } */
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
      title: '' || 'Image updated succesfully'
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
        <img src={props.attachment.path} alt={props.attachment.title} style={{ maxWidth: 180 }} />
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
