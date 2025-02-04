const config = {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    socketUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
};

if (config.apiUrl.endsWith('/api')) {
    config.apiUrl = config.apiUrl.slice(0, -4);
}

export default config;
