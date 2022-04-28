import React, { useState } from 'react';

import './CustomImageForm.scss';

export interface CustomImage {
  file: string;
  title: string;
  source: string;
}

export const CustomImageForm = () => {

  const [file, setFile] = useState('');
  const [title, setTitle] = useState('');
  const [source, setSource] = useState('');

  const handleChangeFile = (e: any) => {
    setFile(e.target.files!.length > 0 ? e.target.files![0].name : 'Image not selected yet.');
  };

  const handleChangeTitle = (e: any) => {
    setTitle(e.target.value);
  };

  const handleChangeSource = (e: any) => {
    setSource(e.target.value);
  };

  const saveImage = () => {
    const newCustomImage: CustomImage = {
      file: file.toString(),
      title: title.toString(),
      source: source.toString()
    };
  };

  return (
    <div>
      <div className="spaced">
        <label className="custom-file-upload">
          <input onChange={(e) => { handleChangeFile(e); }} className="inputFileImages" type="file" accept="image/png, image/jpg, image/jpeg" />
          Select a new image
        </label>
        <span className="filenameSpan">{file}</span>

      </div>
      <div className="spaced">
        Title: <input onChange={(e) => { handleChangeTitle(e); }} className="custom-input-image" type="text" />

      </div>
      <div className="spaced">
        Source: <input onChange={(e) => { handleChangeSource(e); }} className="custom-input-image" type="text" />
      </div>
      <div className="spaced right">
        <button className="createButton" onClick={saveImage}>Save image</button>
      </div>
      <div style={{ margin: '40px' }}>
        {file} <br />
        {title} <br />
        {source} <br />
      </div>
    </div>
  );
};
