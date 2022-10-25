import express from 'express';
import {MongoClient} from "mongodb";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

const MONGO_URL = process.env.MONGO_URL;

async function createConnection() {
	const client = new MongoClient(MONGO_URL);
	await client.connect();
	console.log("Mongo is connected!");
	return client;
}

const client = await createConnection();

app.use(cors());
app.use(express.json());

async function genPassword(password) {
	const salt = await bcrypt.genSalt(10)
	const hashedPassword = await bcrypt.hash(password, salt);
	return(hashedPassword);
}

app.post('/post-orphanages', async function (req, res) {
	const AllOrphanages = req.body;
	const result = await client
	    .db("Sukoon")
		.collection("Orphanages")
		.insertMany(AllOrphanages);
	res.send(result);
});

app.get('/', async function (req, res) {
	const Orphanages = await client
		.db("Sukoon")
		.collection("Orphanages")
		.find({ })
		.toArray();
	res.send(Orphanages);
});

app.get('/names', async function (req, res) {
	const names = await client
		.db("Sukoon")
		.collection("Orphanages")
		.find({})
		.toArray();
	res.send(names.filter((warehouse) => warehouse.isWarehouse === "Y").map((warehouse) => warehouse.name));
});

app.post('/register', async function (req, res) {
	const {name, phoneNo, emailId, password} = req.body;
	const presentInDb = await client
		.db("Sukoon")
		.collection("Donors")
		.findOne({$or:[{phoneNo: phoneNo}, {emailId: emailId}]});
	if (presentInDb) {
		res.send({response: "Already registered!"});
	}
	else {
		const hashedPassword = await genPassword(password);
		const newUser = {name: name, phoneNo: phoneNo, emailId: emailId, password: hashedPassword};
		const profile = await client
			.db("Sukoon")
			.collection("Donors")
			.insertOne(newUser);
		res.send(profile);
	}
});

app.post('/login', async function (req, res) {
	const {phoneNo, password} = req.body;
	const validUser = await client
		.db("Sukoon")
		.collection("Donors")
		.findOne({phoneNo: phoneNo});
	// console.log(validUser);
	if(!validUser) {
		res.send({response: "Invalid Credentials"});
	}
	else {
		const actualPassword = validUser.password;
		const isLoggedIn = await bcrypt.compare(password, actualPassword);
		if (isLoggedIn) {
			res.send({response: "Logged In successfully"});
		}
		else {
			res.send({response: "Invalid Credentials"});
		}
	}
});

// app.delete('/remove-id', async function (req, res) {
// 	const result = await client
// 		.db("Sukoon")
// 		.collection("Orphanages")
// 		.deleteMany({}, {id:{$gt:0}});
// 	res.send(result);
// });

app.listen(PORT, () => console.log(`Server is LIVE in ${PORT}`));