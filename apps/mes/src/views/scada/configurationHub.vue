<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';
import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { queryAuth } from '#/util';
import ScadaItemCard from '#/util/component/scada/scadaItemCard.vue';

// region 查询
const queryParams = ref<any>({});
const scadaDataList = ref<any>([]);

function queryData() {
  scadaDataList.value = [
    {
      createBy: '1',
      createTime: '2025-10-20 17:04:37',
      updateBy: null,
      updateTime: '2025-11-12 14:24:33',
      remark: '123456',
      id: 1,
      guid: 'a657f7e4-0891-4b27-9313-27a29e9103e5',
      scadaData:
        '{"name":"--","layer":{"backColor":"","backgroundImage":"","widthHeightRatio":"","width":1920,"height":1080},"components":[{"type":"flow-bar-dynamic","componentShow":["参数绑定","组件颜色","水流"],"action":[],"dataBind":{"serialNumber":"","identifier":"","modelValue":""},"dataAction":{"direction":"","paramJudge":"","paramJudgeData":"","direction01":"","paramJudge01":"","paramJudgeData01":""},"style":{"position":{"x":105,"y":82,"w":320,"h":50},"backColor":"rgba(0, 206, 209, 1)","zIndex":1,"transform":0,"transformType":"rotate(0deg)","foreColor":"red","lineHeight":10,"direction":"水平","animations":"正向","speed":"中","lineWidth":15,"lineInterval":20,"lineType":"矩形","anchorPointNum":6,"spotPoints":[{"x":20,"y":20},{"x":70,"y":20},{"x":120,"y":20},{"x":170,"y":20},{"x":220,"y":20},{"x":270,"y":20}],"visible":true,"borderWidth":0,"borderStyle":"solid","borderColor":"#ccccccff","temp":{"position":{"x":105,"y":82}}},"identifier":"4e836d4c-2852-1429-248c-63140b8a3325","name":"flow-bar-dynamic0"},{"type":"image","componentShow":["动画","单击","组件颜色","滤镜渲染","组件填充","参数绑定"],"action":[],"hdClassName":"","dataBind":{"action":"","productId":112,"serialNumber":"D4AD203F3A1C","identifier":"0","modelName":"漏水值","modelValue":"","redirectUrl":"","stateList":[],"unit":"度","type":1},"dataAction":{"serialNumber":"","identifier":"","modelName":"","paramJudge":"","paramJudgeData":"","rotationSpeed":"中","translateList":[]},"style":{"position":{"x":443,"y":83,"w":71,"h":58},"backColor":"rgba(255, 255, 255, 0)","foreColor":"","zIndex":1,"transform":0,"url":"/prod-api/profile/avatar/anniu (81).svg","transformType":"rotate(0deg)","isFilter":true,"visible":true,"borderWidth":0,"borderStyle":"solid","borderColor":"#ccccccff","temp":{"position":{"x":443,"y":84}}},"identifier":"4090d43e-a3d7-d710-732a-501dfa17fc27","name":"image1"},{"type":"text","componentShow":["参数绑定","单击","组件颜色","动画"],"action":[],"dataBind":{"djAction":false,"action":"","productId":"","serialNumber":"","identifier":"","modelName":"","modelValue":"","unit":"","redirectUrl":""},"dataAction":{"xyAction":false,"xzAction":false,"ssAction":false,"hdAction":false,"serialNumber":"","identifier":"","modelName":"","paramJudge":"","paramJudgeData":"","rotationSpeed":"中","translateList":[]},"style":{"position":{"x":218,"y":275,"w":60,"h":25},"backColor":"#fff","foreColor":"#000","zIndex":1,"transform":0,"transformType":"rotate(0deg)","textAlign":"center","fontSize":14,"fontFamily":"Arial","text":"0","visible":true,"borderWidth":0,"borderStyle":"solid","borderColor":"#ccccccff","temp":{"position":{"x":224,"y":278}}},"identifier":"cc144ee8-0f6e-9804-61b2-5279005f8fb8","name":"text2"},{"type":"image","componentShow":["动画","单击","组件颜色","滤镜渲染","组件填充","参数绑定"],"action":[],"hdClassName":"","dataBind":{"action":"","productId":"","serialNumber":"","identifier":"","modelName":"","modelValue":"","redirectUrl":"","stateList":[]},"dataAction":{"serialNumber":"","identifier":"","modelName":"","paramJudge":"","paramJudgeData":"","rotationSpeed":"中","translateList":[]},"style":{"position":{"x":139,"y":166,"w":169,"h":221},"backColor":"rgba(255, 255, 255, 0)","foreColor":"","zIndex":0,"transform":0,"url":"/prod-api/profile/avatar/chuxuguan (187).svg","transformType":"rotate(0deg)","isFilter":true,"visible":true,"borderWidth":0,"borderStyle":"solid","borderColor":"#ccccccff","temp":{"position":{"x":139,"y":166}}},"identifier":"92ac783f-96cd-6892-1987-dfae71fb5172","name":"image3"},{"type":"text","componentShow":["单击","组件颜色","动画"],"action":[],"dataBind":{"djAction":false,"action":"","productId":"","serialNumber":"","identifier":"","modelName":"","modelValue":"","redirectUrl":""},"dataAction":{"xyAction":false,"xzAction":false,"ssAction":false,"hdAction":false,"serialNumber":"","identifier":"","modelName":"","paramJudge":"","paramJudgeData":"","rotationSpeed":"中","translateList":[]},"style":{"position":{"x":160,"y":277,"w":51,"h":21},"backColor":"#ff000000","foreColor":"#000","zIndex":1,"transform":0,"transformType":"rotate(0deg)","waterBorderWidth":1,"waterBorderColor":"rgba(255, 255, 255, 0)","text":"Test","textAlign":"center","fontSize":14,"fontFamily":"Arial","visible":true,"borderWidth":0,"borderStyle":"solid","borderColor":"#ccccccff","temp":{"position":{"x":53,"y":182}}},"identifier":"9cff4366-cbf2-2ca4-e8af-8bf14ddf1b5e","name":"text4"},{"type":"chart-wrapper","componentShow":["自定义echarts"],"action":[],"dataBind":{"echartOption":"echartId-1","echartRun":0,"echartSecond":60,"echartData":""},"style":{"position":{"x":60,"y":409,"w":455,"h":296},"backColor":"rgba(255, 255, 255, 1)","foreColor":"#000","zIndex":1,"transform":0,"transformType":"rotate(0deg)","visible":true,"borderWidth":0,"borderStyle":"solid","borderColor":"#ccccccff","temp":{"position":{"x":60,"y":455}}},"identifier":"b257844a-4907-5680-32dd-ddd958fea9b5","name":"chart-wrapper5"},{"type":"imageSwitch","componentShow":["状态开关","参数绑定","单击","组件颜色","设备状态","滤镜渲染"],"action":[],"dataBind":{"djAction":true,"activeName":"变量状态","productId":112,"serialNumber":"D4AD203F3A1C","modelName":"漏水值","identifier":"0","modelValue":"","action":"开关控制","redirectUrl":"","controValue":"0开1关","shutImageUrl":"","openImageUrl":"","warnImageUrl":"","stateList":[],"type":1},"dataAction":{"actualValue":""},"style":{"position":{"x":383,"y":232,"w":50,"h":50},"zIndex":1,"transform":0,"backColor":"#fff","transformType":"rotate(0deg)","isFilter":false,"url":"","visible":true,"borderWidth":0,"borderStyle":"solid","borderColor":"#ccccccff","temp":{"position":{"x":383,"y":232}}},"identifier":"28265708-9b23-1ca4-9cd7-b08f9f3f1130","name":"imageSwitch6"}],"zIndexBottom":0}',
      serialNumbers: null,
      deviceName: null,
      isMainPage: null,
      pageName: '19999999999',
      pageResolution: '1920x1080',
      isShare: null,
      shareUrl: null,
      sharePass: null,
      pageImage:
        '/profile/upload/2025/11/10/file_1762751972880_20251110131932A005.png',
      tenantId: 1,
      tenantName: 'admin',
      delFlag: 0,
      base64: null,
      bindDeviceList: null,
    },
  ];
}
// endregion

// region 点击事件

function handleCardClick({ type, id, guid }: any) {
  switch (type) {
    case 'delete': {
      break;
    }
    case 'edit': {
      break;
    }
    case 'preview': {
      preview(id, guid);
      break;
    }
    case 'view': {
      break;
    }
  }
}

function preview(id: number, guid: string) {
  window.open(`/empty/scadaPreview?id=${id}&guid=${guid}`);
}

// endregion

// region 初始化
// 路由信息
const route = useRoute();
// 当前页面按钮权限列表
const author = ref<string[]>([]);
onMounted(() => {
  // 查询权限
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
  queryData();
});
// endregion
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 不良名称 -->
        <FormItem
          :label="$t('scada.configurationHub.name')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.defectName" />
        </FormItem>

        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
            type="primary"
            @click="queryData()"
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->

    <!-- region 主要内容 -->
    <Card class="mb-8">
      <Space>
        <Button type="primary">
          <template #icon>
            <Icon icon="mdi:plus" class="inline-block align-text-top text-xl" />
          </template>
          {{ $t('common.add') }}
        </Button>
        <Button type="primary">
          <template #icon>
            <Icon icon="mdi:edit" class="inline-block align-text-top text-xl" />
          </template>
          {{ $t('common.edit') }}
        </Button>
        <Button type="primary">
          <template #icon>
            <Icon
              icon="mdi:delete"
              class="inline-block align-text-top text-xl"
            />
          </template>
          {{ $t('common.delete') }}
        </Button>
        <Button type="primary">
          <template #icon>
            <Icon
              icon="mdi:tray-download"
              class="inline-block align-text-top text-xl"
            />
          </template>
          {{ $t('common.export') }}
        </Button>
      </Space>

      <div class="float-right">
        <Space>
          <!-- 刷新 -->
          <Tooltip>
            <template #title>
              {{ $t('common.refresh') }}
            </template>
            <Button shape="circle">
              <template #icon>
                <Icon
                  icon="mdi:refresh"
                  class="inline-block align-text-top text-xl"
                />
              </template>
            </Button>
          </Tooltip>
          <!-- 切换 -->
          <Tooltip>
            <template #title>
              {{ $t('common.toggle') }}
            </template>
            <Button shape="circle">
              <template #icon>
                <Icon
                  icon="mdi:delete"
                  class="inline-block align-text-top text-xl"
                />
              </template>
            </Button>
          </Tooltip>
        </Space>
      </div>
      <div>
        <ScadaItemCard
          v-for="item in scadaDataList"
          :key="item.id"
          :img="`/scadaImage${item.pageImage}`"
          :title="item.pageName"
          :remark="item.remark"
          :id="item.id"
          :guid="item.guid"
          @click="handleCardClick"
        />
      </div>
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
