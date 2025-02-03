import ParasiteComponent, { override } from "./ParasiteComponent";

const RichTextChildImageName = "RICHTEXT_Image_CHILD";
const { ccclass, property, executeInEditMode } = cc._decorator;

@ccclass
@executeInEditMode
export default class RichTextTemplateConfig extends ParasiteComponent<cc.RichText> {


    @property([cc.Sprite])
    public spriteNodes: cc.Sprite[] = [];

    @override
    get imageAtlas(): cc.SpriteAtlas {
        // return this.super ?  (this.super['imageAtlas'] || {getSpriteFrame: this.getOrLoadSpriteFrame.bind(this)} as cc.SpriteAtlas) : null;
        return this['_imageAtlas'] || { getSpriteFrame: this.getOrLoadSpriteFrame.bind(this) } as cc.SpriteAtlas;
    }

    set imageAtlas(value: cc.SpriteAtlas) {
        this['_imageAtlas'] = value;
    }

    getOrLoadSpriteFrame(spriteFramePath: string): cc.SpriteFrame {

        return this.spriteNodes[0].spriteFrame;
    }
    //  -------------------

    @property({
        serializable: true,
        visible: false
    })
    _imageAtlas: cc.SpriteAtlas = null;



    @property({
        type: cc.Node,
        visible() {
            return !this.prefabTemplate;
        },
    })
    nodeTemplate: cc.Node = null;

    @property({
        type: cc.Prefab,
        visible() {
            return !this.nodeTemplate;
        },
    })
    prefabTemplate: cc.Prefab = null;

    @property({
        // serializable:true,
        visible: false
    })
    patternNode: cc.Node = null;

    // @property({
    //     type:[cc.Node]
    // })
    // styles:cc.Node[] = [];

    protected _currentImageStyleIndex: number = 0;

    protected start(): void {
        // this.patternNode = this.prefabTemplate ? this.prefabTemplate.data : this.nodeTemplate;
        // this.patternNode.getComponentsInChildren(Sprite)

    }

    /**
     * At Runtime, this method override _needsUpdateTextLayout method of native RichText Component.
     * @param newTextArray 
     * @returns 
     */
    @override
    _needsUpdateTextLayout(newTextArray: any[]): boolean {
        // Reset style
        this._currentImageStyleIndex = 0;
        return this.super['_needsUpdateTextLayout'](newTextArray);
    }

    @override
    _applyTextAttribute(labelNode: cc.Node, string: string, force: boolean) {
        this.super['_applyTextAttribute'](labelNode, string, force)
        if (this.enabled) {
            let lb = labelNode.getComponent(cc.Label);
            lb.spacingX = 100
        }
    }



    /**
     * Runtime override _addRichTextImageElement method of native RichText Component.
     * @param richTextElement 
     * @returns 
     */
    @override
    _addRichTextImageElement(richTextElement: any) {
        // const textArray:any[] = this.super['_textArray']
        const numOfSegment: number = this.super['_labelSegments'].length;
        // cc.log('numOfSegment :: ' + numOfSegment)
        this.super['_addRichTextImageElement'](richTextElement);
        // cc.log(numOfSegment + ' update !!!' + this.super['_labelSegments'].length)
        if (this.enabled && this.super['_labelSegments'].length == (numOfSegment + 1)) {
            // cc.log('add 1 segment')
            const spriteNode: cc.Node = this.super['_labelSegments'][numOfSegment];
            this.applyImageAttibuteFromTemplate(spriteNode);
        }
    }

    // ---------------------------------------

    /**
     * 
     * @returns 
     */
    protected getPatternSprite(): cc.Sprite {
        const sprites: cc.Sprite[] = this.spriteNodes;
        if (sprites) {
            const currentIndex: number = this._currentImageStyleIndex;
            this._currentImageStyleIndex++;
            this._currentImageStyleIndex = this._currentImageStyleIndex % sprites.length;
            return sprites[currentIndex]
        }
        return
    }

    protected getPatternLabel(): cc.Label {

        return
    }

    /**
     * 
     * @param spriteNode 
     */
    protected applyImageAttibuteFromTemplate(spriteNode: cc.Node) {
        const patternSprite: cc.Sprite = this.getPatternSprite();
        const patternNode: cc.Node = patternSprite.node;
        if (patternNode && patternSprite && spriteNode) {
            // const patternSprite:cc.Sprite = patternNode.getComponent(cc.Sprite);
            // if(patternSprite){
            spriteNode.scale = patternNode.scale;
            spriteNode.color = patternNode.color;
            spriteNode.opacity = patternNode.opacity;
            spriteNode.skewX = patternNode.skewX;
            spriteNode.skewY = patternNode.skewY;
            spriteNode.setAnchorPoint(new cc.Vec2(spriteNode.getAnchorPoint().x, patternNode.getAnchorPoint().y))
            // 
            let quat: cc.Quat = new cc.Quat();
            patternNode.getRotation(quat)
            spriteNode.setRotation(quat)
            spriteNode.setContentSize(patternNode.getContentSize());
            const spriteSegment: cc.Sprite = spriteNode.getComponent(cc.Sprite);
            spriteSegment.srcBlendFactor = patternSprite.srcBlendFactor;
            spriteSegment.dstBlendFactor = patternSprite.dstBlendFactor;
            spriteSegment.trim = patternSprite.trim;
            spriteSegment.type = patternSprite.type;
            spriteSegment.sizeMode = patternSprite.sizeMode;
            patternSprite.getMaterials().forEach((material: cc.MaterialVariant, index: number) => {
                spriteSegment.setMaterial(index, material)
            });
            // }
        }
    }



}
