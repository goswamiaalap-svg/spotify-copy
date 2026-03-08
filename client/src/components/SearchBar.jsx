import { useState, useRef, useEffect } from 'react';
import { Search, XCircle } from 'lucide-react';

export default function SearchBar({
    query,
    setQuery,
    onClear
}) {
    const [focused, setFocused] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    return (
        <div className="relative z-50 flex w-full max-w-[500px] mb-8 animate-fadeIn">
            <div className="search-wrapper">
                <div className="search-icon">
                    <Search size={20} strokeWidth={2.5} />
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="Search artists, songs, or podcasts"
                    className="search-input"
                    spellCheck={false}
                    autoComplete="off"
                />

                {query.length > 0 && (
                    <button
                        onMouseDown={(e) => {
                            e.preventDefault(); // prevent blur
                            onClear();
                        }}
                        className="absolute right-4 text-[#a7a7a7] hover:text-white transition-all transform hover:scale-110 active:scale-95 z-10"
                    >
                        <XCircle size={20} fill="currentColor" stroke="black" />
                    </button>
                )}
            </div>
        </div>
    );
}


