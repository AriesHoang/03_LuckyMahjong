// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
export const GameConstant = {
	//spin config
	spinNormal: {
		startSwingTime: 0.1,
		startSwingDistance: 20,
		timeSpin: 0.85,
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
		expandMoveDuration: 0.2
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
		startAccelerate: 700,
		maxSpinSpeed: 1400,
		stopDelay: 4,	//moment stop acceleration begins
		stopAccelerate: 200,
		// startSpinToResultSpeed: 50,
		minStopSpeed: 120,
		// spinToResultDuration: 3,
		endSwingTime: 0.3,
		endSwingAngle: 2
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
