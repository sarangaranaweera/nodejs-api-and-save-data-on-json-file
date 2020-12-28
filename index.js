const Joi = require('joi'); //server side validations
const { v4: uuidv4 } = require('uuid'); //generate unique id for each item
const express = require('express');
const multer = require("multer"); // file upload module
const path = require("path");
const fs = require('fs'); // file module
const { request } = require('http');

const app = express();
app.use(express.json());

// image storage engine 
const storage = multer.diskStorage({
    destination: './uploads/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
});
const upload = multer({
    storage: storage,
});

//define statics urls
app.use('/images', express.static('uploads/images'));
app.use('/theme/images', express.static('public/images'));
app.use('/css', express.static('public/css'));
app.use('/js', express.static('public/js'));

//home page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

/** calling APIs */

//get all offers
app.get('/api/offers', (req, res) => {
    const offersObject = getOfferData();
    res.send(offersObject);
});

//post a new offer
app.post('/api/offers',upload.single('fimage'), (req, res) => {
    const offersObject = getOfferData();
    
    
    const newOffer = {
        id: uuidv4(), //generate unique id
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        email: req.body.email,
        image_url: `http://localhost:3000/images/${req.file.filename}`
    };
    //add new object to the existing object
    offersObject.push(newOffer);
    saveOfferData(offersObject);
   
    res.send({success: true, msg: 'Offer data added successfully'})
});



//delete an offer
app.delete('/api/offers/:id', (req, res) => {
    const id = req.params.id;
    const offersObject = getOfferData();
    //filter relavant offer to remove it
    const filterOffers = offersObject.filter(offer => offer.id !== id);
    //validation
    if(offersObject.length === filterOffers.length){
        return res.status(409).send({error: true,msg:'The offer with the given ID was not found'});
    }

    saveOfferData(filterOffers);
    res.send({success: true, msg: 'Offer removed successfully'})
});

/* util functions */
const getOfferData = () => {
    const jsonData = fs.readFileSync('./offers.json', 'utf-8');
    return JSON.parse(jsonData);
};

const saveOfferData = (data) => {
    const stringifyData = JSON.stringify(data,null,2)
    fs.writeFileSync('./offers.json', stringifyData)
    return JSON.parse(stringifyData);
};
/*end util function*/
/** End APIs */

/** Admin Pages */
app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/public/admin.html');
});
/** End Admin */
app.listen(3000, () => console.log('Listning port 3000...'));