var os = require('os');
const util = require('util');
const exec = require('child_process').exec;
var fs = require('fs');
var Client = require('ssh2').Client;
var machine_id= "";
var connSettings = {
     host: '202.44.53.64',
     port: xxxx, // Normal is 22 port
     username: 'xxxx',
     password: 'xxxx'
     // You can use a key file too, read the ssh2 documentation
};
	
var conn = new Client();
conn.on('ready', function() {
    conn.sftp(function(err, sftp) {
        if (err) throw err;
		
		if (os.platform()=="win32")
		{
		 machine_id = require('child_process').execSync('wmic bios get serialnumber |more +1').toString('utf8').trim().replace("/\n/","");
		} else {
		machine_id = require('child_process').execSync('cat /proc/cpuinfo |grep Serial | cut -d " " -f 2 ').toString('utf8');
		}	
		sftp.exists('/home/Pqsoft/public_html/pqsqrorder/'+machine_id, function(fFound) {
				if(!fFound) {
				console.log("here check exist /home/Pqsoft/public_html/pqsqrorder/" +machine_id);

					sftp.mkdir('/home/Pqsoft/public_html/pqsqrorder/'+machine_id, 777, function(err1) {
						console.log("created Folder error");
						if(err1){	
							console.log(err1);	
						} 
					});
				}
		});

		global.lastdate = "";
			sftp.readdir('/home/Pqsoft/public_html/pqsqrorder/'+machine_id+'/',function(err,list)
			{
            //console.log('Inside read')
            if(err)
            {
            console.log(err);    
            //throw err;
            }
			var dd = timeConverter(list[0].attrs.mtime); 
            //console.log('showing directory listing')
            //console.log(list[0].longname);
			//console.log(dd);
				lastdate = fs.readFileSync('./node/data/stampUpdate.txt', 'utf8', function (err,stampDate) {
					  if (err) {console.log(err);}
				});

	 		//console.log(list[0].attrs.mtime*1000, lastdate*1000)
					  if(list[0].attrs.mtime*1000> lastdate*1000) {
						console.log("download and update ");
						var moveFrom = "/home/Pqsoft/public_html/pqsqrorder/update.tar.gz";
						var moveTo = "./node/update.tar.gz";
						sftp.fastGet(moveFrom, moveTo , function(downloadError){
							if(downloadError) { console.log(downloadError) };
						fs.writeFile('./node/data/stampUpdate.txt', list[0].attrs.mtime, 'utf8' , function(err) {
							if (err) throw err;
							
						});
							//tarUpdate();
							execp('tar -xvf ./node/update.tar.gz -C ./node',{
								stdout: process.stdout,
								stderr: process.stderr
							}).then(function() {
									if (os.platform()=="win32")
									 {
									execp('del .\\node\\update.tar.gz'
									,{  
								stdout: process.stdout,
								stderr: process.stderr
							});
									 } else {
									execp('rm -f ./node/update.tar.gz'
									,{  
								stdout: process.stdout,
								stderr: process.stderr
							});
									 
									 
									 }
								console.log("update done, please restart your machine");
								conn.end();
	
	});
							//delUpdate();
							
						});
					  
					  	
					  }	else {
						  	console.log("your software is the last update");
							conn.end();
					  }

	
			
			});
	
	
	});
}).connect(connSettings);
//conn.close();

function execp(cmd, opts) {
    opts || (opts = {});
    return new Promise((resolve, reject) => {
        const child = exec(cmd, opts,
            (err, stdout, stderr) => err ? reject(err) : resolve({
                stdout: stdout,
                stderr: stderr
            }));

        if (opts.stdout) {
          //  child.stdout.pipe(opts.stdout);
        }
        if (opts.stderr) {
            child.stderr.pipe(opts.stderr);
        }
    });
}



function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  return time;
}
