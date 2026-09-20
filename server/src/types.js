export const TurnState = {
  LOBBY: 'LOBBY',
  ROLE_SETUP: 'ROLE_SETUP',
  PLAY_ROUNDS: 'PLAY_ROUNDS',
  DISCUSSION: 'DISCUSSION',
  VOTING: 'VOTING',
  TURN_RESULT: 'TURN_RESULT',
};

export const PlayerRole = {
  GOD: 'GOD',
  INTRUDER: 'INTRUDER',
  CITIZEN: 'CITIZEN',
};

export const DEFAULT_CONFIG = {
  roundsPerTurn: 2,
  discussionDurationSec: 60,
};
