import { onMounted, onUnmounted, ref } from 'vue';

// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { getWebSocketPath } from '#/api';

export default function useWebSocket(fun: any, params: any = {}) {
  // WebSocket 实例的引用，初始值为 null
  const socket = ref<any>(null);
  // 表示 WebSocket 是否连接的状态
  const isConnected = ref<any>(false);
  // 存储接收到的消息的数组
  const messages = ref<any>([]);
  // 重连间隔时间，单位为毫秒
  const reconnectInterval = 5000; // 重连间隔
  // 心跳检测间隔时间，单位为毫秒
  const heartbeatInterval = 30_000; // 心跳间隔
  // 心跳检测的定时器
  let heartbeatTimer: any = null; // 心跳定时器
  // 重连的定时器
  let reconnectTimer: any = null; // 重连定时器

  // 建立 WebSocket 连接的函数
  const connect = async () => {
    // 获取 WebSocket 的连接路径，假设这是一个异步函数
    const url = await getWebSocketPath(params.webSocketType);
    // 创建一个新的 WebSocket 实例
    socket.value = new WebSocket(`${url}?${qs.stringify(params)}`);
    // 监听 WebSocket 的 'open' 事件，表示连接成功
    socket.value.addEventListener('open', () => {
      isConnected.value = true; // 更新连接状态为 true
      startHeartbeat(); // 启动心跳检测
    });
    // 监听 WebSocket 的 'message' 事件，处理接收到的消息
    socket.value.addEventListener('message', (event: any) => {
      fun(event.data);
      // 重置心跳检测定时器
      resetHeartbeat();
    });
    // 监听 WebSocket 的 'close' 事件，表示连接关闭
    socket.value.addEventListener('close', () => {
      isConnected.value = false; // 更新连接状态为 false
    });
    // 监听 WebSocket 的 'error' 事件，处理连接错误
    socket.value.addEventListener('error', (error: any) => {
      console.error('WebSocket error:', error); // 打印错误日志
      startReconnect(); // 启动重连机制
    });
  };

  // 发送消息的函数
  const sendMessage = (data: any) => {
    // 检查 WebSocket 是否处于 OPEN 状态
    if (socket.value.readyState === WebSocket.OPEN) {
      // 将消息序列化为 JSON 格式并发送
      socket.value.send(JSON.stringify(data));
    }
  };

  // 关闭 WebSocket 连接的函数
  const close = () => {
    // 如果 WebSocket 实例存在，则关闭连接
    if (socket.value) {
      socket.value.close();
      // 清除重连和心跳检测的定时器
      clearTimeout(reconnectTimer);
      clearTimeout(heartbeatTimer);
    }
  };

  // 启动心跳检测的函数
  const startHeartbeat = () => {
    // 重置心跳检测定时器
    resetHeartbeat();
    // 设置心跳检测定时器
    heartbeatTimer = setInterval(() => {
      // 检查 WebSocket 是否处于 OPEN 状态
      if (socket.value.readyState === WebSocket.OPEN) {
        // 发送心跳消息
        socket.value.send(JSON.stringify({ type: 'heartbeat' }));
      } else {
        // 如果 WebSocket 不处于 OPEN 状态，打印错误日志并关闭连接
        console.error('Heartbeat failed, closing connection');
        close();
      }
    }, heartbeatInterval);
  };

  // 重置心跳检测定时器的函数
  const resetHeartbeat = () => {
    // 清除当前的心跳检测定时器
    clearTimeout(heartbeatTimer);
    // 将心跳检测定时器设置为 null
    heartbeatTimer = null;
  };

  // 启动重连机制的函数
  const startReconnect = () => {
    // 清除当前的重连定时器
    clearTimeout(reconnectTimer);
    // 设置一个新的重连定时器
    reconnectTimer = setTimeout(connect, reconnectInterval);
  };

  // 在组件挂载时建立 WebSocket 连接
  onMounted(connect);
  // 在组件卸载时关闭 WebSocket 连接
  onUnmounted(close);

  // 返回一个对象，包含 WebSocket 的状态、消息列表、发送消息的函数和关闭连接的函数
  return {
    isConnected,
    messages,
    sendMessage,
    close,
  };
}
