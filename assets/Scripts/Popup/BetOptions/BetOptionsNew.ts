import CurrencyConverter from "../../Common/CurrencyConverter";
import { AudioPlayId } from "../../Core/audio/AudioPlayId";
import { clientEvent } from "../../Core/observer/clientEvent";
import PlayerData from "../../Data/PlayerData";

import GameController from "../../Game/GameController";
import { EventName } from "../../Manager/EventName";
import RootData from "../../Manager/RootData";
import SoundController from "../../Manager/SoundController";
import TextController from "../../Manager/TextController";
import BasePopup, { E_POPUP_STATE } from "../../Stageloading/BasePopup";
import Utils from "../../Utils/Utils";
import BetAmountButton from "./BetAmountButton";
import { E_BET_OPTIONS_STATE } from "./BetOptions";
import {Cfg, GameConfig} from "../../Manager/Config";

const { ccclass, property } = cc._decorator;

export interface BET_DATA {
    b_level: number,
    b_amount: number
}

@ccclass
export default class BetOptionsNew extends BasePopup {

    @property(cc.Node)
    dialogNode: cc.Node = null;

    @property(cc.Node)
    bgNode: cc.Node = null;

    @property(cc.Label)
    accountBalanceLabel: cc.Label = null;

    @property(cc.Node)
    betAmountContainer: cc.Node = null;

    @property(cc.ScrollView)
    betLayout: cc.ScrollView = null;

    @property(cc.Prefab)
    betButton: cc.Prefab = null;

    @property(cc.Label)
    betHeader: cc.Label = null;

    @property(cc.Label)
    maxBetHeader: cc.Label = null;

    betSizes: number[] = [];
    betLevels: number[] = [];
    betLines: number[] = [];
    betAmounts: BET_DATA[] = [];

    curBetSize = null;
    curBetLevel = null;
    curBetLine = null;
    curBetAmount = null;

    // fnBetSize = null;
    fnBetLevel = null;
    // fnBetLine = null;
    fnBetAmount = null;

    curState: E_BET_OPTIONS_STATE = E_BET_OPTIONS_STATE.Hide;

    selectedBetOption: cc.Node;

    constructor() {
        super();

        this.betSizes = [];
        this.betLevels = [];
        this.betLines = [];
        this.betAmounts = [];
    }
    protected onEnable(): void {
        
    }
    protected onDisable(): void {
        
    }


    initData() {

        this.fnBetLevel = this.curBetLevel = RootData.instance.gamePlayData.betLevel;
        let betAmountList = RootData.instance.gamePlayData.betAmountList;

        this.betAmounts = [];
        this.betAmountContainer.removeAllChildren();

        betAmountList.forEach((amountInfo, index) => {
            let betData = {
                b_level: index,
                b_amount: amountInfo
            }
            this.betAmounts.push(betData);
            this.addBetButton(betData);
        });

        this.fnBetAmount = this.curBetAmount;

         
        this.maxBetHeader.string = TextController.getRawText("MAX_BET");
        this.betHeader.string = TextController.getRawText("BET_OPTIONS") + " (" + Utils.getCurrencyStr().trim() + ")";

        this.setBet();
    }

    addBetButton(data: BET_DATA) {
        let bbt = cc.instantiate(this.betButton);
        bbt.on('click', this.onBetClick, this);

        bbt.getComponent(BetAmountButton).setData(data);
        const dataValue =  RootData.instance.FindComponent(PlayerData).authorizeData;
        let amount = CurrencyConverter.getCreditString(data.b_amount * (RootData.instance.gamePlayData.isAnteBet ? GameConfig.rateAnte : 1));
        bbt.getComponent(BetAmountButton).amountData = dataValue.balance.currency.symbol + " " + amount;
        this.betAmountContainer.addChild(bbt);
    }

    onBetClick(node: cc.Node) {
        this.setBetButton(node);
        this.hide();
    }

    maxBetOnclick() {
        let lastChild = this.betAmountContainer.children[this.betAmountContainer.children.length - 1];
        this.setBetButton(lastChild);
        this.scroll();
    }

    setBetButton(node: cc.Node) {
        if (this.selectedBetOption) {
            this.selectedBetOption.getComponent(BetAmountButton).isSelected = false;
        }

        let btn = node.getComponent(BetAmountButton);

        this.curBetLevel = btn.b_level;
        this.curBetAmount = btn.b_amount;


        btn.isSelected = true;
        this.selectedBetOption = btn.node;

        RootData.instance.gamePlayData.updateBetLevel(this.curBetLevel);
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxButtonTap);
    }

    setBet() {

        for (let index = 0; index < this.betAmountContainer.children.length; index++) {
            const node = this.betAmountContainer.children[index];
            let betAmount = node.getComponent(BetAmountButton);

            if (betAmount.b_level == this.curBetLevel) {
                this.setBetButton(node);
                betAmount.isDefault = true;
                break;
            }
        }
        this.scroll();

    }

    show() {
        if (this.curState == E_BET_OPTIONS_STATE.Moving) return;
        clientEvent.dispatchEvent(EventName.PopupOpenClose, E_POPUP_STATE.OPENED)
        this.initData();    //need this for updating base bet & bet options according to ante bet
        this.fnBetLevel = this.curBetLevel = RootData.instance.gamePlayData.betLevel;

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
        this.scroll();
    }

    scroll() {
        if (this.selectedBetOption) {
            this.betLayout.scrollToOffset(cc.v2(0, Math.abs(this.selectedBetOption.position.y) - 50));
        }
    }

    hide() {
        if (this.curState == E_BET_OPTIONS_STATE.Moving) return;
        this.curState = E_BET_OPTIONS_STATE.Moving;
        cc.tween(this.bgNode)
            .to(.5, { opacity: 0 })
            .call(() => { this.bgNode.active = false; clientEvent.dispatchEvent(EventName.PopupOpenClose, E_POPUP_STATE.CLOSED) })
            .start();
        this.dialogNode.y = -this.node.height / 2 + this.dialogNode.height / 2;
        cc.tween(this.dialogNode)
            .to(.5, { y: -this.node.height / 2 - this.dialogNode.height }, { easing: 'cubicOut' })
            .call(() => {
                this.curState = E_BET_OPTIONS_STATE.Hide;
                this.dialogNode.opacity = 0;
            })
            .start();
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxButtonTap);
        clientEvent.dispatchEvent(EventName.PopupOpenClose, E_POPUP_STATE.CLOSED);
        this.betLayout.stopAutoScroll();
    };
}