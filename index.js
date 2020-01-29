var https = require("https");
var request = require("request");


const oled = require("oled-js");
const five = require("johnny-five");
const font = require("oled-font-5x7");
const width = 128;
const height = 164;
const board = new five.Board();
const lineSpacing = 2;
const fontSize = 1;

const STOCK = "TSLA";
const APIKEY = require("./apikey");

var url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${STOCK}&interval=5min&outputsize=compact&apikey=${APIKEY}`;

var open = 0;
var high = 1;
var low = 2;
var close = 3;
var volume = 4;

var getStockInfo = (url, callback) => {
  var body = "";
  https
    .get(url, function(res) {
      res.on("data", function(chunk) {
        body += chunk;
      });

      res.on("end", data => {
        callback(body);
      });
    })
    .on("error", function(e) {
      console.log("Got an error: ", e);
    });
};

var getResObj = (object, keys) => {
  return {
    openVal: object[keys[open]],
    highVal: object[keys[high]],
    lowVal: object[keys[low]],
    closeVal: object[keys[close]],
    volumeVal: object[keys[volume]]
  };
}


board.on("ready", () => {
    console.log("board ready!");
  
    const options = {
      width,
      height,
      address: 0000
    };
  
    const screen = new oled(board, five, options);
    screen.clearDisplay();
    screen.update();
  
    screen.setCursor(1, 1);

    setInterval(() => {
        getStockInfo(url, body => {
          const obj = JSON.parse(body);
          var access = obj["Time Series (5min)"];
      
          if (access === undefined || access === null) {
          } else {
            var objKeys = Object.keys(access);
            var latestResObj = obj["Time Series (5min)"][objKeys[0]];
            var finalKeys = Object.keys(latestResObj);
      
            const o = getResObj(latestResObj, finalKeys);
      
            const result = `${STOCK} Stock Ticker   Open: ${o.openVal} High: ${o.highVal} Low: ${o.lowVal} Close: ${o.closeVal} Volume: ${o.volumeVal} `;
      
            screen.writeString(font, fontSize, result, 1, true, lineSpacing);
          }
        });
      }, 10000);

  });



  getStockInfo(url, body => {
    const obj = JSON.parse(body);
    var access = obj["Time Series (5min)"];

    if (access === undefined || access === null) {
    } else {
      var objKeys = Object.keys(access);
      var latestResObj = obj["Time Series (5min)"][objKeys[0]];
      var finalKeys = Object.keys(latestResObj);

      const o = getResObj(latestResObj, finalKeys);

      const result = `${STOCK} Stock Ticker   Open: ${o.openVal} High: ${o.highVal} Low: ${o.lowVal} Close: ${o.closeVal} Volume: ${o.volumeVal} `;

      console.log(result);
    }
  });
  

