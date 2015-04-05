var mongoose = require('mongoose');
var QuestionSchema = require('../model/question');

var SurveySchema = new mongoose.Schema({
  name : String,
  createdDate :{type: Date, default: new Date()},
  requiresPassword : Boolean,
  password : String,  
  surveyType: String,
  questions: [QuestionSchema]
});

module.exports = mongoose.model('Survey',SurveySchema);
