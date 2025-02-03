// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import TextController from "../../Manager/TextController";
import UtilsStageLoading from "../../Stageloading/UtilsStageLoading";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoadMultilingualImageTextTranslator extends cc.Component {

    @property
    key: string = '';


    protected start(): void {
        // this.updateContent();
    }

    updateContent(): Promise<any> {
        return new Promise((resolve: Function, reject: Function) => {
            if (this.key == "") return;
            let path = "Prefabs/MultilingualImageText/" + this.key;
            UtilsStageLoading.loadRes<cc.Prefab>(path, cc.Prefab, (err, res) => {
                if (err) {
                    reject();
                } else {
                    const nodeX: cc.Node = cc.instantiate(res);
                    this.node.addChild(nodeX);
                    resolve();
                    this.node.setContentSize(nodeX.getContentSize());
                }
            });
        })


    }

    async setKey(_key: string) {
        this.key = _key;

        this.rest();
        await this.updateContent();
    }

    rest() {
        this.node.removeAllChildren(true);
        // this.node.destroyAllChildren();

    }


    // update (dt) {}
}
