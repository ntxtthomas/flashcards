class CreateFlashcards < ActiveRecord::Migration[8.0]
  def change
    create_table :flashcards do |t|
      t.references :category, null: false, foreign_key: true
      t.text :question, null: false
      t.text :answer, null: false
      t.integer :position, null: false, default: 0

      t.timestamps
    end

    add_index :flashcards, [ :category_id, :position ]
  end
end
