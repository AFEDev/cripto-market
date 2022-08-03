const tickers = new Map();

export const loadTickers = (tickers) =>
  //TODO refactor to URL search params
  fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${tickers.join(
      ","
    )}&tsyms=EUR&api_key=${process.env.VUE_APP_MY_API_KEY}`
  ).then((r) =>
    r
      .json()
      .then((rawData) =>
        Object.fromEntries(
          Object.entries(rawData).map(([key, value]) => [key, value.EUR])
        )
      )
  );

//websocket

// export const subscribeToTickers = (ticker, cb) => {
//   const subscribers = tickers.get(ticker) || [];
//   tickers.set(ticker, [...subscribers, cb]);
// };

// export const unsubscribeToTickers = (ticker, cb) => {
//   const subscribers = tickers.get(ticker) || [];
//   tickers.set(
//     ticker,
//     subscribers.filter((fn) => fn !== cb)
//   );
// };
