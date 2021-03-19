import React from 'react';
import { Link } from 'react-router-dom';
import intl from 'react-intl-universal';

import './Page404.scss';

import notFound from '../../../assets/images/404.svg';

export const Page404: React.FC = () =>
  (
    <div className="container-404">
      <img src={notFound} alt="page-404" />
      <span className={'notFountTitle'}>{intl.get('not found.title')}</span>
      <span className={'notFoundDescription'}>
        {intl.get('not found.description1')}
        <br/>
        {intl.get('not found.description2')}
      </span>
      <Link to="/activity">
        <button className="home">{intl.get('not found.back')}</button>
      </Link>
    </div>
  );
