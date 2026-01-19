# Supabase Setup Guide for That's Amore Pizzeria

This guide will help you set up Supabase for the That's Amore Pizzeria website to manage votes, pizzas sold, restaurant hours, status, and scheduled closures.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js installed on your development machine

## Step 1: Create a Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in your project details:
   - **Name**: That's Amore Pizzeria (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the region closest to your users
4. Click "Create new project"
5. Wait for the project to be created (this takes a few minutes)

## Step 2: Run the Database Migration

1. Once your project is ready, go to the **SQL Editor** in your Supabase dashboard
2. Click "New Query"
3. Open the file `supabase/migrations/001_initial_schema.sql` from this project
4. Copy and paste the entire SQL content into the SQL Editor
5. Click "Run" to execute the migration
6. You should see a success message confirming all tables were created

## Step 3: Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. You'll need two keys:
   - **Project URL**: Found under "Project URL"
   - **anon/public key**: Found under "Project API keys" → "anon public"
   - **service_role key**: Found under "Project API keys" → "service_role" (⚠️ Keep this secret!)

## Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env` in the project root:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

3. **Important**: Never commit `.env` to git! It's already in `.gitignore`

## Step 5: Enable Realtime (Optional but Recommended)

1. In your Supabase dashboard, go to **Database** → **Replication**
2. Enable replication for the following tables:
   - `restaurant_metrics`
   - `restaurant_hours`
   - `restaurant_status`
3. This enables real-time updates on your website

## Step 6: Install Dependencies

Run the following command to install the Supabase client:

```bash
npm install
```

## Step 7: Test the Setup

1. Start your server:
   ```bash
   npm start
   ```

2. The server will automatically:
   - Connect to Supabase
   - Migrate any existing file-based data to Supabase
   - Start using Supabase for all data operations

3. Check the console logs for:
   - ✅ "Supabase client initialized (server-side)"
   - ✅ "Migration completed successfully!" (if data was migrated)

## Step 8: Verify in Supabase Dashboard

1. Go to **Table Editor** in your Supabase dashboard
2. You should see the following tables:
   - `restaurant_metrics` - Contains vote counts and pizzas sold
   - `vote_records` - Individual vote records for analytics
   - `restaurant_hours` - Business hours configuration
   - `restaurant_status` - Restaurant status (manual closed)
   - `scheduled_closures` - Future closure dates

3. Check that `restaurant_metrics` has a row with initial values (all zeros)

## Troubleshooting

### "Supabase credentials not found"
- Make sure your `.env` file exists and contains all three variables
- Restart your server after adding environment variables

### "Error during migration"
- Check that the SQL migration ran successfully
- Verify your Supabase project is active
- Check the server console for specific error messages

### Realtime not working
- Ensure Realtime is enabled in Supabase dashboard
- Check that the tables are added to the Realtime publication (done in migration)
- Verify your anon key is correctly set in the frontend

## Security Notes

- **Service Role Key**: This key has full database access. Only use it server-side, never expose it to the frontend
- **Anon Key**: This key is safe to use in the frontend. It's restricted by Row Level Security (RLS) policies
- **RLS Policies**: The migration sets up RLS policies to ensure:
  - Public read access to all restaurant data
  - Server-side only write access (via service role key)
  - Public insert access to vote records (for voting)

## Next Steps

Once Supabase is set up:
- All vote counts, pizzas sold, hours, and closures will be stored in Supabase
- Data will persist across server restarts
- You can manage data directly from the Supabase dashboard
- Real-time updates will work across all connected devices

## Support

If you encounter issues:
1. Check the server console logs
2. Check the Supabase dashboard logs (Settings → Logs)
3. Verify your environment variables are correct
4. Ensure the database migration completed successfully
