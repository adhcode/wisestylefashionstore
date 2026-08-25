"use client";

import { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, Search, X } from "lucide-react";

/**
 * Represents an option in the Select dropdown.
 */
export interface SelectOption {
  /** The unique value for this option (used for form data) */
  value: string;
  /** The display text shown to users */
  label: string;
}

/**
 * Props for the Select component.
 */
export interface SelectProps {
  /** Currently selected value (should match one option's value) */
  value: string;
  /** Callback fired when user selects a different option */
  onChange: (value: string) => void;
  /** Array of selectable options */
  options: SelectOption[];
  /** Placeholder text shown when no option is selected */
  placeholder?: string;
  /** Placeholder text for the search input field */
  searchPlaceholder?: string;
  /** Additional CSS classes for the container */
  className?: string;
  /** If true, disables all interactions */
  disabled?: boolean;
  /** If true, hides the search input (useful for small option lists) */
  hideSearch?: boolean;
}

/**
 * Custom searchable Select component with keyboard navigation and accessibility.
 * 
 * A replacement for native HTML `<select>` elements that provides:
 * - **Real-time search filtering** - Type to find options instantly
 * - **Keyboard navigation** - Use arrow keys, Enter, Escape, Home, and End
 * - **Click-outside-to-close** - Dropdown closes when clicking elsewhere
 * - **Full accessibility** - ARIA compliant with proper roles and labels
 * - **WiseStyle branding** - Styled with plum/gold color palette
 * - **Touch-friendly** - Works well on mobile devices
 * 
 * @example Basic usage
 * ```tsx
 * const [selectedStyle, setSelectedStyle] = useState("");
 * 
 * <Select
 *   value={selectedStyle}
 *   onChange={setSelectedStyle}
 *   options={[
 *     { value: "casual", label: "Casual" },
 *     { value: "formal", label: "Formal" },
 *     { value: "wedding", label: "Wedding" }
 *   ]}
 *   placeholder="Select a style..."
 * />
 * ```
 * 
 * @example With search and many options
 * ```tsx
 * const [customerId, setCustomerId] = useState("");
 * 
 * <Select
 *   value={customerId}
 *   onChange={setCustomerId}
 *   options={customers.map(c => ({ value: c.id, label: c.name }))}
 *   placeholder="Select a customer..."
 *   searchPlaceholder="Type to search customers..."
 * />
 * ```
 * 
 * @example Disabled state
 * ```tsx
 * <Select
 *   value={value}
 *   onChange={setValue}
 *   options={options}
 *   disabled={true}
 * />
 * ```
 * 
 * @component
 */
export function Select({
  value,
  onChange,
  options,
  placeholder = "Select an option…",
  searchPlaceholder = "Search…",
  className = "",
  disabled = false,
  hideSearch = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  
  const triggerId = useId();
  const listboxId = useId();
  const searchId = useId();

  // Filter options based on search query
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Find the selected option
  const selectedOption = options.find((opt) => opt.value === value);

  // Reset highlighted index when filtered options change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (isOpen && listboxRef.current) {
      const highlightedElement = listboxRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchQuery("");
      }
    }
  };

  const handleSelect = (option: SelectOption) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case "Enter":
        e.preventDefault();
        if (isOpen && filteredOptions.length > 0) {
          handleSelect(filteredOptions[highlightedIndex]);
        } else if (!isOpen) {
          setIsOpen(true);
        }
        break;

      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery("");
        break;

      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) => 
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
        }
        break;

      case "ArrowUp":
        e.preventDefault();
        if (isOpen) {
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        }
        break;

      case "Home":
        if (isOpen) {
          e.preventDefault();
          setHighlightedIndex(0);
        }
        break;

      case "End":
        if (isOpen) {
          e.preventDefault();
          setHighlightedIndex(filteredOptions.length - 1);
        }
        break;
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent the search input from triggering select navigation
    if (e.key === "Enter" || e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.stopPropagation();
      handleKeyDown(e);
    } else if (e.key === "Escape") {
      e.stopPropagation();
      setIsOpen(false);
      setSearchQuery("");
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        id={triggerId}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        aria-labelledby={triggerId}
        disabled={disabled}
        onClick={handleToggle}
        className={`w-full border border-line rounded px-3 py-2 text-sm text-left flex items-center justify-between
          ${disabled ? "bg-gray-50 text-slate cursor-not-allowed" : "bg-white text-ink hover:border-plum"}
          ${isOpen ? "border-plum ring-2 ring-plum ring-opacity-20" : ""}
        `}
      >
        <span className={selectedOption ? "text-ink" : "text-slate"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform text-slate ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 bg-white border border-line rounded shadow-lg overflow-hidden"
          style={{ maxHeight: hideSearch ? "200px" : "320px" }}
        >
          {/* Search Input */}
          {!hideSearch && (
            <div className="p-2 border-b border-line bg-panel">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-slate"
                />
                <input
                  id={searchId}
                  ref={searchInputRef}
                  type="text"
                  role="searchbox"
                  aria-label={searchPlaceholder}
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full pl-8 pr-8 py-1.5 text-sm border border-line rounded focus:outline-none focus:border-plum focus:ring-2 focus:ring-plum focus:ring-opacity-20"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate hover:text-ink"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options List */}
          <ul
            id={listboxId}
            ref={listboxRef}
            role="listbox"
            aria-labelledby={triggerId}
            tabIndex={-1}
            className="overflow-y-auto"
            style={{ maxHeight: hideSearch ? "200px" : "240px" }}
          >
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-slate">
                {searchQuery ? (
                  <>
                    No results for <strong className="text-ink">"{searchQuery}"</strong>
                  </>
                ) : (
                  "No options available"
                )}
              </li>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = option.value === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`px-3 py-2 text-sm cursor-pointer transition-colors
                      ${isSelected ? "bg-plum text-white font-semibold" : "text-ink"}
                      ${isHighlighted && !isSelected ? "bg-plum/10" : ""}
                      ${!isSelected && !isHighlighted ? "hover:bg-plum/5" : ""}
                    `}
                  >
                    {option.label}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
