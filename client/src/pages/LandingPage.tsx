import React from 'react';

import Header from '../components/Header/Header';
import PanelContainer from '../components/Panel/PanelContainer';

const LandingPage: React.FC = () => {
  return (
    <main className='flex flex-col min-h-screen'>
      <Header />
      <PanelContainer />
    </main>
  );
};

export default LandingPage;