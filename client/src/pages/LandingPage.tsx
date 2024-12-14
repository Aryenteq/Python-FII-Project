import React from 'react';

import Header from '../components/Header/Header';
import PanelContainer from '../components/Panel/PanelContainer';

import { ItemsProvider } from '../context/ItemsContext';
import { RefetchProvider } from '../context/RefetchContext';

const LandingPage: React.FC = () => {
  return (
    <div className='flex flex-col h-screen'>
      <ItemsProvider>
        <Header />
        <RefetchProvider>
          <PanelContainer />
        </RefetchProvider>
      </ItemsProvider>
    </div>
  );
};

export default LandingPage;