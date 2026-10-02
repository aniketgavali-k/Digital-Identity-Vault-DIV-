const bcrypt = require('bcrypt');
const bcryptjs = require('bcryptjs');

async function test() {
    console.log('Testing bcrypt (native)...');
    try {
        const hash = await bcrypt.hash('test1234', 10);
        console.log('bcrypt hash success:', hash);
        const match = await bcrypt.compare('test1234', hash);
        console.log('bcrypt compare success:', match);
    } catch (e) {
        console.error('bcrypt failed:', e.message);
    }

    console.log('\nTesting bcryptjs...');
    try {
        const hash = await bcryptjs.hash('test1234', 10);
        console.log('bcryptjs hash success:', hash);
        const match = await bcryptjs.compare('test1234', hash);
        console.log('bcryptjs compare success:', match);
    } catch (e) {
        console.error('bcryptjs failed:', e.message);
    }
}

test();
