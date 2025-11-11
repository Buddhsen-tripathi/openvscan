import ms from 'ms';

export function convertToSeconds(timeString: string) {
  const timeInMilliSeconds = ms(timeString);

  return Math.floor(timeInMilliSeconds / 1000);
}
