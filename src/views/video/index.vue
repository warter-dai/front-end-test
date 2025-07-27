<template>
  <video width="500" height="500" ref="videoRef" autoplay muted></video>
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
import { onMounted, ref } from "vue";
import { ElButton } from "element-plus";
import { Danmu } from "./danmu";

const videoRef = ref<HTMLVideoElement>();
const danmuRef = ref<HTMLCanvasElement>();

const dm = ref<Danmu>();

onMounted(() => {
  dm.value = new Danmu(danmuRef.value!, videoRef.value!);
  dm.value.init();
});

const onPlay = async () => {
  // const devices = await navigator.mediaDevices.enumerateDevices();
  // let facingMode = {
  //   exact: "",
  // };
  // devices.forEach((device) => {
  //   if (
  //     device.kind === "videoinput" &&
  //     device.label.toLowerCase().includes("front")
  //   ) {
  //     facingMode = { exact: device.deviceId };
  //   }
  // });

  const mediaStream = await window.navigator.mediaDevices.getUserMedia({
    audio: true,
    // video: true,
    video: {
      width: 500,
      height: 500,
    },
  });

  videoRef.value!.srcObject = mediaStream;
  videoRef.value!.onloadedmetadata = () => {
    if (mediaStream.active) {
      videoRef.value?.play();
    }
  };
};

const onSendDm = () => {
  dm.value!.send("弹幕1");
};
</script>

<style lang="scss"></style>
