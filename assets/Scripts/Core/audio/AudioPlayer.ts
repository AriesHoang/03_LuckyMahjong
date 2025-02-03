
const FADE_IN_DURATION = 0.2;
const FADE_OUT_DURATION = 4;
const SFX_FADE_OUT_DURATION = 1;

import AudioManager from "./AudioManager";
import { AudioPlayId } from "./AudioPlayId";

const { ccclass, property } = cc._decorator;

@ccclass('AudioObject')
export class AudioObject {

    @property({
        type: cc.Enum(AudioPlayId)
    })
    name: AudioPlayId = AudioPlayId.none;

    @property({
        type: cc.AudioClip
    })
    audioClip: cc.AudioClip = null;

    @property(cc.Boolean)
    isMusic: boolean = false;
}

export class AudioPlay {
    audioId: number;
    volume: number;
    isMusic: boolean;

    constructor(_audioId: number, _volume: number, _isMusic) {
        this.audioId = _audioId;
        this.volume = _volume;
        this.isMusic = _isMusic;
    }
}


@ccclass
export default class AudioPlayer extends cc.Component {

    @property([AudioObject])
    private arrayAudioObj: AudioObject[] = [];

    private maps: Map<AudioPlayId, AudioObject> = null;

    private arrayMusic: AudioPlay[] = [];
    private arrayEffect: AudioPlay[] = [];

    private _ambienceSFXID: number = null;


    playAudio(name: AudioPlayId, loop: boolean = false, volume: number = 1): AudioPlay {
        let audioObj = this.getAudioObject(name);
        cc.log("playAudio: " + AudioPlayId[name]);
        if (!audioObj) {
            cc.error('playAudio: ' + name);
            return null;
        }

        let audioPlay;
        // cc.log(AudioPlayId[name] + " - playAudio: ", audioObj);
        if (audioObj.isMusic) {
            if (!audioObj.audioClip) return audioPlay = new AudioPlay(-1, 0, false);
            this.stopAllMusic();
            let id = cc.audioEngine.playMusic(audioObj.audioClip, true,);
            audioPlay = new AudioPlay(id, volume, true);
            this.arrayMusic.push(audioPlay);
            if (!AudioManager.MusicEnable)
            this.pauseMusic();

        } else {
            if (!audioObj.audioClip || !AudioManager.EffectVolume) return audioPlay = new AudioPlay(-1, 0, false);
            let id = cc.audioEngine.play(audioObj.audioClip, loop,
                volume * AudioManager.RealEffectVolume);
            audioPlay = new AudioPlay(id, volume, false);
            this.arrayEffect.push(audioPlay);
        }

        return audioPlay;
    }

    stopAudioPlay(audioPlay: AudioPlay) {
        if (!audioPlay) return;
        if (audioPlay.isMusic) {
            let id = this.arrayMusic.indexOf(audioPlay);
            if (id !== -1) {
                cc.audioEngine.stop(audioPlay.audioId);
                this.arrayMusic.splice(id, 1);
            }

        } else {
            let id = this.arrayEffect.indexOf(audioPlay);
            if (id !== -1) {
                cc.audioEngine.stop(audioPlay.audioId);
                this.arrayEffect.splice(id, 1);
            }
        }
    }

    setAudioPlayVolume(audioPlay: AudioPlay, volume: number) {
        audioPlay.volume = volume;
        if (audioPlay.isMusic) {
            cc.audioEngine.setVolume(audioPlay.audioId,
                volume * AudioManager.RealMusicVolume);

        } else {
            cc.audioEngine.setVolume(audioPlay.audioId,
                volume * AudioManager.RealEffectVolume);
        }
    }

    setVolume(volume: number) {
        this.setMusicVolume(volume);
        this.setEffectVolume(volume);
    }

    setMusicVolume(volume: number) {
        this.arrayMusic.forEach((audioPlay) => {
            cc.audioEngine.setVolume(audioPlay.audioId,
                audioPlay.volume * volume);
        });
    }

    setEffectVolume(volume: number) {
        this.arrayEffect.forEach((audioPlay) => {
            cc.audioEngine.setVolume(audioPlay.audioId,
                audioPlay.volume * volume);
        });
    }

    stopAllAudio() {
        this.stopAllEffect();
        this.stopAllMusic();
    }

    stopAllMusic() {
        cc.audioEngine.stopMusic();
        // this.arrayMusic.forEach((audioPlay) => {
        //     cc.audioEngine.stop(audioPlay.audioId);
        // });
        // this.arrayMusic = [];
    }

    stopAllEffect() {
        this.arrayEffect.forEach((audioPlay) => {
            cc.audioEngine.stop(audioPlay.audioId);
        });
        this.arrayEffect = [];
    }

    getAudioObject(name: AudioPlayId) {
        if (!this.maps) {
            this.initMaps();
        }
        return this.maps.get(name);
    }

    initMaps() {
        this.maps = new Map<AudioPlayId, AudioObject>();

        // cc.log(this.arrayAudioObj);

        this.arrayAudioObj.forEach((obj, i) => {
            // cc.log('initMaps: ' + obj.name + ' ' + i);
            this.maps.set(obj.name, obj);
        });
    }

    public isMusicPlaying() {
        return cc.audioEngine.isMusicPlaying();
    }

    public fadeInMusic(duration: number = null) {
        if (!AudioManager.MusicEnable) {
            return;
        }
        if (duration == null) {
            duration = FADE_IN_DURATION;
        }
        this.unscheduleAllCallbacks();
        let volume = 0;
        cc.audioEngine.setMusicVolume(volume);
        const fadeInFn = function (dt) {
            volume += dt / FADE_IN_DURATION;
            if (volume > 1) {
                cc.audioEngine.setMusicVolume(1);
                this.unschedule(fadeInFn);
            } else {
                cc.audioEngine.setMusicVolume(volume);
            }
        };
        this.schedule(fadeInFn, 0);
    }

    public fadeOutMusic(duration: number = null) {
        if (!AudioManager.MusicEnable) {
            return;
        }
        if (duration == null) {
            duration = FADE_OUT_DURATION;
        }
        this.unscheduleAllCallbacks();
        let volume = 1;
        cc.audioEngine.setMusicVolume(volume);
        const fadeOutFn = function (dt) {
            volume -= dt / FADE_OUT_DURATION;
            if (volume < 0) {
                cc.audioEngine.setMusicVolume(0);
                this.unschedule(fadeOutFn);
            } else {
                cc.audioEngine.setMusicVolume(volume);
            }
        };
        this.schedule(fadeOutFn, 0);
    }

    public fadeOutSFX(audioPlay: AudioPlay, duration: number = null) {
        if (!AudioManager.EffectEnable || !audioPlay.audioId) {
            return;
        }
        if (duration == null) {
            duration = SFX_FADE_OUT_DURATION;
        }
        let volume = cc.audioEngine.getVolume(audioPlay.audioId);
        if (volume <= 0) {
            return;
        }
        let objTween = { startVal: volume };
        cc.Tween.stopAllByTarget(objTween);
        cc.tween(objTween)
            .to(duration, { startVal: 0 }, {
                progress: (start, end, current, ratio) => {
                    cc.audioEngine.setVolume(audioPlay.audioId, current);
                    return start + (end - start) * ratio;
                }
            })
            .call(() => {
                cc.audioEngine.stop(audioPlay.audioId);
                cc.audioEngine.setVolume(audioPlay.audioId, 1);
            })
            .start();
    }

    public stopMusic() {
        cc.audioEngine.stopMusic();
    }

    public stopSound(audioId) {
        cc.log("stopSound: " + audioId);
        cc.audioEngine.stopEffect(audioId);
    }

    public playSFXAmbience() {
        this._ambienceSFXID = this.playAudio(AudioPlayId.sfxAmbience, true).audioId;
        if (!AudioManager.MusicEnable)
            this.pauseSFXAmbience();
    }

    public pauseMusic() {
        cc.audioEngine.pauseMusic();
        //pause ambience sfx if any
        this.pauseSFXAmbience();
    }

    public resumeMusic() {
        if (AudioManager.MusicEnable) {
            cc.audioEngine.resumeMusic();
            //resume ambience sfx if Main BGM is playing
            this.resumeSFXAmbience();
        }
    }

    public resumeSFXAmbience() {
        if (AudioManager.MusicEnable){
            cc.audioEngine.resumeEffect(this._ambienceSFXID);
        }
    }

    public pauseSFXAmbience() {
        cc.audioEngine.pauseEffect(this._ambienceSFXID)
    }


    protected onLoad(): void {
        AudioManager.add(this);
    }

    protected onDestroy(): void {
        AudioManager.remove(this);
        this.stopAllAudio();
    }
}
