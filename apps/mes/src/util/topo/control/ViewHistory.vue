<script setup lang="ts">
/* -------------------------------------------  Imports  ------------------------------------------- */
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';

import { requestClient } from '#/api/request';

/* -------------------------------------------  Props  ------------------------------------------- */
const props = defineProps<{ detail: any; editMode?: boolean }>();

/* -------------------------------------------  路由  ------------------------------------------- */
const route = useRoute();

/* -------------------------------------------  本地状态  ------------------------------------------- */
const loading = ref(true);
const total = ref(0);
const historyList = ref<any[]>([]);
const realDataOptions = ref<any[]>([]);

const queryParams = reactive({
  pageNum: 1,
  pageSize: 5,
  deviceImei: null as null | string,
  orderByColumn: 'id',
  isAsc: 'desc' as 'asc' | 'desc',
  paramName: '',
  beginTime: null as null | string,
  endTime: null as null | string,
  ztGuid: route.query.guid as string,
});

const dateRange = ref<string[]>([]);

/* -------------------------------------------  计算：动态样式  ------------------------------------------- */
const tableStyle = computed(() => ({
  width: `${props.detail.style.position.w}px`,
  height: `${props.detail.style.position.h}px`,
  background: props.detail.style.backColor,
}));

const cellStyle = computed(() => ({
  background: props.detail.style.backColor,
  color: props.detail.style.foreColor,
}));

const headerCellStyle = computed(() => cellStyle.value);

const paginationStyle = computed(() => cellStyle.value);

/* -------------------------------------------  获取变量列表  ------------------------------------------- */
function getRealList() {
  requestClient
    .get('prod-api/ghxx/bDeviceRealData/list', {
      params: {
        ztGuid: route.query.guid,
        pageNum: 1,
        pageSize: 999,
        orderByColumn: 'id',
        isAsc: 'desc',
      },
    })
    .then((res: any) => {
      realDataOptions.value = res.data.rows;
    });
}

/* -------------------------------------------  搜索  ------------------------------------------- */
function handleQuery() {
  queryParams.pageNum = 1;
  if (dateRange.value && dateRange.value.length === 2) {
    queryParams.beginTime = dateRange.value[0]!;
    queryParams.endTime = dateRange.value[1]!;
  } else {
    queryParams.beginTime = null;
    queryParams.endTime = null;
  }
  getList();
}

/* -------------------------------------------  获取历史数据  ------------------------------------------- */
function getList() {
  loading.value = true;
  requestClient
    .get('prod-api/ghxx/bDeviceHistoryData/list', { params: queryParams })
    .then((res: any) => {
      historyList.value = res.data.rows;
      total.value = res.data.total;
      loading.value = false;
    });
}

/* -------------------------------------------  生命周期  ------------------------------------------- */
onMounted(() => {
  getRealList();
  getList();
});
</script>

<template>
  <div :style="tableStyle" class="tableClass">
    <el-row :gutter="10" class="mb8">
      <el-col :span="6">
        <el-select
          v-model="queryParams.paramName"
          placeholder="所属变量"
          size="small"
          style="width: auto"
          clearable
          filterable
        >
          <el-option
            v-for="real in realDataOptions"
            :key="real.id"
            :label="real.paramName"
            :value="real.paramName"
          />
        </el-select>
      </el-col>
      <el-col :span="14">
        <el-date-picker
          v-model="dateRange"
          size="small"
          :style="{
            width: '340px',
            background: detail.style.backColor,
            color: detail.style.foreColor,
          }"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="datetimerange"
          range-separator="-"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
        />
      </el-col>
      <el-col :span="4">
        <el-button
          type="cyan"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
        >
          查询
        </el-button>
      </el-col>
    </el-row>

    <el-table
      v-loading="loading"
      :data="historyList"
      :cell-style="cellStyle"
      :row-style="cellStyle"
      :header-cell-style="headerCellStyle"
    >
      <el-table-column
        label="上传时间"
        align="center"
        prop="reportTime"
        width="180"
      />
      <el-table-column label="变量名称" align="center" prop="paramName" />
      <el-table-column label="变量值" align="center" prop="paramValue" />
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      :page-sizes="[5, 10, 15]"
      :page-size="5"
      :style="paginationStyle"
      @pagination="getList"
    />
  </div>
</template>

<style scoped>
.tableClass {
  padding: 10px;
  overflow: hidden auto;
}

.el-input {
  color: #fff !important;
  background-color: brown !important;
}
</style>
