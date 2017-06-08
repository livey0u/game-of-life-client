let config = {
	"server": {
		"host": "localhost",
		"port": 3001,
		"url": `ws://localhost:5100`
	}
};
// if(process.env.NODE_ENV === 'production') {
// 	config.server.port = 80;
// 	config.server.host = '139.59.61.233';
// 	config.server.url = `ws://${config.server.host}`;
// }
if(process.env.NODE_ENV === 'production') {
	config.server.port = 443;
	config.server.host = 'game-of-life-relay-server.herokuapp.com';
	config.server.url = `wss://${config.server.host}`;
}
export default config;