require('dotenv').config();

const knex = require("knex")({
  client: "mysql",
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  pool: {
    min: 0,
    max: 10
}
});

const up = async function (knex) {
  // Create a table of users if it doesn't exist
  const hasUsersTable = await knex.schema.hasTable("users");
  if (!hasUsersTable) {
    await knex.schema.createTable("users", function (table) {
      table.increments("id");
      table.string("epic", 255).notNullable();
      table.string("username", 255).notNullable();
      table.string("display_name", 255).notNullable();
      table.string("about", 255).notNullable();
      table.string("language", 255).notNullable();
      table.string("spotify", 255).notNullable();
      table.string("spotify_refresh_token", 255).notNullable();
      table.string("spotify_code", 255).notNullable();
      table.text("spotify_object").notNullable();
      table.string("beta", 255).notNullable();
      table.string("banned", 255).notNullable();
      table.string("created_at", 255).notNullable();
      table.string("code_activate", 255).notNullable();
      table.string("is_activated", 255).notNullable();
      table.string("exp", 255).notNullable();
      table.string("nivel", 255).notNullable();
      table.string("website", 255).notNullable();
      table.string("private", 255).notNullable();
      table.string("verificado", 255).notNullable();
      table.string("lumis", 255).notNullable();
      table.string("token", 255).notNullable();
      table.string("email", 255).notNullable();
      table.string("password", 255).notNullable();
      table.string("discrimination", 255).notNullable();
      table.longtext("avatar", 16383).notNullable();
      table.longtext("banner", 16383).notNullable();
      table.string("admin", 255).notNullable();
    });
  }

  // Create a table of followers if it doesn't exist
  const hasFollowersTable = await knex.schema.hasTable("followers");
  if (!hasFollowersTable) {
    await knex.schema.createTable("followers", (table) => {
      table.increments("id").primary();
      table.integer("receiver_id").notNullable();
      table.string("sender_id").notNullable();
      table.string("status").notNullable();
    });
  }

  // Create table interests if it doesn't exist
  const hasInterestsTable = await knex.schema.hasTable("interests");
  if (!hasInterestsTable) {
    await knex.schema.createTable("interests", (table) => {
      table.increments("id").primary();
      table.integer("user_id").notNullable();
      table.string("name").notNullable();
      table.string("category").notNullable();
      table.integer("popularity").notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    });
  }

  // Create table communities if it doesn't exist
  const hasCommunitiesTable = await knex.schema.hasTable("communities");
  if (!hasCommunitiesTable) {
    await knex.schema.createTable("communities", (table) => {
      table.increments("id").primary();
      table.string("name").notNullable();
      table.string("avatar").notNullable();
      table.string("bg").notNullable();
      table.string("descricao").notNullable();
      table.string("verificado").notNullable();
      table.integer("creator_id").unsigned().notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    });
  }

  // Create table user_community if it doesn't exist
  const hasUserCommunityTable = await knex.schema.hasTable("user_community");
  if (!hasUserCommunityTable) {
    await knex.schema.createTable("user_community", (table) => {
      table.integer("user_id").unsigned().notNullable();
      table.integer("community_id").unsigned().notNullable();
      table.primary(["user_id", "community_id"]);
    });
  }

  // Create table posts if it doesn't exist
  const hasPostsTable = await knex.schema.hasTable("posts");
  if (!hasPostsTable) {
    await knex.schema.createTable("posts", (table) => {
      table.increments("id").primary();
      table.integer("community_id").unsigned().notNullable();
      table.string("content").notNullable();
      table.integer("votes").defaultTo(0);
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    });
  }

  // Create table post_votes if it doesn't exist
  const hasPostVotesTable = await knex.schema.hasTable("post_votes");
  if (!hasPostVotesTable) {
    await knex.schema.createTable("post_votes", (table) => {
      table.integer("post_id").unsigned().notNullable();
      table.integer("community_id").unsigned().notNullable();
      table.integer("user_id").unsigned().notNullable();
      table.enum("vote", ["upvote", "downvote"]).notNullable();
      table.primary(["post_id", "community_id", "user_id"]);
    });
  }

  // Create table user_posts if it doesn't exist
  const hasUserPostsTable = await knex.schema.hasTable("user_posts");
  if (!hasUserPostsTable) {
    await knex.schema.createTable("user_posts", (table) => {
      table.increments("id").primary();
      table.integer("user_id").unsigned().notNullable();
      table.string("content").notNullable();
      table.string("photo").notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    });
  }

  // Create table post_votes_profile if it doesn't exist
  const hasPostVotesProfileTable = await knex.schema.hasTable("post_votes_profile");
  if (!hasPostVotesProfileTable) {
    await knex.schema.createTable("post_votes_profile", (table) => {
      table.increments("id").primary();
      table.integer("post_id").unsigned().notNullable();
      table.integer("user_id").unsigned().notNullable();
      table.enum("vote", ["upvote", "downvote"]).notNullable();
    });
  }
};

// Migrations
up(knex);

module.exports = { knex };
