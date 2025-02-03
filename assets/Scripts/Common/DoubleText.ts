import { Cfg } from "../Manager/Config";
import TextController from "../Manager/TextController";
import StageLoadingFont, { FontCategory } from "./Multilingual/StageLoadingFont";
import WordWrap from "./WordWrap";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DoubleText extends WordWrap {
    private innerLabel: cc.Label = null;
    private selfLabel: cc.Label = null;

    @property()
    public useKey: boolean = false;
    @property({
        type: cc.String,
        visible() {
            return this.useKey
        },
    })
    public key = "";

    @property()
    public imageNeeded: boolean = false;
    @property({
        type: cc.SpriteFrame,
        visible() {
            return this.imageNeeded
        },
    })
    public spriteFrame: cc.SpriteFrame = null;

    @property()
    public useStringKey: boolean = false;

    @property()
    isUpperCase = false;

    @property()
    extraLineHeight: boolean = false;
    @property({
        type: String,
        visible() {
            return this.extraLineHeight
        },
    })
    public language: String[] = [];
    @property({
        type: Number,
        visible() {
            return this.extraLineHeight
        },
    })
    public lineHeight: number[] = [];

    @property()
    needShadow = false;

    @property()
    public maxCharLength: number = 1;

    protected onLoad(): void {

        this.selfLabel = this.getComponent(cc.Label);
        if(this.useKey)
        this.selfLabel.font = StageLoadingFont.getFont(FontCategory.Main);

        if (this.extraLineHeight) {
            let langInd = this.language.indexOf(Cfg.language, 0);
            if (langInd > -1 && this.lineHeight[langInd]) {
                this.selfLabel.lineHeight += this.lineHeight[langInd];
            }
        }

        let selfOutline = this.getComponent(cc.LabelOutline);
        let selfShadow = this.getComponent(cc.LabelShadow);
        if (selfShadow && selfOutline) {

            let innerNode = new cc.Node();
            this.innerLabel = innerNode.addComponent(cc.Label);
            innerNode.anchorX = this.node.anchorX;
            innerNode.anchorY = this.node.anchorY;
            if(this.useKey)
            this.innerLabel.font = StageLoadingFont.getFont(FontCategory.Main);
            else{
                this.innerLabel.font = this.selfLabel.font;
            }
            this.innerLabel.node.color = this.selfLabel.node.color;
            this.innerLabel.node.width = this.node.width;
            this.innerLabel.node.height = this.node.height;

            this.innerLabel.horizontalAlign = this.selfLabel.horizontalAlign;
            this.innerLabel.verticalAlign = this.selfLabel.verticalAlign;
            this.innerLabel.fontSize = this.selfLabel.fontSize;
            this.innerLabel.lineHeight = this.selfLabel.lineHeight;
            this.innerLabel.overflow = this.selfLabel.overflow;
            this.innerLabel.enableWrapText = this.selfLabel.enableWrapText;
            this.innerLabel.string = this.selfLabel.string;

            let inner_outline = this.innerLabel.node.addComponent(cc.LabelOutline);
            inner_outline.color = selfOutline.color;
            inner_outline.width = selfOutline.width;

            this.innerLabel.node.x = selfShadow.offset.x;
            this.innerLabel.node.y = -selfShadow.offset.y;

            if (this.needShadow) {
                selfShadow.enabled = true;
                selfOutline.enabled = true;
            } else {
                this.node.color = selfShadow.color;
                selfOutline.color = selfShadow.color;
                selfShadow.enabled = false;
            }

            this.node.addChild(innerNode);
        }

    }

    start(): void {
        if (this.useKey && this.key.length) {
            let text = TextController.getRawText(this.key);
            this.wrapText(text);
        } else if (this.useStringKey && this.selfLabel.string.length) {
            let text = TextController.getRawText(this.selfLabel.string);
            this.wrapText(text);
        }
    }

    protected wrapText(text: string) {

        let ind = this.excludeWrapLang.indexOf(Cfg.language)
        if (ind > -1) {
            this.selfLabel.enableWrapText = true;
            if (this.innerLabel)
                this.innerLabel.enableWrapText = true;
            return;
        } else {
            this.selfLabel.enableWrapText = false;
            if (this.innerLabel)
                this.innerLabel.enableWrapText = false;
        }
        let str = text;
        if (this.maxCharLength != -1) {
            str = this.wordwrap(text, this.maxCharLength);
        }
        str = this.isUpperCase ? str.toUpperCase() : str;

        this.selfLabel.string = str;
        this.selfLabel['_forceUpdateRenderData'](true);
        if (this.innerLabel) {
            this.innerLabel.string = str;
            this.innerLabel['_forceUpdateRenderData'](true);
        }

        if (this.imageNeeded) {
            let singleCharW = this.selfLabel.node.width / this.selfLabel.string.length;
            let space = "       ";
            let split1 = str.indexOf("<");
            let split2 = str.indexOf(">") + 1;

            let tmp1 = str;
            let tmp2 = str;
            let str1 = tmp1.substring(0, split1);
            let str2 = tmp2.substring(split2);

            if (Cfg.language == 'ja')
                space = "    ";
            else if (Cfg.language == 'ro')
                space = "          ";
            else if (Cfg.language == 'hu')
                space = "          ";

            str = str1 + space + str2;

            this.selfLabel.string = str;
            this.selfLabel['_forceUpdateRenderData'](true);
            if (this.innerLabel) {
                this.innerLabel.string = str;
                this.innerLabel['_forceUpdateRenderData'](true);
            }

            let sym = new cc.Node();
            let scale = 0.2;
            sym.addComponent(cc.Sprite).spriteFrame = this.spriteFrame;
            let pos = (singleCharW * str1.length) + (sym.width * scale) / 2;
            sym.setPosition(cc.v2(pos, 0));
            sym.setScale(scale);
            this.node.addChild(sym);
        }
    }

    public setText(text: string) {

        let str = this.isUpperCase ? text.toUpperCase() : text;
        this.selfLabel.string = str;
        this.selfLabel['_forceUpdateRenderData'](true);
        if (this.innerLabel) {
            this.innerLabel['_forceUpdateRenderData'](true);
            this.innerLabel.string = str;
        }
    }
}