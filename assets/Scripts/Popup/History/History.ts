
import CustomeDate from "./CustomeDate";
import HistoryRecord from "./HistoryRecord";
import HistoryDetail from "./HistoryDetail"

import BasePopup, { E_POPUP_STATE } from "../../Stageloading/BasePopup";
import TextController from "../../Manager/TextController";
import Utils from "../../Utils/Utils";
import SoundController from "../../Manager/SoundController";
import { AudioPlayId } from "../../Core/audio/AudioPlayId";
import { Cfg } from "../../Manager/Config";
import CurrencyConverter from "../../Common/CurrencyConverter";
import { clientEvent } from "../../Core/observer/clientEvent";
import { EventName } from "../../Manager/EventName";

const { ccclass, property } = cc._decorator;

export enum E_HISTORY_STATE {
    Hide,
    Moving,
    Show
}

@ccclass
export default class History extends BasePopup {

    static inst: History = null;

    curState: E_HISTORY_STATE = E_HISTORY_STATE.Hide;

    @property(cc.Node)
    dialogNode: cc.Node = null;

    @property(cc.Node)
    bgNode: cc.Node = null;

    @property(cc.Prefab)
    recordPrefab: cc.Prefab = null;

    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Label)
    totalRecordLb: cc.Label = null;

    @property(cc.Label)
    totalBetLb: cc.Label = null;

    @property(cc.Label)
    totalProfitLb: cc.Label = null;

    @property(cc.Label)
    timeLabel: cc.Label = null;

    @property(cc.Node)
    loadingNode: cc.Node = null;

    @property(cc.Label)
    pageLabel: cc.Label = null;

    @property(cc.Button)
    btnNext: cc.Button = null;

    @property(cc.Button)
    btnPrev: cc.Button = null;

    private onHideCallback: Function = null;
    private pageNum: number = 0;
    private currentPage: number = 1;
    private maxRecordsPerPage: number = 20;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        History.inst = this;
        this.bgNode.active = false;
        this.dialogNode.opacity = 0;
        this.loadingNode.active = false;
    }

    start() {
    }

    update() {
        let viewRect = cc.rect(- this.node.width / 2, - this.content.y - this.node.height, this.node.width, this.node.height);
        for (let i = 0; i < this.content.children.length; i++) {
            const node = this.content.children[i];
            if (viewRect.intersects(node.getBoundingBox())) {
                node.opacity = 255;
            }
            else {
                node.opacity = 0;
            }
        }
    }

    public show(data?: any) {
        // if (!data) return;
        super.show();
        if (data)
            this.showDefault(data.onShowCB, data.onHideCB);
        else this.showDefault();
    }

    showDefault(onShowCB: Function = null, onHideCB: Function = null) {
        if (this.curState == E_HISTORY_STATE.Moving) return;
        clientEvent.dispatchEvent(EventName.PopupOpenClose, E_POPUP_STATE.OPENED);
        this.curState = E_HISTORY_STATE.Moving;
        this.bgNode.active = true;
        this.bgNode.opacity = 0;
        this.loadingNode.active = false;
        cc.tween(this.bgNode)
            .to(.5, { opacity: 120 })
            .start();
        this.dialogNode.y = -this.node.height / 2 - this.dialogNode.height / 2;
        this.dialogNode.opacity = 255;
        cc.tween(this.dialogNode)
            .to(.5, { y: -this.node.height / 2 + this.dialogNode.height / 2 }, { easing: 'cubicIn' })
            .call(() => {
                this.curState = E_HISTORY_STATE.Show;
                if (onShowCB)
                    onShowCB();
            })
            .start();
        // this.setQuerydateToday();
        this.getDataOfPage(this.currentPage);

        this.timeLabel.string = TextController.getRawText("HISTORY_TIME").split("{0}").join("(" + Utils.getGMTString(new Date()) + ")");
        this.onHideCallback = onHideCB;
    };

    hide() {
        if (this.onHideCallback) {
            this.onHideCallback();
            this.onHideCallback = null;
        }
        if (this.curState == E_HISTORY_STATE.Moving) return;
        this.curState = E_HISTORY_STATE.Moving;
        cc.tween(this.bgNode)
            .to(.5, { opacity: 0 })
            .call(() => { this.bgNode.active = false; })
            .start();
        this.dialogNode.y = -this.node.height / 2 + this.dialogNode.height / 2;
        cc.tween(this.dialogNode)
            .to(.5, { y: -this.node.height / 2 - this.dialogNode.height / 2 }, { easing: 'cubicOut' })
            .call(() => {
                this.curState = E_HISTORY_STATE.Hide;
                this.dialogNode.opacity = 0;
                this.currentPage = 1;
                this.btnPrev.interactable = false;
            })
            .start();
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxClose);
        clientEvent.dispatchEvent(EventName.PopupOpenClose, E_POPUP_STATE.CLOSED);
    };

    getDataOfPage(pageIndex: number = 0) {

        this.loadingNode.active = true;

        Utils.getHttp(
            Cfg.getListRecentBets,
            {
                page: pageIndex
            },
            (err, data) => {
                this.loadingNode.active = false;
                if (err) {
                    console.error(err);

                    return;
                }
                let result = JSON.parse(data);
                cc.log("getDataOfPage: ", result);
                this.btnNext.interactable = true;
                this.btnPrev.interactable = true;
                if(result.length > 0){
                    this.content.removeAllChildren();
                    this.currentPage = pageIndex;
                    this.pageLabel.string = (this.currentPage).toString();
                    result.forEach((recordInfo, index) => {
                        let recordNode = cc.instantiate(this.recordPrefab);
                        let record = recordNode.getComponent(HistoryRecord);
                        record.init(recordInfo, index, this);
                        recordNode.parent = this.content;
                        // sumProfit += recordInfo.profit + recordInfo.totalProfitFreeGame;
                    });

                    if(this.currentPage == 1)
                        this.btnPrev.interactable = false;
                    if(result.length < 10)
                        this.btnNext.interactable = false;
                }
            });
    }

    nextPageOnClick() {
        // if (this.currentPage >= this.pageNum - 1) return;
        // ++this.currentPage;
        const nextPage = this.currentPage + 1;
        this.getDataOfPage(nextPage);
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxButtonTap);
    }

    prevPageOnClick() {
        if (this.currentPage == 1) return;
        const prevPage = this.currentPage - 1;
        this.getDataOfPage(prevPage);
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxButtonTap);
    }
}
