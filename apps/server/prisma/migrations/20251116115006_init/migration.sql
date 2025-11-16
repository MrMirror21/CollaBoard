-- CreateTable
CREATE TABLE "users" (
    "id" VARCHAR(30) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "avatar" VARCHAR(500),
    "is_guest" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boards" (
    "id" VARCHAR(30) NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "background_color" VARCHAR(7) NOT NULL DEFAULT '#0079BF',
    "owner_id" VARCHAR(30) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "boards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "board_members" (
    "id" VARCHAR(30) NOT NULL,
    "board_id" VARCHAR(30) NOT NULL,
    "user_id" VARCHAR(30) NOT NULL,
    "role" VARCHAR(20) NOT NULL DEFAULT 'member',
    "last_accessed_at" TIMESTAMPTZ(3),
    "joined_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "board_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lists" (
    "id" VARCHAR(30) NOT NULL,
    "title" VARCHAR(50) NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "board_id" VARCHAR(30) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cards" (
    "id" VARCHAR(30) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "list_id" VARCHAR(30) NOT NULL,
    "assignee_id" VARCHAR(30),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "labels" (
    "id" VARCHAR(30) NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "color" VARCHAR(7) NOT NULL,
    "board_id" VARCHAR(30) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "labels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_labels" (
    "id" VARCHAR(30) NOT NULL,
    "card_id" VARCHAR(30) NOT NULL,
    "label_id" VARCHAR(30) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "card_labels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "boards_owner_id_idx" ON "boards"("owner_id");

-- CreateIndex
CREATE INDEX "boards_updated_at_idx" ON "boards"("updated_at");

-- CreateIndex
CREATE INDEX "board_members_user_id_idx" ON "board_members"("user_id");

-- CreateIndex
CREATE INDEX "board_members_last_accessed_at_idx" ON "board_members"("last_accessed_at");

-- CreateIndex
CREATE UNIQUE INDEX "board_members_board_id_user_id_key" ON "board_members"("board_id", "user_id");

-- CreateIndex
CREATE INDEX "lists_board_id_idx" ON "lists"("board_id");

-- CreateIndex
CREATE INDEX "lists_board_id_position_idx" ON "lists"("board_id", "position");

-- CreateIndex
CREATE INDEX "cards_list_id_idx" ON "cards"("list_id");

-- CreateIndex
CREATE INDEX "cards_list_id_position_idx" ON "cards"("list_id", "position");

-- CreateIndex
CREATE INDEX "cards_assignee_id_idx" ON "cards"("assignee_id");

-- CreateIndex
CREATE INDEX "labels_board_id_idx" ON "labels"("board_id");

-- CreateIndex
CREATE INDEX "card_labels_label_id_idx" ON "card_labels"("label_id");

-- CreateIndex
CREATE UNIQUE INDEX "card_labels_card_id_label_id_key" ON "card_labels"("card_id", "label_id");

-- AddForeignKey
ALTER TABLE "boards" ADD CONSTRAINT "boards_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_members" ADD CONSTRAINT "board_members_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_members" ADD CONSTRAINT "board_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lists" ADD CONSTRAINT "lists_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "labels" ADD CONSTRAINT "labels_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_labels" ADD CONSTRAINT "card_labels_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_labels" ADD CONSTRAINT "card_labels_label_id_fkey" FOREIGN KEY ("label_id") REFERENCES "labels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
