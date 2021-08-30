const { cloudinary } = require('../cloudinary');
const Campground = require('../model/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});

module.exports.index = async (req, res) => {
	const campgrounds = await Campground.find({});
	res.render('campgrounds/index', { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
	res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res, next) => {
	//post action
	const geoData = await geocoder.forwardGeocode({
		query: req.body.campground.location,
		limit: 1
	}).send();
	const campground = new Campground(req.body.campground);
	campground.geometry = geoData.body.features[0].geometry;
	campground.image = 	req.files.map(f => ({url : f.path, filename: f.filename}));
	campground.author = req.user._id;
	await campground.save();
	console.log(campground);
	req.flash('success', 'Successfully make a new campground!');
	res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
	const campground = await Campground.findById(req.params.id)
		.populate({
			path: 'reviews',
			populate: {
				path: 'author'
			}
		})
		.populate('author');
	if (!campground) {
		req.flash('error', 'Cannot find that campground!');
		return res.redirect('/campgrounds');
	}
	res.render('campgrounds/show', { campground });
};

module.exports.renderEditForm = async (req, res) => {
	const { id } = req.params;
	const campground = await Campground.findById(id);
	if (!campground) {
		req.flash('error', 'Cannot find that campground!');
		return res.redirect('/campgrounds');
	}
	res.render('campgrounds/edit', { campground });
};

module.exports.updateCampground = async (req, res) => {
	const { id } = req.params;
	console.log(req.body);
	const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
	const imgs = req.files.map(f => ({url : f.path, filename: f.filename}));
	campground.image.push(...imgs);
	await campground.save();
	if(req.body.deleteImages){
		for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
		await campground.updateOne({ $pull: { image: { filename: { $in: req.body.deleteImages } } } })
	}
	req.flash('success', 'Successfully update a campground!!');
	res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
	const { id } = req.params;
	const campground = await Campground.findByIdAndDelete(id);
	for(let img of campground.image){
		await cloudinary.uploader.destroy(img.filename);
	}
	req.flash('success', 'Successfully delete a campground!');
	res.redirect('/campgrounds');
};
