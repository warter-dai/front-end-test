<template>
  <canvas
    ref="canvasRef"
    @mousemove="onMousemove"
    @mousedown="onMousedown"
    @mouseup="onMouseup"
  ></canvas>
  <video ref="videoRef" autoplay muted style="display: none"></video>
  <div>
    <ElButton @click="onScreenShot" size="small" type="primary">截图</ElButton>
    <ElButton @click="onTest" size="small" type="primary">test</ElButton>
  </div>
</template>
<script setup lang="ts">
import { ElButton } from "element-plus";

import { ref } from "vue";

const canvasRef = ref<HTMLCanvasElement>();

const videoRef = ref<HTMLVideoElement>();
const imageRef = ref();

const onScreenShot = async () => {
  if (!videoRef.value) return;

  const mediaStream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
  });

  videoRef.value.srcObject = mediaStream;

  videoRef.value.onloadedmetadata = async () => {
    videoRef.value?.play();
    if (!canvasRef.value) return;
    // 全屏显示
    await window.document.body.requestFullscreen();

    canvasRef.value.width = window.document.body.offsetWidth;
    canvasRef.value.height = window.document.body.offsetHeight;

    const context = canvasRef.value.getContext("2d");

    context?.drawImage(
      videoRef.value!,
      0,
      0,
      canvasRef.value.width,
      canvasRef.value.height
    );

    mediaStream.getTracks().forEach((item) => {
      item.stop();
    });

    const image = new Image();
    image.src = canvasRef.value.toDataURL("image/png");

    image.onload = () => {
      imageRef.value = image;
    };
  };
};

const isStar = ref(false);

const startPoint = {
  x: 0,
  y: 0,
};

const onMousemove = (event: MouseEvent) => {
  //

  if (!isStar.value) return;
  const point = {
    x: event.offsetX,
    y: event.offsetY,
  };

  if (!canvasRef.value) return;

  const context = canvasRef.value.getContext("2d");
  if (!context) return;
  context.save();
  context.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  context.drawImage(
    imageRef.value,
    0,
    0,
    canvasRef.value.width,
    canvasRef.value.height
  );
  context.strokeStyle = "green";
  context.strokeRect(
    Math.min(point.x, startPoint.x),
    Math.min(point.y, startPoint.y),
    Math.max(point.x, startPoint.x) - Math.min(point.x, startPoint.x),
    Math.max(point.y, startPoint.y) - Math.min(point.y, startPoint.y)
  );

  context?.restore();
};

const onMousedown = (event: MouseEvent) => {
  isStar.value = true;
  //记录起始位置
  startPoint.x = event.offsetX;
  startPoint.y = event.offsetY;
};

const onMouseup = () => {
  isStar.value = false;
};

const quickFun = (arr: Array<number>): Array<number> => {
  if (arr.length === 0 || arr.length === 1) return arr;

  const index = Math.floor((Math.random() * arr.length) / 2);
  const base = arr.splice(index, 1)[0];
  const letfArr = [];
  const rightArr = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > base) {
      rightArr.push(arr[i]);
    } else {
      letfArr.push(arr[i]);
    }
  }
  console.log("base:" + base + letfArr.concat([base], rightArr));
  return quickFun(letfArr).concat([base], quickFun(rightArr));
};

const onTest = () => {
  console.log(quickFun([1, 34, 12, 43, 2, 6, 9, 0, 121, 45, 4, 7, 1]));
};
</script>
<style lang="scss" scoped></style>
