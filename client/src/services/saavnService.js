import jio from '../api/jiosaavn';

const saavnService = {
    search: async (query, limit = 20) => {
        return await jio.search(query, limit);
    },
    getTrending: async () => {
        return await jio.home();
    },
    getGenre: async (genre) => {
        return await jio.genre(genre);
    }
};

export default saavnService;
