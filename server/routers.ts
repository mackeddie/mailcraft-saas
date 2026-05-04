import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { campaigns, subscribers, segments, emailTemplates, emailAnalytics, Campaign, InsertCampaign, Subscriber, InsertSubscriber, Segment, InsertSegment, EmailTemplate, InsertEmailTemplate } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Campaigns router
  campaigns: router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        const db = await getDb();
        if (!db) return [];
        return db.select().from(campaigns).where(eq(campaigns.userId, ctx.user.id));
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return null;
        const result = await db
          .select()
          .from(campaigns)
          .where(and(eq(campaigns.id, input.id), eq(campaigns.userId, ctx.user.id)))
          .limit(1);
        return result.length > 0 ? result[0] : null;
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        subject: z.string().optional(),
        blocks: z.array(z.any()).default([]),
        segmentId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const result = await db.insert(campaigns).values({
          userId: ctx.user.id,
          name: input.name,
          subject: input.subject,
          blocks: input.blocks,
          segmentId: input.segmentId,
          status: "draft",
        } as InsertCampaign);
        
        return result;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        subject: z.string().optional(),
        blocks: z.array(z.any()).optional(),
        segmentId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const updateData: Record<string, any> = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.subject !== undefined) updateData.subject = input.subject;
        if (input.blocks !== undefined) updateData.blocks = input.blocks;
        if (input.segmentId !== undefined) updateData.segmentId = input.segmentId;
        
        return db
          .update(campaigns)
          .set(updateData)
          .where(and(eq(campaigns.id, input.id), eq(campaigns.userId, ctx.user.id)));
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        return db
          .delete(campaigns)
          .where(and(eq(campaigns.id, input.id), eq(campaigns.userId, ctx.user.id)));
      }),

    schedule: protectedProcedure
      .input(z.object({
        id: z.number(),
        scheduledAt: z.date(),
        segmentId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const campaign = await db
          .select()
          .from(campaigns)
          .where(and(eq(campaigns.id, input.id), eq(campaigns.userId, ctx.user.id)))
          .limit(1);
        
        if (campaign.length === 0) throw new Error("Campaign not found");
        
        // Get subscriber count for the segment
        const segment = await db
          .select()
          .from(segments)
          .where(eq(segments.id, input.segmentId))
          .limit(1);
        
        const subscriberCount = segment.length > 0 ? segment[0].subscriberCount : 0;
        
        await db
          .update(campaigns)
          .set({
            status: "scheduled",
            scheduledAt: input.scheduledAt,
            segmentId: input.segmentId,
            subscriberCount: subscriberCount,
          })
          .where(eq(campaigns.id, input.id));
        
        // Send notification to owner
        await notifyOwner({
          title: "Campaign Scheduled",
          content: `Campaign "${campaign[0].name}" has been scheduled for ${input.scheduledAt.toLocaleString()} to ${subscriberCount} subscribers.`,
        });
        
        return { success: true };
      }),

    send: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const campaign = await db
          .select()
          .from(campaigns)
          .where(and(eq(campaigns.id, input.id), eq(campaigns.userId, ctx.user.id)))
          .limit(1);
        
        if (campaign.length === 0) throw new Error("Campaign not found");
        
        await db
          .update(campaigns)
          .set({
            status: "sent",
            sentAt: new Date(),
          })
          .where(eq(campaigns.id, input.id));
        
        // Send notification to owner
        await notifyOwner({
          title: "Campaign Sent",
          content: `Campaign "${campaign[0].name}" has been sent to ${campaign[0].subscriberCount} subscribers.`,
        });
        
        return { success: true };
      }),

    getDashboardMetrics: protectedProcedure
      .query(async ({ ctx }) => {
        const db = await getDb();
        if (!db) return {
          totalEmailsSent: 0,
          openRate: 0,
          clickRate: 0,
          newSubscribers: 0,
          openRateOverTime: [],
          subscriberGrowth: [],
          topCampaigns: [],
          recentActivity: [],
        };

        // Get all campaigns for the user
        const userCampaigns = await db
          .select()
          .from(campaigns)
          .where(eq(campaigns.userId, ctx.user.id));

        // Calculate metrics
        const totalEmailsSent = userCampaigns.reduce((sum, c) => sum + (c.subscriberCount || 0), 0);
        const sentCampaigns = userCampaigns.filter(c => c.status === "sent");
        const totalOpens = sentCampaigns.reduce((sum, c) => sum + (c.openCount || 0), 0);
        const totalClicks = sentCampaigns.reduce((sum, c) => sum + (c.clickCount || 0), 0);
        const openRate = totalEmailsSent > 0 ? ((totalOpens / totalEmailsSent) * 100).toFixed(1) : "0";
        const clickRate = totalEmailsSent > 0 ? ((totalClicks / totalEmailsSent) * 100).toFixed(1) : "0";

        // Get new subscribers (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const newSubscribers = await db
          .select()
          .from(subscribers)
          .where(and(
            eq(subscribers.userId, ctx.user.id),
          ));
        const newSubscribersCount = newSubscribers.filter(s => s.createdAt > thirtyDaysAgo).length;

        // Generate mock data for charts
        const openRateOverTime = Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
          rate: Math.floor(Math.random() * 60) + 20,
        }));

        const subscriberGrowth = Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
          count: Math.floor(Math.random() * 5000) + 1000,
        }));

        const topCampaigns = sentCampaigns.slice(0, 3).map(c => ({
          id: c.id,
          name: c.name,
          sent: c.subscriberCount,
          openRate: c.openRate || 0,
          clickRate: c.clickRate || 0,
        }));

        return {
          totalEmailsSent,
          openRate: parseFloat(openRate as string),
          clickRate: parseFloat(clickRate as string),
          newSubscribers: newSubscribersCount,
          openRateOverTime,
          subscriberGrowth,
          topCampaigns,
          recentActivity: [],
        };
      }),
  }),

  // Subscribers router
  subscribers: router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        const db = await getDb();
        if (!db) return [];
        return db.select().from(subscribers).where(eq(subscribers.userId, ctx.user.id));
      }),

    create: protectedProcedure
      .input(z.object({
        email: z.string().email(),
        name: z.string().optional(),
        tags: z.array(z.string()).default([]),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        return db.insert(subscribers).values({
          userId: ctx.user.id,
          email: input.email,
          name: input.name,
          tags: input.tags,
          status: "active",
        } as InsertSubscriber);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        email: z.string().email().optional(),
        name: z.string().optional(),
        status: z.enum(["active", "unsubscribed", "bounced"]).optional(),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const updateData: Record<string, any> = {};
        if (input.email !== undefined) updateData.email = input.email;
        if (input.name !== undefined) updateData.name = input.name;
        if (input.status !== undefined) updateData.status = input.status;
        if (input.tags !== undefined) updateData.tags = input.tags;
        
        return db
          .update(subscribers)
          .set(updateData)
          .where(and(eq(subscribers.id, input.id), eq(subscribers.userId, ctx.user.id)));
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        return db
          .delete(subscribers)
          .where(and(eq(subscribers.id, input.id), eq(subscribers.userId, ctx.user.id)));
      }),
  }),

  // Segments router
  segments: router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        const db = await getDb();
        if (!db) return [];
        return db.select().from(segments).where(eq(segments.userId, ctx.user.id));
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        filterRules: z.array(z.object({
          field: z.string(),
          operator: z.string(),
          value: z.string(),
        })).default([]),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        return db.insert(segments).values({
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
          filterRules: input.filterRules,
          subscriberCount: 0,
        } as InsertSegment);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        filterRules: z.array(z.object({
          field: z.string(),
          operator: z.string(),
          value: z.string(),
        })).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const updateData: Record<string, any> = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.filterRules !== undefined) updateData.filterRules = input.filterRules;
        
        return db
          .update(segments)
          .set(updateData)
          .where(and(eq(segments.id, input.id), eq(segments.userId, ctx.user.id)));
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        return db
          .delete(segments)
          .where(and(eq(segments.id, input.id), eq(segments.userId, ctx.user.id)));
      }),
  }),

  // Templates router
  templates: router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        const db = await getDb();
        if (!db) return [];
        return db.select().from(emailTemplates).where(eq(emailTemplates.userId, ctx.user.id));
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        subject: z.string().optional(),
        blocks: z.array(z.any()).default([]),
        isPrebuilt: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        return db.insert(emailTemplates).values({
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
          subject: input.subject,
          blocks: input.blocks,
          isPrebuilt: input.isPrebuilt,
        } as InsertEmailTemplate);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        subject: z.string().optional(),
        blocks: z.array(z.any()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const updateData: Record<string, any> = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.subject !== undefined) updateData.subject = input.subject;
        if (input.blocks !== undefined) updateData.blocks = input.blocks;
        
        return db
          .update(emailTemplates)
          .set(updateData)
          .where(and(eq(emailTemplates.id, input.id), eq(emailTemplates.userId, ctx.user.id)));
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        return db
          .delete(emailTemplates)
          .where(and(eq(emailTemplates.id, input.id), eq(emailTemplates.userId, ctx.user.id)));
      }),
  }),

  // LLM router for generating email copy
  llm: router({
    generateSubjectLine: protectedProcedure
      .input(z.object({
        campaignGoal: z.string(),
        audienceDescription: z.string(),
      }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are an expert email marketing copywriter. Generate compelling, concise email subject lines that drive opens.",
            },
            {
              role: "user",
              content: `Generate 3 email subject lines for a campaign with the following details:\n\nCampaign Goal: ${input.campaignGoal}\n\nAudience: ${input.audienceDescription}\n\nProvide only the subject lines, one per line, without numbering or additional text.`,
            },
          ],
        });

        const messageContent = response.choices[0]?.message.content;
        let content = "";
        if (typeof messageContent === "string") {
          content = messageContent;
        } else if (Array.isArray(messageContent)) {
          content = messageContent
            .filter((item: any) => item.type === "text")
            .map((item: any) => item.text)
            .join("\n");
        }

        const subjectLines = content
          .split("\n")
          .filter((line: string) => line.trim().length > 0)
          .slice(0, 3);

        return { subjectLines };
      }),

    generateBodyCopy: protectedProcedure
      .input(z.object({
        campaignGoal: z.string(),
        audienceDescription: z.string(),
        subject: z.string(),
      }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are an expert email marketing copywriter. Generate engaging, persuasive email body copy that converts.",
            },
            {
              role: "user",
              content: `Generate email body copy for a campaign with the following details:\n\nCampaign Goal: ${input.campaignGoal}\n\nAudience: ${input.audienceDescription}\n\nSubject Line: ${input.subject}\n\nProvide 2-3 paragraphs of compelling body copy that aligns with the subject line and campaign goal.`,
            },
          ],
        });

        const messageContent = response.choices[0]?.message.content;
        let bodyCopy = "";
        if (typeof messageContent === "string") {
          bodyCopy = messageContent;
        } else if (Array.isArray(messageContent)) {
          bodyCopy = messageContent
            .filter((item: any) => item.type === "text")
            .map((item: any) => item.text)
            .join("\n");
        }

        return { bodyCopy };
      }),

    generateTemplate: protectedProcedure
      .input(z.object({
        industry: z.string(),
        purpose: z.string(),
        tone: z.enum(["professional", "casual", "friendly", "urgent"]),
        targetAudience: z.string(),
      }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are an expert email template designer. Generate complete, professional email templates with subject line and body copy.",
            },
            {
              role: "user",
              content: `Create a complete email template with the following specifications:

Industry: ${input.industry}
Purpose: ${input.purpose}
Tone: ${input.tone}
Target Audience: ${input.targetAudience}

Provide:
1. Subject Line
2. Email Body (HTML-friendly format)
3. Call-to-Action Button Text

Format your response as JSON with keys: subject, body, ctaText`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "email_template",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  subject: { type: "string", description: "Email subject line" },
                  body: { type: "string", description: "Email body content" },
                  ctaText: { type: "string", description: "Call-to-action button text" },
                },
                required: ["subject", "body", "ctaText"],
                additionalProperties: false,
              },
            },
          },
        });

        const messageContent = response.choices[0]?.message.content;
        let templateData = { subject: "", body: "", ctaText: "" };
        
        if (typeof messageContent === "string") {
          try {
            templateData = JSON.parse(messageContent);
          } catch (e) {
            templateData = { subject: "Generated Email", body: messageContent, ctaText: "Learn More" };
          }
        }

        return templateData;
      }),
  }),

  // AI Assistance router
  ai: router({
    suggestCampaignName: protectedProcedure
      .input(z.object({ topic: z.string() }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are a creative marketing expert. Generate 3 catchy, professional email campaign names.",
            },
            {
              role: "user",
              content: `Generate 3 creative email campaign names for: ${input.topic}. Provide just the names, one per line.`,
            },
          ],
        });

        const messageContent = response.choices[0]?.message.content;
        const names = typeof messageContent === "string" 
          ? messageContent.split("\n").filter(n => n.trim()).slice(0, 3)
          : ["Campaign 1", "Campaign 2", "Campaign 3"];

        return { suggestions: names };
      }),

    suggestDescription: protectedProcedure
      .input(z.object({ campaignName: z.string(), topic: z.string() }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are a marketing copywriter. Generate a brief, compelling campaign description.",
            },
            {
              role: "user",
              content: `Generate a brief campaign description (1-2 sentences) for:\n\nCampaign: ${input.campaignName}\nTopic: ${input.topic}`,
            },
          ],
        });

        const messageContent = response.choices[0]?.message.content;
        const description = typeof messageContent === "string" ? messageContent : "Campaign description";

        return { description };
      }),
  }),
});

export type AppRouter = typeof appRouter;
