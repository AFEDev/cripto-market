<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div class="container">
      <div class="w-full my-4"></div>

      <ModalWindow
        :modalContent="modalContent"
        @close-modal="closeModal"
        :openModal="openModal"
      />

      <add-ticker @add-ticker="add" :tickers="tickers" />

      <template v-if="tickers.length">
        <hr class="w-full border-t border-gray-600 my-2" />
        <div class="flex flex-col md:flex-row">
          <div class="py-4">
            <label
              for="filter"
              class="text-gray-700 select-none font-medium px-2"
              >Filter</label
            >

            <input
              v-model="filter"
              @input="page = 1"
              id="filter"
              type="text"
              name="filter"
              placeholder="Text..."
              class="px-2 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
          <div class="flex flex-row">
            <button
              @click="page = page - 1"
              type="button"
              class="disabled:opacity-50 my-4 mx-3 inline-flex items-center px-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              :disabled="page <= 1"
            >
              <!-- Heroicon name: solid/mail -->
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z"
                />
              </svg>
            </button>
            <p class="text-gray-700 select-none font-medium px-2 my-6">
              {{ page }} / {{ totalPages }}
            </p>
            <button
              @click="page = page + 1"
              type="button"
              class="disabled:opacity-50 my-4 mx-3 inline-flex items-center py-2 px-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              :disabled="page >= totalPages"
            >
              <!-- Heroicon name: solid/mail -->

              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
        </div>
        <hr class="w-full border-t border-gray-600 my-2" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="t in paginatedTickers"
            :key="t.name"
            @click="select(t)"
            :class="{
              'border-2': selectedTicker === t,
              'bg-red-200': t.price === '-',
            }"
            class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ t.name }} - EUR
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ formatPrice(t.price) }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              @click.stop="handleDelete(t)"
              class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path></svg
              >Delete
            </button>
          </div>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>

      <ticker-graph
        v-if="selectedTicker"
        :selected-ticker="selectedTicker"
        @close-graph="closeGraph"
      />
    </div>
  </div>
</template>

<script>
import AddTicker from "./components/AddTicker.vue";
import TickerGraph from "./components/TickerGraph.vue";
import ModalWindow from "./components/modalWindow/ModalWindow.vue";

import { subscribeToTicker, unsubscribeFromTicker } from "./api";

export default {
  name: "App",

  components: {
    AddTicker,
    TickerGraph,
    ModalWindow,
  },

  data() {
    return {
      tickers: [],
      selectedTicker: null,
      filter: "",
      page: 1,
      modalContent: {},
      openModal: false,
    };
  },

  emits: {
    closeGraph: {
      type: Boolean,
      required: false,
      default: false,
    },
    closeModal: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  async created() {
    const windowData = Object.fromEntries(
      new URL(window.location).searchParams.entries()
    );

    if (windowData.filter) {
      this.filter = windowData.filter;
    }

    if (windowData.page) {
      this.page = windowData.page;
    }

    const tickersData = localStorage.getItem("cryptolist");

    if (tickersData) {
      this.tickers = JSON.parse(tickersData);
      this.tickers.forEach((ticker) => {
        subscribeToTicker(ticker.name, (newPrice) => {
          this.updateTicker(ticker.name, newPrice);
        });
      });
    }
  },

  computed: {
    startIndex() {
      return (this.page - 1) * 6;
    },

    endIndex() {
      return this.page * 6;
    },

    filteredTickers() {
      return this.tickers.filter((ticker) =>
        ticker.name.toLowerCase().includes(this.filter.toLowerCase())
      );
    },

    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    },

    totalPages() {
      return Math.ceil(this.filteredTickers.length / 6);
    },

    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page,
      };
    },
  },

  methods: {
    updateTicker(tickerName, price) {
      this.tickers.map((t) => {
        if (t.name === tickerName) {
          t.price = price;
        }
      });
    },

    formatPrice(price) {
      if (price === "-") {
        return price;
      }
      return price > 1 ? price.toFixed(2) : price.toPrecision(2);
    },

    add(ticker) {
      const currentTicker = {
        name: ticker,
        price: "-",
      };

      this.tickers = [...this.tickers, currentTicker];
      this.filter = "";
      subscribeToTicker(currentTicker.name, (newPrice) =>
        this.updateTicker(currentTicker.name, newPrice)
      );
    },

    select(ticker) {
      this.selectedTicker = ticker;
    },

    handleDelete(tickerToRemove) {
      this.tickers = this.tickers.filter((t) => t !== tickerToRemove);
      if (this.selectedTicker === tickerToRemove) {
        this.selectedTicker = null;
      }
      unsubscribeFromTicker(tickerToRemove.name);
      this.showModal(tickerToRemove.name);
    },

    closeGraph() {
      this.selectedTicker = null;
    },

    closeModal() {
      console.log("close m parent");
      this.modalContent = null;
      this.openModal = false;
    },

    showModal(tickerName) {
      if (this.openModal) {
        return;
      }
      this.modalContent = {
        title: "Removed ticker",
        content: `You removed ticker ${tickerName}`,
      };

      console.log("moda", this.modalContent);
      this.openModal = true;
    },
  },

  watch: {
    tickers() {
      localStorage.setItem("cryptolist", JSON.stringify(this.tickers));
    },

    paginatedTickers() {
      if (this.paginatedTickers.length === 0 && this.page > 1) {
        this.page -= 1;
      }
    },

    filter() {
      this.page = 1;
    },

    pageStateOptions(value) {
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}?filter=${value.filter}&page=${value.page}`
      );
    },
  },
};
</script>

<style></style>
