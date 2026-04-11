<script setup lang="ts">
import { ref, watch } from 'vue';

import { $t } from '@vben/locales';

import {
  Button,
  Drawer,
  Form,
  FormItem,
  InputNumber,
  message,
  Select,
  Space,
  Tag,
} from 'ant-design-vue';

import { listUser } from '#/api';

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    default: () => ({
      handlers: [],
      passVoteCount: 1,
    }),
  },
});

const emit = defineEmits(['close', 'save']);

// 选中的审批人员 ID 列表
const selectedHandlerIds = ref<string[]>([]);
// 通过票数（本地状态，避免直接修改 props）
const passVoteCount = ref(1);
// 用户列表
const userList = ref<any[]>([]);
// 加载状态
const loading = ref(false);

// 监听抽屉打开，加载用户列表
watch(
  () => props.open,
  (val) => {
    if (val) {
      // 初始化数据
      selectedHandlerIds.value = [...(props.data.handlers || [])];
      passVoteCount.value = props.data.passVoteCount || 1;
      loadUsers();
    }
  },
);

// 加载用户列表
function loadUsers() {
  loading.value = true;
  listUser({ pageNum: 1, pageSize: 100 })
    .then((res: any) => {
      userList.value = res?.list || res?.records || [];
    })
    .finally(() => {
      loading.value = false;
    });
}

// 搜索过滤函数
const filterOption = (input: string, option: any) => {
  const keyword = input.toLowerCase();
  return (
    option.userName?.toLowerCase().includes(keyword) ||
    option.nickName?.toLowerCase().includes(keyword) ||
    option.userCode?.toLowerCase().includes(keyword)
  );
};

// 关闭抽屉
function handleClose() {
  emit('close');
}

// 保存
function handleSave() {
  if (selectedHandlerIds.value.length === 0) {
    message.warning('请选择审批人员');
    return;
  }
  if (passVoteCount.value > selectedHandlerIds.value.length) {
    message.warning(
      `通过人数不能大于审批人员数量（${selectedHandlerIds.value.length}）`,
    );
    return;
  }
  emit('save', {
    handlers: selectedHandlerIds.value,
    passVoteCount: passVoteCount.value,
  });
}
</script>

<template>
  <Drawer
    :open="open"
    title="审批配置"
    :width="600"
    @close="handleClose"
    :footer-style="{ textAlign: 'right' }"
  >
    <Form layout="vertical">
      <!-- 审批人员 -->
      <FormItem label="审批人员">
        <Select
          v-model:value="selectedHandlerIds"
          mode="multiple"
          placeholder="请选择审批人员"
          :loading="loading"
          :options="userList"
          :field-names="{ label: 'userName', value: 'userCode' }"
          :filter-option="filterOption"
          show-search
          style="width: 100%"
        />
      </FormItem>

      <!-- 几票通过 -->
      <FormItem label="几票通过">
        <InputNumber
          :min="1"
          :max="selectedHandlerIds.length || 1"
          v-model:value="passVoteCount"
          style="width: 100%"
        />
        <div class="tip">不能大于审批人员数量</div>
      </FormItem>
    </Form>

    <template #footer>
      <Space>
        <Button @click="handleClose">{{ $t('common.cancel') }}</Button>
        <Button type="primary" @click="handleSave">
          {{ $t('common.save') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>

<style lang="scss" scoped>
.handler-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tip {
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}
</style>
