import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "categorySelect",
    "card",
    "frontFace",
    "backFace",
    "question",
    "answer",
    "progress",
    "score",
    "emptyState",
    "content",
    "navPrev",
    "navNext",
    "markControls",
    "shuffleButton"
  ]

  static values = {
    categories: Array,
    selectedCategoryId: Number
  }

  connect() {
    this.currentIndex = 0
    this.isFlipped = false
    this.isShuffled = false
    this.results = {}

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

  toggleShuffle() {
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

  flipCard() {
    if (!this.currentCard) return

    this.isFlipped = !this.isFlipped
    this.cardTarget.classList.toggle("is-flipped", this.isFlipped)
  }

  nextCard() {
    if (this.currentIndex >= this.cards.length - 1) return

    this.currentIndex += 1
    this.isFlipped = false
    this.render()
  }

  previousCard() {
    if (this.currentIndex <= 0) return

    this.currentIndex -= 1
    this.isFlipped = false
    this.render()
  }

  markResult(event) {
    if (!this.currentCard) return

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
      this.render()
      return
    }

    this.cards = this.activeCategory.cards || []
    this.currentIndex = 0
    this.isFlipped = false

    if (!this.results[categoryId]) {
      this.results[categoryId] = {}
    }

    this.render()
  }

  render() {
    this.currentCard = this.cards[this.currentIndex]

    if (!this.currentCard) {
      this.contentTarget.classList.add("hidden")
      this.emptyStateTarget.classList.remove("hidden")
      this.progressTarget.textContent = "0 / 0"
      this.scoreTarget.textContent = "0%"
      return
    }

    this.contentTarget.classList.remove("hidden")
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

  scoreForCurrentCategory() {
    const answers = Object.values(this.currentCategoryResults())
    if (answers.length === 0) return 0

    const correctAnswers = answers.filter((value) => value).length
    return Math.round((correctAnswers / answers.length) * 100)
  }

  currentCategoryResults() {
    if (!this.activeCategory) return {}

    if (!this.results[this.activeCategory.id]) {
      this.results[this.activeCategory.id] = {}
    }

    return this.results[this.activeCategory.id]
  }
}
