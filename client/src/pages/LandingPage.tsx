import React from 'react';

import Header from '../components/Header/Header';
import PanelContainer from '../components/Panel/PanelContainer';

const LandingPage: React.FC = () => {
  return (
    <div className='flex flex-col h-screen'>
      <Header />
      <PanelContainer />
    </div>
  );
};

export default LandingPage;