import { Cfg } from "../../Manager/Config";
import TextController from "../../Manager/TextController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RuleText extends cc.Component {
    @property(cc.Node)
    labelTemplate: cc.Node = null;

    @property(cc.Node)
    imageTemplate: cc.Node = null;

    @property(cc.SpriteAtlas)
    itemAtlas: cc.SpriteAtlas = null;

    private _curLabelID: number = 0;
    private _curSpriteID: number = 0;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.labelTemplate.active = false;
        this.imageTemplate.active = false;
    }

    start() {
    }

    update(dt) {
    }

    // LIFE-CYCLE CALLBACKS - END
    setRule(textID: string, sfList: string[]) {
        this.resetContent();
        let msg = TextController.getRawText(textID); //shallow copy
        let arr: string[] = [];
        while (msg.match('{[0-9](.*)}')) {
            const index = msg.indexOf(msg.match('{[0-9](.*)}')[0]);
            const length = msg.substring(index).indexOf('}') + 1;
            //label
            this.addLabel(msg.substring(0, index));
            arr.push(msg.substring(0, index));
            //image
            const sf_id = msg.substring(index + 1, index + length - 1);
            if (sfList[sf_id]) {
                this.addImage(sfList[sf_id]);
            }
            arr.push(msg.substring(index, length));
            msg = msg.substring(index + length);
        }
        if (msg.length > 0) {
            //label
            this.addLabel(msg);
            arr.push(msg);
        }
        this.node.active = true;
        this.node.getComponent(cc.Layout).updateLayout();
    }

    resetContent() {
        this.node.active = false;
        while (this._curLabelID > 0) {
            --this._curLabelID;
            this.node.getChildByName("label_" + this._curLabelID).active = false;
        }
        while (this._curSpriteID > 0) {
            --this._curSpriteID;
            this.node.getChildByName("image_" + this._curSpriteID).active = false;
        }
    }

    hide() {
        this.node.active = false;
    }

    addLabel(str: string) {
        let new_label = this.node.getChildByName("label_" + this._curLabelID)?.getComponent(cc.Label);
        //check if has available slot
        if (!new_label) {
            //add/instantiate new label
            new_label = cc.instantiate(this.labelTemplate).getComponent(cc.Label);
            new_label.node.parent = this.node;
            new_label.node.name = "label_" + this._curLabelID;
            if (Cfg.language == "vi") {
                new_label.useSystemFont = true;
                new_label.enableBold = true;
            }
        }
        new_label.node.active = true;
        new_label.string = str;
        ++this._curLabelID;
    }

    addImage(sfName: string) {
        let new_image = this.node.getChildByName("image_" + this._curSpriteID)?.getComponent(cc.Sprite);
        //check if has available slot
        if (!new_image) {
            //add/instantiate new image
            new_image = cc.instantiate(this.imageTemplate).getComponent(cc.Sprite);
            new_image.node.parent = this.node;
            new_image.node.name = "image_" + this._curSpriteID;
        }
        new_image.node.active = true;
        new_image.spriteFrame = this.itemAtlas.getSpriteFrame(sfName);
        new_image.node.getChildByName("symbol_icon").getComponent(cc.Sprite).spriteFrame = this.itemAtlas.getSpriteFrame(sfName);
        ++this._curSpriteID;
    }

}
