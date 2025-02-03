
import CurrencyConverter from "../../Common/CurrencyConverter";
import { AudioPlayId } from "../../Core/audio/AudioPlayId";
import SoundController from "../../Manager/SoundController";
import Utils from "../../Utils/Utils";
import History from "./History"
import HistoryDetail from "./HistoryDetail";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HistoryRecord extends cc.Component {

    @property(cc.Label)
    time: cc.Label = null;
    @property(cc.Label)
    transaction: cc.Label = null;
    @property(cc.Label)
    bet: cc.Label = null;
    @property(cc.Label)
    profit: cc.Label = null;
    info = null;
    index = 0;

    historyComponent: History = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {

        this.node.on(cc.Node.EventType.MOUSE_ENTER, () => {
            this.node.color = new cc.Color().fromHEX("#24242E");
        }, this);
        this.node.on(cc.Node.EventType.MOUSE_LEAVE, () => {
            if (this.index % 2 == 0) {
                this.node.color = new cc.Color().fromHEX("#34343f");
            } else {
                this.node.color = new cc.Color().fromHEX("#30303c");
            }
        }, this);
    }

    init(info, index = 0, historyComp: History = null) {
        this.info = info;
        let date = new Date(info.createdAt);
        this.time.string = Utils.formatDate(date, true);
        this.bet.string = CurrencyConverter.getCreditString(info.data.baseAmount);
        this.profit.string = CurrencyConverter.getCreditString(info.payoutAmount);
        this.transaction.string = info.id;
        this.index = index;
        let colorHex = index % 2 == 0 ? '#34343f' : '#30303c';
        this.node.color = new cc.Color().fromHEX(colorHex)
        this.historyComponent = historyComp;

    }

    onClick() {
        return;
        // this.historyComponent.getComponent(HistoryDetail).show(this.info);
        // SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxButtonTap);
    }
}
