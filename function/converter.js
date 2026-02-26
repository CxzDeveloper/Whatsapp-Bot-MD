import { promises } from 'fs'
import { join } from 'path'
import { spawn } from 'child_process'

const AUDIO_CODEC = 'libmp3lame'
const VIDEO_CODEC = 'libx264'
const OPUS_CODEC = 'libopus'
const GIF_CODEC = 'fps=15,scale=512:-1:flags=lanczos'

async function writeFile(tmp, buffer) {
    await promises.writeFile(tmp, buffer)
}

async function ffmpeg(buffer, args, ext, outputExt) {
    const tmp = join(global.__dirname(import.meta.url), '../tmp', Date.now() + '.' + ext)
    const out = tmp + '.' + outputExt

    await writeFile(tmp, buffer)

    const proc = spawn('ffmpeg', ['-y', '-i', tmp, ...args, out])

    await new Promise((resolve, reject) => {
        proc.on('error', reject)
        proc.on('close', (code) => {
            if (code !== 0) reject(new Error('FFmpeg gagal'))
            else resolve()
        })
    })

    const data = await promises.readFile(out)
    return {
        data,
        filename: out,
        delete: async () => await promises.unlink(out)
    }
}

async function toAudio(buffer, ext) {
    return ffmpeg(buffer, [
        '-vn',
        '-c:a', AUDIO_CODEC,
        '-b:a', '128k',
        '-ar', '44100',
        '-ac', '2',
        '-f', 'mp3'
    ], ext, 'mp3')
}

async function toPTT(buffer, ext) {
    return ffmpeg(buffer, [
        '-vn',
        '-c:a', OPUS_CODEC,
        '-b:a', '32k',
        '-vbr', 'on',
        '-ar', '48000',
        '-ac', '1',
        '-application', 'voip',
        '-f', 'opus'
    ], ext, 'opus')
}

async function toGif(buffer, ext) {
    return ffmpeg(buffer, [
        '-vf', GIF_CODEC,
        '-loop', '0',
        '-c:v', 'gif'
    ], ext, 'gif')
}

async function toVideo(buffer, ext) {
    return ffmpeg(buffer, [
        '-c:v', VIDEO_CODEC,
        '-c:a', 'aac',
        '-b:a', '128k',
        '-ar', '44100',
        '-crf', '32',
        '-preset', 'slow'
    ], ext, 'mp4')
}

export {
    toAudio,
    toPTT,
    toVideo,
    toGif,
    ffmpeg
}