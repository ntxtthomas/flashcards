import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "shell",
    "subtitle",
    "categorySelect",
    "card",
    "frontFace",
    "backFace",
    "question",
    "answer",
    "progress",
    "score",
    "emptyState",
    "emptyMessage",
    "flashcardContent",
    "navPrev",
    "navNext",
    "markControls",
    "shuffleButton",
    "shuffleButtonLabel",
    "modeFlashcardsButton",
    "modeQuizButton",
    "quizPickerWrap",
    "quizSelect",
    "quizContent",
    "quizQuestion",
    "quizOptions",
    "quizPrev",
    "quizNext",
    "quizFinish",
    "quizResult",
    "quizFeedback",
    "quizReviewNote"
  ]

  static values = {
    categories: Array,
    selectedCategoryId: Number
  }

  connect() {
    this.currentIndex = 0
    this.isFlipped = false
    this.isShuffled = false
    this.mode = "flashcards"

    this.results = {}
    this.quizzesByCategory = {}
    this.quizSelections = {}
    this.quizSubmitted = {}
    this.currentQuizIndex = 0
    this.currentQuizQuestionIndex = 0

    this.loadCategory(this.selectedCategoryIdValue)
  }

  changeCategory(event) {
    const categoryId = Number(event.target.value)
    this.selectedCategoryIdValue = categoryId
    this.loadCategory(categoryId)

    const url = new URL(window.location)
    url.searchParams.set("category_id", String(categoryId))
    window.history.replaceState({}, "", url)
  }

  switchMode(event) {
    this.pulseButton(event.currentTarget)
    this.mode = event.params.mode
    this.currentQuizQuestionIndex = 0
    this.isFlipped = false
    this.render()
  }

  changeQuiz(event) {
    this.pulseButton(event.currentTarget)
    this.currentQuizIndex = Number(event.target.value)
    this.currentQuizQuestionIndex = 0
    this.render()
  }

  toggleShuffle(event) {
    this.pulseButton(event.currentTarget)

    if (this.mode === "quizzes") {
      this.shuffleCurrentQuiz()
      return
    }

    this.isShuffled = !this.isShuffled
    this.currentIndex = 0
    this.isFlipped = false

    if (this.isShuffled) {
      this.shuffleCards()
    } else {
      this.loadCategory(this.activeCategory.id)
    }

    this.shuffleButtonTarget.classList.toggle("active", this.isShuffled)
    this.render()
  }

  shuffleCards() {
    const shuffled = [...this.cards]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    this.cards = shuffled
  }

  selectQuizOption(event) {
    this.pulseButton(event.currentTarget)

    const optionIndex = Number(event.currentTarget.dataset.index)
    const quiz = this.currentQuiz()
    const question = quiz?.questions[this.currentQuizQuestionIndex]
    if (!quiz || !question) return

    if (this.isCurrentQuizSubmitted()) return

    this.currentQuizSelections()[question.id] = optionIndex
    this.render()
  }

  nextQuizQuestion() {
    const quiz = this.currentQuiz()
    if (!quiz) return
    if (this.currentQuizQuestionIndex >= quiz.questions.length - 1) return

    this.pulseButton(this.quizNextTarget)
    this.currentQuizQuestionIndex += 1
    this.render()
  }

  previousQuizQuestion() {
    if (this.currentQuizQuestionIndex <= 0) return

    this.pulseButton(this.quizPrevTarget)
    this.currentQuizQuestionIndex -= 1
    this.render()
  }

  finishQuiz(event) {
    if (!this.currentQuiz()) return

    this.pulseButton(event.currentTarget)
    this.currentQuizSubmittedState()[this.currentQuizIndex] = true
    this.render()
  }

  restartQuiz(event) {
    const quiz = this.currentQuiz()
    if (!quiz) return

    this.pulseButton(event.currentTarget)
    this.currentQuizSelectionsState()[this.currentQuizIndex] = {}
    this.currentQuizSubmittedState()[this.currentQuizIndex] = false
    this.currentQuizQuestionIndex = 0
    this.render()
  }

  flipCard(event) {
    if (!this.currentCard) return

    this.pulseButton(event.currentTarget)
    this.isFlipped = !this.isFlipped
    this.cardTarget.classList.toggle("is-flipped", this.isFlipped)
  }

  nextCard(event) {
    if (this.currentIndex >= this.cards.length - 1) return

    this.pulseButton(event.currentTarget)
    this.currentIndex += 1
    this.isFlipped = false
    this.render()
  }

  previousCard(event) {
    if (this.currentIndex <= 0) return

    this.pulseButton(event.currentTarget)
    this.currentIndex -= 1
    this.isFlipped = false
    this.render()
  }

  markResult(event) {
    if (!this.currentCard) return

    this.pulseButton(event.currentTarget)
    const isCorrect = event.params.correct === true
    this.currentCategoryResults()[this.currentCard.id] = isCorrect

    if (this.currentIndex < this.cards.length - 1) {
      this.currentIndex += 1
      this.isFlipped = false
    }

    this.render()
  }

  loadCategory(categoryId) {
    this.activeCategory = this.categoriesValue.find((category) => category.id === categoryId)

    if (!this.activeCategory) {
      this.cards = []
      this.currentCard = null
      this.currentQuizIndex = 0
      this.currentQuizQuestionIndex = 0
      this.render()
      return
    }

    this.cards = this.activeCategory.cards || []
    this.quizzesByCategory[categoryId] = this.buildQuizzes(this.activeCategory)

    this.currentIndex = 0
    this.currentQuizIndex = 0
    this.currentQuizQuestionIndex = 0
    this.isFlipped = false
    this.isShuffled = false
    this.shuffleButtonTarget.classList.remove("active")

    if (!this.results[categoryId]) {
      this.results[categoryId] = {}
    }

    if (!this.quizSelections[categoryId]) {
      this.quizSelections[categoryId] = {}
    }

    if (!this.quizSubmitted[categoryId]) {
      this.quizSubmitted[categoryId] = {}
    }

    this.render()
  }

  render() {
    this.modeFlashcardsButtonTarget.classList.toggle("active", this.mode === "flashcards")
    this.modeQuizButtonTarget.classList.toggle("active", this.mode === "quizzes")

    this.shellTarget.classList.toggle("quiz-mode", this.mode === "quizzes")
    this.flashcardContentTarget.classList.toggle("hidden", this.mode !== "flashcards")
    this.quizContentTarget.classList.toggle("hidden", this.mode !== "quizzes")
    this.quizPickerWrapTarget.classList.toggle("hidden", this.mode !== "quizzes")
    this.shuffleButtonLabelTarget.textContent = this.mode === "quizzes" ? "🔀 Shuffle Quiz" : "🔀 Shuffle Cards"
    this.shuffleButtonTarget.classList.toggle("active", this.mode === "flashcards" ? this.isShuffled : false)

    if (this.mode === "flashcards") {
      this.subtitleTarget.textContent = "Pick a category, flip each card to reveal the answer, and score yourself."
      this.renderFlashcards()
      return
    }

    this.subtitleTarget.textContent = "Pick a category and quiz, then answer all multiple choice questions before scoring."
    this.renderQuizzes()
  }

  renderFlashcards() {
    this.currentCard = this.cards[this.currentIndex]

    if (!this.currentCard) {
      this.flashcardContentTarget.classList.add("hidden")
      this.emptyStateTarget.classList.remove("hidden")
      this.emptyMessageTarget.textContent = "No flashcards found for this category yet."
      this.progressTarget.textContent = "0 / 0"
      this.scoreTarget.textContent = "0%"
      return
    }

    this.flashcardContentTarget.classList.remove("hidden")
    this.emptyStateTarget.classList.add("hidden")

    this.cardTarget.classList.toggle("is-flipped", this.isFlipped)
    this.questionTarget.textContent = this.currentCard.question
    this.answerTarget.textContent = this.currentCard.answer

    this.progressTarget.textContent = `${this.currentIndex + 1} / ${this.cards.length}`
    this.scoreTarget.textContent = `${this.scoreForCurrentCategory()}%`

    this.navPrevTarget.disabled = this.currentIndex === 0
    this.navNextTarget.disabled = this.currentIndex === this.cards.length - 1

    const answerState = this.currentCategoryResults()[this.currentCard.id]
    this.markControlsTargets.forEach((button) => {
      const expected = button.dataset.correct == "true"
      button.classList.toggle("selected", answerState === expected)
    })
  }

  renderQuizzes() {
    this.populateQuizSelect()
    const quiz = this.currentQuiz()

    if (!quiz || quiz.questions.length === 0) {
      this.quizContentTarget.classList.add("hidden")
      this.emptyStateTarget.classList.remove("hidden")
      this.emptyMessageTarget.textContent = "No quiz content available for this category yet."
      this.progressTarget.textContent = "0 / 0"
      this.scoreTarget.textContent = "Pending"
      return
    }

    this.quizContentTarget.classList.remove("hidden")
    this.emptyStateTarget.classList.add("hidden")

    const question = quiz.questions[this.currentQuizQuestionIndex]
    const selections = this.currentQuizSelections()
    const selectedIndex = selections[question.id]
    const submitted = this.isCurrentQuizSubmitted()

    this.quizQuestionTarget.textContent = question.prompt
    this.progressTarget.textContent = `${this.currentQuizQuestionIndex + 1} / ${quiz.questions.length}`
    this.scoreTarget.textContent = submitted ? `${this.scoreForCurrentQuiz()}%` : "Pending"

    this.quizPrevTarget.disabled = this.currentQuizQuestionIndex === 0
    this.quizNextTarget.disabled = this.currentQuizQuestionIndex === quiz.questions.length - 1
    this.quizFinishTarget.disabled = submitted

    this.quizOptionsTarget.innerHTML = ""
    question.options.forEach((option, index) => {
      const button = document.createElement("button")
      button.type = "button"
      button.className = "quiz-option"
      button.textContent = option
      button.dataset.index = String(index)
      button.addEventListener("click", (clickEvent) => this.selectQuizOption(clickEvent))

      if (selectedIndex === index) {
        button.classList.add("selected")
      }

      if (submitted) {
        button.disabled = true
        if (index === question.correctOptionIndex) {
          button.classList.add("correct")
        } else if (selectedIndex === index && selectedIndex !== question.correctOptionIndex) {
          button.classList.add("incorrect")
        }
      }

      this.quizOptionsTarget.appendChild(button)
    })

    if (submitted) {
      this.quizFeedbackTarget.classList.remove("hidden")
      this.quizReviewNoteTarget.classList.remove("hidden")

      const chosenAnswer = selectedIndex === undefined ? "No answer selected" : question.options[selectedIndex]

      if (selectedIndex === question.correctOptionIndex) {
        this.quizFeedbackTarget.textContent = "Correct"
        this.quizFeedbackTarget.classList.remove("incorrect")
        this.quizReviewNoteTarget.textContent = `You selected: ${chosenAnswer}`
      } else {
        this.quizFeedbackTarget.textContent = `Correct answer: ${question.answer}`
        this.quizFeedbackTarget.classList.add("incorrect")
        this.quizReviewNoteTarget.textContent = `You selected: ${chosenAnswer}`
      }

      const score = this.scoreForCurrentQuiz()
      const correct = this.correctCountForCurrentQuiz()
      this.quizResultTarget.classList.remove("hidden")
      this.quizResultTarget.textContent = `Final Score: ${score}% (${correct} / ${quiz.questions.length})`
    } else {
      this.quizFeedbackTarget.classList.add("hidden")
      this.quizFeedbackTarget.classList.remove("incorrect")
      this.quizReviewNoteTarget.classList.add("hidden")
      this.quizReviewNoteTarget.textContent = ""
      this.quizResultTarget.classList.add("hidden")
      this.quizResultTarget.textContent = ""
    }
  }

  shuffleCurrentQuiz() {
    const quiz = this.currentQuiz()
    if (!quiz) return

    quiz.questions = this.seededShuffle(
      quiz.questions,
      this.seedFor(this.activeCategory.id, this.currentQuizIndex, Date.now())
    )
    this.currentQuizQuestionIndex = 0
    this.render()
  }

  populateQuizSelect() {
    const quizzes = this.currentCategoryQuizzes()
    this.quizSelectTarget.innerHTML = ""

    quizzes.forEach((quiz, index) => {
      const option = document.createElement("option")
      option.value = String(index)
      option.textContent = quiz.name
      if (index === this.currentQuizIndex) option.selected = true
      this.quizSelectTarget.appendChild(option)
    })
  }

  scoreForCurrentCategory() {
    const answers = Object.values(this.currentCategoryResults())
    if (answers.length === 0) return 0

    const correctAnswers = answers.filter((value) => value).length
    return Math.round((correctAnswers / answers.length) * 100)
  }

  scoreForCurrentQuiz() {
    const quiz = this.currentQuiz()
    if (!quiz) return 0

    const correct = this.correctCountForCurrentQuiz()
    return Math.round((correct / quiz.questions.length) * 100)
  }

  correctCountForCurrentQuiz() {
    const quiz = this.currentQuiz()
    if (!quiz) return 0

    const selections = this.currentQuizSelections()
    return quiz.questions.filter((question) => selections[question.id] === question.correctOptionIndex).length
  }

  currentCategoryResults() {
    if (!this.activeCategory) return {}

    if (!this.results[this.activeCategory.id]) {
      this.results[this.activeCategory.id] = {}
    }

    return this.results[this.activeCategory.id]
  }

  currentCategoryQuizzes() {
    if (!this.activeCategory) return []
    return this.quizzesByCategory[this.activeCategory.id] || []
  }

  currentQuiz() {
    return this.currentCategoryQuizzes()[this.currentQuizIndex]
  }

  currentQuizSelectionsState() {
    if (!this.activeCategory) return {}

    if (!this.quizSelections[this.activeCategory.id]) {
      this.quizSelections[this.activeCategory.id] = {}
    }

    return this.quizSelections[this.activeCategory.id]
  }

  currentQuizSelections() {
    const state = this.currentQuizSelectionsState()
    if (!state[this.currentQuizIndex]) {
      state[this.currentQuizIndex] = {}
    }

    return state[this.currentQuizIndex]
  }

  currentQuizSubmittedState() {
    if (!this.activeCategory) return {}

    if (!this.quizSubmitted[this.activeCategory.id]) {
      this.quizSubmitted[this.activeCategory.id] = {}
    }

    return this.quizSubmitted[this.activeCategory.id]
  }

  isCurrentQuizSubmitted() {
    const state = this.currentQuizSubmittedState()
    return state[this.currentQuizIndex] === true
  }

  buildQuizzes(category) {
    const cards = category.cards || []
    if (cards.length === 0) return []

    const quizCount = 3
    const questionCount = cards.length >= 10 ? 10 : Math.max(7, cards.length)
    const allAnswers = this.allCategoryAnswers()

    return Array.from({ length: quizCount }, (_, quizIndex) => {
      const shuffledCards = this.seededShuffle(cards, this.seedFor(category.id, quizIndex, 11))
      const chosenCards = Array.from({ length: questionCount }, (_, questionIndex) =>
        shuffledCards[questionIndex % shuffledCards.length]
      )

      const questions = chosenCards.map((card, questionIndex) => {
        const categoryDistractors = cards
          .filter((candidate) => candidate.id !== card.id && candidate.answer !== card.answer)
          .map((candidate) => candidate.answer)

        const fallbackDistractors = allAnswers.filter((answer) => answer !== card.answer)
        const distractorPool = [...new Set([...categoryDistractors, ...fallbackDistractors])]
        const shuffledDistractors = this.seededShuffle(
          distractorPool,
          this.seedFor(category.id, quizIndex, questionIndex, 29)
        )

        const distractors = shuffledDistractors.slice(0, 3)
        const options = this.seededShuffle(
          [card.answer, ...distractors],
          this.seedFor(category.id, quizIndex, questionIndex, 53)
        )

        return {
          id: `${card.id}-${questionIndex}`,
          prompt: card.question,
          answer: card.answer,
          options,
          correctOptionIndex: options.indexOf(card.answer)
        }
      })

      return {
        id: `${category.id}-${quizIndex + 1}`,
        name: `Quiz ${quizIndex + 1}`,
        questions
      }
    })
  }

  allCategoryAnswers() {
    return this.categoriesValue.flatMap((category) =>
      (category.cards || []).map((card) => card.answer)
    )
  }

  seededShuffle(values, seed) {
    const random = this.mulberry32(seed)
    const copy = [...values]

    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(random() * (index + 1))
      ;[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]]
    }

    return copy
  }

  seedFor(...parts) {
    return parts.reduce((seed, part) => ((seed * 31 + Number(part)) >>> 0), 17)
  }

  mulberry32(seed) {
    return () => {
      let state = (seed += 0x6d2b79f5)
      state = Math.imul(state ^ (state >>> 15), state | 1)
      state ^= state + Math.imul(state ^ (state >>> 7), state | 61)
      return ((state ^ (state >>> 14)) >>> 0) / 4294967296
    }
  }

  pulseButton(button) {
    if (!button) return

    button.classList.remove("is-pressed")
    void button.offsetWidth
    button.classList.add("is-pressed")

    window.setTimeout(() => {
      button.classList.remove("is-pressed")
    }, 180)
  }
}
