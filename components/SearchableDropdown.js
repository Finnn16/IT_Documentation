import { useState, useRef, useEffect } from "react";

export default function SearchableDropdown({
  name,
  label,
  value,
  onChange,
  options = [],
  placeholder = "Pilih...",
  searchPlaceholder = "Cari...",
  allowCustom = false,
  customOptionText = "Lainnya",
  customOptionValue = "lainnya",
  required = false,
  showQty = false, // Prop baru untuk menampilkan qty
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filter options based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter((option) =>
        option.nama.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [searchTerm, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleOptionClick = (option) => {
    const event = {
      target: {
        name: name,
        value: option.id || option.value,
      },
    };
    onChange(event);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleCustomOptionClick = () => {
    const event = {
      target: {
        name: name,
        value: customOptionValue,
      },
    };
    onChange(event);
    setIsOpen(false);
    setSearchTerm("");
  };

  // Get display text for selected value
  const getDisplayText = () => {
    if (!value) return placeholder;
    if (value === customOptionValue) return customOptionText;

    const selectedOption = options.find(
      (option) => option.id?.toString() === value?.toString()
    );
    return selectedOption ? selectedOption.nama : placeholder;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors duration-200">
        {label}
      </label>

      {/* Dropdown trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-left bg-white transition-all duration-200 ease-in-out hover:border-blue-400 hover:shadow-md focus:ring-2 focus:ring-blue-200 focus:border-blue-500 flex items-center justify-between ${
          !value ? "text-gray-400" : "text-gray-900"
        }`}
      >
        <span className="truncate">{getDisplayText()}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-enhanced max-h-60 overflow-hidden transition-all duration-200">
          {/* Search input */}
          <div className="p-2 border-b border-gray-200">
            <input
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg transition-all duration-200 hover:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Options list */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 && searchTerm ? (
              <div className="px-3 py-2 text-gray-500 text-sm transition-colors duration-200">
                Tidak ditemukan hasil untuk "{searchTerm}"
              </div>
            ) : (
              <>
                {/* Default empty option */}
                <button
                  type="button"
                  onClick={() =>
                    handleOptionClick({ id: "", nama: placeholder })
                  }
                  className={`w-full text-left px-3 py-2 transition-all duration-200 ease-in-out hover:bg-blue-50 hover:shadow-sm text-sm ${
                    !value
                      ? "bg-blue-50 text-blue-600 shadow-sm"
                      : "text-gray-900"
                  }`}
                >
                  {placeholder}
                </button>

                {/* Filtered options */}
                {filteredOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleOptionClick(option)}
                    className={`w-full text-left px-3 py-2 transition-all duration-200 ease-in-out hover:bg-blue-50 hover:shadow-sm text-sm ${
                      value?.toString() === option.id?.toString()
                        ? "bg-blue-50 text-blue-600 shadow-sm"
                        : "text-gray-900"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{option.nama}</span>
                      {showQty && (
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            option.qty <= option.stok_minimum
                              ? "bg-red-100 text-red-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          Stok: {option.qty}
                        </span>
                      )}
                    </div>
                  </button>
                ))}

                {/* Custom option */}
                {allowCustom && (
                  <button
                    type="button"
                    onClick={handleCustomOptionClick}
                    className={`w-full text-left px-3 py-2 transition-all duration-200 ease-in-out hover:bg-blue-50 hover:shadow-sm text-sm border-t border-gray-200 ${
                      value === customOptionValue
                        ? "bg-blue-50 text-blue-600 shadow-sm"
                        : "text-gray-900"
                    }`}
                  >
                    {customOptionText}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        name={name}
        value={value || ""}
        required={required}
      />
    </div>
  );
}
