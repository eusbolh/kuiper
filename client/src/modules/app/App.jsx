import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Peer from 'peerjs';
import { Icon } from 'react-icons-kit'
import * as md from 'react-icons-kit/md'
import { a as file1kb } from '../../common/assets/file1kb';
import { a as file2kb } from '../../common/assets/file2kb';
import { a as file4kb } from '../../common/assets/file4kb';
import { a as file8kb } from '../../common/assets/file8kb';
import { a as file16kb } from '../../common/assets/file16kb';
import { a as file512kb } from '../../common/assets/file512kb';
import { a as file1mb } from '../../common/assets/file1mb';
import { a as file2mb } from '../../common/assets/file2mb';
import { a as file4mb } from '../../common/assets/file4mb';

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
  });

  /*
    Connection stats
    https://stackoverflow.com/questions/29130453/using-webrtc-getstat-api/37148261

    conn.peerConnection.getStats((report) => {
      var rtcStatsReports = report.result();
      console.log(rtcStatsReports);
      for (var i=0; i<rtcStatsReports.length; i++) {
        var statNames = rtcStatsReports[i].names();
        var logs = "";
        for (var j=0; j<statNames.length; j++) {
            var statName = statNames[j];
            var statValue = rtcStatsReports[i].stat(statName);
            logs = logs + statName + ": " + statValue + ", ";
        }
        console.log(logs);
      }
    });
  */
}

const handleServerConnection = (setServerConn, setAddClientConn, setPeerList) => {
  let start, end;
  start = performance.now();
  const serverConn = new Peer((Math.random().toString(36) + '0000000000000000000').substr(2, 16), {
    host: process.env.REACT_APP_PEER_HOST || '161.35.66.51',
    port: process.env.REACT_APP_PEER_PORT || 5000,
    path: process.env.REACT_APP_PEER_PATH || '/kuiper',
  });

  serverConn.on('open', () => {
    end = performance.now();
    setServerConn({
      conn: serverConn,
      timeElapsed: (end - start).toFixed(3),
    });
    console.log(`Connected to server in ${(end - start).toFixed(3)} ms.`);
  });
  
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

const sendFileToPeer = (fileSizeToSend, clientToSend, clientConn) => {
  // Find peer connection to send the file
  const peerToSend = clientConn.find(conn => conn.conn && conn.conn.peer === clientToSend).conn;

  // Find file to send to the peer
  let file = '';
  switch (fileSizeToSend) {
    case '1 KB':
      file = `${file1kb}`;
      break;
    case '2 KB':
      file = `${file2kb}`;
      break;
    case '4 KB':
      file = `${file4kb}`;
      break;
    case '8 KB':
      file = `${file8kb}`;
      break;
    case '16 KB':
      file = `${file16kb}`;
      break;
    case '512 KB':
      file = `${file512kb}`;
      break;
    case '1 MB':
      file = `${file1mb}`;
      break;
    case '2 MB':
      file = `${file2mb}`;
      break;
    case '4 MB':
      file = `${file4mb}`;
      break;
    default:
      break;
  }
  const start = performance.now();
  peerToSend.send({
    type: 'FILE',
    msg: file,
  });
  const end = performance.now();
  const timeElapsed = (end - start).toFixed(3);
  console.log(`${timeElapsed} ms elapsed to send a file of size ${fileSizeToSend} to ${clientToSend}.`);
}

const getPeerList = (setPeerList) => {
  axios
    .get('http://161.35.66.51:5000/peers')
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
  const [fileSizeToSend, setFileSizeToSend] = useState('1 MB');
  const [clientToSend, setClientToSend] = useState(undefined);

  useEffect(() => {
    if (addClientConn) {
      setClientConn([ ...clientConn, addClientConn]);
      setAddClientConn(null);
    }
  }, [addClientConn, clientConn]);

  useEffect(() => {
    getPeerList(setPeerList);
  }, [serverConn]);

  const handleFileSizeToSendChange = (e) => {
    setFileSizeToSend(e.target.value);
  };

  const handleClientToSendChange = (e) => {
    setClientToSend(e.target.value);
  };

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
                      <span><b>Elapsed Time to Connect Server</b>{serverConn.timeElapsed} ms</span>
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
            {
              clientConn && clientConn.length > 0
                ? (
                  <div className="k-share-file-with-peer">
                    <div className="k-share-file-with-peer-file-list">
                      <select name="files" id="files" onChange={handleFileSizeToSendChange} value={fileSizeToSend}>
                        <option value="1 KB">1 KB</option>
                        <option value="2 KB">2 KB</option>
                        <option value="4 KB">4 KB</option>
                        <option value="8 KB">8 KB</option>
                        <option value="16 KB">16 KB</option>
                        <option value="512 KB">512 KB</option>
                        <option value="1 MB">1 MB</option>
                        <option value="2 MB">2 MB</option>
                        <option value="4 MB">4 MB</option>
                      </select>
                    </div>
                    <div className="k-share-file-with-peer-peer-list">
                      <select name="peers" id="peers" onChange={handleClientToSendChange}>
                        <option defaultValue>Select a peer</option>
                        {clientConn && clientConn.map((conn, index) => (
                          <option
                            key={`peer-${index}`}
                            value={conn.conn.peer}
                          >
                            {conn.conn.peer}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      disabled={!clientToSend}
                      onClick={() => sendFileToPeer(fileSizeToSend, clientToSend, clientConn)}
                    >
                      {clientToSend ? 'Send file' : 'Select a client to send'}
                    </button>
                  </div>
                ) : (
                  <div className="waiting-server-connection">Waiting client connection</div>
                )
            }
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
