let tickersHandlers = new Map();
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${process.env.VUE_APP_MY_API_KEY}`
);

let BTCpriceInEUR = 0;
const AGGREGATE_INDEX = "5";
const INVALID_SUB = "500";

const bc = new BroadcastChannel("test_channel");

socket.addEventListener("message", (e) => {
  let {
    TYPE: type,
    FROMSYMBOL: currency,
    TOSYMBOL: currencyTo,
    PRICE: newPrice,
  } = JSON.parse(e.data);

  if (type !== AGGREGATE_INDEX || newPrice === undefined) {
    if (type === INVALID_SUB) {
      console.log("currency 500", e);
      handleResponseError(e);
      return;
    }
    return;
  }

  console.log("after if", newPrice);
  console.log("after if", e);

  if (currency === "BTC") {
    BTCpriceInEUR = newPrice;
  }

  if (currencyTo !== "EUR") {
    newPrice *= BTCpriceInEUR;
  }

  bc.postMessage({ currency, newPrice });

  const handlers = tickersHandlers.get(currency) ?? [];
  handlers.forEach((fn) => fn(newPrice));
});

bc.onmessage = (m) => {
  const handlers = tickersHandlers.get(m.data.currency) ?? [];
  handlers.forEach((fn) => fn(m.data.newPrice));
};

//API method:

// export const loadTickers = () => {
//   //TODO refactor to URL search params
//   if (tickersHandlers.size === 0) {
//     return;
//   }

//   fetch(
//     `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[
//       ...tickersHandlers.keys(),
//     ].join(",")}&tsyms=EUR&api_key=${process.env.VUE_APP_MY_API_KEY}`
//   )
//     .then((r) => r.json())
//     .then((rawData) => {
//       const updatedPrices = Object.fromEntries(
//         Object.entries(rawData).map(([key, value]) => [key, value.EUR])
//       );
//       Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
//         const handlers = tickersHandlers.get(currency) ?? [];
//         handlers.forEach((fn) => fn(newPrice));
//       });
//     });
// };

export const loadAllTickersList = () =>
  fetch(
    "https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
  ).then((r) =>
    r
      .json()
      .then((responseJson) =>
        Object.entries(responseJson.Data).map((data) => data[1])
      )
  );

function handleResponseError(e) {
  const { TYPE: type, PARAMETER: sendedParameter } = JSON.parse(e.data);

  console.log(sendedParameter);

  const sendedParameters = {
    currencyTo: sendedParameter.split("~")[3],
    currencyFrom: sendedParameter.split("~")[2],
  };

  if (sendedParameters.currencyTo === "BTC") {
    const handlers = tickersHandlers.get(sendedParameters.currencyFrom) ?? [];
    handlers.forEach((fn) => fn("-"));
    return;
  }

  subscribeToTickerOnWs(sendedParameters.currencyFrom, "BTC");
}

function sendToWebSocket(message) {
  const stringifiedMessage = JSON.stringify(message);

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }

  socket.addEventListener(
    "open",
    () => {
      socket.send(stringifiedMessage);
    },
    { once: true }
  );
}

function subscribeToTickerOnWs(ticker, currencyTo = "EUR") {
  sendToWebSocket({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~${currencyTo}`],
  });
}

function unsubscribeFromTickerOnWs(ticker, currencyTo = "EUR") {
  sendToWebSocket({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~${currencyTo}`],
  });
}

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
  subscribeToTickerOnWs(ticker);
};

export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);
  unsubscribeFromTickerOnWs(ticker);
};
