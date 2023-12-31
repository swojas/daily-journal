const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();

mongoose.connect("mongodb+srv://swojas:swojas123S@cluster0.6ylqvbd.mongodb.net/blog?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });

const PostsSchema = new mongoose.Schema({
  title: String,
  message: String
});

const Post = mongoose.model("Post", PostsSchema);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", function (req, res) {
  Post.find()
    .then(function (result) {
      if (result.length === 0) {
        Post.create({
          title: "How to use",
          message: "You have the full freedom to read, create, edit and delete posts."
        })
      }
      res.render("home", { title: result.title, message: result.message, array: result });
    })
});


let _postId;
app.route("/edit")
  .get(function (req, res) {
    _postId = req.query.data;
    console.log(_postId + " - postId in GET");
    Post.findById({ _id: _postId })
      .then(function (foundQuery) {
        const title = foundQuery.title;
        const message = foundQuery.message;
        res.render("edit", { titleValue: title, messageValue: message });
      })
      .catch(function (err) {
        console.log(err);
        res.redirect("/");
      });
  })
  .post(function (req, res) {
    console.log(_postId + " - postId in POST");
    Post.updateOne({ _id: _postId }, { $set: { title: req.body.title, message: req.body.message } })
      .then((result) => {
        console.log(result);
        res.redirect("/");
      })
      .catch((err) => {
        console.log(err);
        res.redirect("/");
      });
  });


app.get("/delete", function (req, res) {
  Post.findByIdAndDelete({ _id: req.query.data })
    .then(function (update) {
      console.log("delete get called");
    })
    .catch(function (err) {
      console.log(err);
    })
  res.redirect("/")
})

app.get("/compose", function (req, res) {
  res.render("compose");
});

app.post("/submit", function (req, res) {
  const userPost = new Post({
    title: req.body.title,
    message: req.body.message
  });

  userPost.save();

  res.redirect("/success_post");
});

app.get("/success_post", function (req, res) {
  res.render("success_post");
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.get("/contact", function (req, res) {
  res.render("contact");
});

app.get("/blog-posts/:post", function (req, res) {
  const query = req.query.data;

  Post.findById({ _id: "" + query })
    .then(function (element) {
      const paragraphs = element.message.split('\r\n\r\n');
      res.render("post", { titleParams: element.title, messageParams: paragraphs });
    })
    .catch(function (err) {
      console.log(err);
      res.render("404", { query: query });
    })

});

app.use((req, res) => {
  res.status(404).render("404", {query: ""});
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});

