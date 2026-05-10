'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. මුලින්ම පරණ Default එක අයින් කරමු (ERROR එක එන්නේ මේක නිසා)
    await queryInterface.sequelize.query(`ALTER TABLE "orders" ALTER COLUMN "order_status" DROP DEFAULT;`);

    // 2. දැනට පරණ data (pending, null) තියෙන ඒවා 'requested' වලට හරවමු
    await queryInterface.sequelize.query(`
      UPDATE "orders" 
      SET "order_status" = 'requested' 
      WHERE "order_status" NOT IN ('approved', 'rejected', 'processing', 'shipped', 'delivered', 'cancelled') 
      OR "order_status" IS NULL OR "order_status" = 'pending';
    `);

    // 3. Enum Type එක Database එකට හඳුන්වා දීම
    // මෙතන IF NOT EXISTS වගේ එකක් (DO block එකක්) පාවිච්චි කිරීම වඩාත් ආරක්ෂිතයි
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "order_status_enum" AS ENUM (
          'requested', 'approved', 'rejected', 'processing', 'shipped', 'delivered', 'cancelled'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 4. Column එක Enum වලට මාරු කිරීම
    await queryInterface.sequelize.query(`
      ALTER TABLE "orders" 
      ALTER COLUMN "order_status" TYPE "order_status_enum" 
      USING "order_status"::text::"order_status_enum";
    `);

    // 5. දැන් අලුත් Enum එකට අදාළව Default එක 'requested' විදිහට දාමු
    await queryInterface.sequelize.query(`ALTER TABLE "orders" ALTER COLUMN "order_status" SET DEFAULT 'requested';`);
  },

  down: async (queryInterface, Sequelize) => {
    // 1. Default එක අයින් කරන්න
    await queryInterface.sequelize.query(`ALTER TABLE "orders" ALTER COLUMN "order_status" DROP DEFAULT;`);

    // 2. නැවතත් Column එක VARCHAR(255) කරන්න
    await queryInterface.sequelize.query(`ALTER TABLE "orders" ALTER COLUMN "order_status" TYPE VARCHAR(255);`);

    // 3. Enum Type එක මකා දමන්න
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "order_status_enum";`);
  }
};