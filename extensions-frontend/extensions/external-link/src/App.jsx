import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loading } from '@kubed/components';

const LINK = 'https://dev-guide.kubesphere.io/';

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    window.open(LINK);
    navigate(-1, { replace: true });
  }, []);

  return <Loading className="page-loading" />;
}
