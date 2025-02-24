// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import SoundController from "../Manager/SoundController";
import { AudioPlayId } from "../Core/audio/AudioPlayId";
import Utils from "../Utils/Utils";
import { clientEvent } from "../Core/observer/clientEvent";
import { EventName } from "../Manager/EventName";
import InfoBarController from "./InfoBarController";
import RootData from "../Manager/RootData";
import { E_BOARD_MODE } from "./BoardUI";
import { E_LAYOUT_MODE } from "./LayoutModeController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MultiplierInfo extends cc.Component {
    @property(cc.Node)
    multiBarNormalNode: cc.Node = null;

    @property(cc.Node)
    multiBarFreeSpinNode: cc.Node = null;

    @property(sp.Skeleton)
    dragonSpine: sp.Skeleton = null;


    currentMultiNode: cc.Node = null;

    protected onEnable(): void {
        // this.multiplierLabel.string = "";
        clientEvent.on(EventName.InitDefaultMulti, this.initDefaultMulti, this);
        clientEvent.on(EventName.ResetValuetMulti, this.resetMultiplier, this);
    }

    protected onDisable(): void {
        // this.multiplierLabel.string = "";
        clientEvent.off(EventName.InitDefaultMulti, this.initDefaultMulti, this);
        clientEvent.off(EventName.ResetValuetMulti, this.resetMultiplier, this);
    }

    initDefaultMulti(layoutMode: E_LAYOUT_MODE) {
        this.multiBarNormalNode.active = layoutMode == E_LAYOUT_MODE.NORMAL;
        this.multiBarFreeSpinNode.active = layoutMode == E_LAYOUT_MODE.FREESPIN;
        this.currentMultiNode = layoutMode == E_LAYOUT_MODE.NORMAL ? this.multiBarNormalNode : this.multiBarFreeSpinNode;
        this.resetMultiplier();
    }

    resetMultiplier() {       
        let isDragonFly = false;
        this.currentMultiNode.children.forEach((node, index) => {
            if (index != 0) {
                let nodeActive = node.children[0].getChildByName("active number light");
                if(!isDragonFly && nodeActive.active){
                    this.dragonSpine.node.active = true;
                    this.dragonSpine.setAnimation(0, "animation", false);
                    this.dragonSpine.setCompleteListener((trackEntry) => {
                        if (trackEntry.animation.name == "animation") {
                            this.dragonSpine.node.active = false;
                        }
                    });
                    isDragonFly = true;
                }
                nodeActive.active = false;
            }
        });
    }
    activeMultiplier(multi: number) {
        if((this.multiBarNormalNode.active && multi != 1) || (this.multiBarFreeSpinNode.active && multi != 3)){
            let nodeActive = this.currentMultiNode.getChildByName("x" + multi + "Bar").children[0].getChildByName("active number light");
            if(nodeActive){
                nodeActive.active = true;
            
                let particleNode = nodeActive.getChildByName("particle");
                if(particleNode){
                    particleNode.active = true;
                    particleNode.getComponent(cc.ParticleSystem).resetSystem();
                }
            }           
        }
    }

}
