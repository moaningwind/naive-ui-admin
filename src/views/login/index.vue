<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { LockClosedOutline, PersonOutline } from '@vicons/ionicons5'
import { useUserStore } from '@/store/modules/user'
import { ResultEnum } from '@/enums/httpEnum'
import { PageEnum } from '@/enums/pageEnum'

interface FormState {
  username: string
  password: string
}

const formRef = ref()
const message = useMessage()
const loading = ref(false)
const autoLogin = ref(true)
const LOGIN_NAME = PageEnum.BASE_LOGIN_NAME

const formInline = reactive({
  username: 'admin',
  password: '123456',
  isCaptcha: true,
})

const rules = {
  username: { required: true, message: '请输入用户名', trigger: 'blur' },
  password: { required: true, message: '请输入密码', trigger: 'blur' },
}

const userStore = useUserStore()

const router = useRouter()
const route = useRoute()

const handleSubmit = (e) => {
  e.preventDefault()
  formRef.value.validate(async (errors) => {
    if (!errors) {
      const { username, password } = formInline
      message.loading('登录中...')
      loading.value = true

      const params: FormState = {
        username,
        password,
      }

      try {
        const { code, message: msg } = await userStore.login(params)
        message.destroyAll()
        if (code === ResultEnum.SUCCESS) {
          const toPath = decodeURIComponent((route.query?.redirect || '/') as string)
          message.success('登录成功，即将进入系统')
          if (route.name === LOGIN_NAME)
            router.replace('/')
          else router.replace(toPath)
        }
        else {
          message.info(msg || '登录失败')
        }
      }
      finally {
        loading.value = false
      }
    }
    else {
      message.error('请填写完整信息，并且进行验证码校验')
    }
  })
}
</script>

<template>
  <div flex="~ col" class="view-account">
    <div flex-1 py-8 w-96 mx-auto>
      <div py-8 text-center>
        <h1 color="#808695">
          Naive Ui Admin
        </h1>
      </div>
      <div>
        <n-form
          ref="formRef"
          label-placement="left"
          size="large"
          :model="formInline"
          :rules="rules"
        >
          <n-form-item path="username">
            <n-input v-model:value="formInline.username" placeholder="请输入用户名">
              <template #prefix>
                <n-icon size="18" color="#808695">
                  <PersonOutline />
                </n-icon>
              </template>
            </n-input>
          </n-form-item>
          <n-form-item path="password">
            <n-input
              v-model:value="formInline.password"
              type="password"
              show-password-on="click"
              placeholder="请输入密码"
            >
              <template #prefix>
                <n-icon size="18" color="#808695">
                  <LockClosedOutline />
                </n-icon>
              </template>
            </n-input>
          </n-form-item>
          <n-form-item color="#515a6e">
            <div flex justify-between>
              <div flex-initial>
                <n-checkbox v-model:checked="autoLogin">
                  自动登录
                </n-checkbox>
              </div>
              <div flex-initial order-last>
                <a href="javascript:">忘记密码</a>
              </div>
            </div>
          </n-form-item>
          <n-form-item>
            <n-button type="primary" size="large" :loading="loading" block @click="handleSubmit">
              登录
            </n-button>
          </n-form-item>
        </n-form>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media (min-width: 768px) {
  .view-account {
    height: 100vh;
    overflow: auto;
    background-image: url('@/assets/svg/login.svg');
    background-repeat: no-repeat;
    background-position: 50%;
    background-size: 100%;
  }
}
</style>
