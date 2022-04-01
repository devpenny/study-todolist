const express = require("express");
const { render, redirect } = require("express/lib/response");
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");

mongoose.connect('mongodb://localhost:27017/todolistDB');
const itemSchema = new mongoose.Schema({
    name: String
});
const Item = mongoose.model("Item", itemSchema);

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});
const List = mongoose.model("List", listSchema);

app.set("view engine", "ejs");
app.use(express.urlencoded());
app.use(express.static(__dirname + "/public"));


// Item.deleteMany({}, (err)=>{
//     if (err){
//         console.log("respect me")
//     } else {
//         console.log("success")
//     }
// });


app.get("/", (req, res)=>{
    const todayList = new List({
        name: "Today",
        items: []
    })

    List.findOne({name: "Today"}, async (err, foundList)=>{
        if (err){
            console.log (err);
        } else {
            if (foundList) {
                res.render("list", { listTitle: foundList.name, newItem: foundList.items });
            } else {
                console.log("foundList");
                await todayList.save();
                res.redirect("/");
            }
        }
    })
});

app.get("/:customListName", (req, res)=>{
    const customListName = _.capitalize(req.params.customListName);
    const newList = new List({
        name: customListName,
        items: []
    });

    if (_.lowerCase.customListName==="favicon.ico"){
        return;
    }

    List.find({name: customListName}, async (err, foundList)=>{
        if (err){
            console.log(err);
        } else {
            if (foundList.length===0){
                await newList.save();
                res.redirect("/" + customListName);
            } else {
                res.render("list", { listTitle: customListName, newItem: foundList[0].items });
            }
        }
    })


})

app.post("/", (req, res)=>{
    const itemName = req.body.newActivity;
    const listName = req.body.list;
    const newItem = new Item({
        name: itemName
    })

    if (listName === "Today"){
        List.findOne({name: "Today"}, async (err, foundList)=>{
            foundList.items.push(newItem);
            await foundList.save();
            res.redirect("/");
        })
    } else {
        List.findOne({name: listName}, (err, foundList)=>{
            foundList.items.push(newItem);
            foundList.save();
            res.redirect("/"+listName);
        })
    }
});

app.post("/delete", (req, res)=>{
    console.log(req.body.listName);
    List.findOneAndUpdate({ name: req.body.listName }, {$pull: { items: { _id: req.body.checkbox}}}, (err, foundList)=>{
        if (!err){
            if (foundList.name === "Today"){
                res.redirect("/");
            } else {
                res.redirect("/" + req.body.listName);
            }
        }
    })
})

app.listen(3000, ()=>{
    console.log("Server Up");
    Item.find((err, items) => {
        if (err) {
            console.log(err);
        } else {
            console.log(items);
        }
    })
})