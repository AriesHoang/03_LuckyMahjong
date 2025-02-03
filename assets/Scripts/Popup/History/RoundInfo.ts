import { E_SYMBOL, E_SYMBOL_Atlas } from "../../Game/ItemConfig";
import { BOARDSIZE, LINECONFIG } from "../../Game/LineConfig";
import TextController from "../../Manager/TextController";
import Utils from "../../Utils/Utils";
import HistoryBoard from "./HistoryBoard"
import PayLineItem from "../PayTable/PlayLineItem";
import CurrencyConverter from "../../Common/CurrencyConverter";
import { E_BOARD_MODE } from "../../Game/BoardUI";
import SpinWheel from "../FreespinGamble/SpinWheel";
import { WEDGE_ANGLE, WEDGE_ANGLEBUY } from "../FreespinGamble/FreespinGamble";


const { ccclass, property } = cc._decorator;

@ccclass
export default class RoundInfo extends cc.Component {

    @property(cc.Label)
    roundLb: cc.Label = null;

    @property(cc.Label)
    betSizeLb: cc.Label = null;

    @property(cc.Label)
    betLevelLb: cc.Label = null;

    @property(cc.Label)
    Transaction: cc.Label = null;

    @property(cc.Label)
    betLb: cc.Label = null;

    @property(cc.Label)
    ProfitLb: cc.Label = null;

    @property(cc.Label)
    balanceLb: cc.Label = null;

    @property(cc.Label)
    dateLb: cc.Label = null;

    @property(cc.Node)
    historyBoardNode: cc.Node = null;

    @property(cc.Node)
    historyBoardBgNode: cc.Node = null;

    @property(cc.Node)
    payoutResultContainerNode: cc.Node = null;

    @property(cc.Prefab)
    payoutInfoPrefab: cc.Prefab = null;

    @property(cc.SpriteAtlas)
    itemAtlas: cc.SpriteAtlas = null;

    @property(cc.Prefab)
    itemWheel: cc.Prefab = null;

    private _curRound: number;
    public get curRound(): number {
        return this._curRound;
    }
    public set curRound(v: number) {
        this._curRound = v;
        this.roundLb.string = TextController.getRawText("HISTORY_ROUND").split("{0}").join(v + '/' + (this.info.spinResult.result.length || 1));// this.info.spinResult.result.length;
    }

    private _spinResult: any;
    public get spinResult(): any {
        return this._spinResult;
    }
    public set spinResult(v: any) {
        this._spinResult = v;
        this.historyBoard.initBoard(v, this.mode);
    }

    mode: E_BOARD_MODE = E_BOARD_MODE.NORMAL;


    info: any = null;
    historyBoard: HistoryBoard = null;


    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.historyBoard = this.historyBoardNode.getComponent(HistoryBoard);
    }

    start() {

    }

    // update (dt) {}

    setInfo(info, curRound: number = 1, mode: E_BOARD_MODE = E_BOARD_MODE.NORMAL, isHaveWheel: boolean = false, isBuyFeature: boolean = false) {
        cc.log("setInfo: ", info);
        this.mode = mode;
        this.historyBoardNode.active = true;
        this.info = info;
        this.curRound = curRound;
        let date = new Date(this.info.created);
        this.dateLb.string = Utils.formatDate(date);
        this.Transaction.string = this.info.id;
        this.betSizeLb.string = CurrencyConverter.getCreditString(this.info.betSize);
        this.betLevelLb.string = this.info.betLevel.toString();
        let result = this.info.spinResult.result[curRound - 1];
        this.spinResult = result; //.result[curRound - 1];
        if (isBuyFeature) {
            this.spinResult = this.info.spinResult; //
            info.spinResult.result = [(1)];
            this.ProfitLb.string = CurrencyConverter.getCreditString(this.info.profit);
            this.betLb.string = CurrencyConverter.getCreditString(this.info.betAmount);
            this.balanceLb.string = Utils.getCurrencyStr() + CurrencyConverter.getCreditString(this.info.spinResult.playerBalance);
        }
        else {
            this.ProfitLb.string = CurrencyConverter.getCreditString(this.spinResult.profit);
            this.betLb.string = CurrencyConverter.getCreditString(this.spinResult.betAmount);
            this.balanceLb.string = Utils.getCurrencyStr() + CurrencyConverter.getCreditString(this.spinResult.playerBalance);
        }



        this.payoutResultContainerNode.removeAllChildren();
        //winlines

        //jackpot
        // if (this.spinResult.rewardJackpot && this.spinResult.rewardJackpot.winAmount > 0) {
        //     this.addJackpotPayout(this.spinResult.rewardJackpot);
        // }


        //show freespin result
        // let resultFreeSpins = this.spinResult.resultFreeSpin;
        // if (resultFreeSpins && this.spinResult.matrix) {
        //     const num_scatter = this.spinResult.matrix.reduce((count, val) => {
        //         return count + ((val.symbol == E_SYMBOL.BLUE_HEART) ? 1 : 0);
        //     }, 0);
        //     this.addFreeSpinPayout(resultFreeSpins, num_scatter);
        // }

        let isFreeSpin = false;


        if (this.info?.isGetFreeSpin && this.info?.spinResult?.resultFreeSpin > 0 && this.curRound == this.info.spinResult.result.length) {
            isHaveWheel = this.info?.spinResult?.resultFreeSpin <= 3;
            if (!isHaveWheel) {
                let nodeX = cc.instantiate(this.itemWheel);
                nodeX.parent = this.payoutResultContainerNode;
                let comp = nodeX.getComponentInChildren(SpinWheel);
                let ItemConfig
                if (!isBuyFeature) {
                    if (this.info.betType == "BUY_FREESPIN")
                        isBuyFeature = true;

                }
                if (isBuyFeature) {
                    ItemConfig = WEDGE_ANGLEBUY[this.info.spinResult.resultFreeSpin]
                } else {
                    ItemConfig = WEDGE_ANGLE[this.info.spinResult.resultFreeSpin]
                }

                comp.setAngle(ItemConfig.angle);
            }else{
                this.addScatter(isHaveWheel); 
            }

            this.addFreeSpinPayout(this.info.spinResult.resultFreeSpin, isHaveWheel);
            if (this.info.spinResult.isBuyFreeSpin || this.info.spinResult.isBuyGamble)
                this.historyBoardNode.active = false;
            isFreeSpin = true;
        }

        let mur = 1;
        if (!isBuyFeature) {
            mur = this.spinResult?.pumpkinMulCurrent[0] * this.spinResult?.pumpkinMulCurrent[1] * this.spinResult?.pumpkinMulCurrent[2];
            if (isFreeSpin&& !isHaveWheel) {
                this.addScatter(isHaveWheel);
            }
        }
        if (this.spinResult.hasOwnProperty("winlines")) {
            this.addPaylinePayout(this.spinResult.winlines, mur);
            // if(isFreeSpin&&this.spinResult.winlines.length <= 0){
            //     let payout_info_node = cc.instantiate(this.payoutInfoPrefab);
            //     payout_info_node.parent = this.payoutResultContainerNode;
            //     let amount_label = payout_info_node.getChildByName("win_amount_label");
            //     amount_label.x = 0;
            //     amount_label.anchorX = 0.5;
            //     amount_label.getComponent(cc.Label).string = TextController.getRawText("MULTIPLIER") + ': ' + mur.toString();
            //     amount_label.getComponent(cc.Label).horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            // }

        }




        this.addTotalWinPayout(this.spinResult.totalWin);
        if (this.payoutResultContainerNode.childrenCount == 0) {
            this.addNoWinningCombinationPayout();
        }
        // cc.log("this.historyBoardNode:", this.historyBoardNode.getContentSize());
        // this.historyBoardNode.parent.getComponent(cc.Layout).updateLayout();
    };

    addFreeSpinPayout(freespinNum: number, isHaveWheel) {
        let payout_info_node = cc.instantiate(this.payoutInfoPrefab);
        payout_info_node.parent = this.payoutResultContainerNode;
        // let payline_info_node = payout_info_node.getChildByName("heart_collect");
        // payline_info_node.active = (!this.spinResult.isBuyFreeSpin && !this.spinResult.isBuyGamble);

        payout_info_node.getChildByName("win_amount_label").getComponent(cc.Label).string = TextController.getRawText("FREE_SPINS_WON") + ": " + freespinNum.toString();
        if (isHaveWheel) return;
        let payout_info_node2 = cc.instantiate(this.payoutInfoPrefab);
        payout_info_node2.parent = this.payoutResultContainerNode;
        payout_info_node2.height = 60;
        let mur = WEDGE_ANGLE[freespinNum].value;
        let nodetxt = payout_info_node2.getChildByName("win_amount_label");
        nodetxt.y = 40;
        // nodetxt.x += 16;
        // let payline_info_node = payout_info_node.getChildByName("heart_collect");
        // payline_info_node.active = (!this.spinResult.isBuyFreeSpin && !this.spinResult.isBuyGamble);

        nodetxt.getComponent(cc.Label).string = TextController.getRawText("MULTIPLIER") + ': X' + mur.toString();
    }

    private getKind(value: number): string {
        let result: string;
        switch (value) {
            case 3:
                result = TextController.getRawText('THREE_OF_KIND')
                break;
            case 4:
                result = TextController.getRawText('FOUR_OF_KIND')
                break;
            case 5:
                result = TextController.getRawText('FIVE_OF_KIND')
                break;
            case 6:
                result = TextController.getRawText('SIX_OF_KIND')
                break;
            default:
                result = '';
        }
        return result
    }

    addScatter(isHaveWheel) {
        let resultFreeSpins = this.spinResult.reels;
        if (resultFreeSpins) {
            const num_scatter = this.spinResult.reels.reduce((count, val) => {
                return count + ((val.symbol == E_SYMBOL.SCATTER) ? 1 : 0);
            }, 0);

            let payout_info_node = cc.instantiate(this.payoutInfoPrefab);
            payout_info_node.parent = this.payoutResultContainerNode;
            let winline_info_node = payout_info_node.getChildByName("winlines");
            winline_info_node.active = true;
            let sf_name: string = "";
            sf_name = E_SYMBOL_Atlas[E_SYMBOL.SCATTER];
            winline_info_node.getChildByName("item_icon").getComponent(cc.Sprite).spriteFrame = this.itemAtlas?.getSpriteFrame(sf_name);
            let nodeTile = winline_info_node.getChildByName("title_label");
            nodeTile.y -= 25;
            nodeTile.getComponent(cc.Label).string = "x " + num_scatter;
            let nodeWinAmount = winline_info_node.getChildByName("win_amount_label");
            nodeWinAmount.y -= 25;
            if (!isHaveWheel)
                nodeWinAmount.getComponent(cc.Label).string = CurrencyConverter.getCreditString(this.info.spinResult.additionalSCPay);
            else nodeWinAmount.active = false;
            payout_info_node.getChildByName("win_amount_label").active = false;

            winline_info_node.getChildByName("way_label").active = false;
            winline_info_node.getChildByName("win_multi_label").active = false

        }
    }

    addPaylinePayout(resultPayouts, curMul: number) {
        if (resultPayouts.length > 0) {
            let payout_info_node = cc.instantiate(this.payoutInfoPrefab);
            payout_info_node.parent = this.payoutResultContainerNode;
            let amount_label = payout_info_node.getChildByName("win_amount_label");
            amount_label.x = 0;
            amount_label.anchorX = 0.5;
            amount_label.getComponent(cc.Label).string = TextController.getRawText("MULTIPLIER") + ': ' + curMul.toString();
            amount_label.getComponent(cc.Label).horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        }
        resultPayouts.forEach((result, index) => {
            let payout_info_node = cc.instantiate(this.payoutInfoPrefab);
            payout_info_node.parent = this.payoutResultContainerNode;
            let winline_info_node = payout_info_node.getChildByName("winlines");
            winline_info_node.active = true;
            let sf_name: string = result.symbol.toString();
            sf_name = E_SYMBOL_Atlas[sf_name];
            winline_info_node.getChildByName("item_icon").getComponent(cc.Sprite).spriteFrame = this.itemAtlas?.getSpriteFrame(sf_name);
            winline_info_node.getChildByName("title_label").getComponent(cc.Label).string = TextController.getRawText(result.winPos[0].length.toString() + '_OF_KIND');
            winline_info_node.getChildByName("way_label").getComponent(cc.Label).string = TextController.getRawText('NUM_OF_WAYS').split('{0}').join(result.ways.toString());
            winline_info_node.getChildByName("win_amount_label").getComponent(cc.Label).string = CurrencyConverter.getCreditString(result.winAmountMul);
            winline_info_node.getChildByName("win_multi_label").getComponent(cc.Label).string = CurrencyConverter.getCreditString(result.winAmount) + " x " + curMul.toString();
            payout_info_node.getChildByName("win_amount_label").active = false;
        });


    }

    // addCoinCollectPayout(resultPayouts, multiply: number) {
    //     let payout_info_node = cc.instantiate(this.payoutInfoPrefab);
    //     payout_info_node.parent = this.payoutResultContainerNode;
    //     let coin_collect_info = payout_info_node.getChildByName("coin_collect");
    //     coin_collect_info.active = true;
    //     coin_collect_info.getChildByName("coin_icon").getChildByName("amount_label").getComponent(cc.Label).string = CurrencyConverter.getCreditString(resultPayouts.rewardMoneyCollect / multiply);
    //     const sf_name = "11_" + (multiply == 1 ? "3" : (multiply == 2 ? "2" : "1"));
    //     coin_collect_info.getChildByName("collect_icon").getComponent(cc.Sprite).spriteFrame = this.itemAtlas?.getSpriteFrame(sf_name);
    //
    //     payout_info_node.getChildByName("win_amount_label").getComponent(cc.Label).string = CurrencyConverter.getCreditString(resultPayouts.rewardMoneyCollect);
    // }

    // addJackpotPayout(resultPayouts) {
    //     let payout_info_node = cc.instantiate(this.payoutInfoPrefab);
    //     payout_info_node.parent = this.payoutResultContainerNode;
    //     let payline_info_node = payout_info_node.getChildByName("item");
    //     payline_info_node.active = true;
    //     payline_info_node.getChildByName("item_icon").getComponent(cc.Sprite).spriteFrame = this.itemAtlas?.getSpriteFrame(resultPayouts.jackpotWinId.toString());
    //     payline_info_node.getChildByName("amount_label").active = false;
    //     payout_info_node.getChildByName("win_amount_label").getComponent(cc.Label).string = CurrencyConverter.getCreditString(resultPayouts.winAmount);
    // }

    // addExpandSymbolPayout(itemID: number) {
    //     let payout_info_node = cc.instantiate(this.payoutInfoPrefab);
    //     payout_info_node.parent = this.payoutResultContainerNode;
    //     let payline_info_node = payout_info_node.getChildByName("item");
    //     payline_info_node.active = true;
    //     payline_info_node.getChildByName("item_icon").getComponent(cc.Sprite).spriteFrame = this.itemAtlas?.getSpriteFrame(itemID.toString());
    //     payline_info_node.getChildByName("amount_label").active = false;
    //
    //     payout_info_node.getChildByName("win_amount_label").getComponent(cc.Label).string = TextController.getRawText("EXPAND_AND_PAY");
    // }

    addTotalWinPayout(totalWin) {
        if (totalWin > 0) {
            if (this.spinResult.currentMultiplier > 0) {
                let multi_info_node = cc.instantiate(this.payoutInfoPrefab);
                multi_info_node.parent = this.payoutResultContainerNode;
                // let payline_info_node = multi_info_node.getChildByName("item");
                // payline_info_node.active = false;
                multi_info_node.getChildByName("win_amount_label").getComponent(cc.Label).string = TextController.getRawText("MULTIPLIER") + " X" + this.spinResult.currentMultiplier;
            }

            //credit
            let payout_info_node = cc.instantiate(this.payoutInfoPrefab);
            payout_info_node.parent = this.payoutResultContainerNode;
            // let payline_info_node = payout_info_node.getChildByName("item");
            // payline_info_node.active = false;
            payout_info_node.getChildByName("win_amount_label").getComponent(cc.Label).string = TextController.getRawText("TOTAL_WIN") + ": " + CurrencyConverter.getCreditString(totalWin);
        }
    }

    // addExpandItemPayout(resultPayouts) {
    //     let payout_info_node = cc.instantiate(this.payoutInfoPrefab);
    //     payout_info_node.parent = this.payoutResultContainerNode;
    //     let expand_info_node = payout_info_node.getChildByName("expand_item");
    //     expand_info_node.active = true;
    //
    //     payout_info_node.getChildByName("win_amount_label").getComponent(cc.Label).string = CurrencyConverter.getCreditString(resultPayouts.totalWinExpanding);
    // }

    addNoWinningCombinationPayout() {
        let payout_info_node = cc.instantiate(this.payoutInfoPrefab);
        payout_info_node.parent = this.payoutResultContainerNode;
        let amount_label = payout_info_node.getChildByName("win_amount_label");
        amount_label.x = 0;
        amount_label.anchorX = 0.5;
        amount_label.getComponent(cc.Label).string = TextController.getRawText("NO_WINNING_COMBINATION");
        amount_label.getComponent(cc.Label).horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    }

    updateBoardBackground(isFreeSpin: boolean) {
        return;
        let bg_normal = this.historyBoardBgNode.getChildByName("normal");
        let bg_freespin = this.historyBoardBgNode.getChildByName("freespin");
        bg_normal.active = !isFreeSpin;
        bg_freespin.active = isFreeSpin;
    }

    resetScrollView() {
        this.payoutResultContainerNode.parent.parent.parent.getComponent(cc.ScrollView).scrollToTop();
    }

    setPaylineIcon(container: cc.Node, idList: number[]) {
        const item_num = BOARDSIZE.x * BOARDSIZE.y;
        for (let i = 0; i < item_num; ++i) {
            container.getChildByName(i.toString()).getComponent(cc.Sprite).enabled = idList.includes(i);
        }
    }
}
