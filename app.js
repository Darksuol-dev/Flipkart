//jshint esversion:6


const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://Zain-kagzi:210103@cluster0.j4iacub.mongodb.net/todolistDB');

mongoose.set('strictQuery', false);

const itemsSchema = {
    name: String
  };
  
  
  const Item = mongoose.model("Item", itemsSchema);
  
  const item1 = new Item({
    name: "Welcome to your todoList!"
  });
  const item2 = new Item({
    name: "Hit the + button to add a new item."
  });
  const item3 = new Item({
    name: "<-- Hit this to delete an item."
  });
  
  const defaultItems = [item1,item2,item3];

  const listSchema ={
    name: String,
    items: [itemsSchema]
  };

  const List = mongoose.model("List", listSchema);
  



app.get("/", function(req, res){

    let today = new Date();
    let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    let day = today.toLocaleDateString("en-US", options);


    Item.find({}, function(err, foundItems){

        if (foundItems.length === 0){
            Item.insertMany(defaultItems, function(err){
                if (err){
                  console.log(err);
                }else {
                  console.log("successful")
                }
            });
            res.redirect("/");
        }else{
            res.render("list", {ListTitle: "Today", newListItems: foundItems});
        }
        
    });
    
    


});


app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if (!foundList){
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName)
      }
      else{
        res.render("list",{ListTitle: foundList.name, newListItems: foundList.items})
      }
    }
  })
})

app.post("/", function(request,resend){

    let itemName = request.body.newItem;
    let listName = request.body.list;

    
    const item = new Item({
        name: itemName
    });

    if(listName === "Today"){
      item.save();

      resend.redirect("/");
    }else{
      List.findOne({name: listName}, function(err, foundList){
        foundList.items.push(item);
        foundList.save();
        resend.redirect("/" + listName)
      })
    }

    
    
});

app.post("/delete", function(req,res){
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItem, function(err){
      if (!err){
        console.log("Deleted.");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItem}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName)
      }
    })
  }

  
})

app.get("/work", function(req,res){
    res.render("list", {ListTitle: "Work List", newListItems: workItems});
});


app.listen(5000, function(){
    console.log("Server started on port 3000");
})