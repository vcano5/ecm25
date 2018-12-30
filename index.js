const download = require('download');
var Spotify = require('node-spotify-api');
require('dotenv').config()
var fs = require('fs');
const fbUpload = require('facebook-api-video-upload');
var execSync = require('child_process').execSync;
var ffmpeg = require('fluent-ffmpeg');
var express = require('express')
var app = express()
var https = require('https')


app.listen(3000, function() {
	console.log("Corriendo en puerto 3000")
})

var spotify = new Spotify({
  id: process.env.spotify_id,
  secret: process.env.spotify_secret
});

 
function descargarCancion(previewURL, archivo, cancion) {
	const pURL = new URL(previewURL);
	download(previewURL).then(data => {
    	fs.writeFileSync(__dirname + '\\' + cancion + '.mp3', data);
	});
	hacerEso(archivo, cancion)
}


function buscarCancion(c) {
	spotify.search({ type: 'track', query: c }, function(err, data) {
		if (err) {
			return console.log('Error occurred: ' + err);
	  	}
	  	//fs.writeFile('myjsonfile.json', JSON.stringify(data), 'utf8', function() {});
	  	//console.log(data.tracks.items[0].artists[0].name);
	  	//console.log("preview url: " + data.tracks.items[0]["preview_url"])
	  	const pURL = new URL(data.tracks.items[0]["preview_url"]);
	  	descargarCancion(data.tracks.items[0]["preview_url"], pURL.pathname.split('/')[2], data.tracks.items[0]["name"].replace(/\s/g,'').toLowerCase()) 
	});
}

/*function subirVideo(cancion) {
	const args = {
	    token: "", // with the permission to upload
	    id: "", //The id represent {page_id || user_id || event_id || group_id}
	    stream: fs.createReadStream(__dirname + '\\' + cancion + '.mp4'), //path to the video,
	    title: "my video",
	    description: "my description"
	};
	 
	fbUpload(args).then((res) => {
	    console.log('res: ', res);
	    //res:  { success: true, video_id: '1838312909759132' }
	}).catch((e) => {
	    console.error(e);
	});
}

function hacerEso(archivo, cancion) {
	var cmd = "ffmpeg -i original.mp4 -i " + cancion + ".mp3 -map 0:v:0 -map 1:a:0 -c copy -y " + archivo + ".mp4";
	var options = {
	  encoding: 'utf8'
	};
	//console.log(execSync(cmd, options));
	//subirVideo(cancion)
	console.log('Archivo: ' + archivo + ', cancion: ' + cancion)
}*/

function video(cancion) {
	//var command = ffmpeg().input(__dirname + '\\canciones' + cancion + '.mp3').input(__dirname + '\\video.mp4').exec();
	var command = ffmpeg(__dirname + '\\canciones\\' + cancion + '.mp3')
	  //.input(__dirname + '\\canciones' + cancion + '.mp3')
	  .input(__dirname + '\\video.mp4')
	  .on('error', function(err) {
	    console.log('An error occurred: ' + err.message);
	  })
	  .on('end', function() {
	    console.log('Merging finished !');
	  })
	  .mergeToFile(__dirname + '\\videos\\' + cancion + '.mp4', __dirname + '\\temp');
}



/*video(url, ) {
	download(url).pipe(fs.createWriteStream('dist/foo.jpg'));

}*/

app.get('/buscarcancion', function(req, res) {
	if(req.query.cancion != null ){
		spotify.search({ type: 'track', query: req.query.cancion }, function(err, data) {
			if (err) {
				return console.log('Error occurred: ' + err);
		  	}
		  	//fs.writeFile('myjsonfile.json', JSON.stringify(data), 'utf8', function() {});
		  	//console.log(data.tracks.items[0].artists[0].name);
		  	//console.log("preview url: " + data.tracks.items[0]["preview_url"])
		  	const pURL = new URL(data.tracks.items[0]["preview_url"]);
		  	var jotason = '{"url":"' + data.tracks.items[0]["preview_url"]+ '","cancion":"' + data.tracks.items[0]["name"].replace(/\s/g,'').toLowerCase() + '"}'
			res.send(JSON.parse(jotason))
		});
	}
})

app.get('/reproductor', function(req, res){
	res.sendFile(__dirname + '\\reproductor.html')
})

app.get('/', function(req, res) {
	res.sendFile(__dirname + '\\facebook.html')
})


app.get('/getfiles', function(req, res) {
	var jotason = [];
	fs.readdirSync(__dirname + '\\videos\\').forEach(file => {
		jotason.push(file)
	})
	res.setHeader('Content-Type', 'application/json')
	res.send(jotason)
})

app.get('/getfile', function(req, res) {
	if(req.query.type = "video") {

		var filePath = __dirname + '\\videos\\' + req.query.name;
		fs.exists(filePath, function(exists) {
	      if (exists) {     
	        // Content-type is very interesting part that guarantee that
	        // Web browser will handle response in an appropriate manner.
	        res.writeHead(200, {
	          "Content-Type": "application/octet-stream",
	          "Content-Disposition": "attachment; filename=" + req.query.name + '.mp4'
	        });
	        fs.createReadStream(filePath).pipe(res);
	      } else {
	        res.writeHead(400, {"Content-Type": "text/plain"});
	        res.end("ERROR File does not exist");
	      }
	    });
	}
})


