const express=require('express');
const bodyparser=require('body-parser');
const mongoose=require('mongoose');

require('dotenv').config();
const PORT = process.env.PORT || 3000;

const app=express();

// app.use('view-engine', 'ejs');
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyparser.urlencoded({extended:true}));


// let Tasks=["Buy Food","Cook Food","Eat Food"];
// let workList=[];

mongoose.connect(process.env.MONGO,{useNewUrlParser:true});
// mongodb+srv://Pandit:<password>@cluster0.n7or2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority

//Schema 
const itemsSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please check the entry,name is not specified"]
    }
})

//collection
const Item=new mongoose.model("Item",itemsSchema);

//Documnt
const item1=new Item({
    name:"Welcome to your todolist!"
});
const item2=new Item({
    name:"Hit the + button to add a new item."
});
const item3=new Item({
    name:"<-- Hit this to delete an item."
});

const defaultItems=[item1,item2,item3];

// Item.insertMany(defaultItems,function(err){
//     if(err){
//         console.log(err);
//     }else{
//         console.log("Successfully inserted");
//     }
// });

const listSchema=new mongoose.Schema({
    name:String,
    items:[itemsSchema]
});

const List=new mongoose.model("List",listSchema);

let today=new Date();
let year=today.getFullYear();
let options={
    weekday:"long",
    day:"numeric",
    month:"long"
};

let day=today.toLocaleDateString("en-US",options);

app.get('/',function(req,res){
    
  
  /*  var currentDay=today.getDay();
    var Cday="";

    if(currentDay===6 ||currentDay===0){
        Cday="Weekend";
    }else {
        Cday="Weekday";    
    }

    res.render("list",{day:Cday});*/

    
    console.log(year);

    
Item.find({},function(err,founditems){

    if(founditems.length===0){
        Item.insertMany(defaultItems,function(err){
            if(err){
                console.log(err);
            }else{
                console.log("Successfully inserted");   
            } 
         });
         res.redirect('/');
    }else{
        res.render('list',{ListTitle:day,Ctask:founditems,Year:year});
    }

})
    
});

app.post('/',function(req,res){
    
    // console.log(req.body);
    let item=req.body.task;
    let listName=req.body.list;
    // if(req.body.list==="Work List"){
    //     workList.push(item);
    //     res.redirect('/work');
    // }else{
    //     // Tasks.push(item);

      
    //     // console.log(Tasks);
        
    // }

    const newItem=new Item({
        name:item
    });

    if(listName===day){
        newItem.save();
        res.redirect('/');
    }else{
        List.findOne({name:listName},function(err,foundlist){
            foundlist.items.push(newItem);
            foundlist.save();
            res.redirect('/'+listName);
        })
    }
   
})

app.post('/delete',function(req,res){

    const deleteId=req.body.deleteItem;

    Item.findByIdAndRemove(deleteId,function(err){
        if(err){
            console.log(err);
        }else{
            res.redirect('/');
        }
    });
});

// app.get('/work',function(req,res){
//     res.render('list',{ListTitle:"Work List",Ctask:workList,Year:year});
// });

app.get('/:customListName',function(req,res){
    const customListName=req.params.customListName;

    List.findOne({name:customListName},function(err,foundlist){
        if(!err){
            if(!foundlist){
                //new list
                const list=new List({
                    name:customListName,
                    items:defaultItems
                })
            
                list.save();
                res.redirect('/'+customListName);
            }else{
                //exisiting
                res.render('list',{ListTitle:foundlist.name,Ctask:foundlist.items,Year:year});
            }
        }else{
            console.log(err);
        }
    })

})




app.listen(PORT,function(){
    console.log("Server is running on port"+`${PORT}`);
});

