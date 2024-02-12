import { faker } from "@faker-js/faker";
import { prisma } from "./prisma";

const teams = Array(50)
  .fill(null)
  .map(() => ({ name: faker.company.name() }));

Promise.all(
  teams.map(({ name }) => {
    const users = Array(50)
      .fill(null)
      .map(() => ({ name: faker.person.fullName() }));

    return prisma.team.create({
      data: { name, users: { create: users } },
    });
  }),
)
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
