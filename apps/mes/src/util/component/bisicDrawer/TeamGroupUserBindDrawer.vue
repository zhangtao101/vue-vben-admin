<script lang="ts" setup>
import type { TeamGroupBoundUserItem, TeamGroupUserItem } from '#/api';

import { computed, ref } from 'vue';

import { Button, Drawer, message, Space, Transfer } from 'ant-design-vue';

import { bindGroupUsers, listAvailableUsers, listGroupUsers } from '#/api';
import { $t } from '#/locales';

defineOptions({
  name: 'TeamGroupUserBindDrawer',
});

const emit = defineEmits<{
  refresh: [];
}>();

/** 穿梭框数据项 */
interface TransferItem {
  key: string;
  title: string;
  userId?: number;
  userCode?: string;
  userName?: string;
}

// 抽屉显示状态
const show = ref(false);
// 当前班组
const currentRow = ref<any>(null);
// 加载中
const loading = ref(false);
// 提交中
const submitting = ref(false);
// 穿梭框数据源：可用人员 + 班组人员合并去重
const dataSource = ref<TransferItem[]>([]);
// 右侧（班组人员）已选 key
const targetKeys = ref<string[]>([]);

const listStyle = { height: '380px', width: '46%' };

const titles = computed(() => [
  $t('baseInfo.availableUser'),
  $t('baseInfo.groupUser'),
]);

/**
 * 打开抽屉
 * @param row 班组行数据，需包含 id 与 subLineId
 */
function open(row: any) {
  currentRow.value = row;
  show.value = true;
  loadUsers();
}

/**
 * 加载初始数据：左侧所有可用人员，右侧班组人员
 */
async function loadUsers() {
  if (!currentRow.value?.id) return;
  loading.value = true;
  try {
    const [availableRes, boundRes] = await Promise.all([
      listAvailableUsers(currentRow.value.subLineId),
      listGroupUsers(currentRow.value.id),
    ]);
    const available = (availableRes || []) as TeamGroupUserItem[];
    const bound = (boundRes || []) as TeamGroupBoundUserItem[];

    // 以可用人员为基础构建数据源，key 使用 userId
    const map = new Map<string, TransferItem>();
    available.forEach((item) => {
      const key = String(item.userId);
      map.set(key, {
        key,
        title: `${item.userCode ?? ''}(${item.userName ?? ''})`,
        userCode: item.userCode,
        userId: item.userId,
        userName: item.userName,
      });
    });

    // 班组人员以 userId 为 key；不在可用人员中的（如已离职/停用）也补进数据源，保证右侧能展示
    const keys: string[] = [];
    bound.forEach((item) => {
      const key = String(item.userId);
      if (!map.has(key)) {
        map.set(key, {
          key,
          title: `${item.userCode ?? ''}(${item.userName ?? ''})`,
          userCode: item.userCode,
          userId: item.userId,
          userName: item.userName,
        });
      }
      if (!keys.includes(key)) keys.push(key);
    });

    dataSource.value = [...map.values()];
    targetKeys.value = keys;
  } finally {
    loading.value = false;
  }
}

/**
 * 提交绑定：后台会先清空原有绑定关系再重新绑定
 */
function handleSubmit() {
  if (!currentRow.value?.id) return;
  const userList = dataSource.value
    .filter((item) => targetKeys.value.includes(item.key) && item.userId)
    .map((item) => ({
      userCode: item.userCode,
      userId: item.userId,
      userName: item.userName,
    }));
  submitting.value = true;
  bindGroupUsers({ groupId: currentRow.value.id, userList })
    .then(() => {
      message.success($t('baseInfo.bindSuccess'));
      show.value = false;
      emit('refresh');
    })
    .finally(() => {
      submitting.value = false;
    });
}

/**
 * 关闭抽屉：清空所有状态
 */
function handleClose() {
  show.value = false;
  currentRow.value = null;
  loading.value = false;
  submitting.value = false;
  dataSource.value = [];
  targetKeys.value = [];
}

defineExpose({ open });
</script>

<template>
  <Drawer
    v-model:open="show"
    :footer-style="{ textAlign: 'right' }"
    :title="$t('baseInfo.bindUser')"
    width="760"
    @close="handleClose"
  >
    <Transfer
      v-model:target-keys="targetKeys"
      :data-source="dataSource"
      :disabled="loading"
      :list-style="listStyle"
      :render="(item: any) => item.title"
      :titles="titles"
      show-search
      show-select-all
    />
    <template #footer>
      <Space>
        <Button @click="handleClose">{{ $t('common.cancel') }}</Button>
        <Button :loading="submitting" type="primary" @click="handleSubmit">
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>
