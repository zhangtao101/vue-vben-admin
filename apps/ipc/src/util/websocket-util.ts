import { onMounted, onUnmounted, ref } from 'vue';

import { useAccessStore } from '@vben/stores';

// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { getWebSocketPath } from '#/api';

export default function useWebSocket(fun: any, params: any = {}) {
  // WebSocket 实例的引用，初始值为 null
  const socket = ref<any>(null);
  // 表示 WebSocket 是否连接的状态
  const isConnected = ref<any>(false);
  // 重连间隔时间，单位为毫秒
  const reconnectInterval = 5000; // 重连间隔
  // 心跳检测间隔时间，单位为毫秒
  const heartbeatInterval = 30_000; // 心跳间隔
  // 心跳检测的定时器
  let heartbeatTimer: null | ReturnType<typeof setInterval> = null;
  // 重连的定时器
  let reconnectTimer: null | ReturnType<typeof setTimeout> = null;
  // 业务消息防抖的定时器
  let funDebounceTimer: null | ReturnType<typeof setTimeout> = null;
  // 标记是否已手动关闭（组件卸载或主动 close 后置为 true，阻止异步 connect 继续创建连接）
  let isClosed = false;

  // 获取TOKEN
  const accessStore = useAccessStore();
  // 建立 WebSocket 连接的函数
  const connect = async () => {
    let url: string;
    // 获取 WebSocket 的连接路径，假设这是一个异步函数
    try {
      url = await getWebSocketPath(params.webSocketType);
    } catch (error) {
      // 获取路径失败（如接口异常）：记录日志并启动重连，避免 unhandled rejection
      console.error('获取 WebSocket 路径失败，准备重连', error);
      if (!isClosed) {
        startReconnect();
      }
      return;
    }
    // 若组件已卸载（close 已被调用），不再创建连接，避免连接与定时器泄漏
    if (isClosed) {
      return;
    }
    // 若已存在旧连接，先关闭旧连接，避免重连时旧连接残留
    if (socket.value) {
      socket.value.close();
    }
    // 创建一个新的 WebSocket 实例
    socket.value = new WebSocket(`${url}?${qs.stringify(params)}`);
    // 监听 WebSocket 的 'open' 事件，表示连接成功
    socket.value.addEventListener('open', () => {
      isConnected.value = true; // 更新连接状态为 true
      setTimeout(() => startHeartbeat(), 0);
    });
    // 监听 WebSocket 的 'message' 事件，处理接收到的消息
    socket.value.addEventListener('message', (event: MessageEvent) => {
      // 收到业务消息，重置心跳定时器（自动续期，实现"活跃即保活"）
      resetHeartbeat();
      // 业务消息防抖：不要同步直接执行 fun，抛到下一轮事件循环，释放 WebSocket 事件栈
      if (funDebounceTimer) {
        clearTimeout(funDebounceTimer);
      }
      funDebounceTimer = setTimeout(() => {
        try {
          fun(event.data);
        } catch (error) {
          console.error('ws 业务回调执行异常', error);
        }
        funDebounceTimer = null;
      }, 50);
    });
    // 监听 WebSocket 的 'close' 事件，表示连接关闭
    socket.value.addEventListener('close', (ev: CloseEvent) => {
      isConnected.value = false; // 更新连接状态为 false
      // 非手动关闭且非正常关闭（如网络中断），启动重连
      if (!isClosed && !ev.wasClean) {
        startReconnect();
      }
    });
    // 监听 WebSocket 的 'error' 事件，处理连接错误
    socket.value.addEventListener('error', (error: Event) => {
      console.error('WebSocket error:', error); // 打印错误日志
      isConnected.value = false;
      startReconnect(); // 启动重连机制
    });
  };

  // 发送消息的函数
  const sendMessage = (data: any) => {
    // 检查 WebSocket 是否处于 OPEN 状态
    if (socket.value && socket.value.readyState === WebSocket.OPEN) {
      // 将消息序列化为 JSON 格式并发送
      socket.value.send(JSON.stringify(data));
    }
  };

  // 关闭 WebSocket 连接的函数
  const close = () => {
    // 标记为已关闭，阻止异步 connect 竞态下继续创建连接
    isClosed = true;
    // 无论 socket 是否存在，都清除重连、心跳和防抖定时器，避免竞态下定时器泄漏
    clearTimeout(reconnectTimer!);
    clearInterval(heartbeatTimer!);
    clearTimeout(funDebounceTimer!);
    reconnectTimer = null;
    heartbeatTimer = null;
    funDebounceTimer = null;
    // 如果 WebSocket 实例存在，则关闭连接
    if (socket.value) {
      socket.value.close();
      socket.value = null;
    }
    isConnected.value = false;
  };

  // 启动心跳检测的函数
  const startHeartbeat = () => {
    // 若已关闭则不再启动心跳检测，避免定时器泄漏
    if (isClosed) {
      return;
    }
    // 先清除旧的心跳定时器，避免重复启动
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
    // 设置心跳检测定时器
    heartbeatTimer = setInterval(() => {
      // 若已关闭则停止心跳检测
      if (isClosed) {
        clearInterval(heartbeatTimer!);
        heartbeatTimer = null;
        return;
      }
      // 检查 WebSocket 是否处于 OPEN 状态
      if (socket.value && socket.value.readyState === WebSocket.OPEN) {
        // 发送心跳消息
        socket.value.send(
          JSON.stringify({
            type: 'heartbeat',
            token: accessStore.accessToken || '',
          }),
        );
      } else {
        // 如果 WebSocket 不处于 OPEN 状态，打印错误日志并关闭连接
        console.error('Heartbeat failed, closing connection');
        close();
      }
    }, heartbeatInterval);
  };

  // 重置心跳检测定时器：收到消息时调用，自动续期心跳
  const resetHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
    // 未关闭时重新启动心跳
    if (!isClosed) {
      startHeartbeat();
    }
  };

  // 启动重连机制的函数
  const startReconnect = () => {
    // 若已关闭则不再重连，避免卸载后仍发起连接
    if (isClosed) {
      return;
    }
    // 清除当前的重连定时器
    clearTimeout(reconnectTimer!);
    // 设置一个新的重连定时器
    reconnectTimer = setTimeout(connect, reconnectInterval);
  };

  // 在组件挂载时建立 WebSocket 连接
  onMounted(() => {
    void connect();
  });
  // 在组件卸载时关闭 WebSocket 连接
  onUnmounted(close);

  // 返回 WebSocket 的连接状态、发送消息、关闭连接与重新连接函数
  return {
    isConnected,
    sendMessage,
    close,
    connect,
  };
}
