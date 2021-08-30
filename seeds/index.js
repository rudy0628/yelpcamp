const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../model/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true
});

//db connection error handling
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('Database connected');
});

//let place and descriptors to random
const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
	//delete all data
	await Campground.deleteMany({});
	//make new data
	for (let i = 0; i < 200; i++) {
		const random1000 = Math.floor(Math.random() * 1000);
		const price = Math.floor(Math.random() * 20) + 10;
		const camp = new Campground({
			author: '61288530ad33a828449726ff',
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			title: `${sample(descriptors)} ${sample(places)}`,
			description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat tempore rem nam perspiciatis, suscipit nemo in corporis deserunt numquam pariatur unde optio libero ducimus illo alias quam ullam omnis cumque.',
			price: price,
			geometry : { 
				type : "Point",
				coordinates : [ 
					cities[random1000].longitude, 
					cities[random1000].latitude 
				]
			},
			image: [
				{
				  url: 'https://res.cloudinary.com/dz50afcaa/image/upload/v1630131258/YelpCamp/d8elbm9xogdhghrgyc4g.jpg',
				  filename: 'YelpCamp/d8elbm9xogdhghrgyc4g'
				},
				{
				  url: 'https://res.cloudinary.com/dz50afcaa/image/upload/v1630131962/YelpCamp/r4570vzuzrj8wgcuzk4l.jpg',
				  filename: 'YelpCamp/r4570vzuzrj8wgcuzk4l'
				}
			]
		});
		await camp.save();
	}
};

//execute seedDB and close connection
seedDB().then(() => {
	mongoose.connection.close();
});
