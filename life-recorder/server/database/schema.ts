import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

// ==================== Users ====================
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name').notNull(),
  birthDate: text('birth_date'),
  expectedLifespan: integer('expected_lifespan').default(80),
  avatarUrl: text('avatar_url'),
  isSetupComplete: integer('is_setup_complete').default(0),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// ==================== Milestones ====================
export const milestones = sqliteTable('milestones', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  eventDate: text('event_date').notNull(),
  endDate: text('end_date'),
  category: text('category').notNull().default('other'),
  importance: integer('importance').default(3),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// ==================== Records ====================
export const records = sqliteTable('records', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title'),
  content: text('content'),
  recordDate: text('record_date').notNull(),
  mood: text('mood'),
  weather: text('weather'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// ==================== Plans ====================
export const plans = sqliteTable('plans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  targetDate: text('target_date'),
  startDate: text('start_date'),
  status: text('status').notNull().default('not_started'),
  priority: text('priority').notNull().default('medium'),
  linkedMilestoneId: integer('linked_milestone_id').references(() => milestones.id, { onDelete: 'set null' }),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// ==================== Ideas ====================
export const ideas = sqliteTable('ideas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title'),
  content: text('content'),
  linkedPlanId: integer('linked_plan_id').references(() => plans.id, { onDelete: 'set null' }),
  linkedMilestoneId: integer('linked_milestone_id').references(() => milestones.id, { onDelete: 'set null' }),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// ==================== Media ====================
export const media = sqliteTable('media', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  filePath: text('file_path').notNull(),
  fileName: text('file_name').notNull(),
  mimeType: text('mime_type').notNull(),
  fileSize: integer('file_size').notNull(),
  entityType: text('entity_type'),
  entityId: integer('entity_id'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// ==================== Tags ====================
export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  color: text('color'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// ==================== Junction Tables ====================
export const recordTags = sqliteTable('record_tags', {
  recordId: integer('record_id').notNull().references(() => records.id, { onDelete: 'cascade' }),
  tagId: integer('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
})

export const milestoneTags = sqliteTable('milestone_tags', {
  milestoneId: integer('milestone_id').notNull().references(() => milestones.id, { onDelete: 'cascade' }),
  tagId: integer('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
})

export const ideaTags = sqliteTable('idea_tags', {
  ideaId: integer('idea_id').notNull().references(() => ideas.id, { onDelete: 'cascade' }),
  tagId: integer('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
})

export const planTags = sqliteTable('plan_tags', {
  planId: integer('plan_id').notNull().references(() => plans.id, { onDelete: 'cascade' }),
  tagId: integer('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
})
