const knex = require('knex');
const { variables } = require('../config');

const DB = knex({
    client: variables.CLIENT_DB,
    connection: {
      filename: variables.FILE_NAME_DB
    },
    useNullAsDefault: true
});

DB.schema.hasTable('basket').then(function(exists) {
    if (!exists) {
        return DB.schema.createTable('basket', function(table) {
            table.increments('id').primary();
            table.string('user_id', 100);
            table.integer('product_id', 10);
            table.integer('quantity', 100);
            table.timestamps();
        });
    }
});


module.exports = {
    DB
};