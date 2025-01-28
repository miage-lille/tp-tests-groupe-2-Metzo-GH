export class WebinarReduceSeatsException extends Error {
  constructor() {
    super('You cannot reduce the number of seats');
    this.name = 'WebinarReduceSeatsException';
  }
}
