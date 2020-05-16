import React from 'react';
import ConnectToClient from '../../components/connectToClient/ConnectToClient';
import ConnectToServer from '../../components/connectToServer/ConnectToServer';
import FileSharer from '../../components/fileSharer/FileSharer';

const App = () => {
  return (
    <div className="k-app">
      <section>
        <div className="section-title">Connect to server</div>
        <div className="section-content">
          <ConnectToServer />
        </div>
      </section>
      <section>
        <div className="section-title">Connect to peer</div>
        <div className="section-content">
          <ConnectToClient />
        </div>
      </section>
      <section>
        <div className="section-title">Share file with peer</div>
        <div className="section-content">
          <FileSharer />
        </div>
      </section>
    </div>
  );
}

export default App;
