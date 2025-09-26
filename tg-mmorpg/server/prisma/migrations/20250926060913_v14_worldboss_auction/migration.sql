/*
  Warnings:

  - The primary key for the `Character` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Character` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `user_id` on the `Character` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `User` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - Added the required column `referralCode` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "ItemSet" (
    "code" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "bonuses" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Item" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'misc',
    "slot" TEXT,
    "rarity" TEXT NOT NULL,
    "min_lvl" INTEGER NOT NULL DEFAULT 1,
    "power" INTEGER NOT NULL DEFAULT 0,
    "stats" TEXT NOT NULL,
    "set_code" TEXT,
    CONSTRAINT "Item_set_code_fkey" FOREIGN KEY ("set_code") REFERENCES "ItemSet" ("code") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "char_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "equipped" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Inventory_char_id_fkey" FOREIGN KEY ("char_id") REFERENCES "Character" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Inventory_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "result_item_code" TEXT NOT NULL,
    "req" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Quest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "char_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 1,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "rewardXp" INTEGER NOT NULL DEFAULT 0,
    "rewardGold" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Quest_char_id_fkey" FOREIGN KEY ("char_id") REFERENCES "Character" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Guild" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leader_id" INTEGER NOT NULL,
    "treasury" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "GuildMember" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "guild_id" INTEGER NOT NULL,
    "char_id" INTEGER NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GuildMember_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "Guild" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GuildMember_char_id_fkey" FOREIGN KEY ("char_id") REFERENCES "Character" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MarketListing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "seller_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'fixed',
    "minIncrement" INTEGER,
    "feePct" INTEGER NOT NULL DEFAULT 5,
    "endsAt" DATETIME,
    "highestBid" INTEGER,
    "highestBidderId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AuctionBid" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "listing_id" INTEGER NOT NULL,
    "bidder_id" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Auction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemCode" TEXT NOT NULL,
    "minBid" INTEGER NOT NULL,
    "topBid" INTEGER NOT NULL DEFAULT 0,
    "topBidderCharId" INTEGER,
    "sellerCharId" INTEGER NOT NULL,
    "endsAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Skill" (
    "code" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cls" TEXT,
    "req" TEXT NOT NULL,
    "maxLevel" INTEGER NOT NULL DEFAULT 5
);

-- CreateTable
CREATE TABLE "CharacterSkill" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "char_id" INTEGER NOT NULL,
    "skill_code" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "CharacterSkill_char_id_fkey" FOREIGN KEY ("char_id") REFERENCES "Character" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CharacterSkill_skill_code_fkey" FOREIGN KEY ("skill_code") REFERENCES "Skill" ("code") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorldBoss" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "maxHp" INTEGER NOT NULL,
    "hp" INTEGER NOT NULL,
    "atk" INTEGER NOT NULL,
    "rewardXp" INTEGER NOT NULL,
    "rewardGold" INTEGER NOT NULL,
    "resists" TEXT,
    "alive" BOOLEAN NOT NULL DEFAULT true,
    "nextSpawnAt" DATETIME,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WorldBossHitLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bossId" TEXT NOT NULL,
    "char_id" INTEGER NOT NULL,
    "dmg" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Character" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "name" TEXT,
    "class" TEXT NOT NULL,
    "gender" TEXT,
    "initialized" BOOLEAN NOT NULL DEFAULT false,
    "level" INTEGER NOT NULL DEFAULT 1,
    "exp" BIGINT NOT NULL DEFAULT 0,
    "str" INTEGER NOT NULL DEFAULT 5,
    "agi" INTEGER NOT NULL DEFAULT 5,
    "int" INTEGER NOT NULL DEFAULT 5,
    "vit" INTEGER NOT NULL DEFAULT 5,
    "dex" INTEGER NOT NULL DEFAULT 0,
    "luck" INTEGER NOT NULL DEFAULT 0,
    "availableAttrPoints" INTEGER NOT NULL DEFAULT 0,
    "availableSkillPoints" INTEGER NOT NULL DEFAULT 0,
    "stamina" INTEGER NOT NULL DEFAULT 20,
    "energy" INTEGER NOT NULL DEFAULT 100,
    "gold" BIGINT NOT NULL DEFAULT 0,
    "shards" BIGINT NOT NULL DEFAULT 0,
    "rating" INTEGER NOT NULL DEFAULT 1000,
    "location" TEXT NOT NULL DEFAULT 'Town',
    "lastDailyAt" DATETIME,
    "lastMineAt" DATETIME,
    "guild_id" INTEGER,
    CONSTRAINT "Character_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Character_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "Guild" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Character" ("agi", "class", "exp", "gold", "id", "int", "level", "shards", "stamina", "str", "user_id", "vit") SELECT "agi", "class", "exp", "gold", "id", "int", "level", "shards", "stamina", "str", "user_id", "vit" FROM "Character";
DROP TABLE "Character";
ALTER TABLE "new_Character" RENAME TO "Character";
CREATE UNIQUE INDEX "Character_name_key" ON "Character"("name");
CREATE INDEX "Character_user_id_idx" ON "Character"("user_id");
CREATE INDEX "Character_guild_id_idx" ON "Character"("guild_id");
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tg_id" BIGINT NOT NULL,
    "username" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referralCode" TEXT NOT NULL,
    "referredBy" TEXT
);
INSERT INTO "new_User" ("created_at", "id", "tg_id", "username") SELECT "created_at", "id", "tg_id", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_tg_id_key" ON "User"("tg_id");
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Item_code_key" ON "Item"("code");

-- CreateIndex
CREATE INDEX "Inventory_char_id_idx" ON "Inventory"("char_id");

-- CreateIndex
CREATE INDEX "Inventory_item_id_idx" ON "Inventory"("item_id");

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_code_key" ON "Recipe"("code");

-- CreateIndex
CREATE INDEX "Quest_char_id_idx" ON "Quest"("char_id");

-- CreateIndex
CREATE UNIQUE INDEX "Guild_tag_key" ON "Guild"("tag");

-- CreateIndex
CREATE INDEX "GuildMember_guild_id_idx" ON "GuildMember"("guild_id");

-- CreateIndex
CREATE INDEX "GuildMember_char_id_idx" ON "GuildMember"("char_id");

-- CreateIndex
CREATE INDEX "MarketListing_status_type_idx" ON "MarketListing"("status", "type");

-- CreateIndex
CREATE INDEX "AuctionBid_listing_id_idx" ON "AuctionBid"("listing_id");

-- CreateIndex
CREATE INDEX "AuctionBid_bidder_id_idx" ON "AuctionBid"("bidder_id");

-- CreateIndex
CREATE INDEX "CharacterSkill_char_id_idx" ON "CharacterSkill"("char_id");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSkill_char_id_skill_code_key" ON "CharacterSkill"("char_id", "skill_code");

-- CreateIndex
CREATE UNIQUE INDEX "WorldBoss_code_key" ON "WorldBoss"("code");
