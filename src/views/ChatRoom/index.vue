<template>
  <section id="chatroom" class="chatroom-panel">
    <section class="user-list">
      <el-card
        body-style="width: 100%;display: flex;align-items: center;"
        class="user-item"
        :shadow="selectUser === item ? 'always' : 'hover'"
        v-for="item in userData"
        :key="item.name"
        @click="openTab(item)"
      >
        <el-avatar
          :size="50"
          src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
        />
        <span class="user-name">{{ item.name }}</span>
      </el-card>
    </section>
    <section class="chatroom-msage-panel">
      <section ref="msgRef" class="msg">
        <div
          class="user-msg"
          v-for="item in mesages"
          :key="item.userId"
          :class="{ admin: !item.isAdmin, client: item.isAdmin }"
        >
          <div class="user-msg-content" v-if="!item.isAdmin" style="margin-right: 5px">
            <div class="content"> {{ item.msg }}</div>
            <div class="arrow left"></div>
          </div>
          <el-avatar
            :size="20"
            src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
          />
          <div class="user-msg-content" v-if="item.isAdmin" style="margin-right: 5px">
            <div class="arrow right"></div>
            <div class="content"> {{ item.msg }}</div>
          </div>
        </div>
      </section>
      <section class="send">
        <el-input
          v-model="sendMsg"
          :autosize="{ minRows: 4, maxRows: 4 }"
          type="textarea"
          placeholder="Please input"
        />
      </section>
      <section class="btns">
        <ElButton @click="onSend" size="small" type="primary" :disabled="!selectUser || !sendMsg"
          >发送</ElButton
        >
      </section>
    </section>
  </section>
</template>
<script setup lang="ts">
import { nextTick, ref } from 'vue'

import { ElButton, ElAvatar, ElInput, ElCard, ElPopover } from 'element-plus'
import { useRoute } from 'vue-router'
const route = useRoute()

const sendMsg = ref('')
const msgRef = ref<HTMLDivElement>()

const userData = ref([
  { userId: '1', name: 'test1' },
  { userId: '2', name: 'test2' },
  { userId: '3', name: 'test3' },
  { userId: '4', name: 'test4' },
  { userId: '5', name: 'test5' },
  { userId: '6', name: 'test6' }
])

const selectUser = ref()

const mesages = ref<any>([])

const openTab = (item: any) => {
  // const ro: RouteLocationRaw = { path: `/myworks/chat/${item.userId}` }
  // router.push(ro)
  selectUser.value = item
  const webSoctet = new WebSocket(`ws://localhost:8080/admin?to=${item.userId}`)
  item.webSoctet = webSoctet

  webSoctet.onmessage = (event) => {
    const jsonData = JSON.parse(event.data)
    setMessage({ userId: 'admin', name: 'admin', msg: jsonData.msg, isAdmin: false })
  }
}

/** 加载历史历史聊天数据 */
const initMessage = () => {
  const jsonStr = localStorage.getItem('clientData_' + route.params.id) || '[]'

  mesages.value = mesages.value.concat(JSON.parse(jsonStr))
  scrollToBottom()
}

const scrollToBottom = () => {
  nextTick(() => {
    msgRef.value?.scrollTo({ top: msgRef.value.scrollHeight, behavior: 'smooth' })
  })
}

initMessage()

const setMessage = (item) => {
  mesages.value.push(item)
  localStorage.setItem('clientData_' + route.params.id, JSON.stringify(mesages.value))
  scrollToBottom()
}

const onSend = () => {
  const jsonData = { type: 'txt', msg: sendMsg.value }

  setMessage({
    userId: route.params.id,
    name: route.params.id,
    msg: sendMsg.value,
    isAdmin: true
  })

  selectUser.value.webSoctet.send(JSON.stringify(jsonData))
  sendMsg.value = ''
}
</script>

<style lang="less" scoped>
.chatroom-panel {
  display: flex;
  height: 100%;

  .user-list {
    width: 300px;
    border: 1px solid #ccc;
    margin: 0 10px;
    overflow-y: auto;
    .select-item {
      border: red;
    }

    .user-item {
      display: flex;
      width: 280;
      margin: 10px;
      cursor: pointer;
      .user-name {
        margin-left: 10px;
      }
    }
  }
  .chatroom-msage-panel {
    flex: 1;

    display: flex;
    flex-direction: column;

    .msg {
      border: 1px solid #ccc;
      margin-bottom: 5px;
      flex: 1;
      overflow-y: auto;
      .user-msg {
        display: flex;
        align-items: center;
        height: 40px;
        margin: 10px 5px;

        .user-msg-content {
          display: flex;
          align-items: center;
          .arrow {
            width: 0;
            height: 0;
            border-top: 5px solid transparent;
            border-bottom: 5px solid transparent;
          }
          .left {
            border-left: 10px solid #ccc;
          }

          .right {
            border-right: 10px solid #ccc;
          }

          .content {
            flex: 1;
            border: 1px solid #ccc;
            border-radius: 10px;
            padding: 0px 10px;
          }
        }
      }

      .admin {
        // border: 1px solid #ccc;
        justify-content: end;
      }

      .client {
        // border: 1px solid #ccc;
      }
    }

    .send {
      height: 100px;
    }

    .btns {
      height: 30px;
      text-align: right;
      padding-right: 10px;
    }
  }
}
</style>
