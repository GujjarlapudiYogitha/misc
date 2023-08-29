// This is a sample App Script which 
// -> reads the data from Google sheet to fetch trigger delay dynamically
// -> creates the trigger with given delay
// -> sends the data via http request

function triggerAutoCreate() {
  
  // resets the loop counter if it's not 0
  refreshUserProps();

  var ss1 = SpreadsheetApp.openById("1vQ8FVM_ijZQ4hV9uLZsPCxMcDNHZYXgFQRFDUHHoyuo").getSheetByName("Sheet1");
  var range1 = ss1.getRange("A:B");
  var delay1 = range1.getCell(3, 2).getValue();
  var f_count = range1.getCell(9, 2).getValue();
  var r_count = range1.getCell(10, 2).getValue();

  if(delay1 == 0){
    //Trigger MAKE scenario without Delay
    triggerWithoutDelay(f_count,r_count);
  }else{
    // create trigger to run program automatically
    createTrigger(delay1);
  }
  
}

function refreshUserProps() {
  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('loopCounter', 0);
}

function triggerWithoutDelay(f_count,r_count){

  var url1 = "https://hook.eu1.make.celonis.com/v9ssq5tlh5sgheu9aw0mm63j2dfwva34";

  var ss4 = SpreadsheetApp.openById("1vQ8FVM_ijZQ4hV9uLZsPCxMcDNHZYXgFQRFDUHHoyuo").getSheetByName("Sheet2");
  var range4 = ss4.getDataRange();
  var shoots = range4.getValues();
  var len1 = shoots.length;

  for (var j = 0; j < len1; j++){
    //Triggering MAKE in loop without delay
    var formData1 = {
      'shoot_type': shoots[j][0],
      'f_count': f_count,
      'r_count': r_count
    };
    var options1 = {
        "method": "post",
        'contentType': 'application/json',
        "payload": JSON.stringify(formData1)
    };
    var response1 = UrlFetchApp.fetch(url1, options1);
    Utilities.sleep(5000);
  }
}

function createTrigger(delay) {
  // Trigger created with delay provided in Gsheet
  ScriptApp.newTrigger('triggerSendHttpRequest')
      .timeBased()
      .everyMinutes(delay)
      .create();
}

function deleteTrigger() {
  
  // Loop over all triggers and delete
  var allTriggers = ScriptApp.getProjectTriggers();
  
  for (var i = 0; i < allTriggers.length; i++) {
    ScriptApp.deleteTrigger(allTriggers[i]);
  }
}

function triggerSendHttpRequest() {
  
  var ss = SpreadsheetApp.openById("1vQ8FVM_ijZQ4hV9uLZsPCxMcDNHZYXgFQRFDUHHoyuo").getSheetByName("Sheet1");
  var range = ss.getRange("A:B");
  var number_of_shoots = range.getCell(5, 2).getValue();
  var f_count = range.getCell(9, 2).getValue();
  var r_count = range.getCell(10, 2).getValue();
  
  // get the current loop counter
  var userProperties = PropertiesService.getUserProperties();
  var loopCounter = Number(userProperties.getProperty('loopCounter'));
  
  // limit on the number of loops
  var limit = number_of_shoots;
  
  // if loop counter < limit number, run the repeatable action
  if (loopCounter+1 <= limit) {
        
    var ss2 = SpreadsheetApp.openById("1vQ8FVM_ijZQ4hV9uLZsPCxMcDNHZYXgFQRFDUHHoyuo").getSheetByName("Sheet2");
    var range2 = ss2.getRange("A:B");
    var shoot_type = range2.getCell(loopCounter+1, 1).getValue();
    var url2 = "https://hook.eu1.make.celonis.com/v9ssq5tlh5sgheu9aw0mm63j2dfwva34";

    var formData2 = {
    'shoot_type': shoot_type,
    'f_count': f_count,
    'r_count': r_count
    };
    var options2 = {
      "method": "post",
      'contentType': 'application/json',
      "payload": JSON.stringify(formData2)
    };
    var response = UrlFetchApp.fetch(url2, options2);
    
    // increment the loopcounter for the loop
    loopCounter +=1;
    userProperties.setProperty('loopCounter', loopCounter);

  }
  else {
    deleteTrigger();  
  }
}
