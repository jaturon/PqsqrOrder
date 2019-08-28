/**
* JSDateTime
* 
* @author Somchok Baowtong <natfreelance@yahoo.com>
* @version 0.1
* 27/11/2547
*/

function JSDateTime() {

		this.fullMonthThs = Array('', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม');

		// function member
		/**
		* return month name
		*/
		this.getFullMonthTh = function(index) {
			return this.fullMonthThs[index];
		}


		this.getCurrentDate = function(fm) {
			var d = new Date();
			var dd = d.getDate();
			var dm = d.getMonth()+1;
			var dy = d.getFullYear();
			var dh = d.getHours();
			var dn = d.getMinutes();
			var ds = d.getSeconds();
			var date = '';

			fm = (fm == undefined)?'TH-S':fm.toUpperCase();

			switch (fm) {
				case 'TH-S': 
					date = d.getDate()+'/'+(d.getMonth()+1)+'/'+(d.getFullYear()+543);
				break;
				case 'SQL-D': 
					dd = (dd < 10)?'0'+dd:dd;
					dm = (dm < 10)?'0'+dm:dm;

					date = dy+'-'+dm+'-'+dd;
				break;
				case 'SQL-DT': 
					dd = (dd < 10)?'0'+dd:dd;
					dm = (dm < 10)?'0'+dm:dm;
					dh = (dh < 10)?'0'+dh:dh;
					dn = (dn < 10)?'0'+dn:dn;
					ds = (ds < 10)?'0'+ds:ds;

					date = dy+'-'+dm+'-'+dd+' '+dh+':'+dn+':'+ds;
				break;
			}
			return date;
		}

		/**
		* @return Full date
		*/
		this.getFullDateTh = function(date) {
			var retval;
			var smark = date.indexOf('/');
			var sdate;
			
			if (smark == 2) {
				sdate = date.split('/');

				if (sdate[0] == '08') {
					sdate[0] = '8';
				}else if (sdate[0] == '09') {
					sdate[0] = '9';
				}

				if (sdate[1] == '08') {
					sdate[1] = '8';
				}else if (sdate[1] == '09') {
					sdate[1] = '9';
				}

				retval = parseInt(sdate[0])+' '+this.getFullMonthTh(parseInt(sdate[1]))+' '+sdate[2];
			}else{
				retval = "Format Error!";
			}

			return retval;
		}

		this.setFormatDate = function(obj) {
			var ov=obj.value;
			var reval = false;
			ov = ov.replace(/\//g,'');

			if(ov.length==8){
				ov = ov.substring(0,2)+"/"+ov.substring(2,4)+"/"+ov.substring(4,8);
				obj.value=ov;
				reval = true;
			}

			return reval;
		}

		this.setFormatTime = function(obj) {
			var ov=obj.value;

			if(ov.length==4 || ov.length==5){
				ov = ov.replace(/:/g,'');
				ov = ov.substring(0,2)+":"+ov.substring(2,4);
				obj.value=ov;
			}
		}

		this.isDate = function(indate){
			//var indate=obj.value;
			var sdate = indate.split("/");
			var syear = Math.abs(sdate[2]);
			if(syear-543 < 1900)	return false;
			var indateEN = (Math.abs(sdate[1]))+"/"+(Math.abs(sdate[0]))+"/"+(syear-543);
			var chkDate = new Date(Date.parse(indateEN));
			var cmpDate = (chkDate.getMonth()+1)+"/"+(chkDate.getDate())+"/"+(chkDate.getFullYear());	
			if(indateEN != cmpDate || cmpDate == "NaN/NaN/NaN")
				return false;
			else
				return true;	
		}

		// param1 = string Thai date (dd/mm/yyyy)
		// param2 = string Thai date (dd/mm/yyyy)
		// param3 = string time field is "date", "month", "year", "full"
		// if param3 = "full" function will return time difference เช่น 1 ปี 3 เดือน 2 วัน

		this.DateDiff = function(gStartDateVal, gFinishDateVal, timeField){
			if(gStartDateVal==null || gFinishDateVal==null || timeField==null){
				return "";
			}//if
			if(gStartDateVal=="" || gFinishDateVal=="" || timeField==""){
				return "";
			}//if

			var nDiff="";
			var DateStart, DateFinish;
			var dateDiff, yearDiff, monthDiff;
			DateStart		= this.getDate(gStartDateVal, "/");
			DateFinish	= this.getDate(gFinishDateVal, "/");

			dateDiff		= parseInt((DateFinish - DateStart)/(1000*60*60*24))
			yearDiff		= DateFinish.getFullYear() - DateStart.getFullYear();
			monthDiff	= (yearDiff * 12) + (DateFinish.getMonth() - DateStart.getMonth());

			switch(timeField.toLowerCase()){
				case "date" :
					nDiff = dateDiff;		break;
				case "month"	:
					nDiff = monthDiff;	break;
				case "year"	 :
					nDiff = yearDiff;		break;
				case "full"	 :
					if(monthDiff > 0){
						dateDiff =  this.DateDiff(this.DateAdd(gStartDateVal, 0, monthDiff, 0), gFinishDateVal, "date");
						if(dateDiff < 0 && monthDiff > 1){
							monthDiff = monthDiff-1;
							dateDiff =  this.DateDiff(this.DateAdd(gStartDateVal, 0, monthDiff, 0), gFinishDateVal, "date");
						}//if
						 if(dateDiff < 0 && monthDiff == 1){					
							dateDiff =  this.DateDiff(gStartDateVal, gFinishDateVal, "date");
							monthDiff = 0;
						 }//if
						if(monthDiff >= 12){
							yearDiff = parseInt(monthDiff/12); 
							monthDiff = monthDiff%12;
							nDiff = yearDiff + " ปี ";
						}//if
					}//if
					//alert(yearDiff+"=="+monthDiff+"=="+dateDiff);
					if(monthDiff > 0)	nDiff += monthDiff +" เดือน ";
					if(dateDiff > 0)	nDiff += dateDiff +" วัน ";
					break;
				case "fulldiffdate" :
					if(monthDiff > 0){
						dateDiff =  this.DateDiff(this.DateAdd(gStartDateVal, 0, monthDiff, 0), gFinishDateVal, "date");
						if(dateDiff < 0 && monthDiff > 1){
							monthDiff = monthDiff-1;
							dateDiff =  this.DateDiff(this.DateAdd(gStartDateVal, 0, monthDiff, 0), gFinishDateVal, "date");
						}//if
						 if(dateDiff < 0 && monthDiff == 1){					
							dateDiff =  this.DateDiff(gStartDateVal, gFinishDateVal, "date");
							monthDiff = 0;
						 }//if
					}//if
					nDiff = dateDiff;
					break;
				case "fulldiffmonth" :
					if(monthDiff > 0){
						dateDiff =  this.DateDiff(this.DateAdd(gStartDateVal, 0, monthDiff, 0), gFinishDateVal, "date");
						if(dateDiff < 0 && monthDiff > 1){
							monthDiff = monthDiff-1;
							dateDiff =  this.DateDiff(this.DateAdd(gStartDateVal, 0, monthDiff, 0), gFinishDateVal, "date");
						}//if
						 if(dateDiff < 0 && monthDiff == 1){					
							dateDiff =  this.DateDiff(gStartDateVal, gFinishDateVal, "date");
							monthDiff = 0;
						 }//if
						if(monthDiff >= 12){
							yearDiff = parseInt(monthDiff/12); 
							monthDiff = monthDiff%12;
							nDiff = yearDiff + " ปี ";
						}//if
					}//if
					nDiff = monthDiff;
					break;
				case "fulldiffyear" :
					nDiff = 0;
					if(monthDiff > 0){
						dateDiff =  this.DateDiff(this.DateAdd(gStartDateVal, 0, monthDiff, 0), gFinishDateVal, "date");
						if(dateDiff < 0 && monthDiff > 1){
							monthDiff = monthDiff-1;
							dateDiff =  this.DateDiff(this.DateAdd(gStartDateVal, 0, monthDiff, 0), gFinishDateVal, "date");
						}//if
						 if(dateDiff < 0 && monthDiff == 1){					
							dateDiff =  this.DateDiff(gStartDateVal, gFinishDateVal, "date");
							monthDiff = 0;
						 }//if
						if(monthDiff >= 12){
							yearDiff = parseInt(monthDiff/12); 
							monthDiff = monthDiff%12;
							nDiff = yearDiff;
						}//if			
					}//if
					break;
			}//swich

			return nDiff;	
		}//fn

		//Start DateAdd Util Section
		//Thai date format (dd/mm/yyyy)
		this.DateAdd = function(strDate, numDays, numMonths, numYears){
			var returnDate = new Date(this.getDate(strDate,"/").getTime());
			var yearsToAdd = parseInt(numYears);
			var month = parseInt(returnDate.getMonth())+ parseInt(numMonths);
			if (month > 11){
				yearsToAdd = Math.floor((month+1)/12);
				month -= 12*yearsToAdd;
				yearsToAdd += parseInt(numYears);
			}//if	
			returnDate.setMonth(parseInt(month));
			returnDate.setFullYear(returnDate.getFullYear()+ yearsToAdd);
			returnDate.setTime(returnDate.getTime()+1000*60*60*24*numDays);
			return (returnDate.getDate())+"/"+(returnDate.getMonth()+1)+"/"+(returnDate.getFullYear()+543);
		}//fn

		this.YearAdd = function(strDate, numYears){
				return this.DateAdd(strDate,0,0,numYears);
		}//fn

		this.MonthAdd = function(strDate, numMonths){
				return this.DateAdd(strDate,0,numMonths,0);
		}//fn

		this.DayAdd = function(strDate, numDays){
				return this.DateAdd(strDate,numDays,0,0);
		}//fn
		//End DateAdd Util Section--

		this.getDate = function(strThaiDate, strDelimiter){
			var sdate = strThaiDate.split(strDelimiter);
			var _Date = new Date(Date.parse((Math.abs(sdate[1]))+"/"+(Math.abs(sdate[0]))+"/"+(Math.abs(sdate[2])-543)));
			return _Date;
		}//fn
	}