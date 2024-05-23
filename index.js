const readline = require("readline");
const AlarmClock = require("./alarmClock");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const alarmClock = new AlarmClock();

alarmClock.emitter.on("alarmRinging", (alarm) => {
  console.log(`z...z...z Alarm is ringing for ${alarm.time} on ${alarm.day}. Type 'snooze' to snooze. z...z...z..`);
  alarmClock.latestAlarm = alarm;
});
function handleInput(input) {
  const [command, ...args] = input.trim().split(" ");

  switch (command.toLowerCase()) {
    case "time":
      alarmClock.displayCurrentTime();
      break;
    case "set":
      if (args.length < 1) {
        console.log("Usage: set HH:MM day");
        rl.prompt();
        break;
      }
      const [time, day] = args;
      if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
        console.log("Invalid time format. Please use HH:MM format.");
        rl.prompt();
        break;
      }
      const currentDay = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
      const alarmDay = day ? day.toLowerCase() : currentDay;
      if (day && !["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].includes(alarmDay)) {
        console.log("Invalid day. Please enter a valid day of the week.");
        rl.prompt();
        break;
      }
      rl.question(`Setting alarm for ${time} on ${alarmDay}. Press Enter to continue...`, () => {
        alarmClock.addAlarm(time, alarmDay);
        rl.prompt();
      });
      break;
    case "delete":
      if (args.length !== 1) {
        console.log("Usage: delete index");
        rl.prompt();
        break;
      }
      const index = parseInt(args[0], 10);
      if (isNaN(index) || index < 1 || index > alarmClock.alarms.length) {
        console.log("Invalid index. Please enter a valid number.");
        rl.prompt();
        break;
      }
      rl.question(`Deleting alarm at index ${index}. Press Enter to continue...`, () => {
        alarmClock.deleteAlarmByIndex(index);
        rl.prompt();
      });
      break;
    case "snooze":
      rl.question("Snoozing latest alarm. Press Enter to continue...", () => {
        alarmClock.snoozeLatestAlarm();
        rl.prompt();
      });
      break;
    case "list":
      alarmClock.displayAllAlarms();
      break;
    case "exit":
      console.log("Clock terminated...");
      rl.close();
      break;
    default:
      console.log("Unknown command");
      rl.prompt();
  }
}

rl.on("line", handleInput).on("close", () => {
  console.log("Exiting the Alarm Clock application.");
  process.exit(0);
});

rl.prompt();
console.log("Alarm Clock started. Type commands to interact with it.");
console.log("Action : command : Example");
console.log("\n1. Display current time : time");
console.log("2. Add an alarm : set HH:MM day : set 11:24 thursday");
console.log("3. Delete an alarm by index : delete index : delete 1");
console.log("4. Snooze latest alarm : snooze");
console.log("5. Exit : exit\n");
