import { pgTable, text, serial, integer, boolean, timestamp, json, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  email: text("email").unique().notNull(),
  role: text("role").notNull().default("user"),
  fullName: text("full_name"),
  bio: text("bio"),
  avatar: text("avatar"),
  languages: json("languages").default([]),
  createdAt: timestamp("created_at").defaultNow()
});

// Create a more robust validation schema for user registration
export const insertUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email format"),
  role: z.enum(["user", "expert", "provider", "admin"]).default("user"),
  fullName: z.string().optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  languages: z.array(z.string()).optional()
});

export const selectUserSchema = createSelectSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type SelectUser = typeof users.$inferSelect;

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  price: decimal("price").notNull(),
  location: text("location").notNull(),
  providerId: integer("provider_id").references(() => users.id),
  category: text("category").notNull(),
  images: json("images").default([]),
  availability: json("availability").default([]),
  createdAt: timestamp("created_at").defaultNow()
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  serviceId: integer("service_id").references(() => services.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: text("status").notNull().default("pending"),
  totalPrice: decimal("total_price").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  userId: integer("user_id").references(() => users.id),
  destination: text("destination").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isPrivate: boolean("is_private").default(false),
  members: json("members").default([]),
  itinerary: json("itinerary").default([]),
  createdAt: timestamp("created_at").defaultNow()
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  tripId: integer("trip_id").references(() => trips.id),
  content: text("content").notNull(),
  images: json("images").default([]),
  createdAt: timestamp("created_at").defaultNow()
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  receiverId: integer("receiver_id").references(() => users.id).notNull(),
  conversationId: text("conversation_id").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("unread"),
  messageType: text("message_type").notNull(),
  contextId: integer("context_id"),
  contextType: text("context_type"),
  createdAt: timestamp("created_at").defaultNow()
});

// Add relations
export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
}));

export const insertTripSchema = createInsertSchema(trips, {
  startDate: z.string().transform((str) => str ? new Date(str) : null),
  endDate: z.string().transform((str) => str ? new Date(str) : null),
});

export const insertServiceSchema = createInsertSchema(services);

const bookingValidationSchema = z.object({
  serviceId: z.number(),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().nullable().transform((str) => str ? new Date(str) : null),
  totalPrice: z.number().or(z.string()).transform((val) =>
    typeof val === "string" ? parseFloat(val) : val
  ),
  status: z.string(),
  notes: z.string().optional(),
});

export const insertBookingSchema = bookingValidationSchema;
export const selectBookingSchema = createSelectSchema(bookings);

export const insertPostSchema = createInsertSchema(posts);

export const insertMessageSchema = createInsertSchema(messages, {
  messageType: z.enum([
    'expert_inquiry',
    'trip_discussion',
    'booking_support',
    'admin_notice'
  ]),
  contextType: z.enum(['trip', 'booking', 'service']).optional(),
  status: z.enum(['read', 'unread']).default('unread'),
});

export const selectMessageSchema = createSelectSchema(messages);

export type User = typeof users.$inferSelect;
export type Trip = typeof trips.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type InsertService = typeof services.$inferInsert;
export type InsertBooking = z.infer<typeof bookingValidationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;