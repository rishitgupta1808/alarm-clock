const cron = require("node-cron");

class Scheduler {
  constructor(emitter) {
    this.cronJobs = {};
    this.emitter = emitter;
  }

  scheduleAlarm(alarm) {
    const [hour, minute] = alarm.time.split(":").map(Number);
    const dayIndex = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].indexOf(alarm.day);
    const cronExpression = `${minute} ${hour} * * ${dayIndex}`;
    const jobKey = `${alarm.time}-${alarm.day}`;

    if (this.cronJobs[jobKey]) {
      this.cronJobs[jobKey].stop();
    }
    this.cronJobs[jobKey] = cron.schedule(cronExpression, () => {
      console.log(`Alarm ringing: ${alarm.time} on ${alarm.day}`);
      this.emitter.emit("alarmRinging", alarm);
    });
  }

  removeScheduledAlarm(alarm) {
    const jobKey = `${alarm.time}-${alarm.day}`;
    if (this.cronJobs[jobKey]) {
      this.cronJobs[jobKey].stop();
      delete this.cronJobs[jobKey];
    }
  }
}

module.exports = Scheduler;
