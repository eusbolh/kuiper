import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Peer from 'peerjs';
import FileSharer from '../../components/fileSharer/FileSharer';
import { Icon } from 'react-icons-kit'
import * as md from 'react-icons-kit/md'

const handleClientConnection = (serverConn, clientConn, setClientConn, peerID) => {
  let start, end;
  start = performance.now();
  const conn = serverConn.conn.connect(peerID);
  conn.on('open', () => {
    end = performance.now();
    conn.send({
      type: 'INITIAL',
      msg: (end - start).toFixed(3),
    });
    setClientConn([ ...clientConn, {
      conn,
      timeElapsed: (end - start).toFixed(3),
    }]);
    console.log(`Connected to peer (${peerID}) in ${(end - start).toFixed(3)} ms.`);
  });
  conn.on('data', (data) => {
    console.log(data);
  })
}

const handleServerConnection = (setServerConn, setAddClientConn, setPeerList) => {
  let start, end;
  start = performance.now();
  const serverConn = new Peer((Math.random().toString(36) + '0000000000000000000').substr(2, 16), {
    host: process.env.REACT_APP_PEER_HOST || 'localhost',
    port: process.env.REACT_APP_PEER_PORT || 5000,
    path: process.env.REACT_APP_PEER_PATH || '/kuiper',
  });
  end = performance.now();
  setServerConn({
    conn: serverConn,
    timeElapsed: (end - start).toFixed(3),
  })
  
  // Behavior when a peer is connected
  serverConn.on('connection', (conn) => {
    conn.on('data', (data) => {
      switch (data.type) {
        case 'INITIAL':
          setAddClientConn({
            conn,
            timeElapsed: data.msg,
          });
          console.log(`Peer (${conn.peer}) is connected in ${data.msg} ms.`);
          getPeerList(setPeerList);
          break;
        default:
          console.log(data.msg);
          break;
      }
    });
    conn.on('open', () => {
      // console.log('A peer is connected: ', conn);
      // conn.send('Hello!');
    });
    conn.on('disconnected', () => {
      console.log(`Peer (${conn.peer}) is disconnected.`)
    });
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
  const [clientConn, setClientConn] = useState([]);
  const [addClientConn, setAddClientConn] = useState(null);
  const [peerList, setPeerList] = useState([]);

  useEffect(() => {
    if (addClientConn) {
      setClientConn([ ...clientConn, addClientConn]);
      setAddClientConn(null);
    }
  }, [addClientConn]);

  console.log(clientConn);

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
                onClick={() => handleServerConnection(setServerConn, setAddClientConn, setPeerList)}
              >
                {serverConn ? 'Connected to server' : 'Connect to server'}
              </button>
              {
                serverConn
                  ? (
                    <div className="k-connect-to-server-connection-details">
                      <span><b>Server URL</b>{`${serverConn.conn.options.host}:${serverConn.conn.options.port}${serverConn.conn.options.path}`}</span>
                      <span><b>My ID</b>{serverConn.conn._id}</span>
                      <span><b>Elapsed Time to Connect Server</b>{serverConn.timeElapsed}</span>
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
                              <div className="k-connect-to-client-peer-button">
                                <div className="k-connect-to-client-peer-id">{peer}</div>
                                <button
                                  disabled={
                                    peer === serverConn.conn.id
                                    || clientConn.find(conn => peer === conn.conn.peer)
                                  }
                                  onClick={() => handleClientConnection(serverConn, clientConn, setClientConn, peer)}
                                >
                                  Connect
                                </button>
                              </div>
                              {
                                clientConn.find(conn => peer === conn.conn.peer)
                                  ? (
                                    <div className="k-connect-to-client-peer-connection-details">
                                      {`${clientConn.find(conn => peer === conn.conn.peer).timeElapsed} ms elapsed to connect.`}
                                    </div>
                                  ) : null
                              }
                            </div>
                          );
                        })
                      }
                    </div>
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
