---
name: Postgres Best Practices
description: Directives on proper schema design, indexing, foreign keys, and performant Prisma queries.
---
# Postgres Best Practices

1.  **UUIDs for PKs**: Default to `UUID`s for primary keys to ensure global uniqueness and make migrations/merging data safer.
2.  **Timestamps**: Always include `createdAt` and `updatedAt` for all significant tables mapping to business entities.
3.  **Indexing**: Index heavily queried foreign keys and columns frequently used in `WHERE` or `ORDER BY` clauses.
4.  **Soft Deletes**: Consider `deletedAt` for important records instead of hard deletes to maintain historical data integrity.
5.  **Prisma Optimization**: Avoid N+1 queries by utilizing Prisma's `include` appropriately. Don't fetch the entire model if you only need a few columns (use `select`).
