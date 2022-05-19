import { ArticleLevel, ARTICLE_REPO_KEY } from 'assignment/Assignment';
import { ArticleService } from 'assignment/service';
import { injector } from 'Injector';
import React, { useContext, useState } from 'react';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';

import './CustomImageFormSimple.scss';

import trashIcon from 'assets/images/trash.svg';

export interface CustomImage {
  imagesFileList: FileList | any | null;
  title: string;
  source: string;
  id?: number;
}

export const CustomImageFormSimple = () => {
  const THOUSAND = 1000;
  const HUNDRED = 100;
  const THREE_SECONDS = 3000;
  const articleService: ArticleService = injector.get(ARTICLE_REPO_KEY);
  const fileArray: Array<File> = [];
  const filenames: Array<string> = [];
  const [imagesFileList, setImagesFileList] = useState();
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

  /* const renderTrashIcon = () => {
    return (
      <div className="is-selected-icon">
        <img
          src={trashIcon}
          alt="active"
          style={{ maxHeight: 60, maxWidth: 60 }}
        />
      </div>
    );
  } */

  const renderUploadImagesButton = () => <div className="spaced right"><button className="createButton" onClick={uploadImages}>Upload image(s)</button></div>;

  const uploadImages = () => {
    let percentage = 0;
    setInProgress(true);
    const amount = HUNDRED / imageFileArray.length;
    imageFileArray.forEach(async (image) => {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('title', image.name);
      formData.append('source', image.lastModified.toString());
      await articleService.createCustomImage(formData).then(() => {
        percentage = percentage + amount;
        setProgressBar(percentage);
      });
      if (percentage >= HUNDRED) {
        setTimeout(() => {
          setProgressBar(0);
          setInProgress(false);
          setImageFileArray([]);
          setValue(0);
          articleService.fetchCustomImages();
        }, THREE_SECONDS);
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
      title: '' || 'Image uploaded succesfully'
    });
  };

  const itemImageFile = (file: File) => (
    <div key={file.name} className="imageListItem">
      {/* <div className='icon'></div> */}
      <div className="imageData">
        <img className="previewImage" src={URL.createObjectURL(file)} alt="" />
        <div>
          <div className="filename">{file.name}</div>
          <div className="filesize">({file.size / THOUSAND} MB)</div>
        </div>
        <div>
          <div>
            {/* {renderTrashIcon()} */}
          </div>
        </div>
      </div>
    </div>
  );

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

  return (
    <div>
      <div className="spaced">
        <label className="custom-file-upload">
          <input onChange={(e) => { handleChangeFile(e); }} multiple className="inputFileImages" type="file" accept="image/png, image/jpg, image/jpeg" />
          Add new images
        </label>
        <span className="filenameSpan">You have chosen {value} image(s).</span>

      </div>
      {/* {renderImagesFile(imageFileArray)} */}

      {renderPreviewImages()}
      {/* {renderImgFilesPreview(imagesFileList!)} */}
      <div style={{ display: 'inline' }}>
        <div>{inProgress && renderProgressBar()}</div>
        <div>{isNotEmpty && renderUploadImagesButton()}</div>
      </div>
    </div>
  );
};
