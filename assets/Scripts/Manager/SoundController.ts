import AudioManager from "../Core/audio/AudioManager";
import AudioPlayer from "../Core/audio/AudioPlayer";

const LOCAL_SOUND_CONFIG_KEY = 'isSoundOn';

const { ccclass, property } = cc._decorator;

@ccclass
export default class SoundController extends cc.Component {
    public static inst: SoundController = null;

    _isSoundOn: boolean = true;
    public get isSoundOn(): boolean { return this._isSoundOn };
    public set isSoundOn(value: boolean) {
        this._isSoundOn = value;
        AudioManager.EffectEnable = value;
        AudioManager.MusicEnable = value;
        cc.sys.localStorage.setItem(LOCAL_SOUND_CONFIG_KEY, value);
    };

    @property(AudioPlayer)
    public MainAudio: AudioPlayer = null;

    onLoad() {
        if (SoundController.inst) {
            console.error("Too many Sound Managers");
            return;
        }

        SoundController.inst = this;
        cc.game.addPersistRootNode(this.node);

        this.isSoundOn = this.getSavedSoundConfig();
    }

    public getSavedSoundConfig(): boolean {
        const saved_value = cc.sys.localStorage.getItem(LOCAL_SOUND_CONFIG_KEY);
        return saved_value == 'true' || saved_value == true || saved_value == null || saved_value == undefined;
    }

    public toggleSoundSettings() {
        this.isSoundOn = !this.isSoundOn;
    }



    // update (dt) {}
}
