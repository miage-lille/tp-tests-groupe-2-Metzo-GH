import { PrismaClient } from '@prisma/client';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { exec } from 'child_process';
import { PrismaWebinarRepository } from 'src/webinars/adapters/webinar-repository.prisma';
import { Webinar } from 'src/webinars/entities/webinar.entity';
import { promisify } from 'util';

const asyncExec = promisify(exec);

describe('PrismaWebinarRepository', () => {
  let container: StartedPostgreSqlContainer;
  let prismaClient: PrismaClient;
  let repository: PrismaWebinarRepository;

  beforeAll(async () => {
    // Connect to database
    container = await new PostgreSqlContainer()
      .withDatabase('test_db')
      .withUsername('user_test')
      .withPassword('password_test')
      .withExposedPorts(5432)
      .start();

    const dbUrl = container.getConnectionUri();
    prismaClient = new PrismaClient({
      datasources: {
        db: { url: dbUrl },
      },
    });

    // Run migrations to populate the database
    await asyncExec(`DATABASE_URL=${dbUrl} npx prisma migrate deploy`);

    return prismaClient.$connect();
  });

  beforeEach(async () => {
    repository = new PrismaWebinarRepository(prismaClient);
    await prismaClient.webinar.deleteMany();
    await prismaClient.$executeRawUnsafe('DELETE FROM "Webinar" CASCADE');
  });

  afterAll(async () => {
    await container.stop({ timeout: 1000 });
    return prismaClient.$disconnect();
  });

  describe('Scenario : repository.create', () => {
    it('should create a webinar', async () => {
      // ARRANGE
      const webinar = new Webinar({
        id: 'webinar-id',
        organizerId: 'organizer-id',
        title: 'Webinar title',
        startDate: new Date('2022-01-01T00:00:00Z'),
        endDate: new Date('2022-01-01T01:00:00Z'),
        seats: 100,
      });

      // ACT
      await repository.create(webinar);

      // ASSERT
      const maybeWebinar = await prismaClient.webinar.findUnique({
        where: { id: 'webinar-id' },
      });
      expect(maybeWebinar).toEqual(webinar.props);
    });
  });

  describe('Scenario : repository.findById', () => {
    it('should return null when webinar does not exist', async () => {
      // ARRANGE
      const nonExistentId = 'non-existent-id';

      // ACT
      const result = await repository.findById(nonExistentId);

      // ASSERT
      expect(result).toBeNull();
    });

    it('should return a webinar when it exists', async () => {
      // ARRANGE
      const webinarData = {
        id: 'webinar-id',
        organizerId: 'organizer-id',
        title: 'Webinar title',
        startDate: new Date('2022-01-01T00:00:00Z'),
        endDate: new Date('2022-01-01T01:00:00Z'),
        seats: 100,
      };
      await prismaClient.webinar.create({ data: webinarData });

      // ACT
      const result = await repository.findById('webinar-id');

      // ASSERT
      expect(result).not.toBeNull();
      expect(result?.props).toEqual(webinarData);
    });
  });

  describe('Scenario : repository.update', () => {
    it('should update an existing webinar', async () => {
      // ARRANGE
      const initialWebinar = {
        id: 'webinar-id',
        organizerId: 'organizer-id',
        title: 'Initial title',
        startDate: new Date('2022-01-01T00:00:00Z'),
        endDate: new Date('2022-01-01T01:00:00Z'),
        seats: 100,
      };
      await prismaClient.webinar.create({ data: initialWebinar });

      const updatedWebinar = new Webinar({
        ...initialWebinar,
        title: 'Updated title',
        seats: 200,
      });

      // ACT
      await repository.update(updatedWebinar);

      // ASSERT
      const result = await prismaClient.webinar.findUnique({
        where: { id: 'webinar-id' },
      });
      expect(result).toEqual({
        ...initialWebinar,
        title: 'Updated title',
        seats: 200,
      });
    });

    it('should throw an error when updating non-existent webinar', async () => {
      // ARRANGE
      const nonExistentWebinar = new Webinar({
        id: 'non-existent-id',
        organizerId: 'organizer-id',
        title: 'Title',
        startDate: new Date('2022-01-01T00:00:00Z'),
        endDate: new Date('2022-01-01T01:00:00Z'),
        seats: 100,
      });

      // ACT & ASSERT
      await expect(repository.update(nonExistentWebinar)).rejects.toThrow();
    });
  });
});
