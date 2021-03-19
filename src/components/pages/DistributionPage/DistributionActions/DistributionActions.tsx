import React, { Component } from 'react';
import intl from 'react-intl-universal';
import CopyToClipboard from 'react-copy-to-clipboard';
import ReactTooltip from 'react-tooltip';

import linkImg from 'assets/images/link.svg';
import taskChecklistImg from 'assets/images/task-checklist.svg';

import './DistributionActions.scss';

const tooltipShowTime = 2000;

interface Props {
  distributionLink: string;
}

export class DistributionActions extends Component<Props> {

  public onCopyClick = () => {
    setTimeout(
      () => {
      // tslint:disable-next-line: no-inferred-empty-object-type
        ReactTooltip.hide();
      },
      tooltipShowTime);
  }

  public render() {
    const { distributionLink } = this.props;

    return (
      <div className="DistributionActions flexBox spaceBetween dirColumn">

          <div className="flexBox fw500">
              <img src={linkImg} alt="link" />
              <p>{intl.get('distribution_page.distribute_with_link')}</p>
          </div>

        <div className="distributeLink flexBox spaceBetween alignCenter">
          <div className="fs15">
            {distributionLink}
          </div>
          <CopyToClipboard text={distributionLink}>
            <img
              src={taskChecklistImg}
              alt="task-checklist"
              data-for="copy-tooltip"
              data-iscapture
              data-tip={intl.get('distribution_page.copy_tooltip_title')}
              onClick={this.onCopyClick}
            />
          </CopyToClipboard>
          <ReactTooltip
            id="copy-tooltip"
            place="top"
            type="success"
            effect="solid"
            event="click"
            wrapper="span"
          />
        </div>
      </div>
    );
  }
}
