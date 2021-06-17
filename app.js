//jshint version:6

const express = require('express');
const { renderFile } = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const lodash = require("lodash");
const app = express();

app.set('view engine','ejs');

app.use(bodyParser.urlencoded({extended: true}))

app.use(express.static("public"))

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true , useUnifiedTopology: true});

const port = 3000

const itemSchema = {
    name : String
}

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name : "Welecome to your todolist!"
});

const item2 = new Item({
    name : "Hit the + button to add a new item."
})

const item3 = new Item({
    name : "<--Hit this to delete an item."
})

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemSchema]
}

const List = mongoose.model("List", listSchema);

var  workItems = [];

app.get('/', (req, res) => 
{
    Item.find(function(err,items){
        if(items.length === 0)
        {
        Item.insertMany(defaultItems, function(err){
            if(err)
            {
                console.log(err);
            }
            else{
                console.log("Sucessfully added these items");
            }
        })
        res.redirect("/");}
        else{
            res.render("list", {listTitle: "TODAY", newitems: items})
        }
    })
});

app.post('/', function(req, res){
    const listValue = req.body.list;
    const itemName = req.body.todoitem;
    const item = new Item({
        name : itemName
    })
    if(listValue === "TODAY")
    {
        item.save();
        res.redirect('/')
    }
    else{
        List.findOne({name : listValue}, function(err, list){
            list.items.push(item);
            list.save();
        })
        res.redirect('/'+ listValue);
    }
})

app.post("/delete", function(req,res){
    const listValue = req.body.listTitle;
    const rmvItemId = req.body.deleteItem;
    if(listValue === "TODAY")
    {
        Item.deleteOne({_id : rmvItemId}, function(err){
            if(err){console.log(err);}
        })
        res.redirect("/");
    }
    else{
        List.findOneAndUpdate({name : listValue}, {$pull : {items : {_id : rmvItemId}}},{useFindAndModify : false}, function(err){
            if(err)
            { console.log(err);}
            else{
                res.redirect('/'+ listValue);
            }
        })
    }
})

 app.get("/:topic", function(req, res){
    const listName = lodash.upperCase(req.params.topic);
    List.findOne({name : listName},function(err, foundList){
        if(!err){
            if(foundList)
            {
                res.render("list", {listTitle : listName, newitems : foundList.items})
            }
            else{
                const list = new List({
                    name : listName,
                    items : defaultItems
                })
                list.save();
                res.render("list", {listTitle : listName, newitems : defaultItems})
            }
        }
    })
 })

app.listen(port, () => 
{
    console.log(`Example app listening on port port!`)
});