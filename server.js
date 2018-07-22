let express = require("express");
let fs = require("fs");
const fileUpload = require('express-fileupload');
let path = require("path");

let app = express();
let data; //variable for comments
var temp_data;

app.set("view engine", "ejs");

app.use(express.static(__dirname + '/public'));
app.use(fileUpload());

//get all comments
app.get('/',function(req,res) {
	readComments();
    res.render("index", data);
});
//add comment
app.post('/comments',function(req,res) {
    console.log(req.files);
    if (!req.files.file) {
    	addComment(req.body, 'default.png');
	  	res.redirect('/');
	}
	else {
		// The name of the input field (i.e. "file") is used to retrieve the uploaded file
		let sampleFile = req.files.file;
		// ) method to place the file somewhere on server
	  sampleFile.mv('./public/avatar' + data.id + '.jpg', function(err) {
	  	addComment(req.body, 'avatar' + data.id + '.jpg');
	  	res.redirect('/');
	  });
	}  
});
//update comment
app.post('/comments/:id/update',function(req,res) {
    updateComment(req.body);
    res.redirect('/');
});
//remove comment
app.post('/comments/:id/delete',function(req,res) {
	console.log(req.params.id);
    removeComment(req.params.id.toString());
    res.redirect('/');
});


//reading json from a file
function readJson() {
	data = JSON.parse(fs.readFileSync('./comments.json', 'utf8'));
}
//writing json in a file
function writeJson() {
	fs.writeFile("./comments.json", JSON.stringify(data), function(err) {
    	if(err) {
        	return console.log(err);
    	}
    	console.log("The file was saved!");
	}); 
}
//recursion for deleting subcomments
function removeChilds(parId) {
	data.comments.forEach(function(el, i, arr) {
		if (el.parentId.toString() === parId) {
			removeChilds(el.id.toString());
			temp_data.comments.splice(i, 1);
			console.log('DELETED CHILD: ' + JSON.stringify(temp_data.comments));
		}
	})
}

//CRUD
function readComments() {
	readJson();
}
function addComment(body, img) {
	body.image = img;
	data.comments.push(body);
	data.id = body.id;
	writeJson(); //keep actual comments file
}
function removeComment(del_id) { //remove by id
    temp_data = data;
    console.log('DC BEFORE: ' + JSON.stringify(data.comments));
	data.comments = data.comments.filter(function(el) {
    	return el.id.toString() !== del_id;
	});
	console.log('DC AFTER: ' + JSON.stringify(data.comments));
	removeChilds(del_id);
	data = temp_data;
	writeJson();
}
function updateComment(body) { //update by id
	readComments();
	console.log("up:" + body.id);
	data.comments = data.comments.map(function(el) {
		if (el.id === body.id) {
			if (body.file == undefined) {
				body.image = 'default.png';
			}
			console.log(body); 
			return body;
		}
		else return el;
	})
	writeJson();
}

app.listen(3000);