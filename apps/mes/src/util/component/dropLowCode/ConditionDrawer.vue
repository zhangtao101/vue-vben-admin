<script setup lang="ts">
import { ref, watch } from 'vue';

import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Col,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  RadioButton,
  RadioGroup,
  Row,
  Select,
  Space,
} from 'ant-design-vue';

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    default: () => ({
      params: [],
      conditions: [],
      logicType: 'AND',
    }),
  },
});

const emit = defineEmits(['close', 'update:open', 'save']);

// 本地条件列表
const conditions = ref<any[]>([]);
const logicType = ref('and');

// 监听 open 变化，同步数据
watch(
  () => props.open,
  (val) => {
    console.log(props.data);
    if (val) {
      conditions.value =
        props.data.conditions?.length > 0
          ? [...props.data.conditions]
          : [{ param: undefined, op: undefined, value: '' }];
      logicType.value = props.data.logicType || 'AND';
    }
  },
  { immediate: true },
);

// 监听条件列表，字段变更时清空 op
watch(
  conditions,
  () => {
    conditions.value.forEach((condition: any) => {
      if (condition._opWatched) return;
      condition._opWatched = true;
      watch(
        () => condition.param,
        () => {
          condition.op = undefined;
        },
      );
    });
  },
  { deep: true, immediate: true },
);

// 操作符列表
const operatorOptions = [
  { label: '!=', value: '!=' },
  { label: '==', value: '==' },
  { label: '>', value: '>' },
  { label: '<', value: '<' },
  { label: '>=', value: '>=' },
  { label: '<=', value: '<=' },
];

// 获取字段类型
function getFieldType(fieldName: string): string {
  const field = props.data.params?.find((p: any) => p.name === fieldName);
  return field?.type || 'string';
}

// 根据字段类型获取操作符列表
function getOperatorsByFieldType(condition: any): any[] {
  const fieldType = getFieldType(condition.param);
  if (fieldType === 'string') {
    return operatorOptions.filter((op) => ['!=', '=='].includes(op.value));
  }
  return operatorOptions;
}

// 添加条件
function addCondition() {
  conditions.value.push({ param: undefined, op: undefined, value: '' });
}

// 删除条件
function removeCondition(index: number) {
  conditions.value.splice(index, 1);
}

// 关闭抽屉
function handleClose() {
  emit('close');
}

// 保存
function handleSave() {
  // 验证每个条件都有值
  for (let i = 0; i < conditions.value.length; i++) {
    const condition = conditions.value[i];
    if (!condition.param) {
      message.warning(`第 ${i + 1} 行条件：请选择字段`);
      return;
    }
    if (!condition.op) {
      message.warning(`第 ${i + 1} 行条件：请选择操作符`);
      return;
    }
    if (
      condition.value === '' ||
      condition.value === undefined ||
      condition.value === null
    ) {
      message.warning(`第 ${i + 1} 行条件：请输入值`);
      return;
    }
  }
  // 生成返回数据
  const result = {
    logic: logicType.value.toUpperCase(),
    conditions: conditions.value,
  };
  emit('save', result);
}
</script>

<template>
  <Drawer
    :open="open"
    title="条件编辑"
    :width="600"
    @close="handleClose"
    :footer-style="{ textAlign: 'right' }"
  >
    <Form layout="vertical">
      <!-- 逻辑关系 -->
      <FormItem label="条件判断逻辑">
        <RadioGroup v-model:value="logicType">
          <RadioButton value="AND">AND (并且)</RadioButton>
          <RadioButton value="OR">OR (或者)</RadioButton>
        </RadioGroup>
      </FormItem>

      <!-- 条件列表 -->
      <FormItem label="条件列表">
        <div class="condition-list">
          <div
            v-for="(condition, index) in conditions"
            :key="index"
            class="condition-item"
          >
            <Row :gutter="8" align="middle">
              <Col :span="8">
                <Select
                  v-model:value="condition.param"
                  placeholder="选择字段"
                  style="width: 100%"
                  :options="data.params"
                  :field-names="{ label: 'label', value: 'name' }"
                />
              </Col>
              <Col :span="4">
                <Select
                  v-model:value="condition.op"
                  style="width: 100%"
                  :options="getOperatorsByFieldType(condition)"
                  :field-names="{ label: 'label', value: 'value' }"
                />
              </Col>
              <Col :span="6">
                <Input v-model:value="condition.value" placeholder="值" />
              </Col>
              <Col :span="4">
                <Button
                  type="link"
                  danger
                  :disabled="conditions.length <= 1"
                  @click="removeCondition(index)"
                >
                  <Icon icon="mdi:close-circle-outline" class="text-base" />
                </Button>
              </Col>
            </Row>
          </div>
        </div>
      </FormItem>

      <!-- 添加条件按钮 -->
      <FormItem>
        <Button type="dashed" block @click="addCondition">
          <Icon icon="mdi:add-circle-outline" class="text-base" />
          添加条件
        </Button>
      </FormItem>

      <!-- 节点连接信息（只读） -->
      <FormItem label="节点连接">
        <Row :gutter="16">
          <Col :span="12">
            <div class="next-info">
              <span class="label success">是：</span>
              <span class="value">{{ data.trueNext || '未连接' }}</span>
            </div>
          </Col>
          <Col :span="12">
            <div class="next-info">
              <span class="label danger">否：</span>
              <span class="value">{{ data.falseNext || '未连接' }}</span>
            </div>
          </Col>
        </Row>
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
.condition-list {
  max-height: 400px;
  overflow-y: auto;
}

.condition-item {
  padding: 8px;
  margin-bottom: 8px;
  background: #f5f5f5;
  border-radius: 4px;
}

.next-info {
  padding: 8px 12px;
  background: #fafafa;
  border-radius: 4px;

  .label {
    font-weight: 500;

    &.success {
      color: #52c41a;
    }

    &.danger {
      color: #ff4d4f;
    }
  }

  .value {
    color: #666;
  }
}
</style>
