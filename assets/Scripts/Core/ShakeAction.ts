import Utils from "../Utils/Utils";


const { ccclass, property } = cc._decorator;

@ccclass
export default class ShakeAction extends cc.ActionInterval {

    initialX: number = 0;
    initialY: number = 0;
    strengthX: number = 0;
    strengthY: number = 0;
    // nodes: cc.Node[] = [];
    posNodes: cc.Vec2[] = [];

    constructor() {
        super();
        this.initialX = 0;
        this.initialY = 0;
    }

    static create(duration: number, strengthX: number, strengthY: number): ShakeAction {
        let action = new ShakeAction();
        action.strengthX = strengthX;
        action.strengthY = strengthY;
        action.initWithDuration(duration);
        // action.nodes = nodes;
        return action;
    }

    initWithDuration(duration: number): boolean {
        if (super["initWithDuration"](duration, this)) {
            return true;
        }
        return false;
    }

    startWithTarget(target: cc.Node) {
        super["startWithTarget"](this, target);
        this.setTarget(target);
        this.initialX = target.getPosition().x;
        this.initialY = target.getPosition().y;
        // for (let index = 0; index < this.nodes.length; index++) {
        //     this.posNodes[index] = this.nodes[index].getPosition();
        // }
    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    update(dt) {
        if (!this.getTarget())
            return;
        let randx = Utils.randomFromTo(-this.strengthX, this.strengthX);
        let randy = Utils.randomFromTo(-this.strengthY, this.strengthY);
        let old_pos = this.getTarget().getPosition();
        this.getTarget().setPosition(old_pos.x + randx, old_pos.y + randy);
        // for (const iterator of this.nodes) {
        //     let old_pos_item = iterator.getPosition();
        //     iterator.setPosition(old_pos_item.x + randx, old_pos_item.y + randy);
        // }
    }

    stop() {
        if (this.getTarget()) {
            // this.getTarget().setPosition(this.initialX, this.initialY);
            this.getTarget().setPosition(0, 0);

            // for (let index = 0; index < this.nodes.length; index++) {
            //     const element = this.posNodes[index];
            //     this.nodes[index].setPosition(element);
            // }
        }

        super["stop"](this);
    }
}
