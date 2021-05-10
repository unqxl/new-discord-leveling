const Leveling = require('../src/js/index');
const leveling = new Leveling({
    type: 'json',
    jsonPath: './tests/db.json'
});

(async() => {
    console.log(await leveling.get('545956523571150858', '826084972279365652')); // 'get' Method.
})();
