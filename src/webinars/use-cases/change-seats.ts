import { Executable } from 'src/shared/executable';
import { User } from 'src/users/entities/user.entity';
import { WebinarNotFoundException } from 'src/webinars/exceptions/webinar-not-found';
import { WebinarNotOrganizerException } from 'src/webinars/exceptions/webinar-not-organizer';
import { WebinarReduceSeatsException } from 'src/webinars/exceptions/webinar-reduce-seats';
import { WebinarTooManySeatsException } from 'src/webinars/exceptions/webinar-too-many-seats';
import { IWebinarRepository } from 'src/webinars/ports/webinar-repository.interface';
type Request = {
  user: User;
  webinarId: string;
  seats: number;
};

//type Response = void; dummy n'a pas besoins d'alias

export class ChangeSeats implements Executable<Request, void> {
  constructor(private readonly webinarRepository: IWebinarRepository) {}

  async execute({ webinarId, user, seats }: Request): Promise<void> {
    const webinar = await this.webinarRepository.findById(webinarId);
    if (!webinar) {
      throw new WebinarNotFoundException();
    }
    if (!webinar.isOrganizer(user)) {
      throw new WebinarNotOrganizerException();
    }
    if (seats < webinar.props.seats) {
      throw new WebinarReduceSeatsException();
    }
    webinar.update({ seats });

    if (webinar.hasTooManySeats()) {
      throw new WebinarTooManySeatsException();
    }
    await this.webinarRepository.update(webinar);
  }
}
