class Category < ApplicationRecord
	has_many :flashcards, dependent: :destroy

	validates :name, presence: true
	validates :slug, presence: true, uniqueness: true
end
