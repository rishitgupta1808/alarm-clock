const Alarm = require("./alarm");
const { EventEmitter } = require("events");
const Scheduler = require("./scheduler");

class AlarmClock {
  constructor() {
    this.alarms = [];
    this.emitter = new EventEmitter();
    this.scheduler = new Scheduler(this.emitter);
    this.latestAlarm = null;
  }

  addAlarm(time, day = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()) {
    if (this.alarmExists(time, day)) {
      console.log(`Alarm for ${time} on ${day} already exists`);
      return;
    }

    const currentTime = new Date();
    const [hour, minute] = time.split(":").map(Number);
    const alarmTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), hour, minute);
    if (alarmTime < currentTime) {
      alarmTime.setDate(alarmTime.getDate() + 7); // Set for the same time next week
      day = alarmTime.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    }

    const alarm = new Alarm(time, day);
    this.alarms.push(alarm);
    this.scheduler.scheduleAlarm(alarm);
    this.latestAlarm = alarm;
    console.log(`Alarm set for ${time} on ${day} for ${alarmTime.toLocaleDateString()}`);
  }

  deleteAlarmByIndex(index) {
    if (index >= 1 && index <= this.alarms.length) {
      const alarm = this.alarms[index - 1];
      this.scheduler.removeScheduledAlarm(alarm);
      this.alarms.splice(index - 1, 1);
      if (this.latestAlarm === alarm) {
        this.latestAlarm = null;
      }
      console.log(`Alarm for ${alarm.time} on ${alarm.day} deleted`);
    } else {
      console.log("Alarm index out of bounds");
    }
  }
  snoozeLatestAlarm() {
    if (this.latestAlarm) {
      const success = this.latestAlarm.snooze();
      if (success) {
        this.scheduler.scheduleAlarm(this.latestAlarm);
        console.log(`Latest alarm snoozed to ${this.latestAlarm.time}`);
      } else {
        console.log("Snooze limit reached");
      }
    } else {
      console.log("No alarm to snooze");
    }
  }

  alarmExists(time, day) {
    return this.alarms.some((alarm) => alarm.time === time && alarm.day === day);
  }

  displayCurrentTime() {
    const now = new Date();
    console.log(now.toLocaleTimeString("en-US", { hour12: false }));
  }

  displayAllAlarms() {
    if (this.alarms.length === 0) {
      console.log("No alarms set.");
      return;
    }
    console.log("List of all set alarms:");
    this.alarms.forEach((alarm, index) => {
      console.log(`${index + 1}: Alarm set for ${alarm.time} on ${alarm.day}`);
    });
  }
}

module.exports = AlarmClock;
