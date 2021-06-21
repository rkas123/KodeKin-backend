import User from "../models/user.js";

function Friend (name,resources)     //Constructor function to make friend objects easily
{
    this.name = name;
    this.resources = resources;
}

//Function to add a new Resource to an existing friend
export const addResource = async (req,res) => {
    const {resource,index} = req.body;
    try{
        const currUser = await User.findOne({_id: req.userId});
        let arr = currUser.friends;


        //Pushing the new resource into the array
        arr[index].resources.push(
            resource
        );
        await User.updateOne({_id:req.userId},{$set:{friends:arr}});
        res.status(200).json({message: "added successfully"});
    }
    catch(error){
        console.log(error);
        res.status(400).json({message: "User Not Found"});
    }
}


//Function to create and add a new friend 
export const addFriend = async(req,res) => {
    try{
        const currUser = await User.findOne({_id: req.userId});

        //creating new friend using contructor and pushing it into friends array
        const friend = new Friend(req.body.name,[]); 
        let prevData = currUser.friends;
        prevData.push(friend);
        await User.updateOne({_id: req.userId},{$set:{friends: prevData}});
        return res.status(200).json({friends: prevData});
    }
    catch(error)
    {
        console.log(error.message);
        res.status(400).json({message: error.message});
    }
}


//function to get an array of friends of current logged in user
//function which is called on initial render in useEffect
export const getFriends = async(req,res) =>{
    try{
        const currUser = await User.findOne({_id: req.userId});
        if(!currUser.friends)
            return res.status(200).json({data: []});
        return res.status(200).json({data: currUser.friends})
    }
    catch(error)
    {
        console.log(error.message);
        res.status(404).json({message: error.message});
    }
}


//function to delete a friend
//find the friend by index and splice the array
export const deletefriend = async(req,res) => {
    try{
        const {index} = req.body;
        const currUser = await User.findOne({_id: req.userId});
        let friends = currUser.friends;
        friends.splice(index,1);
        await User.updateOne({_id:req.userId},{$set:{friends:friends}});   
        return res.status(200).json({data:friends});
    }
    catch(err)
    {
        console.log(err);
        res.status(200).json({message: err.message})
    }
}


//get a JS object with all the updated data
//resources to be removed have platform === ""
//No new resources can be added here
export const editFriend = async(req,res) => {
    const {data,index} = req.body;
    try{
        const currUser = await User.findOne({_id: req.userId});
        let friends = currUser.friends;
        friends[index].name = data.name;
        const dat = [];
        for(let i = 0 ;i<data.resources.length;i++)
        {
            if(data.resources[i].platform !== "")
            {
                dat.push(data.resources[i])
            }
        }
        friends[index].resources = dat;
        await User.updateOne({_id:req.userId},{$set:{friends:friends}});
        return res.status(200).json({data:friends});
    }
    catch(error)
    {
        console.log(error);
        return res.status(400).json({message: error.message});
    }
}