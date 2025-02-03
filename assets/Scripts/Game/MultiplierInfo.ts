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

const { ccclass, property } = cc._decorator;

@ccclass
export default class MultiplierInfo extends cc.Component {

    @property(cc.Label)
    multiplierLbRed: cc.Label = null;

    @property(cc.Label)
    multiplierLbPurple: cc.Label = null;

    @property(cc.Label)
    multiplierLbGreen: cc.Label = null;

    // @property(sp.Skeleton)
    // skeletonRed: sp.Skeleton = null;
    //
    // @property(sp.Skeleton)
    // skeletonPurple: sp.Skeleton = null;
    //
    // @property(sp.Skeleton)
    // skeletonGreen: sp.Skeleton = null;

    @property([cc.Node])
    listPartical: cc.Node[] = [];

    @property(cc.Label)
    multiplierLabel: cc.Label = null;

    @property(sp.Skeleton)
    FX_multiplier: sp.Skeleton = null;

    @property(sp.Skeleton)
    FX_total_multiplier: sp.Skeleton = null;

    @property(InfoBarController)
    infoBar: InfoBarController = null;

    // @property(cc.Node)
    // helicopterNode: cc.Node = null;

    // @property(cc.Node)
    // totalMultiplierPos: cc.Node = null;

    @property(cc.Node)
    infoBarNode: cc.Node = null;

    oldPumpkinMul: number[] = [1, 1, 1];
    pumpkinMul: number[];
    posItemCollects: cc.Vec3[][];
    oldpumpkinCollec : number[] = [0,0,0];
    pumpkinCollec: number[];
    totalWin: number;
    array: any[];
    tmpWinAmount: number;
    totalWin2: number;
    protected onEnable(): void {
        // this.multiplierLabel.string = "";
        clientEvent.on(EventName.InitDefaultMulti, this.initDefaultMulti, this);
    }
    

    // reset(data){
    //     this.oldPumpkinMul = data;
    //     this.pumpkinMul = data;
    //     this.oldpumpkinCollec = [0,0,0];
    //     this.pumpkinCollec = [0,0,0];
    // }

    protected onDisable(): void {
        // this.multiplierLabel.string = "";
        // clientEvent.off(EventName.InitDefaultMulti, this.initDefaultMulti, this);
    }

    // shootingHelicopterEffect(gunNode): Promise<any>{
    //     return new Promise((resolve: Function) => {
    //         let bullet = cc.instantiate(this.listPartical[1]);
    //         let pos = this.node.convertToNodeSpaceAR(gunNode);

    //         this.node.addChild(bullet);
    //         bullet.position = pos;
    //         SoundController.inst.MainAudio.playAudio(AudioPlayId.sfx_ShootingHelicopter);
    //         this.playParticleAnimPromise(bullet, pos, cc.v2(this.totalMultiplierPos.position.x, this.totalMultiplierPos.position.y)).then(()=>{
    //             let helicopterSke = this.helicopterNode.getComponent(sp.Skeleton);
    //             helicopterSke.setAnimation(0, "fx", false);
    //             helicopterSke.addAnimation(0, "idle", true);
    //             helicopterSke.setCompleteListener((trackEntry) => {
    //                 if (trackEntry['animation']['name'] == "fx") {
    //                     resolve();
    //                 }
    //             });

    //             // bullet.removeFromParent();
    //         });
    //     });
    // }
    initDefaultMulti(multiNumber){
        this.multiplierLabel.string = "X" + multiNumber;
    }
    showMultiplyWinPromise(posItemMultiplier, totalWinMultiplier, total_win): Promise<any> {  
        let arrProms: Promise<any>[] = [];
        cc.log("this.listPartical: ",this.listPartical);
        //show multiply animation
        posItemMultiplier.forEach((element, index) => {
            let nodeX = cc.instantiate(this.listPartical[2]);
            this.node.addChild(nodeX);
            let pos = this.node.convertToNodeSpaceAR(element);
            nodeX.position = pos;
            arrProms.push(this.playParticleAnimPromise(nodeX, cc.v2(pos.x, pos.y), cc.v2(this.multiplierLabel.node.x, this.multiplierLabel.node.y)));
        });
        

        return Promise.all(arrProms).then(()=>{
            this.multiplierLabel.node.active = true;
            this.multiplierLabel.string = "X" + totalWinMultiplier;
            if(posItemMultiplier.length > 0){
                this.FX_total_multiplier.node.active = true;
                this.FX_total_multiplier.setAnimation(0,"animation",false);                   
            }

            // if(this.totalWin > 0)
            //     return this.checkShowMultiplyWinPromise();
            // else
            //     return Promise.resolve();
        });
        // this.totalWin = total_win*totalWinMultiplier;
            
    }

    playParticleAnimPromise(new_particle, srcWorldPos: cc.Vec2, dstWorldPos: cc.Vec2, callBack: Function = null): Promise<any> {
        return new Promise((resolve: Function) => {
            //spawn new particle from template

            new_particle.setPosition(srcWorldPos);
            Utils.changeParent(new_particle, this.node);
            const dest_local_pos1 = dstWorldPos;
            const src_local_pos1 = new_particle.getPosition();
            const c1: cc.Vec2 = new cc.Vec2(.5, .19).multiply(dest_local_pos1.sub(src_local_pos1)).add(src_local_pos1);
            const c2: cc.Vec2 = new cc.Vec2(.82, .46).multiply(dest_local_pos1.sub(src_local_pos1)).add(src_local_pos1);
            cc.Tween.stopAllByTarget(new_particle);
            new_particle.stopAllActions();
            cc.tween(new_particle)
                .delay(.2)
                .call(() => {
                    SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxMulti);
                    // new_particle.getComponent(cc.ParticleSystem).resetSystem();
                    // new_particle.active = true;
                })
                .bezierTo(.5, c1, c2, dest_local_pos1)  //particle fly from collect item -> coin
                .delay(.2)
                .call(() => {
                    // Utils.changeParent(this.particleNode, this.node);
                    if (callBack) callBack();
                    // resolve();
                })
                // .delay(0.3)
                .call(() => {
                    //clean up
                    new_particle.removeFromParent(true);
                    resolve();
                })
                .start();
        });
    }

    setUpFlyMultiplier(pumpkinMul, posItemCollects: cc.Vec3[][], pumpkinCollec: number[],totalWin:number,tmpWinAmount:number,total_win2:number) {
        if (this.pumpkinMul) this.oldPumpkinMul = this.pumpkinMul.map(x=>x);
        if (this.pumpkinCollec) this.oldpumpkinCollec = this.pumpkinCollec.map(x=>x);
        this.pumpkinMul = pumpkinMul;
        this.posItemCollects = posItemCollects;
        this.pumpkinCollec = pumpkinCollec;
        this.totalWin = totalWin;
        this.tmpWinAmount = tmpWinAmount;
        this.totalWin2 = total_win2
    }

    async actionEffect(): Promise<any> {
        const total_bet = RootData.instance.gamePlayData.getCurBet() || 0;//GameController.instance.getCurBet();
        let animationCanBePlayed =  this.totalWin2 <= total_bet ? false : true;


        let prom_arrTotal: Promise<any>[] = [];
        let array:any[] = [];
        this.array = array
        for (let index = 0; index < this.posItemCollects.length; index++) {
            let arr = []
            if (this.posItemCollects[index].length > 0) {
             
                this.posItemCollects[index].forEach((element,index2) => {
                    let nodeX = cc.instantiate(this.listPartical[index]);
                    let pos = this.node.convertToNodeSpaceAR(element);
                    this.node.addChild(nodeX);
                    arr[index2] = (nodeX);
                    nodeX.position = pos;
                });
            }
            array.push(arr);

        }
        
       
        let totalMulti = this.oldPumpkinMul[0] * this.oldPumpkinMul[1] * this.oldPumpkinMul[2];
        if(totalMulti>1){
            
            this.infoBar.showWinInfo("info_bar_win_01", this.tmpWinAmount, animationCanBePlayed);
            await Utils.delayTime(0.5);
            await this.combineMultilerTotal(this.totalWin)
        }else{
            this.infoBar.showWinInfo("info_bar_win_01", this.totalWin, animationCanBePlayed);
            await Utils.delayTime(0.5);
        }

        for (let index = 0; index < this.posItemCollects.length; index++) {
            let prom_arr: Promise<any>[] = [];
            if (this.posItemCollects[index].length > 0) {
                let endPos = this.getPositionColor(index);
                this.posItemCollects[index].forEach((element,index2) => {
                    let nodeX = array[index][index2];
                    let pos = this.node.convertToNodeSpaceAR(element);


                    // nodeX.position = pos;
                    // this.node.addChild(nodeX);
                    prom_arr.push(this.playParticleAnimPromise(nodeX, cc.v2(pos.x, pos.y), endPos));
                });
                prom_arrTotal.push(Promise.all(prom_arr));


            }

        }
        if(prom_arrTotal.length > 0){
             setTimeout(() => {
                SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxMulti);
            }, 150);
        }

        return Promise.all(prom_arrTotal).then(()=>{
            console.log("asf")
        });

    }
    checkDefaut(){
        let prom_arrTotal: Promise<any>[] = [];
        this.array.forEach(element => {
            element.forEach(element2 => {
                element2.destroy();
            });
        });
        // prom_arrTotal.push(this.onChangeMultiplierRed(this.pumpkinMul[1], this.pumpkinCollec[1]))
           
        // prom_arrTotal.push(this.onChangeMultiplierPurple(this.pumpkinMul[0], this.pumpkinCollec[0]));
          
        // prom_arrTotal.push( this.onChangeMultiplierGreen(this.pumpkinMul[2], this.pumpkinCollec[2]));
        // return Promise.all(prom_arrTotal)
    }

    combineMultilerTotal(totalWin) {
        // this.totalWin = totalWin;

        let prom_arr: Promise<any>[] = [];
        let cloneLbRed = cc.instantiate(this.multiplierLbRed.node);
        let cloneLbPur = cc.instantiate(this.multiplierLbPurple.node);
        let clonelbGreen = cc.instantiate(this.multiplierLbGreen.node);

        this.node.addChild(cloneLbRed);
        this.node.addChild(cloneLbPur);
        this.node.addChild(clonelbGreen);

        let posEnd = cc.v2(this.multiplierLabel.node.x, this.multiplierLabel.node.y);

        prom_arr.push(this.playAnimMoveMutilerPromise(cloneLbRed, cc.v2(this.multiplierLbRed.node.x, this.multiplierLbRed.node.y), posEnd, () => {
            cloneLbRed.runAction(cc.scaleTo(0.15, 0));
        }));
        prom_arr.push(this.playAnimMoveMutilerPromise(cloneLbPur, cc.v2(this.multiplierLbPurple.node.x, this.multiplierLbPurple.node.y), posEnd,
            () => {
                cloneLbPur.runAction(cc.scaleTo(0.15, 0));
            }));
        prom_arr.push(this.playAnimMoveMutilerPromise(clonelbGreen, cc.v2(this.multiplierLbGreen.node.x, this.multiplierLbGreen.node.y), posEnd, () => {
            clonelbGreen.runAction(cc.scaleTo(0.15, 0));
        }));
        let totalMulti = this.oldPumpkinMul[0] * this.oldPumpkinMul[1] * this.oldPumpkinMul[2];

        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfx_MultiplierAward);
        return Promise.all(prom_arr).then(() => {
            this.multiplierLabel.node.active = true;
            this.multiplierLabel.string = "" + totalMulti;

            return this.checkShowMultiplyWinPromise();
        });
    }

    getPositionColor(idColor) {
        let pos: cc.Vec2
        switch (idColor) {
            case 1:
                pos = cc.v2(this.multiplierLbRed.node.x, this.multiplierLbRed.node.y);
                break;
            case 0:
                pos = cc.v2(this.multiplierLbPurple.node.x, this.multiplierLbPurple.node.y);
                break;
            case 2:
                pos = cc.v2(this.multiplierLbGreen.node.x, this.multiplierLbGreen.node.y);
                break;
        }
        return pos;
    }



    checkShowMultiplyWinPromise(totalWin:any = null): Promise<any> {
        return new Promise((resolve: Function) => {
            //show multiply animation


            this.totalWin = totalWin;
            let multiple_text = this.multiplierLabel.node;
            let org_parent = multiple_text.parent;
            let info_bar = this.infoBar.node;
            // Utils.changeParent(multiple_text, info_bar);

            let action_duration = .3;
            let org_pos = multiple_text.getPosition();
            let info_bar_pos = this.infoBarNode.getPosition();


            
            // SoundController.inst.playSFXMultiply();
            
            cc.Tween.stopAllByTarget(multiple_text);
            cc.tween(multiple_text)
            .to(0.1, { scale: 1 }, { easing: 'smooth' })
            .call(() => {
                // SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxMulti);
                // this.FX_total_multiplier.node.active = true;
                // this.FX_total_multiplier.setAnimation(0,"animation",false);                
            }).delay(0.6)
            .call(() => {
                SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxMulti);}
            )
                .to(action_duration, { x: info_bar_pos.x, y: info_bar_pos.y }, { easing: 'smooth' })
                .call(() => {
                    this.infoBar.showWinInfo("info_bar_win_02", this.totalWin, false, true);

                    //clone a multiple text on info bar
                    // this.FX_multiplier.node.active = true;
                    // this.FX_multiplier.setAnimation(0,"animation",false);

                    cc.tween(multiple_text).to(0.15, { scale: 1.3 }).call(() => {
                        let clone_multiple = cc.instantiate(multiple_text);
                        clone_multiple.scale = 1.5;
                        clone_multiple.opacity = 150;
                        clone_multiple.parent = info_bar;
                        clone_multiple.setPosition(cc.v2(0, 0));

                        cc.Tween.stopAllByTarget(clone_multiple);
                        cc.tween(clone_multiple)
                            .to(action_duration, { scale: 3 })
                            .to(action_duration, { opacity: 0 })
                            .removeSelf()
                            .call(() => {
                              
                            })
                            .start();

                    }).to(0.15, { scale: 1 }).call(() => {
                        cc.Tween.stopAllByTarget(multiple_text);
                        cc.tween(multiple_text)
                            .to(action_duration, { scale: 1, x: org_pos.x, y: org_pos.y, opacity: 255 })
                            .call(() => {
                                // Utils.changeParent(multiple_text, org_parent);
                            })
                            .delay(0.4)
                            .call(() => {
                                // this.multiplierLabel.node.active = false;
                                // this.multiplierLabel.node.scale = 0;
                                // this.FX_multiplier.node.active = false;
                                // this.FX_total_multiplier.node.active = false;
                                resolve();
                            })
                            .start();
                    }).start()
                })
                .start();
        }
        );
    }
    playAnimMoveMutilerPromise(new_particle, srcWorldPos: cc.Vec2, dstWorldPos: cc.Vec2, callBack: Function = null): Promise<any> {
        return new Promise((resolve: Function) => {
            //spawn new particle from template

            new_particle.setPosition(srcWorldPos);
            Utils.changeParent(new_particle, this.node);
            const dest_local_pos1 = dstWorldPos;
            const src_local_pos1 = new_particle.getPosition();
            const c1: cc.Vec2 = new cc.Vec2(.5, .19).multiply(dest_local_pos1.sub(src_local_pos1)).add(src_local_pos1);
            const c2: cc.Vec2 = new cc.Vec2(.82, .46).multiply(dest_local_pos1.sub(src_local_pos1)).add(src_local_pos1);
            cc.Tween.stopAllByTarget(new_particle);
            new_particle.stopAllActions();
            cc.tween(new_particle)
                .delay(.5)
                .call(() => {
                    // new_particle.getComponent(cc.ParticleSystem).resetSystem();
                    // new_particle.active = true;
                })
                .bezierTo(.5, c1, c2, dest_local_pos1)  //particle fly from collect item -> coin
                .delay(.05)
                .to(0.1, { scale: 0.1 }, { easing: 'smooth' })
                .call(() => {
                    //clean up
                    new_particle.removeFromParent(true);
                    resolve();
                })
                .delay(0.3)
                .start();
        });
    }
}
