// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { HeartItemWin } from "../Data/GamePlay/LineWinData";
import { Cfg } from "../Manager/Config";
import ItemSymbol from "./ItemSymbol";
import SoundController from "../Manager/SoundController";
import {AudioPlayId} from "../Core/audio/AudioPlayId";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ElectricHeartEffect extends cc.Component {

    @property(cc.Prefab)
    electricPrefab: cc.Prefab = null;

    start() {

    }

    playAnim(redItem: ItemSymbol, blueItem: ItemSymbol) {
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxHeartConnect);
        let electricSkeRed = cc.instantiate(this.electricPrefab).getComponent(sp.Skeleton);
        let electricSkeBlue = cc.instantiate(this.electricPrefab).getComponent(sp.Skeleton);
        this.node.addChild(electricSkeRed.node);
        this.node.addChild(electricSkeBlue.node);
        electricSkeRed.setAnimation(0, "electric_red", true);
        electricSkeBlue.setAnimation(0, "electric_blue", true);

        // let boneBlue = electricSkeBlue.findBone("electric_blue2");
        // let boneRed = electricSkeRed.findBone("electric_red2");

        let radRed = Math.atan2(redItem.node.y - blueItem.node.y, redItem.node.position.x - blueItem.node.x);
        var degRed = radRed * (180 / Math.PI);

        let radBlue = Math.atan2(blueItem.node.y - redItem.node.y, blueItem.node.position.x - redItem.node.x);
        var degBlue = radBlue * (180 / Math.PI);

        electricSkeRed.node.position = redItem.node.position;
        electricSkeBlue.node.position = blueItem.node.position;

        let dis = Math.abs(redItem.node.position.x - blueItem.node.position.x) / (redItem.node.getContentSize().width * 1);
        electricSkeRed.node.scaleY = dis;
        electricSkeBlue.node.scaleY = dis;

        electricSkeRed.node.rotation = 90 - degRed;
        electricSkeBlue.node.rotation = 90 - degBlue;

        // if (boneRed) {
        //     boneRed.rotation = degRed;

        //     let dis = cc.Vec2.distance(redItem.node.position, blueItem.node.position);
        //     boneRed.x = dis;

        // }
        // if (boneBlue) {
        //     boneBlue.rotation = degBlue;

        //     let dis = cc.Vec2.distance(redItem.node.position, blueItem.node.position);
        //     boneBlue.x = dis;

        // }



    }

    removeAllChild() {
        this.node.destroyAllChildren();
    }

}
