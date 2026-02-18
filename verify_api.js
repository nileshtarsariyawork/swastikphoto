const fs = require('fs');
const path = require('path');

async function run() {
    const baseUrl = 'http://localhost:3000';
    console.log('Starting verification against:', baseUrl);

    try {
        console.log('1. Checking server root...');
        const rootRes = await fetch(baseUrl);
        if (!rootRes.ok) throw new Error('Server not responding at /');
        console.log('Server is UP.');

        // Verify Hero Fetch
        console.log('\n2. Verifying Hero Fetch...');
        const heroFetchRes = await fetch(`${baseUrl}/api/portfolio?category=hero`);
        const heroFetchData = await heroFetchRes.json();
        console.log('Hero Fetch Result:', heroFetchData.length + ' images found');

        if (heroFetchData.length > 0) {
            console.log('First Hero Image:', heroFetchData[0].src);
        } else {
            console.warn('No hero images found. Upload some via Admin panel to test slider completely.');
        }

        console.log('\n✅ VERIFICATION SUCCESSFUL');

    } catch (err) {
        console.error('\n❌ VERIFICATION FAILED:', err.message);
        process.exit(1);
    }
}

run();
