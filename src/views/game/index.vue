<template>
  <div class="panel-main">
    <div class="views">
      <div>
        <canvas
          class="panel"
          :width="config.width"
          :height="config.height"
          ref="canvasRef"
        ></canvas>
      </div>
      <div>
        <!-- <ElButton @click="onAddView" size="small" type="primary"
          >添加图形</ElButton
        > -->

        <ElButton
          @click="onStart"
          size="small"
          type="primary"
          :disabled="gameStatus === 'start' || gameStatus === 'gameOver'"
          >开始</ElButton
        >
        <ElButton
          @click="onStop"
          size="small"
          type="primary"
          :disabled="gameStatus === 'stop' || gameStatus === 'gameOver'"
          >暂停</ElButton
        >

        <ElButton @click="onNewGame" size="small" type="primary">新游戏</ElButton>

        得分：{{ score }} 等级：{{ level }} 速度：{{ speed }} <br />
        操作说明：键盘按键‘←’ ‘→’分别控制左右移动，‘↓’控制加速向下移动，空格键控制变形
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ElButton } from 'element-plus'

import { ref, reactive, computed } from 'vue'
import { configOpt } from './config'

import { cloneDeepWith } from 'lodash'

const config = reactive(configOpt)

const gameStatus = ref<'start' | 'stop' | 'default' | 'gameOver'>('default')

const score = ref(0)

const level = computed(() => {
  if (score.value <= 1000) {
    return 0
  }

  return Math.ceil((score.value - 1000) / 200)
})

const speed = computed(() => {
  let val = 60 - Math.floor(level.value / 4)
  if (val <= 3) {
    val = 3
  }
  return val * 16.7
})

const defaultLeft = computed(() => {
  const width = config.width / config.defaultSize
  return Math.floor(width * 0.5)
})
const maxWidth = computed(() => {
  return config.width / config.defaultSize - 1
})

const maxHeight = computed(() => {
  return config.height / config.defaultSize - 1
})

const context2D = computed(() => {
  return canvasRef.value?.getContext('2d')
})

const canvasRef = ref<HTMLCanvasElement>()

/**
 * 判断是否出现重叠
 * @param component
 * @param pointX x坐标
 * @param pointY y坐标
 */
const isCollision = (component: any, pointX: any, pointY: any) => {
  const items = component.items as Array<any>
  const points = config.points as Array<any>

  // 判断组件在当前坐标下是否存在重叠区域
  return items.some((item) => {
    const flag = points.findIndex((point) => {
      const status =
        point.x === (item.x + pointX) * config.defaultSize &&
        point.y === (item.y + pointY) * config.defaultSize
      return status
    })

    return flag >= 0
  })
}

/**
 * 判断是否在视图内
 * @param component
 * @param pointX
 * @param pointY
 */
const isInView = (component: any, pointX: any, pointY: any) => {
  const items = component.items as Array<any>

  return items.every((item) => {
    const left = pointX + item.x
    const top = pointY + item.y

    return left >= 0 && left <= maxWidth.value && top >= 0 && top <= maxHeight.value
  })
}

/**
 * 绘制组件
 * @param component
 */
const draw = (component: any) => {
  const items = component.items as Array<any>
  const context = context2D.value
  context!.fillStyle = component.color
  context!.strokeStyle = 'green'

  items.forEach((item) => {
    context?.strokeRect(
      (component.left + item.x) * config.defaultSize,
      (component.top + item.y) * config.defaultSize,
      config.defaultSize,
      config.defaultSize
    )
    context?.fillRect(
      (component.left + item.x) * config.defaultSize,
      (component.top + item.y) * config.defaultSize,
      config.defaultSize,
      config.defaultSize
    )
  })
}

/**
 * 绘制已激活点
 */
const drawPoint = () => {
  const items = config.points as Array<any>
  const context = context2D.value
  context!.fillStyle = '#ccc'
  context!.strokeStyle = 'green'

  items.forEach((item) => {
    context!.fillStyle = item.color
    context?.strokeRect(item.x, item.y, config.defaultSize, config.defaultSize)
    context?.fillRect(item.x, item.y, config.defaultSize, config.defaultSize)
  })
}

/**
 * 清除画布
 */
const clearRect = () => {
  const context = context2D.value
  context?.clearRect(0, 0, config.width, config.height)
}

/** 判断是否允许下降 */
const isCanDow = () => {
  const flag = isInView(
    config.workComponent,
    config.workComponent.left,
    config.workComponent.top + 1
  )
  if (!flag) return false
  const status = isCollision(
    config.workComponent,

    config.workComponent.left,
    config.workComponent.top + 1
  )
  if (status) return false
  return true
}

/** 随机生成图形组件 */
const createView = () => {
  const randomNumber = Math.floor(Math.random() * config.components.length)
  const component = cloneDeepWith(config.components[randomNumber]) as any
  //
  const componentIndex = Math.floor(Math.random() * component.childs.length)
  component.items = cloneDeepWith(component.childs[componentIndex].items)
  component.index = componentIndex
  component.color = config.colors[Math.floor(Math.random() * config.colors.length)]
  const status = isCollision(component, defaultLeft.value - Math.floor(component.width * 0.5), 0)

  if (status) return

  return component
}

/** 标记满行 */
const initFullRows = () => {
  const points = config.points as Array<any>

  const fullRows: number[] = []

  for (let i = 0; i <= maxHeight.value; i++) {
    const items = points.filter((item) => {
      return item.y / config.defaultSize === i
    })

    if (items.length === maxWidth.value + 1) {
      fullRows.push(i)

      items.forEach((item) => {
        item.isClear = true
      })
    }
  }

  return fullRows
}

/** 定时器列表 */
const sleepList = ref<Array<any>>([])

const sleep = async (timeSpan: number) => {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      // 清空当前定时器
      clearTimeout(timer)
      sleepList.value?.splice(sleepList.value.indexOf(timer), 1)
      resolve(true)
    }, timeSpan)

    sleepList.value?.push(timer)
  })
}

const clearSleep = () => {
  sleepList.value?.forEach((item) => {
    clearTimeout(item)
  })
  sleepList.value = []
}

/** 清除满行记录 */
const clearPoint = async () => {
  const items = config.points as Array<any>

  config.points = items.filter((item) => {
    return !item.isClear
  }) as any
}

/**
 * 指定行开始所有激活点Y轴下降一格
 * @param startIndex
 */
const lowerLine = (startIndex: number) => {
  const points = config.points as Array<any>
  points.forEach((item) => {
    //判断当前激活点是否在消除行上面
    if (item.y / config.defaultSize < startIndex) {
      // 下降一格
      item.y += config.defaultSize
    }
  })
}

const lowerLines = (rowIndexs: Array<number>) => {
  rowIndexs.forEach((index) => {
    lowerLine(index)
  })
}

/** 清除行效果 */
const drawClearView = (rows: Array<number>) => {
  const context = context2D.value
  context!.globalAlpha = 0.5
  context!.fillStyle = 'red'

  rows.forEach((row) => {
    context?.fillRect(
      0,
      row * config.defaultSize,
      config.defaultSize * (maxWidth.value + 1),
      config.defaultSize
    )
  })
  context!.globalAlpha = 1
}

const onStart = async () => {
  if (gameStatus.value === 'start') return
  gameStatus.value = 'start'

  if (config.workComponent.items.length === 0) {
    onAddView()
  }

  while (gameStatus.value) {
    if (gameStatus.value !== 'start') {
      break
    }
    try {
      await sleep(speed.value)
    } catch (err) {
      console.log(err)
    } finally {
      // console.log('ok')
    }

    if (isCanDow()) {
      onDown()
      continue
    }
    // 添加到已激活点
    addPoints()
    // 标记需要清除的点
    const rows = initFullRows()

    if (rows.length > 0) {
      score.value += 100 * Math.pow(2, rows.length - 1)
      drawClearView(rows)
      try {
        await sleep(speed.value)
      } catch (err) {
        console.log(err)
      } finally {
        // console.log('ok')
      }
      clearPoint()
      lowerLines(rows)
    }

    // 绘图
    drawView()
    // 重新生成新组件
    onAddView()
  }
}

/** 绘制组件 */
const drawView = () => {
  const context = context2D.value
  context?.save()
  clearRect()

  draw(config.workComponent)
  drawPoint()
  context?.restore()
}

const addPoints = () => {
  if (config.workComponent.items.length > 0) {
    const items = cloneDeepWith(config.workComponent.items) as Array<any>
    const points = config.points as Array<any>
    items.forEach((item) => {
      item.x = (config.workComponent.left + item.x) * config.defaultSize
      item.y = (config.workComponent.top + item.y) * config.defaultSize
      item.color = config.workComponent.color

      points.push(cloneDeepWith(item))
    })
  }
}

const onRotate = () => {
  const component = cloneDeepWith(config.workComponent)

  component.index += 1
  if (component.index >= component.childs.length) {
    component.index = 0
  }
  const child = component.childs[component.index] as any
  component.items = cloneDeepWith(child.items)
  const status = isCollision(component, component.left, component.top)
  if (status) return
  const flag = isInView(component, component.left, component.top)
  if (!flag) return
  config.workComponent = component

  drawView()
}

const onNewGame = async () => {
  gameStatus.value = 'default'
  config.points = []
  config.workComponent.items = []
  score.value = 0

  drawView()
  clearSleep()
  onStart()
}

const onStop = () => {
  gameStatus.value = 'stop'
}

const onAddView = () => {
  const component = createView()
  if (!component) {
    gameStatus.value = 'gameOver'
    score.value = 0
    return
  }

  score.value += 10

  config.workComponent = component as any
  config.workComponent.left = defaultLeft.value - Math.floor(config.workComponent.width * 0.5)
  config.workComponent.top = 0

  drawView()
}

const onDown = () => {
  const flag = isInView(
    config.workComponent,
    config.workComponent.left,
    config.workComponent.top + 1
  )
  if (!flag) return
  const status = isCollision(
    config.workComponent,

    config.workComponent.left,
    config.workComponent.top + 1
  )
  if (status) return
  config.workComponent.top += 1
  drawView()
}

const onLeft = () => {
  const flag = isInView(
    config.workComponent,
    config.workComponent.left - 1,
    config.workComponent.top
  )
  if (!flag) return
  const status = isCollision(
    config.workComponent,

    config.workComponent.left - 1,
    config.workComponent.top
  )
  if (status) return
  config.workComponent.left -= 1
  drawView()
}

const onRight = () => {
  const flag = isInView(
    config.workComponent,
    config.workComponent.left + 1,
    config.workComponent.top
  )
  if (!flag) return
  const status = isCollision(
    config.workComponent,

    config.workComponent.left + 1,
    config.workComponent.top
  )
  if (status) return
  config.workComponent.left += 1
  drawView()
}

document.addEventListener('keydown', (e) => {
  const key = e.code
  switch (key) {
    case 'Space':
      onRotate()
      break
    case 'ArrowRight':
      onRight()
      break
    case 'ArrowDown':
      onDown()
      break
    case 'ArrowLeft':
      onLeft()
      break
    default:
      break
  }
})
</script>
<style lang="less" scoped>
.panel-main {
  display: flex;
  align-items: center;
  flex-direction: column;

  .views {
    display: flex;

    .panel {
      border: 1px solid #ccc;
    }
  }
}
</style>
