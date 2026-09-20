{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "IntruderGameSchemas",
  "definitions": {
    "Player": {
      "type": "object",
      "properties": {
        "socketId": { "type": "string" },
        "userId": { "type": "string" },
        "username": { "type": "string" },
        "isHost": { "type": "boolean" },
        "isAlive": { "type": "boolean", "default": true }
      },
      "required": ["socketId", "username", "isHost"]
    },
    "GameConfig": {
      "type": "object",
      "properties": {
        "roundsPerTurn": { "type": "integer", "minimum": 1, "maximum": 5, "default": 2 },
        "discussionDurationSec": { "type": "integer", "minimum": 30, "maximum": 300, "default": 90 }
      },
      "required": ["roundsPerTurn", "discussionDurationSec"]
    },
    "TurnState": {
      "type": "string",
      "enum": ["LOBBY", "ROLE_ASSIGNMENT", "WORD_DISTRIBUTION", "PLAY_ROUNDS", "DISCUSSION", "VOTING", "TURN_RESULT"]
    },
    "Room": {
      "type": "object",
      "properties": {
        "roomCode": { "type": "string", "maxLength": 6 },
        "config": { "$ref": "#/definitions/GameConfig" },
        "state": { "$ref": "#/definitions/TurnState" },
        "players": {
          "type": "array",
          "items": { "$ref": "#/definitions/Player" }
        },
        "godSocketId": { "type": ["string", "null"] },
        "godRotationIndex": { "type": "integer", "default": 0 },
        "intruderSocketId": { "type": ["string", "null"] },
        "wordAssignments": {
          "type": "object",
          "additionalProperties": { "type": "string" }
        },
        "currentRound": { "type": "integer", "default": 1 },
        "turnOrderQueue": {
          "type": "array",
          "items": { "type": "string" }
        },
        "currentSpeakerIndex": { "type": "integer", "default": 0 },
        "submittedWords": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "socketId": { "type": "string" },
              "username": { "type": "string" },
              "round": { "type": "integer" },
              "word": { "type": "string" }
            }
          }
        },
        "votes": {
          "type": "object",
          "description": "Mapping of voterSocketId -> targetSocketId"
        }
      },
      "required": ["roomCode", "config", "state", "players"]
    }
  }
}