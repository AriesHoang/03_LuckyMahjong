import { clientEvent } from "../Core/observer/clientEvent";
import { EventName } from "../Manager/EventName";
import RootData from "../Manager/RootData";
import NumberLabel from "../Common/NumberLabel";
import MultilingualImageCustomRichTextTranslator from "../Common/Multilingual/MultilingualImageCustomRichTextTranslator";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FreeSpinInfo extends cc.Component {

    @property(cc.Node)
    numLabel: cc.Node = null;

    @property(cc.Node)
    remainingFreeSpin: cc.Node = null;

    @property(cc.Node)
    lastFreeSpin: cc.Node = null;


    showFreeSpinInfo(iFreeSpin: number) {
        // this.node.active = iFreeSpin > 0;
        if (iFreeSpin < 0) return;
        if (iFreeSpin > 0) {
            this.scheduleOnce(() => {
                this.numLabel.active = true;
                this.remainingFreeSpin.active = true;
                this.lastFreeSpin.active = false;
                // this.numLabel.string = iFreeSpin.toString();
                // let val = (this.numLabel.getComponent(MultilingualImageCustomRichTextTranslator) as MultilingualImageCustomRichTextTranslator)
                // val.setkey(iFreeSpin.toString());
                this.numLabel.getComponent(cc.Label).string = iFreeSpin.toString();
            }, 0.15)

        } else {
            this.scheduleOnce(() => {
                this.numLabel.active = false;
                this.remainingFreeSpin.active = false;
                this.lastFreeSpin.active = true;
            }, 0.15)
        }
    }
}
