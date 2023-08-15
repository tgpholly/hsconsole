# hsconsole &nbsp; [![CodeFactor](https://www.codefactor.io/repository/github/tgpholly/hsconsole/badge)](https://www.codefactor.io/repository/github/tgpholly/hsconsole) &nbsp; [![Node.js CI](https://github.com/tgpholly/hsconsole/actions/workflows/node.js.yml/badge.svg?branch=master)](https://github.com/tgpholly/hsconsole/actions/workflows/node.js.yml) &nbsp; [![npm](https://img.shields.io/npm/v/hsconsole)](https://www.npmjs.com/package/hsconsole)
I've been using this logger code since I started the move of all my applications to TypeScript with some modifications. It's based on an even earlier version initially started in [Revolution](https://github.com/tgpholly/Revolution). Since it's essentially the same every time I decided to make it an NPM package so I can reuse it.
## What does this do
hsconsole logs to the console in a clean, formatted and readable way while also writing to log files on disk. All logs are kept until you decide to delete them.
## Usage
Import the `Console` class from hsconsole
```js
const { Console } = require("hsconsole");
```
```ts
import { Console } from "hsconsole";
```
and use it by calling either `printInfo`, `printWarn` or `printError`.

You can also specify a custom header to prepend to the start of the log file using `customHeader` as follows:
```ts
Console.customHeader(`xyz started at ${new Date()}`);
```
This must be called this before anything is logged to the console!

## Cleaning up
It is **important** that you tell hsconsole to clean up before your application closes (i.e in the event of a CTRL+C) so it can be ensured that all log text is flushed to disk and to allow hsconsole to rename the latest log to the date your application was started.
You can do this by calling `cleanup` in, for example, a **SIGINT** event handler:
```ts
process.on("SIGINT", signal => {
	Console.cleanup();
});
```
The above should work on both *nix and Windows systems.
