<template>
  <div>
    <div
      v-for="listIndex in 3"
      :key="listIndex"
      class="packing-list-box"
    >
      <h2>Packing List #{{ listIndex }}</h2>
      <ul>
        <li
          v-for="itemIndex in 4"
          :key="itemIndex"
        >
          Item {{ itemIndex }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.packing-list-box {
    border: 1px solid #ccc;
    padding: 16px;
    margin-bottom: 24px;
    border-radius: 8px;
    background: #f9f9f9;
}
</style>