<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';
import { hiprint } from 'vue-plugin-hiprint';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import {
  Button,
  Card,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  RadioGroup,
  Select,
  Space,
  Spin,
} from 'ant-design-vue';
// eslint-disable-next-line n/no-extraneous-import
import { debounce } from 'lodash-es';
import { JsonViewer } from 'vue3-json-viewer';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getByMaterialCodeAndName,
  getDetailByCode,
  getDetailByLabelCode,
  materialFeatureGetByMaterialCodeWith,
  packingInfoCreate,
  productPackingFinish,
  productPackingIn,
  productPackingStart,
  queryPrintTemplateDetails,
} from '#/api';
/**
 * CTU纸箱拣货组件
 * 用于制造执行系统中的CTU(Carton Transfer Unit)纸箱拣货作业管理
 * 主要功能：开始拣货、完成拣货、物料拣货操作、物料特征选择
 * 支持两种模式：有标签模式和无标签模式
 * 在有标签模式下，通过扫描标签自动获取物料信息
 * 在无标签模式下，需要手动选择物料和特征
 */

// region 表格信息配置
// VXE表格配置对象，定义了拣货详情表格的结构和行为
const gridOptions: VxeGridProps<any> = {
  align: 'center', // 表格内容居中对齐
  border: true, // 显示表格边框
  columns: [
    { field: 'materialCode', title: '料号', minWidth: 150 }, // 物料的唯一编码
    { field: 'materialName', title: '物料名称', minWidth: 150 }, // 物料的描述性名称
    { field: 'materialDescriptionId', title: '物料特征ID', minWidth: 150 }, // 物料特征的标识ID
    { field: 'number', title: '数量', minWidth: 150 }, // 拣货数量
    { field: 'manufacturerName', title: '供应商名称', minWidth: 150 }, // 物料供应商
    { field: 'materialDescription', title: '物料特征', minWidth: 150 }, // 物料的详细特征描述
    { field: 'unit', title: '单位', minWidth: 150 }, // 物料计量单位
    { field: 'label', title: '物料标签', minWidth: 150 }, // 物料标签码
    { field: 'warehouseAreaCode', title: '储位', minWidth: 150 }, // 物料存储位置
  ],
  height: 400, // 表格固定高度
  stripe: true, // 显示斑马纹效果，提高可读性
  sortConfig: {
    multiple: true, // 启用多列排序功能
  },
  // 分页配置，拣货详情数据较少，禁用分页显示
  pagerConfig: {
    enabled: false,
  },
  proxyConfig: {
    ajax: {
      query: async () => {
        return await queryData(); // 使用自定义查询函数获取数据
      },
    },
  },
  toolbarConfig: {
    custom: true, // 允许自定义列显示
    refresh: true, // 显示刷新按钮
    zoom: true, // 显示缩放按钮
  },
};

// 表格事件对象，当前未定义特定事件
const gridEvents: any = {};

// 使用VXE表格适配器创建表格组件和API对象
const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });
// endregion

// region 基本信息查询功能
// 查询参数对象，存储当前拣货箱码等查询条件
const queryParams = ref<any>({});

/**
 * 查询拣货详情数据
 * 根据箱码查询对应的拣货明细信息
 * @returns Promise 返回符合VXE表格数据格式的Promise对象
 */
function queryData() {
  return new Promise((resolve, reject) => {
    // 复制查询参数，避免直接修改响应式对象
    const params: any = { ...queryParams.value };

    // 仅当存在有效的拣货箱码时才发起数据请求
    if (params.packingCode) {
      getDetailByCode(params)
        .then((data) => {
          // 将接口返回的数据转换为VXE表格组件需要的标准格式
          resolve({
            total: data.length, // 数据总条数，用于分页计算
            items: data, // 实际数据数组
          });
        })
        .catch((error) => {
          reject(error); // 请求失败时抛出错误，由表格组件处理
        });
    } else {
      // 没有箱码时返回空数据集，避免无效请求
      resolve({
        total: 0,
        items: [],
      });
    }
  });
}

// endregion

// region 拣货流程控制功能

/**
 * 开始拣货操作
 * 调用拣货开始接口，成功后打开拣货操作抽屉
 * 如果接口调用失败，则关闭抽屉
 */
function start() {
  productPackingStart({
    ...queryParams.value, // 传递当前箱码等查询参数
  })
    .then(() => {
      // 拣货开始成功，打开拣货操作界面
      openDrawer();
    })
    .catch(() => {
      // 拣货开始失败，确保抽屉处于关闭状态
      closeDrawer();
    });
}

/**
 * 拣货完成操作
 * 显示确认对话框，用户确认后调用拣货完成接口
 * 完成后清理表单数据并刷新表格显示
 */
function end() {
  // 显示二次确认对话框，防止误操作
  Modal.confirm({
    cancelText: '取消', // 取消按钮文本
    okText: '确认', // 确认按钮文本
    okType: 'danger', // 使用危险类型按钮样式，表示重要操作
    onCancel() {
      // 用户取消操作时显示提示信息
      message.warning('已取消操作!');
    },
    onOk() {
      // 用户确认完成拣货，调用拣货完成接口
      productPackingFinish({
        packingCode: queryParams.value.packingCode, // 传递当前箱码
      }).then(() => {
        // 拣货完成成功后的处理
        message.success($t('common.successfulOperation')); // 显示成功提示
        queryParams.value = {}; // 清空查询参数
        gridApi.reload(); // 刷新表格数据
      });
    },
    title: '是否确认拣货完成?', // 对话框标题
  });
}

// endregion

// region 拣货操作相关状态和方法

// 拣货操作抽屉的显示状态控制
const isShow = ref(false);

// 拣货操作表单的引用，用于表单验证
const formRef = ref();

// 拣货操作编辑信息对象，存储当前拣货记录的所有字段数据
const editedInformation = ref<any>({});

// 是否有标签的选项配置，用于单选组件
const labelOptions = [
  {
    label: '有', // 显示文本
    value: 1, // 实际值：有标签模式
  },
  {
    label: '无', // 显示文本
    value: 0, // 实际值：无标签模式
  },
];

/**
 * 打开拣货操作抽屉
 * 初始化表单数据为默认值
 */
function openDrawer() {
  isShow.value = true; // 显示抽屉
  editedInformation.value = {
    isLabel: 0, // 默认选择无标签模式
  };
}

/**
 * 关闭拣货操作抽屉
 * 仅控制显示状态，不清空数据
 */
function closeDrawer() {
  isShow.value = false; // 隐藏抽屉
}

/**
 * 拣货操作提交
 * 验证表单数据后调用拣货入库接口，成功后刷新数据
 */
function pickingSubmit() {
  formRef.value.validate().then(() => {
    // 构建提交参数，包含箱码和拣货信息
    const params = {
      packingCode: queryParams.value.packingCode, // 当前拣货箱码
      ...editedInformation.value, // 拣货详情信息
    };
    productPackingIn(params).then(() => {
      // 拣货入库成功后的处理
      gridApi.reload(); // 刷新表格显示最新数据

      editedInformation.value = {
        isLabel: 0, // 默认选择无标签模式
      };
      materialCharacteristics.value = []; // 清空物料特征数据
      message.success($t('common.successfulOperation')); // 显示成功提示
    });
  });
}

/**
 * 根据标签码查询物料信息
 * 在有标签模式下，输入标签码后自动获取对应的物料和特征信息
 */
function queryLabel() {
  getDetailByLabelCode({
    labelCode: editedInformation.value.labelCode, // 传入标签码
  }).then((data: any) => {
    // 将查询到的物料信息合并到编辑对象中
    Object.assign(editedInformation.value, data);

    // 如果存在物料特征描述，设置特征数据
    if (data.materialDescription) {
      materialCharacteristics.value = [
        {
          id: data.materialDescriptionId, // 特征ID
          description: data.materialDescription, // 特征描述(JSON格式)
        },
      ];
    }
  });
}

/**
 * 表单项初始化函数
 * 当标签模式切换时重置表单数据，保留标签模式选择
 */
function formItemInit() {
  editedInformation.value = {
    isLabel: editedInformation.value.isLabel, // 保留当前的标签模式选择
  };
  materialCharacteristics.value = []; // 清空物料特征数据
}

// endregion

// region 物料特征查询相关功能

// 物料特征列表数据，存储当前物料的所有可选特征
const materialCharacteristics = ref<any[]>([]);

// 物料特征选择抽屉的显示状态控制
const isShowCharacteristics = ref(false);

/**
 * 查询物料信息（入口函数）
 * 根据物料编码触发物料信息查询
 * @param materialCode 物料编码
 */
function queryMaterialCode(materialCode: string) {
  queryMaterialCodeAndName(materialCode); // 调用防抖查询函数
}

// 物料列表数据，用于物料选择下拉框
const materialList = ref<any>([]);

// 物料信息查询加载状态控制
const fetching = ref(false);

/**
 * 根据物料编码查询物料信息（防抖处理）
 * 使用lodash的debounce函数避免频繁查询，提高性能
 * @param materialCode 物料编码
 */
const queryMaterialCodeAndName = debounce((materialCode: string) => {
  fetching.value = true; // 设置加载状态
  getByMaterialCodeAndName({
    materialCode, // 传入查询参数
  })
    .then(({ results }: any) => {
      // 格式化物料显示标签，组合物料名称和编码
      results.forEach((item: any) => {
        item.label = `${item.materialName}(${item.materialCode})`;
      });
      materialList.value = results; // 设置物料列表数据
    })
    .finally(() => {
      fetching.value = false; // 清除加载状态
    });
}, 500); // 500ms防抖延迟

/**
 * 物料选择变化处理函数
 * 当用户选择物料时，自动填充物料名称和单位，并查询对应的特征信息
 * @param _value 选择的物料编码值（未使用）
 * @param item 选择的物料对象
 */
function materialCodeChange(_value: any, item: any) {
  editedInformation.value.materialName = item.materialName; // 设置物料名称
  editedInformation.value.unit = item.unit; // 设置物料单位
  queryCharacteristics(item.materialCode); // 查询该物料的特征信息
}

/**
 * 根据物料编码查询物料特征信息
 * 获取物料的所有特征描述，用于用户选择具体的物料特征
 * @param materialCode 物料编码
 */
function queryCharacteristics(materialCode: string) {
  materialFeatureGetByMaterialCodeWith({
    materialCode, // 传入物料编码
  }).then(({ list }: any) => {
    // 解析特征描述JSON数据，将字符串转换为对象
    list.forEach((item: any) => {
      item.description = item.description ? JSON.parse(item.description) : {};
    });
    materialCharacteristics.value = list; // 设置特征列表数据
  });
}

/**
 * 选择物料特征处理函数
 * 将用户选择的物料特征ID设置到表单中（仅限无标签模式）
 * @param materialDescriptionId 物料特征ID
 */
function selectMaterialCharacteristics(materialDescriptionId: number) {
  // 仅在无标签模式下允许选择特征，有标签模式特征由标签码确定
  if (editedInformation.value.isLabel === 0) {
    editedInformation.value.materialDescriptionId = materialDescriptionId;
  }
}
// endregion

// region 打印

/**
 * 生成箱码
 */
function createLabel() {
  packingInfoCreate().then(({ packingCode }: any) => {
    queryParams.value.packingCode = packingCode;
  });
}

/**
 * 打印箱码
 */
function print() {
  queryPrintTemplateDetails('箱码打印').then((res: any) => {
    try {
      const templateRef = JSON.parse(res.printData);
      const hiprintTemplate = new hiprint.PrintTemplate({
        template: templateRef,
      });
      hiprintTemplate.print(
        {
          qrcode: queryParams.value.packingCode,
        },
        { leftOffset: -1, topOffset: -1 },
      );
    } catch {
      console.error('模板解析失败');
    }
  });
}

// endregion
</script>

<!--
  CTU纸箱拣货组件模板
  包含查询表单区域、数据表格区域、拣货操作抽屉和特征选择抽屉
-->
<template>
  <Page>
    <!-- 主页面卡片容器，显示拣货相关操作 -->
    <Card :title="$t('ctuCartonPicking.packingAndPicking')">
      <!-- 查询表单区域，用于输入箱码和控制拣货操作 -->
      <Form layout="inline" :model="queryParams" class="mb-4">
        <!-- 箱码输入框，支持回车键触发查询 -->
        <FormItem :label="$t('ctuCartonPicking.boxCode')">
          <Input
            v-model:value="queryParams.packingCode"
            @keyup.enter="
              () => {
                gridApi.reload();
              }
            "
          />
        </FormItem>
        <!-- 操作按钮组，控制拣货的开始和完成 -->
        <FormItem>
          <Space>
            <!-- 开始拣货按钮，仅在输入箱码后可用 -->
            <Button
              type="primary"
              @click="start"
              :disabled="!queryParams.packingCode"
            >
              {{ $t('ctuCartonPicking.startPicking') }}
            </Button>
            <!-- 完成拣货按钮，仅在输入箱码后可用 -->
            <Button @click="end" :disabled="!queryParams.packingCode">
              {{ $t('ctuCartonPicking.pickingComplete') }}
            </Button>
          </Space>
        </FormItem>
      </Form>

      <!-- 拣货详情数据表格 -->
      <Grid>
        <template #toolbar-actions>
          <Button type="primary" @click="createLabel" class="mx-2">
            {{ $t('common.barcodeGeneration') }}
          </Button>
          <Button
            type="primary"
            @click="print"
            class="mx-2"
            :disabled="!queryParams.packingCode"
          >
            {{ $t('common.print') }}
          </Button>
        </template>
      </Grid>
    </Card>

    <!-- 拣货操作抽屉，用于输入拣货详情信息 -->
    <Drawer
      v-model:open="isShow"
      :footer-style="{ textAlign: 'right' }"
      :width="600"
      class="custom-class"
      placement="right"
      :title="$t('ctuCartonPicking.picking')"
      @close="closeDrawer"
    >
      <!-- 拣货操作表单，包含所有拣货相关的输入字段 -->
      <Form
        ref="formRef"
        :model="editedInformation"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
      >
        <!-- 当前拣货箱码显示（只读） -->
        <FormItem :label="$t('ctuCartonPicking.boxCode')">
          <Input v-model:value="queryParams.packingCode" disabled />
        </FormItem>
        <!-- 标签模式选择：有标签/无标签 -->
        <FormItem
          :label="$t('ctuCartonPicking.hasLabel')"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="isLabel"
        >
          <RadioGroup
            v-model:value="editedInformation.isLabel"
            :options="labelOptions"
            @change="formItemInit()"
          />
        </FormItem>
        <!-- 物料标签输入（仅在有标签模式下显示） -->
        <FormItem
          :label="$t('ctuCartonPicking.materialLabel')"
          v-if="editedInformation.isLabel === 1"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="labelCode"
        >
          <Input
            v-model:value="editedInformation.labelCode"
            @keyup.enter="queryLabel"
          />
        </FormItem>
        <!-- 物料编码选择：根据标签模式显示不同控件 -->
        <FormItem
          :label="$t('ctuCartonPicking.materialCode')"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="materialCode"
        >
          <!-- 有标签模式：显示只读输入框 -->
          <Input
            v-model:value="editedInformation.materialCode"
            v-if="editedInformation.isLabel === 1"
            disabled
            @change="queryMaterialCode(editedInformation.materialCode)"
          />
          <!-- 无标签模式：显示物料搜索选择框 -->
          <Select
            v-else
            v-model:value="editedInformation.materialCode"
            show-search
            :placeholder="$t('ui.formRules.required')"
            style="width: 200px"
            :default-active-first-option="false"
            :show-arrow="false"
            :filter-option="false"
            :field-names="{ label: 'label', value: 'materialCode' }"
            :not-found-content="fetching ? undefined : null"
            :options="materialList"
            @search="queryMaterialCode"
            @change="materialCodeChange"
            class="!w-full"
          >
            <!-- 查询中状态显示 -->
            <template v-if="fetching" #notFoundContent>
              <Spin size="small" />
            </template>
          </Select>
        </FormItem>
        <!-- 物料名称显示（只读） -->
        <FormItem :label="$t('ctuCartonPicking.materialName')">
          <Input v-model:value="editedInformation.materialName" disabled />
        </FormItem>
        <!-- 物料特征选择区域 -->
        <FormItem
          :label="$t('ctuCartonPicking.materialCharacteristics')"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="materialDescriptionId"
        >
          <!-- 特征ID显示（只读） -->
          <Input
            v-model:value="editedInformation.materialDescriptionId"
            disabled
            class="mr-2 w-[70%]"
          />
          <!-- 特征查看/选择按钮 -->
          <Button
            @click="isShowCharacteristics = true"
            type="primary"
            :disabled="materialCharacteristics.length === 0"
          >
            <!-- 按钮文本根据标签模式动态显示 -->
            {{
              editedInformation.isLabel === 1
                ? $t('common.view')
                : $t('ui.widgets.search.select')
            }}
          </Button>
        </FormItem>
        <!-- 拣货数量输入 -->
        <FormItem
          :label="$t('ctuCartonPicking.quantity')"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="number"
        >
          <Input v-model:value="editedInformation.number" />
        </FormItem>
        <!-- 物料单位显示（只读） -->
        <FormItem :label="$t('ctuCartonPicking.unit')">
          <Input v-model:value="editedInformation.unit" disabled />
        </FormItem>
      </Form>

      <!-- 拣货抽屉底部操作按钮区域 -->
      <template #footer>
        <!-- 按钮组容器，使用Space组件控制按钮间距 -->
        <Space>
          <!-- 取消按钮：关闭抽屉且不保存数据 -->
          <Button @click="closeDrawer()">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认按钮：验证表单并提交拣货数据 -->
          <Button type="primary" @click="pickingSubmit()">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>

    <!-- 物料特征选择抽屉，用于查看和选择物料的详细特征 -->
    <Drawer
      v-model:open="isShowCharacteristics"
      :footer-style="{ textAlign: 'right' }"
      :width="400"
      class="custom-class"
      placement="right"
      title="特性选择"
    >
      <!-- 特征列表显示区域，使用JsonViewer展示特征的详细信息 -->
      <JsonViewer
        v-for="item of materialCharacteristics"
        :key="item.id"
        :memo="item.id"
        :value="item.description"
        class="mb-4"
        :class="{
          '!border-4 !border-green-500 shadow-lg':
            editedInformation.materialDescriptionId === item.id,
        }"
        boxed
        sort
        theme="light"
        @click="selectMaterialCharacteristics(item.id)"
      />
    </Drawer>
  </Page>
</template>

<!-- 组件样式：当前使用Tailwind CSS类进行样式控制，暂无自定义样式规则 -->
<style scoped></style>
