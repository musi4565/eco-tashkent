-- Eco Tashkent: boshlang'ich migratsiya
-- Jadvallar: users, items, recycle_points, requests, chat_messages, eco_points, telegram_users

CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "eco_points" INTEGER NOT NULL DEFAULT 0,
    "saved_kg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "items" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "image_url" TEXT,
    "district" TEXT NOT NULL,
    "address" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "owner_id" INTEGER NOT NULL,
    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "recycle_points" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "address" TEXT NOT NULL,
    "accepted_materials" TEXT[],
    CONSTRAINT "recycle_points_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "requests" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "message" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "item_id" INTEGER NOT NULL,
    "requester_id" INTEGER NOT NULL,
    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "chat_messages" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "request_id" INTEGER NOT NULL,
    "sender_id" INTEGER NOT NULL,
    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "eco_points" (
    "id" SERIAL NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,
    CONSTRAINT "eco_points_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "telegram_users" (
    "id" SERIAL NOT NULL,
    "chat_id" BIGINT NOT NULL,
    "username" TEXT,
    "subscribed_categories" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER,
    CONSTRAINT "telegram_users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");
CREATE UNIQUE INDEX "telegram_users_chat_id_key" ON "telegram_users"("chat_id");

CREATE INDEX "items_owner_id_idx" ON "items"("owner_id");
CREATE INDEX "items_category_idx" ON "items"("category");
CREATE INDEX "items_district_idx" ON "items"("district");
CREATE INDEX "items_type_idx" ON "items"("type");
CREATE INDEX "items_status_idx" ON "items"("status");
CREATE INDEX "requests_item_id_idx" ON "requests"("item_id");
CREATE INDEX "requests_requester_id_idx" ON "requests"("requester_id");
CREATE INDEX "chat_messages_request_id_idx" ON "chat_messages"("request_id");
CREATE INDEX "eco_points_user_id_idx" ON "eco_points"("user_id");

ALTER TABLE "items" ADD CONSTRAINT "items_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "requests" ADD CONSTRAINT "requests_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "requests" ADD CONSTRAINT "requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "eco_points" ADD CONSTRAINT "eco_points_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "telegram_users" ADD CONSTRAINT "telegram_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
