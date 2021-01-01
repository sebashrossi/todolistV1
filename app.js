const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");
const app = express();
mongoose.set('useFindAndModify', false);
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-<username:password@clustertodo.budsw.mongodb.net/<database>?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("item", itemsSchema);

const item1 = new Item({
  name: "Wake Up!"
});
const item2 = new Item({
  name: "Have a nice cup of coffee."
});
const item3 = new Item({
  name: "Have a great day!"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);




app.get("/", function(req, res) {
let today = new Date();
var options = {
  day: "numeric"
}
let mnth = new Date();
let optionsmnth = {
  month: "long"
}
let yr = new Date();
let optionsyr = {
  year: "numeric"
}
let day = today.toLocaleDateString("en-US", options);
let month = mnth.toLocaleDateString("en-US", optionsmnth);
let year = yr.toLocaleDateString("en-US", optionsyr);

  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err)
        } else {
          console.log("Connected and Items saved.");
        };
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        day: day,
        month: month,
        year: year,
        newListItems: foundItems
      });
    }
  });


});

app.get("/:customListName", function(req, res){
  let today = new Date();
  var options = {
    day: "numeric"
  }
  let mnth = new Date();
  let optionsmnth = {
    month: "long"
  }
  let yr = new Date();
  let optionsyr = {
    year: "numeric"
  }
  let day = today.toLocaleDateString("en-US", options);
  let month = mnth.toLocaleDateString("en-US", optionsmnth);
  let year = yr.toLocaleDateString("en-US", optionsyr);
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName}, function(err, foundList){
    if (!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items, day: day,
        month: month,
        year: year,});
      }
    };
  });



});

app.post("/", function(req, res) {
   const itemName = req.body.newItem;
   const listName = req.body.list;

   const item = new Item({
     name: itemName
   });

if(listName === "Today"){
  item.save();
  res.redirect("/");
} else {
  List.findOne({name: listName}, function(err, foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  })
}
});

app.post("/delete", function(req, res){
  const delId = req.body.delete;
  const listName = req.body.listName;

  if( listName === "Today"){
    Item.findByIdAndRemove(delId, function(err){
      if (!err){
        console.log("Succesfully deleted");
        res.redirect("/");
      }
    })
  } else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: delId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    })
  }


})


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  let currentDate = new Date();
  let dateTime = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
  console.log("Server running at " + dateTime);
});
