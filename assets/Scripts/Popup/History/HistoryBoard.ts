import { E_BOARD_MODE } from "../../Game/BoardUI";
import ItemBigSymbol from "../../Game/ItemBigSymbol";
import { E_SYMBOL, ItemConfig } from "../../Game/ItemConfig";
import ItemSymbol from "../../Game/ItemSymbol";
import SpinReelNormal from "../../Game/SpinReelNormal";
import { Cfg } from "../../Manager/Config";
import TextController from "../../Manager/TextController";


const { ccclass, property } = cc._decorator;

@ccclass
export default class HistoryBoard extends cc.Component {

    @property(cc.Node)
    boardContain: cc.Node = null;

    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    itemBig: cc.Prefab = null;

    @property(cc.Node)
    bottomLine: cc.Node = null;

    @property(cc.Label)
    inforMode: cc.Label = null;

    @property(cc.Label)
    multiplierLbRed: cc.Label = null;

    @property(cc.Label)
    multiplierLbPurple: cc.Label = null;

    @property(cc.Label)
    multiplierLbGreen: cc.Label = null;

    
    @property(sp.Skeleton)
    skeletonRed: sp.Skeleton = null;

    @property(sp.Skeleton)
    skeletonPurple: sp.Skeleton = null;

    @property(sp.Skeleton)
    skeletonGreen: sp.Skeleton = null;


    // LIFE-CYCLE CALLBACKS:

    onLoad() {

    }

    start() {

    }

    // update (dt) {}

    initBoard(result, mode: E_BOARD_MODE) {
        if (!result||!result.reels) {
            for (let ci = 0; ci < Cfg.slotSize.x; ci++) {
                let parent = this.boardContain.children[ci];
                parent.destroyAllChildren();
            }
            this.node.active = false;
            return;

        };

        this.multiplierLbPurple.string = result.pumpkinMul[0];
        this.multiplierLbRed.string = result.pumpkinMul[1]; 
        this.multiplierLbGreen.string = result.pumpkinMul[2];

        this.setPurple(result.pumpkinCollect[0]);
        this.setRed(result.pumpkinCollect[1]);
        this.setGreen(result.pumpkinCollect[2]);

        this.node.active = true;
        cc.log("HistoryBoard initBoard: ", result);
        // this.boardContain.removeAllChildren();
        let grid_result: ItemConfig[][] = this.parseSpinResult(result.reels,result.reelSize);
        
        // grid_result.forEach((row_result, reel_id) => {
        //     row_result.forEach((itemCfg, index) => {
        //         let item = cc.instantiate(this.itemPrefab);
        //         // if (!heightOfSymbol)
        //         //     heightOfSymbol = item.height;
        //         let itemComp = item.getComponent(ItemSymbol)
        //         itemComp.init(itemCfg);
        //         item.scale = 0.88;
        //         this.boardContain.addChild(item);
        //     });
        // });
        switch (mode) {
            case E_BOARD_MODE.NORMAL:
                this.inforMode.node.active = false;
                this.inNomaralMode(grid_result);
                break;

            case E_BOARD_MODE.FREESPIN:
                this.inNomaralMode(grid_result);
                this.inforMode.node.active = true;
                this.inforMode.string = TextController.getRawText("Wheel_Prize_02");
                break;

            case E_BOARD_MODE.FullReelWild:
                this.inforMode.node.active = true;
                this.inforMode.string = TextController.getRawText("Wheel_Prize_03");
                this.inFullReelMode(grid_result);
                break;

            default:
                break;
        }




        // cc.log("this.boardContain: " + heightOfSymbol * numRow);
        // this.node.setContentSize(cc.size(this.node.width, heightOfSymbol * numRow + 50));
    }

    setRed(vCol){
        let name_anim = "stack_"+ vCol; 
        this.skeletonRed.setAnimation(0,name_anim, true);
    }

    setPurple(vCol){
        let name_anim = "stack_"+ vCol; 
        this.skeletonPurple.setAnimation(0,name_anim, true);
    }
    setGreen(vCol){
        let name_anim = "stack_"+ vCol; 
        this.skeletonGreen.setAnimation(0,name_anim, true);
    }
  

    inNomaralMode(grid_result) {
        grid_result.forEach((row_result, reel_id) => {
            let a = row_result;
            let parent = this.boardContain.children[reel_id];
            parent.destroyAllChildren();
            a.forEach((itemCfg, index) => {
                if (itemCfg.size > 1) {
                    let item = cc.instantiate(this.itemBig);
                    let itemComp = item.getComponent(ItemBigSymbol);
                    itemComp.setNumItemConfigs(itemCfg.size);
                    itemComp.init(itemCfg);
                    item.setContentSize(Cfg.itemSize.x, Cfg.itemSize.y * itemCfg.size)

                    parent.addChild(item);
                } else {
                    let item = cc.instantiate(this.itemPrefab);
                    let itemComp = item.getComponent(ItemSymbol)
                    itemComp.init(itemCfg);

                    parent.addChild(item);
                }

            });
        });

    }

    inFreeSpinMode(result) {

    }

    parseSpinResult(resultMatrix, reelsize: number[]) {
        let itemTypeGrid = [];
        reelsize = reelsize;
        let totalMergedrowNum = 0;
        for (let ci = 0; ci < Cfg.slotSize.x; ++ci) {
            let _rowNum = reelsize[ci];
            itemTypeGrid[ci] = [];

            for (let ri = 0; ri < _rowNum; ++ri) {
                itemTypeGrid[ci].push(resultMatrix[totalMergedrowNum + ri]);
            }
            totalMergedrowNum += _rowNum;
        }
        return itemTypeGrid
    }

    inFullReelMode(grid_result) {
        grid_result.forEach((row_result, reel_id) => {
            let a = (row_result);
            let parent = this.boardContain.children[reel_id];
            parent.destroyAllChildren();
            a.forEach((itemCfg, index) => {
                if (itemCfg.size > 1) {
                    let item = cc.instantiate(this.itemBig);
                    let itemComp = item.getComponent(ItemBigSymbol);
                    itemComp.setNumItemConfigs(itemCfg.size);
                    itemComp.init(itemCfg);
                    item.setContentSize(Cfg.itemSize.x, Cfg.itemSize.y * itemCfg.size);

                    parent.addChild(item);
                } else {
                    let item = cc.instantiate(this.itemPrefab);
                    let itemComp = item.getComponent(ItemSymbol)
                    itemComp.init(itemCfg);

                    parent.addChild(item);
                }

            });
        });


    }
}
