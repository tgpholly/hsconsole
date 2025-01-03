import * as dyetty from "dyetty";
import { createWriteStream, mkdirSync, existsSync, renameSync } from "fs";

console.clear();

enum LogType {
	INFO,
	WARN,
	ERROR
}

enum LogTag {
	INFO,
	WARN,
	ERROR
}

const LogTags = [
	dyetty.bgGreen(dyetty.black("  INFO  ")),
	dyetty.bgYellow(dyetty.black("  WARN  ")),
	dyetty.bgRed("  ERRR  ")
] as const;

const TagsForFile = [
	"[INFO]",
	"[WARN]",
	"[ERROR]"
] as const;

function zeroPad(i:number) : string {
	if (i <= 9) return `0${i}`;
	else return i.toString();
}

function getTime() : string {
	const time = new Date();
	return `[${zeroPad(time.getHours())}:${zeroPad(time.getMinutes())}:${zeroPad(time.getSeconds())}]`;
}

let queuedForLog = "";
const LOG_FILE_REGEX = /\x1B\[(\d.m|.m)/gm;

function log(tag:LogTag, log:string, logType:LogType) : void {
	const stringTime = getTime(),
		  fileTag = TagsForFile[tag],
		  consoleTag = LogTags[tag];

	queuedForLog += `${stringTime} ${fileTag} ${log.replace(LOG_FILE_REGEX, "")}\n`;
	switch (logType) {
		case LogType.INFO:
			return console.log(`${dyetty.green(stringTime)} ${consoleTag} ${log}`);
		case LogType.WARN:
			return console.warn(`${dyetty.green(stringTime)} ${consoleTag} ${log}`);
		case LogType.ERROR:
			return console.error(`${dyetty.green(stringTime)} ${consoleTag} ${log}`);
	}
}

if (!existsSync("./logs")) {
	mkdirSync("./logs/");
}

function flushLogQueueToDisk() {
	if (queuedForLog.length !== 0) {
		const strRef = queuedForLog;
		queuedForLog = "";
		logFileWriteStream.write(strRef);
	}
}

// Open write stream to log file
const logFileWriteStream = createWriteStream("./logs/latest.log");
let flushTimer:NodeJS.Timeout = setInterval(flushLogQueueToDisk, 5000);
const startTime = new Date();
let cleaningUp = false;

export abstract class Console {
	public static customHeader(s:string) : void {
		const headerLines = s.replaceAll("\r", "").split("\n");
		if (headerLines.length === 0) {
			return;
		}

		let textToLog = "";
		for (const line of headerLines) {
			textToLog += `# ${line}`;
		}

		queuedForLog += `${textToLog}\n`;
	}

	public static flushInterval(i:number) {
		clearInterval(flushTimer);
		flushTimer = setInterval(flushLogQueueToDisk, i);
	}

	public static cleanup() {
		if (cleaningUp) {
			return;
		}
		cleaningUp = true;
		clearInterval(flushTimer);
		flushLogQueueToDisk();
		logFileWriteStream.close();

		renameSync("./logs/latest.log", `./logs/${zeroPad(startTime.getFullYear())}-${zeroPad(startTime.getMonth())}-${zeroPad(startTime.getDate())}_${zeroPad(startTime.getHours())}-${zeroPad(startTime.getMinutes())}-${zeroPad(startTime.getSeconds())}.log`);
	}

	public static printInfo(s:string) : void {
		log(LogTag.INFO, s, LogType.INFO);
	}

	public static printWarn(s:string) : void {
		log(LogTag.WARN, s, LogType.WARN);
	}

	public static printError(s:string) : void {
		log(LogTag.ERROR, s, LogType.ERROR);
	}
}