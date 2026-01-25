#[derive(Debug, Clone)]
pub struct SeedConfig {
    pub batch_size: usize,
    pub show_progress: bool,
    pub dry_run: bool,
    pub validate_relationships: bool,
    pub environment: SeedEnvironment,
}

#[derive(Debug, Clone)]
pub enum SeedEnvironment {
    Development,
    Testing,
    Demo,
    Production,
}

impl SeedConfig {
    pub fn development() -> Self {
        Self {
            batch_size: 500,
            show_progress: true,
            dry_run: false,
            validate_relationships: true,
            environment: SeedEnvironment::Development,
        }
    }

    pub fn with_batch_size(mut self, batch_size: usize) -> Self {
        self.batch_size = batch_size;
        self
    }

    pub fn with_progress(mut self, progress: bool) -> Self {
        self.show_progress = progress;
        self
    }

    pub fn with_dry_run(mut self, dry_run: bool) -> Self {
        self.dry_run = dry_run;
        self
    }

    pub fn with_validation(mut self, validate: bool) -> Self {
        self.validate_relationships = validate;
        self
    }
}
