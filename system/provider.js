const { createClient } = require("@supabase/supabase-js");
const { MongoClient } = require("mongodb");
const fs = require("node:fs");
const path = require("node:path");

class LocalDB {
	constructor(filename = `${process.env.DATABASE_NAME}.json`) {
		this.filename = path.resolve(filename);
		if (!fs.existsSync(this.filename)) {
			fs.writeFileSync(this.filename, JSON.stringify({}, null, 2));
		}
	}

	validateJSON = (data) => {
		try {
			JSON.stringify(data);
			return true;
		} catch {
			return false;
		}
	};

	write = (dataToSave) => {
		if (!this.validateJSON(dataToSave)) {
			console.log("No valid data to save");
			return;
		}
		try {
			fs.writeFileSync(
				this.filename,
				JSON.stringify(dataToSave, null, 2)
			);
		} catch (error) {
			console.error("Failed to save local JSON: " + error.message);
		}
	};

	read = () => {
		try {
			const data = fs.readFileSync(this.filename);
			return JSON.parse(data);
		} catch (error) {
			console.error("Failed to read local JSON: " + error.message);
			return {};
		}
	};
}

class MongoDB {
	constructor(url, dbName) {
		this.url = url;
		this.dbName = dbName;
		this.client = new MongoClient(this.url, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		this.collectionName = process.env.DATABASE_NAME;
	}

	async write(dataToSave) {
		try {
			await this.client.connect();
			const db = this.client.db(this.dbName);
			const collection = db.collection(this.collectionName);

			await collection.updateOne(
				{ _id: process.env.DATABASE_NAME },
				{ $set: { data: dataToSave } },
				{ upsert: true }
			);
		} catch (error) {
			console.error("Failed to save to MongoDB: " + error.message);
		} finally {
			await this.client.close();
		}
	}

	async read() {
		try {
			await this.client.connect();
			const db = this.client.db(this.dbName);
			const collection = db.collection(this.collectionName);

			const result = await collection.findOne({
				_id: process.env.DATABASE_NAME,
			});
			return result ? result.data : {};
		} catch (error) {
			console.error("Failed to fetch MongoDB: " + error.message);
			return {};
		} finally {
			await this.client.close();
		}
	}
}

class SupabaseDB {
	constructor(url, key, tableName = process.env.DATABASE_NAME) {
		this.client = createClient(url, key);
		this.tableName = tableName;
	}

	validateJSON = (data) => {
		try {
			JSON.stringify(data);
			return true;
		} catch {
			return false;
		}
	};

	async write(dataToSave) {
		if (!this.validateJSON(dataToSave)) {
			console.log("No valid data to save");
			return;
		}

		try {
			const { data: existing, error: readError } = await this.client
				.from(this.tableName)
				.select("*")
				.eq("id", 1)
				.single();

			if (readError && readError.code !== "PGRST116") {
				console.error("Failed to read Supabase: " + readError.message);
				return;
			}

			if (existing) {
				await this.client
					.from(this.tableName)
					.update({ data: dataToSave })
					.eq("id", 1);
			} else {
				await this.client
					.from(this.tableName)
					.insert({ id: 1, data: dataToSave });
			}
		} catch (error) {
			console.error("Failed to save to Supabase: " + error.message);
		}
	}

	async read() {
		try {
			const { data, error } = await this.client
				.from(this.tableName)
				.select("data")
				.eq("id", 1)
				.single();

			if (error && error.code !== "PGRST116") {
				console.error("Failed to fetch Supabase: " + error.message);
				return {};
			}

			return data ? data.data : {};
		} catch (error) {
			console.error("Failed to fetch Supabase: " + error.message);
			return {};
		}
	}
}

module.exports = { LocalDB, MongoDB, SupabaseDB };
