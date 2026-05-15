
// Simulating the Duel Repository logic for 3 players
const participantIds = ['userA', 'userB', 'userC'];
const participants = {
    'userA': { uid: 'userA', status: 'accepted', score: 0 },
    'userB': { uid: 'userB', status: 'pending', score: 0 },
    'userC': { uid: 'userC', status: 'pending', score: 0 }
};

let duel = {
    status: 'pending',
    currentRound: 1,
    currentTurnUid: 'userA',
    participantIds: participantIds,
    participants: participants
};

function getPlayersInDuel(duel) {
    return duel.participantIds.filter(id => 
        duel.participants[id].status === 'accepted' || 
        duel.participants[id].status === 'pending'
    );
}

function submitRoundAnswers(playerId, roundNumber) {
    console.log(`\n--- Player ${playerId} submits Round ${roundNumber} ---`);
    const playersInDuel = getPlayersInDuel(duel);
    console.log(`Players currently in duel: ${playersInDuel.join(', ')}`);
    
    // Simulate round completion check
    // In real code, it checks round.playersCompleted. 
    // Here we assume the player is finishing their turn for that round.
    
    const currentIndex = playersInDuel.indexOf(playerId);
    if (currentIndex !== -1 && currentIndex < playersInDuel.length - 1) {
        duel.currentTurnUid = playersInDuel[currentIndex + 1];
    } else {
        // Round complete or last player finished
        duel.currentTurnUid = playersInDuel[0];
        // Move to next round
        duel.currentRound++;
        console.log(`Round ${roundNumber} complete! Moving to Round ${duel.currentRound}`);
    }
    
    console.log(`Current Turn: ${duel.currentTurnUid}`);
}

// Scenario 1: Creator plays alone because others are pending
console.log("Starting Scenario 1...");
duel.status = 'active'; 
submitRoundAnswers('userA', 1);
submitRoundAnswers('userA', 2);
submitRoundAnswers('userA', 3);
console.log(`Final Duel Status: ${duel.status}, Round: ${duel.currentRound}`);

// Scenario 2: One player joins late
console.log("\nStarting Scenario 2...");
duel = {
    status: 'active',
    currentRound: 1,
    currentTurnUid: 'userA',
    participantIds: participantIds,
    participants: {
        'userA': { uid: 'userA', status: 'accepted', score: 0 },
        'userB': { uid: 'userB', status: 'pending', score: 0 },
        'userC': { uid: 'userC', status: 'pending', score: 0 }
    }
};

submitRoundAnswers('userA', 1); // A finishes Round 1. Round 2 starts. Turn = A.
console.log("User B accepts now!");
duel.participants['userB'].status = 'accepted';

submitRoundAnswers('userA', 2); // A finishes Round 2. Turn = B (because B is now accepted).
console.log("User B tries to play...");
// B is in Round 2 now because currentRound is 2.
submitRoundAnswers('userB', 2); // B finishes Round 2. Round 3 starts. Turn = A.

console.log("User C accepts now!");
duel.participants['userC'].status = 'accepted';
submitRoundAnswers('userA', 3); // A finishes Round 3. Turn = B.
submitRoundAnswers('userB', 3); // B finishes Round 3. Turn = C.
submitRoundAnswers('userC', 3); // C finishes Round 3. Round 4 starts.

console.log(`Final Duel Round: ${duel.currentRound}`);
console.log(`Participants:`, JSON.stringify(duel.participants, null, 2));
