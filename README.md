# Flashcards

[![Ruby on Rails](https://img.shields.io/badge/Ruby_on_Rails-8.0.5-CC0000?logo=rubyonrails&logoColor=white)](https://rubyonrails.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Hotwire](https://img.shields.io/badge/Hotwire-Turbo_%2B_Stimulus-7A1FA2)](https://hotwired.dev/)

Local Rails flashcard trainer for interview and certification prep. Browse study decks, flip cards to reveal answers, self-grade with yes/no controls, shuffle card order, and track your score per category.

## Screenshot

![Flashcards app screenshot](app/assets/images/flashcard.png)

## Features

- Category-based decks backed by seeded data
- Card flip animation and next/previous navigation
- Yes/no self-grading with score tracking
- Shuffle mode for randomized review
- Responsive dark UI for desktop and mobile

## Decks

- System Design
- Ruby on Rails - Architecture & Patterns
- Rails Doctrines
- Rails API Design
- Rails Error Handling
- React - Core Concepts
- React Hooks
- React Testing
- AWS Solutions Architect - Associate (SAA-C03)
- GitHub Actions / GH-200
- Ruby Methods
- Rails Methods
- SQL

## Run Locally

```bash
bundle install
bin/rails db:setup
bin/rails s
```

Open http://localhost:3006.

## Tests

```bash
bin/rails test
```

## Notes

- Flashcards live in [db/seeds.rb](db/seeds.rb).
- The interactive deck is driven by Stimulus in [app/javascript/controllers/flashcards_controller.js](app/javascript/controllers/flashcards_controller.js).
- The UI is styled in [app/assets/stylesheets/application.css](app/assets/stylesheets/application.css).

