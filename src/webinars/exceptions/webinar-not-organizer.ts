export class WebinarNotOrganizerException extends Error {
  constructor() {
    super('User is not allowed to update this webinar');
    this.name = 'WebinarNotOrganizerException';
  }
}
