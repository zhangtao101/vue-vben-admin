import { message } from 'ant-design-vue';
import mqtt from 'mqtt';

const mqttTool: any = {
  client: null,
};

/** 连接Mqtt */
mqttTool.connect = function () {
  const options = {
    username: 'FastBee',
    password:
      'eyJhbGciOiJIUzUxMiJ9.eyJsb2dpbl91c2VyX2tleSI6IjBmY2Q1YjYzLWMzNDktNGUwOS1hZTFjLTMzNDc3OGZhMmYyZCJ9.d8E5hO-MsPtauu1eXNo2IJ6jaZAwvA9FWou0Yc8OFi-s-WlnXZ0In83WtxeivnGK39OTmr_T6ex-wb69_0ne_Q',
    cleanSession: true,
    keepAlive: 30,
    clientId: `web-${Math.random().toString(16).slice(2)}`,
    connectTimeout: 60_000,
  };
  // 配置Mqtt地址
  let url = import.meta.env.VITE_GLOB_MQTT_SERVER_URL;
  if (url === '') {
    console.debug('自动获取mqtt连接地址');
    url =
      window.location.protocol === 'http:'
        ? `ws://${window.location.hostname}:8083/mqtt`
        : `wss://${window.location.hostname}/mqtt`;
  }
  console.debug('mqtt地址：', url);
  mqttTool.client = mqtt.connect(url, options);
  mqttTool.client.on('connect', (_e: any) => {
    console.debug('mqtt连接成功');
  });
  // 重新连接
  mqttTool.client.on('reconnect', (error: any) => {
    console.debug('正在重连:', error);
  });
  // 发生错误
  mqttTool.client.on('error', (error: any) => {
    console.debug('Mqtt客户端连接失败：', error);
    mqttTool.client.end();
  });
  // 断开连接
  mqttTool.client.on('close', (_res: any) => {
    console.debug('已断开Mqtt连接');
  });
};
/** 断开连接 */
mqttTool.end = function () {
  return new Promise((resolve, _reject) => {
    if (mqttTool.client === null) {
      resolve('未连接');
      console.debug('未连接');
      return;
    }
    mqttTool.client.end();
    mqttTool.client = null;
    console.debug('Mqtt服务器已断开连接！');
    resolve('连接终止');
  });
};
/** 重新连接 */
mqttTool.reconnect = function () {
  return new Promise((resolve, _reject) => {
    if (mqttTool.client === null) {
      // 调用resolve方法，Promise变为操作成功状态（fulfilled）
      resolve('未连接');
      console.debug('未连接');
      return;
    }
    console.debug('正在重连...');
    mqttTool.client.reconnect();
  });
};
/** 消息订阅 */
mqttTool.subscribe = function (topics: any) {
  return new Promise((resolve, _reject) => {
    if (mqttTool.client === null) {
      resolve('未连接');
      console.debug('未连接');
      message.error('mqtt未连接');
      return;
    }
    mqttTool.client.subscribe(
      topics,
      {
        qos: 1,
      },
      (err: any, _res: any) => {
        console.debug('订阅主题：', topics);
        if (err) {
          console.debug('订阅失败，主题可能已经订阅');
          resolve('订阅失败');
        } else {
          console.debug('订阅成功');
          resolve('订阅成功');
        }
      },
    );
  });
};
/** 取消订阅 */
mqttTool.unsubscribe = function (topics: any) {
  return new Promise((resolve, _reject) => {
    if (mqttTool.client === null) {
      resolve('未连接');
      console.debug('未连接');
      return;
    }
    mqttTool.client.unsubscribe(topics, (err: any) => {
      if (err) {
        resolve('取消订阅失败');
        console.debug('取消订阅失败');
      } else {
        resolve('取消订阅成功');
        console.debug('取消订阅成功');
      }
    });
  });
};
mqttTool.publish = function (topic: any, message: any, name: any) {
  return new Promise((resolve, reject) => {
    if (mqttTool.client === null) {
      resolve('Mqtt客户端未连接');
      console.debug('Mqtt客户端未连接');
      return;
    }
    mqttTool.client.publish(topic, message, { qos: 1 }, (err: any) => {
      console.debug('发送主题：', topic);
      console.debug('发送内容：', message);
      if (err) {
        console.debug(`[ ${name} ] 指令发送失败`);
        reject(new Error(`[ ${name} ] 指令发送失败`));
      } else {
        if (topic.indexOf('offline') > 0) {
          console.debug(`[ ${name} ] 影子指令发送成功`);
          resolve(`[ ${name} ] 影子指令发送成功`);
        } else {
          console.debug(`[ ${name} ] 指令发送成功`);
          resolve(`[ ${name} ] 指令发送成功`);
        }
      }
    });
  });
};

export default mqttTool;
