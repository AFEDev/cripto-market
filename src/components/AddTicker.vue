<template>
  <section>
    <div
      v-if="loading"
      class="fixed w-100 h-100 opacity-80 bg-purple-400 inset-0 z-50 flex items-center justify-center"
    >
      <loading-spinner />
    </div>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700"
          >Ticker</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="ticker"
            @keydown.enter="add"
            @input="search"
            type="text"
            name="wallet"
            id="wallet"
            class="px-2 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-gray-200"
            :class="showError ? 'border-red-500' : 'border-gray-300'"
            placeholder="DOGE, BTC, etc..."
          />
        </div>
        <div
          v-if="searchResult.length"
          class="flex bg-white shadow-md p-1 rounded-md flex-wrap"
        >
          <span
            v-for="r in searchResult"
            :key="r.Id"
            @click="selectSearchResult(r)"
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
          >
            {{ r.FullName }}
          </span>
        </div>
        <div v-if="showError" class="text-sm text-red-600">
          {{ errorText }}
        </div>
      </div>
    </div>
    <add-button @click="add" type="button" class="my-4" />
  </section>
</template>

<script>
import AddButton from "./AddButton.vue";
import LoadingSpinner from "./LoadingSpinner.vue";
import { loadAllTickersList } from "../api";

export default {
  components: {
    AddButton,
    LoadingSpinner,
  },

  props: {
    tickers: {
      type: Array,
      required: false,
    },
  },

  data() {
    return {
      ticker: "",
      searchResult: [],
      errorText: "",
      showError: false,
      allTickers: [],
      loading: true,
    };
  },

  async created() {
    this.allTickers = await loadAllTickersList();

    if (this.allTickers.length) {
      this.loading = false;
    }
  },

  methods: {
    add() {
      if (this.ticker === "") {
        this.errorText = "Enter ticker";
        return (this.showError = true);
      }

      const tickerAdded = this.tickers.filter((t) => {
        return t.name.toUpperCase() === this.ticker.toUpperCase();
      });

      if (tickerAdded.length) {
        this.errorText = "Ticker already exist";
        return (this.showError = true);
      }

      this.$emit("add-ticker", this.ticker.toUpperCase());
      this.ticker = "";
      this.searchResult = [];
    },

    search() {
      this.showError = false;
      let matches = 0;
      this.searchResult = this.allTickers.filter((name) => {
        if (
          name.FullName.toUpperCase().includes(this.ticker.toUpperCase()) &&
          matches < 4
        ) {
          matches++;

          return name;
        }
      });
      if (this.ticker === "") {
        this.searchResult = [];
      }
    },

    selectSearchResult(result) {
      this.ticker = result.Symbol;
      this.searchResult = [];
    },
  },
};
</script>
