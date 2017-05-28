let config = {
	"server": {
		"host": "localhost",
		"port": 3001,
		"url": `ws://localhost:3001`
	}
};
if(process.env.NODE_ENV === 'production') {
	config.server.port = 80;
	config.server.host = '139.59.61.233';
	config.server.url = `ws://${config.server.host}`;
}
export default config;