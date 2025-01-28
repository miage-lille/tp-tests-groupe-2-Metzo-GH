import { InMemoryWebinarRepository } from 'src/webinars/adapters/webinar-repository.in-memory';
import { Webinar } from 'src/webinars/entities/webinar.entity';
import { ChangeSeats } from 'src/webinars/use-cases/change-seats';
import { testUser } from 'src/users/tests/user-seeds';

// Tests unitaires

describe('Feature: Change seats', () => {
  let webinarRepository: InMemoryWebinarRepository;
  let useCase: ChangeSeats;

  //vérifier que le webinaire est resté inchangé
  function expectWebinarToRemainUnchanged() {
    const webinar = webinarRepository.findByIdSync('webinar-id');
    expect(webinar?.props.seats).toEqual(100);
  }

  const webinar = new Webinar({
    id: 'webinar-id',
    organizerId: testUser.alice.props.id,
    title: 'Webinar title',
    startDate: new Date('2024-01-01T00:00:00Z'),
    endDate: new Date('2024-01-01T01:00:00Z'),
    seats: 100,
  });

  beforeEach(() => {
    webinarRepository = new InMemoryWebinarRepository([webinar]);
    useCase = new ChangeSeats(webinarRepository);
  });

  // Initialisation de nos tests, boilerplates...
  describe('Scenario: Happy path', () => {
    const payload = {
      user: testUser.alice,
      webinarId: 'webinar-id',
      seats: 200,
    };

    // Code commun à notre scénario : payload...
    it('should change the number of seats for a webinar', async () => {
      // ACT
      await useCase.execute(payload);

      // ASSERT
      const updatedWebinar = await webinarRepository.findById('webinar-id');
      expect(updatedWebinar?.props.seats).toEqual(200);
    });
  });

  // Scenario: webinar does not exist
  describe('Scenario: webinar does not exist', () => {
    const payload = {
      user: testUser.alice,
      webinarId: 'imaginary-id',
      seats: 200,
    };

    it('should fail', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(
        'Webinar not found',
      );
      expectWebinarToRemainUnchanged();
    });
  });

  // Scenario: update webinar of someone else
  describe('Scenario: update the webinar of someone else', () => {
    const payload = {
      user: testUser.bob,
      webinarId: 'webinar-id',
      seats: 201,
    };

    it('should fail when user is not the organizer', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(
        'User is not allowed to update this webinar',
      );
      expectWebinarToRemainUnchanged();
    });
  });

  //Scenario: change seat to an inferior number
  describe('Scenario: reduce the number of seats', () => {
    const payload = {
      user: testUser.alice,
      webinarId: 'webinar-id',
      seats: 99,
    };

    it('should fail when reducing the number of seats', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(
        'You cannot reduce the number of seats',
      );
      expectWebinarToRemainUnchanged();
    });
  });

  // Scenario: change seat to a number > 1000
  describe('Scenario: change seat to a number > 1000', () => {
    const payload = {
      user: testUser.alice,
      webinarId: 'webinar-id',
      seats: 1001,
    };

    it('should fail when changing the number of seats to a number > 1000', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(
        'Webinar must have at most 1000 seats',
      );
      expectWebinarToRemainUnchanged();
    });
  });
});
