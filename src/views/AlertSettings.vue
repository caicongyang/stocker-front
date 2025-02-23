<template>
  <div class="alert-settings">
    <SideMenu />
    <div class="content">
      <div class="alert-channels">
        <div class="channel-list">
          <div class="channel-header">
            <h3>告警渠道</h3>
            <el-button type="primary" size="small" @click="showAddChannel = true">
              <i class="el-icon-plus"></i> 添加渠道
            </el-button>
          </div>
          
          <el-table
            :data="channels"
            style="width: 100%">
            <el-table-column
              prop="type"
              label="渠道类型"
              width="120">
              <template slot-scope="scope">
                <el-tag :type="getChannelTagType(scope.row.type)">
                  {{ getChannelTypeName(scope.row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="name"
              label="渠道名称"
              width="150">
            </el-table-column>
            <el-table-column
              prop="target"
              label="接收目标">
            </el-table-column>
            <el-table-column
              prop="status"
              label="状态"
              width="100">
              <template slot-scope="scope">
                <el-switch
                  v-model="scope.row.status"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                  @change="handleStatusChange(scope.row)">
                </el-switch>
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              width="150">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="text"
                  @click="handleEdit(scope.row)">编辑</el-button>
                <el-button
                  size="mini"
                  type="text"
                  class="delete-button"
                  @click="handleDelete(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <!-- 添加/编辑渠道对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="showAddChannel"
      width="500px">
      <el-form :model="channelForm" :rules="rules" ref="channelForm" label-width="100px">
        <el-form-item label="渠道类型" prop="type">
          <el-select v-model="channelForm.type" placeholder="请选择渠道类型" style="width: 100%">
            <el-option label="企业微信" value="wework"></el-option>
            <el-option label="邮箱" value="email"></el-option>
            <el-option label="Telegram" value="telegram"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="渠道名称" prop="name">
          <el-input v-model="channelForm.name" placeholder="请输入渠道名称"></el-input>
        </el-form-item>

        <template v-if="channelForm.type === 'wework'">
          <el-form-item label="WebHook" prop="webhook">
            <el-input v-model="channelForm.webhook" placeholder="请输入企业微信 WebHook 地址"></el-input>
          </el-form-item>
        </template>

        <template v-if="channelForm.type === 'email'">
          <el-form-item label="邮箱地址" prop="email">
            <el-input v-model="channelForm.email" placeholder="请输入接收邮箱地址"></el-input>
          </el-form-item>
        </template>

        <template v-if="channelForm.type === 'telegram'">
          <el-form-item label="Bot Token" prop="botToken">
            <el-input v-model="channelForm.botToken" placeholder="请输入 Telegram Bot Token"></el-input>
          </el-form-item>
          <el-form-item label="Chat ID" prop="chatId">
            <el-input v-model="channelForm.chatId" placeholder="请输入 Telegram Chat ID"></el-input>
          </el-form-item>
        </template>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showAddChannel = false">取 消</el-button>
        <el-button type="primary" @click="handleSaveChannel">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import SideMenu from '../components/SideMenu.vue'

export default {
  name: 'AlertSettings',
  components: {
    SideMenu
  },
  data() {
    return {
      channels: [
        {
          id: 1,
          type: 'wework',
          name: '运维告警群',
          target: 'https://qyapi.weixin.qq.com/...',
          status: true
        },
        {
          id: 2,
          type: 'email',
          name: '紧急联系人',
          target: 'alert@example.com',
          status: true
        },
        {
          id: 3,
          type: 'telegram',
          name: 'Alert Channel',
          target: 'Bot: @StockAlertBot',
          status: false
        }
      ],
      showAddChannel: false,
      channelForm: {
        type: '',
        name: '',
        webhook: '',
        email: '',
        botToken: '',
        chatId: ''
      },
      editingChannel: null,
      rules: {
        type: [
          { required: true, message: '请选择渠道类型', trigger: 'change' }
        ],
        name: [
          { required: true, message: '请输入渠道名称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        webhook: [
          { required: true, message: '请输入 WebHook 地址', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        botToken: [
          { required: true, message: '请输入 Bot Token', trigger: 'blur' }
        ],
        chatId: [
          { required: true, message: '请输入 Chat ID', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    dialogTitle() {
      return this.editingChannel ? '编辑告警渠道' : '添加告警渠道'
    }
  },
  methods: {
    getChannelTypeName(type) {
      const typeMap = {
        wework: '企业微信',
        email: '邮箱',
        telegram: 'Telegram'
      }
      return typeMap[type] || type
    },
    getChannelTagType(type) {
      const typeMap = {
        wework: 'success',
        email: 'primary',
        telegram: 'warning'
      }
      return typeMap[type] || ''
    },
    handleStatusChange(channel) {
      this.$message.success(`${channel.name} ${channel.status ? '已启用' : '已停用'}`)
    },
    handleEdit(channel) {
      this.editingChannel = channel
      this.channelForm = {
        type: channel.type,
        name: channel.name,
        webhook: channel.type === 'wework' ? channel.target : '',
        email: channel.type === 'email' ? channel.target : '',
        botToken: channel.type === 'telegram' ? channel.target.split(':')[0] : '',
        chatId: channel.type === 'telegram' ? channel.target.split(':')[1] : ''
      }
      this.showAddChannel = true
    },
    handleDelete(channel) {
      this.$confirm('确认删除该告警渠道?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.channels = this.channels.filter(item => item.id !== channel.id)
        this.$message.success('删除成功')
      }).catch(() => {})
    },
    handleSaveChannel() {
      this.$refs.channelForm.validate((valid) => {
        if (valid) {
          let target = ''
          switch (this.channelForm.type) {
            case 'wework':
              target = this.channelForm.webhook
              break
            case 'email':
              target = this.channelForm.email
              break
            case 'telegram':
              target = `${this.channelForm.botToken}:${this.channelForm.chatId}`
              break
          }

          if (this.editingChannel) {
            // 更新现有渠道
            const index = this.channels.findIndex(c => c.id === this.editingChannel.id)
            if (index !== -1) {
              this.channels[index] = {
                ...this.editingChannel,
                type: this.channelForm.type,
                name: this.channelForm.name,
                target
              }
            }
          } else {
            // 添加新渠道
            this.channels.push({
              id: Date.now(),
              type: this.channelForm.type,
              name: this.channelForm.name,
              target,
              status: true
            })
          }

          this.showAddChannel = false
          this.$message.success(this.editingChannel ? '更新成功' : '添加成功')
          this.resetForm()
        }
      })
    },
    resetForm() {
      this.editingChannel = null
      this.channelForm = {
        type: '',
        name: '',
        webhook: '',
        email: '',
        botToken: '',
        chatId: ''
      }
      this.$refs.channelForm?.resetFields()
    }
  }
}
</script>

<style scoped>
.alert-settings {
  display: flex;
  height: 100vh;
  background-color: #f5f7fa;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.alert-channels {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.channel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.channel-header h3 {
  margin: 0;
  color: #333;
}

.delete-button {
  color: #f56c6c;
}

.delete-button:hover {
  color: #ff4949;
}
</style>