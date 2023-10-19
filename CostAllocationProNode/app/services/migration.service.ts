import { prisma } from '../client/prisma';

async function addPayRolePermissions() {

    const allRoles = await prisma.role.findMany();

    if (allRoles.length) {
        for (const role of allRoles) {
            const payPeriodPermissions = await prisma.permission.findFirst({
                where: {
                    roleId: role.id,
                    permissionName: 'Pay Period'
                }
            });

            if (!payPeriodPermissions) {
                await prisma.permission.create({
                    data: {
                        roleId: role.id,
                        permissionName: 'Pay Period',
                        all: (role.roleName === 'Admin' || role.roleName === 'Company Admin') ? true : false,
                        view: (role.roleName === 'Admin' || role.roleName === 'Company Admin') ? true : false,
                        edit: (role.roleName === 'Admin' || role.roleName === 'Company Admin') ? true : false,
                        delete: (role.roleName === 'Admin' || role.roleName === 'Company Admin') ? true : false,
                        add: (role.roleName === 'Admin' || role.roleName === 'Company Admin') ? true : false,
                        sortId: 16,
                    }
                })
            }
        }
    }

}

async function testFun() {
    console.log('running')
}

export const migrationService: any = {
    addPayRolePermissions,
    testFun
}