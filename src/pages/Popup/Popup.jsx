import React, { useState, useEffect, useRef } from 'react';
import './Popup.css';

function m(strings, ...values) {
  return chrome.i18n.getMessage(strings[0]);
}

const GithubIcon = () => {
  return (
    <svg
      width="20px"
      height="20px"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20.9992 5.95846C21.0087 6.565 20.9333 7.32649 20.8658 7.8807C20.8395 8.09686 20.8037 8.27676 20.7653 8.42453C21.6227 10.01 22 11.9174 22 14C22 16.4684 20.8127 18.501 18.9638 19.8871C17.1319 21.2605 14.6606 22 12 22C9.33939 22 6.86809 21.2605 5.0362 19.8871C3.18727 18.501 2 16.4684 2 14C2 11.9174 2.37732 10.01 3.23472 8.42452C3.19631 8.27676 3.16055 8.09685 3.13422 7.8807C3.06673 7.32649 2.99133 6.565 3.00081 5.95846C3.01149 5.27506 3.10082 4.5917 3.19988 3.91379C3.24569 3.60028 3.31843 3.30547 3.65883 3.11917C4.00655 2.92886 4.37274 2.99981 4.73398 3.1021C5.95247 3.44713 7.09487 3.93108 8.16803 4.51287C9.2995 4.17287 10.5783 4 12 4C13.4217 4 14.7005 4.17287 15.832 4.51287C16.9051 3.93108 18.0475 3.44713 19.266 3.1021C19.6273 2.99981 19.9935 2.92886 20.3412 3.11917C20.6816 3.30547 20.7543 3.60028 20.8001 3.91379C20.8992 4.5917 20.9885 5.27506 20.9992 5.95846ZM20 14C20 12.3128 19.6122 10 17.5 10C16.5478 10 15.6474 10.2502 14.7474 10.5004C13.8482 10.7502 12.9495 11 12 11C11.0505 11 10.1518 10.7502 9.25263 10.5004C8.35261 10.2502 7.45216 10 6.5 10C4.39379 10 4 12.3197 4 14C4 15.7636 4.82745 17.231 6.23588 18.2869C7.66135 19.3556 9.69005 20 12 20C14.3099 20 16.3386 19.3555 17.7641 18.2869C19.1726 17.231 20 15.7636 20 14ZM10 14.5C10 15.8807 9.32843 17 8.5 17C7.67157 17 7 15.8807 7 14.5C7 13.1193 7.67157 12 8.5 12C9.32843 12 10 13.1193 10 14.5ZM15.5 17C16.3284 17 17 15.8807 17 14.5C17 13.1193 16.3284 12 15.5 12C14.6716 12 14 13.1193 14 14.5C14 15.8807 14.6716 17 15.5 17Z"
        fill="#000000"
      />
    </svg>
  );
};

const DefaultDelay = 200;

const Popup = () => {
  const [delay, setDelay] = useState(DefaultDelay);
  const delayInputRef = useRef();

  useEffect(() => {
    // prevent flashing
    delayInputRef.current.style.opacity = 0;
    (async () => {
      const { delay: storedDelay } = (await chrome.storage.local.get(
        'delay'
        )) || { delay: 200 };
        let delayValue = storedDelay || delay;
        setDelay(delayValue);
        delayInputRef.current.value = (delayValue - 100) / 50;
        delayInputRef.current.style.opacity = 1;
    })();
  }, [setDelay, delayInputRef.current]);

  return (
    <div className="container">
      <div className="row header">
        <div>{m`Setting`}</div>
        <div>
          <a title={m`contact_author`}>
            <GithubIcon />
          </a>
        </div>
      </div>
      <div className="row">
        <input
          ref={delayInputRef}
          type="range"
          onInput={(e) => {
            const delay = 100 + Number(e.target.value) * 50;
            setDelay(delay);
            chrome.storage.local.set({
              delay,
            });
          }}
          name="delay"
          min="0"
          max="10"
        />
        <span>{`${m`Delay`}: ${delay}${m`ms`}`}</span>
      </div>
      <div className="row">{m`functionExplain`}</div>
    </div>
  );
};

export default Popup;
