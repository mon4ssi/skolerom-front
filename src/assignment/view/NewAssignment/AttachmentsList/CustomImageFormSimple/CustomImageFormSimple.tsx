import { ArticleLevel, ARTICLE_REPO_KEY } from 'assignment/Assignment';
import { ArticleService } from 'assignment/service';
import { injector } from 'Injector';
import React, { useContext, useEffect, useState } from 'react';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';
import intl from 'react-intl-universal';

import './CustomImageFormSimple.scss';

import trashIcon from 'assets/images/trash-image.svg';

export interface CustomImage {
  imagesFileList: FileList | any | null;
  title: string;
  source: string;
  id?: number;
}

export const CustomImageFormSimple = (props: any) => {
  const THOUSAND = 1024;
  const HUNDRED = 100;
  const THREE_SECONDS = 3000;
  const articleService: ArticleService = injector.get(ARTICLE_REPO_KEY);
  const fileArray: Array<File> = [];
  const filenames: Array<string> = [];

  const [imagesFileList, setImagesFileList] = useState(fileArray);
  const [imageFileArray, setImageFileArray] = useState(fileArray);
  const [value, setValue] = useState(0);
  const [fileNames, setFileNames] = useState(filenames);
  const [progressBar, setProgressBar] = useState(0);
  const [inProgress, setInProgress] = useState(false);

  const isNotEmpty = imageFileArray!.length !== 0;

  const handleChangeFile = (e: any) => {
    const files: Array<File> = [];
    const filenames: Array<string> = [];
    setImagesFileList(e.target.files!.length > 0 ? e.target.files! : []);
    setValue(e.target!.files!.length);
    for (let i = 0; i < e.target!.files!.length; i = i + 1) {
      files.push(e.target!.files![i]);
      filenames.push(e.target!.files![i].name);
    }
    setImageFileArray(files);
    setFileNames(filenames!);
  };

  /* const renderImgFilesPreview = (files: FileList) => {
    const filesArray: Array<File> = [];
    if (files) {
      for (let i = 0; i < files.length; i++) {
        filesArray.push(files[i]);
      }
    }
    renderFileArray(imageFileArray!);
  }; */

  const renderTrashIcon = (fileName: string) => (
    <div className="is-selectedImage-icon">
      <img
        onClick={() => removeFromImagesArray(fileName)}
        src={trashIcon}
        alt={fileName}
        style={{ maxHeight: 80, maxWidth: 80 }}
      />
    </div>
  );

  const removeFromImagesArray = (fileName: string) => {
    const temporalArray = imageFileArray;
    const imageForRemoving: number = imageFileArray.findIndex(element => element.name === fileName);
    temporalArray.splice(imageForRemoving, 1);
    setImagesFileList(temporalArray!);
    setImageFileArray(temporalArray!);
    setValue(value - 1);
  };

  const renderUploadImagesButton = () => <div className="spaced right"><button className="createButton" onClick={uploadImages}>{intl.get('new assignment.uploadCustomImages.upload_images')}</button></div>;

  const uploadImages = () => {
    let percentage = 0;
    setInProgress(true);
    const amount = HUNDRED / imageFileArray.length;
    imageFileArray.forEach(async (image) => {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('title', image.name.split('.')[0]);
      formData.append('source', image.lastModified.toString());
      try {
        await articleService.createCustomImage(formData).then(() => {
          percentage = percentage + amount;
          setProgressBar(percentage);
        });
      } catch (error) {
        Notification.create({
          type: NotificationTypes.ERROR,
          title: intl.get('new assignment.notification.error'),
        });
        setProgressBar(0);
        setInProgress(false);
        setImageFileArray([]);
        setValue(0);
      }
      if (percentage >= HUNDRED) {
        setTimeout(() => {
          setProgressBar(0);
          setInProgress(false);
          setImageFileArray([]);
          setValue(0);
          articleService.fetchCustomImages('', 1);
        }, THREE_SECONDS);
        showCustomImageUploadMessage();
        props.onRedirectToList();
      }
    });
  };

  /* const validateFields = () => {
    const emptyFormFields = '';
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
  }; */

  const showCustomImageUploadMessage = () => {
    Notification.create({
      type: false ? NotificationTypes.ERROR : NotificationTypes.SUCCESS,
      title: '' || intl.get('new assignment.uploadCustomImages.message_success')
    });
  };

  const itemImageFile = (file: File) => {
    const size = ((file.size) / THOUSAND) / THOUSAND;
    return (
      <div className="image">
        <div key={file.name} className="imageListItem">
          {/* <div className='icon'></div> */}

          <div className="imageData">

            <img className="previewImage" src={URL.createObjectURL(file)} alt="" />
            <div className="infoImage">
              <div className="filename">{file.name}</div>
              <div className="filesize">({parseFloat((size).toFixed(2))} MB)</div>
              {renderTrashIcon(file.name)}
            </div>
          </div>

        </div>

      </div>
    );
  };

  const renderPreviewImages = () => {
    if (!imageFileArray.length) {
      return undefined;
    }
    return (
      imageFileArray.map((item, index) => itemImageFile(item))
    );
  };

  const renderProgressBar = () => (
    <div style={{ display: 'flex' }}>
      <div style={{ marginRight: '0px' }}>{Math.floor(progressBar)}%</div>
      <div style={{ borderRadius: '4px', marginRight: '3px', marginLeft: '4px', height: '20px', background: '#0b2541', width: `${progressBar}%`, transition: '0.3s' }} />
    </div>
  );

  const renderInputFile = () => (
    <label className="custom-file-upload">
      <input onChange={(e) => { handleChangeFile(e); }} multiple className="inputFileImages" type="file" accept="image/png, image/jpg, image/jpeg" />
      {intl.get('new assignment.uploadCustomImages.message_success')}
    </label>
  );

  return (
    <div>
      <div className="spaced">
        {!isNotEmpty && renderInputFile()}
        <span className="filenameSpan">{`${intl.get('new assignment.uploadCustomImages.counter_message_1')} ${value} ${intl.get('new assignment.uploadCustomImages.counter_message_2')}`}</span>
      </div>
      {/* {renderImagesFile(imageFileArray)} */}
      <div style={{ display: 'inline' }}>
        <div>{isNotEmpty && renderUploadImagesButton()}</div>
        <div>{inProgress && renderProgressBar()}</div>
      </div>
      <div className="imagesList">
        {renderPreviewImages()}
      </div>

      {/* {renderImgFilesPreview(imagesFileList!)} */}

    </div>
  );
};
