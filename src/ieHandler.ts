import DeviceDetector from 'device-detector-js';

import './components/pages/IEMessage/IEMessage.scss';

const deviceDetector = new DeviceDetector();
const browserInfo = deviceDetector.parse(navigator.userAgent);

if (browserInfo && browserInfo.client && browserInfo.client.name !== 'Internet Explorer') {
  const element = document.getElementById('browser-message');
  if (element) {
    element.remove();
  }
}
