let config = {
	"server": {
		"host": "localhost",
		"port": 3001,
		"url": `ws://localhost:3001`
	}
};
if(process.env.NODE_ENV === 'production') {
	config.server.port = 80;
	config.server.host = 'guarded-thicket-49148.herokuapp.com';
	config.server.url = `wss://${config.server.host}`;
}
export default config;