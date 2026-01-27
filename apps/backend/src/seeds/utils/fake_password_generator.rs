use anyhow::Result;
use serde::{Deserialize, Serialize};

use rand::Rng;
use rand::SeedableRng;
use tokio::fs;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct FakeUserCredentials {
    pub id: Uuid,
    pub email: String,
    pub password: String,
    pub full_name: String,
    pub first_name: String,
    pub last_name: String,
    pub role: String,
    pub username: String,
    pub phone: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PasswordFile {
    pub generated_at: String,
    pub metadata: Metadata,
    pub users: UserGroups,
    pub login_examples: Vec<LoginExample>,
    pub security_info: SecurityInfo,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Metadata {
    pub total_users: usize,
    pub seed_used: u64,
    pub generation_version: String,
    pub environment: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserGroups {
    pub admins: Vec<FakeUserCredentials>,
    pub teachers: Vec<FakeUserCredentials>,
    pub students: Vec<FakeUserCredentials>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginExample {
    pub role: String,
    pub email: String,
    pub password: String,
    pub note: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SecurityInfo {
    pub warning: String,
    pub development_only: bool,
    pub default_passwords_used: bool,
}

pub enum PasswordGenerationStrategy {
    Fixed {
        admin_password: String,
        teacher_password: String,
        student_password: String,
    },
    Random {
        length_range: std::ops::Range<usize>,
    },
    Pattern {
        prefix: String,
        suffix_type: PatternSuffix,
    },
    Memorable {
        word_count: std::ops::Range<usize>,
    },
}

pub enum PatternSuffix {
    Year,
    Role,
    Number,
    Mixed,
}

// Simple fake data generator without external fake crate for now
pub struct FakePasswordGenerator {
    rng: rand::rngs::StdRng,
    strategy: PasswordGenerationStrategy,
    environment: String,
}

impl FakePasswordGenerator {
    pub fn new(seed: u64, strategy: PasswordGenerationStrategy) -> Self {
        let environment = std::env::var("APP_ENV").unwrap_or_else(|_| "development".to_string());

        Self {
            rng: rand::rngs::StdRng::seed_from_u64(seed),
            strategy,
            environment,
        }
    }

    fn generate_fake_user_profile(&mut self, user_type: &str, index: usize) -> FakeUserCredentials {
        let user_id = Uuid::new_v4();
        let first_name = self.generate_first_name();
        let last_name = self.generate_last_name();
        let full_name = format!("{} {}", first_name, last_name);
        let username = self.generate_username(&first_name, &last_name, index);
        let email = self.generate_email(&username, user_type, index);
        let password = self.generate_password(user_type, &username, index);
        let phone = Some(self.generate_phone_number());

        FakeUserCredentials {
            id: user_id,
            email,
            password,
            full_name,
            first_name,
            last_name,
            role: user_type.to_string(),
            username,
            phone,
        }
    }

    fn generate_first_name(&mut self) -> String {
        let first_names = vec![
            "John",
            "Jane",
            "Michael",
            "Sarah",
            "Robert",
            "Emily",
            "David",
            "Lisa",
            "James",
            "Mary",
            "William",
            "Patricia",
            "Richard",
            "Jennifer",
            "Joseph",
            "Linda",
            "Thomas",
            "Barbara",
            "Charles",
            "Susan",
            "Christopher",
            "Jessica",
            "Daniel",
            "Karen",
            "Matthew",
            "Nancy",
            "Anthony",
            "Betty",
            "Mark",
            "Helen",
            "Donald",
            "Sandra",
            "Steven",
            "Donna",
            "Paul",
            "Carol",
            "Andrew",
            "Ruth",
            "Joshua",
            "Sharon",
            "Kenneth",
            "Michelle",
            "Kevin",
            "Laura",
            "Brian",
            "Sarah",
            "George",
            "Kimberly",
            "Edward",
            "Ashley",
            "Ronald",
            "Deborah",
            "Timothy",
            "Dorothy",
            "Jason",
            "Lisa",
            "Jeffrey",
            "Nancy",
        ];
        first_names[self.rng.gen_range(0..first_names.len())].to_string()
    }

    fn generate_last_name(&mut self) -> String {
        let last_names = vec![
            "Smith",
            "Johnson",
            "Williams",
            "Brown",
            "Jones",
            "Garcia",
            "Miller",
            "Davis",
            "Rodriguez",
            "Martinez",
            "Wilson",
            "Anderson",
            "Taylor",
            "Thomas",
            "Moore",
            "Jackson",
            "Martin",
            "Lee",
            "Thompson",
            "White",
            "Harris",
            "Clark",
            "Lewis",
            "Robinson",
            "Walker",
            "Young",
            "Allen",
            "King",
            "Wright",
            "Scott",
            "Torres",
            "Nguyen",
            "Hill",
            "Flores",
            "Green",
            "Adams",
            "Baker",
            "Gonzalez",
            "Nelson",
            "Carter",
            "Mitchell",
            "Perez",
            "Roberts",
            "Turner",
            "Phillips",
            "Campbell",
            "Parker",
            "Evans",
            "Edwards",
            "Collins",
            "Stewart",
            "Sanchez",
            "Morris",
            "Rogers",
            "Reed",
            "Cook",
            "Morgan",
            "Bell",
            "Murphy",
            "Bailey",
            "Rivera",
            "Cooper",
            "Richardson",
            "Cox",
            "Howard",
            "Ward",
            "Torres",
            "Peterson",
            "Gray",
            "Ramirez",
            "James",
            "Watson",
            "Brooks",
            "Kelly",
            "Sanders",
            "Price",
            "Bennett",
            "Wood",
            "Barnes",
        ];
        last_names[self.rng.gen_range(0..last_names.len())].to_string()
    }

    fn generate_username(&mut self, first_name: &str, last_name: &str, index: usize) -> String {
        let variations = [
            format!(
                "{}.{}",
                first_name.to_lowercase().replace(' ', ""),
                last_name.to_lowercase().replace(' ', "")
            ),
            format!(
                "{}_{}",
                first_name.to_lowercase().replace(' ', ""),
                last_name.to_lowercase().replace(' ', "")
            ),
            format!(
                "{}{}",
                first_name
                    .to_lowercase()
                    .chars()
                    .take(3)
                    .collect::<String>(),
                last_name.to_lowercase()
            ),
            format!("{}{}", first_name.to_lowercase(), index),
        ];

        let variation_index = self.rng.gen_range(0..variations.len());
        variations[variation_index].clone()
    }

    fn generate_email(&mut self, username: &str, user_type: &str, index: usize) -> String {
        let domains = match user_type {
            "ADMIN" => vec!["aspiron.admin", "admin.aspiron", "staff.aspiron"],
            "TEACHER" => vec!["teacher.aspiron", "faculty.aspiron", "edu.aspiron"],
            "STUDENT" => vec!["student.aspiron", "learn.aspiron", "edu.aspiron"],
            _ => vec!["aspiron.dev", "mail.aspiron"],
        };

        let domain_index = self.rng.gen_range(0..domains.len());
        let domain = domains[domain_index];

        // Add variation for uniqueness
        let variation = if index > 0 {
            format!(".{}", index)
        } else {
            String::new()
        };

        format!("{}{}@{}", username, variation, domain)
    }

    fn generate_phone_number(&mut self) -> String {
        // Generate US-style phone numbers
        let area_codes = vec![
            "212", "646", "917", "718", "347", "929", "516", "631", "914", "845",
        ];
        let exchanges = vec![
            "555", "234", "678", "901", "345", "789", "012", "456", "789", "234",
        ];
        let numbers = vec![
            "1234", "5678", "9012", "3456", "7890", "2468", "1357", "8024", "6802", "4680",
        ];

        format!(
            "({}) {}-{}",
            area_codes[self.rng.gen_range(0..area_codes.len())],
            exchanges[self.rng.gen_range(0..exchanges.len())],
            numbers[self.rng.gen_range(0..numbers.len())]
        )
    }

    fn generate_password(&mut self, user_type: &str, _username: &str, index: usize) -> String {
        match &self.strategy {
            PasswordGenerationStrategy::Fixed {
                admin_password,
                teacher_password,
                student_password,
            } => match user_type {
                "ADMIN" => admin_password.clone(),
                "TEACHER" => teacher_password.clone(),
                "STUDENT" => student_password.clone(),
                _ => "default123".to_string(),
            },
            PasswordGenerationStrategy::Random { length_range } => {
                // Generate random alphanumeric password
                use rand::distributions::{Alphanumeric, DistString};
                let length = self.rng.gen_range(length_range.clone());
                Alphanumeric.sample_string(&mut self.rng, length)
            }
            PasswordGenerationStrategy::Pattern {
                prefix,
                suffix_type,
            } => {
                let suffix = match suffix_type {
                    PatternSuffix::Year => "2024".to_string(),
                    PatternSuffix::Role => user_type.to_lowercase(),
                    PatternSuffix::Number => index.to_string(),
                    PatternSuffix::Mixed => format!("{}{}", user_type.to_lowercase(), index),
                };
                format!("{}{}", prefix, suffix)
            }
            PasswordGenerationStrategy::Memorable { word_count } => {
                // Generate memorable password with simple words
                let words = vec![
                    "apple", "orange", "banana", "computer", "keyboard", "mouse", "screen",
                    "window", "door", "house", "tree", "flower", "garden", "water", "fire",
                    "earth", "wind", "rain", "snow", "sun",
                ];
                let word_count_val = self.rng.gen_range(word_count.clone());
                let password_words: Vec<&str> = (0..word_count_val)
                    .map(|_| words[self.rng.gen_range(0..words.len())])
                    .collect();
                password_words.join("-")
            }
        }
    }

    pub fn generate_user_groups(&mut self) -> UserGroups {
        let admins = (1..=3)
            .map(|i| self.generate_fake_user_profile("ADMIN", i))
            .collect();

        let teachers = (1..=10)
            .map(|i| self.generate_fake_user_profile("TEACHER", i))
            .collect();

        let students = (1..=30)
            .map(|i| self.generate_fake_user_profile("STUDENT", i))
            .collect();

        UserGroups {
            admins,
            teachers,
            students,
        }
    }

    pub fn create_password_file(&mut self) -> PasswordFile {
        let user_groups = self.generate_user_groups();
        let total_users =
            user_groups.admins.len() + user_groups.teachers.len() + user_groups.students.len();

        // Generate login examples
        let login_examples = vec![
            LoginExample {
                role: "Admin".to_string(),
                email: user_groups.admins.first().unwrap().email.clone(),
                password: user_groups.admins.first().unwrap().password.clone(),
                note: "System administrator account".to_string(),
            },
            LoginExample {
                role: "Teacher".to_string(),
                email: user_groups.teachers.first().unwrap().email.clone(),
                password: user_groups.teachers.first().unwrap().password.clone(),
                note: "Faculty/teacher account".to_string(),
            },
            LoginExample {
                role: "Student".to_string(),
                email: user_groups.students.first().unwrap().email.clone(),
                password: user_groups.students.first().unwrap().password.clone(),
                note: "Student learner account".to_string(),
            },
        ];

        PasswordFile {
            generated_at: chrono::Utc::now().to_rfc3339(),
            metadata: Metadata {
                total_users,
                seed_used: 12345, // Fixed seed for reproducibility
                generation_version: "1.0.0".to_string(),
                environment: self.environment.clone(),
            },
            users: user_groups,
            login_examples,
            security_info: SecurityInfo {
                warning: "These are development credentials only. Never use in production!"
                    .to_string(),
                development_only: true,
                default_passwords_used: matches!(
                    self.strategy,
                    PasswordGenerationStrategy::Fixed { .. }
                ),
            },
        }
    }

    pub async fn save_passwords(
        &self,
        file_path: &str,
        password_file: &PasswordFile,
    ) -> Result<()> {
        let content = serde_json::to_string_pretty(password_file)?;
        fs::write(file_path, content).await?;
        Ok(())
    }
}
