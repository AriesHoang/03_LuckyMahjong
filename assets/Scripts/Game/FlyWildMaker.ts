// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { AudioPlayId } from "../Core/audio/AudioPlayId";
import { SpinResultInfo } from "../Data/GamePlay/BoardData";
import { Cfg } from "../Manager/Config";
import SoundController from "../Manager/SoundController";
import Utils from "../Utils/Utils";
import { DataItemsFly } from "./BoardMode/BoardNormalMode";
import ItemSymbol from "./ItemSymbol";
import ItemWildFly from "./ItemWildFly";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FlyWildMaker extends cc.Component {

    @property(cc.Prefab)
    preFabWild: cc.Prefab = null;

    @property(cc.Node)
    parentBug: cc.Node = null;

    @property(cc.Node)
    boneBug: cc.Node = null;

    @property(sp.Skeleton)
    skeParentBug: sp.Skeleton = null;
    listItem: cc.Node[] = [];
    timeAimWild = 0;
    arr_promise: Promise<any>[] = [];
    index: number = 0
    Items: DataItemsFly[];

    resolve
    protected start(): void {
        this.timeAimWild = this.skeParentBug.findAnimation("wild").duration;
    }

    async onHaveSpinResultInfo(spinResultInfo: SpinResultInfo, Items: DataItemsFly[]): Promise<any> {
        return new Promise((resolve: Function) => {
            this.arr_promise = [];
            this.index = 0;
            this.Items = Items;
            // const element = Items[index];

            // this.playBug().then(() => {
            //     if (index > Items.length) return
            //     this.arr_promise.push(this.createAFlyWild(element.pos, 1, 0, element.item))
            //     this.playBug().then()
            // });
            this.resolve = resolve;
            this.loop()

            // return Promise.all(this.arr_promise).then(() => {
            //     resolve();
            // })
            // }


        });
    }
    loop() {
        if (this.index >= this.Items.length) {
            // this.skeParentBug.setAnimation(0, "idle", false);
            Promise.all(this.arr_promise).then(() => {
                this.resolve();
            });
            return;
        };


        this.playBug().then(() => {

            this.index++;
            this.loop();
        });

    }
    playBug(): Promise<any> {
        return new Promise((resolve: Function) => {
            SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxGambleEnterBg);
            this.skeParentBug.setAnimation(0, "wild", false);
            const element = this.Items[this.index];

            // object.setPosition(0, 0);

            // this.skeParentBug.setCompleteListener((trackEntry) => {
            //     if (trackEntry['animation']['name'] == "wild") {
            //         // let Worldpos: cc.Vec3 = object.parent.convertToWorldSpaceAR(object.position)
            //         // let localPos: cc.Vec3 = this.node.convertToNodeSpaceAR(Worldpos);

            //     }
            // });
            this.scheduleOnce(() => {
                var object = cc.instantiate(this.preFabWild)
                this.node.addChild(object);
                object.position = this.parentBug.position
                // let Worldpos: cc.Vec3 = object.parent.convertToWorldSpaceAR(object.position)
                // let localPos: cc.Vec3 = this.node.convertToNodeSpaceAR(Worldpos);

                // Utils.changeParent(object, this.node)


                this.arr_promise.push(this.createAFlyWild(object, object.position, element.pos, 1, 0, element.item))


            }, 0.2)
            this.scheduleOnce(() => {
                resolve()
            }, 0.8)
        })

    }

    createAFlyWild(object, startPoint, _endPoint: cc.Vec2, timeDuration = 0.7, delayTime = 0, item: ItemSymbol): Promise<any> {
        return new Promise((resolve: Function) => {

            var duration = timeDuration; // Thời gian di chuyển (đơn vị: giây)
            // var startPoint = cc.v2(this.parentBug.x, this.parentBug.y); // Điểm đầu

            let endPoint = this.node.convertToNodeSpaceAR(_endPoint);

            let dir1 = Utils.randomFromTo(0, 1) == 0 ? 1 : -1
            let dir2 = Utils.randomFromTo(0, 1) == 0 ? 1 : -1

            // let dir1 = _endPoint.x >= 0 ? 1 : -1
            // let dir2 = Utils.randomFromTo(0, 1) == 0 ? 1 : -1

            // Tìm các điểm kiểm soát
            let controlPoint1 = startPoint.add(cc.v2(100 * dir1, Math.random() * 100)); // điểm kiểm soát 1
            let controlPoint2 = endPoint.add(cc.v2(100 * dir2, Math.random() * 100));
            // điểm kiểm soát 2


            // var object = cc.instantiate(this.preFabWild) // Đối tượng cần di chuyển
            // this.node.addChild(object);
            this.listItem.push(object);
            object.position = this.parentBug.position;
            // object.opacity = 0;
            let itemComp: ItemWildFly = object.getComponent(ItemWildFly)

            var bezierAction = cc.bezierTo(duration, [controlPoint1, controlPoint2, endPoint]);

            itemComp.playFlyStartWild().then(() => {
                itemComp.playFlyingWild();
                object.runAction(cc.sequence(cc.delayTime(delayTime), cc.callFunc(() => {
                    // object.opacity = 255;

                    
                }), bezierAction, cc.callFunc(() => {
                    // object.parent = item.node
                    SoundController.inst.MainAudio.playAudio(AudioPlayId.sfx_Wild);
                    itemComp.playFlyEndWild().then(resolve());
                })));
            })


        })


    }

    rest() {
        while (this.listItem.length > 0) {
            let a = this.listItem.pop();
            a.destroy()
        }
    }

    protected update(dt: number): void {

    }

}
