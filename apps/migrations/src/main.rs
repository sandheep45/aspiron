use dotenvy::dotenv;
use sea_orm::Database;

#[tokio::main]
async fn main() {
    dotenv().ok();

    let db_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let _db = Database::connect(&db_url).await.unwrap();

    println!(
        "Migration tool ready. Run 'cargo run --bin sea-orm-cli -- migrate' to run migrations."
    );
}
