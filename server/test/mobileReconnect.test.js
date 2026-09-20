import { io } from 'socket.io-client';
import assert from 'assert';

const SERVER_URL = 'http://localhost:4000';

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testMobileReconnect() {
  console.log('📱 [TEST] Testing mobile background / reconnection resilience...');

  // 1. Host (Alice), Bob, Charlie connect
  const socketAlice = io(SERVER_URL, { transports: ['websocket'] });
  const socketBob = io(SERVER_URL, { transports: ['websocket'] });
  const socketCharlie = io(SERVER_URL, { transports: ['websocket'] });

  await Promise.all([
    new Promise((res) => socketAlice.on('connect', res)),
    new Promise((res) => socketBob.on('connect', res)),
    new Promise((res) => socketCharlie.on('connect', res)),
  ]);

  let aliceState = null;
  let bobState = null;

  socketAlice.on('roomStateUpdate', (s) => { aliceState = s; });
  socketBob.on('roomStateUpdate', (s) => { bobState = s; });

  const bobPlayerId = 'mobile_bob_uuid_12345';

  // 2. Create room
  const createRes = await new Promise((res) => {
    socketAlice.emit('createRoom', { username: 'Alice', config: { roundsPerTurn: 1 } }, res);
  });
  const roomCode = createRes.roomCode;

  // 3. Bob joins with persistent playerId
  const joinBobRes = await new Promise((res) => {
    socketBob.emit('joinRoom', { roomCode, username: 'BobMobile', playerId: bobPlayerId }, res);
  });
  assert(joinBobRes.success, 'Bob should join successfully');

  // Charlie joins
  await new Promise((res) => {
    socketCharlie.emit('joinRoom', { roomCode, username: 'Charlie' }, res);
  });
  await wait(150);

  // 4. Start game
  socketAlice.emit('startGame', { roomCode });
  await wait(200);

  // 5. Alice assigns Bob as Intruder
  socketAlice.emit('godAssignRolesAndWords', {
    roomCode,
    intruderSocketId: socketBob.id,
    citizenWord: 'Apple',
    intruderWord: 'Pear',
    starterSocketId: socketBob.id,
  });
  await wait(200);

  assert.strictEqual(bobState.myRole, 'INTRUDER', 'Bob must be INTRUDER');
  assert.strictEqual(bobState.mySecretWord, 'Pear', 'Bob must have secret variant Pear');
  console.log('✅ Game in progress. Bob is INTRUDER with word "Pear"');

  // 6. SIMULATE MOBILE BACKGROUNDING:
  // Bob's phone locks or goes to home screen -> socket drops
  console.log('🔌 Simulating mobile home screen / socket disconnect for Bob...');
  socketBob.disconnect();
  await wait(300);

  // 7. SIMULATE MOBILE RETURNING:
  // User reopens the app -> new socket is created with a brand new socketId, but same playerId and username!
  console.log('📲 Simulating user reopening app (new socket connecting with stored playerId)...');
  const socketBobReconnected = io(SERVER_URL, { transports: ['websocket'] });
  await new Promise((res) => socketBobReconnected.on('connect', res));

  let bobReconnectedState = null;
  socketBobReconnected.on('roomStateUpdate', (s) => { bobReconnectedState = s; });

  // Mobile re-emits joinRoom automatically from stored session
  const rejoinRes = await new Promise((res) => {
    socketBobReconnected.emit(
      'joinRoom',
      { roomCode, username: 'BobMobile', playerId: bobPlayerId },
      res
    );
  });

  assert(rejoinRes.success, 'Bob must successfully rejoin game in progress without error');
  await wait(200);

  assert(bobReconnectedState !== null, 'Bob should immediately receive roomState');
  assert.strictEqual(bobReconnectedState.state, 'PLAY_ROUNDS', 'State should still be PLAY_ROUNDS');
  assert.strictEqual(bobReconnectedState.myRole, 'INTRUDER', 'Bob role must still be INTRUDER');
  assert.strictEqual(bobReconnectedState.mySecretWord, 'Pear', 'Bob secret word must still be Pear');
  assert.strictEqual(
    bobReconnectedState.currentSpeakerSocketId,
    socketBobReconnected.id,
    'Turn queue speaker socket ID must be re-bound to Bob new socketId'
  );

  console.log('✅ Bob seamlessly restored session and turn without typing the code again!');

  // Clean up
  socketAlice.disconnect();
  socketBobReconnected.disconnect();
  socketCharlie.disconnect();

  console.log('🎉 MOBILE RECONNECT TEST PASSED 100%!');
  process.exit(0);
}

testMobileReconnect().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
