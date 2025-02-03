import CurrencyConverter from "../../Common/CurrencyConverter";
import CustomScrollView from "../../Core/CustomScrollView";
import { E_SYMBOL } from "../../Game/ItemConfig";
import { LINECONFIG } from "../../Game/LineConfig";
import RootData from "../../Manager/RootData";
import PaytableItem from "../../PaytableItem";
import Utils from "../../Utils/Utils";
import PayLineItem from "./PlayLineItem";
import {Cfg} from "../../Manager/Config";

export const PAYTABLECONFIG = [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 25, 60, 120],
    [0, 0, 0, 20, 40, 80],
    [0, 0, 0, 15, 30, 60],
    [0, 0, 0, 10, 20, 40],
    [0, 0, 0, 8, 15, 30],
    [0, 0, 0, 5, 10, 25],
    [0, 0, 0, 4, 8, 20],
    [0, 0, 0, 4, 8, 15],
    [0, 0, 0, 2, 5, 10],
    [0, 0, 0, 2, 5, 10],
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
        for (let i = 0; i < LINECONFIG.posArr.length; i++) {
            let dataPayline = LINECONFIG.posArr[i];
            let itemPayline = cc.instantiate(this.itemPayLine);
            itemPayline.parent = this.nodePayLines;
            itemPayline.getComponent(PayLineItem).initPayLine(i + 1, dataPayline);
        }
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
            let str = "";
            let payData = data[index];
            for(let i = payData.length - 1; i > 2; i--){
                if(payData[i] > 0){
                    str += i + "X = " + Utils.getCurrencyStr() + (CurrencyConverter.getCreditString(payData[i] * bet_amount)) + "\n";
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
