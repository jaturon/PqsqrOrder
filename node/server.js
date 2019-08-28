var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();
var router = express.Router();
var fs = require('fs');
var json2csv = require('json2csv');
var mysql = require('mysql');
var os = require('os');
var exec = require('child_process').exec;
var uuid = require('uuid/v1');



var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "foodstore_db"
});


//  var csvDB = '/sdcard/Nodejs/db.csv';
  var csvDB = './node/db.csv';
//  var imgFolder = '/sdcard/Nodejs/public/img/';
//  var imgFolder = './node/public/img/';
 var dailyReportPath ='./node/public/dailyReport/';

    var imgPDFolder = './node/public/img/Products';
//var windows874 = require('windows-874');

app.use(express.static(path.join(__dirname, 'public')));
app.use('/jquery-mobile',  express.static(path.join('./', 'node_modules/jquery-mobile/dist')));
app.use('/jquery',  express.static(path.join('./', 'node_modules/jquery-mobile/node_modules/jquery/dist')));
app.use('/jquery-ui',  express.static(path.join('./', 'node_modules/jquery-ui/ui')));

app.use('/bootstrap',  express.static(path.join('./', 'node_modules/bootstrap/dist')));
app.use('/popper',  express.static(path.join('./', 'node_modules/popper.js/dist')));


//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser.json());
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));


// init auths data to memory 

global.auths = {};
global.que = 0;


 fs.readFile('./node/data/Auths.json', 'utf8', function (err,txtdata) {
	if (err) {console.log(err);}
    if(txtdata!=""){
	eval("auths =" +txtdata.replace(/"/g,"'"));
	}
 });



router.get('/', function (req, res) {  
  res.render('index');
});

	con.connect(function(err) {
      if (err) {console.error('error connecting: ' + err.stack); return;}
	});

app.post('/UUIDAuthChk', function (req, res) {  
	var id = req.body.id;
	if(auths[id] == undefined) {
	res.send("deleted");
	} else {
	res.send(auths[id].status);
	}
});

app.post('/getVersion', function (req, res) { 

	license = "./node/data/version.json";
	fs.readFile(license, 'utf8',  function (err,txtversion) {
	 eval('var oversion='+ txtversion);
	 //console.log(oversion);
	 res.send(oversion);
	});


});


app.post('/DailyLists', function (req, res) { 
	var Reportdir = dailyReportPath + getDate().split(" ")[0].replace(/\//g, "");
	var reportName1 = "/1.csv";
	var reportName2 = "/2.csv";
	var content = "";
	var resp = [];
		  fs.readFile(Reportdir+reportName1, 'utf8', function (err,hisData) {
				if (err) {console.log("");} else {
				if(hisData!= "") {				
				hisData.toString().split("\n").forEach(function(line, index, arr) {
					if(index !=0 && line !="") {
					content += "<tr><td>";
					content += line.replace(/,/g,"</td><td>");
					content += "<i class=\'material-icons\' onClick=\'delHistory(this)\'>delete</i></td></tr>";
					//console.log(content);
					}
				});
				}
		  resp.push('/dailyReport/'+getDate().split(" ")[0].replace(/\//g, "")+"/"+reportName1);
		  resp.push(content);
	      res.send(resp);
				}
		  });

});

app.post('/removeItem', function (req, res) {  
	var code = req.body.code;
	var table = req.body.table;
	//console.log(client["table"+table][code]);

	if (client["table"+table][code].qty > 1)
	{
		client["table"+table][code].qty = client["table"+table][code].qty - 1 ;

	} else {
		delete client["table"+table][code];
	}
	io.emit("refreshDesk" ,"") ;

});


app.post('/getQue', function (req, res) {  
	//console.log(client["table"+table][code]);
	que = que +1 ;
	console.log(que)
	res.send(que+"");

});

app.post('/checkUpdate', function (req, res) { 

	if (os.platform()=="win32")
	 {
		exec( "node .\\node\\chkupdate.js", function(error, stdout, stderr){
			if (error !== null) {console.log('exec error: ', error);}
			res.send(stdout);
		});
	
	} else if(os.platform()=="linux") {
			exec("node ./node/chkupdate.js", function(error, stdout, stderr) {
			//console.log('stdout: ', stdout);
			//console.log('stderr: ', stderr);
			if (error !== null) {console.log('exec error: ', error);}
			 res.send(stdout);
			});
	 }


});


app.post('/UUIDsetAuth', function (req, res) {  
		var act = req.body.action;
		var id = req.body.id;
		if(act == 'SwitchAuth'){
			if(auths[id].status=="wait"){
			auths[id].status = "auth";
			} else {
			auths[id].status = "wait";
			}

		} else if(act == 'Remove'){
			delete auths[id];
		}


	fs.writeFile('./node/data/Auths.json', JSON.stringify(auths), 'utf8' , function(err) {
		if (err) throw err;
	});
	res.send("done");
});

app.post('/UUIDlsAuth', function (req, res) {  
		//console.log(auths)
		res.send(auths);
});




app.post('/regUUID', function (req, res) {  
	var data = eval(req.body.data);	
	var UUID = uuid();
	var id= {};
	id.id = UUID;
	id.username = data.username;
	id.Phone = data.Phone;
	id.status = "wait";
			if(auths[UUID]=== undefined){
				auths[UUID]=id;
			}
	
	// write back add to auths
	fs.writeFile('./node/data/Auths.json', JSON.stringify(auths), 'utf8' , function(err) {
		if (err) throw err;
	});
	res.send(id);
});

app.post('/optTypeID', function (req, res) {  
 		var strsql = "";
		var sqlpath = "./node/strsql/optTypeID.sql"; 
		  fs.readFile(sqlpath, 'utf8', function (err,txtsql) {
					  if (err) {console.log(err);}
					  con.query(txtsql,  function (err, result, fields) {
						if (err) { console.log(err); }
						var optString = "";
						//console.log(txtsql);
						//console.log(result);
						//console.log(result[0].optTypeID.toString());
						for(i=0 ;i<result.length; i++ ) {
							optString=optString+"<option value="+result[i].ID+">"+result[i].name+"</option>";
						}
						//console.log(optString);
						res.send(optString);
					  });
		  });
 });

app.post('/getProductImgs', function (req, res) {  
		result = []
		requiredCount = 3;
		files = fs.readdirSync(imgPDFolder)

	while(requiredCount-- >0 && files.length) {
		length = files.length;
		selectedIndex = Math.floor(Math.random() * length)
		selected = files.splice(selectedIndex, 1);
		result.push(selected)
	}
		res.send(result);

});


app.post('/getIPs', function (req, res) {  


var ifaces = os.networkInterfaces();
var ips = [];
Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;

  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }

    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      // console.log(ifname + ':' + alias, iface.address);
	 ips.push(ifname + ':' + alias, iface.address);
    } else {
      // this interface has only one ipv4 adress
      //console.log(ifname, iface.address);
	  ips.push(ifname+":"+iface.address);
    }
    ++alias;
  });
});
	res.send(ips);	
});

app.post('/optUnitID', function (req, res) {  
 		var strsql = "";
		var sqlpath = "./node/strsql/optUnitID.sql"; 
		  fs.readFile(sqlpath, 'utf8', function (err,txtsql) {
					  if (err) {console.log(err);}
					  con.query(txtsql,  function (err, result, fields) {
						if (err) { console.log(err); }
						var optString = "";
						//console.log(txtsql);
						//console.log(result);
						//console.log(result[0].optTypeID.toString());
						for(i=0 ;i<result.length; i++ ) {
							optString=optString+"<option value="+result[i].ID+">"+result[i].name+"</option>";
						}
						//console.log(optString);
						res.send(optString);
					  });
		  });
 });

app.post('/optBranchID', function (req, res) {  
 		var strsql = "";
		var sqlpath = "./node/strsql/optBranchID.sql"; 
		  fs.readFile(sqlpath,  'utf8', function (err,txtsql) {
					  if (err) {console.log(err);}
					  con.query(txtsql,  function (err, result, fields) {
						if (err) { console.log(err); }
						var optString = "";
						//console.log(txtsql);
						//console.log(result.length);
						//console.log(result[0].optBranchID.toString());
						for(i=0 ;i<result.length; i++ ) {
							optString=optString+"<option value="+result[i].ID+">"+result[i].name+"</option>";
						}
						res.send(optString);
					  });
		  });
 });


app.post('/getProductCard', function (req, res) {
 var data = eval(req.body.data);
 var name ="";
 var type = "";
 var price = 0;
 var qty = 0;
 var strsql= "";
 var params= [];
	var strsql = "";
	var sqlpath = "./node/strsql/productCard.sql";
	fs.readFile(sqlpath, 'utf8',  function (err,txtsql) {
		if (err) {console.log(err);}
		 strsql = txtsql;
		 // check price option 
			  strsql = strsql.replace(/{Price}/g, "Price"+ data.optionPrice);
			  strsql = strsql.replace(/{BranchID}/g, "Price"+ data.BranchID);

		 // check if search by barcode
			if(data.code!="") {
				 strsql = strsql +" where barcode='" + data.code +"'";
				 if(data.ProductType !=0) {
				 strsql = strsql +" and typeID='" + data.ProductType +"'";
				}
			} else {
				if(data.ProductType !=0) {
				 strsql = strsql +" where typeID='" + data.ProductType +"'";
				}

			}


		 // check if search by product type

		 // add limit data show
			strsql = strsql + " limit "+data.pagging+", "+data.pageInum

			//console.log(strsql);
		 // query product  and send out
		      con.query(strsql,  function (err, result) {
				 
				if (err) { console.log(err); }
					// console.log(result.length);
					var tplpath = "./node/tpl/"+data.tpl+".tpl";
					fs.readFile(tplpath, 'utf8',  function (err,content) {
						var AllelCard = "";
						if(result.length>=0) {
							for(i=0; i<result.length; i++ ) {
						var elCard = content;
						elCard = elCard.replace(/{Image}/g, (result[i].Image=="")?"img/product.png":result[i].Image );
						elCard = elCard.replace(/{ProductType}/g, result[i].ProductType );
						elCard = elCard.replace(/{ProductModel}/g, result[i].Model );
						elCard = elCard.replace(/{ProductName}/g, result[i].Name );
						elCard = elCard.replace(/{Price}/g, result[i].Price );
						elCard = elCard.replace(/{Unit}/g, result[i].Unit );
						elCard = elCard.replace(/{Barcode}/g, result[i].BarCode );
					
						AllelCard = AllelCard + elCard;
						}
						}
							oContent = {};
							oContent.content = AllelCard;
							oContent.TypeID = result.TypeID;
							res.send(oContent);	      
					
					});
			   });
	});	

});

app.post('/delTable', function (req, res) {  

 var data = req.body;
 
	// check user phone on server if it match delete

		if (auths[data.id].Phone == data.phone)
		{
		
		for (var key in history) {
		if(history[key].table==data.table) {
			delete history[key];
		}
		}
		delete client[data.table];
		res.send("AuthOk");
		} else {
		res.send("NoAuth");
		}
		io.emit("refreshDesk" ,"") ;
});


app.post('/createImage', function (req, res) {  
 var data = eval(req.body.data);
	
	var dir_folder_filename = imgPDFolder + "/" + data.filename;
	var img = data.filebob;
    saveImage(img, dir_folder_filename);	
});

app.post('/updateOptions' , function(req, res) { 
  var data = eval(req.body.data);


// delete  option request	
		var strsql = "";
		var sqlpath = "./node/strsql/queryDeleteOptions.sql";
		  fs.readFile(sqlpath, 'utf8',  function (err,txtsql) {
			  if (err) {console.log(err);}
			  var params = [];
			  params.push(data.table);
			  if(data.oDel != undefined) {
			  strsql = txtsql.replace("{ProductTable}", data.table) + " where id in ( " + data.oDel.toString() + ")";
					con.query(strsql,  params, function (err, result) {
						if (err) { console.log(err); } 
					});
			  }
		  });

// insert option request
		var strsql = "";
		var sqlpath = "./node/strsql/queryInsertOptions.sql";
		  fs.readFile(sqlpath, 'utf8',  function (err,txtsql) {
			  if (err ) {console.log(err);}
			  if (data.oAdd!= undefined) {
			  for (i = 0; i < data.oAdd.length; i++) { 		
			  var params = [];
			  strsql = txtsql.replace("{ProductTable}", data.table);
			  params.push(data.oAdd[i]);
					con.query(strsql,  params, function (err, result) {
						if (err) { console.log(err); } 
					});
			  }
			  }
			 console.log(data);

		  });

			// call update option

});

app.post('/DocNo' , function(req, res) { 
  var data = eval(req.body.data);
	var strsql = "";
		var sqlpath = "./node/strsql/getDocNo.sql";

		  fs.readFile(sqlpath, 'utf8',  function (err,txtsql) {
			  if (err) {console.log(err);}
			  strsql = txtsql.replace("{ID}", data.BranchID);
				con.query(strsql,  function (err, result, fields) {
				if (err) { console.log(err); }
				res.send(result[0]);
		      });		  
		  
		  });
});

app.post('/getBranchData', function (req, res) {  
 var ID =req.body.ID;

	var strsql = "";
		var sqlpath = "./node/strsql/getbranchData.sql";

		  fs.readFile(sqlpath, 'utf8',  function (err,txtsql) {
			  if (err) {console.log(err);}
			  strsql = txtsql.replace("{ID}", ID);
				con.query(strsql,  function (err, result, fields) {
				if (err) { console.log(err); }
				res.send(result[0]);
		      });		  
		  
		  });

});

app.post('/updatebranchData', function (req, res) {  
 var data = eval(req.body.data);

	var strsql = "";
		var sqlpath = "./node/strsql/updatebranchData.sql";

		  fs.readFile(sqlpath, 'utf8',  function (err,txtsql) {
			  if (err) {console.log(err);}
			  	 strsql = txtsql;
			  	 var params = [];
				 params.push(data.Code);
				 params.push(data.Name);
				 params.push(data.Address);
				 params.push(data.Phone);
				 params.push(data.SaleNo);
				 params.push(data.ID);
				con.query(strsql, params , function (err, result, fields) {
				if (err) { console.log(err); }
		      });		  
		  
		  });


});

app.post('/getProductDetail', function (req, res) {  
 var data = eval(req.body.data);
 var files = [];
 var result = {};
 var name ="";
 var detail = "";
 var price = 0;
 var qty = 0;
    if (data.barcode !="") {
		var strsql = "";
		var sqlpath = "./node/strsql/productDetail.sql";
		  fs.readFile(sqlpath, 'utf8',  function (err,txtsql) {
			  if (err) {console.log(err);}
			  var params = [];
			  strsql = txtsql.replace("{Price}", "Price"+ data.optionPrice) + " where barcode= ? ";
			  params.push(data.barcode);
		      con.query(strsql,  params, function (err, result, fields) {
				if (err) { console.log(err); }
				res.send(result);
		      });
		  });
	}

});

app.post('/delData', function (req, res) { 
 var data = eval(req.body.data);
 //console.log(data);
		var strsql = "";
		var sqlpath = "./node/strsql/queryProduct.sql";

					var params = [];
					params.push(data.barcode);

					//remove product sto_product
					var strsql1 = "delete from sto_product where ID in (select ProductID from sto_product_attr where barcode=?)";
					  con.query(strsql1,  params, function (err, result0) {
						if (err) { console.log(err); } 
					  });

					//remove product attribute
					var strsql2 = "delete from sto_product_attr where barcode = ?";
					  con.query(strsql2,  params, function (err, result1) {
						if (err) { console.log(err); } 
					  });
					
					//remove sto_balance using barcode
					var strsql3 = "delete from sto_balance where Product = ?";
					  con.query(strsql3,  params, function (err, result2) {
						if (err) { console.log(err); } 
					  });

					res.send("delete ok");
});

app.post('/removeFile', function (req, res) {  
 var data = eval(req.body.data);
 var dir_folder_filename = imgPDFolder + "/" + data.filename;
   fs.unlink(dir_folder_filename,function(err){
        if(err) return console.log(err);
   });  
 });

app.post('/closeBrowser', function (req, res) {  
	if (os.platform()=="win32")
	 {
			// close winndows browser script
			//exec(process.cwd()+'\\node\\printhtml.exe html=\"'+body.replace(/%/g,"%%")+'\"', function(error, stdout, stderr) {
			//console.log('stdout: ', stdout);
			//console.log('stderr: ', stderr);
			//if (error !== null) {console.log('exec error: ', error);}				
			} else if(os.platform()=="linux") {
			exec("kill $(ps aux | grep 'chromium' | awk '{print $2}')", function(error, stdout, stderr) {
			//console.log('stdout: ', stdout);
			//console.log('stderr: ', stderr);
			if (error !== null) {console.log('exec error: ', error);}
			});
	 }

})


app.post('/saveData', function (req, res) {  
 var data = eval(req.body.data);
 //console.log(data);
		var strsql = "";
		var sqlpath = "./node/strsql/queryProduct.sql";
		  fs.readFile(sqlpath, 'utf8',  function (err,txtsql) {
			  if (err) {console.log(err);}
			  //var params0 = [];
			  strsql = txtsql + " where barcode= '" + data.barcode + "'";
			  //console.log(strsql);
			  //params0.push(data.barcode);
			  	//check if barcode record exist in record of a product table 
		      con.query(strsql , function (err, result) {
				if (err) { console.log(err); }
				 //console.log(result.length)
				 if (result.length == 1 )
				 { 	//if exist update catID, model, name, unitID using productID (having from search barcode)					
					params2 = [];
					var fields2 = {};
					strsql2 = "";
					params2.push(data.model);
					params2.push(data.name);	
					params2.push(data.unitID);	
					params2.push(data.typeID);	
					params2.push((data.imgName!="")?"/img/Products/" +data.imgName:"");	
					params2.push(getDate());
					params2.push(result[0].productID);
					sqlpath2 = "./node/strsql/updateProduct.sql";
					fs.readFile(sqlpath2, 'utf8',  function (err,txtsql) {
					  strsql2 = txtsql + " where ID = ? ";	
					  con.query(strsql2,  params2, function (err, result2) {
						if (err) { console.log(err); } 
							//console.log(strsql2); 
							//console.log(params2);

					  });
					});
				  // get last sql and calculate and record transaction data

				 //then update price1 to product attr
					params3 = [];
					strsql3 = "";
					params3.push(data.price);
					params3.push(getDate());
					params3.push(result[0].productID);
					params3.push(data.barcode);
					sqlpath3 = "./node/strsql/updateProductPrice.sql";
					fs.readFile(sqlpath3, 'utf8',  function (err,txtsql) {
					  strsql3 = txtsql.replace("{Price}","Price"+data.optionPrice) + " where ProductID= ? and BarCode= ? ";	
					  con.query(strsql3,  params3, function (err, result3) {
						if (err) { console.log(err); }
							//console.log(strsql3); 
							//console.log(params3);
					  });
					});
				 //then update qty to stock balance table using default branchID			 
					params4 = [];
					strsql4 = "";
					params4.push(data.qty);
					params4.push(getDate());
					params4.push(data.branchID);
					params4.push(data.barcode);
					sqlpath4 = "./node/strsql/updateProductBalance.sql";
					fs.readFile(sqlpath4, 'utf8',  function (err,txtsql) {
					  strsql4 = txtsql + " where branchID= ? and Product= ? ";	
					  con.query(strsql4,  params4, function (err, result4) {
						if (err) { console.log(err); }
						//	console.log(strsql4); 
						//	console.log(params4);
						//	console.log(result4);
							if (result4.affectedRows==0)
							{
									sqlpath4 = "./node/strsql/insertProductBalance.sql";
									fs.readFile(sqlpath4, 'utf8',  function (err,txtsql) {
									  strsql4 = txtsql ;	
									  con.query(strsql4,  params4, function (err, result4) {
										if (err) { console.log(err); }
										//	console.log(strsql4); 
										//	console.log(params4);
										//	console.log(result4);
									  });
									});	
							}
					  });
					});				
					res.send("update ok");
				 } else {//if not exist insert new record catID, model, name, unitID
					var productID= "";
					params2 = [];
					strsql2 = "";
					// ** need to check again if product name , model exist in database

					params2.push(data.model);
					params2.push(data.name);
					params2.push(data.unitID);
					params2.push(data.typeID);
					params2.push((data.imgName!="")?"/img/Products/" +data.imgName:"");
					params2.push(getDate());
					sqlpath2 = "./node/strsql/insertProduct.sql";
					fs.readFile(sqlpath2, 'utf8',  function (err,txtsql) {
					  strsql2 = txtsql;	
					  con.query(strsql2,  params2, function (err, result2) {
						if (err) { console.log(err); }
						  con.query("select ID from sto_product where model=? and name=?", params2 , function (err, resultPd, fields) {
							if (err) { console.log(err); }
							// get product ID 
							var productID = resultPd[0].ID;
							//console.log("select ID from sto_product where model=? and name=?");
							//console.log(params2);
							//console.log(resultPd[0]);
				//then get productID and insert price1 to product attr 
					params3 = [];
					strsql3 = "";
					params3.push(data.barcode);
					params3.push(data.option1ID);
					params3.push(data.option2ID);
					params3.push(productID);
					params3.push(data.price);
					params3.push(getDate());
					sqlpath3 = "./node/strsql/insertProductPrice.sql";
					fs.readFile(sqlpath3, 'utf8',  function (err,txtsql) {
					  strsql3 = txtsql.replace("{Price}","Price"+data.optionPrice) + " ";	
					  con.query(strsql3,  params3, function (err, result3) {
						if (err) { console.log(err); }
					  });
					});
				//then get productID and insert qty to stock balance table using default branchID
					params4 = [];
					strsql4 = "";
					params4.push(data.qty);
					params4.push(getDate());
					params4.push(data.branchID);
					params4.push(data.barcode);
					sqlpath4 = "./node/strsql/insertProductBalance.sql";
			// before insert to stock balance need to keep a transaction data
					saveTransaction(params4);
					fs.readFile(sqlpath4, 'utf8',  function (err,txtsql) {
					  strsql4 = txtsql ;	
					  
					  con.query(strsql4,  params4, function (err, result4) {
						if (err) { console.log(err); }
						
					  });
					});	

						  });
					  });
					});								
					res.send("insert ok");
				 }
				
		      });			  
		  });
		
});


app.listen(3030);  

 var history = {}
 var client = {}



// ----- start io socket here -----
const io = require("socket.io")(3031);
module.exports = app; 

io.on('connection', (socket)=>{

	//console.log(socket.id)
	socket.on('openTable', (data)=>{

		socket.username = "table"+data.table ;
		if (client[socket.username]== undefined)
		{
			client[socket.username] = {status:"open"};
			io.emit('addDesk', {table: socket.username});
			//console.log(client[socket.username])
		} else {
			//console.log('table ' + data.table+' connected : opened() ');
		}

		io.emit("openTable" , client[socket.username]) ;
		//console.log('table ' + data.table+' connected : open() ');
	});

	socket.on('addDesk', function(data) {
			//console.log(data);
			io.emit("addDesk" ,data) ;
	});

	socket.on('ServercloseTable', function(data){
		
		
		//save data to database

			/// sal_pos insert 
					//get last doc_no in sto_branch table
								
			var params = [] ;
			var docno 
			var strsql = "";
			var sqlpath = "./node/strsql/getDocNo.sql";
			fs.readFile(sqlpath, 'utf8',  function (err,txtsql) {
			  if (err) {console.log(err);}
			  strsql = txtsql.replace("{ID}", data.branchID);
			  con.query(strsql,  function (err, result, fields) {
					if (err) { console.log(err); }
					docno = result[0].Code+((new Date().getFullYear()+543).toString().substr(-2))+pad(result[0].SaleNo,5);
					var sqlpath2 =  "./node/strsql/insertSalPos.sql";
					var params2 = [] ;
					fs.readFile(sqlpath2, 'utf8',  function (err,txtsql2) {
					    strsql2 = txtsql2;	
					  	params2.push(docno);
					  	params2.push(getDate().split(" ")[0]);
					  	params2.push(1);
					  	params2.push(0);
					  	params2.push(0);
					  	params2.push("Cash");
					  	params2.push(data.totalPrice);
					  	params2.push(data.branchID);
					  	params2.push(data.RecieveMoney);
					  	params2.push(data.ChangeMoney);
					  	params2.push(1);
					  	params2.push(getDate());
						
						//console.log(params2);

						con.query(strsql2, params2, function (err, result2, fields) {
							if (err) { console.log(err); } else {
								   
								/// update saleNo on sto_branch table
									var strsql3 = "";
									var sqlpath3 = "./node/strsql/updateSaleNo.sql";
									fs.readFile(sqlpath3, 'utf8',  function (err,txtsql3) {
									if (err) {console.log(err);}
									strsql3 = txtsql3.replace("{ID}", data.branchID);
									con.query(strsql3, function (err, result, fields) {
									if (err) { console.log(err); }
									});
									});
								/// get last sal_pos id
									var param4 = [];
									var sqlpath4 = "./node/strsql/getLastSalPos.sql";
									fs.readFile(sqlpath4, 'utf8',  function (err,txtsql4) {
									param4.push(docno);
									con.query(txtsql4, param4 , function (err, result4, fields) {
									if (err) { console.log(err); } else {

								   /// loop insert sal_pos_item
								  var otmp  = client[data.table]
								  //console.log(client[data.table]);
								  			  var ownerid = result4[0].ID;
											  //console.log(ownerid)
										
							    // check if daily sale report csv file exist ?

								var Reportdir = dailyReportPath + getDate().split(" ")[0].replace(/\//g, "");
								var reportName1 = "/1.csv";
								var reportName2 = "/2.csv";
								var header1 = "table, docno, total, receiveMoney, changeMoney, time \r\n";
								var header2 = "table, docno, code, desc, qty, unit, price, total , time \r\n";
								if (!fs.existsSync(Reportdir)){
									//if not create csv file (per table)
									
									fs.mkdirSync(Reportdir);
									//trick of save as bom utf8 add \uteff infont of content
									fs.writeFile(Reportdir +reportName1, "\ufeff"+header1, 'utf8' , function(err) {
									if (err) throw err;
									});
									
									fs.writeFile(Reportdir +reportName2, "\ufeff"+header2, 'utf8' , function(err) {
									if (err) throw err;
									});
								}
									var datatxt0 = data.table + ",";
								    datatxt0 += docno + ",";
									datatxt0 += data.totalPrice + ",";
									datatxt0 += data.RecieveMoney + ",";
									datatxt0 += data.ChangeMoney + ",";
									datatxt0 += getDate().split(" ")[1]+ "\r\n";
									//console.log(datatxt0);
									fs.appendFile(Reportdir + reportName1, datatxt0, (error) => { });

								var strsql5 = "insert into sal_pos_items(ownerID, OwnerNo, Product, Price , Qty) value (? , ? , ? , ? , ?)";
								var strsql6 = "insert into sto_transaction(ownerID, OwnerNo, Product, Price , Qty) value (? , ? , ? , ? , ?)";
								var printtxt = "";
								
								var strsql7 = "select Name, Address, Phone from sto_branch where ID={ID}"
								var htmltxt = "";

							
								for (item in client[data.table]){
									//console.log(item);
									//console.log(otmp[item]);
							 
										if (item != "status")
										{
										//console.log(otmp[item]);
							
							       // add sale data to csv report file
									var datatxt = otmp[item].table + ",";
									datatxt += otmp[item].code + ",";
								    datatxt += docno + ",";
									datatxt += otmp[item].food + ",";
									datatxt += otmp[item].qty + ",";
									datatxt += otmp[item].unit + ",";
									datatxt += otmp[item].price + ",";
									datatxt += otmp[item].price*otmp[item].qty + ",";
									datatxt += getDate().split(" ")[1]+ "\r\n";
									fs.appendFile(Reportdir + reportName2, datatxt, (error) => { });
									//console.log(item);
									//console.log(otmp[item]);
									// insert into sal_pos_items database
										var params5 = [];
										params5.push(ownerid);
										params5.push(docno);
										params5.push(otmp[item].code);
										params5.push(otmp[item].price);
										params5.push(otmp[item].qty);
										//console.log(strsql5);
										//console.log(params5);
										con.query(strsql5, params5 , function (err, result5, fields) {
										if (err) { console.log(strsql5); } 
										});
										if(otmp[item].food.match(/[ิีึืุู์่้๊๋]/g)==null){lsub = 0 ;} else {lsub = otmp[item].food.match(/[ิีึืุู์่้๊๋]/g).length*1}	
										var printlines =Math.round((((otmp[item].food.length*1)-(lsub))/9)+0.5);
										var linelength = (otmp[item].food.length*1) /printlines;
										htmltxt += "<tr><td>"+otmp[item].food+"</td><td align=\"right\">"+otmp[item].qty+" "+ otmp[item].unit +"</td><td align=\"right\">"+(otmp[item].qty*1)*(otmp[item].price*1)+" บาท</td></tr>\r\n";
										for (j=0;j<printlines ; j++ )
										{
											var ltxtl = otmp[item].food.substr(linelength*j,linelength).length*1;
											 printtxt += otmp[item].food.substr(linelength*j,linelength);
											if (j==0)
											{
											 printtxt += pad(otmp[item].qty, 5+(9-ltxtl), " ");
											 printtxt += " " + otmp[item].unit;
											 printtxt += pad((otmp[item].qty*otmp[item].price*1), 7, " ")+ " บาท.";
											}
											printtxt += "\n";
										} // loop for set print txt printer
										

										
										} //if status
										
								  }	 // for loop

								con.query(strsql7.replace("{ID}",data.branchID) , function (err, result7) {
									if (err) { console.log(err); } else {
								    printtxt += pad("", 30, "-")+"\n";
									printtxt += pad(" รวม  ", 16, " ");
									printtxt += pad(data.totalPrice, 7, " ")+ " บาท.\n";
								    printtxt += pad("รับเงิน", 17, " ");
									printtxt += pad(data.RecieveMoney, 7, " ")+ " บาท.\n";
								    printtxt += pad("ทอนเงิน", 16, " ");
									printtxt += pad(data.ChangeMoney, 7, " ")+ " บาท.\n";

									printtxt = pad("", 30, "-")+"\n" +printtxt;
									printtxt = "รายการ" + pad("จำนวน", 5+(9-6), " ")+ pad("รวม", 6, " ")+"\n" +printtxt;
									printtxt = pad("", 30, "-")+"\n" +printtxt;
									printtxt = "วันที่" +pad(getDate().split(" ")[0], 23, " ")+ "\n" +printtxt;
									printtxt = "เลขที่" +pad(docno, 22, " ")+ "\n" + printtxt;
									printtxt = pad(result7[0].Phone, 15-(Math.round((result7[0].Phone.length)/2))+result7[0].Phone.length, " ")+ "\n" +printtxt;
									printtxt = pad(result7[0].Name, 15-(Math.round((result7[0].Name.length)/2))+result7[0].Name	.length, " ")+ "\n" +printtxt;
									//printtxt += pad(result7[0].Address, 40-(Math.round((result7[0].Address.length)/2)), " ")+ "\n";

									
									
									var tplpath = "./node/tpl/receipt.html";
									fs.readFile(tplpath, 'utf8',  function (err,content) {
									if(content.length>=0) {
									var body = content;
									body = body.replace("{BranchName}", result7[0].Name);
									body = body.replace("{BranchPhone}", result7[0].Phone);
									body = body.replace("{DocNo}",docno);
									body = body.replace("{SaleDate}",getDate().split(" ")[0]);
									body = body.replace("{receiptDetails}",htmltxt);
									body = body.replace("{DocTotalPrice}",data.totalPrice);
									body = body.replace("{RMoney}",data.RecieveMoney);
									body = body.replace("{CMoney}",data.ChangeMoney);
									body = body.replace(/\n/g,"").replace(/\r/g,"").replace(/"/g,"'")
									//console.log(body);
									fs.writeFile("./node/receipt.html", ""+body+"", 'utf8' , function(err) {
										if (err) throw err;
									});

									// check flag if printable 
									 if (data.printable == true)
									 {
									 if (os.platform()=="win32")
									 {
										exec(process.cwd()+'\\node\\printhtml.exe html=\"'+body.replace(/%/g,"%%")+'\"', function(error, stdout, stderr) {
										//console.log('stdout: ', stdout);
										//console.log('stderr: ', stderr);
										if (error !== null) {
											console.log('exec error: ', error);
										}
									});

										
									 } else if(os.platform()=="linux") {

										exec('paps --left-margin=5 --font=8 ./node/receipt.txt | lpr', function(error, stdout, stderr) {
										//console.log('stdout: ', stdout);
										//console.log('stderr: ', stderr);
										if (error !== null) {
											console.log('exec error: ', error);
										}
									});

									 }
									 } //check print out


									}
									});

									fs.writeFile("./node/receipt.txt", "\ufeff"+printtxt+"", 'utf8' , function(err) {
									if (err) throw err;
									});
									}
								});


									// remove client data	
									console.log(client);
									console.log(data.table);
								  	delete client[data.table];
									console.log(client);
							
									}
									
									});
									});								    


							}
					
						});
					});
				});
			});


			/// sal_pos_items and sto_transaction insert


		// print out to printer


		for (var key in history) {
		if(history[key].table==data.table) {
			delete history[key];
		}
		}

		io.emit("refreshDesk" ,data.table) ;
});

	socket.on('ServercheckDesk', function(data) {
			//console.log(data);
			var res = {}
			res = client;
			res.id= data.id
			 console.log(res)
			io.emit("checkDesk" ,res) ;
	});

	socket.on('ServerorderHistory', function(data) {
			var res = {};
			res = history;
			res.id= data.id;
			io.emit("orderHistory" ,res) ;
	});
	
	socket.on('ServerorderFood', function(data) {
			history[data.table + "-" + data.code ] = data;
			io.emit("orderFood" ,data) ;
			io.emit("addToCounter", data);
			//console.log(data.table);
			client[data.table][data.code]= {};
			client[data.table][data.code]= data;

			//console.log(client)
	});
	
});


function saveImage(img, name){
// string generated by canvas.toDataURL()
// Grab the extension to resolve any image error
var ext = img.split(';')[0].toLowerCase().match(/jpeg|jpg|png|gif/)[0];
// strip off the data: url prefix to get just the base64-encoded bytes
var imgdata = img.replace(/^data:image\/\w+;base64,/, "");
var buf = new Buffer.from(imgdata, 'base64');
fs.writeFile(name, buf, function(err) {
    if(err) { return console.log(err) }
	});
}

function saveTransaction(params4) {


}

function getDate() {
var ts_hms = new Date();
    return ts_hms.getUTCFullYear() + "-" + twoDigits(1 + ts_hms.getUTCMonth()) + "-" + twoDigits(ts_hms.getUTCDate()) + " " + twoDigits(ts_hms.getHours()) + ":" + twoDigits(ts_hms.getUTCMinutes()) + ":" + twoDigits(ts_hms.getUTCSeconds()); 
}

function twoDigits(d) { 
     if(0 <= d && d < 10) return "0" + d.toString(); 
     if(-10 < d && d < 0) return "-0" + (-1*d).toString(); 
     return d.toString(); 
 } 

function pad(n, width, z) {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length +1).join(z) +n;
}

/*
process.on('uncaughtException', (err) => {
  fs.writeSync(1, `Caught exception: ${err}\n`);
});

setTimeout(() => {
  console.log('This will still run.');
}, 500);

// Intentionally cause an exception, but don't catch it.
nonexistentFunc();
console.log('This will not run.');
*/
