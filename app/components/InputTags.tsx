"use client";

import React, { useState, useEffect } from "react";

interface InputTagsProps {
  tags: string[];
  onTagsInput: (tags: string[]) => void;
}

const InputTags = ({ tags, onTagsInput }: InputTagsProps) => {
  const [input, setInput] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      const newTag = input.trim();
      if (newTag && newTag.startsWith("#") && !tags.includes(newTag)) {
        onTagsInput([...tags, newTag]);
      }
      setInput("");
    } else if (e.key === "Backspace" && input === "" && tags.length) {
      // Backspace with empty input deletes the last tag
      onTagsInput(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsInput(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <fieldset className="fieldset w-78 text-center">
      <legend className="fieldset-legend ">Add tags</legend>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="badge badge-primary gap-1 px-2 py-1 rounded-full flex items-center"
          >
            {tag}
            <button
              type="button"
              className="ml-1 text-xs"
              onClick={() => removeTag(tag)}
            >
              ✕
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type #tag and press space or enter"
        className="input input-bordered w-full items-center  "
      />
      <div className="label">Optional</div>
    </fieldset>
  );
};

export default InputTags;
