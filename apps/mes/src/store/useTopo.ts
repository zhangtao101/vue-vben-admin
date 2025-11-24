// src/stores/topo.ts
import { defineStore } from 'pinia';

export const useTopoStore = defineStore('topo', {
  state: () => ({
    mqttData: {} as any,
  }),
  actions: {
    setMqttData(payload: any) {
      this.mqttData = payload;
    },
  },
});
