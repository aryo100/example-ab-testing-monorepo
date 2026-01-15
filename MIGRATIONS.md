# Database Migrations Guide

## Initial Setup

After setting up your database connection in `.env`, run the following commands:

```bash
# Generate Prisma client
npm run prisma:generate

# Create and apply migrations
npm run prisma:migrate

# Seed the database with initial data
npm run prisma:seed
```

## Creating New Migrations

When you make changes to `prisma/schema.prisma`:

```bash
# Create a new migration
npx prisma migrate dev --name <migration_name>

# Examples:
npx prisma migrate dev --name add_user_preferences
npx prisma migrate dev --name add_flag_tags
```

## Production Migrations

In production, use `migrate deploy` instead of `migrate dev`:

```bash
# Apply pending migrations in production
npx prisma migrate deploy
```

## Migration Files Structure

Migrations are stored in `prisma/migrations/`:

```
prisma/
├── migrations/
│   ├── 20240101000000_initial/
│   │   └── migration.sql
│   ├── 20240102000000_add_feature/
│   │   └── migration.sql
│   └── migration_lock.toml
└── schema.prisma
```

## Resetting the Database

⚠️ **Warning**: These commands will delete all data!

```bash
# Reset database and reapply all migrations
npx prisma migrate reset

# Force push schema to database (bypasses migrations)
npx prisma db push --force-reset
```

## Viewing Database

```bash
# Open Prisma Studio (GUI)
npm run prisma:studio
```

## Troubleshooting

### Migration conflicts
If you have conflicts between your schema and database:

```bash
# See differences
npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datasource prisma/schema.prisma

# Create a migration from the current state
npx prisma migrate dev --name fix_schema
```

### Failed migrations
If a migration fails:

1. Check the migration SQL in `prisma/migrations/<timestamp>_<name>/migration.sql`
2. Fix the issue manually or modify the schema
3. Run `npx prisma migrate dev` again

### Generate client after schema changes
Always regenerate the client after schema changes:

```bash
npm run prisma:generate
```


