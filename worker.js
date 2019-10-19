const axios = require('axios').default;
const { Client, logger, Variables } = require('camunda-external-task-client-js');

// configuration for the Client:
//  - 'baseUrl': url to the Process Engine
//  - 'logger': utility to automatically log important events
//  - 'asyncResponseTimeout': long polling timeout (then a new request will be issued)
const config = { baseUrl: 'http://localhost:8080/engine-rest', use: logger, asyncResponseTimeout: 10000 };

// create a Client instance with custom configuration
const client = new Client(config);

client.subscribe('get-savings', async function({ task, taskService }) {
  axios.get('api.openweathermap.org/data/2.5/weather?q=Munich&appId=d3cd514def11bf6d9cc019fe3fb2e08e')
  .then(function (response) {
    // handle success
    console.log(response.weather);
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
console.log("Savings acquired")
const processVariables = new Variables();
  processVariables.set("result", "1000");

  await taskService.complete(task, processVariables);
});

client.subscribe('get-weather', async function({ task, taskService }) {

  axios.get('api.openweathermap.org/data/2.5/weather?q=Munich&appId=d3cd514def11bf6d9cc019fe3fb2e08e')
  .then(function (response) {
    // handle success
    console.log(response.weather);
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
  console.log("Weather acquired")
  const processVariables = new Variables();

  //Weather = Value / 29,42
    processVariables.set("result", "1000");
  
    await taskService.complete(task, processVariables);
  });

