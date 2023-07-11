const knex = require("knex")({
  client: "mysql",
  connection: {
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "",
    database: "shako",
  },
});

const up = function (knex) {
  //Create a table of users
  Promise.all([
    knex.schema.createTableIfNotExists("users", function (table) {
      table.increments("id");
      table.string("username", 255).notNullable();
      // Private profile, 0 or 1 or true or false, idk. what do u mean?
      table.string("private", 255).notNullable();
      // Lumis points profile, like a karma (reddit)
      table.string("lumis", 255).notNullable();
      table.string("token", 255).notNullable();
      table.string("email", 255).notNullable();
      table.string("password", 255).notNullable();
      table.string("discrimination", 255).notNullable();
      table.longtext("avatar", 16383).notNullable();
      table.longtext("bg", 16383).notNullable();
      table.string("admin", 255).notNullable();
    }),
  ]);

  //Create a table of followers
  Promise.all([
    knex.schema.createTableIfNotExists("followers", (table) => {
      // cria uma coluna de ID como uma chave primária e auto-incrementada
      table.increments("id").primary();
      // cria uma coluna para armazenar o ID do usuário que recebeu o seguidor
      table.integer("receiver_id").notNullable();
      // cria uma coluna para armazenar o ID do usuário que enviou o seguidor
      table.string("sender_id").notNullable();
      // cria uma coluna para armazenar o status da solicitação de amizade (aceita ou pendente)
      table.string("status").notNullable();
    }),
  ]);
};

//Migrations
up(knex);

module.exports = { knex };
