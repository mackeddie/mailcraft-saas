CREATE TABLE `campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`subject` varchar(255),
	`blocks` json DEFAULT (json_array()),
	`status` enum('draft','scheduled','sent') NOT NULL DEFAULT 'draft',
	`segmentId` int,
	`subscriberCount` int DEFAULT 0,
	`scheduledAt` timestamp,
	`sentAt` timestamp,
	`openRate` decimal(5,2) DEFAULT '0',
	`clickRate` decimal(5,2) DEFAULT '0',
	`openCount` int DEFAULT 0,
	`clickCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emailAnalytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`subscriberId` int NOT NULL,
	`opened` boolean DEFAULT false,
	`openedAt` timestamp,
	`clicked` boolean DEFAULT false,
	`clickedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emailAnalytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emailBlocks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int,
	`templateId` int,
	`type` enum('text','image','button','divider') NOT NULL,
	`content` json DEFAULT (json_object()),
	`order` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emailBlocks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emailTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`subject` varchar(255),
	`blocks` json DEFAULT (json_array()),
	`isPrebuilt` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emailTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `segments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`filterRules` json DEFAULT (json_array()),
	`subscriberCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `segments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(255),
	`status` enum('active','unsubscribed','bounced') NOT NULL DEFAULT 'active',
	`tags` json DEFAULT (json_array()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscribers_id` PRIMARY KEY(`id`)
);
