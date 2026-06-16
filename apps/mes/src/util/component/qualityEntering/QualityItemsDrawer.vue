<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { computed, ref, watch } from 'vue';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Drawer,
  Form,
  FormItem,
  Image,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tooltip,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  exportQcEntryRecord,
  fetchFileList,
  fetchLocationList,
  fetchQcDetailByItemCode,
  fetchQcItems,
  fetchQcRecordDetail,
  getJudgeDetail,
  saveJudgeResult,
  saveQcItems,
} from '#/api';

// Props
interface Props {
  visible?: boolean;
  status?: 'enter' | 'view';
  recordData?: any;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  success: [];
  'update:visible': [value: boolean];
}>();

// 抽屉可见性
const drawerVisible = ref(false);

// 表头信息
const headerInfo = ref<any>({});

// 是否只读
const isReadonly = computed(() => props.status === 'view');

// 合格/不合格选项
const qualifiedOptions = [
  { value: '合格', label: '合格' },
  { value: '不合格', label: '不合格' },
];

// 表格数据
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      field: 'itemCode',
      title: '质检项编号',
      width: 100,
      fixed: 'left',
    },
    {
      field: 'processName',
      title: '所属工序',
      width: 80,
    },
    {
      field: 'itemName',
      title: '质检项名称',
      width: 120,
    },
    {
      field: 'measureMethodName',
      title: '度量方法',
      width: 80,
    },
    {
      field: 'judgeDescription',
      title: '判定要求',
      width: 120,
      showOverflow: 'tooltip',
    },
    {
      field: 'standardValue',
      title: '标准值',
      width: 80,
    },
    {
      field: 'upperTolerance',
      title: '上公差',
      width: 80,
    },
    {
      field: 'lowerTolerance',
      title: '下公差',
      width: 80,
    },
    {
      field: 'unit',
      title: '单位',
      width: 60,
    },
    {
      field: 'entryItem',
      title: '录入项',
      width: 280,
      slots: { default: 'entryItem' },
    },
    {
      field: 'isQualifiedName',
      title: '是否合格',
      width: 110,
      slots: { default: 'isQualified' },
    },
    {
      field: 'remark',
      title: '备注',
      width: 180,
      slots: { default: 'remark' },
    },
    {
      field: 'fileName',
      title: '文件上传',
      width: 160,
      slots: { default: 'fileName' },
    },
  ],
  height: 590,
  showOverflow: 'tooltip',
  stripe: true,
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

// 判定结果弹窗
const judgeVisible = ref(false);
const judgeDialogStatus = ref<'judge' | 'view'>('judge');
const judgeForm = ref<any>({
  judgeResult: undefined,
  judgeDate: '',
  sendNumber: undefined,
  preparationNumber: undefined,
  qualifiedNumber: undefined,
  disqualifiedNumber: undefined,
  remark: '',
});

const judgeDisabled = ref(false);
const judgeDisabled1 = ref(false);
const showJudgeNumbers = ref(false);

// 判定结论选项
const judgeResultOptions = [
  { value: 1, label: '合格' },
  { value: 2, label: '不合格' },
];

// 录入型数据弹窗
const enterVisible = ref(false);
const currentRowIndex = ref(0);
const currentRowData = ref<any>(null);
const enterFormData = ref<any>({
  gridData: [],
});

// 质检项下拉选项
const qcDetailOptions = ref<any[]>([]);

// 位置下拉选项
const locationOptions = ref<any[]>([]);

// 文件上传相关
const previewVisible = ref(false);
const previewUrl = ref('');

// 本地表格数据
const localTableData = ref<any[]>([]);

// 监听visible变化
watch(
  () => props.visible,
  (val) => {
    drawerVisible.value = val;
    if (val && props.recordData) {
      loadHeader();
      loadGridData();
    }
  },
);

// 监听drawerVisible变化
watch(drawerVisible, (val) => {
  emit('update:visible', val);
});

// 加载表头信息
function loadHeader() {
  if (!props.recordData?.id) return;
  fetchQcRecordDetail(props.recordData.id).then((res: any) => {
    headerInfo.value = res;
    showJudgeNumbers.value = res.sendNumber !== null;
  });
}

// 加载表格数据
function loadGridData() {
  if (!props.recordData?.recordCode) return;
  const params = {
    recordCode: props.recordData.recordCode,
  };
  fetchQcItems(params)
    .then((res: any) => {
      const list = res || [];
      // 如果是录入模式,初始化默认值
      if (props.status === 'enter') {
        list.forEach((item: any) => {
          if (
            ['判断型', '录入型', '文件型', '文本型'].includes(
              item.measureMethodTypeName,
            ) &&
            !item.isQualifiedName
          ) {
            item.isQualifiedName = '合格';
            item.isQualified = 1;
          }
        });
      }
      localTableData.value = list;
      gridApi.grid.reloadData(list);
    })
    .catch(() => {
      message.error('加载数据失败');
    });
}

// 保存表格数据
function handleSave() {
  const tableData = localTableData.value;

  // 转换isQualified字段
  const saveData = tableData.map((item: any) => {
    return {
      ...item,
      recordCode: props.recordData?.recordCode,
      isQualified: item.isQualifiedName === '合格' ? 1 : 2,
    };
  });

  saveQcItems(saveData)
    .then(() => {
      message.success('保存成功');
      emit('success');
      drawerVisible.value = false;
    })
    .catch(() => {
      message.error('保存失败');
    });
}

// 导出
function handleExport() {
  const params = {
    recordCode: props.recordData?.recordCode,
  };
  exportQcEntryRecord(params).then((res: any) => {
    if (res) {
      window.location.href = res;
      message.success('导出成功');
    }
  });
}

// 判定
function handleJudge() {
  judgeDialogStatus.value = 'judge';
  judgeVisible.value = true;

  // 初始化判定日期
  judgeForm.value.judgeDate = dayjs().format('YYYY-MM-DD');

  // 根据是否有送检数量设置禁用状态
  judgeDisabled1.value = headerInfo.value.sendNumber !== null;
  if (headerInfo.value.sendNumber !== null) {
    judgeForm.value.sendNumber = headerInfo.value.sendNumber;
  }
}

// 查看判定结果
function handleViewJudge() {
  judgeDialogStatus.value = 'view';
  judgeVisible.value = true;
  judgeDisabled.value = true;
  judgeDisabled1.value = true;

  // 加载判定结果
  getJudgeDetail(props.recordData?.id).then((res: any) => {
    judgeForm.value = {
      ...res,
      judgeDate: res.judgeDate || dayjs().format('YYYY-MM-DD'),
    };
  });
}

// 保存判定
function handleSaveJudge() {
  const data = {
    ...judgeForm.value,
    formRecordId: props.recordData?.id,
  };
  saveJudgeResult(data)
    .then(() => {
      message.success('判定成功');
      judgeVisible.value = false;
      emit('success');
    })
    .catch(() => {
      message.error('判定失败');
    });
}

// 判定结论变化
function handleJudgeResultChange() {
  if (judgeForm.value.sendNumber) {
    if (judgeForm.value.judgeResult === 1) {
      judgeForm.value.qualifiedNumber = judgeForm.value.sendNumber;
      judgeForm.value.disqualifiedNumber = 0;
    } else {
      judgeForm.value.disqualifiedNumber = judgeForm.value.sendNumber;
      judgeForm.value.qualifiedNumber = 0;
    }
  }
}

// 合格数量变化
function handleQualifiedNumberChange() {
  if (judgeForm.value.sendNumber) {
    judgeForm.value.disqualifiedNumber =
      judgeForm.value.sendNumber - (judgeForm.value.qualifiedNumber || 0);
  }
}

// 录入型数据录入
function handleEnterItem(row: any, index: number) {
  if (row.measureMethodTypeName === '录入型') {
    currentRowIndex.value = index;
    currentRowData.value = row;

    // 加载质检项下拉列表
    fetchQcDetailByItemCode({ itemCode: row.itemCode }).then((res: any) => {
      qcDetailOptions.value = res || [];
    });

    // 初始化位置选项
    fetchLocationList({
      recordCode: props.recordData?.recordCode,
      locationCode: '',
    }).then((res: any) => {
      locationOptions.value = (res || []).map((item: string) => ({
        value: item,
        label: item,
      }));
    });

    // 初始化表格数据
    const gridData =
      row.locationNumberList && row.locationNumberList.length > 0
        ? row.locationNumberList
        : [{ detail: '', locationCode: '', number: '' }];

    enterFormData.value = { gridData };
    enterVisible.value = true;
  }
}

// 录入按钮点击
function handleEnterClick() {
  const tableData: any[] = localTableData.value;
  const rowIndex = tableData.indexOf(currentRowData.value);
  handleEnterItem(currentRowData.value, rowIndex);
}

// 添加录入行
function handleAddEnterRow() {
  enterFormData.value.gridData.push({
    detail: '',
    locationCode: '',
    number: '',
    formRecordId: props.recordData?.id,
    itemCode: currentRowData.value?.itemCode,
    detailId: '',
  });
}

// 删除录入行
function handleDeleteEnterRow(index: number) {
  enterFormData.value.gridData.splice(index, 1);
}

// 位置搜索
function handleLocationSearch(query: string) {
  fetchLocationList({
    recordCode: props.recordData?.recordCode,
    locationCode: query,
  }).then((res: any) => {
    locationOptions.value = (res || []).map((item: string) => ({
      value: item,
      label: item,
    }));
  });
}

// 保存录入型数据
function handleSaveEnter() {
  const tableData = localTableData.value;

  // 更新当前行的录入数据
  if (tableData[currentRowIndex.value]) {
    tableData[currentRowIndex.value].locationNumberList = [
      ...enterFormData.value.gridData,
    ];
  }

  message.success('录入成功');
  enterVisible.value = false;
}

// 关闭抽屉
function handleClose() {
  drawerVisible.value = false;
}

// 预览图片
function handlePreviewImage(row: any) {
  const fileData = {
    attachmentCode: 'ZJFJ',
    code: `${props.recordData?.recordCode}-${row.standardId}`,
    moduleType: '3',
  };

  fetchFileList(fileData).then((res: any) => {
    if (res && res.length > 0) {
      const file = res.find((f: any) => f.fileName === row.fileName);
      if (file) {
        previewUrl.value = file.filePath;
        previewVisible.value = true;
      }
    }
  });
}
</script>

<template>
  <Drawer
    v-model:open="drawerVisible"
    :title="status === 'view' ? '查看质检项' : '录入质检项'"
    width="95%"
    :footer-style="{ textAlign: 'right' }"
  >
    <!-- 表头信息 -->
    <Card class="!mb-4">
      <Form layout="inline">
        <FormItem label="工单编号：">
          <span>{{ headerInfo.worksheetCode || '-' }}</span>
        </FormItem>
        <FormItem label="生产线：">
          <span>{{ headerInfo.lineName || '-' }}</span>
        </FormItem>
        <FormItem label="产品名称：">
          <span>{{ headerInfo.productName || '-' }}</span>
        </FormItem>
        <FormItem label="表单状态：">
          <span v-if="headerInfo.recordStatus === 1">正常</span>
          <span v-else-if="headerInfo.recordStatus === 2" style="color: #ff8c00">关注</span>
          <span v-else>-</span>
        </FormItem>
        <FormItem
          v-if="
            headerInfo.sendNumber !== null &&
            headerInfo.sendNumber !== undefined
          "
          label="送检数量："
        >
          <span>{{ headerInfo.sendNumber }}</span>
        </FormItem>
        <FormItem
          v-if="
            headerInfo.preparationNumber !== null &&
            headerInfo.preparationNumber !== undefined
          "
          label="抽检数量："
        >
          <span>{{ headerInfo.preparationNumber }}</span>
        </FormItem>
      </Form>
    </Card>

    <!-- 操作按钮 -->
    <Space v-if="!isReadonly" class="!mb-4">
      <Button type="primary" @click="handleSave">保存</Button>
      <Button type="primary" @click="handleJudge">判定</Button>
      <Button @click="handleExport">导出</Button>
    </Space>
    <Space v-else class="!mb-4">
      <Button type="primary" @click="handleViewJudge">查看判定结果</Button>
      <Button @click="handleExport">导出</Button>
      <Button @click="handleClose">返回</Button>
    </Space>

    <!-- 表格 -->
    <Card>
      <Grid>
        <template #entryItem="{ row }">
          <div v-if="row.measureMethodTypeName === '文本型'">
            <Input
              v-model:value="row.entryItem"
              :disabled="isReadonly"
              :maxlength="64"
            />
          </div>
          <div v-else-if="row.measureMethodTypeName === '数值型'">
            <InputNumber
              v-model:value="row.entryItem"
              :disabled="isReadonly"
              style="width: 100%"
            />
          </div>
          <div v-else-if="row.measureMethodTypeName === '判断型'">
            <span>-</span>
          </div>
          <div v-else-if="row.measureMethodTypeName === '录入型'">
            <div
              v-if="row.locationNumberList && row.locationNumberList.length > 0"
            >
              <div
                v-for="(item, index) in row.locationNumberList"
                :key="index"
                class="mb-1"
              >
                {{
                  `${String(Number(index) + 1)}、质检项:${item.detail}, 位置:${item.locationCode}, 数量:${item.number}`
                }}
              </div>
            </div>
            <span v-else>-</span>
            <Button
              v-if="!isReadonly"
              type="link"
              size="small"
              @click="handleEnterClick"
            >
              录入
            </Button>
          </div>
          <span v-else>-</span>
        </template>
        <template #isQualified="{ row }">
          <div
            v-if="
              row.measureMethodTypeName === '文本型' ||
              row.measureMethodTypeName === '判断型' ||
              row.measureMethodTypeName === '文件型'
            "
          >
            <Select
              v-if="!isReadonly"
              v-model:value="row.isQualifiedName"
              style="width: 100%"
            >
              <Select.Option
                v-for="opt in qualifiedOptions"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </Select.Option>
            </Select>
            <span v-else-if="row.isQualifiedName === '合格'">{{
              row.isQualifiedName
            }}</span>
            <span
              v-else-if="row.isQualifiedName === '不合格'"
              style="color: #ff4500"
              >{{ row.isQualifiedName }}</span>
            <span v-else>-</span>
          </div>
          <span v-else-if="row.measureMethodTypeName === '数值型'">
            <span v-if="row.isQualifiedName === '合格'">{{
              row.isQualifiedName
            }}</span>
            <span
              v-else-if="row.isQualifiedName === '不合格'"
              style="color: #ff4500"
              >{{ row.isQualifiedName }}</span>
            <span v-else>-</span>
          </span>
          <div v-else-if="row.measureMethodTypeName === '录入型'">
            <Select
              v-if="!isReadonly"
              v-model:value="row.isQualifiedName"
              style="width: 100%"
            >
              <Select.Option
                v-for="opt in qualifiedOptions"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </Select.Option>
            </Select>
            <span v-else-if="row.isQualifiedName === '合格'">{{
              row.isQualifiedName
            }}</span>
            <span
              v-else-if="row.isQualifiedName === '不合格'"
              style="color: #ff4500"
              >{{ row.isQualifiedName }}</span>
            <span v-else>-</span>
          </div>
        </template>
        <template #remark="{ row }">
          <Input.TextArea
            v-model:value="row.remark"
            :disabled="isReadonly"
            :maxlength="264"
            :rows="2"
          />
        </template>
        <template #fileName="{ row }">
          <Button
            v-if="row.fileName"
            type="link"
            size="small"
            @click="handlePreviewImage(row)"
          >
            {{ row.fileName }}
          </Button>
          <span v-else>-</span>
        </template>
      </Grid>
    </Card>

    <template #footer>
      <Button @click="handleClose">关闭</Button>
    </template>

    <!-- 判定弹窗 -->
    <Modal
      v-model:open="judgeVisible"
      :title="judgeDialogStatus === 'judge' ? '判定' : '查看判定结果'"
      width="600px"
    >
      <Form layout="vertical">
        <FormItem label="判定结论">
          <Select
            v-model:value="judgeForm.judgeResult"
            placeholder="请选择"
            style="width: 100%"
            :disabled="judgeDisabled"
            :options="judgeResultOptions"
            @change="handleJudgeResultChange"
          />
        </FormItem>
        <FormItem label="判定日期">
          <Input v-model:value="judgeForm.judgeDate" disabled />
        </FormItem>
        <FormItem v-if="showJudgeNumbers" label="送检数量">
          <Input v-model:value="judgeForm.sendNumber" disabled />
        </FormItem>
        <FormItem v-if="showJudgeNumbers" label="抽检数量">
          <InputNumber
            v-model:value="judgeForm.preparationNumber"
            :min="0"
            style="width: 100%"
            :disabled="judgeDisabled1"
          />
        </FormItem>
        <FormItem label="合格数量">
          <InputNumber
            v-model:value="judgeForm.qualifiedNumber"
            :min="0"
            style="width: 100%"
            :disabled="judgeDisabled"
            @change="handleQualifiedNumberChange"
          />
        </FormItem>
        <FormItem label="不合格数量">
          <InputNumber
            v-model:value="judgeForm.disqualifiedNumber"
            :min="0"
            style="width: 100%"
            :disabled="judgeDisabled1"
          />
        </FormItem>
        <FormItem label="备注">
          <Input.TextArea
            v-model:value="judgeForm.remark"
            :maxlength="256"
            :rows="3"
            :disabled="judgeDisabled"
          />
        </FormItem>
      </Form>
      <template #footer>
        <Button
          v-if="judgeDialogStatus === 'judge'"
          type="primary"
          @click="handleSaveJudge"
        >
          保存
        </Button>
        <Button @click="judgeVisible = false">取消</Button>
      </template>
    </Modal>

    <!-- 录入型数据弹窗 -->
    <Modal v-model:open="enterVisible" title="录入" width="700px">
      <div v-if="enterFormData.gridData.length > 0">
        <Table
          :data-source="enterFormData.gridData"
          :pagination="false"
          :bordered="true"
        >
          <Table.Column title="质检项" data-index="detail" width="200">
            <template #default="{ record }">
              <Select
                v-model:value="record.detail"
                style="width: 100%"
                placeholder="请选择"
              >
                <Select.Option
                  v-for="item in qcDetailOptions"
                  :key="item.id"
                  :value="item.detail"
                >
                  {{ item.detail }}
                </Select.Option>
              </Select>
            </template>
          </Table.Column>
          <Table.Column title="位置" data-index="locationCode" width="180">
            <template #default="{ record }">
              <Select
                v-model:value="record.locationCode"
                style="width: 100%"
                placeholder="请输入位置"
                show-search
                :filter-option="false"
                :options="locationOptions"
                @search="handleLocationSearch"
              />
            </template>
          </Table.Column>
          <Table.Column title="数量" data-index="number" width="120">
            <template #default="{ record }">
              <Input
                v-model:value="record.number"
                type="number"
                @input="
                  (e: Event) => {
                    const target = e.target as HTMLInputElement;
                    target.value = target.value.replace(/[^\d]/g, '');
                    (record as any).number = target.value;
                  }
                "
              />
            </template>
          </Table.Column>
          <Table.Column title="操作" width="100">
            <template #default="{ index }">
              <Space>
                <Tooltip title="添加">
                  <Button type="link" size="small" @click="handleAddEnterRow">
                    <Icon icon="mdi:plus" class="text-xl" />
                  </Button>
                </Tooltip>
                <Tooltip v-if="enterFormData.gridData.length > 1" title="删除">
                  <Button
                    type="link"
                    size="small"
                    danger
                    @click="handleDeleteEnterRow(index)"
                  >
                    <Icon icon="mdi:minus" class="text-xl" />
                  </Button>
                </Tooltip>
              </Space>
            </template>
          </Table.Column>
        </Table>
      </div>
      <template #footer>
        <Button type="primary" @click="handleSaveEnter">保存</Button>
        <Button @click="enterVisible = false">取消</Button>
      </template>
    </Modal>

    <!-- 图片预览 -->
    <Modal
      v-model:open="previewVisible"
      title="预览"
      width="50%"
      :footer="null"
    >
      <Image :src="previewUrl" style="width: 100%" />
    </Modal>
  </Drawer>
</template>
