export const envURL = "https://sandbox-game.reelgame-api.store/api/";
// export const envURL = "https://32cf-116-110-43-37.ngrok-free.app";
export const DEBUG_ENV_LIST = ["https://api.dev.game.topasianplatform.com", "https://api.mga.game.topasianplatform.com", "https://api.dev.game.hellogames.asia"];
export const DEBUG_ENV_REGEX: RegExp = /pre-staging.*topplatform\.asia/;


export const supportedLanguage = ["en", "cs", "da", "de", "el", "es", "es_la", "fi", "fr", "hu", "it", "nl", "no", "pl", "pt", "pt_br", "ro", "sk", "sv", "tr", "uk_ua", "bg", "id", "ja", "ko", "ru", "th", "tzh", "vi", "zh"];
export enum supportedTextLanguage {
	default, bg, cs, da, de, el, es, es_la, fi, fr, hu, it, ms, nl, no, pl, pt, pt_br, ro, sk, sv, tr, uk_ua, en, id, ja, ko, ru, th, tzh, vi, zh
}

export const Cfg = {
	gameName: "Lucky Mahjong",
	itemSize: cc.v2(91, 100),
	slotSize: cc.v2(5, 5),
	slotSizeRow: [3,5,5,5,3],
	items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
	columnHeight: 500,
	wildItemID: 0,
	timeShakeItems: 1.2,
	baseBetValue: 20,

	jackpotValues: [-1, 25, 75, 250, 1000],

	scatterItemID: 10,

	redHeartItemId: 0,
	blueHeartItemId: 1,
	

	CanvasDesign: cc.v2(540, 960),
	gameCode: "lucky-mahjong",
	groupCode: null,
	brandCode: null,
	playerToken: null,
	language: "en",
	currency: "USD",
	nativeId: "abc",
	decimalDigits: 2,
	redirectURL: null,
	baseEnvURL: envURL,

	BASE_BET: 1,
	ANTE_BET: 2,
	BUY_FEATURE: 3,
	FREESPIN: 4,

	//LuckyMahjong game
	generateToken: "https://sandbox-casino.reelgame-api.store/api/Casino/GenerateDemoUrl",
	getCurrentBet: envURL + "LuckyMahjong/GetCurrentBet",
	getBalance: envURL + "Data/GetBalance",
	gameBetURL: envURL + "LuckyMahjong/Bet",
	gameSpinURL: envURL + "LuckyMahjong/Spin",
	gamePickURL: envURL + "LuckyMahjong/Pick",
	getListRecentBets: envURL + "Data/ListRecentBets",
	generateReplayId: envURL + "Data/GenerateReplay",
	getReplayBet: envURL + "LuckyMahjong/GetReplayBet",




	SCENE: {
		GAME_SCENE: 'GameScene'
	},
	isDisplayWinLine: true,
	playAsDemo: false,
	isDebug: true,
	isDafa: false,
	gameVersionStr: "V_1.0.0",
	rtpValue: 96.43,
	authPollingInterval: 30,
	lastAuthPollMoment: null,
};

export const GameCertification = {
	"show_game_name": false,							//game name 
	"show_clock": false,								//game time
	"show_net_balance": false,						//net balance
	"show_inactivity_pop_up": false,				//inactivity popup
	"show_quit_feature": true,						//quit button
	"show_sound_feature": true,					//sound button
	"show_history_feature": true,					//history button
	"show_autoplay_feature": true,					//autoplay button 
	"enable_slam_stop": true,						//stop reel
	"show_turbo_feature": true,						//turbo button
	"show_buy_feature": true,						//buy button
	"show_gamble_feature": true,					//gamble button
	"show_jackpot_feature": true,					//jackpot button
	"show_ante_bet_feature": true,					//ante bet button
	"reel_spin_timings_seconds": 2.5,				//minimum spin duration
}

export const GameConfig = {
	betLevels: 10,
	rateAnte: 1.25,
	rateBuyFeature: 100,

	spinStartMoment: 0,
	//spin config
	spinNormal: {
		startSwingTime: 0.1,
		startSwingDistance: 20,
		timeSpin: 0.7,
		timeDelayStartBetweenReels: 0.15,
		startAccelerate: 4000,
		stopAccelerate: 3000,
		timeSpinToResult: 0.4,
		stopToResultAccelerate: 3500,
		maxSpinSpeed: 3000,
		maxSpinToResultSpeed: 2000,
		minStopSpeed: 1400,
		reelSwingDistance: 10,
		minSpeedForBlur: 500,
		maxSpeedStopBlur: 1000,
		timeShakeItems: 0.7,
		expandMoveDuration: 0.2,
		spinDurationWithoutPadding: 2,
	},
	spinTurbo: {
		startSwingTime: 0.1,
		startSwingDistance: 20,
		timeSpin: 0.6,
		timeDelayStartBetweenReels: 0,
		startAccelerate: 4500,
		stopAccelerate: 3500,
		timeSpinToResult: 0.4,
		stopToResultAccelerate: 4000,
		maxSpinSpeed: 3500,
		maxSpinToResultSpeed: 2500,
		minStopSpeed: 1800,
		reelSwingDistance: 10,
		minSpeedForBlur: 500,
		maxSpeedStopBlur: 1000,
		timeShakeItems: 0.7,
		expandMoveDuration: 0.2
	},
	wheelSpin: {	//in angle
		startSwingTime: 0.1,
		startSwingAngle: 5,
		startAccelerate: 650,
		maxSpinSpeed: 1100,
		stopDelay: 1,	//moment stop acceleration begins
		stopAccelerate: 400,
		// startSpinToResultSpeed: 50,
		minStopSpeed: 120,
		// spinToResultDuration: 3,
		endSwingTime: 0.3,
		endSwingAngle: 5
	},
	newItemCascadeDuration: .25,
	reelHighlightDuration: 1,
	reelHighlightSpinToResultSpeed: 1000,
	reelHighlightSpinToResultMinSpeed: 500,

	//scene config
	SCENE: {
		GAME_SCENE: 'GameScene',
		LOADING_SCENE: 'LoadingScene'
	},
};


