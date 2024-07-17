import React, { useState, useRef } from 'react';
import { Loading } from '@kubed/components';
import { useLocalStorage } from '@kubed/hooks';

export default function App() {
  const [loading, setLoading] = useState(true);

  const FRAME_URL = '/proxy/weave.works/#!/state/{"topologyId":"pods"}';

  const iframeRef = useRef();

  const onIframeLoad = () => {
    const iframeDom = iframeRef.current?.contentWindow.document;
    if (iframeDom) {
      if (iframeDom.querySelector('#app > div > div.header > div')) {
        iframeDom.querySelector('#app > div > div.header > div').style.display = 'none';
      }
    }
    setLoading(false);
  };

  return (
    <>
      {loading && <Loading className="page-loading" />}
      <iframe
        ref={iframeRef}
        src={FRAME_URL}
        width="100%"
        height="100%"
        frameBorder="0"
        style={{
          height: 'calc(100vh - 68px)',
          display: loading ? 'none' : 'block',
        }}
        onLoad={onIframeLoad}
      />
    </>
  );
}
