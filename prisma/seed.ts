import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const clerkUserId = 'user_test_123'; // replace with a real Clerk user id after first sign-in

    const project = await prisma.project.upsert({
        where: { id: 'seed-project-1' },
        update: {},
        create: {
            id: 'seed-project-1',
            name: 'Sample GitHelp Project',
            repoUrl: 'https://github.com/vercel/next.js',
            repoOwner: 'vercel',
            repoName: 'next.js',
            ownerId: clerkUserId,
            commits: {
                create: [
                    {
                        sha: 'seed-sha-1',
                        message: 'Initial commit placeholder',
                        author: 'seed-bot',
                        timestamp: new Date(),
                    },
                ],
            },
            answers: {
                create: [
                    {
                        question: 'What does this project do?',
                        answer: 'This is a seeded answer. In a real project, answers are generated via the RAG pipeline.',
                        citations: JSON.stringify([{ path: 'README.md', lines: [1, 20] }]),
                        createdById: clerkUserId,
                    },
                ],
            },
        },
    });

    console.log('Seeded project:', project.id);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
