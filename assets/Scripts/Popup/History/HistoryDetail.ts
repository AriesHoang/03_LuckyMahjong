
import { AudioPlayId } from "../../Core/audio/AudioPlayId";
import { E_BOARD_MODE } from "../../Game/BoardUI";
import SoundController from "../../Manager/SoundController";
import TextController from "../../Manager/TextController";
import DialogBase, { DIALOG_STATE } from "../DialogBase";
import RoundInfo from "./RoundInfo";

export enum RoundID {
    round1,
    round2
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class HistoryDetail extends DialogBase {

    static inst: HistoryDetail = null;

    @property(RoundInfo)
    round1: RoundInfo = null;
    @property(RoundInfo)
    round2: RoundInfo = null;
    @property(cc.Node)
    nextBtn: cc.Node = null;
    @property(cc.Node)
    preBtn: cc.Node = null;
    @property(cc.Label)
    titleLB: cc.Label = null;
    private roundId: string = ''     // Round ID 
    displayRound = RoundID.round1;
    info = null;
    curRound: number = 1;
    curFree: number = 0;

    mode: E_BOARD_MODE = E_BOARD_MODE.NORMAL;
    keymode: string = "Wheel_Prize_02";
    isHaveWheel: boolean = false;
    start() {
        HistoryDetail.inst = this;
        this.dialogNode.opacity = 0;
        this.round1.node.active = false;
        this.round2.node.active = false;
    }

    isFreeSpinRecord(curRound: any) {
        let isfreeSpin = curRound.info.parentBetId && curRound.info.parentBetId == this.roundId;
        isfreeSpin = isfreeSpin && (curRound.info.parentBetId != curRound.info.id);
        return isfreeSpin;
    }

    show(info) {
        if (this.curState == DIALOG_STATE.Moving) return;
        this.info = info;
        this.curState = DIALOG_STATE.Moving;
        this.curRound = 1;
        this.round1.node.active = true
        this.round2.node.active = true;
        this.round1.node.opacity = 255;
        this.round2.node.opacity = 0;

        let mode = E_BOARD_MODE.NORMAL;
        this.isHaveWheel = false;

        this.isHaveWheel = this.info.isGetFreeSpin;
        if(this.isHaveWheel){
            mode = E_BOARD_MODE.FREESPIN;
        }
        let isBuyFreeSpin = false;
        if(this.info.betType =="BUY_FREESPIN" ){
            isBuyFreeSpin = true;
        }

        this.round1.setInfo(this.info, this.curRound, E_BOARD_MODE.NORMAL,false, isBuyFreeSpin);
        this.round1.node.x = 0;
        this.round2.node.x = 540;
        this.displayRound = RoundID.round1;
        this.titleLB.string = TextController.getRawText("NORMAL_SPIN");
        if (this.info.betType == "BUY_FREESPIN") {
            this.titleLB.string = TextController.getRawText("BUY_BONUS_FEATURE");
        }

        if (this.info.spinResult.isBuyFreeSpin) {
            this.titleLB.string = TextController.getRawText("FREE_SPINS_FEATURE");
        } else if (this.info.spinResult.isBuyGamble) {
            this.titleLB.string = TextController.getRawText("GAMBLE_FREE_SPINS");
        }
        // this.titleLB.string = this.info.spinResult.resultPlayGamble ?  TextController.getRawText("GAMBLE_FREE_SPINS") : TextController.getRawText("NORMAL_SPIN");
        this.round1.updateBoardBackground(false);
        this.round1.resetScrollView();

        this.dialogNode.x = this.node.width / 2 + this.dialogNode.width / 2;
        this.dialogNode.opacity = 255;
        cc.tween(this.dialogNode)
            .to(.5, { x: 0 }, { easing: 'cubicIn' })
            .call(() => {
                this.curState = DIALOG_STATE.Show;
            })
            .start();

        this.nextBtn.active = (this.info.spinResult.result.length > 1) || (this.info.betFreeSpins.totalFreeSpins > 0);
        this.preBtn.active = false;
        this.roundId = this.info.id;
        this.mode = mode;

    }

    hide() {
        if (this.curState == DIALOG_STATE.Moving) return;
        this.curState = DIALOG_STATE.Moving;
        this.dialogNode.x = 0;
        cc.tween(this.dialogNode)
            .to(.5, { x: this.node.width / 2 + this.dialogNode.width / 2 }, { easing: 'cubicOut' })
            .call(() => {
                this.curState = DIALOG_STATE.Hide;
                this.dialogNode.opacity = 0;
                this.round1.node.active = false;
                this.round2.node.active = false;
            })
            .start();
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxButtonTap);

    }

    next() {
        if (this.curState != DIALOG_STATE.Show) return;
        if (this.curRound >= this.info.spinResult.result.length
            && this.info.betFreeSpins.totalFreeSpins == 0) {
            return;
        }
        let curRound, nextRound;
        if (this.displayRound == RoundID.round2) {
            curRound = this.round2;
            nextRound = this.round1;
            this.displayRound = RoundID.round1;
        } else {
            curRound = this.round1;
            nextRound = this.round2;
            this.displayRound = RoundID.round2;
        }
        curRound.node.x = 0;
        nextRound.node.x = 540;

        if (this.info.betFreeSpins.totalFreeSpins == 0) {
            this.curRound += 1;
            nextRound.setInfo(this.info, this.curRound,0,this.isHaveWheel);
        } else if (this.curRound == this.info.spinResult.result.length
            && !this.isFreeSpinRecord(curRound)) {
            this.curRound = 1;
            this.curFree = 0;
            this.titleLB.string = TextController.getRawText("FREE_SPIN") + " " + (this.curFree + 1) + '/' + this.info.betFreeSpins.totalFreeSpins;
            nextRound.setInfo(this.info.betFreeSpins.freeSpinBets[this.curFree], this.curRound,0, this.isHaveWheel);
        } else if (this.curRound == curRound.info.spinResult.result.length
            && this.isFreeSpinRecord(curRound)
            && this.curFree < this.info.betFreeSpins.freeSpinBets.length - 1) {
            this.curRound = 1;
            this.curFree += 1;
            this.titleLB.string = TextController.getRawText("FREE_SPIN") + " " + (this.curFree + 1) + '/' + this.info.betFreeSpins.totalFreeSpins;
            nextRound.setInfo(this.info.betFreeSpins.freeSpinBets[this.curFree], this.curRound, 0,this.isHaveWheel);
    
        } else if (this.curRound < curRound.info.spinResult.result.length) {
            //freespin status same as previous round

            this.curRound += 1;
            nextRound.setInfo(curRound.info, this.curRound,0,this.isHaveWheel);
        }

        this.curState = DIALOG_STATE.Moving;
        cc.tween(curRound.node)
            .to(.4, { x: -540 })
            .call(() => {
                curRound.node.opacity = 0;
            })
            .start();
        nextRound.node.opacity = 255;
        cc.tween(nextRound.node)
            .to(.4, { x: 0 })
            .call(() => { this.curState = DIALOG_STATE.Show; })
            .start();

        this.nextBtn.active = (this.curRound < nextRound.info.spinResult.result.length) || (this.info.betFreeSpins.totalFreeSpins > 0 && this.curFree < this.info.betFreeSpins.totalFreeSpins - 1);
        this.preBtn.active = true;
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxButtonTap);
    }
    pre() {
        if (this.curState != DIALOG_STATE.Show) return;

        let curRound, nextRound;
        if (this.displayRound == RoundID.round2) {
            curRound = this.round2;
            nextRound = this.round1;
            if (this.curRound <= 1 && !this.isFreeSpinRecord(curRound)) return;
            this.displayRound = RoundID.round1;
        } else {
            curRound = this.round1;
            nextRound = this.round2;
            if (this.curRound <= 1 && !this.isFreeSpinRecord(curRound)) return;
            this.displayRound = RoundID.round2;
        }

        curRound.node.x = 0;
        nextRound.node.x = -540;

        if (this.curRound > 1) {
            
            this.curRound -= 1;
            nextRound.setInfo(curRound.info, this.curRound,0,this.isHaveWheel);
        } else if (this.isFreeSpinRecord(curRound)) {

            this.curFree -= 1;
            if (this.curFree >= 0) {
                this.titleLB.string = TextController.getRawText("FREE_SPIN") + " " + (this.curFree + 1) + '/' + this.info.betFreeSpins.totalFreeSpins;
                this.curRound = this.info.betFreeSpins.freeSpinBets[this.curFree].spinResult.result.length;
                nextRound.setInfo(this.info.betFreeSpins.freeSpinBets[this.curFree], this.curRound,0,this.isHaveWheel);
                // nextRound.updateBoardLayout(true);
            } else {
                this.titleLB.string = this.info.spinResult.resultPlayGamble ? TextController.getRawText("GAMBLE_FREE_SPINS") : TextController.getRawText("NORMAL_SPIN");
                //------ PLAYER INBOX ----------//
                if(this.info.betType == "PREPAID_NORMAL")
                    this.titleLB.string =  TextController.getRawText("P_INBOX_HISTORY_HEADER");
                this.curRound = this.info.spinResult.result.length;
                let isBuyFreeSpin = false;
                if(this.info.betType =="BUY_FREESPIN" ){
                    isBuyFreeSpin = true;
                    this.titleLB.string = TextController.getRawText("BUY_BONUS_FEATURE");
            
                }
                nextRound.setInfo(this.info, this.curRound,E_BOARD_MODE.NORMAL,false,isBuyFreeSpin);
            }
        }

        if (!this.isFreeSpinRecord(curRound)) {
            // nextRound.updateBoardLayout(false);
        }

        this.curState = DIALOG_STATE.Moving;
        cc.tween(curRound.node)
            .to(.4, { x: 540 })
            .call(() => {
                curRound.node.opacity = 0;
            })
            .start();
        nextRound.node.opacity = 255;
        cc.tween(nextRound.node)
            .to(.4, { x: 0 })
            .call(() => { this.curState = DIALOG_STATE.Show; })
            .start();

        this.nextBtn.active = true;
        this.preBtn.active = (this.curRound > 1) || (this.isFreeSpinRecord(curRound) && this.curFree >= 0);
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxButtonTap);
    }

}
