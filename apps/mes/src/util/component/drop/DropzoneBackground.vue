<script lang="ts" setup>
import { Background } from '@vue-flow/background';
</script>

<template>
  <div class="relative h-full w-full">
    <Background
      :size="2"
      :gap="20"
      pattern-color="#BDBDBD"
      class="bg-[#f1f3f6]"
    />

    <div
      class="let-0 pointer-events-none absolute top-0 z-[9999] flex h-full w-full items-center justify-center"
    >
      <slot></slot>
    </div>
  </div>
</template>
