import AudioPlayer from "./AudioPlayer";


export default class AudioManager {

    private static _MusicVolume: number = 1;
    private static _EffectVolume: number = 1;

    private static _MusicEnable: boolean = true;
    private static _EffectEnable: boolean = true;

    private static arrAudioPlayer: AudioPlayer[] = [];

    public static get RealMusicVolume() {
        if (!AudioManager._MusicEnable) {
            return 0;
        }
        return AudioManager._MusicVolume;
    }

    public static get RealEffectVolume() {
        if (!AudioManager._EffectEnable) {
            return 0;
        }
        return AudioManager._EffectVolume;
    }

    public static get MusicVolume() {
        return AudioManager._MusicVolume;
    }

    public static set MusicVolume(volume: number) {
        AudioManager._MusicVolume = volume;
        AudioManager.arrAudioPlayer.forEach((audioPlayer) => {
            audioPlayer.setMusicVolume(volume);
        });
    }

    public static get EffectVolume() {
        return AudioManager._EffectVolume;
    }

    public static set EffectVolume(volume: number) {
        AudioManager._EffectVolume = volume;
        AudioManager.arrAudioPlayer.forEach((audioPlayer) => {
            audioPlayer.setEffectVolume(volume);
        });
    }

    public static get EffectEnable() {
        return AudioManager._EffectEnable;
    }

    public static set EffectEnable(enable: boolean) {
        AudioManager._EffectEnable = enable;
        let volume = enable ? AudioManager._EffectVolume : 0;
        AudioManager.arrAudioPlayer.forEach((audioPlayer) => {
            audioPlayer.setEffectVolume(volume);
        });
    }

    public static get MusicEnable() {
        return AudioManager._MusicEnable;
    }

    public static set MusicEnable(enable: boolean) {
        AudioManager._MusicEnable = enable;
        let volume = enable ? AudioManager._MusicVolume : 0;
        AudioManager.arrAudioPlayer.forEach((audioPlayer) => {
            audioPlayer.setVolume(volume);
        });
    }

    static add(audioPlayer: AudioPlayer) {
        AudioManager.arrAudioPlayer.push(audioPlayer);
    }

    static remove(audioPlayer: AudioPlayer) {
        let id = AudioManager.arrAudioPlayer.indexOf(audioPlayer);
        if (id !== -1) {
            AudioManager.arrAudioPlayer.splice(id, 1);
        }
    }
}
