# Text-to-Speech Demo

**You can checkout the full article on Scotch: [Building Text-to-Speech Apps for the Web](https://scotch.io/tutorials/building-text-to-speech-apps-for-the-web).**

This project contains a demo source code showing how to build a simple text-to-speech voice app for the web using the Web Speech API.

Here is a screenshot of the application demo(without the sound):

![Demo Application](https://i.imgur.com/cDsoaAk.gif)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. Before you begin, make sure you have [`npm`][npm] and [`node`][node] installed on your system.

Run the following commands to get started.

```sh
npm install
npm start
```

The app will run on port **`5000`** by default. If you would prefer another port, you can specify it in the `server.js` file. Look for the following line in the file and replace `5000` with your desired port.

```js
const PORT = process.env.PORT || 5000;
```


[node]: https://nodejs.org/en/
[npm]: https://npmjs.com/
