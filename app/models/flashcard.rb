class Flashcard < ApplicationRecord
  belongs_to :category

  validates :question, presence: true
  validates :answer, presence: true

  scope :ordered, -> { order(:position, :id) }
end
