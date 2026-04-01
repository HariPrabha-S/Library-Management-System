const { Fine, sequelize } = require('../models/admin/adminModels');

async function cleanDuplicates() {
    try {
        console.log('Cleaning duplicate fines...');
        // Find all Dr. Sam fines for lost book
        const fines = await Fine.findAll({
            where: {
                amount: 150.00,
                reason: 'Lost book'
            }
        });

        if (fines.length > 1) {
            // Keep the one that is 'Paid' if available, otherwise keep the first
            const paidIndex = fines.findIndex(f => f.status === 'Paid');
            const toKeep = paidIndex !== -1 ? fines[paidIndex] : fines[0];

            for (const f of fines) {
                if (f.id !== toKeep.id) {
                    await f.destroy();
                    console.log(`Deleted duplicate fine ID: ${f.id}`);
                }
            }
            console.log(`Kept fine ID: ${toKeep.id} with status: ${toKeep.status}`);
        } else {
            console.log('No duplicates found.');
        }

    } catch (error) {
        console.error('Cleanup error:', error);
    } finally {
        process.exit();
    }
}

cleanDuplicates();
