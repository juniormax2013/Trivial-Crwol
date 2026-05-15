
// Simulate the duel logic with 3 players
const participants = {
    'user1': { status: 'accepted', score: 0 },
    'user2': { status: 'accepted', score: 0 },
    'user3': { status: 'pending', score: 0 }
};
const participantIds = ['user1', 'user2', 'user3'];
let currentRound = 1;
let currentTurnUid = 'user1';
let duelStatus = 'active';

function getPlayersInDuel() {
    return participantIds.filter(id => participants[id].status === 'accepted');
}

function submitAnswers(playerId, roundNum) {
    console.log(`Player ${playerId} submitting for round ${roundNum}`);
    const playersInDuel = getPlayersInDuel();
    const playersCompleted = [playerId]; // Simplified
    
    const isRoundComplete = playersInDuel.every(uid => playersCompleted.includes(uid)); // Simplified for test
    
    const currentIndex = playersInDuel.indexOf(playerId);
    if (currentIndex !== -1 && currentIndex < playersInDuel.length - 1) {
        currentTurnUid = playersInDuel[currentIndex + 1];
    } else {
        currentTurnUid = playersInDuel[0];
    }
    
    console.log(`  Next turn: ${currentTurnUid}, Round Complete: ${isRoundComplete}`);
}

// Scenario: 1 and 2 are active. 3 is pending.
console.log("Scenario 1: 1 and 2 play, then 3 joins.");
submitAnswers('user1', 1);
submitAnswers('user2', 1); 
// Round 1 marked complete (in real code)

console.log("\nNow user 3 accepts.");
participants['user3'].status = 'accepted';

const playersInDuelAfterJoin = getPlayersInDuel();
console.log("Players in duel now:", playersInDuelAfterJoin);
console.log("Current Turn:", currentTurnUid);

if (playersInDuelAfterJoin.includes(currentTurnUid)) {
    console.log("Turn is valid.");
} else {
    console.log("Turn is INVALID!");
}
