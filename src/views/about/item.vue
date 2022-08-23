<script lang="ts" setup>
export interface schemaItem {
  field: string
  label: string
}

const { pkg, lastBuildTime } = __APP_INFO__
const { dependencies, devDependencies, name, version } = pkg

const schema: schemaItem[] = []
const devSchema: schemaItem[] = []

Object.keys(dependencies).forEach((key) => {
  schema.push({ field: key, label: dependencies[key] })
})

Object.keys(devDependencies).forEach((key) => {
  devSchema.push({ field: key, label: devDependencies[key] })
})
</script>

<template>
  <div>
    <n-card
      mt-4
      class="pro-card"
      title="项目信息"
      size="small"
      :bordered="false"
      :segmented="{ content: 'soft' }"
    >
      <n-descriptions py-2 bordered label-placement="left">
        <n-descriptions-item label="版本">
          <n-tag type="info">
            {{ version }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="最后编译时间">
          <n-tag type="info">
            {{ lastBuildTime }}
          </n-tag>
        </n-descriptions-item>
      </n-descriptions>
    </n-card>

    <n-card
      mt-4
      class="pro-card"
      title="开发环境依赖"
      size="small"
      :bordered="false"
      :segmented="{ content: 'soft' }"
    >
      <n-descriptions py-2 bordered label-placement="left">
        <n-descriptions-item v-for="item in devSchema" :key="item.field" :label="item.field">
          {{ item.label }}
        </n-descriptions-item>
      </n-descriptions>
    </n-card>

    <n-card
      mt-4
      class=" pro-card"
      title="生产环境依赖"
      size="small"
      :bordered="false"
      :segmented="{ content: 'soft' }"
    >
      <n-descriptions py-2 bordered label-placement="left">
        <n-descriptions-item v-for="item in schema" :key="item.field" :label="item.field">
          {{ item.label }}
        </n-descriptions-item>
      </n-descriptions>
    </n-card>
  </div>
</template>
