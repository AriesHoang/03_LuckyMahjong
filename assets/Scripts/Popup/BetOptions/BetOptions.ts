// import { Cfg } from "../Config";
// import GameController from "../GameController";
// import PopupController from "../PopupController";
// import { SoundController } from "../SoundController";
// import SettingsController from "../SettingsController"
// import Utils from "../Utils";

import CurrencyConverter from "../../Common/CurrencyConverter";
import { AudioPlayId } from "../../Core/audio/AudioPlayId";
import { clientEvent } from "../../Core/observer/clientEvent";
import { EventName } from "../../Manager/EventName";
import RootData from "../../Manager/RootData";
import SoundController from "../../Manager/SoundController";
import BasePopup from "../../Stageloading/BasePopup";
import Utils from "../../Utils/Utils";
import {Cfg} from "../../Manager/Config";

const { ccclass, property } = cc._decorator;

export enum E_BET_OPTIONS_STATE {
    Hide,
    Moving,
    Show
}

class BetSize {
    amount: number = 0;
    id: string = '';
    node: cc.Node = null;
    constructor(amount, id, node) {
        this.amount = amount;
        this.id = id;
        this.node = node;
    }
}

class BetLevel {
    level: number = 0;
    id: string = '';
    node: cc.Node = null;
    constructor(level, id, node) {
        this.level = level;
        this.id = id;
        this.node = node;
    }
}

class BetLine {
    value: number = 0;
    id: string = '';
    node: cc.Node = null;
    constructor(value, id, node) {
        this.value = value;
        this.id = id;
        this.node = node;
    }
}

class Amount {
    value: number = 0;
    node: cc.Node = null;
    constructor(value, node) {
        this.value = value;
        this.node = node;
    }
}

@ccclass
export default class BetOptions extends BasePopup {

    @property(cc.Node)
    betSizeGroup: cc.Node = null;

    @property(cc.Node)
    betLevelGroup: cc.Node = null;

    @property(cc.Node)
    betLinesGroup: cc.Node = null;

    @property(cc.Node)
    betAmountGroup: cc.Node = null;

    @property(cc.Node)
    tmpNum: cc.Node = null;

    @property(cc.Node)
    tmpYellowNum: cc.Node = null;

    @property(cc.Node)
    dialogNode: cc.Node = null;

    @property(cc.Node)
    bgNode: cc.Node = null;

    @property(cc.Node)
    touchAreaBetSize: cc.Node = null;

    @property(cc.Node)
    touchAreaBetLevel: cc.Node = null;

    @property(cc.Node)
    touchAreaBetLine: cc.Node = null;

    @property(cc.Node)
    touchAreaBetAmount: cc.Node = null;

    @property(cc.Label)
    accountBalanceLabel: cc.Label = null;

    betSizes = [];
    betLevels = [];
    betAmounts = [];
    betLines = [];
    baseBet: number[] = [];
    baseAnteBet: number[] = [];

    lineDistance = 60;
    curBetSize = null;
    curBetLevel = null;
    curBetLine = null;
    curBetAmount = null;

    fnBetSize = null;
    fnBetLevel = null;
    fnBetLine = null;
    fnBetAmount = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.initData();
    }

    curState: E_BET_OPTIONS_STATE = E_BET_OPTIONS_STATE.Hide;
    start() {
        this.bgNode.active = false;
        this.dialogNode.opacity = 0;
        this.curState = E_BET_OPTIONS_STATE.Hide;
        this.touchAreaBetSize.on(cc.Node.EventType.TOUCH_MOVE, this.onMoveBetSize, this);
        this.touchAreaBetSize.on(cc.Node.EventType.TOUCH_CANCEL, this.onEndTouchBetSize, this);
        this.touchAreaBetSize.on(cc.Node.EventType.TOUCH_END, this.onEndTouchBetSize, this);
        this.touchAreaBetLevel.on(cc.Node.EventType.TOUCH_MOVE, this.onMoveBetLevel, this);
        this.touchAreaBetLevel.on(cc.Node.EventType.TOUCH_CANCEL, this.onEnTouchBetLevel, this);
        this.touchAreaBetLevel.on(cc.Node.EventType.TOUCH_END, this.onEnTouchBetLevel, this);
        this.touchAreaBetLine.on(cc.Node.EventType.TOUCH_MOVE, this.onMoveBetLine, this);
        this.touchAreaBetLine.on(cc.Node.EventType.TOUCH_CANCEL, this.onEndTouchBetLine, this);
        this.touchAreaBetLine.on(cc.Node.EventType.TOUCH_END, this.onEndTouchBetLine, this);
        this.touchAreaBetAmount.on(cc.Node.EventType.TOUCH_MOVE, this.onMoveBetAmount, this);
        this.touchAreaBetAmount.on(cc.Node.EventType.TOUCH_CANCEL, this.onEndTouchBetAmount, this);
        this.touchAreaBetAmount.on(cc.Node.EventType.TOUCH_END, this.onEndTouchBetAmount, this);
        this.dialogNode.y = -cc.winSize.height / 2 - this.dialogNode.height;

        // this.node.on(cc.Node.EventType.MOUSE_WHEEL, function (event) {
        //     this.scroll += event.getScrollY();
        //     var h = this.node.height;
        //     this.scroll = cc.misc.clampf(this.scroll, -2 * h, 0.7 * h);
        //     this.node.scale = 1 - this.scroll/h;
        // }, this);
        this.touchAreaBetSize.on(cc.Node.EventType.MOUSE_WHEEL, this.onMouseWheelBetSize, this);
        this.touchAreaBetLevel.on(cc.Node.EventType.MOUSE_WHEEL, this.onMouseWheelBetLevel, this);
        this.touchAreaBetLine.on(cc.Node.EventType.MOUSE_WHEEL, this.onMouseWheelBetLine, this);
        this.touchAreaBetAmount.on(cc.Node.EventType.MOUSE_WHEEL, this.onMouseWheelBetAmount, this);
    }

    onMouseWheelBetSize(event) {
        let min_dist = this.betSizes[0].node.height;
        let delta = event.getScrollY() * .5;
        delta = (delta > 0 ? Math.max(delta, min_dist) : Math.min(delta, - min_dist));
        if (delta > 0 && this.betSizes[this.betSizes.length - 1].node.y >= 0) {
            return;
        } else if (delta < 0 && this.betSizes[0].node.y <= 0) {
            return;
        }
        this.betSizes.forEach(betSize => {
            betSize.node.y += delta;
        });
        this.betSizes.forEach(betSize => {
            if (Math.abs(this.curBetSize.node.y) > Math.abs(betSize.node.y)) {
                this.curBetSize = betSize;
            }
        });
        this.moveToCurBetSize();
        this.moveCurAmountToCurBetOptions();
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxButtonTap);
    }

    onMouseWheelBetLevel(event) {
        let min_dist = this.betLevels[0].node.height;
        let delta = event.getScrollY() * .5;
        delta = (delta > 0 ? Math.max(delta, min_dist) : Math.min(delta, - min_dist));
        if (delta > 0 && this.betLevels[this.betLevels.length - 1].node.y >= 0) {
            return;
        } else if (delta < 0 && this.betLevels[0].node.y <= 0) {
            return;
        }
        //clamp delta
        if (delta > 0) {
            delta = Math.min(delta, -this.betLevels[this.betLevels.length - 1].node.y);
        }
        else {
            delta = Math.max(delta, -this.betLevels[0].node.y);
        }

        this.betLevels.forEach(betLevel => {
            betLevel.node.y += delta;
        });

        this.curBetLevel = this.betLevels[0];
        this.betLevels.forEach(betLevel => {
            if (Math.abs(this.curBetLevel.node.y) > Math.abs(betLevel.node.y)) {
                this.curBetLevel = betLevel;
            }
        });

        this.moveToCurBetLv();
        this.moveCurAmountToCurBetOptions();
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxButtonTap);
    }

    onMouseWheelBetLine(event) {
        let min_dist = this.betLines[0].node.height;
        let delta = event.getScrollY() * .5;
        delta = (delta > 0 ? Math.max(delta, min_dist) : Math.min(delta, - min_dist));
        if (delta > 0 && this.betLines[this.betLines.length - 1].node.y >= 0) {
            return;
        } else if (delta < 0 && this.betLines[0].node.y <= 0) {
            return;
        }
        //clamp delta
        if (delta > 0) {
            delta = Math.min(delta, -this.betLines[this.betLines.length - 1].node.y);
        }
        else {
            delta = Math.max(delta, -this.betLines[0].node.y);
        }

        this.betLines.forEach(betLine => {
            betLine.node.y += delta;
        });

        this.curBetLine = this.betLines[0];
        this.betLines.forEach(betLine => {
            if (Math.abs(this.curBetLine.node.y) > Math.abs(betLine.node.y)) {
                this.curBetLine = betLine;
            }
        });

        this.moveToCurBetLine();
        this.moveCurAmountToCurBetOptions();
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxButtonTap);
    }

    onMouseWheelBetAmount(event) {
        let min_dist = this.betAmounts[0].node.height;
        let delta = event.getScrollY() * .5;
        delta = (delta > 0 ? Math.max(delta, min_dist) : Math.min(delta, - min_dist));
        if (delta > 0 && this.betAmounts[this.betAmounts.length - 1].node.y >= 0) {
            return;
        } else if (delta < 0 && this.betAmounts[0].node.y <= 0) {
            return;
        }
        //clamp delta
        if (delta > 0) {
            delta = Math.min(delta, -this.betAmounts[this.betAmounts.length - 1].node.y);
        }
        else {
            delta = Math.max(delta, -this.betAmounts[0].node.y);
        }

        this.betAmounts.forEach(betAmount => {
            betAmount.node.y += delta;
        });

        this.curBetAmount = this.betAmounts[0];
        this.betAmounts.forEach(betAmount => {
            if (Math.abs(this.curBetAmount.node.y) > Math.abs(betAmount.node.y)) {
                this.curBetAmount = betAmount;
            }
        });

        this.moveToCurBetAmount();
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxButtonTap);
    }

    onMoveBetSize(event) {
        var delta = event.touch.getDelta();
        if (delta.y > 0 && this.betSizes[this.betSizes.length - 1].node.y > 0) {
            return;
        } else if (delta.y < 0 && this.betSizes[0].node.y < 0) {
            return;
        }
        this.betSizes.forEach(betSize => {
            betSize.node.y += delta.y;
        });
    }

    onEndTouchBetSize(event) {
        this.curBetSize = this.betSizes[0];
        if (event.touch.getLocationX() == event.touch.getStartLocation().x
            && event.touch.getLocationY() == event.touch.getStartLocation().y) {
            let touchLocationY = event.touch.getLocationY();
            this.betSizes.forEach(betSize => {
                let yPos = betSize.node.convertToWorldSpaceAR(cc.v2(0, 0)).y;
                if (Math.abs(yPos - touchLocationY) <= betSize.node.height / 2) {
                    this.curBetSize = betSize;
                    this.moveToCurBetSize();
                    this.moveCurAmountToCurBetOptions();
                }
            });
        } else {
            this.betSizes.forEach(betSize => {
                if (Math.abs(this.curBetSize.node.y) > Math.abs(betSize.node.y)) {
                    this.curBetSize = betSize;
                }
            });
            this.moveToCurBetSize();
            this.moveCurAmountToCurBetOptions();
        }
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxButtonTap);
    }

    onMoveBetLevel(event) {
        var delta = event.touch.getDelta();
        if (delta.y > 0 && this.betLevels[this.betLevels.length - 1].node.y > 0) {
            return;
        } else if (delta.y < 0 && this.betLevels[0].node.y < 0) {
            return;
        }
        this.betLevels.forEach(betLevel => {
            betLevel.node.y += delta.y;
        });
    }

    onEnTouchBetLevel(event) {
        if (event.touch.getLocationX() == event.touch.getStartLocation().x
            && event.touch.getLocationY() == event.touch.getStartLocation().y) {
            let touchLocationY = event.touch.getLocationY();
            this.betLevels.forEach(betLevel => {
                let yPos = betLevel.node.convertToWorldSpaceAR(cc.v2(0, 0)).y;
                if (Math.abs(yPos - touchLocationY) <= betLevel.node.height / 2) {
                    this.curBetLevel = betLevel;
                    this.moveToCurBetLv();
                    this.moveCurAmountToCurBetOptions();
                }
            });
        } else {
            this.curBetLevel = this.betLevels[0];
            this.betLevels.forEach(betLevel => {
                if (Math.abs(this.curBetLevel.node.y) > Math.abs(betLevel.node.y)) {
                    this.curBetLevel = betLevel;
                }
            });

            this.moveToCurBetLv();
            this.moveCurAmountToCurBetOptions();
        }
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxButtonTap);
    }

    onMoveBetLine(event) {
        var delta = event.touch.getDelta();
        if (delta.y > 0 && this.betLines[this.betLines.length - 1].node.y > 0) {
            return;
        } else if (delta.y < 0 && this.betLines[0].node.y < 0) {
            return;
        }
        this.betLines.forEach(betLine => {
            betLine.node.y += delta.y;
        });
    }

    onEndTouchBetLine(event) {
        if (event.touch.getLocationX() == event.touch.getStartLocation().x
            && event.touch.getLocationY() == event.touch.getStartLocation().y) {
            let touchLocationY = event.touch.getLocationY();
            this.betLines.forEach(betLine => {
                let yPos = betLine.node.convertToWorldSpaceAR(cc.v2(0, 0)).y;
                if (Math.abs(yPos - touchLocationY) <= betLine.node.height / 2) {
                    this.curBetLine = betLine;
                    this.moveToCurBetLine();
                    this.moveCurAmountToCurBetOptions();
                }
            });
        } else {
            this.curBetLine = this.betLines[0];
            this.betLines.forEach(betLine => {
                if (Math.abs(this.curBetLine.node.y) > Math.abs(betLine.node.y)) {
                    this.curBetLine = betLine;
                }
            });

            this.moveToCurBetLine();
            this.moveCurAmountToCurBetOptions();
        }
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxButtonTap);
    }

    onMoveBetAmount(event) {
        var delta = event.touch.getDelta();
        if (delta.y > 0 && this.betAmounts[this.betAmounts.length - 1].node.y > 0) {
            return;
        } else if (delta.y < 0 && this.betAmounts[0].node.y < 0) {
            return;
        }
        this.betAmounts.forEach(betAmount => {
            betAmount.node.y += delta.y;
        });
    }

    onEndTouchBetAmount(event) {
        if (event.touch.getLocationX() == event.touch.getStartLocation().x
            && event.touch.getLocationY() == event.touch.getStartLocation().y) {
            let touchLocationY = event.touch.getLocationY();
            this.betAmounts.forEach(betAmount => {
                let yPos = betAmount.node.convertToWorldSpaceAR(cc.v2(0, 0)).y;
                if (Math.abs(yPos - touchLocationY) <= betAmount.node.height / 2) {
                    this.curBetAmount = betAmount;
                    this.moveToCurBetAmount();
                }
            });
        } else {
            this.curBetAmount = this.betAmounts[0];
            this.betAmounts.forEach(betAmount => {
                if (Math.abs(this.curBetAmount.node.y) > Math.abs(betAmount.node.y)) {
                    this.curBetAmount = betAmount;
                }
            });

            this.moveToCurBetAmount();
        }
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxButtonTap);
    };

    moveToCurBetSize() {
        let distance = - this.curBetSize.node.y;
        this.betSizes.forEach(betSize => {
            cc.tween(betSize.node)
                .by(.1, { y: distance }).start();
        });
    };

    moveToCurBetLv() {
        let distance = - this.curBetLevel.node.y;
        this.betLevels.forEach(betLevel => {
            cc.tween(betLevel.node)
                .by(.1, { y: distance }).start();
        });
    }

    moveToCurBetLine() {
        let distance = - this.curBetLine.node.y;
        this.betLines.forEach(betLine => {
            cc.tween(betLine.node)
                .by(.1, { y: distance }).start();
        });
    }

    moveToCurBetAmount() {
        //update bet options to new bet amount
        this.updateBetLvAndSize(this.curBetAmount);

        if (this.curBetAmount) {
            let distance = - this.curBetAmount.node.y;
            this.betAmounts.forEach(Amount => {
                cc.tween(Amount.node)
                    .by(.2, { y: distance }).start();
            });
        };
    }

    moveCurAmountToCurBetOptions() {
        let curAmount = this.curBetSize.amount * this.curBetLevel.level * this.curBetLine.value;
        curAmount = parseFloat(curAmount.toFixed(Cfg.decimalDigits));
        this.curBetAmount = null;
        this.betAmounts.forEach(Amount => {
            if (Amount.value == curAmount) {
                this.curBetAmount = Amount;
            }
        });
        if (this.curBetAmount) {
            let distance = - this.curBetAmount.node.y;
            this.betAmounts.forEach(Amount => {
                cc.tween(Amount.node)
                    .by(.2, { y: distance }).start();
            });
        };
    };

    show() {
        if (this.curState == E_BET_OPTIONS_STATE.Moving) return;
        this.initData();    //need this for updating base bet & bet options according to ante bet
        this.fnBetSize = this.curBetSize = this.betSizes[RootData.instance.gamePlayData.betSize];
        this.fnBetLevel = this.curBetLevel = this.betLevels[RootData.instance.gamePlayData.betLevel];
        this.fnBetLine = this.curBetLine = this.betLines[RootData.instance.gamePlayData.baseBetLevel];

        this.moveCurAmountToCurBetOptions();
        this.moveToCurBetLine();
        this.moveToCurBetLv();
        this.moveToCurBetSize();
        this.fnBetAmount = this.curBetAmount;
        this.updateLabelInUI();

        this.curState = E_BET_OPTIONS_STATE.Moving;
        this.bgNode.active = true;
        this.bgNode.opacity = 0;
        cc.tween(this.bgNode)
            .to(.5, { opacity: 120 })
            .start();
        this.dialogNode.y = -this.node.height / 2 - this.dialogNode.height;
        this.dialogNode.opacity = 255;
        cc.tween(this.dialogNode)
            .to(.5, { y: -this.node.height / 2 + this.dialogNode.height / 2 }, { easing: 'cubicIn' })
            .call(() => {
                this.curState = E_BET_OPTIONS_STATE.Show;
            })
            .start();

        this.accountBalanceLabel.string = Utils.MixCurrecyStr(RootData.instance.playerData.balance);

    };

    hide() {
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxClose);
        if (this.curState == E_BET_OPTIONS_STATE.Moving) return;
        this.curState = E_BET_OPTIONS_STATE.Moving;
        cc.tween(this.bgNode)
            .to(.5, { opacity: 0 })
            .call(() => { this.bgNode.active = false; })
            .start();
        this.dialogNode.y = -this.node.height / 2 + this.dialogNode.height / 2;
        cc.tween(this.dialogNode)
            .to(.5, { y: -this.node.height / 2 - this.dialogNode.height }, { easing: 'cubicOut' })
            .call(() => {
                this.curState = E_BET_OPTIONS_STATE.Hide;
                this.dialogNode.opacity = 0;
            })
            .start();
    };

    initData() {
        let data = RootData.instance.gamePlayData.configData;

        this.betSizes.forEach((betSize) => {
            betSize.node.removeFromParent();
        });
        this.betSizes = [];
        data.betSizes.forEach((betSizeInfo, index) => {
            let betSizeNode = cc.instantiate(this.tmpNum);
            betSizeNode.parent = this.betSizeGroup;
            betSizeNode.setPosition(0, -60 * index);
            betSizeNode.getComponent(cc.Label).string = Utils.getCurrencyStr() + CurrencyConverter.getCreditString(betSizeInfo.value);
            let betSize = new BetSize(betSizeInfo.value, betSizeInfo.id, betSizeNode);
            this.betSizes.push(betSize);
        });
        this.fnBetSize = this.curBetSize = this.betSizes[RootData.instance.gamePlayData.betSize];

        this.betLevels.forEach((betLevel) => {
            betLevel.node.removeFromParent();
        });
        this.betLevels = [];
        data.betLevels.forEach((betLevelInfo, index) => {
            let betLevelNode = cc.instantiate(this.tmpNum);
            betLevelNode.parent = this.betLevelGroup;
            betLevelNode.setPosition(0, -60 * index);
            betLevelNode.getComponent(cc.Label).string = CurrencyConverter.getCreditString(betLevelInfo.value);
            let betLevel = new BetLevel(betLevelInfo.value, betLevelInfo.id, betLevelNode);
            this.betLevels.push(betLevel);
        });
        this.fnBetLevel = this.curBetLevel = this.betLevels[RootData.instance.gamePlayData.betLevel];

        this.betLines.forEach((betLine) => {
            betLine.node.removeFromParent();
        });
        this.betLines = [];
        let betLinesData: number[] = [];
        betLinesData.push(RootData.instance.gamePlayData.getBaseBetOptions());
        betLinesData.forEach((betLineInfo, index) => {
            let betLineNode = cc.instantiate(this.tmpNum);
            betLineNode.parent = this.betLinesGroup;
            betLineNode.setPosition(0, -60 * index);
            betLineNode.getComponent(cc.Label).string = CurrencyConverter.getCreditString(betLineInfo);
            let betLine = new BetLine(betLineInfo, index, betLineNode);
            this.betLines.push(betLine);
        });
        this.fnBetLine = this.curBetLine = this.betLines[RootData.instance.gamePlayData.getCurBaseBetLevel()];

        let amounts = [];
        this.betSizes.forEach(betSize => {
            this.betLevels.forEach(betLevel => {
                this.betLines.forEach(betLine => {
                    let bet_amount = betLevel.level * betSize.amount * betLine.value;
                    bet_amount = parseFloat(bet_amount.toFixed(Cfg.decimalDigits));
                    amounts.push(bet_amount);
                });
            });
        });

        amounts = amounts.filter(function (item, pos, self) {
            return self.indexOf(item) == pos;
        });
        amounts.sort((lhs, rhs) => {
            return lhs - rhs;
        });

        this.betAmounts.forEach((betAmount) => {
            betAmount.node.removeFromParent();
        });
        this.betAmounts = [];
        amounts.forEach((amountInfo, index) => {
            let amountNode = cc.instantiate(this.tmpYellowNum);
            amountNode.parent = this.betAmountGroup;
            amountNode.setPosition(0, -60 * index);
            amountNode.getComponent(cc.Label).string = Utils.getCurrencyStr() + CurrencyConverter.getCreditString(amountInfo);
            let amount = new Amount(amountInfo, amountNode);
            this.betAmounts.push(amount);
        });
        this.moveCurAmountToCurBetOptions();
        this.moveToCurBetLine();
        this.moveToCurBetLv();
        this.moveToCurBetSize();
        this.fnBetAmount = this.curBetAmount;
        this.updateLabelInUI();
    }

    maxBetOnclick() {
        this.curBetSize = this.betSizes[this.betSizes.length - 1];
        let distance = - this.curBetSize.node.y;
        this.betSizes.forEach(betSize => {
            cc.tween(betSize.node)
                .by(.2, { y: distance }).start();
        });

        this.curBetLevel = this.betLevels[this.betLevels.length - 1];
        distance = - this.curBetLevel.node.y;
        this.betLevels.forEach(betLevel => {
            cc.tween(betLevel.node)
                .by(.2, { y: distance }).start();
        });

        this.curBetLine = this.betLines[this.betLines.length - 1];
        distance = - this.curBetLine.node.y;
        this.betLines.forEach(betLine => {
            cc.tween(betLine.node)
                .by(.2, { y: distance }).start();
        });

        this.curBetAmount = this.betAmounts[this.betAmounts.length - 1];
        distance = - this.betAmounts[this.betAmounts.length - 1].node.y;
        this.betAmounts.forEach(betAmount => {
            cc.tween(betAmount.node)
                .by(.2, { y: distance }).start();
        });
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxButtonTap);
    }

    confirmOnClick() {
        this.fnBetLevel = this.curBetLevel;
        this.fnBetSize = this.curBetSize;
        this.fnBetLine = this.curBetLine;
        this.fnBetAmount = this.curBetAmount;
        this.updateLabelInUI();
        this.hide();

        //update game bet settings
        //find bet level index
        RootData.instance.gamePlayData.updateBetLevel(this.betLevels.indexOf(this.fnBetLevel));
        RootData.instance.gamePlayData.updateBetSize(this.betSizes.indexOf(this.fnBetSize));
        RootData.instance.gamePlayData.updateBaseBetLevel(this.betLines.indexOf(this.fnBetLine));
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxButtonTap);
    }

    increaseOnClick() {
        if (this.isMaxBet()) return;
        let betAmountIndex = this.findCurIndexBetAmount() + 1;
        this.updateBetLvAndSize(this.betAmounts[betAmountIndex]);
    }

    decreaseOnClick() {
        if (this.isMinBet()) return;
        let betAmountIndex = this.findCurIndexBetAmount() - 1;
        this.updateBetLvAndSize(this.betAmounts[betAmountIndex]);
    }

    isMaxBet() {
        return this.curBetAmount.value == this.betAmounts[this.betAmounts.length - 1].value;
    }

    isMinBet() {
        return this.curBetAmount.value == this.betAmounts[0].value;
    }

    findCurIndexBetAmount() {
        let indexCur = -1;
        this.betAmounts.forEach((betAmount, index) => {
            if (betAmount.value == this.curBetAmount.value) {
                indexCur = index;
            }
        });
        return indexCur;
    }

    updateBetLvAndSize(betAmount: Amount) {
        this.betSizes.forEach((betSize, indexBetSize) => {
            this.betLevels.forEach((betLevel, indexBetLv) => {
                this.betLines.forEach((betLine, indexBetLine) => {
                    if (parseFloat((betSize.amount * betLevel.level * betLine.value).toFixed(Cfg.decimalDigits)) == betAmount.value) {
                        this.curBetSize = betSize;
                        this.curBetLevel = betLevel;
                        this.curBetLine = betLine;
                        this.fnBetLevel = this.curBetLevel;
                        this.fnBetSize = this.curBetSize;
                        this.fnBetLine = this.curBetLine;
                        this.moveToCurBetLv();
                        this.moveToCurBetSize();
                        this.moveToCurBetLine();
                        this.moveCurAmountToCurBetOptions();
                        this.fnBetAmount = this.curBetAmount;
                        this.updateLabelInUI();
                    }
                });
            });
        });
    }

    updateLabelInUI() {

    }
    update(dt) {
        let a = 1;
    }
}
