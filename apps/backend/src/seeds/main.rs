use anyhow::Result;
use clap::{Parser, Subcommand};

use backend::seeds::{DatabaseManager, SeedConfig, SeedRunner};

#[derive(Parser)]
#[command(name = "seed")]
#[command(about = "Database seeding utility for Aspiron")]
pub struct SeedCli {
    #[command(subcommand)]
    pub command: SeedCommand,
}

#[derive(Subcommand)]
pub enum SeedCommand {
    /// Seed all data
    All {
        /// Batch size for database operations
        #[arg(long, default_value = "500")]
        batch_size: usize,
        /// Show progress indicators
        #[arg(long)]
        progress: bool,
    },
    /// Seed only users
    Users {
        /// Show progress indicators
        #[arg(long)]
        progress: bool,
    },
    /// Seed only content hierarchy
    Content {
        /// Show progress indicators
        #[arg(long)]
        progress: bool,
    },
    /// Seed only assessments
    Assessments {
        /// Show progress indicators
        #[arg(long)]
        progress: bool,
    },
    /// Seed only community data
    Community {
        /// Show progress indicators
        #[arg(long)]
        progress: bool,
    },
    /// Validate existing data integrity
    Validate {
        /// Check all relationships
        #[arg(long)]
        deep: bool,
    },
}

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();

    let cli = SeedCli::parse();

    match cli.command {
        SeedCommand::All {
            batch_size,
            progress,
        } => {
            let config = SeedConfig::development()
                .with_batch_size(batch_size)
                .with_progress(progress);

            let db_manager = DatabaseManager::new(&config).await?;
            let mut runner = SeedRunner::new(db_manager.get_connection(), config).await?;
            runner.run_complete_seed().await?;
        }
        SeedCommand::Users { progress } => {
            let config = SeedConfig::development().with_progress(progress);
            let db_manager = DatabaseManager::new(&config).await?;
            let mut runner = SeedRunner::new(db_manager.get_connection(), config).await?;
            runner.seed_users_only().await?;
        }
        SeedCommand::Content { progress } => {
            let config = SeedConfig::development().with_progress(progress);
            let db_manager = DatabaseManager::new(&config).await?;
            let mut runner = SeedRunner::new(db_manager.get_connection(), config).await?;
            runner.seed_content_only().await?;
        }
        SeedCommand::Assessments { progress } => {
            let config = SeedConfig::development().with_progress(progress);
            let db_manager = DatabaseManager::new(&config).await?;
            let mut runner = SeedRunner::new(db_manager.get_connection(), config).await?;
            runner.seed_assessments_only().await?;
        }
        SeedCommand::Community { progress } => {
            let config = SeedConfig::development().with_progress(progress);
            let db_manager = DatabaseManager::new(&config).await?;
            let mut runner = SeedRunner::new(db_manager.get_connection(), config).await?;
            runner.seed_community_only().await?;
        }
        SeedCommand::Validate { deep } => {
            let config = SeedConfig::development();
            let db_manager = DatabaseManager::new(&config).await?;
            let runner = SeedRunner::new(db_manager.get_connection(), config).await?;
            runner.validate_data_integrity(deep).await?;
        }
    }

    println!("✅ Seeding completed successfully!");
    Ok(())
}
