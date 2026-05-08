class DeckController < ApplicationController
  def index
    @categories = Category.includes(:flashcards).order(:name)
    @category_payload = @categories.map do |category|
      {
        id: category.id,
        name: category.name,
        cards: category.flashcards.ordered.map do |card|
          {
            id: card.id,
            question: card.question,
            answer: card.answer
          }
        end
      }
    end

    requested_category_id = params[:category_id].to_i
    available_category_ids = @category_payload.map { |category| category[:id] }

    @selected_category_id = if available_category_ids.include?(requested_category_id)
      requested_category_id
    else
      available_category_ids.first || 0
    end
  end
end
