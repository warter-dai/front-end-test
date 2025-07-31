<template>
  支持图片拖拽，旋转 <br />长按图片拖拽 鼠标移动到图片右下角，出现旋转光标后可旋转
  <div class="panel">
    <div class="canvas-panel" ref="divRef">
      <canvas
        width="1000"
        height="500"
        ref="canvasRef"
        @mousemove="onMousemove"
        @mousedown="onSelectItem"
        @mouseup="onMouseup"
      ></canvas>
    </div>

    <div class="image-list">
      <div class="items" ref="itemsRef">
        <div class="image-item" v-for="image in imagesList" :key="image.uid">
          <img v-if="image.width" :width="image.width" :height="image.height" :src="image.url" />
        </div>
      </div>
      <div class="btn">
        <ElUpload
          :on-change="onUploadChange"
          v-model="fileList"
          :auto-upload="false"
          multiple
          :show-file-list="false"
        >
          <ElIcon class="avatar-uploader-icon"><Plus /></ElIcon>
        </ElUpload>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElUpload, ElIcon } from 'element-plus'

const itemsRef = ref<HTMLElement>()
const divRef = ref<HTMLDivElement>()

// 图层列表
const imagesList = ref<Array<any>>([])
// 文件列表
const fileList = ref<Array<any>>([])
// 当前选中图层
const selectItem = ref()
// 记录选中图层后初始坐标
const startPoint = {
  x: 0,
  y: 0
}

const offset = 4
const fillRectSize = 4
// 是否选中图层
const isSelect = ref(false)

const canvasRef = ref<HTMLCanvasElement>()
// 图层初始大小
const imageSize = 200

const cursor = ref('')

/**
 * 判断图层是否被选中
 * @param x 焦点位置 x
 * @param y 焦点位置 y
 * @param item 图层
 */
const isSelectItem = (x: number, y: number, item: any) => {
  if (!item) return false
  // 还原当前坐标
  const rotatedPoint = getTransform(
    x - item.left - item.width * 0.5,
    y - item.top - item.height * 0.5,
    -item.rotate
  )

  return (
    item.left <= item.left + rotatedPoint.x + item.width * 0.5 &&
    item.left + item.width >= item.left + rotatedPoint.x + item.width * 0.5 &&
    item.top <= item.top + rotatedPoint.y + item.height * 0.5 &&
    item.top + item.height >= item.top + rotatedPoint.y + item.height * 0.5
  )
}

/**
 * 根据焦点位置获取选中图层
 * @param event
 */
const getSelectItem = (event: any) => {
  const offsetX = event.offsetX
  const offsetY = event.offsetY
  const length = imagesList.value.length

  let selectItem

  for (let i = 0; i < length; i++) {
    const item = imagesList.value[i]

    if (isSelectItem(offsetX, offsetY, item)) {
      selectItem = item
      break
    }
  }

  return selectItem
}

/**
 * 计算旋转后的坐标位置
 * @param x 旋转前X坐标（相对旋转中点）
 * @param y 旋转前Y坐标（相对旋转中点）
 * @param rotate 旋转角度
 */
const getTransform = (x: number, y: number, rotate: number) => {
  //将角度化为弧度
  const angle = (Math.PI / 180) * rotate
  const rotatedX = x * Math.cos(angle) - y * Math.sin(angle)
  const rotatedY = x * Math.sin(angle) + y * Math.cos(angle)

  return {
    x: rotatedX,
    y: rotatedY
  }
}

/**
 * 初始化焦点在选中图层中显示状态
 * @param selectItem
 * @param event
 */
const initCursor = (selectItem: any, event: any) => {
  if (!selectItem) {
    canvasRef.value!.style.cursor = ''
    return ''
  }
  const offsetX = event.offsetX
  const offsetY = event.offsetY

  const rotatedPoint = getTransform(
    offsetX - selectItem.left - selectItem.width * 0.5,
    offsetY - selectItem.top - selectItem.height * 0.5,
    -selectItem.rotate
  )

  const pointX = selectItem.left + selectItem.width
  const pointY = selectItem.top + selectItem.height
  const rotateOffsetX = selectItem.left + rotatedPoint.x + selectItem.width * 0.5
  const rotateOffsetY = selectItem.top + rotatedPoint.y + selectItem.height * 0.5

  if (
    rotateOffsetX >= pointX - 10 &&
    rotateOffsetX <= pointX &&
    rotateOffsetY >= pointY - 10 &&
    rotateOffsetY <= pointY
  ) {
    canvasRef.value!.style.cursor = 'ne-resize'
    return 'ne-resize'
  }

  if (!isSelect.value && isSelectItem(offsetX, offsetY, selectItem)) {
    canvasRef.value!.style.cursor = 'pointer'
    return 'pointer'
  }

  if (isSelect.value && isSelectItem(offsetX, offsetY, selectItem)) {
    canvasRef.value!.style.cursor = 'move'
    return 'move'
  }
  return ''
}

/**
 * 清除画布
 */
const clearRect = () => {
  const width = canvasRef.value?.width || 0
  const height = canvasRef.value?.height || 0
  const left = 0
  const top = 0
  const context = canvasRef.value?.getContext('2d')

  context?.clearRect(left - 10, top - 10, width + offset * 2 + 10, height + offset * 2 + 10)
}

// 画图
const drawImage = (item: any) => {
  const context = canvasRef.value?.getContext('2d')
  context?.save()
  // 计算旋转中心点
  const centerX = item.left + item.width / 2
  const centerY = item.top + item.height / 2
  // 变更原点至图片的中点
  context?.translate(centerX, centerY)
  //根据transform的旋转角度旋转坐标轴
  context?.rotate((item.rotate * Math.PI) / 180)
  //变更回来
  context?.translate(-centerX, -centerY)

  context!.font = '10px'
  context?.fillText(
    `left:${item.left} top:${item.top} width:${item.width} height:${item.height}`,
    item.left,
    item.top
  )

  context!.strokeStyle = 'green'
  context?.strokeRect(
    item.left + offset * 0.5,
    item.top + offset * 0.5,
    Number(item.width.toFixed(0)) + offset,
    Number(item.height.toFixed(0)) + offset
  )

  context!.fillStyle = 'green'
  context?.fillRect(item.left, item.top, fillRectSize, fillRectSize)
  context?.fillRect(item.left + (item.width + offset) * 0.5, item.top, fillRectSize, fillRectSize)
  context?.fillRect(item.left + item.width + offset, item.top, fillRectSize, fillRectSize)

  context?.fillRect(item.left, item.top + (item.height - offset) * 0.5, fillRectSize, fillRectSize)
  context?.fillRect(
    item.left + item.width + offset,
    item.top + (item.height - offset) * 0.5,
    fillRectSize,
    fillRectSize
  )

  context?.fillRect(
    item.left + (item.width + offset) * 0.5,
    item.top + item.height + offset,
    fillRectSize,
    fillRectSize
  )
  context?.fillRect(item.left, item.top + item.height + offset, fillRectSize, fillRectSize)
  context?.fillRect(
    item.left + item.width + offset,
    item.top + item.height + offset,
    fillRectSize,
    fillRectSize
  )

  context?.drawImage(
    item.img,
    item.left + offset,
    item.top + offset,
    Number(item.width.toFixed(0)),
    Number(item.height.toFixed(0))
  )
  context?.restore()
}

/**
 * 画图
 */
const drawImageAll = () => {
  const length = imagesList.value.length

  for (let i = length; i > 0; i--) {
    const item = imagesList.value[i - 1]
    drawImage(item)
  }
}

const setPoint = (item: any, event: any) => {
  //计算位移
  const moveWidth = event.offsetX - startPoint.x
  const moveHeight = event.offsetY - startPoint.y
  item.top = item._top + moveHeight
  item.left = item._left + moveWidth
}

/** 点击图层 */
const onSelectItem = (event: any) => {
  selectItem.value = getSelectItem(event)

  if (selectItem.value) {
    const nodes = itemsRef.value?.children
    if (nodes && nodes.length > 0) {
      nodes[imagesList.value.indexOf(selectItem.value)].scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      })
    }

    isSelect.value = true
    //记录起始位置
    startPoint.x = event.offsetX
    startPoint.y = event.offsetY
    // 记录原始坐标
    selectItem.value._left = selectItem.value.left
    selectItem.value._top = selectItem.value.top
    selectItem.value._rotate = selectItem.value.rotate

    // imagesList.value.splice(imagesList.value.indexOf(selectItem.value), 1)
    // imagesList.value.unshift(selectItem.value)
    clearRect()
    drawImageAll()
    cursor.value = initCursor(selectItem.value, event)
  } else {
    isSelect.value = false
  }
}

/** 鼠标松开事件 */
const onMouseup = (event: any) => {
  // canvasRef.value!.style.cursor = ''
  isSelect.value = false
  selectItem.value = null
  const moveItem = getSelectItem(event)
  cursor.value = initCursor(moveItem, event)
}

/** 焦点移动 */
const onMousemove = (event: any) => {
  const moveItem = getSelectItem(event)

  if (!isSelect.value) {
    cursor.value = initCursor(moveItem, event)
    return
  }

  if (cursor.value === 'move') {
    //计算位移
    setPoint(selectItem.value, event)
  } else if (cursor.value === 'ne-resize') {
    const { centerX, centerY } = selectItem.value as {
      centerY: number
      centerX: number
    }

    // 计算鼠标点击时所在弧度
    const angleBefore =
      (Math.atan2(
        startPoint.y - centerY - selectItem.value.top,
        startPoint.x - centerX - selectItem.value.left
      ) /
        Math.PI) *
      180

    // 计算当前鼠标焦点弧度
    const angleAfter =
      (Math.atan2(
        event.offsetY - centerY - selectItem.value.top,
        event.offsetX - centerX - selectItem.value.left
      ) /
        Math.PI) *
      180
    console.log(angleAfter - angleBefore)
    // 鼠标所在位置弧度 - 鼠标点击时弧度 = 实际移动弧度
    selectItem.value.rotate = selectItem.value._rotate + angleAfter - angleBefore
  }
  requestAnimationFrame(() => {
    // 清除画布
    clearRect()
    drawImageAll()
  })
}

/** 图片选中 */
const onUploadChange = (uploadFile: any) => {
  const imageUrl = URL.createObjectURL(uploadFile.raw)
  const img = new Image()
  img.src = imageUrl

  // 新增图片初始位置
  const offsetTop = imagesList.value.length > 0 ? imagesList.value[0].top + 50 : 0
  const offsetLeft = imagesList.value.length > 0 ? imagesList.value[0].left + 50 : 0

  const item = reactive({
    url: imageUrl,
    top: offsetTop,
    left: offsetLeft,
    width: 0,
    height: 0,
    scaling: 1,
    uid: uploadFile.uid,
    img: img,
    centerX: 0,
    centerY: 0,
    rotate: 0,
    _rotate: 0
  })

  img.onload = () => {
    const width = img.width
    const height = img.height

    if (width <= imageSize && width <= imageSize) {
      item.width = width
      item.height = height
      item.centerX = item.width * 0.5
      item.centerY = item.height * 0.5

      drawImage(item)
      return
    }

    if (width > height) {
      item.scaling = imageSize / width
      item.width = imageSize
      item.height = height * item.scaling
    } else {
      item.scaling = imageSize / height
      item.height = imageSize
      item.width = width * item.scaling
    }
    item.centerX = item.width * 0.5
    item.centerY = item.height * 0.5
    drawImage(item)
  }

  imagesList.value.unshift(item)
}

onMounted(() => {
  // 计算画板的宽度和高度
  canvasRef.value!.width = divRef.value?.offsetWidth || 0
  canvasRef.value!.height = divRef.value?.offsetHeight || 0
})
</script>

<style scoped lang="less">
.panel {
  display: flex;
  align-items: stretch;

  .canvas-panel {
    flex: 1;
    height: 100%;
    border: 1px solid #ccc;
    margin: 5px 10px;
  }

  .image-list {
    width: 224px;
    border: 1px solid #ccc;
    padding: 10px;

    display: flex;
    align-items: center;
    align-content: center;

    flex-direction: column;

    .items {
      overflow-y: auto;
      overflow-x: hidden;
      flex: 1;
      display: flex;
      align-items: center;
      flex-direction: column;
    }

    .image-item {
      margin: 5px;
    }
  }
}
</style>
