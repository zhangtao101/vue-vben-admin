<script lang="ts" setup>
import { computed, h, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { message, theme } from 'ant-design-vue';
import type { ConversationsProps } from 'ant-design-x-vue';

defineOptions({ name: 'AXConversationsWithMenuSetup' });

const items: ConversationsProps['items'] = Array.from({ length: 4 }).map(
  (_, index) => ({
    key: `item${index + 1}`,
    label: `Conversation Item ${index + 1}`,
    disabled: index === 3,
  }),
);

const [messageApi] = message.useMessage();
const { token } = theme.useToken();

const style = computed(() => ({
  width: '256px',
  background: token.value.colorBgContainer,
  borderRadius: token.value.borderRadius,
}));

const menuConfig: ConversationsProps['menu'] = (conversation) => ({
  items: [
    {
      label: 'Operation 1',
      key: 'operation1',
    },
    {
      label: 'Operation 2',
      key: 'operation2',
      disabled: true,
    },
    {
      label: 'Operation 3',
      key: 'operation3',
      danger: true,
    },
  ],
  onClick: (menuInfo) => {
    messageApi.info(`Click ${conversation.key} - ${menuInfo.key}`);
  },
});
</script>

<template>
  <Page>
    <AXConversations
      default-active-key="item1"
      :menu="menuConfig"
      :items="items"
      :style="style"
    />
  </Page>
</template>

<style scoped>
.ai-chat-container {
  height: calc(100vh - 200px);
  min-height: 500px;
  overflow: hidden;
  background: #f5f5f5;
  border-radius: 8px;
}
</style>
