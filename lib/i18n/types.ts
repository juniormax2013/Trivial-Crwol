export type Language = 'ht' | 'es' | 'fr';

export interface Translations {
  // ---------- AUTH ----------
  auth: {
    tagline: string;
    email: string;
    password: string;
    forgotPassword: string;
    signIn: string;
    signingIn: string;
    orContinueWith: string;
    noAccount: string;
    register: string;
    errors: {
      invalidCredential: string;
      tooManyRequests: string;
      generic: string;
      emailInUse: string;
      invalidEmail: string;
      weakPassword: string;
      googleFailed: string;
      registerGeneric: string;
      userNotFound: string;
      resetFailed: string;
    };
    // Login
    selectLanguage: string;
    // Forgot Password
    forgotPasswordTitle: string;
    forgotPasswordSubtitle: string;
    emailSentTitle: string;
    emailSentDesc: string;
    retryEmail: string;
    forgotPasswordButton: string;
    forgotPasswordEmailLabel: string;
    // Register
    backToLogin: string;
    startJourney: string;
    joinCommunity: string;
    firstName: string;
    lastName: string;
    username: string;
    usernameHint: string;
    continue: string;
    confirmPassword: string;
    repeatPassword: string;
    termsAccept: string;
    termsLink: string;
    back: string;
    createAccount: string;
    step: string;
    of: string;
    placeholders: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      username: string;
    };
    openingPaths: string;
    signOut: string;
  };

  // ---------- NAV ----------
  nav: {
    home: string;
    play: string;
    ranking: string;
    alerts: string;
    profile: string;
    social: string;
    aliados: string;
  };

  // ---------- DASHBOARD ----------
  dashboard: {
    welcomeBack: string;
    hello: string;
    days: string;
    recommended: string;
    ascensionTitle: string;
    ascensionSubtitle: string;
    playNow: string;
    dailyChallenge: string;
    dailyXp: string;
    duels: string;
    answerChallenges: string;
    verseOfDay: string;
    categories: string;
    seeAll: string;
    parables: string;
    prophets: string;
    miracles: string;
    letters: string;
    learnSomethingNew: string;
    verseExplanation: string;
    verseSaved: string;
    verseShared: string;
    opinions: string;
    news: string;
    weeklySummary: string;
    activityStats: string;
    friendActivity: string;
    storePromotion: string;
    viewStore: string;
    save: string;
    share: string;
    explanation: string;
    energy: string;
    bibleGame: string;
    duel1vs1: string;
    bestPlayers: string;
    store: string;
    verseExplanationText: string;
    verseExplanationText2: string;
    dailyCounsel: string;
    writtenBy: string;
    relatedVerses: string;
    opinionsOnVerse: string;
    gospelNews: string;
    yourWeek: string;
    activityLevel: string;
    wins: string;
    points: string;
    consecutiveDays: string;
    giftShop: string;
    giftShopDesc: string;
    goToShop: string;
    matches: string;
    lossesLabel: string;
    lastResult: string;
    noDuels: string;
    noFriendActivity: string;
    addFriends: string;
    liveTournament: string;
    activeTournaments: string;
    participants: string;
    understandWord: string;
    me: string;
    friendsTab: string;
  };

  // ---------- HOME SLIDESHOW ----------
  home: {
    greeting: string;
    slides: {
      title1: string;
      sub1: string;
      title2: string;
      sub2: string;
      title3: string;
      sub3: string;
      title4: string;
      sub4: string;
    };
  };

  // ---------- PLAY ----------
  play: {
    title: string;
    subtitle: string;
    dailyChallenge: string;
    dailyChallengeDesc: string;
    duel: string;
    duelDesc: string;
    tournament: string;
    tournamentDesc: string;
    comingSoon: string;
  };

  // ---------- DAILY CHALLENGE ----------
  daily: {
    title: string;
    subtitle: string;
    complete: string;
    alreadyDone: string;
    alreadyDoneDesc: string;
    startChallenge: string;
    question: string;
    of: string;
    timeLeft: string;
    correct: string;
    wrong: string;
    explanation: string;
    reference: string;
    next: string;
    finish: string;
    // Result
    resultTitle: string;
    resultSubtitle: string;
    score: string;
    accuracy: string;
    xpEarned: string;
    bestStreak: string;
    reviewAnswers: string;
    backHome: string;
    yourAnswer: string;
    correctAnswer: string;
    timeTaken: string;
    // Rules
    rulesTitle: string;
    rule1: string;
    rule2: string;
    rule3: string;
    rule4: string;
    // Streak
    streakMsg: string;
    streakContinue: string;
    // Motivational
    motivPerfect: string;
    motivGreat: string;
    motivGood: string;
    motivOk: string;
    motivLow: string;
    // Difficulty labels
    diffEasy: string;
    diffMedium: string;
    diffHard: string;
  };

  // ---------- DUELS ----------
  duel: {
    title: string;
    newDuel: string;
    pending: string;
    active: string;
    completed: string;
    noDuels: string;
    noDuelsDesc: string;
    challengeFriend: string;
    vs: string;
    round: string;
    of: string;
    waitingOpponent: string;
    yourTurn: string;
    opponentTurn: string;
    category: string;
    difficulty: string;
    rounds: string;
    startDuel: string;
    selectCategory: string;
    selectDifficulty: string;
    selectRounds: string;
    easy: string;
    medium: string;
    hard: string;
    mixed: string;
    // Status labels
    waitingResponse: string;
    challengeReceived: string;
    expired: string;
    declined: string;
    cancelled: string;
    unknown: string;
    victory: string;
    defeat: string;
    draw: string;
    // Result
    youWon: string;
    youLost: string;
    tie: string;
    finalScore: string;
    rematch: string;
    backToDuels: string;
    duelComplete: string;
    yourScore: string;
    opponentScore: string;
    reward: string;
    // Play screen
    roundComplete: string;
    tiebreakerPlayed: string;
    waitingRival: string;
    waitingRivalTiebreaker: string;
    errorLoadingRound: string;
    backToArena: string;
    suddenDeath: string;
    startRound: string;
    playTiebreaker: string;
    tieAlert: string;
    seg: string;
    chooseRivals: string;
    configureDuel: string;
    selectUpTo4: string;
    invitedRivals: string;
    categories: string;
    random: string;
    randomDesc: string;
    selectAtLeast1: string;
    questions: string;
    secondsPerQuestion: string;
    victoryRewards: string;
    sendingChallenge: string;
    sendChallenge: string;
    continueWithCount: string;
    step: string;
    ofText: string;
    turnOf: string;
    waitingGuests: string;
    waitingCreator: string;
    waitingTurn: string;
    invitedYou: string;
    multiplayerDuel: string;
    playerStatus: string;
    acceptedStatus: string;
    declinedStatus: string;
    pendingStatus: string;
    startNow: string;
    canStartWhenAccepted: string;
    sameTimePlayDesc: string;
    finalOutcome: string;
    tieOutcomeBanner: string;
    xpEarnedLabel: string;
    duelNotFound: string;
    duelExpired: string;
    duelDeclined: string;
    duelCancelled: string;
    expiredDesc: string;
    declinedDesc: string;
    cancelledDesc: string;
    newChallenge: string;
    suddenDeathLabel: string;
    tiebreakerOneQuestion: string;
    tiebreakerLabel: string;
    playNow: string;
    playTiebreakerBtn: string;
    wonStatus: string;
    lostStatus: string;
    tieStatus: string;
    inProgress: string;
    groupDuel: string;
    soloDuel: string;
    andOthers: string;
    toastAcceptSuccess: string;
    toastAcceptError: string;
    toastDeclineSuccess: string;
    toastDeclineError: string;
    declineLabel: string;
    decliningLabel: string;
    acceptLabel: string;
    acceptingLabel: string;
    viewResults: string;
    viewDuel: string;
    viewLabel: string;
    playLabel: string;
    youLabel: string;
    victoryTitle: string;
    victorySubtitle: string;
    tieTitle: string;
    tieSubtitle: string;
    defeatTitle: string;
    defeatSubtitle: string;
    correctAnswersCount: string;
    vsRivalCount: string;
    timeAgoNow: string;
    timeAgoMin: string;
    timeAgoHour: string;
    timeAgoDay: string;
    timeAgoDays: string;
    timeUntilExpired: string;
    timeUntilDays: string;
    timeUntilDaysPlural: string;
    timeUntilHourMin: string;
    timeUntilMin: string;
  };

  // ---------- RANKING ----------
  ranking: {
    title: string;
    global: string;
    weekly: string;
    friends: string;
    yourRank: string;
    level: string;
    xp: string;
    noPlayers: string;
  };

  // ---------- PROFILE ----------
  profile: {
    title: string;
    editProfile: string;
    level: string;
    xp: string;
    crowns: string;
    streak: string;
    totalDuels: string;
    wins: string;
    losses: string;
    accuracy: string;
    joinedOn: string;
    save: string;
    saving: string;
    displayName: string;
    bio: string;
    country: string;
    achievements: string;
    stats: string;
    proverbsLore: string;
    psalmsWarrior: string;
    duelMaster: string;
    disciplePath: string;
    activeSeason: string;
    premiumRoute: string;
    solomonWisdom: string;
    viewProgress: string;
    openPass: string;
    deepInspiration: string;
    placeholders: {
      bio: string;
      verse: string;
      minChars: string;
      currentPassword: string;
    };
    category: string;
    language: string;
  };

  // ---------- SETTINGS ----------
  settings: {
    title: string;
    general: string;
    language: string;
    notifications: string;
    experience: string;
    sound: string;
    vibration: string;
    security: string;
    changePassword: string;
    privacyData: string;
    deleteAccount: string;
    version: string;
    // Language picker
    chooseLanguage: string;
    languages: {
      ht: string;
      es: string;
      fr: string;
    };
  };

  // ---------- COMMON ----------
  common: {
    loading: string;
    error: string;
    retry: string;
    cancel: string;
    confirm: string;
    save: string;
    close: string;
    back: string;
    next: string;
    finish: string;
    yes: string;
    no: string;
    search: string;
    noResults: string;
    comingSoon: string;
    copyLink: string;
    share: string;
    play: string;
    seeAll: string;
    seeMore: string;
    today: string;
    readMore: string;
    buy: string;
    syncing: string;
    opponent: string;
    somethingWentWrong: string;
    goBack: string;
    saving: string;
  };

  // ---------- ARENA ----------
  arena: {
    featured: string;
    joinArena: string;
    duelsSubtitle: string;
    duelInbox: string;
    duelArena: string;
    pendingDuels: string;
    findOpponents: string;
    yourTurn: string;
    winReward: string;
    tournaments: string;
    tournamentsSubtitle: string;
    participants: string;
    noTournaments: string;
    enter: string;
    endsIn: string;
    pentecostTournament: string;
    // Tournament Hub page
    arenaChampions: string;
    arenaChampionsDesc: string;
    activeAndOpen: string;
    completed: string;
    searchTournamentPlaceholder: string;
    noTournamentsCompleted: string;
    comeBackSoon: string;
    live: string;
    coronas: string;
    streakBonus: string;
    playersRange: string;
    enterNow: string;
    marathonDesc: string;
    available: string;
    bibleGameDesc: string;
    heartsLabel: string;
    pendingOne: string;
    pendingMultiple: string;
  };

  // ---------- SOCIAL ----------
  social: {
    title: string;
    searchUsers: string;
    friends: string;
    requests: string;
    duels: string;
    rank: string;
    onlineFriends: string;
    yourBrothers: string;
    noFriends: string;
    results: string;
    noResults: string;
    add: string;
    receivedRequests: string;
    wantsToBeFriend: string;
    accept: string;
    reject: string;
    historyAndChallenges: string;
    noDuels: string;
    duelVs: string;
    status: string;
    victory: string;
    defeat: string;
    tie: string;
    view: string;
    qrModalTitle: string;
    qrModalDesc: string;
    copyId: string;
    copied: string;
    scanTitle: string;
    searchingPilgrim: string;
    noUserFound: string;
    errorSearching: string;
  };

  // ---------- BATTLE PASS ----------
  pass: {
    title: string;
    premiumPass: string;
    daysLeft: string;
    currentTier: string;
    forTier: string;
    seasonInspiration: string;
    rewards: string;
    missions: string;
    noReward: string;
    free: string;
    premium: string;
    claim: string;
    activeMissions: string;
    available: string;
    daily: string;
    weekly: string;
    season: string;
    comingSoon: string;
    seasonEnded: string;
  };

  // ---------- CROWN ARENA ----------
  crownArena: {
    title: string;
    subtitle: string;
    createRoom: string;
    joinRoom: string;
    mode: string;
    friends: string;
    random: string;
    players: string;
    maxPlayers: string;
    category: string;
    difficultyProgressive: string;
    searchingPlayers: string;
    ready: string;
    waitingPlayers: string;
    starting: string;
    seconds: string;
    scoring: string;
    streakBonus: string;
    podium: string;
    rewards: string;
    winner: string;
    secondPlace: string;
    thirdPlace: string;
    disclaimer: string;
    startNow: string;
    inviteFriends: string;
    roomFull: string;
    alreadyInRoom: string;
    roomNotFound: string;
    errorCreatingRoom: string;
    modifyCategories: string;
    selectedCount: string;
    startMatchError: string;
    linkCopied: string;
    controlRoom: string;
    warRoom: string;
    warriorList: string;
    host: string;
    warrior: string;
    minPlayersWarning: string;
    waitingHostStart: string;
    beReady: string;
    competitors: string;
    questionOf: string;
    ohNo: string;
    resultShared: string;
    xpEarned: string;
    crowns: string;
    yourPosition: string;
    totalPoints: string;
    details: string;
    leaderboard: string;
    finished: string;
    inProgress: string;
    rematch: string;
    finishMatch: string;
    autoInvite: string;
    autoInviteDesc: string;
    selectSpecificFriends: string;
    invitationTitle: string;
    invitationSubtitle: string;
    acceptInvitation: string;
    declineInvitation: string;
    invitationsSent: string;
    startMatchSuccess: string;
    wellDone: string;
    waitingOthers: string;
  };
  // ---------- POWERS ----------
  powers: {
    availableTitle: string;
    removeTwo: string;
    fiftyFifty: string;
    hint: string;
    freeze: string;
    secondChance: string;
    description: {
      removeTwo: string;
      hint: string;
      freeze: string;
      secondChance: string;
    };
  };

  // ---------- ALLIES ----------
  allies: {
    pageTitle: string;
    equipBtn: string;
    rarityEpic: string;
    rarityRare: string;
    allies: {
      david:   { power: string };
      ester:   { power: string };
      salomon: { power: string };
      moises:  { power: string };
    };
  };

  // ---------- STORE ----------
  store: {
    title: string;
    subtitle: string;
    energy: string;
    heart: string;
    power: string;
    kadr: string;
    avatar: string;
    tabEnergy: string;
    tabHearts: string;
    tabPowers: string;
    tabProfile: string;
    tabInventory: string;
    loading: string;
    seeAll: string;
    profileFrames: string;
    defaultFrame: string;
    equipped: string;
    equip: string;
    active: string;
    inventoryTitle: string;
    inventorySubtitle: string;
    activePowers: string;
    lookCollection: string;
    confirmTitle: string;
    confirmDesc: string;
    coinsLabel: string;
    crownsLabel: string;
    cancel: string;
    successTitle: string;
    successDesc: string;
    thanksLabel: string;
    close: string;
    buy: string;
    levelsNeeded: string;
    activePowersText: string;
    lockDetailText: string;
    activeDetailText: string;
    powerBulletTitle: string;
    alreadyEquipped: string;
    noCoins: string;
    noCrowns: string;
    purchaseError: string;
    equipSuccess: string;
    equipError: string;
    description: {
      fire: string;
      gold: string;
      crow: string;
      noDesc: string;
    };
    frameNames: {
      default: string;
      fire: string;
      gold: string;
      crow: string;
    };
    frameBullets: {
      gold1: string;
      gold2: string;
      fire1: string;
      fire2: string;
      crown1: string;
      crown2: string;
      crown3: string;
    };
    packs: {
      e1: string;
      e1Desc: string;
      e2: string;
      e2Desc: string;
      e3: string;
      e3Desc: string;
      h1: string;
      h1Desc: string;
      h2: string;
      h2Desc: string;
      h3: string;
      h3Desc: string;
      removeTwo: string;
      removeTwoDesc: string;
      hintBible: string;
      hintBibleDesc: string;
      secondChance: string;
      secondChanceDesc: string;
      freezeTime: string;
      freezeTimeDesc: string;
    };
  };
  devil: {
    appear: string;
    walk: string;
    taunt: string;
    celebrate: string;
    defeat: string;
    default: string;
    observerModeActive: string;
  };
  jesus: {
    appear: string;
    greeting: string;
    blessing: string;
    celebrating: string;
    compassion: string;
    revealing: string;
    protecting: string;
    victory: string;
    default: string;
  };
}
