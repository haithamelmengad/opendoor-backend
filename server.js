import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import csv from 'csv-parser';
import _ from 'underscore';
import googlemaps from '@google/maps';
import handlebars from 'express-handlebars';

const googlemapsClient = googlemaps.createClient({
    key: 'AIzaSyCroRdUBvef1285W3mySGEq3pFCo_DbNsk'
})

const app = express();

app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');


// fs.createReadStream('./data/listing-details.csv')
//     .pipe(csv())
//     .on('data', (data) => { 
//         console.log(data)
//     })

let geoJSONData = {
    "type" : "FeatureCollection",
    "features": [] };

app.get('/listings', (req, res) => {

    fs.createReadStream('./data/listing-details.csv')
    .pipe(csv())
    .on('data', (data) => { 
    const listing = {
                        "type": "Feature",
                        "geometry": {"type": "Point", "coordinates": [data.lng,data.lat]},
                        "properties": {
                                        "id": data.id, 
                                        "price": data.price, 
                                        "street": data.street,
                                        "bedrooms": data.bedrooms,
                                        "bathrooms": data.bathrooms, 
                                        "sq_ft": data.sq_ft
                                    }
                    }
       geoJSONData.features.push(listing);
                    
    })
    .on('end', () => { 
        let listingResult = [];
        if((req.query.min_bed || req.query.max_bed || req.query.max_price || req.query.min_price || req.query.min_bath || req.query.max_bath)) {
            if(req.query.min_bed){
                listingResult = geoJSONData.features.slice(0,200).filter((listing) => listing.properties.bedrooms >= req.query.min_bed)
            }
            
            if(req.query.max_bed){
                listingResult = geoJSONData.features.slice(0,200).filter((listing) => listing.properties.bedrooms <= req.query.max_bed)
            }


            if(req.query.min_price){
                listingResult = geoJSONData.features.slice(0,200).filter((listing) => listing.properties.price >= req.query.min_price)
            }


            if(req.query.max_price){
                listingResult = geoJSONData.features.slice(0,200).filter((listing) => listing.properties.price <= req.query.max_price)
            }


            if(req.query.max_bath){
                listingResult = geoJSONData.features.slice(0,200).filter((listing) => listing.properties.bathrooms <= req.query.max_bath)
            }


            if(req.query.min_bath){
                listingResult = geoJSONData.features.slice(0,200).filter((listing) => listing.properties.bathrooms >= req.query.min_bath)
            }
            geoJSONData.features = listingResult;
        }
        console.log(JSON.stringify(geoJSONData.features));
        console.log('min_bath', req.query.min_bath);
        console.log('max_bath', req.query.max_bath)
        console.log('min_bed', req.query.min_bed)
        console.log('max_bed', req.query.max_bed)
        console.log('min_price', req.query.min_price)
        console.log('max_price', req.query.max_price)


        res.render('index', {features: JSON.stringify(geoJSONData.features)});
    })
})

app.post('')



const port = process.env.PORT || 2345;
app.listen(port);
console.log('Server running at http://localhost:%d/', port);

module.exports = app;