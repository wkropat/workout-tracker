const express = require("express");
const mongoose = require("mongoose");
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const db = require("./models/workoutModel");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/budget", {
    useNewUrlParser: true,
    //   useFindAndModify: false
});

// routes
// app.use(require("./routes/api.js"));

// CRU (no D) Routes:

// Create a workout

app.post("/api/workouts", (req, res) => {
    db.Workout.create(req.body)
        .then(workout => {
            res.json(workout);
        }).catch(err => {
            res.json(err);

        });
});

// Read the combined weight of multiple exercises from the past seven workouts

app.get("/api/workouts", (req, res) => {
    db.Workout.aggregate([
        {
            $match: {}
        }, {
            $addFields: {
                totalDuration: { $sum: "$exercises.duration" }
            }
        }])
        .then(workout => {
            res.json(workout);
        })
        .catch(err => {
            res.json(err);
        });

})


// Read the total duration of each workout from the past seven workouts on the stats page.

app.get("/api/workouts/range", (req, res) => {
    db.Workout.aggregate([
        {
            $match: {}
        }, {
            $sort: { day: -1 }
        }, {
            $limit: 7
        }, {
            $addFields: {
                totalWeight: { $sum: "$exercises.weight" },
                totalDuration: { $sum: "$exercises.duration" }
            }
        }])
        .then(workout => {
            res.json(workout);
        })
        .catch(err => {
            res.json(err);
        });
})

// Redirects to the html
app.get("/exercise", (req, res) => {
    res.redirect("/exercise.html");
});

app.get("/stats", (req, res) => {
    res.redirect("/stats.html");
});

// Update with request body
app.put("/api/workouts/:id", (req, res) => {
    db.Workout.updateOne(
        { _id: req.params.id },
        { $push: { exercises: req.body } },
        (error, success) => {
            if (error) {
                res.json(error);
            } else {
                res.json(success);
            }
        }
    );
})

app.listen(PORT, () => {
    console.log(`App running on port http://localhost:${PORT} !`);
});