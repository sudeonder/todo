
//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

const itemArr = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-sude:282419Sg@todoapp.rzgdc3u.mongodb.net/todolistDB?retryWrites=true&w=majority");

//create a new schema
const itemsSchema = {
  name: String
}

const listsSchema = {
  name : String,
  items : [itemsSchema]
}

//create a mongoose model using the Schema
//use the singular version as the model name
const Item = mongoose.model("item", itemsSchema);
const List = mongoose.model("list", listsSchema);


app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems){
    res.render("list", {listTitle: "Today", newListItems: foundItems});
    console.log(foundItems);
  });

});

//create new task
app.post("/", function(req, res){
  const listName = req.body.list;
  //create new Item
  const newItem = new Item({
    name: req.body.newItem
  });
  //save it to Database

  if(listName === "Today"){
    //default case
    newItem.save();
    res.redirect("/");

  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(newItem);
      foundList.save();

    })
    res.redirect("/"+listName);

  }
});

app.post("/delete", function(req, res){
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemID, function(err){
      if(!err){
        console.log("deleted!")
      }
    })
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name : listName }, {$pull: {items: {_id:checkedItemID}}}, function(err, results){
      if(!err){
        res.redirect("/" + listName);
      }
    })
  }

})


app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        //create new list
        const list = new List({
          name: customListName,
          items: []
        });
      list.save();
      res.redirect("/" + customListName);
      }else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  })
});

app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == ""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port " + port);
});
