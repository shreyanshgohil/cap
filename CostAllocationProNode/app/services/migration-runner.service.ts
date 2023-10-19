import { prisma } from '../client/prisma';
import { migrations } from '../constants/migrations';
import { migrationService } from './migration.service';

export async function runMigration() {
    console.log('Migration is running');
    for(let i = 0; i < migrations.length; i++) {
        let migrationId: string = '';
        const getMigration = await prisma.migrations.findFirst({
            where: {
                name: migrations[i]
            }
        });
        if(getMigration) {
            migrationId = getMigration.id;
        }
        try {
    
            if(!getMigration) {
                const createMigration = await prisma.migrations.create({
                    data: {
                        name: migrations[i]
                    }
                });
                migrationId = createMigration.id;
                await migrationService[migrations[i]]()
                await prisma.migrations.update({
                    where: {
                        id: migrationId
                    },
                    data: {
                        isCompleted: true
                    }
                })
            }
        } catch (error) {
            await prisma.migrations.update({
                where: {
                    id: migrationId
                },
                data: {
                    isFailed: true
                }
            })
        }

    }
    console.log('Migration completed');
}