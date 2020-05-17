import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Peer from 'peerjs';
import ConnectToClient from '../../components/connectToClient/ConnectToClient';
import FileSharer from '../../components/fileSharer/FileSharer';
import { Icon } from 'react-icons-kit'
import * as md from 'react-icons-kit/md'

const handleServerConnection = (setServerConn) => {
  let start, end;
  start = performance.now();
  const conn = new Peer((Math.random().toString(36) + '0000000000000000000').substr(2, 16), {
    host: process.env.REACT_APP_PEER_HOST || 'localhost',
    port: process.env.REACT_APP_PEER_PORT || 5000,
    path: process.env.REACT_APP_PEER_PATH || '/kuiper',
  });
  end = performance.now();
  setServerConn({
    conn,
    timeElapsed: (end - start).toFixed(3),
  })
  conn.on('connection', (conn) => {
    conn.on('data', (data) => {
      console.log('data');
    });
    conn.on('open', () => {
      conn.send('hello!');
    })
  });
}

const getPeerList = (setPeerList) => {
  axios
    .get('http://localhost:5000/peers')
    .then((response) => {
      setPeerList(Object.keys(response.data));
    })
    .catch((error) => {
      throw (error);
    })
}

const App = () => {
  const [serverConn, setServerConn] = useState(null);
  const [clientConn, setClientConn] = useState(null);
  const [peerList, setPeerList] = useState([]);

  console.log(peerList);

  useEffect(() => {
    getPeerList(setPeerList);
  }, [serverConn]);

  return (
    <div className="k-app">
      <div className="k-app-content">
        <section>
          <div className="section-head">
            <div className="section-title">Connect to server</div>
          </div>
          <div className="section-content">
            <div className="k-connect-to-server">
              <button
                disabled={serverConn}
                onClick={() => handleServerConnection(setServerConn)}
              >
                {serverConn ? 'Connected to server' : 'Connect to server'}
              </button>
              {
                serverConn
                  ? (
                    <div className="k-connect-to-server-connection-details">
                      <span><b>Server URL</b>{`${serverConn.conn.options.host}:${serverConn.conn.options.port}${serverConn.conn.options.path}`}</span>
                      <span><b>My ID</b>{serverConn.conn._id}</span>
                    </div>
                  ) : (
                    <div className="k-connect-to-server-connection-details">
                      <div className="k-connect-to-server-connection-details-waiting">
                        Waiting server connection
                      </div>
                    </div>
                  )
              }
            </div>
          </div>
        </section>
        <section>
          <div className="section-head">
            <div className="section-title">Connect to peer</div>
            <div className="section-head-right">
              {
                serverConn
                  ? (
                    <button
                      className="section-head-right-refresh-button"
                      onClick={() => getPeerList(setPeerList)}
                    >
                      <Icon icon={md.ic_refresh} size={24} />
                    </button>
                  ) : null
              }
            </div>
          </div>
          <div className="section-content">
            {
              serverConn
                ? (
                  <div className="k-connect-to-client">
                    <div className="k-connect-to-client-peer-list">
                      {
                        peerList && peerList.map((peer) => {
                          return (
                            <div
                              className="k-connect-to-client-peer"
                              key={`k-connect-to-client-peer-${peer}`}
                            >
                              <div className="k-connect-to-client-peer-id">{peer}</div>
                              <button
                                disabled={peer === serverConn.conn.id}
                                onClick={null}
                              >
                                Connect
                              </button>
                            </div>
                          );
                        })
                      }
                    </div>
                    {
                      clientConn
                        ? (
                          <div className="k-connect-to-client-connection-details">client connection details</div>
                        ) : (
                          <div className="k-connect-to-client-connection-details">
                            <div className="k-connect-to-client-connection-details-waiting">waiting client connection</div>
                          </div>
                        )
                    }
                  </div>
                ) : (
                  <div className="waiting-server-connection">Waiting server connection</div>
                )
            }
          </div>
        </section>
        <section>
          <div className="section-head">
            <div className="section-title">Share file with peer</div>
          </div>
          <div className="section-content">
            <FileSharer />
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
