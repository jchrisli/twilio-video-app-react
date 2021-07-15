import { io } from 'socket.io-client';

const wsAddr = 'https://videochat-new.herokuapp.com';
const sio = io(wsAddr);
// TODO: maybe set up some logic for connection status --> how to share the information?
// Some kind of global object updated in closures?

export default sio;
