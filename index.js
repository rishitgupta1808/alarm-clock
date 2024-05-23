const readline = require('readline');
const { EventEmitter } = require('events');
const cron = require('node-cron');

class Alarm {
    constructor(time, day) {
        this.time = time; // time in "HH:MM" format
        this.day = day.toLowerCase(); // day of the week in "Monday", "Tuesday", etc.
        this.snoozeCount = 0;
        this.snoozeLimit = 3;
    }

    snooze() {
        if (this.snoozeCount < this.snoozeLimit) {
            this.snoozeCount++;
            let [hour, minute] = this.time.split(':').map(Number);
            minute += 5;
            if (minute >= 60) {
                minute -= 60;
                hour = (hour + 1) % 24;
            }
            this.time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            return true;
        }
        return false;
    }
}

class AlarmClock {
    constructor() {
        this.alarms = [];
        this.emitter = new EventEmitter();
        this.cronJobs = {};
        this.latestAlarm = null;
    }

    displayCurrentTime() {
        const now = new Date();
        console.log(now.toLocaleTimeString());
    }

    addAlarm(time, day) {
        if (this.alarmExists(time, day)) {
            console.log(`Alarm for ${time} on ${day} already exists`);
            return;
        }
        
        const alarm = new Alarm(time, day);
        this.alarms.push(alarm);
        this.scheduleAlarm(alarm);
        this.latestAlarm = alarm;
        console.log(`Alarm set for ${time} on ${day}`);
    }

    deleteAlarm(time, day) {
        const index = this.alarms.findIndex(alarm => alarm.time === time && alarm.day === day);
        if (index >= 0) {
            this.removeScheduledAlarm(index);
            this.alarms.splice(index, 1);
            if (this.latestAlarm && this.latestAlarm.time === time && this.latestAlarm.day === day) {
                this.latestAlarm = null;
            }
            console.log(`Alarm for ${time} on ${day} deleted`);
        } else {
            console.log('Alarm not found');
        }
    }

    snoozeLatestAlarm() {
        if (this.latestAlarm) {
            const success = this.latestAlarm.snooze();
            if (success) {
                this.scheduleAlarm(this.latestAlarm);
                console.log(`Latest alarm snoozed to ${this.latestAlarm.time}`);
            } else {
                console.log('Snooze limit reached');
            }
        } else {
            console.log('No alarm to snooze');
        }
    }

    scheduleAlarm(alarm) {
        const [hour, minute] = alarm.time.split(':').map(Number);
        const cronExpression = `${minute} ${hour} * * ${this.getDayIndex(alarm.day)}`;
        const jobKey = `${alarm.time}-${alarm.day}`;
        
        if (this.cronJobs[jobKey]) {
            this.cronJobs[jobKey].stop();
        }
        this.cronJobs[jobKey] = cron.schedule(cronExpression, () => {
            console.log(`Alarm ringing: ${alarm.time} on ${alarm.day}`);
            this.emitter.emit('alarmRinging', alarm);
        });
    }

    removeScheduledAlarm(index) {
        const alarm = this.alarms[index];
        const jobKey = `${alarm.time}-${alarm.day}`;
        if (this.cronJobs[jobKey]) {
            this.cronJobs[jobKey].stop();
            delete this.cronJobs[jobKey];
        }
    }

    alarmExists(time, day) {
        return this.alarms.some(alarm => alarm.time === time && alarm.day === day);
    }

    getDayIndex(day) {
        const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        return days.indexOf(day);
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const alarmClock = new AlarmClock();

alarmClock.emitter.on('alarmRinging', (alarm) => {
    console.log(`Alarm is ringing for ${alarm.time} on ${alarm.day}. Type 'snooze' to snooze, or 'delete ${alarm.time} ${alarm.day}' to delete the alarm.`);
    alarmClock.latestAlarm = alarm;
});

function handleInput(input) {
    const [command, ...args] = input.split(' ');

    switch (command) {
        case 'time':
            alarmClock.displayCurrentTime();
            break;
        case 'set':
            if (args.length !== 2) {
                console.log('Usage: set HH:MM day');
                break;
            }
            const [time, day] = args;
            alarmClock.addAlarm(time, day);
            break;
        case 'delete':
            if (args.length !== 2) {
                console.log('Usage: delete HH:MM day');
                break;
            }
            alarmClock.deleteAlarm(args[0], args[1]);
            break;
        case 'snooze':
            alarmClock.snoozeLatestAlarm();
            break;
        case 'exit':
            rl.close();
            console.log("Clock terminated...");
            process.exit(1);
            break;
        default:
            console.log('Unknown command');
    }
}

rl.on('line', (input) => {
    handleInput(input);
});

console.log('Alarm Clock started. Type commands to interact with it.');
console.log('Acction : command : Example');
console.log('\n1. Display current time : time');
console.log('2. Add an alarm : set HH:MM day : set 11:24 thursday');
console.log('3. Delete an alarm : delete HH:MM day : delete 11:24 thursday');
console.log('4. Snooze latest alarm : snooze');
console.log('5. Exit : exit\n');
