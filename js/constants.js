module.exports.MAX_PLAYER = 9;

// 응답코드 (Response Code)
module.exports.rc = {
    SUCCESS: 0,
    NOT_YOUR_TURN: 1,
    NO_PERMISSION: 2,
    FULL: 3,
    ALREADY_EXISTS: 4,
    ILLEGAL_STATE: 5 // 적합하지 않은 상태
};

// 플레이어 상태 (Player Status)
module.exports.ps = {
    PLAYING: 0,
    SITTING_OUT: 1
};

// 게임 상태 (Game Status)
module.exports.gs = {
    BETTING: 0,
    PRE_FLOP: 1,
    FLOP: 2,
    TURN: 3,
    RIVER: 4,
    RESULT: 5,
    WAITING: 6
};
