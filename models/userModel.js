// const mongoose = require('mongoose');
// const passportLocalMongoose = require('passport-local-mongoose');

// const UserSchema = new mongoose.Schema({
//     artistName: {
//         type: String,
//         required: true,
//         unique: true,
//     },
//     email: {
//         type: String,
//         required: true,
//         unique: true,
//     },
//     hashWord: {
//         type: String,
//         required: true,
//         unique: true,
//     },
//     songCount: {
//         type: Number,
        
//         unique: true,
//     }
// },
//     {timestamps: true}
// );

// UserSchema.plugin(passportLocalMongoose)
// const User = mongoose.model("User", UserSchema)
// User.createIndexes();

// module.exports = User;





//usage 
{/* <h1>
    Home Page
</h1>
<p>
    <ul>
        <li><a href="/login">Login</a></li>
        <li><a href="/register">Register</a></li>
        <%if(currentUser){%>
        <li><a href="/logout">Logout</a></li>
        <%}%>
    </ul>
</p> */}

{/* <h1>
    Login Page
</h1>
<form action="/login" method="POST">
    <label for="username">UserName</label>
    <input type="text" placeholder="username" required id="xyz" name="username">
    <label for="password">Password</label>
    <input type="password" id="password" required name="password">
    <button>Login</button>
</form>
<ul>
    <li><a href="/">Home</a></li>
    <li><a href="/register">SignUp</a></li></ul> */}

//     <h1>
//     User Profile
// </h1>
// <p>
//     After Login the user will reach here.
// </p>
// <ul>
//     <li><a href="/">Home</a></li>
//     <li><a href="/logout">Logout</a></li>
// </ul>