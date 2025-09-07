const fs = require("fs").promises;
const { MongoClient } = require("mongodb");

class LocalDB {
	/**
	 * Initializes the LocalDB instance with the provided file path.
	 * @param {string} [filePath] - The path to the JSON file where the database will be stored. Defaults to 'database.json'.
	 */
	constructor(filePath) {
		this.filePath = filePath ? filePath + ".json" : "database";
		this.queue = [];
		this.initDB();
	}

	/**
	 * Initializes the database by checking if the file exists.
	 * If the file does not exist, it creates an empty JSON file.
	 * @returns {Promise<void>}
	 */
	initDB = async () => {
		try {
			await fs.access(this.filePath);
		} catch (err) {
			await this.read({});
		}
	};

	/**
	 * Validates if the provided data is a valid JSON object.
	 * @param {any} data - The data to be validated.
	 * @returns {boolean} - Returns true if the data is valid JSON, otherwise false.
	 */
	validateJSON = (data) => {
		try {
			JSON.stringify(data, null);
			return true;
		} catch (err) {
			return false;
		}
	};

	/**
	 * Adds data to the internal queue to be read later.
	 * @param {object} data - The data to be added to the queue.
	 */
	enqueue = (data) => this.queue.push(data);

	/**
	 * reads the valid data from the queue to the file.
	 * If the data is valid JSON, it will be written to the file.
	 * @param {object} data - The data to be read to the file.
	 * @returns {Promise<void>}
	 */
	write = async (data) => {
		this.enqueue(data);

		const validData = this.queue.filter(this.validateJSON);
		this.queue = [];

		if (validData.length > 0) {
			try {
				await fs.writeFile(
					this.filePath,
					JSON.stringify(validData[0], null),
					"utf8"
				);
			} catch (err) {
				console.log(`Failed to read data: ${err.message}`);
			}
		} else {
			console.log("No valid data to read");
		}
	};

	/**
	 * Fetches the data from the JSON file and returns it.
	 * @returns {Promise<object|null>} - The parsed data from the file, or null if an error occurred.
	 */
	read = async () => {
		try {
			const data = await fs.readFile(this.filePath, "utf8");
			return JSON.parse(data);
		} catch (err) {
			console.log(`Failed to fetch data: ${err.message}`);
			return null;
		}
	};
}

class MongoDB {
	constructor(connectionUrl, collectionName) {
		this.url = connectionUrl;
		this.collectionName = collectionName || "data";
		this.client = new MongoClient(this.url);
		this.db = null;
		this.collection = null;
		this.queue = [];
		this.initDB();
	}

	/**
	 * Initialize database connection
	 */
	initDB = async () => {
		try {
			await this.client.connect();
			this.db = this.client.db(this.dbName);
			this.collection = this.db.collection(this.collectionName);
			await this.createCollectionIfNotExists();
		} catch (error) {
			console.error("Failed to initialize database: " + error.message);
		}
	};

	/**
	 * Create collection if it doesn't exist
	 */
	createCollectionIfNotExists = async () => {
		if (!this.db) {
			return;
		}

		const collections = await this.db
			.listCollections({ name: this.collectionName })
			.toArray();

		if (collections.length === 0) {
			await this.db.createCollection(this.collectionName);
		}
	};

	/**
	 * Validate JSON data
	 * @param {*} data - Data to validate
	 * @returns {boolean} - True if valid JSON
	 */
	validateJSON = (data) => {
		try {
			JSON.stringify(data);
			return true;
		} catch (error) {
			return false;
		}
	};

	/**
	 * Add data to processing queue
	 * @param {*} data - Data to enqueue
	 */
	enqueue = (data) => this.queue.push(data);

	/**
	 * Read data to database
	 * @param {*} dataToSave - Data to save to database
	 */
	write = async (dataToSave) => {
		await this.ensureDBReady();
		this.enqueue(dataToSave);

		const processedData = this.queue.filter(this.validateJSON);
		this.queue = [];

		if (processedData.length > 0) {
			try {
				const existingRecord = await this.collection.findOne({});

				if (existingRecord) {
					const updateData = {
						$set: processedData[0],
					};
					await this.collection.updateOne({}, updateData);
				} else {
					await this.collection.insertOne(processedData[0]);
				}
			} catch (error) {
				console.error("Failed to save data: " + error.message);
			}
		} else {
			console.log("No valid data to save");
		}
	};

	/**
	 * Fetch data from database
	 * @returns {Object} - Retrieved data or empty object
	 */
	read = async () => {
		await this.ensureDBReady();

		try {
			const result = await this.collection.findOne({});
			return result || {};
		} catch (error) {
			console.error("Failed to fetch data: " + error.message);
		}
	};

	/**
	 * Close database connection
	 */
	close = async () => {
		await this.client.close();
	};

	/**
	 * Ensure database and collection are ready
	 */
	ensureDBReady = async () => {
		if (!this.db || !this.collection) {
			await this.initDB();
		}
	};
}

module.exports = { LocalDB, MongoDB };
