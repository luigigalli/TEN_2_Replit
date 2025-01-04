import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import { execSync } from "child_process";
import { sql } from 'drizzle-orm';
import chalk from 'chalk';

async function validateEnvironment() {
  console.log(chalk.blue("Starting environment validation..."));

  // Verify environment variables
  const requiredEnvVars = [
    "DATABASE_URL",
    "PGHOST",
    "PGPORT",
    "PGDATABASE",
    "PGUSER",
    "PGPASSWORD"
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    console.error(chalk.red(`✗ Missing required environment variables: ${missingVars.join(", ")}`));
    process.exit(1);
  }
  console.log(chalk.green("✓ Environment variables verified"));

  // Test database connection
  try {
    const db = drizzle({
      connection: process.env.DATABASE_URL!,
      ws,
    });
    const result = await db.execute(sql`SELECT 1`);
    if (result) {
      console.log(chalk.green("✓ Database connection successful"));
    }
  } catch (error) {
    console.error(chalk.red(`✗ Database connection failed: ${error instanceof Error ? error.message : String(error)}`));
    process.exit(1);
  }

  // Get current Git branch
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    console.log(chalk.yellow(`Current branch: ${branch}`));
  } catch (error) {
    console.warn(chalk.yellow(`! Unable to determine Git branch: ${error instanceof Error ? error.message : String(error)}`));
  }

  console.log(chalk.green("\nEnvironment validation successful"));
}

validateEnvironment().catch(error => {
  console.error(chalk.red(`Environment validation failed: ${error instanceof Error ? error.message : String(error)}`));
  process.exit(1);
});