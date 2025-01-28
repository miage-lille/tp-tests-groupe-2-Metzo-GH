import { Webinar } from 'src/webinars/entities/webinar.entity';
import { IWebinarRepository } from 'src/webinars/ports/webinar-repository.interface';

export class InMemoryWebinarRepository implements IWebinarRepository {
  constructor(public database: Webinar[] = []) {}
  findByIdSync(id: string): Webinar | null {
    const webinar = this.database.find((webinar) => webinar.props.id === id);
    return webinar ? new Webinar({ ...webinar.initialState }) : null;
  }
  async findById(id: string): Promise<Webinar | null> {
    const webinar = this.database.find((webinar) => webinar.props.id === id);
    return webinar ? new Webinar({ ...webinar.initialState }) : null;
  }

  async update(webinar: Webinar): Promise<void> {
    const index = this.database.findIndex(
      (w) => w.props.id === webinar.props.id,
    );
    this.database[index] = webinar;
    webinar.commit();
  }
  async create(webinar: Webinar): Promise<void> {
    this.database.push(webinar);
  }
}
