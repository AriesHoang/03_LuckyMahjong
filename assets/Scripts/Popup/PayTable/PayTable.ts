import CurrencyConverter from "../../Common/CurrencyConverter";
import CustomScrollView from "../../Core/CustomScrollView";
import { E_SYMBOL } from "../../Game/ItemConfig";
import { LINECONFIG } from "../../Game/LineConfig";
import RootData from "../../Manager/RootData";
import PaytableItem from "../../PaytableItem";
import Utils from "../../Utils/Utils";
import PayLineItem from "./PlayLineItem";
import { Cfg } from "../../Manager/Config";

export const PAYTABLECONFIG = [
    [],
    [],
    [],
    [0, 5, 6, 4, 4, 3, 3, 2, 2, 2, 1, 1, 1],
    [0, 25, 10, 6, 6, 5, 5, 3, 3, 3, 2, 2, 2],
    [0, 100, 40, 20, 20, 10, 10, 7, 7, 7, 5, 5, 5]
]
const { ccclass, property } = cc._decorator;
@ccclass("PaytableInfo")
export class PaytableInfo {
    @property({ type: cc.Enum(E_SYMBOL) })
    symbolType: E_SYMBOL = E_SYMBOL.H1;
    // @property()
    // description: string = '';
    @property({ type: cc.String })
    description: string[] = [];

    @property({ type: Number })
    number: number = -1;
}

@ccclass
export default class PayTable extends cc.Component {

    static inst: PayTable = null;

    @property(cc.Node)
    bg: cc.Node = null;

    @property(cc.SpriteFrame)
    contentImg: cc.SpriteFrame = null;

    @property(cc.Node)
    scrollView: cc.Node = null;

    @property(cc.Node)
    scrollViewContent: cc.Node = null;

    @property(cc.Node)
    nodePayLines: cc.Node = null;

    @property(cc.Prefab)
    itemPayLine: cc.Prefab = null;

    @property(cc.Node)
    allLayouts: cc.Node = null;

    @property({ type: [PaytableInfo] })
    allPaytableInfo: PaytableInfo[] = [];

    @property(cc.Prefab)
    paytableItem: cc.Prefab = null;

    allPaytableItem: PaytableItem[] = [];


    protected onLoad(): void {
        PayTable.inst = this;
        this.bg.height = this.node.height;
        this.bg.y = - this.node.height;
        this.bg.active = false;
        this.init();
    }

    start() {

    }

    update(dt) {
        let viewRect = cc.rect(- this.scrollView.width / 2, - this.scrollViewContent.y - this.scrollView.height, this.node.width, this.node.height);
        for (let i = 0; i < this.scrollViewContent.children.length; i++) {
            const node = this.scrollViewContent.children[i];
            if (viewRect.intersects(node.getBoundingBox())) {
                node.opacity = 255;
            }
            else {
                node.opacity = 0;
            }
        }
    }

    init() {
        let _this = this;
        // for (let i = 0; i < LINECONFIG.posArr.length; i++) {
        //     let dataPayline = LINECONFIG.posArr[i];
        //     let itemPayline = cc.instantiate(this.itemPayLine);
        //     itemPayline.parent = this.nodePayLines;
        //     itemPayline.getComponent(PayLineItem).initPayLine(i + 1, dataPayline);
        // }
    }

    showPromise(): Promise<any> {
        return new Promise((resolve: Function) => {
            this.setPaytableValue();
            let scrollView = this.scrollView.getComponent(CustomScrollView);
            scrollView.content.y = 0;

            this.bg.active = true;
            cc.tween(this.bg)
                .to(.5, { y: -110 }, { easing: 'cubicIn' })
                .call(() => {
                    resolve();
                })
                .start();
        });
    }

    hidePromise(): Promise<any> {
        return new Promise((resolve: Function) => {
            let _this = this;
            cc.tween(this.bg)
                .to(.5, { y: - _this.node.height }, { easing: 'cubicOut' })
                .call(() => {
                    _this.bg.active = false;
                    resolve();
                })
                .start();
        });
    }

    setPaytableValue() {
        let data = PAYTABLECONFIG;
        let bet_amount = RootData.instance.gamePlayData.getCurBet() / Cfg.baseBetValue;
        this.allPaytableInfo.forEach((element, index) => {
            // let total_bet = (element.symbolType == E_SYMBOL.SCATTER) ? bet_amount * HUDManager.inst.betOptionDialog.curBetLine : bet_amount;
            let str = "";
            for (let i = data.length - 1; i >= 0; i--) {
                if (data[i].length > 0) {
                    let multiplier = data[i][13 - element.symbolType];
                    if (multiplier > 0) str += i + "X = " + Cfg.currency+" " + (CurrencyConverter.getCreditString(multiplier * bet_amount)) + "\n";

                    //if scatter pays
                    // if (element.symbolType == E_SYMBOL.SCATTER && RootData.instance.gamePlayData.configData.config.scPay)
                    //     str = i + "X = " + Utils.getCurrencyStr() + (CurrencyConverter.getCreditString(RootData.instance.gamePlayData.configData.config.scPay * total_bet)) + "\n";
                }
            }
            if (this.allPaytableItem.length != this.allPaytableInfo.length) {
                let item = cc.instantiate(this.paytableItem).getComponent(PaytableItem);
                item.node.parent = this.allLayouts;
                item.node.setSiblingIndex(index + 1);
                this.allPaytableItem.push(item);
                item.setup(element, str.trim());
            }
            else {

                this.allPaytableItem[index].updateNumInfo(str.trim());
            }
        });
        this.allLayouts?.getComponent(cc.Layout).updateLayout();
    }
}
