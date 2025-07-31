<template>
  <video ref="videoRef" width="500" height="500" autoplay muted controls="true"></video>

  <ElButton @click="onPlay" size="small" type="primary">连接</ElButton>

  <ElButton @click="onPlay" size="small" type="primary">关闭</ElButton>
</template>
<script setup lang="ts">
import { ref } from 'vue'

const videoRef = ref<HTMLVideoElement>()

const onPlay = () => {
  const ws = new WebSocket('ws://localhost:8080/user')

  //   ws.binaryType = 'arraybuffer'

  ws.onopen = function (event) {
    console.log('WebSocket is open now.')
  }

  ws.onmessage = function (event) {
    // 处理接收到的视频流数据
    const videoData = event.data
    console.log('Received video data:', videoData)
    const blob = new Blob([event.data], { type: 'video/mp4' })
    const url = URL.createObjectURL(blob)
    videoRef.value!.src = url

    videoRef.value!.onloadedmetadata = () => {
      videoRef.value?.play()
    }
  }

  ws.onclose = function (event) {
    console.log('WebSocket is closed now.')
  }
}
</script>
