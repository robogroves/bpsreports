

var sql = require('mssql');
//var helper = require('sendgrid').mail
//var sg = require('sendgrid')('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');


var config = {
  user: 'sa',
  password: 'buschecnc1',
//  server: '192.168.254.36', // You can use 'localhost\\instance' to connect to named instance
//  server: '10.1.2.19',//   server: 'busche-sql-1', // You can use 'localhost\\instance' to connect to named instance
  server: 'busche-sql-1',

  database: 'M2MDATA01',
//  database: 'm2mdata01',
  port: 1433,
//    debug: true,
  options: {
      encrypt: false // Use this if you're on Windows Azure
     // ,instanceName: 'SQLEXPRESS'
  }
}
var cribDefTO = {
 user: 'sa',
 password: 'buschecnc1',
 server: '10.1.2.17',
 options: {
    database: 'Cribmaster',
    port: 1433 
  }
}
function beforeRender(done) {
    sql.connect(cribDefTO).then(function() {
        var subject=request.data.subject;
        var po = request.data.po;
//       var po = '122572';
        var emailTo=request.data.emailTo;

        var reqSql =new sql.Request();
            reqSql.input('po', sql.VarChar(12), po);
        //    req.output('output_parameter', sql.VarChar(50))
        return reqSql.execute('bpGROpenPOVendorEmailReport').then(function(recordsets) {
            var dateNow = new Date();
            var generatedOn=dateNow.toLocaleString();
            request.data = { poNumbers:recordsets[0],generatedOn:generatedOn,subject:subject,emailTo:emailTo };
            done();
        });
    }).catch(done);
}

function afterRender(req, res, done) {
    //filter out script execution for phantom header
    if (req.options.isChildRequest){
      return done();
    }
//    return done();

    var subject=request.data.subject;
    var emailTo=request.data.emailTo;
    //var subject="test"
    //var emailTo="bgroves3196@yahoo.com"
    var mailer = require("nodemailer");
    var smtpTransport = require('nodemailer-smtp-transport');
    var transport = mailer.createTransport(smtpTransport({
        service: 'gmail',
        auth: {
            user: 'cncbusche@gmail.com', // my mail
            pass: 'chips2017'
//            user: 'brent.groves@gmail.com', // my mail
//            pass: 'JesusLives1!'
        }
    }));
    var htm ='<p><strong>Nancy Swank</strong><br /><strong> Tooling Buyer</strong></p><br/>' +
    "<p><strong>THIS IS AN AUTOMATED EMAIL<br/>PLEASE SEND ALL REPLY'S TO: </strong><br/>" +
  '<a href="mailto:nswank@buschegroup.com">nswank@buschegroup.com</a></p><br />' +
'<p class="address" >BUSCHE INDIANA<br />1563 E. State Road 8<br />P.O. Box 77<br />Albion, IN&nbsp;&nbsp; 46701</p><br/>' +
'<p>Phone:&nbsp;&nbsp;<a href="tel:(260)%20636-7030">(260)&nbsp;636-7030</a> Ex No. 266<br/>' +
'Mobile:&nbsp; <a href="tel:(260)%20564-0449">(260) 564-0449</a><br/>' +
'Fax:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="tel:(260)%20636-7031">(260) 636-7031</a><br/>' +
'Email:&nbsp;&nbsp; <a href="mailto:nswank@buschegroup.com">nswank@buschegroup.com</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red !important">Please note new email address</span>&nbsp;&nbsp;<br/>' +
'Web:&nbsp;&nbsp;&nbsp;&nbsp; <a href="http://www.busche-cnc.com/" >http://www.busche-cnc.com</a></p><br/>' +
'<p ><em style="color:red !important">The information in this email is confidential and may be legally privileged. Access to this email by anyone other than the intended addressee is unauthorized. If you are not the intended recipient of this message, any review, disclosure, copying, distribution, retention or any action taken or omitted to be taken in reliance on it is prohibited and may be unlawful. If you are not the intended recipient, please reply to or forward a copy of this message to the sender and delete the message, any attachments and any copies thereof from your system.</em></p>'
 
//Nancy Swank nswank@buschegroup.com,Administrator@BUSCHE-CNC.COM,bgroves3196@yahoo.com,
    var mail = {
        from: "Busche <cncbusche@gmail.com",
//        from: "Brent <brent.groves@gmail.com",
        to: emailTo,
        subject: subject,
        text: "See the attached report",
        html:htm,
        attachments: [
        {  
            filename: 'Report.pdf',
            content: new Buffer(res.content)
        }],
    }

    transport.sendMail(mail, function(error, response){
        transport.close();
        if(error){
            return done(error);
        }

        return done();
    });
}    
/*
var test =
'<HTML>' +
'<HEAD>' +
'<TITLE>Your Title Here</TITLE>'+
'</HEAD>'+
'<BODY BGCOLOR="111111">'+

'<a href="http://somegreatsite.com">Link Name</a>'+
'is a link to another nifty site'+

'<h1 style="color:blue;">This is a Blue Heading</h1>'+
'<H2>This is a Medium Header</H2>'+
'Send me mail at <a href="mailto:support@yourcompany.com">'+
'support@yourcompany.com</a>.'+
'<P> This is a new paragraph!'+
'<P> <B>This is a new paragraph!</B>'+
'<BR> <B><I>This is a new sentence without a paragraph break, in bold italics.</I></B>'+
'<HR>'+
'</BODY>'+
'</HTML>';
*/
