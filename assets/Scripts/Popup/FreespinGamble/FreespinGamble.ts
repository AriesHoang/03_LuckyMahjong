import SoundController from "../../Manager/SoundController";
import BasePopup from "../../Stageloading/BasePopup";
import Utils from "../../Utils/Utils";
import SpinWheel from "./SpinWheel";
import { AudioPlayId } from "../../Core/audio/AudioPlayId";
import PopupController from "../../Manager/PopupController";
import { AudioPlay } from "../../Core/audio/AudioPlayer";
import { Cfg, GameConfig } from "../../Manager/Config";
import RootData from "../../Manager/RootData";
import { clientEvent } from "../../Core/observer/clientEvent";
import { EventName } from "../../Manager/EventName";
import ShakeAction from "../../Core/ShakeAction";
import ItemSpinWheel from "./ItemSpinWheel";
import MultilingualImageCustomRichTextTranslator from "../../Common/Multilingual/MultilingualImageCustomRichTextTranslator";
import TextController from "../../Manager/TextController";
import { AUTO_DISMISS_POPUP_DELAY } from "../FreespinOutro/FreespinOutro";
import GameController from "../../Game/GameController";
import StateFollowButtons from "../../Common/StateFollowButtons";

const { ccclass, property } = cc._decorator;

const MAX_ROUND_NUM: number = 3;
const ARROW_NUM: number = 1;
const ARROW_DELAY: number = 0.5;
// const WEDGE_ANGLE = [[245, 355], [5, 115], [125, 235]];
export const WEDGE_ANGLE = {
    6: { angle: 18, index: 10, value: 2 },
    7: { angle: -7.151, index: 1, value: 3 },
    8: { angle: -31.375, index: 2, value: 4 },
    9: { angle: -293.725, index: 9, value: 5 },
    10: { angle: -317.783, index: 3, value: 6 },
    6.1: { angle: -72, index: 8, value: 2 },
    7.1: { angle: 107, index: 4, value: 3 },
    8.1: { angle: -107, index: 7, value: 4 },
    9.1: { angle: 143, index: 5, value: 5 },
    10.1: { angle: -145, index: 6, value: 6 }
};
export const WEDGE_ANGLEBUY = {
    6: { angle: 18, index: 10, value: 2 },
    7: { angle: -7.151, index: 1, value: 3 },
    8: { angle: -31.375, index: 2, value: 4 },
    9: { angle: -293.725, index: 9, value: 5 },
    10: { angle: -317.783, index: 3, value: 6 },
    6.1: { angle: -72, index: 8, value: 2 },
    7.1: { angle: 107, index: 4, value: 3 },
    8.1: { angle: -107, index: 7, value: 4 },
    9.1: { angle: 143, index: 5, value: 5 },
    10.1: { angle: -145, index: 6, value: 6 }
};


type ItemWheelConfig = {
    angle?: number,
    index?: number,
    value: number
};

enum E_GAMBLE_STATE {
    IDLE,
    SHOW,
    REQUESTING
}

export enum E_GAMBLE_ACTION {
    BUY,
    PLAY,
    COLLECT
}

export enum E_WHEEL_ACTION {
    SPINAUTO,
    STOP,
}
@ccclass
export default class FreespinGamble extends BasePopup {

    @property(sp.Skeleton)
    charCat: sp.Skeleton = null;


    @property(SpinWheel)
    spinWheel: SpinWheel = null;

    @property(cc.Button)
    playButton: cc.Button = null;

    @property(cc.Button)
    collectButton: cc.Button = null;

    @property([cc.Node])
    arrayItemWheel: cc.Node[] = [];

    @property(cc.Node)
    EffectPick: cc.Node = null;


    currentItemWheelConfig: ItemWheelConfig = null;

    @property(MultilingualImageCustomRichTextTranslator)
    richTextInfoWinCustom: MultilingualImageCustomRichTextTranslator = null;

    private _onFinishCB: Function = null;
    private _state: E_GAMBLE_STATE = E_GAMBLE_STATE.IDLE;
    private _gambleResult: any = null;
    private _isBuyFeature: boolean = false;
    private wheelState: E_WHEEL_ACTION = E_WHEEL_ACTION.STOP

    public set state(v: E_GAMBLE_STATE) {
        this._state = v;
    }
    protected wheelSpinSfx: AudioPlay = null;

    private gameControllerRef = null;
    start() {

        this.gameControllerRef = cc.find("controllers/game_controller")?.getComponent(GameController);
    }
    public show(data?: any): void {
        if (!data) return;
        super.show();
        let gambleData = data.gambleData;
        this.showPromise(gambleData).then(data.funcompleted1).then(data.funcompleted2)

    }
    public showPr(data?: any): Promise<any> {
        if (!data) return;
        super.show();

        this.richTextInfoWinCustom.updateCustomRichText("");

        return this.showPromise(data);
    }

    showPromise(gambleData: any): Promise<any> {
        return new Promise((resolve: Function) => {
            cc.log("showPromise: ", gambleData);
            this.state = E_GAMBLE_STATE.SHOW;
            this.EffectPick.active = false;
            SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxGambleIntro);
            this.charCat.addAnimation(0,"idle",true);

            this._gambleResult = gambleData.spin_data;
            this._isBuyFeature = gambleData.isBuyFeature;

            let arr = WEDGE_ANGLE;

            this.richTextInfoWinCustom.node.active = false;

            this.resetWheel();

            this.node.active = true;

            this.updateResultInfo();

            cc.Tween.stopAllByTarget(this.node);
            this.node.opacity = 0;

            SoundController.inst.MainAudio.fadeOutMusic(0.1);
            SoundController.inst.MainAudio.pauseMusic();
            SoundController.inst.MainAudio.playAudio(AudioPlayId.SFXGambleFSPg);
            cc.tween(this.node)
                .call(() => {
                    SoundController.inst.MainAudio.playAudio(AudioPlayId.bgmGamble, true);
                    SoundController.inst.MainAudio.fadeInMusic(3);
                })
                .to(0.5, { opacity: 255 })
                .call(() => {
                    this.state = E_GAMBLE_STATE.IDLE;
                    // SoundController.inst.playBGMGamble();
                    // SoundController.inst.fadeInMusic(0);
                    this._onFinishCB = resolve;
                    this.onPlayBtnClicked();
                    // if(this.gameControllerRef?.isAutoSpin)
                    // {
                    //     cc.Tween.stopAllByTarget(this.node);
                    //     this.node.stopAllActions();
                    //     cc.tween(this.node)
                    //         .delay(AUTO_DISMISS_POPUP_DELAY)
                    //         .call(() => {
                    //             this.onPlayBtnClicked();
                    //         })
                    //         .start();
                    // }
                })
                .start();

            //cross fade gamble BGM
            // SoundController.inst.fadeOutMusic(0.3);
        });
    }
    spinWheelPromise(): Promise<any> {
        return new Promise((resolve: Function) => {
            // this.wheelSpinSfx = SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxGambleWheelSpin);
            this.charCat.addAnimation(0,"idle",true);
        
            return this.spinWheel.spinPromise().then(resolve.bind(this));

        });
    }
    update(dt) {
        if (this.wheelState == E_WHEEL_ACTION.SPINAUTO) {
            let _curSpeed = (GameConfig.wheelSpin.startAccelerate / 55 * dt);
            this.spinWheel.rotateBy(_curSpeed)
        }


    }

    spinWheelToResultPromise(gambleData: any): Promise<any> {
        // const result_angle_range = WEDGE_ANGLE[this._gambleResult.freeSpins / 4 - 1];
        // const result_angle = Utils.randomFromTo(result_angle_range[0], result_angle_range[1]);
        let result_angle = 0;
        let itemWheelConfig
        if (this._isBuyFeature) {
            itemWheelConfig = WEDGE_ANGLEBUY[this._gambleResult.freeSpins];
        } else {
            itemWheelConfig = WEDGE_ANGLE[this._gambleResult.freeSpins];
        }

        result_angle = itemWheelConfig.angle;
        this.currentItemWheelConfig = itemWheelConfig;

        return Promise.all([this.spinWheel.showResultPromise(result_angle, () => {
            //stop spin anim
            // this.arrowSke.addAnimation(0, "choose", true);
        })]);
        ;
    }

    onPlayBtnClicked() {
        if (this._state != E_GAMBLE_STATE.IDLE) return;

        cc.Tween.stopAllByTarget(this.node);
        this.node.stopAllActions();
        // SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxGambleSpinBtn);
        this.wheelSpinSfx = SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxGambleSpinBtn);

        let effect = this.playButton.getComponentInChildren(sp.Skeleton);
        effect.node.active = true;
        effect?.setAnimation(0, "spin", true);

        this.playButton.interactable = false;


        effect.setCompleteListener((trackEntry) => {

            if (trackEntry['animation']['name'] == "spin") {
              
                this.playButton.node.active = false;

            }
        });
        this.wheelState = E_WHEEL_ACTION.STOP;
        this.charCat.setAnimation(0,"roll",false);
        this.charCat.setCompleteListener((trackEntry) => {
            if (trackEntry['animation']['name'] == "roll") {
                this.spinWheelPromise().then(this.spinWheelToResultPromise.bind(this))
                .then(() => {
                    if (this.wheelSpinSfx != null) {
                        SoundController.inst.MainAudio.stopAudioPlay(this.wheelSpinSfx);
                        this.wheelSpinSfx = null;
                    }
                    // SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxGambleWheelSpinStop);
                    // this.collectButton.node.active = true;
                    // this.gambleChooseNode.active = true;
    
                    // this.gambleChooseNode.getComponent(sp.Skeleton)?.setAnimation(0, "choose", true);
            
                    this.arrayItemWheel.forEach((element, index) => {
                        if (index != this.currentItemWheelConfig.index - 1) {
                            element.getChildByName("black").active = true;
                        }
                    });
    
                    // this.richTextInfoWinCustom.node.active = true;
    
                    let str: string = "";
                    switch (this.currentItemWheelConfig.value) {
                        case 0:
                            str = TextController.getRawText("Wheel_Prize_02")
                            break;
                        case 1:
                            str = TextController.getRawText("Wheel_Prize_03")
                            break;
    
                        default:
                            str = TextController.getRawText("Wheel_Prize_01").split("{0} x").join(this.currentItemWheelConfig.value + "x" + "\n")
                            break;
                    }
                    // this.richTextInfoWinCustom.updateCustomRichText(str);
                    effect?.setAnimation(0, "spin_idle", true);
    
                    this.EffectPick.active = true;
                    cc.Tween.stopAllByTarget(this.node);
                    this.node.stopAllActions();

                    this.onCollectBtnClicked();
                    // cc.tween(this.node)
                    //     .delay(2)
                    //     .call(() => {
                    //         this.onCollectBtnClicked();
                    //         // SoundController.inst.playSFXStartBtn();
                    //     })
                    //     .start();
    
                    // this.gambleChooseNode.getComponent(sp.Skeleton)?.setCompleteListener((trackEntry) => {
                    //     if (trackEntry['animation']['name'] == "choose") {
                    //         this.gambleChooseNode.active = false;
                    //     }
                    // });
    
                    // this.gambleChooseNode.setParent(this.arrowSke.node);
                    // this.gambleChooseNode.setPosition(0,-200,0);
                });
            }
            
        });
        this.scheduleOnce(()=>{
          
              
           
           
        },0)

        // this.spinWheel.node.parent.runAction(ShakeAction.create(2, 0.2, 0.1));

        




        
    }
    requestCollectGamble(): Promise<any> {
        return new Promise((resolve: Function) => {
            let pars: object = {
                "gameCode": Cfg.gameCode,
                "groupCode": Cfg.groupCode,
                "brandCode": Cfg.brandCode,
                "playerToken": Cfg.playerToken,
                "betSize": RootData.instance.gamePlayData.getBetSizeValue(),
                "betLevel": RootData.instance.gamePlayData.getBetLevelValue(),
                "baseBet": RootData.instance.gamePlayData.getbaseBetLevel(),// getCurBaseBet(),
                "isBuyGamble": false,
                "miniGame": {
                    "mode": "GAMBLE",
                    "action": "COLLECT"
                },
                "isSpinWheelBonus": true
            }

            Utils.postHttp(Cfg.gameSpinURL, JSON.stringify(pars), (err, response) => {
                if (err || !response) {
                    let err_msg = Utils.getErrorMessage(err, Cfg.language);
                    clientEvent.dispatchEvent(EventName.Disconnect, { err_msg: err_msg });
                }
                resolve();
            });
        });
    }

    onCollectBtnClicked() {
        this.collectButton.interactable = false;

        let effect = this.collectButton.getComponentInChildren(sp.Skeleton);
        effect.node.active = true;
        effect?.setAnimation(0, "button_click", false);
        // SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxStartBtn);
        const result_prom = this.finishGamble();
        return Promise.all([result_prom]).then(() => {
            this.state = E_GAMBLE_STATE.IDLE;
        });
        this.requestCollectGamble().then((gambleData: any) => {

       
        });
    }


    finishGamble(gambleData: any = null) {
        // this.node.active = false;
        PopupController.instance.showPrTrainsitionEffect().then(() => {
            this.node.active = false;
            if (this._onFinishCB) {
                this._onFinishCB(gambleData);
                this._onFinishCB = null;
            }
            this.state = E_GAMBLE_STATE.SHOW;
            cc.Tween.stopAllByTarget(this.node);
            cc.tween(this.node)
                .delay(1)
                .to(0.5, { opacity: 0 })
                .call(() => {


                    this.state = E_GAMBLE_STATE.IDLE;
                })
                .start();
        })

        SoundController.inst.MainAudio.fadeOutMusic(0.5);
    }

    resetWheel() {
        this.spinWheel.node.angle = 0;
        // this.playButton.node.active = true;
        this.collectButton.node.active = false;

        this.playButton.interactable = true;
        this.collectButton.interactable = true;

        let effect = this.playButton.getComponentInChildren(sp.Skeleton);
        effect.node.active = false;
        // effect?.setAnimation(0, "Spin", false);

        this.arrayItemWheel.forEach((element, index) => {
            element.getChildByName("black").active = false;
        });
        // this.state = E_GAMBLE_STATE.IDLE;
        this.wheelState = E_WHEEL_ACTION.SPINAUTO
    }

    updateResultInfo() {
    }
}