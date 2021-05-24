//Create express app
const express = require('express');
const app = express();

//Retrieve environment variables
require("dotenv").config();

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Setup Server
const port = process.env.port || 4000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}.`)
});

//Setup Mongoose
const mongoose = require('mongoose');
const connectionString = process.env.MONGO_URL;
mongoose.connect(
    connectionString,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },
    (err) => {
        if (err) {
            console.log("Something went wrong:", err);
        } else {
            console.log("Connection to MongoDB Atlas was successful.")
        }
    }
);

//Create Database Schema
const contactSchema = new mongoose.Schema(
    {
        name: String,
        email: String,
        country: String
    }
);
const Contact = mongoose.model('Contact', contactSchema);

//Setup API Routes:

//POST Request to '/contacts' to create a new Contact
app.post('/contacts', function (req, res) {
    //Retrieve the Contact details from req body
    Contact.create(
        {
            name: req.body.name,
            email: req.body.email,
            country: req.body.country
        },
        (err, newContact) => {
            if (err) {
                return res.status(500).json({ message: err });
            } else {
                return res.status(200).json({ message: "New Contact created successfully.", data: newContact });
            }
        }
    )
});

//GET Request to '/contacts to fetch all Contacts
app.get("/contacts", (err, res) => {
    Contact.find({}, (err, contacts) => {
        if (err) {
            return res.status(500).json({ message: err });
        } else {
            return res.status(200).json({ message: "Requested Contacts retrieved successfully.", contacts });
        }
    });
});

//GET Request to '/contacts/id' to fetch a single Contact by ID
app.get('/contacts/:id', (req, res) => {
    Contact.findById(req.params.id, (err, contact) => {
        if (err) {
            return res.status(500).json({ message: err });
        } else if (!contact) {
            return res.status(404).json({ message: "Requested Contact not found." });
        } else {
            return res.status(200).json({ message: "Requested Contact retrieved successfully.", contact });
        }
    });
});

//PUT Request to '/contact/id' to update a Contact by ID
app.put('/contacts/:id', (req, res) => {
    Contact.findByIdAndUpdate(req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            country: req.body.country
        },
        { new: true },
        (err, contact) => {
            if (err) {
                return res.status(500).json({message: err})
            } else if (!contact) {
                return res.status(404).json({message: "Requested Contact not found."})
            } else {
                contact.save((err, savedContact) => {
                    if (err) {
                        return res.status(400).json({message: err});
                    } else {
                        return res.status(200).json({message: "Requested Contact updated successfully.", savedContact});
                    }
                });
            }
        });
});

//DELETE Request to '/contacts/id' to delete Contact by ID
app.delete('/contacts/:id', (req, res) => {
    Contact.findByIdAndDelete(req.params.id, (err, contact) => {
        if (err) {
            return res.status(500).json({message: err});
        } else if (!contact) {
            return res.status(404).json({message: "Requested Contact not found."});
        } else {
            return res.status(200).json({message: "Requested Contact deleted successfully."});
        }
    });
});