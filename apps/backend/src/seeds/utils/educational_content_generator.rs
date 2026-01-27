use fake::{Fake, Faker};
use rand::{Rng, SeedableRng};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FakeEducationalContent {
    pub title: String,
    pub description: String,
    pub difficulty_level: String,
    pub estimated_minutes: u32,
    pub tags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FakeAssessmentQuestion {
    pub question_text: String,
    pub options: Vec<String>,
    pub correct_option_index: usize,
    pub explanation: String,
    pub difficulty: String,
    pub topic_tags: Vec<String>,
    pub points: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FakeCommunityPost {
    pub title: String,
    pub content: String,
    pub post_type: String, // "question", "answer", "discussion", "tip"
    pub helpful_count: u32,
    pub sentiment: String, // "positive", "neutral", "confused"
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FakeLearningNote {
    pub content: String,
    pub note_type: String, // "summary", "question", "insight", "reminder"
    pub is_public: bool,
    pub timestamp_offset_seconds: u32, // Offset from video start
    pub confidence_level: String,      // "high", "medium", "low"
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FakeVideoTranscript {
    pub content: String,
    pub word_count: usize,
    pub reading_time_minutes: u32,
}

pub struct EducationalContentGenerator {
    rng: rand::rngs::StdRng,
}

impl EducationalContentGenerator {
    pub fn new(seed: u64) -> Self {
        Self {
            rng: rand::rngs::StdRng::seed_from_u64(seed),
        }
    }

    // Chapter and Topic Generation
    pub fn generate_chapter_title(&mut self, subject: &str, chapter_num: usize) -> String {
        let physics_chapters = vec![
            "Introduction to Mechanics",
            "Newton's Laws of Motion",
            "Work and Energy",
            "Rotational Motion",
            "Gravitation",
            "Fluid Mechanics",
            "Thermodynamics",
            "Oscillations and Waves",
            "Electrostatics",
            "Current Electricity",
        ];

        let chemistry_chapters = vec![
            "Basic Concepts of Chemistry",
            "Structure of Atom",
            "Periodic Table",
            "Chemical Bonding",
            "States of Matter",
            "Thermodynamics",
            "Chemical Equilibrium",
            "Acids and Bases",
            "Redox Reactions",
            "Organic Chemistry Basics",
        ];

        let mathematics_chapters = vec![
            "Sets and Relations",
            "Functions and Graphs",
            "Trigonometric Functions",
            "Complex Numbers",
            "Quadratic Equations",
            "Sequence and Series",
            "Coordinate Geometry",
            "Calculus Basics",
            "Differential Equations",
            "Probability",
        ];

        let biology_chapters = vec![
            "Cell Biology",
            "Genetics and Evolution",
            "Plant Physiology",
            "Human Physiology",
            "Ecology and Environment",
            "Biotechnology",
            "Diversity in Living Organisms",
            "Structural Organization",
            "Reproduction",
            "Health and Disease",
        ];

        let chapters = match subject {
            "Physics" => physics_chapters,
            "Chemistry" => chemistry_chapters,
            "Mathematics" => mathematics_chapters,
            "Biology" => biology_chapters,
            _ => physics_chapters, // fallback
        };

        if chapter_num <= chapters.len() {
            chapters[chapter_num - 1].to_string()
        } else {
            format!(
                "Advanced Topic {}: {}",
                chapter_num,
                [
                    "Applications",
                    "Problem Solving",
                    "Advanced Concepts",
                    "Special Topics",
                    "Case Studies"
                ][self.rng.gen_range(0..5)]
            )
        }
    }

    pub fn generate_topic_title(
        &mut self,
        subject: &str,
        _chapter_title: &str,
        topic_num: usize,
    ) -> String {
        let physics_topics = vec![
            "Scalar and Vector Quantities",
            "Distance vs Displacement",
            "Speed and Velocity",
            "Acceleration",
            "Kinematic Equations",
            "Projectile Motion",
            "Relative Motion",
            "Force and Free Body Diagrams",
            "Friction",
            "Newton's First Law",
        ];

        let chemistry_topics = vec![
            "Atoms and Molecules",
            "Moles Concept",
            "Chemical Formulas",
            "Stoichiometry",
            "Concentration of Solutions",
            "pH Scale",
            "Acid-Base Theories",
            "Oxidation and Reduction",
            "Balancing Redox Equations",
            "Electrochemistry",
        ];

        let mathematics_topics = vec![
            "Domain and Range",
            "Composite Functions",
            "Inverse Functions",
            "Trigonometric Identities",
            "Sine and Cosine Rules",
            "Exponential Functions",
            "Limits and Continuity",
            "Derivatives Basics",
            "Integration Techniques",
            "Applications of Calculus",
        ];

        let topics = match subject {
            "Physics" => physics_topics,
            "Chemistry" => chemistry_topics,
            "Mathematics" => mathematics_topics,
            _ => physics_topics, // fallback
        };

        if topic_num <= topics.len() {
            topics[topic_num - 1].to_string()
        } else {
            format!(
                "Topic {}: {}",
                topic_num,
                [
                    "Introduction",
                    "Basic Concepts",
                    "Advanced Applications",
                    "Problem Set",
                    "Practice Exercises"
                ][self.rng.gen_range(0..5)]
            )
        }
    }

    // Video Content Generation
    pub fn generate_video_title(&mut self, _subject: &str, topic_title: &str) -> String {
        let title_patterns = [
            format!("Understanding {}", topic_title),
            format!("{} Explained", topic_title),
            format!("Complete Guide to {}", topic_title),
            format!("{}: Problems and Solutions", topic_title),
            format!("Mastering {} - Step by Step", topic_title),
        ];

        title_patterns[self.rng.gen_range(0..title_patterns.len())].clone()
    }

    pub fn generate_video_transcript(&mut self, topic_title: &str) -> FakeVideoTranscript {
        let base_content = [
            format!(
                "Welcome to this lesson on {}. Today we'll explore the fundamental concepts and practical applications.",
                topic_title
            ),
            format!(
                "Let's start by understanding what {} means and why it's important in {}.",
                topic_title, "this subject"
            ),
            format!(
                "The key principle here is {}. Let me break this down step by step.",
                topic_title
            ),
            format!(
                "Now, let's look at some practical examples to illustrate how {} works in real-world scenarios.",
                topic_title
            ),
            format!(
                "To summarize what we've learned about {}, let's review the main takeaways.",
                topic_title
            ),
        ];

        let mut content = String::new();
        let num_paragraphs = self.rng.gen_range(3..6);

        for i in 0..num_paragraphs {
            if i < base_content.len() {
                content.push_str(&base_content[i]);
            } else {
                let additional = Faker.fake::<String>();
                content.push_str(&additional);
            }
            content.push(' ');
        }

        let word_count = content.split_whitespace().count();
        let reading_time_minutes = (word_count / 150) as u32 + 1; // Average reading speed

        FakeVideoTranscript {
            content: content.trim().to_string(),
            word_count,
            reading_time_minutes,
        }
    }

    // Assessment Question Generation
    pub fn generate_multiple_choice_question(
        &mut self,
        subject: &str,
        topic_title: &str,
        difficulty: &str,
    ) -> FakeAssessmentQuestion {
        let question_templates = [
            format!("What is the correct answer to: {}?", topic_title),
            format!("Which of the following best describes {}?", topic_title),
            format!(
                "When solving problems related to {}, which approach is most appropriate?",
                topic_title
            ),
            format!(
                "According to the principles of {}, which statement is correct?",
                topic_title
            ),
        ];

        let physics_options = vec![
            vec!["9.8 m/s²", "5.2 m/s²", "12.1 m/s²", "3.7 m/s²"],
            vec!["F = ma", "F = mv", "F = mg", "F = mx"],
            vec!["Joules", "Newtons", "Pascals", "Watts"],
            vec!["Scalar", "Vector", "Tensor", "Complex"],
        ];

        let chemistry_options = vec![
            vec!["H₂O", "CO₂", "O₂", "N₂"],
            vec!["Acidic", "Basic", "Neutral", "Buffer"],
            vec!["Exothermic", "Endothermic", "Isothermal", "Adiabatic"],
            vec!["Oxidation", "Reduction", "Neutralization", "Precipitation"],
        ];

        let mathematics_options = vec![
            vec!["2", "√2", "π", "e"],
            vec!["Linear", "Quadratic", "Exponential", "Logarithmic"],
            vec!["sin(x)", "cos(x)", "tan(x)", "sec(x)"],
            vec![
                "Differentiation",
                "Integration",
                "Factorization",
                "Expansion",
            ],
        ];

        let options_pool = match subject {
            "Physics" => physics_options,
            "Chemistry" => chemistry_options,
            "Mathematics" => mathematics_options,
            _ => physics_options,
        };

        let correct_index = self.rng.gen_range(0..4);
        let mut selected_options = options_pool[self.rng.gen_range(0..options_pool.len())].clone();

        // Ensure we have exactly 4 options
        if selected_options.len() < 4 {
            selected_options.push("Option A");
            selected_options.push("Option B");
            selected_options.push("Option C");
            selected_options.push("Option D");
        }

        if selected_options.len() > 4 {
            selected_options.truncate(4);
        }

        let options: Vec<String> = selected_options.iter().map(|s| s.to_string()).collect();

        let points = match difficulty {
            "Easy" => 5,
            "Medium" => 10,
            "Hard" => 15,
            _ => 10,
        };

        FakeAssessmentQuestion {
            question_text: question_templates[self.rng.gen_range(0..question_templates.len())]
                .clone(),
            options,
            correct_option_index: correct_index,
            explanation: format!(
                "This is the correct explanation for {} based on the principles of {}.",
                topic_title, subject
            ),
            difficulty: difficulty.to_string(),
            topic_tags: vec![topic_title.to_string(), subject.to_string()],
            points,
        }
    }

    // Community Discussion Generation
    pub fn generate_community_post(
        &mut self,
        topic_title: &str,
        post_type: &str,
    ) -> FakeCommunityPost {
        let question_posts = vec![
            format!(
                "Can someone help me understand {}? I'm having trouble with the basics.",
                topic_title
            ),
            format!(
                "What's the best approach to solve problems related to {}?",
                topic_title
            ),
            format!(
                "I'm confused about {}. Can anyone explain this in simple terms?",
                topic_title
            ),
        ];

        let answer_posts = vec![
            format!(
                "Here's how I understand {}: break it down into smaller steps first.",
                topic_title
            ),
            format!(
                "I struggled with {} too, but this technique really helped me...",
                topic_title
            ),
            format!(
                "Think of {} like this: use a real-world analogy to make it stick.",
                topic_title
            ),
        ];

        let discussion_posts = vec![
            format!(
                "I've been practicing {} and found some interesting patterns worth sharing.",
                topic_title
            ),
            format!(
                "Does anyone else find {} easier when approached from a different angle?",
                topic_title
            ),
            format!(
                "Let's discuss the applications of {} in real-world scenarios.",
                topic_title
            ),
        ];

        let tip_posts = vec![
            format!(
                "Pro tip for {}: always draw a diagram before starting the calculation.",
                topic_title
            ),
            format!(
                "Remember this shortcut for {} - it saves so much time!",
                topic_title
            ),
            format!(
                "Common mistake alert in {}: don't forget to check your units!",
                topic_title
            ),
        ];

        let title_patterns = match post_type {
            "question" => &question_posts,
            "answer" => &answer_posts,
            "tip" => &tip_posts,
            _ => &discussion_posts,
        };

        let title = title_patterns[self.rng.gen_range(0..title_patterns.len())].clone();
        let helpful_count = match post_type {
            "answer" => self.rng.gen_range(5..25),
            "tip" => self.rng.gen_range(10..30),
            "question" => self.rng.gen_range(0..10),
            _ => self.rng.gen_range(1..15),
        };

        let sentiment = match post_type {
            "question" => "confused",
            "answer" => "positive",
            "tip" => "positive",
            _ => ["positive", "neutral", "confused"][self.rng.gen_range(0..3)],
        };

        FakeCommunityPost {
            title,
            content: self.generate_post_content(post_type, topic_title),
            post_type: post_type.to_string(),
            helpful_count,
            sentiment: sentiment.to_string(),
        }
    }

    fn generate_post_content(&mut self, post_type: &str, topic_title: &str) -> String {
        match post_type {
            "question" => {
                let details = [
                    format!(
                        "I've been studying {} for hours but I'm stuck on one specific part.",
                        topic_title
                    ),
                    format!(
                        "The textbook explains {} but I don't understand the practical application.",
                        topic_title
                    ),
                    format!(
                        "Can someone walk me through an example problem involving {}?",
                        topic_title
                    ),
                ];
                details[self.rng.gen_range(0..details.len())].clone()
            }
            "answer" => {
                let details = [
                    format!(
                        "Start by breaking down {} into its fundamental components.",
                        topic_title
                    ),
                    format!(
                        "I use this mnemonic to remember the key points about {}...",
                        topic_title
                    ),
                    format!(
                        "Here's a step-by-step method that worked for me when learning {}.",
                        topic_title
                    ),
                ];
                details[self.rng.gen_range(0..details.len())].clone()
            }
            "tip" => {
                let details = [
                    format!(
                        "When working with {}, always double-check your assumptions.",
                        topic_title
                    ),
                    format!(
                        "I created a simple formula sheet for {} that really helps during exams.",
                        topic_title
                    ),
                    format!(
                        "Practice these specific types of problems for {} to build confidence.",
                        topic_title
                    ),
                ];
                details[self.rng.gen_range(0..details.len())].clone()
            }
            _ => {
                let details = [
                    format!(
                        "Let's share our experiences with learning {} and what worked best.",
                        topic_title
                    ),
                    format!(
                        "I found this interesting connection between {} and other topics we've studied.",
                        topic_title
                    ),
                    format!(
                        "The practical applications of {} in industry are quite fascinating.",
                        topic_title
                    ),
                ];
                details[self.rng.gen_range(0..details.len())].clone()
            }
        }
    }

    // Learning Notes Generation
    pub fn generate_learning_note(
        &mut self,
        topic_title: &str,
        video_duration_seconds: u32,
    ) -> FakeLearningNote {
        let note_types = ["summary", "question", "insight", "reminder"];
        let note_type = note_types[self.rng.gen_range(0..note_types.len())];

        let note_contents = match note_type {
            "summary" => vec![
                format!(
                    "Key takeaway: {} involves understanding the relationship between...",
                    topic_title
                ),
                format!(
                    "{} can be summarized in three main steps: first..., second..., third...",
                    topic_title
                ),
                format!(
                    "Main points about {}: concept, application, and common pitfalls to avoid.",
                    topic_title
                ),
            ],
            "question" => vec![
                format!(
                    "Need to clarify: How does {} relate to previous topics we've covered?",
                    topic_title
                ),
                format!(
                    "Question for later review: What are the exceptions to the rule in {}?",
                    topic_title
                ),
                format!(
                    "Still unclear about {} - ask teacher about practical examples.",
                    topic_title
                ),
            ],
            "insight" => vec![
                format!(
                    "Aha! {} makes more sense when I think of it like...",
                    topic_title
                ),
                format!(
                    "Interesting connection: {} is similar to [another concept] but with key differences.",
                    topic_title
                ),
                format!(
                    "Realization about {}: the key is to focus on the underlying principle, not memorization.",
                    topic_title
                ),
            ],
            "reminder" => vec![
                format!(
                    "Remember: for {} problems, always check units first.",
                    topic_title
                ),
                format!(
                    "Important note about {}: don't forget the boundary conditions.",
                    topic_title
                ),
                format!(
                    "Self-reminder: {} requires step-by-step approach, don't rush.",
                    topic_title
                ),
            ],
            _ => vec![format!("Note about {}.", topic_title)],
        };

        let confidence_level = match note_type {
            "insight" => "high",
            "question" => "low",
            _ => ["high", "medium", "low"][self.rng.gen_range(0..3)],
        };

        let is_public = self.rng.gen_range(0..10) < 2; // 20% chance of being public

        FakeLearningNote {
            content: note_contents[self.rng.gen_range(0..note_contents.len())].clone(),
            note_type: note_type.to_string(),
            is_public,
            timestamp_offset_seconds: self.rng.gen_range(60..video_duration_seconds - 60),
            confidence_level: confidence_level.to_string(),
        }
    }
}
