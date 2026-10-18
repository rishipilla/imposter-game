/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WordPair, Difficulty } from '../types/game';
import { WORD_BANK, CATEGORIES } from '../game/wordBank';
import { sound } from '../utils/audio';

interface WordBankModalProps {
  onClose: () => void;
  customPairs: WordPair[];
  onAddCustomPair: (pair: WordPair) => void;
}

export const WordBankModal: React.FC<WordBankModalProps> = ({
  onClose,
  customPairs,
  onAddCustomPair,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | Difficulty>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  const [customNormal, setCustomNormal] = useState('');
  const [customImposter, setCustomImposter] = useState('');
  const [customCategory, setCustomCategory] = useState('Things & Everyday Objects');
  const [customDifficulty, setCustomDifficulty] = useState<Difficulty>('easy');
  const [customHint, setCustomHint] = useState('');

  const allPairs = [...WORD_BANK, ...customPairs];

  const filtered = allPairs.filter((pair) => {
    const matchesCat =
      selectedCategory === 'All Categories' || pair.category === selectedCategory;
    const matchesDiff =
      selectedDifficulty === 'all' || pair.difficulty === selectedDifficulty;
    const matchesQuery =
      searchQuery === '' ||
      pair.normalWord.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pair.imposterWord.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pair.hint.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesDiff && matchesQuery;
  });

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNormal.trim() || !customImposter.trim()) return;

    sound.playBlip(620);
    const newPair: WordPair = {
      id: 'custom_' + Date.now(),
      normalWord: customNormal.trim(),
      imposterWord: customImposter.trim(),
      category: customCategory,
      difficulty: customDifficulty,
      hint: customHint.trim() || 'Custom Word Pair',
    };
    onAddCustomPair(newPair);
    setCustomNormal('');
    setCustomImposter('');
    setCustomHint('');
    setIsAddingCustom(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-3xl max-h-[90vh] rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl flex flex-col overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2">
              <span>Word & Things Bank</span>
              <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                {allPairs.length} Curated Pairs
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Everyday objects, tools, furniture, gadgets, food, and concrete things
            </p>
          </div>
          <button
            onClick={() => {
              sound.playBlip();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center text-sm cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Filter Controls */}
        <div className="p-4 bg-zinc-950/70 border-b border-zinc-800 flex flex-col sm:flex-row gap-2.5 items-center justify-between">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items & things (e.g. Spoon, Chair, Laptop)..."
            className="w-full sm:flex-1 bg-zinc-900 border border-zinc-700 focus:border-zinc-300 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none"
          />

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 sm:flex-none bg-zinc-900 border border-zinc-700 text-xs text-white rounded-xl px-2.5 py-1.5 outline-none cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as 'all' | Difficulty)}
              className="bg-zinc-900 border border-zinc-700 text-xs text-white rounded-xl px-2.5 py-1.5 outline-none cursor-pointer capitalize"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <button
              onClick={() => {
                sound.playBlip();
                setIsAddingCustom(!isAddingCustom);
              }}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold cursor-pointer transition-all shrink-0"
            >
              {isAddingCustom ? 'Cancel' : '+ Add Thing'}
            </button>
          </div>
        </div>

        {/* Add Custom Word Pair Form Accordion */}
        {isAddingCustom && (
          <form
            onSubmit={handleCreateCustom}
            className="p-4 bg-zinc-900 border-b border-zinc-700 grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-zinc-400 uppercase">
                Normal Word (Innocents)
              </label>
              <input
                type="text"
                required
                value={customNormal}
                onChange={(e) => setCustomNormal(e.target.value)}
                placeholder="e.g. Toothpick"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-zinc-300"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-zinc-400 uppercase">
                Imposter Word (Sneaky Twin)
              </label>
              <input
                type="text"
                required
                value={customImposter}
                onChange={(e) => setCustomImposter(e.target.value)}
                placeholder="e.g. Cotton Swab"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-zinc-300"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-zinc-400 uppercase">Category</label>
              <select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
              >
                {CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-zinc-400 uppercase">Clue Hint</label>
              <input
                type="text"
                value={customHint}
                onChange={(e) => setCustomHint(e.target.value)}
                placeholder="e.g. Small wooden/cotton stick"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-zinc-300"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end gap-2 pt-1">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs uppercase tracking-wide cursor-pointer shadow-sm"
              >
                Save Word Pair
              </button>
            </div>
          </form>
        )}

        {/* Word Pairs List */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filtered.length > 0 ? (
            filtered.map((pair) => (
              <div
                key={pair.id}
                className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 flex flex-col justify-between gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                    {pair.category}
                  </span>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                    {pair.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-center">
                    <span className="text-[10px] text-zinc-500 block">Normal Word</span>
                    <strong className="text-xs sm:text-sm text-white">{pair.normalWord}</strong>
                  </div>
                  <span className="text-zinc-500 font-mono text-xs">vs</span>
                  <div className="flex-1 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-center">
                    <span className="text-[10px] text-zinc-400 block">Imposter Word</span>
                    <strong className="text-xs sm:text-sm text-zinc-200">{pair.imposterWord}</strong>
                  </div>
                </div>

                <span className="text-[11px] text-zinc-500 italic truncate">
                  Hint: "{pair.hint}"
                </span>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-zinc-500 text-xs font-mono">
              No pairs found matching the criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
