import { faker } from "@faker-js/faker";
import { TEAM_ID } from "../constants/ids";
import { prisma } from "./prisma";

prisma.team
  .create({
    data: {
      id: TEAM_ID,
      name: faker.company.name(),
      users: {
        create: Array(50)
          .fill(null)
          .map(() => ({ name: faker.person.fullName() })),
      },
    },
  })

  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
