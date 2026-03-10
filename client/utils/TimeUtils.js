import Moment from 'moment';
import padStart from 'lodash/padStart';

const ZERO_PAD_LENGTH = 2;

function padZero(number, length = ZERO_PAD_LENGTH) {
  return padStart(`${number}`, length, '0');
}

export default class TimeUtils {
  static durationToTime(duration) {
    const durationObject = Moment.duration(duration);
    const hour = padZero(durationObject.hours());
    const minutes = padZero(durationObject.minutes());
    const seconds = padZero(durationObject.seconds());

    return [hour, minutes, seconds].join(':');
  }
}
