import React, { useState, useRef } from 'react';
import { Loading } from '@kubed/components';

const FRAME_URL = '/proxy/grafana/d/node_exporter_nodes/node-exporter-nodes?orgId=1&refresh=5s&kiosk';

export default function App() {
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef();

  const onIframeLoad = () => {
    const iframeDom = iframeRef.current?.contentWindow.document;
    if (iframeDom) {
      // do something
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
        style={{
          height: 'calc(100vh - 68px)',
          display: loading ? 'none' : 'block',
        }}
        onLoad={onIframeLoad}
      />
    </>
  );
}
