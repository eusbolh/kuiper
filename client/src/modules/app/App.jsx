import React, { useEffect } from 'react';
import Peer from 'peerjs';
import ConnectToClient from '../../components/connectToClient/ConnectToClient';
import ConnectToServer from '../../components/connectToServer/ConnectToServer';
import FileSharer from '../../components/fileSharer/FileSharer';

let peer = null;

const App = () => {
  useEffect(() => {
    let start, end;
    start = performance.now();
    peer = new Peer(null, {
      host: process.env.REACT_APP_PEER_HOST || 'localhost',
      port: process.env.REACT_APP_PEER_PORT || 5000,
      path: process.env.REACT_APP_PEER_PATH || '/kuiper'
    });
    end = performance.now();
    console.log(start, end, end - start);
    console.log(peer);
    peer.on('connection', (conn) => {
      conn.on('data', (data) => {
        console.log('data');
      });
      conn.on('open', () => {
        conn.send('hello!');
      })
    });
  }, []);
  
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
