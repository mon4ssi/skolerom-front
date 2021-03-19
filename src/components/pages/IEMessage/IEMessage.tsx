import React, { Component, MouseEvent } from 'react';
import intl from 'react-intl-universal';

import warningImg from 'assets/images/warning.svg';
import operaImg from 'assets/images/opera.svg';
import firefoxImg from 'assets/images/firefox.svg';
import edgeImg from 'assets/images/edge.svg';
import googleChromeImg from 'assets/images/google-chrome.svg';

import './IEMessage.scss';

type Browser = {
  img: string;
  name: string;
  founder: string;
  url: string;
};

const browsersList: Array<Browser> = [
  {
    img: operaImg,
    name: 'Opera',
    founder: 'Opera Software',
    url: 'https://www.opera.com/'
  },
  {
    img: firefoxImg,
    name: 'Firefox',
    founder: 'Mozilla Foundation',
    url: 'https://www.mozilla.org/'
  },
  {
    img: edgeImg,
    name: 'Edge',
    founder: 'Microsoft',
    url: 'https://www.microsoft.com/edge'
  },
  {
    img: googleChromeImg,
    name: 'Google Chrome',
    founder: 'Google',
    url: 'https://www.google.com/chrome/'
  }
];

export class IEMessage extends Component {

  public renderBrowser = (browser: Browser) => {
    const openBrowserSource = (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      window.open(browser.url);
    };

    return (
      <div
        className="IEMessage_browser"
        onClick={openBrowserSource}
      >
        <img src={browser.img} alt="browser" />
        <div className="IEMessage_browser__name">{browser.name}</div>
        <div className="IEMessage_browser__founder">{browser.founder}</div>
      </div>
    );
  }

  public render() {
    return (
      <div className="IEMessage_container">
        <div className="IEMessage_window">
          <div className="IEMessage_header">
            <img src={warningImg} alt="warning" />
            {intl.get('ie_message.warning')}
          </div>

          <div className="IEMessage_body">
            <p className="IEMessage_body__part1">
              {intl.get('ie_message.part1')}
            </p>
            <p className="IEMessage_body__part2">
              {intl.get('ie_message.part2')}
            </p>

            <div className="IEMessage_browsers">
              {browsersList.map(this.renderBrowser)}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
