import { useNavigate } from 'react-router-dom';

export default function AutocompleteDropdown({ results, show, onSelect }) {
    const navigate = useNavigate();

    if (!show || (results.songs.length === 0 && results.albums.length === 0 && results.artists.length === 0)) {
        return null;
    }

    const allItems = [
        ...results.songs.slice(0, 4).map(s => ({ ...s, _type: 'Song' })),
        ...results.artists.slice(0, 2).map(a => ({ ...a, _type: 'Artist' })),
        ...results.albums.slice(0, 2).map(a => ({ ...a, _type: 'Album' }))
    ];

    if (allItems.length === 0) return null;

    return (
        <div className="absolute top-14 left-0 w-full bg-[#282828] rounded-lg shadow-[0_16px_24px_rgba(0,0,0,0.5)] z-[100] py-2 overflow-hidden border border-[#3E3E3E]">
            {allItems.map((item, i) => (
                <div
                    key={`${item._type}-${item._id}-${i}`}
                    onClick={() => {
                        if (item._type === 'Artist') navigate(`/artist/${item._id}`);
                        else if (item._type === 'Album') navigate(`/album/${item._id}`);
                        else onSelect(item);
                    }}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-[#333333] cursor-pointer transition-colors"
                >
                    <img
                        src={item.imageUrl || `https://placehold.co/40x40/1a1a1a/fff?text=${item._type[0]}`}
                        className={`w-10 h-10 object-cover ${item._type === 'Artist' ? 'rounded-full' : 'rounded-[4px]'}`}
                        alt={item.title || item.name}
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">
                            {item.title || item.name}
                        </p>
                        <p className="text-[#a7a7a7] text-xs truncate">
                            {item._type} {item._type === 'Song' ? ` • ${item.artist?.name || 'Artist'}` : ''}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
