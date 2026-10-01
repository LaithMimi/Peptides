CREATE TYPE "public"."message_kind" AS ENUM('feedback', 'data_request');--> statement-breakpoint
CREATE TABLE "inbound_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "message_kind" NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"order_phone" text,
	"body" text,
	"request_type" text,
	"locale" text DEFAULT 'en' NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "inbound_messages_created_idx" ON "inbound_messages" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "store_settings" DROP COLUMN "phone";--> statement-breakpoint
ALTER TABLE "store_settings" DROP COLUMN "whatsapp_number";