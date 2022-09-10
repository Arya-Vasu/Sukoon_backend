import express from 'express';
import {MongoClient} from "mongodb";

const app = express();
const PORT = process.env.PORT;

const MONGO_URL = "mongodb+srv://vasuarya:aeiou12345@cluster0.orutj.mongodb.net/?retryWrites=true&w=majority";

async function createConnection() {
	const client = new MongoClient(MONGO_URL);
	await client.connect();
	console.log("Mongo is connected!");
	return client;
}

const client = await createConnection();

app.use(express.json());

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

app.listen(PORT);