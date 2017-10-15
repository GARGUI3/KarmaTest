var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var morgan = require('morgan');
var mongoose = require('mongoose');

var port = process.env.PORT || 3000;

var Tweet = require('./app/models/tweets');
var Search = require('./app/models/searchs');

mongoose.connect('mongodb://localhost:27017/karmatest');

var mongo = require('mongodb');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-request, Authorization');
  next();
});

app.use(morgan('dev'));

var apiRouter = express.Router();

apiRouter.route('/totals')
  .post(function(req, res) {

    var id = req.body.searchId;
    var initialDate = new Date(req.body.initialDate);
    var finalDate = new Date(req.body.finalDate);

    var o_id = new mongo.ObjectID(id);

    if (initialDate <= finalDate) {
      Search.find({
        '_id': o_id
      }, function(err, searchs) {
        if (err) return res.send(err);
        if (searchs.length > 0) {
          Tweet.find({postedTime: {'$gte': initialDate, '$lt': finalDate}}, function(err, count){
            Tweet.aggregate([{$match: {postedTime: {'$gte': initialDate, '$lt': finalDate}}}, {$group: {_id: "$usuario"}}], function(err, result) {
              Tweet.aggregate([{$match: {postedTime: {'$gte': initialDate, '$lt': finalDate}}}, {$unwind: "$hashtags"}, {$project: {data: "$hashtags"}}, {$group: {_id: "$data"}}], function(err, data) {
                res.json({totals: count.length, uniqueUsers: result.length, uniqueHashtags: data.length})
              });
            });
          });
        } else res.json({
          message: "No se encontro la busqueda."
        })
      });
    } else {
      res.json({
        message: "La fecha final no puede ser menor que la fecha inicial."
      });
    }
  });

  apiRouter.route('/tops')
    .post(function(req, res) {

      var id = req.body.searchId;
      var initialDate = new Date(req.body.initialDate);
      var finalDate = new Date(req.body.finalDate);

      var o_id = new mongo.ObjectID(id);

      if (initialDate <= finalDate) {
        Search.find({
          '_id': o_id
        }, function(err, searchs) {
          if (err) return res.send(err);
          if (searchs.length > 0) {
            Tweet.aggregate([{$match: {postedTime: {'$gte': initialDate, '$lt': finalDate}}}, {$unwind: "$hashtags"}, {$project: {data: "$hashtags"}}, {$group: {_id: {hashtag: "$data"}, count: {$sum: 1}}}, {$sort: {count: -1}}, {$limit: 10}], function(err, result) {
              res.json(result);
            });
          } else res.json({
            message: "No se encontro la busqueda."
          })
        });
      } else {
        res.json({
          message: "La fecha final no puede ser menor que la fecha inicial."
        });
      }
    });

    apiRouter.route('/percents')
      .post(function(req, res) {

        var id = req.body.searchId;
        var initialDate = new Date(req.body.initialDate);
        var finalDate = new Date(req.body.finalDate);

        var o_id = new mongo.ObjectID(id);

        if (initialDate <= finalDate) {
          Search.find({
            '_id': o_id
          }, function(err, searchs) {
            if (err) return res.send(err);
            if (searchs.length > 0) {
              Tweet.find({postedTime: {'$gte': initialDate, '$lt': finalDate}}, function(err, count){
                Tweet.aggregate([{$match: {verb: "post", postedTime: {'$gte': initialDate, '$lt': finalDate}}}], function(err, result) {
                  Tweet.aggregate([{$match: {verb: "share", postedTime: {'$gte': initialDate, '$lt': finalDate}}}], function(err, data) {
                    res.json({percentsTweets: (result.length/count.length)*100, percentsRetweets: (data.length/count.length)*100})
                  });
                });
              });
            } else res.json({
              message: "No se encontro la busqueda."
            })
          });
        } else {
          res.json({
            message: "La fecha final no puede ser menor que la fecha inicial."
          });
        }
      });

app.use('/api', apiRouter);

app.listen(port);
console.log('Todo funcionando perfectamente');
