const axios = require('axios').default;
const { Client, logger, Variables } = require('camunda-external-task-client-js');

// configuration for the Client:
//  - 'baseUrl': url to the Process Engine
//  - 'logger': utility to automatically log important events
//  - 'asyncResponseTimeout': long polling timeout (then a new request will be issued)
const config = { baseUrl: 'http://localhost:8080/engine-rest', use: logger, asyncResponseTimeout: 10000 };

// create a Client instance with custom configuration
const client = new Client(config);

client.subscribe('get-weather', async function({ task, taskService }) {
  var weather;
  var goodWeather = false;
  const processVariables = new Variables();

  axios.get('https://api.openweathermap.org/data/2.5/weather?q=Munich&appId=d3cd514def11bf6d9cc019fe3fb2e08e')
  .then(function (response) {
    // handle success
    // get weather and calculate to celsius
    weather = response.data.main.temp / 29.44;
    console.log(weather)
    
    //Wife gets snappy if the weather is bad and will argue about our crypto decision
    if(weather>10){
      goodWeather = true;
    }
  
    weather = weather.toString().substring(0,3);
    weather = "" + weather + "°C in Munich"
    processVariables.set("weather", weather);
    processVariables.set("goodWeather", goodWeather);
    console.log(goodWeather)
    console.log(weather)
    taskService.complete(task, processVariables);
  })
  .catch(function (error) {
    // handle error
    console.log(error);
    taskService.complete(task, processVariables);
  })  
});

client.subscribe('get-savings', async function({ task, taskService }) {
  const savings = 1000;
  console.log("Savings: " + savings)
  const processVariables = new Variables();
  processVariables.set("savings", savings);
  await taskService.complete(task, processVariables);
});

client.subscribe('get-crypto-info', async function({ task, taskService }) {
  
  const processVariables = new Variables();
  
  const config = {
    headers: {
      'X-CMC_PRO_API_KEY': '11c322b8-05b8-4370-bb63-52b69ced5873'
    }
  }

  //Get current prices for bitcoin, ethereum and litecoin
  const url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest";
  axios.get(url, config).then((response) => {
    /* console.log(response.data.data.find(item => item.id === 1))
    console.log(response.data.data.find(item => item.id === 1027))
    console.log(response.data.data.find(item => item.id === 2)) */
    var bitcoin = "" + response.data.data[0].quote.USD.price
    bitcoin = bitcoin .substr(0,bitcoin.indexOf('.'))
    var ethereum = "" + response.data.data[1].quote.USD.price
    ethereum = ethereum.substr(0,ethereum.indexOf('.'))
    var litecoin = "" + response.data.data[5].quote.USD.price
    litecoin = litecoin.substr(0,litecoin.indexOf('.'))
    processVariables.set("bitcoin", bitcoin);
    processVariables.set("ethereum", ethereum);
    processVariables.set("litecoin", litecoin);

    taskService.complete(task, processVariables)
  });
});

client.subscribe('calculate-purchase', async function({ task, taskService }) {
  const currency = task.variables.get("currency");
  const savings = task.variables.get("savings");
  //get cost by selected currency
  const cost = task.variables.get(currency);

  console.log("Currency: " + currency)
  console.log("savings: " + savings)
  console.log("cost: " + cost)
  // check if client has enough savings for the purchase
  var enoughSavings = false;
  if(savings>=cost) enoughSavings = true;

  const processVariables = new Variables();
  processVariables.set("enoughSavings", enoughSavings);
  processVariables.set("cost", cost);
  
    await taskService.complete(task, processVariables);
  });