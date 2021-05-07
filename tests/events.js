const Leveling = require('../src/js/index');
const leveling = new Leveling({
    type: 'json',
    jsonPath: './tests/db.json'
});

leveling.on('newLevel', (data) => {
    console.log(`User with ID ${data.userID} just reached ${data.level} level!`);
});