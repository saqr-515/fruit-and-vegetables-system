import { Pool } from 'pg';

// السيرفر هيقرأ رابط قاعدة البيانات تلقائياً من متغيرات البيئة
export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : false
    });