<template>
  <div class="center green" style="font-size: 30px">
    <div class="border container">
      用户: {{ msg.nickName }}
    </div>
    <div class="container room">
      <el-input class="child" v-model="msg.roomName" placeholder="请输入房间名"/>
      <el-button class="child button" @click="enterRoom" type="primary" plain>进入房间</el-button>
    </div>
  </div>
  <div class="container">
    <div v-for="h in history" class="left content-item" :class="{green:isMyMsg(h.name)}">
      <span>{{ h.name }}:&nbsp;&nbsp;&nbsp;</span>
      <span>{{ h.content }}</span>
    </div>
  </div>
  <footer id="footer" class="foot">
    <div class="container">
      <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4}" class="input" v-model="msg.content"
                @keydown.enter="sendMsg" placeholder="请输入内容"></el-input>
    </div>
  </footer>
</template>

<script>
import {ElMessageBox, ElNotification} from 'element-plus'
import axios from 'axios'

export default {
  name: 'myIndex',
  data() {
    return {
      msg: {
        content: "",
        roomName: "",
        nickName: ""
      },
      history: [{
        content: "欢迎来到I need a talk", name: "#"
      }],
      ws: {}
    }
  },
  methods: {
    isMyMsg: function (name) {
      return this.msg.nickName == name
    },
    addMsg(msg) {
      this.history.push({
        "content": msg.content
        , "name": msg.nickName
      })
    },
    randomString(e) {
      e = e || 32;
      var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
          a = t.length,
          n = "";
      for (let i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
      return n
    },
    enterRoom() {
      axios.get('http://localhost:8080/room/enterRoom?roomName=' + this.msg.roomName).then(
          response => {
            this.addMsg({
              content: "成功加入了房间" + this.msg.roomName
              , nickName: "#"
            })
            console.log("我进入了房间")
            this.ws = new WebSocket("ws://localhost:8083/room")
            this.ws.onopen = function () {
              console.log("建立ws连接 ...");
            };
            this.ws.onmessage = (r) => {
              r = JSON.parse(r.data)
              this.addMsg(r)
            };
            this.ws.onclose = function () {
              console.log("ws连接关闭.");
              this.msg.roomName = ""
            };
          }
      )
    },
    sendMsg() {
      if (this.msg.roomName == "") {
        ElNotification({
          title: 'Info',
          message: '还未加入房间，无法发送消息',
          type: 'info',
        })
        return
      }
      axios.post('http://localhost:8080/chat/send',
          JSON.stringify(this.msg),
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
      ).then(
          response => {
            console.log("成功了")
            // 清空消息内容
            this.msg.content = ""
          }
      )
    }
  },
  mounted() {
    if (this.msg.nickName == "") {
      ElMessageBox.prompt('请输入用户名', 'Tip', {
        showClose: false,
        closeOnClickModal: false,
        closeOnPressEscape: false,
        closeOnHashChange: false,
        confirmButtonText: '好我就叫这个',
        inputPattern:
            /^[(a-zA-Z0-9\u4e00-\u9fa5){1}_]{1,10}$/,
        inputErrorMessage: '非法用户名',
        showCancelButton: false
      }).then(({value}) => {
        this.msg.nickName = value + "(" + this.randomString(5) + ")"
      })
    }
  }
}
</script>
<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
}

.room {
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 20px;
  padding-right: 20px;
}

.child {
  width: 200px;
  height: 40px;
  font-size: 18px;
}

.child.button {
  width: 100px;
  margin-left: 20px;
}

.border {
  box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04)
}

.center {
  text-align: center;
  margin-left: 300px;
  margin-right: 300px;
}

.green {
  color: green;
}

.content-item {
  margin-top: 5px;
}

.left {
  text-align: left;
}

#footer {
  position: fixed;
  bottom: 0;
  width: 100%;
  margin-bottom: 40px;
}

.input {
  height: 60px;
}

</style>
