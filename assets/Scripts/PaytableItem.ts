import { PaytableInfo } from "./Popup/PayTable/PayTable";
import { E_SYMBOL_Atlas } from "./Game/ItemConfig";
import TextController from "./Manager/TextController";
import { Cfg } from "./Manager/Config";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PaytableItem extends cc.Component {

    @property(cc.Label)
    num_label: cc.Label = null;

    @property(cc.Sprite)
    icon: cc.Sprite = null;
        
    @property(cc.SpriteAtlas)
    itemAtlas: cc.SpriteAtlas = null;


    @property(cc.Node)
    description: cc.Node = null;

    @property(cc.Prefab)
    descriptionTxtPrefab: cc.Prefab = null;

    setup(info: PaytableInfo, numInfo)
    {
        this.icon.spriteFrame = this.itemAtlas.getSpriteFrame(E_SYMBOL_Atlas[info.symbolType].toString());

        info.description.forEach((element, index) => {
            let descriptionTxt = cc.instantiate(this.descriptionTxtPrefab);
            descriptionTxt.parent = this.description;
            let lb = descriptionTxt.getComponent(cc.Label);
            lb.string  = TextController.getRawText(element);
            if(Cfg.language == "th"){
                lb.cacheMode = cc.Label.CacheMode.NONE;
            }
            descriptionTxt.parent.getComponent(cc.Layout).updateLayout();
        });

        this.num_label.string = numInfo;

        if(info.description.length <= 0){
            this.description.parent.getComponent(cc.Layout).spacingY = 0;
            this.description.active = false;
        }
        if(numInfo.trim().length <= 0){
            this.description.parent.getComponent(cc.Layout).spacingY = 0;
            this.num_label.node.active = false;
        }

       this.scheduleOnce(()=>{
        this.node.getComponent(cc.Layout).updateLayout();
       }, 1);
    }

    updateNumInfo(numInfo)
    {
        this.num_label.string = numInfo;
    }


}
