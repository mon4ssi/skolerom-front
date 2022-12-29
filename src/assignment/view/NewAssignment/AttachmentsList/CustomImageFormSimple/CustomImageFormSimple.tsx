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

export interface CustomImageItem {
  file: File;
  title: string;
  source: string;
}

export const CustomImageFormSimple = (props: any) => {
  const THOUSAND = 1024;
  const HUNDRED = 100;
  const THREE_SECONDS = 0;
  const articleService: ArticleService = injector.get(ARTICLE_REPO_KEY);
  const fileArray: Array<File> = [];
  const filenames: Array<string> = [];
  const filesListBase: Array<CustomImageItem> = [];
  /* const [imageFileArray, setImageFileArray] = useState(fileArray); */
  const [fileList, setFileList] = useState(filesListBase);
  const [value, setValue] = useState(0);
  const [fileNames, setFileNames] = useState(filenames);
  const [progressBar, setProgressBar] = useState(0);
  const [inProgress, setInProgress] = useState(false);

  const isNotEmpty = fileList!.length !== 0;

  const handleChangeFile = (e: any) => {
    const files: Array<File> = [];
    const filenames: Array<string> = [];
    /* setImagesFileList(e.target.files!.length > 0 ? e.target.files! : []); */
    setValue(e.target!.files!.length);
    for (let i = 0; i < e.target!.files!.length; i = i + 1) {
      files.push(e.target!.files![i]);
      filenames.push(e.target!.files![i].name);
      const fileTemp: CustomImageItem = {
        file: e.target!.files![i],
        title: getFileNameWithoutExtension(e.target!.files![i].name),
        source: ''
      };
      fileList.push(fileTemp);
    }
    /* setImageFileArray(files); */
    setFileNames(filenames!);
  };

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
    const temporalArray = fileList;
    const imageForRemoving: number = fileList.findIndex(element => fileName.includes(element.title));
    temporalArray.splice(imageForRemoving, 1);
    /* setImagesFileList(temporalArray!); */
    setFileList(temporalArray!);
    setValue(value - 1);
  };

  const renderUploadImagesButton = () => <div className="spaced right"><button className="createButton" onClick={uploadImages}>{intl.get('new assignment.uploadCustomImages.upload_images')}</button></div>;

  const uploadImages = () => {

    if (value === 1) {
      uploadSingleImage();
    } else {
      uploadMultipleImages();
    }

  };

  const uploadSingleImage = () => {
    let percentage = 0;
    setInProgress(true);
    const amount = HUNDRED / fileList.length;
    fileList.forEach(async (image) => {
      const formData = new FormData();
      formData.append('image', image.file);
      formData.append('title', getFileNameWithoutExtension(image.title));
      formData.append('source', image.source);
      try {
        await articleService.createCustomImage(formData).then(() => {
          for (let i = 1; i <= amount; i += 1) {
            setProgressBar(i);
            if (i === HUNDRED) {
              percentage = i;
            }
          }
        });
      } catch (error) {
        showCustomImageUploadMessageError();
        setProgressBar(0);
        setInProgress(false);
        setFileList([]);
        /* setImageFileArray([]); */
        setValue(0);
      }
      if (percentage >= HUNDRED) {
        setTimeout(async () => {
          await articleService.fetchCustomImages('', 1, '');
          setProgressBar(0);
          setInProgress(false);
          setFileList([]);
          /* setImageFileArray([]); */
          setValue(0);
          showCustomImageUploadMessageSuccess();
          props.onRedirectToList();
        }, THREE_SECONDS);
      }
    });
  };

  const uploadMultipleImages = async () => {
    let percentage = 0;
    setInProgress(true);
    const amount = HUNDRED / fileList.length;
    fileList.forEach(async (image) => {
      const formData = new FormData();
      formData.append('image', image.file);
      formData.append('title', getFileNameWithoutExtension(image.title));
      formData.append('source', image.source);
      try {
        await articleService.createCustomImage(formData).then(() => {
          percentage = percentage + amount;
          setProgressBar(percentage);
        });
      } catch (error) {
        showCustomImageUploadMessageError();
        setProgressBar(0);
        setInProgress(false);
        /* setImageFileArray([]); */
        setFileList([]);
        setValue(0);
      }
      if (percentage >= HUNDRED) {
        setTimeout(async () => {
          await articleService.fetchCustomImages('', 1, '');
          setProgressBar(0);
          setInProgress(false);
          /* setImageFileArray([]); */
          setFileList([]);
          setValue(0);
          showCustomImageUploadMessageSuccess();
          props.onRedirectToList();
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

  const showCustomImageUploadMessageError = () => {
    if (value === 1) {
      Notification.create({
        type: NotificationTypes.ERROR,
        title: '' || intl.get('new assignment.notification.error_single_upload')
      });
    } else {
      Notification.create({
        type: NotificationTypes.ERROR,
        title: '' || intl.get('new assignment.notification.error_multiple_upload')
      });
    }
  };

  const showCustomImageUploadMessageSuccess = () => {
    if (value === 1) {
      Notification.create({
        type: false ? NotificationTypes.ERROR : NotificationTypes.SUCCESS,
        title: '' || intl.get('new assignment.uploadCustomImages.message_success_single')
      });
    } else {
      Notification.create({
        type: false ? NotificationTypes.ERROR : NotificationTypes.SUCCESS,
        title: '' || intl.get('new assignment.uploadCustomImages.message_success_multiple')
      });
    }
  };

  const getFileNameWithoutExtension = (fileName: string): string => {
    if (fileName.includes('.')) {
      return fileName.slice(0, fileName.length - fileName.split('.')[fileName.split('.').length - 1].length - 1);
    }
    return fileName;
  };

  const editSourceForImage = (newSource: string, fileName: string, fileList: Array<CustomImageItem>): void => {
    const index = fileList.find(e => fileName.includes(e.file.name));
    if (index) {
      index!.source = newSource;
    }
  };

  const editTitleForImage = (newTitle: string, fileName: string, fileList: Array<CustomImageItem>): void => {
    const index = fileList.find(e => fileName.includes(e.file.name));
    if (index) {
      index!.title = newTitle;
    }
  };

  const itemImageFile = (file: File) => {
    const size = ((file.size) / THOUSAND) / THOUSAND;
    return (
      <div className="imageUpload" key={file.name}>
        <div key={file.name} className="imageListItem">
          {/* <div className='icon'></div> */}

          <div className="imageData">

            <img className="previewImageUpload" src={URL.createObjectURL(file)} alt="" />

            <div className="infoImage">
              <div>
                <input className="inputImage" type="text" defaultValue={getFileNameWithoutExtension(file.name)!} onChange={e => editTitleForImage(e.target!.value!, file.name!, fileList!)} placeholder="Tittel" />
                <input className="inputImage" type="text" onChange={e => editSourceForImage(e.target!.value!, file.name!, fileList!)} placeholder="Kilde" />
              </div>
              {renderTrashIcon(file.name)}
            </div>
          </div>

        </div>

      </div>
    );
  };

  const renderPreviewImages = () => {
    if (!fileList.length) {
      return undefined;
    }
    return (
      fileList.map((item, index) => itemImageFile(item.file))
    );
  };

  const renderProgressBar = () => (
    <div style={{ display: 'flex', padding: '6px' }}>
      <div style={{ marginRight: '0px' }}>{Math.floor(progressBar)}%</div>
      <div style={{ borderRadius: '4px', marginRight: '3px', marginLeft: '4px', height: '20px', background: '#0b2541', width: `${progressBar}%`, transition: '0.3s' }} />
    </div>
  );

  const renderInputFile = () => (
    <label className="custom-file-upload">
      <input onChange={(e) => { handleChangeFile(e); }} multiple className="inputFileImages" type="file" accept="image/png, image/jpg, image/jpeg" />
      {intl.get('new assignment.uploadCustomImages.select_images')}
    </label>
  );

  return (
    <div>
      <div className="spaced">
        {!isNotEmpty && renderInputFile()}
        <span className="filenameSpan">{`${intl.get('new assignment.uploadCustomImages.counter_message_1')} ${value} ${intl.get('new assignment.uploadCustomImages.counter_message_2')}`}</span>
      </div>
      <div style={{ display: 'inline' }}>
        <div>{isNotEmpty && renderUploadImagesButton()}</div>
        <div>{inProgress && renderProgressBar()}</div>
      </div>
      <div className="imagesList">
        {renderPreviewImages()}
      </div>
    </div>
  );
};
