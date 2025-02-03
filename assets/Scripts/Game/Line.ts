import Utils from "../Utils/Utils";
import { BOARDSIZE, LINE_ANIM_SPEED, LINE_WIDTH } from "./LineConfig";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Line extends cc.Component {

    static pool: cc.NodePool = null;

    @property(cc.Graphics)
    staticLine: cc.Graphics = null;

    @property(cc.Sprite)
    dynamicLineSprite: cc.Sprite = null;

    start() {

    }

    static instantiate(prefab: cc.Prefab) {
        if (!Line.pool) {
            Line.pool = new cc.NodePool('Line');
        }
        let lineNode = Line.pool.get();
        if (!lineNode) {
            lineNode = cc.instantiate(prefab)
        }
        let line = lineNode.getComponent(Line);
        return line;
    }

    remove() {
        Line.pool.put(this.node);
    }

    init() {

    };

    drawLines(positionList: Array<cc.Vec2>): Promise<any> {
        //show solid line immediately
        let graphic = this.staticLine;
        let localPos: cc.Vec2;

        positionList.forEach((pos, index) => {
            // cc.log("drawLines: ", pos);
            localPos = this.staticLine.node.convertToNodeSpaceAR(pos);
            if (index == 0) {
                graphic.moveTo(localPos.x, localPos.y);
            } else {
                graphic.lineTo(localPos.x, localPos.y);
            }
        })
        graphic.stroke();
        this.node.active = true;

        //dynamic, running line
        return this.drawLineAnimation(positionList);
    }

    drawLineAnimation(positionList: Array<cc.Vec2>): Promise<any> {
        return new Promise((resolve: Function) => {
            if (positionList.length < 2) {
                resolve();
                return;
            }
            const scale_factor = this.getFinalScaleFactor(this.dynamicLineSprite.node);
            let lineNode = this.dynamicLineSprite.node;
            lineNode.active = true;
            const startPos = this.node.convertToNodeSpaceAR(positionList[0]);
            lineNode.setPosition(startPos);
            let difVec = positionList[1].sub(positionList[0]).div(scale_factor);
            lineNode.angle = -cc.misc.radiansToDegrees(cc.v2(difVec).signAngle(cc.v2(1, 0)));
            const max_line_width = LINE_WIDTH * scale_factor;// Math.min(LINE_WIDTH, difVec.mag());
            let percent = max_line_width / difVec.mag();
            //clamp if it is the last line
            if (positionList.length == 2) {
                percent = Math.max(0, Math.min(1, percent));
            }
            lineNode.width = 0;
            positionList.shift();
            let cloneLine: cc.Node;
            cc.Tween.stopAllByTarget(lineNode);
            cc.tween(lineNode)
                //width from 0 to max line width
                .to(max_line_width / LINE_ANIM_SPEED, { width: max_line_width })
                //line end to end pos
                .to(difVec.mag() * (1 - percent) / LINE_ANIM_SPEED, { x: startPos.x + difVec.x * (1 - percent), y: startPos.y + difVec.y * (1 - percent) })
                .call(() => {
                    //clone the line anim, for fade out anim (the original line will be used for next line)
                    cloneLine = cc.instantiate(lineNode);
                    cloneLine.parent = lineNode.parent;
                    //width from max line width to 0
                    cc.tween(cloneLine)
                        .to(max_line_width / LINE_ANIM_SPEED, { width: 0, x: startPos.x + difVec.x, y: startPos.y + difVec.y })
                        .call(() => {
                            if (positionList.length < 2) {
                                resolve();
                            }
                            cloneLine.removeFromParent();
                        })
                        .start();
                    this.drawLineAnimation(positionList).then(resolve.bind(this));
                })
                //width from max line width to 0
                .to(max_line_width / LINE_ANIM_SPEED, { width: 0, x: startPos.x + difVec.x, y: startPos.y + difVec.y })
                .call(() => {
                    if (positionList.length < 2) {
                        resolve();
                    }
                })
                .start();
        });
    }

    hideLines() {
        this.staticLine.clear();
        this.node.active = false;
    }
    
    getFinalScaleFactor(node: cc.Node) {
        let currNode = node;
        let resultScale = currNode.scale;
        do {
            currNode = currNode.parent;
            if (!Utils.isEmpty(currNode))   resultScale *= currNode.scale;
        } while (!Utils.isEmpty(currNode) && currNode.parent != null);
        return resultScale;
    };

}
