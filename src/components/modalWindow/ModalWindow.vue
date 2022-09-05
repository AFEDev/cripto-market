<template>
  <div
    v-if="isOpen"
    class="flex items-center justify-center fixed left-0 bottom-0 w-full h-full bg-gray-300 bg-opacity-75 z-10"
    @click="closeModal"
  >
    <div
      class="bg-gray-100 rounded-lg w-1/2 border border-blue-500 overflow-hidden"
      @click.stop
    >
      <div class="flex flex-col items-start">
        <div class="flex w-full bg-blue-300 p-2">
          <div class="text-gray-900 font-medium text-lg">
            {{ modalContent.title }}
          </div>
          <svg
            class="ml-auto fill-current text-gray-700 w-6 h-6 cursor-pointer"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 18 18"
            @click="closeModal"
          >
            <path
              d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"
            />
          </svg>
        </div>
        <hr />
        <div class="p-4">
          {{ modalContent.content }}
        </div>
        <hr />
        <div class="flex flex-row justify-around w-full bg-gray-100 p-2">
          <slot name="actions" :closeModal="closeModal"> </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    modalContent: {
      type: Object,
      required: false,
    },
    isOpen: {
      type: Boolean,
      required: false,
    },
  },

  emits: {
    closeModal: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  mounted() {
    document.addEventListener("keydown", this.handleKeyDown);
  },

  beforeUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  },

  methods: {
    handleKeyDown(e) {
      if (this.isOpen && e.key === "Escape") {
        this.closeModal();
      }
    },

    closeModal() {
      this.$emit("closeModal");
    },
  },
};
</script>
