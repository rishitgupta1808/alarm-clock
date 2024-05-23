class Alarm {
  constructor(time, day) {
    this.time = time;
    this.day = day.toLowerCase();
    this.snoozeCount = 0;
    this.snoozeLimit = 3;
  }

  snooze() {
    if (this.snoozeCount < this.snoozeLimit) {
      this.snoozeCount++;
      let [hour, minute] = this.time.split(":").map(Number);
      minute += 5;
      if (minute >= 60) {
        minute -= 60;
        hour = (hour + 1) % 24;
      }
      this.time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      return true;
    }
    return false;
  }
}

module.exports = Alarm;
