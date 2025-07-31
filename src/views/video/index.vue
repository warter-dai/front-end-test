<template>
  <video width="500" height="500" ref="videoRef" autoplay muted controls="true"></video>
  <video width="500" height="500" ref="videoTestRef" autoplay muted controls="true"></video>
  <canvas
    ref="danmuRef"
    width="500"
    height="500"
    style="display: inline-block; position: relative; left: -500px"
  ></canvas>

  <ElButton @click="onPlay" size="small" type="primary">开始</ElButton>
  <ElButton @click="onSendDm" size="small" type="primary">发送弹幕</ElButton>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElButton } from 'element-plus'
import { Danmu } from './danmu'

const videoRef = ref<HTMLVideoElement>()
const videoTestRef = ref<HTMLVideoElement>()
const danmuRef = ref<HTMLCanvasElement>()

const dm = ref<Danmu>()

let webSocketClient: WebSocket

onMounted(() => {
  dm.value = new Danmu(danmuRef.value!, videoRef.value!)
  dm.value.init()
})

const getWebSocketClent = (url: string) => {
  const clent = new WebSocket(url)
}

const onPlay = async () => {
  const mediaStream = await window.navigator.mediaDevices.getUserMedia({
    audio: true,
    // video: true,
    video: {
      width: 500,
      height: 500
    }
  })
  if (!webSocketClient) {
    webSocketClient = new WebSocket('ws://localhost:8080/video?to=user')
  }

  const mediaRecorder = new MediaRecorder(mediaStream, { mimeType: 'video/webm;codecs=vp9' })

  webSocketClient.onopen = function (event) {
    console.log('WebSocket is open now.')

    mediaRecorder.ondataavailable = function (event) {
      if (event.data.size > 0) {
        // console.log(event.data)
        webSocketClient.send(event.data)

        const blob = new Blob([event.data], { type: mediaRecorder.mimeType })
        const url = URL.createObjectURL(blob)
        videoTestRef.value!.src = url
      }
    }
    mediaRecorder.start(25)
  }

  webSocketClient.onclose = function (event) {
    console.log('WebSocket is closed now.')
    mediaRecorder.stop()
  }

  videoRef.value!.srcObject = mediaStream
  videoRef.value!.onloadedmetadata = () => {
    if (mediaStream.active) {
      videoRef.value?.play()
    }
  }
}

const onSendDm = () => {
  dm.value!.send('弹幕1')
}
</script>

<style lang="less"></style>
