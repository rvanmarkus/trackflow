import MusicTempo from 'music-tempo'
import { AudioContext } from 'web-audio-api'

export const analyzeBpm = (buffer: Buffer): Promise<number> => {
    const context = new AudioContext()
    return new Promise((resolve, reject) => {
      context.decodeAudioData(buffer, (data: any) => {
        try {
          const mt = new MusicTempo(data?.getChannelData(0));
          resolve(Math.round(mt.tempo))
        } catch (error) {
          reject(error);
        }
      })
  
    })
  }
  