# css-roulette-spinner
A roulette style spinner built entirely using modern CSS, HTML, and JS.

You create the spinner by:
```js
var rouletteConfig = [
{name: "Basic", weight: 0.5, color: "Red"},
{name: "Rare", weight: 0.4, color: "Blue"},
{name: "Secret", weight: 0.1, color: "Green"},
];
var roulette = new Roulette(rouletteConfig);
document.body.appendChild(roulette.getElement());
```

A full example can be found in [this html file.](index.html)

The spinner looks like this

![alt text](https://i.imgur.com/fCnDAcnl.jpg "Logo Title Text 1")
