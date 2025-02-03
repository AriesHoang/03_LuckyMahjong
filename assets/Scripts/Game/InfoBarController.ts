import TextController from "../Manager/TextController"
import NumberLabel from "../Common/NumberLabel";
import Utils from "../Utils/Utils";
import SoundController from "../Manager/SoundController";
import { clientEvent } from "../Core/observer/clientEvent";
import { EventName } from "../Manager/EventName";
import { E_LAYOUT_MODE } from "./LayoutModeController";
import { E_BOARD_MODE } from "./BoardUI";
import { AudioPlayId } from "../Core/audio/AudioPlayId";
import CurrencyConverter from "../Common/CurrencyConverter";
import LoadMultilingualImageTextTranslator from "../Common/Multilingual/LoadMultilingualImageTextTranslator";


const { ccclass, property } = cc._decorator;

@ccclass
export default class InfoBarController extends cc.Component {
    @property(TextController)
    textController: TextController = null;

    @property(NumberLabel)
    amountLabel: NumberLabel = null;

    @property(cc.Node)
    advertiseNode: cc.Node = null;

    @property([cc.String])
    ruleNameList: string[] = [];

    @property([cc.String])
    ruleFreespinNameList: string[] = [];

    @property(cc.String)
    ruleWaitScatter: string = '';

    @property(sp.Skeleton)
    skeleton: sp.Skeleton = null;

    private ruleSprite: LoadMultilingualImageTextTranslator = null;
    private needRollingRule: boolean = false;
    private isShowRuleScheduled: boolean = false;
    private rollSpeed: number = 60;
    private isFreespin: boolean = false;
    private ruleDisplayDuration: number = 7;
    private waitToShowRulesDuration: number = 4;
    private needRollingRuleForWin: boolean = false;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.ruleSprite = this.advertiseNode?.getChildByName("container").getChildByName("rule_sprite").getComponent(LoadMultilingualImageTextTranslator);
        // this.skeleton.node.active = false;
        this.hideWinInfo();
    }

    start() {
    }
    protected onEnable(): void {
        clientEvent.on(EventName.ShowWinInfo, this.showWinInfo, this);
        clientEvent.on(EventName.HideWinInfo, this.hideWinInfo, this);
        clientEvent.on(EventName.ShowRuleInfo, this.showRule, this);
        clientEvent.on(EventName.BoardInit, this.initLayout, this);
        clientEvent.on(EventName.BoardModeChange, this.onBoardModeChange, this);
    }
    protected onDisable(): void {
        clientEvent.off(EventName.ShowWinInfo, this.showWinInfo, this);
        clientEvent.off(EventName.HideWinInfo, this.hideWinInfo, this);
        clientEvent.off(EventName.ShowRuleInfo, this.showRule, this);
        clientEvent.off(EventName.BoardInit, this.initLayout, this);
        clientEvent.off(EventName.BoardModeChange, this.onBoardModeChange, this);
    }
    initLayout(data) {
        let boardMode = data.boardMode;
        let buyFeatureOption = data.curBuyFeatureOptions;
        this.setLayoutMode(boardMode == E_BOARD_MODE.FREESPIN ? E_LAYOUT_MODE.FREESPIN : E_LAYOUT_MODE.NORMAL);
    }
    onBoardModeChange(data) {
        this.setLayoutMode(data.mode)
    }
    setLayoutMode(mode: E_LAYOUT_MODE) {
        this.hideWinInfo();
        // if (mode == E_LAYOUT_MODE.FREESPIN) {
        //     this.node.y =  246.462;
        // } else
        // this.node.y = 245 ;


    }
    update(dt) {
        if (this.advertiseNode?.active && this.needRollingRule) {
            this.ruleSprite.node.parent.x -= dt * this.rollSpeed;
            if (this.ruleSprite.node.parent.x + this.ruleSprite.node.parent.width < -this.advertiseNode.width * 0.5) {
                this.isShowRuleScheduled = false;
                this.showRule(this.isFreespin);
            }
        }
    }

     async showWinInfo(description: string, amount: number, playIncrementAnim: boolean = false,animationCanBePlayed : boolean = true) {
        if (Utils.isEmpty(amount)) {
            return;
        }
        this.amountLabel.node.active = true;
        this.needRollingRuleForWin = false;

        cc.Tween.stopAllByTarget(this.node);
        this.isShowRuleScheduled = false;    //reset
        if (this.advertiseNode) this.advertiseNode.active = false;


        if (description == "info_bar_win_02" && animationCanBePlayed){
            SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxInfobarTotalWin, false);
        }

        let strPrefix = "WIN ";
        if(description == "info_bar_win_02"){
            strPrefix = "TOTAL WIN "
        }

        if (playIncrementAnim) {
            this.amountLabel.string = "";
            this.amountLabel.playAnim(.5, 0, false, 0, amount,
                () => {
                    return SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxPointBannerIncrement);
                },
                () => {
                    SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxPointIncrementEnd)
                    // SoundController.inst.playSFXInfobarWin();
                }, strPrefix);
        } else {
            this.amountLabel.string = strPrefix + CurrencyConverter.getCreditString(amount);
        }

        if(animationCanBePlayed){
            this.skeleton.node.active = true;
            this.skeleton.setAnimation(0, "animation", false);
        }

    }

    hideWinInfo() {
        this.amountLabel.node.active = false;
    }

    async showRule(isFreespin: boolean = false, isRuleScatter: boolean = null, bScheduleShowRule: boolean = false) {
        if(this.advertiseNode.getChildByName("container").opacity === 0)
            return;
        if (!Utils.isEmpty(isRuleScatter)) {
            if (isRuleScatter)
                this.showWaitScatterText();
            else
                this.hideWaitScatterText();

            return;
        }

        //ScheduleShowRule
        if (bScheduleShowRule) {
            this.scheduleShowRule(isFreespin);
            return;
        }

        if (this.isShowRuleScheduled && this.isFreespin == isFreespin) {
            return;
        }

        this.hideWinInfo();

        this.isFreespin = isFreespin;
        cc.Tween.stopAllByTarget(this.node);
        this.isShowRuleScheduled = false;
        if (this.advertiseNode) this.advertiseNode.active = true;
        this.amountLabel.node.active = false;

        //random 
        let sp_frame_name = isFreespin ? this.ruleFreespinNameList[~~(Math.random() * this.ruleFreespinNameList.length)]
            : this.ruleNameList[~~(Math.random() * this.ruleNameList.length)];
        await this.ruleSprite.setKey(sp_frame_name);
        // this.ruleSprite.node.setContentSize(this.ruleSprite.node.children[0].getContentSize());
        this.advertiseNode.getChildByName("container").opacity = 0;


        cc.tween(this.ruleSprite)
        .delay(0.1)
        .call(() => {
            this.advertiseNode.getChildByName("container").opacity = 255;
            this.ruleSprite.node.parent.getComponent(cc.Layout).updateLayout();

            //setup position
            // const size: cc.Size = this.ruleSprite.node.active ? this.ruleSprite.node.getContentSize() : new cc.Size(0, 0);
            this.needRollingRule = true;
            this.isShowRuleScheduled = true;
            this.ruleSprite.node.parent.setAnchorPoint(0, 0.5);
            this.ruleSprite.node.parent.setPosition(this.advertiseNode.width / 2, this.ruleSprite.node.parent.y);
        })
        .start();
    }

    scheduleShowRule(isFreespin: boolean = false) {
        cc.log("scheduleShowRule!");
        if ((this.isShowRuleScheduled && this.isFreespin == isFreespin)) {
            //do not show rule when there is win/total win displayed
            return;
        } else {
            this.isFreespin = isFreespin;
            cc.Tween.stopAllByTarget(this.node);
            this.isShowRuleScheduled = true;
            cc.tween(this.node)
                .delay(this.waitToShowRulesDuration)
                .call(() => {
                    this.isShowRuleScheduled = false;
                    this.showRule(isFreespin);
                })
                .start();
        }
    }

    async showWaitScatterText() {
        if (!this.ruleWaitScatter || this.ruleWaitScatter.length == 0) return;
        cc.Tween.stopAllByTarget(this.node);
        this.isShowRuleScheduled = false;
        if (this.advertiseNode) this.advertiseNode.active = true;
        this.amountLabel.node.active = false;

        await this.ruleSprite.setKey(this.ruleWaitScatter);
        this.ruleSprite.node.active = true;

        //setup position
        const size: cc.Size = this.ruleSprite.node.getContentSize();
        if (size.width <= this.advertiseNode.width) {
            //no need to roll
            this.needRollingRule = false;
            this.ruleSprite.node.parent.setAnchorPoint(0.5, 0.5);
            this.ruleSprite.node.parent.setPosition(0, this.ruleSprite.node.parent.y);
        } else {
            this.needRollingRule = true;
            this.isShowRuleScheduled = true;
            this.ruleSprite.node.parent.setAnchorPoint(0, 0.5);
            this.ruleSprite.node.parent.setPosition(this.advertiseNode.width / 2, this.ruleSprite.node.parent.y);
        }
    }

    hideWaitScatterText() {
        this.ruleSprite.rest();
    }
}
