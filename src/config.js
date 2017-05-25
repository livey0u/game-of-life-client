let config = {
	"server": {
		"host": "localhost",
		"port": 3001
	}
};
console.log(process.env);
if(process.env.NODE_ENV === 'production') {
	config.server.port = 80;
	config.server.host = 'https://guarded-thicket-49148.herokuapp.com/';
}
export default config;