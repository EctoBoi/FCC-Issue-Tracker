/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectID;

const CONNECTION_STRING = process.env.DB;

module.exports = function(app) {
  app
    .route("/api/issues/:project")

    .get(function(req, res) {
      var project = req.params.project;
      MongoClient.connect(
        CONNECTION_STRING,
        { useUnifiedTopology: true, useNewUrlParser: true },
        function(err, db) {
          if (err) throw err;
          var dbo = db.db("mydb");
          var isOpen = req.body.open === "false" ? false : true;
          dbo
            .collection("issues")
            .find(req.query)
            .toArray(function(err, data) {
              if (err) throw err;
              db.close();
              return res.json(data);
            });
        }
      );
    })

    .post(function(req, res) {
      var project = req.params.project;
      MongoClient.connect(
        CONNECTION_STRING,
        { useUnifiedTopology: true, useNewUrlParser: true },
        function(err, db) {
          if (err) throw err;
          var dbo = db.db("mydb");
          dbo.collection("issues").insertOne(
            {
              issue_title: req.body.issue_title,
              issue_text: req.body.issue_text,
              created_by: req.body.created_by,
              assigned_to: req.body.assigned_to,
              status_text: req.body.status_text,
              created_on: new Date(),
              updated_on: new Date(),
              open: true,
              _id: new ObjectId()
            },
            function(err, data) {
              if (err) throw err;
              console.log("1 document inserted");
              db.close();
              return res.json(data.ops);
            }
          );
        }
      );
    })

    .put(function(req, res) {
      var project = req.params.project;

      if (!ObjectId.isValid(req.body._id)) {
        return res.json("could not update " + req.body._id);
      }

      MongoClient.connect(
        CONNECTION_STRING,
        { useUnifiedTopology: true, useNewUrlParser: true },
        function(err, db) {
          if (err) throw err;
          var dbo = db.db("mydb");
          var fieldSent = false;
          var fields = {};
          if (req.body.issue_title) {
            fieldSent = true;
            fields.issue_title = req.body.issue_title;
          }
          if (req.body.issue_text) {
            fieldSent = true;
            fields.issue_text = req.body.issue_text;
          }
          if (req.body.created_by) {
            fieldSent = true;
            fields.created_by = req.body.created_by;
          }
          if (req.body.assigned_to) {
            fieldSent = true;
            fields.assigned_to = req.body.assigned_to;
          }
          if (req.body.status_text) {
            fieldSent = true;
            fields.status_text = req.body.status_text;
          }
          fields.updated_on = new Date();
          fields.open = req.body.open === "false" ? false : true;
          dbo.collection("issues").updateOne(
            { _id: ObjectId(req.body._id) },
            {
              $set: fields
            },
            function(err, data) {
              if (err) throw err;
              db.close();
              if (!fieldSent && fields.open) {
                return res.json("no updated field sent");
              } else {
                return res.json("successfully updated");
              }
            }
          );
        }
      );
    })

    .delete(function(req, res) {
      var project = req.params.project;

      if (!ObjectId.isValid(req.body._id)) {
        return res.json("_id error");
      }

      MongoClient.connect(
        CONNECTION_STRING,
        { useUnifiedTopology: true, useNewUrlParser: true },
        function(err, db) {
          if (err) throw err;
          var dbo = db.db("mydb");

          dbo
            .collection("issues")
            .deleteOne({ _id: ObjectId(req.body._id) }, function(err, data) {
              if (err) throw err;
              db.close();
              console.log("1 document deleted");
              if (data.result.n == 0) {
                return res.json("could not delete " + req.body._id);
              } else {
                return res.json("deleted " + req.body._id);
              }
            });
        }
      );
    });
};
