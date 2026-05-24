#[macro_export]
macro_rules! app_state {
    ($name:ident, $repo:path) => {
        #[derive(Clone)]
        pub struct $name {
            pub repo: Arc<dyn $repo>,
        }

        impl $name {
            pub fn new(repo: Arc<dyn $repo>) -> Self {
                Self { repo }
            }
        }
    };
}
